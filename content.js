// Content script to handle keyboard shortcuts on web pages
console.log("Content script loaded on:", window.location.href)

// Listen for keyboard events
document.addEventListener(
  "keydown",
  (e) => {
    // Check for Control+Cmd+C (Mac) or Control+Shift+C (Windows/Linux)
    const isMac = e.ctrlKey && e.metaKey && (e.key === "c" || e.key === "C")
    const isWinLinux =
      e.ctrlKey && e.shiftKey && (e.key === "c" || e.key === "C")

    if (isMac || isWinLinux) {
      console.log("Keyboard shortcut detected in content script!", {
        isMac,
        isWinLinux,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        key: e.key,
      })

      // Get selected text
      const selectedText = window.getSelection().toString()

      if (!selectedText || selectedText.trim() === "") {
        console.log("No text selected")
        // Show a subtle notification
        showNotification("Please select JSON text first", "warning")
        return
      }

      console.log("Selected text:", selectedText)

      // Prevent default action
      e.preventDefault()
      e.stopPropagation()

      // Send message to background script to process the JSON
      console.log("Sending message to background script...")
      chrome.runtime.sendMessage(
        {
          action: "convertAndCopy",
          selectedText: selectedText,
        },
        (response) => {
          console.log("Received response from background:", response)
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError)
            showNotification(
              "Extension error: " + chrome.runtime.lastError.message,
              "error"
            )
            return
          }

          if (response && response.success) {
            console.log("Conversion successful!")
            showNotification(
              `Converted to type "${response.typeName}" and copied!`,
              "success"
            )
          } else if (response && response.error) {
            console.error("Conversion error:", response.error)
            showNotification(response.error, "error")
          } else {
            console.warn("Unexpected response:", response)
            showNotification("Unexpected response from extension", "error")
          }
        }
      )
    }
  },
  true
) // Use capture phase to intercept before page handlers

// Function to show in-page notification
function showNotification(message, type = "info") {
  // Remove any existing notification
  const existing = document.getElementById("json-ts-converter-notification")
  if (existing) {
    existing.remove()
  }

  // Create notification element
  const notification = document.createElement("div")
  notification.id = "json-ts-converter-notification"
  notification.textContent = message

  // Style based on type
  const bgColor =
    type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `

  // Add animation keyframes
  if (!document.getElementById("json-ts-converter-style")) {
    const style = document.createElement("style")
    style.id = "json-ts-converter-style"
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 300)
  }, 3000)
}
