// DOM elements
const jsonInput = document.getElementById("jsonInput")
const typeName = document.getElementById("typeName")
const convertBtn = document.getElementById("convertBtn")
const clearBtn = document.getElementById("clearBtn")
const copyBtn = document.getElementById("copyBtn")
const autoGenerateBtn = document.getElementById("autoGenerateBtn")
const output = document.getElementById("output")
const errorMsg = document.getElementById("errorMsg")

// Check if JSON was selected via context menu
chrome.storage.local.get(
  ["selectedJson", "timestamp", "convertedType", "typeName", "conversionError"],
  (result) => {
    if (result && result.selectedJson) {
      // Check if timestamp is recent (within last 10 seconds)
      if (Date.now() - result.timestamp < 10000) {
        jsonInput.value = result.selectedJson

        // If there was an error during conversion
        if (result.conversionError) {
          showError(result.conversionError)
          output.textContent = ""
        }
        // If already converted (from context menu), show the result
        else if (result.convertedType && result.typeName) {
          typeName.value = result.typeName
          output.textContent = result.convertedType
          showError("")
        } else {
          // Otherwise auto-generate and convert
          const defaultName = generateDefaultTypeName(result.selectedJson)
          typeName.value = defaultName
          convertJSON()
        }

        // Clear the stored data
        chrome.storage.local.remove([
          "selectedJson",
          "timestamp",
          "convertedType",
          "typeName",
          "conversionError",
        ])
      }
    }
  }
)

// Convert button click
convertBtn.addEventListener("click", () => {
  convertJSON()
})

// Clear button click
clearBtn.addEventListener("click", () => {
  jsonInput.value = ""
  typeName.value = ""
  output.textContent = ""
  errorMsg.textContent = ""
  errorMsg.style.display = "none"
})

// Copy button click
copyBtn.addEventListener("click", () => {
  const text = output.textContent
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback
      const originalText = copyBtn.innerHTML
      copyBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" fill="currentColor"/></svg>Copied!'
      copyBtn.classList.add("copied")

      setTimeout(() => {
        copyBtn.innerHTML = originalText
        copyBtn.classList.remove("copied")
      }, 2000)
    })
  }
})

// Auto-generate type name button
autoGenerateBtn.addEventListener("click", () => {
  const json = jsonInput.value.trim()
  if (json) {
    try {
      const defaultName = generateDefaultTypeName(json)
      typeName.value = defaultName
      showError("")
    } catch (error) {
      showError("Invalid JSON")
    }
  }
})

// Enter key in textarea
jsonInput.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    convertJSON()
  }
})

// Convert JSON function
function convertJSON() {
  const json = jsonInput.value.trim()
  const typeNameValue = typeName.value.trim() || "GeneratedType"

  if (!json) {
    showError("Please enter JSON to convert")
    return
  }

  try {
    const result = jsonToTypeScript(json, typeNameValue)
    output.textContent = result
    showError("")
  } catch (error) {
    showError(error.message)
    output.textContent = ""
  }
}

// Show error message
function showError(message) {
  if (message) {
    errorMsg.textContent = message
    errorMsg.style.display = "block"
  } else {
    errorMsg.textContent = ""
    errorMsg.style.display = "none"
  }
}
