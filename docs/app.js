// DOM elements
const jsonInput = document.getElementById("jsonInput")
const jsonHighlight = document.getElementById("jsonHighlight")
const output = document.getElementById("output")
const inputLineNumbers = document.getElementById("inputLineNumbers")
const outputLineNumbers = document.getElementById("outputLineNumbers")
const typeName = document.getElementById("typeName")
const pageName = document.getElementById("pageName")
const pageNameRow = document.getElementById("pageNameRow")
const customFieldsCheckbox = document.getElementById("customFieldsCheckbox")
const settingsBtn = document.getElementById("settingsBtn")
const settingsDropdown = document.getElementById("settingsDropdown")
const beautifyBtn = document.getElementById("beautifyBtn")
const clearBtn = document.getElementById("clearBtn")
const copyBtn = document.getElementById("copyBtn")
const themeToggle = document.getElementById("themeToggle")
const errorMsg = document.getElementById("errorMsg")

let convertTimer = null

// Initialize
initTheme()
updateLineNumbers(jsonInput, inputLineNumbers)
updateLineNumbers(output, outputLineNumbers)
updateJsonHighlight()

// Event Listeners
jsonInput.addEventListener("input", () => {
  updateLineNumbers(jsonInput, inputLineNumbers)
  updateJsonHighlight()
  scheduleConvert()
})

jsonInput.addEventListener("scroll", () => {
  inputLineNumbers.scrollTop = jsonInput.scrollTop
  jsonHighlight.scrollTop = jsonInput.scrollTop
  jsonHighlight.scrollLeft = jsonInput.scrollLeft
})

output.addEventListener("scroll", () => {
  outputLineNumbers.scrollTop = output.scrollTop
})

typeName.addEventListener("input", scheduleConvert)
pageName.addEventListener("input", scheduleConvert)

settingsBtn.addEventListener("click", () => {
  const isVisible = settingsDropdown.style.display !== "none"
  settingsDropdown.style.display = isVisible ? "none" : "block"
})

customFieldsCheckbox.addEventListener("change", () => {
  pageNameRow.style.display = customFieldsCheckbox.checked ? "flex" : "none"
  scheduleConvert()
})

beautifyBtn.addEventListener("click", beautifyJSON)
clearBtn.addEventListener("click", clearAll)
copyBtn.addEventListener("click", copyOutput)
themeToggle.addEventListener("click", toggleTheme)

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to convert
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault()
    convertJSON()
  }
  // Ctrl/Cmd + Shift + C to copy
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
    e.preventDefault()
    copyOutput()
  }
})

// Functions
function updateLineNumbers(element, lineNumbersEl) {
  const text = element.value || element.textContent || ""
  const lines = text.split("\n").length || 1
  const numbers = Array.from(
    { length: lines },
    (_, i) => `<span>${i + 1}</span>`
  ).join("")
  lineNumbersEl.innerHTML = numbers
}

function updateJsonHighlight() {
  const text = jsonInput.value
  if (!text) {
    jsonHighlight.innerHTML = ""
    return
  }
  jsonHighlight.innerHTML = highlightJSON(text)
}

function highlightJSON(code) {
  let result = escapeHtml(code)

  // JSON keys (property names in quotes followed by colon)
  result = result.replace(
    /(&quot;)([^&]+?)(&quot;)(\s*:)/g,
    '<span class="json-key">$1$2$3</span>$4'
  )

  // String values (quotes not followed by colon)
  result = result.replace(
    /(&quot;)([^&]*?)(&quot;)(?!\s*:)/g,
    '<span class="json-string">$1$2$3</span>'
  )

  // Numbers
  result = result.replace(
    /\b(-?\d+\.?\d*)\b/g,
    '<span class="json-number">$1</span>'
  )

  // Booleans
  result = result.replace(
    /\b(true|false)\b/g,
    '<span class="json-boolean">$1</span>'
  )

  // Null
  result = result.replace(/\b(null)\b/g, '<span class="json-null">$1</span>')

  // Brackets
  result = result.replace(/([{}[\],])/g, '<span class="json-bracket">$1</span>')

  return result
}

