// Convert JSON to TypeScript type
function jsonToTypeScript(jsonString, typeName = "GeneratedType") {
  try {
    const obj = JSON.parse(jsonString)
    return generateTypeDefinition(obj, typeName)
  } catch (error) {
    throw new Error("Invalid JSON: " + error.message)
  }
}

function generateTypeDefinition(obj, typeName, indent = 0) {
  const indentStr = "  ".repeat(indent)
  let result = ""

  if (indent === 0) {
    result = `type ${typeName} = `
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result += "any[]"
    } else {
      const arrayType = generateTypeDefinition(obj[0], "", indent)
      result += `${arrayType}[]`
    }
  } else if (obj === null) {
    result += "null"
  } else if (typeof obj === "object") {
    result += "{\n"
    const entries = Object.entries(obj)

    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1
      result += `${indentStr}  ${key}: `

      if (Array.isArray(value)) {
        if (value.length === 0) {
          result += "any[]"
        } else {
          const arrayItemType = generateTypeDefinition(value[0], "", indent + 1)
          result += `${arrayItemType}[]`
        }
      } else if (value === null) {
        result += "null"
      } else if (typeof value === "object") {
        result += generateTypeDefinition(value, "", indent + 1)
      } else if (typeof value === "string") {
        result += "string"
      } else if (typeof value === "number") {
        result += "number"
      } else if (typeof value === "boolean") {
        result += "boolean"
      } else {
        result += "any"
      }

      result += isLast ? "\n" : ";\n"
    })

    result += `${indentStr}}`
  } else if (typeof obj === "string") {
    result += "string"
  } else if (typeof obj === "number") {
    result += "number"
  } else if (typeof obj === "boolean") {
    result += "boolean"
  } else {
    result += "any"
  }

  if (indent === 0) {
    result += ";"
  }

  return result
}

// Generate default type name from JSON key
function generateDefaultTypeName(jsonString) {
  try {
    const obj = JSON.parse(jsonString)

    // If JSON is an object, use the first key as the type name
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      const keys = Object.keys(obj)
      if (keys.length > 0) {
        return toPascalCase(keys[0])
      }
    }

    // Try to find a 'key' field
    if (obj.key && typeof obj.key === "string") {
      return toPascalCase(obj.key)
    }

    // Try to use other common identifying fields
    const identifyingFields = ["name", "id", "type", "title"]
    for (const field of identifyingFields) {
      if (obj[field] && typeof obj[field] === "string") {
        return toPascalCase(obj[field])
      }
    }

    return "GeneratedType"
  } catch {
    return "GeneratedType"
  }
}

// Convert string to PascalCase
function toPascalCase(str) {
  return str
    .replace(/[_-]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

// Export for use in popup
if (typeof module !== "undefined" && module.exports) {
  module.exports = { jsonToTypeScript, generateDefaultTypeName }
}
