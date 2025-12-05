// Convert JSON to TypeScript type
function jsonToTypeScript(jsonString, typeName = "GeneratedType") {
  try {
    const obj = JSON.parse(jsonString)
    return generateTypeDefinition(obj, typeName)
  } catch (error) {
    throw new Error("Invalid JSON: " + error.message)
  }
}

// Convert JSON to TypeScript interfaces (mono output)
function jsonToTypeScriptMono(jsonString, rootName = "Root", prefix = "") {
  try {
    const obj = JSON.parse(jsonString)
    return generateInterfaceDefinitions(obj, rootName, prefix)
  } catch (error) {
    throw new Error("Invalid JSON: " + error.message)
  }
}

function generateTypeDefinition(obj, typeName, indent = 0) {
  const indentStr = "  ".repeat(indent)
  let result = ""

  if (indent === 0) {
    result = `export type ${typeName} = `
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

function generateInterfaceDefinitions(obj, rootName, prefix = "") {
  const interfaces = []
  const usedNames = new Set()
  const built = new Set()
  const prefixPascal = toPascalCase(prefix || "")

  const addPrefix = (name) => {
    if (!prefixPascal) return name
    return `${prefixPascal}${name}`
  }

  const ensureUniqueName = (baseName) => {
    const base = addPrefix(baseName || "Type")
    let name = base
    let counter = 2
    while (usedNames.has(name)) {
      name = `${base}${counter}`
      counter += 1
    }
    usedNames.add(name)
    return name
  }

  const singularize = (name) => {
    if (!name) return name
    const lower = name.toLowerCase()
    if (lower.endsWith("status") || lower.endsWith("us") || lower.endsWith("ss")) return name
    if (lower.endsWith("ies")) return name.slice(0, -3) + "y"
    if (lower.endsWith("s")) return name.slice(0, -1)
    return name
  }

  const formatKey = (key) => {
    const safeKey = String(key)
    const identifierPattern = /^[$A-Z_][0-9A-Z_$]*$/i
    if (identifierPattern.test(safeKey)) return safeKey
    return `"${safeKey.replace(/"/g, '\\"')}"`
  }

  const formatInterface = (name, fields) => {
    const lines = fields.map(([key, type]) => `  ${formatKey(key)}: ${type}`)
    return `export interface ${name} {\n${lines.join("\n")}\n}`
  }

  const buildInterface = (value, nameHint) => {
    const interfaceName = ensureUniqueName(
      toPascalCase(nameHint || rootName || "Root")
    )
    if (built.has(interfaceName)) return interfaceName
    built.add(interfaceName)

    const fields = Object.entries(value || {}).map(([key, val]) => {
      const fieldType = resolveType(val, key)
      return [key, fieldType]
    })

    interfaces.push(formatInterface(interfaceName, fields))
    return interfaceName
  }

  const resolveType = (value, keyHint) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return "any[]"
      const itemType = resolveType(value[0], singularize(keyHint || "Item"))
      return `${itemType}[]`
    }

    if (value === null) return "any"

    const valueType = typeof value
    if (valueType === "object") {
      const nestedName = keyHint ? singularize(keyHint) : "Nested"
      return buildInterface(value, nestedName)
    }
    if (valueType === "string") return "string"
    if (valueType === "number") return "number"
    if (valueType === "boolean") return "boolean"
    return "any"
  }

  buildInterface(obj, rootName)
  return interfaces.join("\n\n")
}

// Generate default type name from JSON key
function generateDefaultTypeName(jsonString) {
  try {
    const obj = JSON.parse(jsonString)

    // Try to find a 'key' field first and append "Section"
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      if (obj.key && typeof obj.key === "string") {
        return toPascalCase(obj.key) + "Section"
      }
    }

    // If JSON is an object, use the first key as the type name
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      const keys = Object.keys(obj)
      if (keys.length > 0) {
        return toPascalCase(keys[0])
      }
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

// Convert custom fields array to TypeScript types
function jsonToTypeScriptCustomFields(jsonString, pageName = "Page") {
  try {
    const obj = JSON.parse(jsonString)

    // Check if the JSON has a custom_fields array
    // Support both root level and nested in 'data' object
    let customFields = null

    if (obj.custom_fields && Array.isArray(obj.custom_fields)) {
      customFields = obj.custom_fields
    } else if (
      obj.data &&
      obj.data.custom_fields &&
      Array.isArray(obj.data.custom_fields)
    ) {
      customFields = obj.data.custom_fields
    } else {
      throw new Error(
        "JSON must contain a 'custom_fields' array (either at root or in 'data' object)"
      )
    }

    let results = []

    // Generate a type for each custom field item
    for (const field of customFields) {
      if (!field.key || typeof field.key !== "string") {
        continue
      }

      // Create type name: PageName + Key + "Section"
      const keyPascalCase = toPascalCase(field.key)
      const typeName = `${pageName}${keyPascalCase}Section`

      // Generate type for the details/section content only
      // If field has a 'details' property, use that, otherwise use the entire field
      const sectionContent = field.details !== undefined ? field.details : field
      const typeDefinition = generateTypeDefinition(sectionContent, typeName)
      results.push(typeDefinition)
    }

    return results.join("\n\n")
  } catch (error) {
    throw new Error("Invalid JSON: " + error.message)
  }
}

// Export for use in popup
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    jsonToTypeScript,
    jsonToTypeScriptMono,
    generateDefaultTypeName,
    jsonToTypeScriptCustomFields,
    toPascalCase,
  }
}