function scheduleConvert() {
  if (convertTimer) clearTimeout(convertTimer)
  convertTimer = setTimeout(convertJSON, 300)
}

function convertJSON() {
  const json = jsonInput.value.trim()

  if (!json) {
    output.innerHTML = ""
    updateLineNumbers(output, outputLineNumbers)
    showError("")
    return
  }

  try {
    let result

    if (customFieldsCheckbox.checked) {
      const pageNameValue =
        pageName.value.trim() || getDefaultPageName(json) || "Page"
      result = jsonToTypeScriptCustomFields(json, pageNameValue)
    } else {
      const typeNameValue = typeName.value.trim() || "Root"
      result = jsonToTypeScript(json, typeNameValue)
    }

    output.innerHTML = highlightTypeScript(result)
    updateLineNumbers(output, outputLineNumbers)
    showError("")
  } catch (error) {
    showError(error.message)
    output.innerHTML = ""
    updateLineNumbers(output, outputLineNumbers)
  }
}

// Get default page name from JSON data.title or fallback
function getDefaultPageName(json) {
  try {
    const data = JSON.parse(json)
    // Try to get title from data.title or data.data?.title
    if (data?.title) {
      return toPascalCase(data.title)
    }
    if (data?.data?.title) {
      return toPascalCase(data.data.title)
    }
    // Fallback to generateDefaultTypeName without "Section" suffix
    return generateDefaultTypeName(json).replace("Section", "")
  } catch {
    return "Page"
  }
}

function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

function highlightTypeScript(code) {
  let result = escapeHtml(code)

  // Keywords
  result = result.replace(
    /\b(export|type|interface|extends|const|let|var|function|class|import|from)\b/g,
    '<span class="ts-keyword">$1</span>'
  )

  // Primitive types
  result = result.replace(
    /\b(string|number|boolean|any|null|undefined|void|never|unknown|object)\b/g,
    '<span class="ts-primitive">$1</span>'
  )

  // Type names after 'type' keyword
  result = result.replace(
    /(<span class="ts-keyword">type<\/span>\s+)([A-Z]\w*)/g,
    '$1<span class="ts-interface-name">$2</span>'
  )

  // Array<Type>
  result = result.replace(
    /\bArray&lt;/g,
    '<span class="ts-type">Array</span>&lt;'
  )

  // Property names (word followed by colon or optional colon)
  result = result.replace(
    /^(\s*)(\w+)(\??:\s)/gm,
    '$1<span class="ts-property">$2</span>$3'
  )

  // Brackets
  result = result.replace(/([{}[\]])/g, '<span class="ts-bracket">$1</span>')

  return result
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function beautifyJSON() {
  const json = jsonInput.value.trim()
  if (!json) return

  try {
    const parsed = JSON.parse(json)
    const beautified = JSON.stringify(parsed, null, 2)
    jsonInput.value = beautified
    updateLineNumbers(jsonInput, inputLineNumbers)
    updateJsonHighlight()
    scheduleConvert()
    showError("")
  } catch (error) {
    showError("Invalid JSON: Cannot beautify")
  }
}

function clearAll() {
  jsonInput.value = ""
  output.innerHTML = ""
  jsonHighlight.innerHTML = ""
  updateLineNumbers(jsonInput, inputLineNumbers)
  updateLineNumbers(output, outputLineNumbers)
  showError("")
}

function copyOutput() {
  const text = output.textContent || output.innerText
  if (!text) return

  navigator.clipboard.writeText(text).then(() => {
    const originalHTML = copyBtn.innerHTML
    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!`
    copyBtn.classList.add("copied")

    setTimeout(() => {
      copyBtn.innerHTML = originalHTML
      copyBtn.classList.remove("copied")
    }, 2000)
  })
}

function showError(message) {
  if (message) {
    errorMsg.textContent = message
    errorMsg.style.display = "block"
  } else {
    errorMsg.textContent = ""
    errorMsg.style.display = "none"
  }
}

// Theme
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  document.documentElement.setAttribute("data-theme", savedTheme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "light" ? "dark" : "light"
  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
}
