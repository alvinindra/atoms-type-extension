// Import converter functions
importScripts("converter.js")

console.log("Background script loaded!")

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated")
  chrome.contextMenus.create({
    id: "convertJsonToType",
    title: "Convert JSON to TypeScript Type",
    contexts: ["selection"],
  })

  // Log available commands
  chrome.commands.getAll((commands) => {
    console.log("Available commands:", commands)
  })
})

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "convertJsonToType") {
    const selectedText = info.selectionText

    try {
      // Generate type name from the first key
      const typeName = generateDefaultTypeName(selectedText)

      // Convert JSON to TypeScript
      const typeScriptCode = jsonToTypeScript(selectedText, typeName)

      // Store for popup access
      chrome.storage.local.set(
        {
          selectedJson: selectedText,
          timestamp: Date.now(),
          convertedType: typeScriptCode,
          typeName: typeName,
        },
        () => {
          // Open the popup to show the result
          chrome.action.openPopup()
        }
      )
    } catch (error) {
      // Store error for popup to display
      chrome.storage.local.set(
        {
          selectedJson: selectedText,
          timestamp: Date.now(),
          conversionError: error.message,
        },
        () => {
          // Open the popup to show the error
          chrome.action.openPopup()
        }
      )
    }
  }
})

// Handle keyboard command for converting selected JSON and copying TypeScript
chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command received:", command)

  if (command === "copy-typescript") {
    console.log("Processing copy-typescript command")
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      if (!tab) {
        console.log("No active tab found")
        return
      }

      console.log("Active tab:", tab.id, tab.url)

      // Execute script to get selected text
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString(),
      })

      const selectedText = results[0]?.result
      console.log("Selected text:", selectedText)

      if (!selectedText || selectedText.trim() === "") {
        console.log("No text selected - showing notification")
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "No Text Selected",
          message: "Please select JSON text first",
        })
        return
      }

      // Try to convert JSON to TypeScript
      try {
        const typeName = generateDefaultTypeName(selectedText)
        const typeScriptCode = jsonToTypeScript(selectedText, typeName)
        console.log("Converted to TypeScript:", typeScriptCode)

        // Copy to clipboard using offscreen document or content script
        const copyResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (text) => {
            return navigator.clipboard
              .writeText(text)
              .then(() => {
                console.log("Clipboard written successfully")
                return { success: true }
              })
              .catch((err) => {
                console.error("Clipboard write failed:", err)
                return { success: false, error: err.message }
              })
          },
          args: [typeScriptCode],
        })

        console.log("Copy results:", copyResults)

        // Show success notification
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "TypeScript Copied!",
          message: `Converted to type "${typeName}" and copied to clipboard`,
        })
        console.log("Success notification created")
      } catch (error) {
        console.error("Conversion error:", error)
        // Show error notification
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Conversion Failed",
          message: error.message || "Invalid JSON format",
        })
        console.log("Error notification created")
      }
    } catch (error) {
      console.error("Error in command handler:", error)
      console.error("Stack trace:", error.stack)
      // Show error notification
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Extension Error",
        message: "An unexpected error occurred: " + error.message,
      })
    }
  }
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request)

  if (request.action === "convertAndCopy") {
    const selectedText = request.selectedText

    try {
      console.log("Converting JSON to TypeScript...")
      const typeName = generateDefaultTypeName(selectedText)
      const typeScriptCode = jsonToTypeScript(selectedText, typeName)
      console.log("Conversion successful:", { typeName, typeScriptCode })

      // Copy to clipboard via the content script's context
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]) {
          console.log("Copying to clipboard via tab:", tabs[0].id)
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (text) => {
                return navigator.clipboard
                  .writeText(text)
                  .then(() => {
                    console.log("Clipboard copy successful")
                    return true
                  })
                  .catch((err) => {
                    console.error("Clipboard copy failed:", err)
                    throw err
                  })
              },
              args: [typeScriptCode],
            })
            console.log("Clipboard operation completed")
          } catch (err) {
            console.error("Error executing clipboard script:", err)
          }
        }
      })

      sendResponse({
        success: true,
        typeName: typeName,
        typeScriptCode: typeScriptCode,
      })
    } catch (error) {
      console.error("Conversion error in background:", error)
      console.error("Error stack:", error.stack)
      sendResponse({
        success: false,
        error: error.message || "Invalid JSON format",
      })
    }

    return true // Keep the message channel open for async response
  }
})
