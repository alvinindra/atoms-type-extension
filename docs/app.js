// DOM elements
const jsonInput = document.getElementById("jsonInput")
const jsonHighlight = document.getElementById("jsonHighlight")
const typeName = document.getElementById("typeName")
const convertBtn = document.getElementById("convertBtn")
const clearBtn = document.getElementById("clearBtn")
const copyBtn = document.getElementById("copyBtn")
const autoGenerateBtn = document.getElementById("autoGenerateBtn")
const beautifyBtn = document.getElementById("beautifyBtn")
const output = document.getElementById("output")
const errorMsg = document.getElementById("errorMsg")
const customFieldsCheckbox = document.getElementById("customFieldsCheckbox")
const pageNameSection = document.getElementById("pageNameSection")
const pageName = document.getElementById("pageName")

// Syntax highlighting for JSON input
jsonInput.addEventListener("input", () => {
  highlightJSON()
  syncScroll()
})

jsonInput.addEventListener("scroll", syncScroll)

function syncScroll() {
  jsonHighlight.scrollTop = jsonInput.scrollTop
  jsonHighlight.scrollLeft = jsonInput.scrollLeft
  jsonHighlight.style.height = jsonInput.scrollHeight + "px"
}

function highlightJSON() {
  const text = jsonInput.value
  if (!text) {
    jsonHighlight.innerHTML = ""
    return
  }

  try {
    const highlighted = highlightJSONSyntax(text)
    jsonHighlight.innerHTML = highlighted
    syncScroll()
  } catch (e) {
    jsonHighlight.textContent = text
    syncScroll()
  }
}

function highlightJSONSyntax(jsonText) {
  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  let result = escapeHtml(jsonText)

  // Highlight strings (keys and values)
  result = result.replace(
    /(&quot;)((?:\\.|[^&])*?)(&quot;)/g,
    (match, q1, content, q2) => {
      return `<span class="json-string">${q1}${content}${q2}</span>`
    }
  )

  // Highlight keys specifically (strings followed by colon)
  result = result.replace(
    /<span class="json-string">(&quot;[^&]*?&quot;)<\/span>\s*:/g,
    '<span class="json-key">$1</span>:'
  )

  // Highlight numbers
  result = result.replace(
    /\b(-?\d+\.?\d*)\b/g,
    '<span class="json-number">$1</span>'
  )

  // Highlight booleans
  result = result.replace(
    /\b(true|false)\b/g,
    '<span class="json-boolean">$1</span>'
  )

  // Highlight null
  result = result.replace(/\bnull\b/g, '<span class="json-null">null</span>')

  return result
}

function highlightTypeScript(tsCode) {
  const escapeHtml = (str) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  let result = escapeHtml(tsCode)

  // Highlight type keyword
  result = result.replace(
    /\b(type|interface|export|extends)\b/g,
    '<span class="ts-keyword">$1</span>'
  )

  // Highlight primitive types
  result = result.replace(
    /\b(string|number|boolean|any|null|undefined|void)\b/g,
    '<span class="ts-primitive">$1</span>'
  )

  // Highlight type names (PascalCase identifiers after type keyword)
  result = result.replace(
    /(<span class="ts-keyword">type<\/span>\s+)(\w+)/g,
    '$1<span class="ts-interface-name">$2</span>'
  )

  // Highlight property names
  result = result.replace(
    /(\s+)(\w+)(\s*):/g,
    '$1<span class="ts-property">$2</span>$3:'
  )

  // Highlight brackets
  result = result.replace(/([{}[\]])/g, '<span class="ts-bracket">$1</span>')

  return result
}

// Convert button click
convertBtn.addEventListener("click", () => {
  convertJSON()
})

// Clear button click
clearBtn.addEventListener("click", () => {
  jsonInput.value = ""
  jsonHighlight.innerHTML = ""
  typeName.value = ""
  output.innerHTML = ""
  errorMsg.textContent = ""
  errorMsg.style.display = "none"
})

// Copy button click
copyBtn.addEventListener("click", () => {
  const text = output.textContent || output.innerText
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
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

// Beautify JSON button
beautifyBtn.addEventListener("click", () => {
  const json = jsonInput.value.trim()
  if (json) {
    try {
      const parsed = JSON.parse(json)
      const beautified = JSON.stringify(parsed, null, 2)
      jsonInput.value = beautified
      highlightJSON()
      syncScroll()
      showError("")
    } catch (error) {
      showError("Invalid JSON: Cannot beautify")
    }
  }
})

// Custom Fields checkbox toggle
customFieldsCheckbox.addEventListener("change", () => {
  if (customFieldsCheckbox.checked) {
    pageNameSection.style.display = "block"
    typeName.parentElement.parentElement.style.display = "none"
  } else {
    pageNameSection.style.display = "none"
    typeName.parentElement.parentElement.style.display = "block"
  }
})

// Enter key in textarea
jsonInput.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    convertJSON()
  }
})

// Global keyboard shortcut for copying TypeScript output (Control+Cmd+C)
document.addEventListener("keydown", (e) => {
  // Check for Control+Cmd+C (Mac) or Control+Alt+C (Windows/Linux)
  const isMac = e.ctrlKey && e.metaKey && (e.key === "c" || e.key === "C")
  const isWinLinux = e.ctrlKey && e.altKey && (e.key === "c" || e.key === "C")

  if (isMac || isWinLinux) {
    e.preventDefault()
    copyTypeScriptOutput()
  }
})

// Function to copy TypeScript output
function copyTypeScriptOutput() {
  const text = output.textContent || output.innerText
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
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
}

// Convert JSON function
function convertJSON() {
  const json = jsonInput.value.trim()

  if (!json) {
    showError("Please enter JSON to convert")
    return
  }

  try {
    let result

    // Check if Custom Fields mode is enabled
    if (customFieldsCheckbox.checked) {
      const pageNameValue = pageName.value.trim() || "Page"
      result = jsonToTypeScriptCustomFields(json, pageNameValue)
    } else {
      const typeNameValue = typeName.value.trim() || "GeneratedType"
      result = jsonToTypeScript(json, typeNameValue)
    }

    output.innerHTML = highlightTypeScript(result)
    showError("")
  } catch (error) {
    showError(error.message)
    output.innerHTML = ""
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

