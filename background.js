// Import converter functions
importScripts("converter.js")

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertJsonToType",
    title: "Convert JSON to TypeScript Type",
    contexts: ["selection"],
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
