# JSON to TypeScript Type Converter

A Chrome extension that converts JSON objects into TypeScript type definitions. Right-click on selected JSON or use the popup interface to generate TypeScript types with customizable names.

## 🌐 Try it Online

**[Launch Web Version →](https://yourusername.github.io/atoms-type-extension/)**

No installation required! Use the web version directly in your browser. For advanced features like context menus and keyboard shortcuts, install the Chrome extension below.

## Features

✨ **Context Menu Integration** - Right-click on selected JSON text to convert it instantly

🎯 **Smart Type Name Generation** - Automatically generates type names based on the JSON `key` field (e.g., `model_mobil` → `ModelMobilSection`)

✏️ **Custom Type Names** - Rename your types to match your naming conventions

🎨 **Beautiful UI** - Modern, gradient-styled interface with syntax highlighting

📋 **One-Click Copy** - Copy generated TypeScript types to clipboard instantly

🔧 **Auto Beautify** - JSON is automatically formatted when loaded via context menu

⌨️ **Keyboard Shortcuts** - Convert selected JSON and copy TypeScript with Control+Cmd+C (Mac) or Control+Shift+C (Windows/Linux)

🎯 **Custom Fields Arrays** - Convert JSON with `custom_fields` arrays into multiple type definitions with page-specific naming

## Installation

### Install from Source

1. **Clone or download this repository**
   ```bash
   cd /Users/Work/atoms-type-extension
   ```

2. **Open Chrome and navigate to extensions**
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `atoms-type-extension` directory

5. **The extension is now installed!**
   - You should see the extension icon in your toolbar

## Usage

### Method 1: Context Menu (Right-Click)

1. **Select JSON text** on any webpage
2. **Right-click** on the selected text
3. **Click "Convert JSON to TypeScript Type"**
4. The extension popup will open with:
   - Your JSON already pasted and **automatically beautified**
   - Auto-generated type name (based on the `key` field)
   - TypeScript type definition ready to copy

### Method 2: Extension Popup

1. **Click the extension icon** in your Chrome toolbar
2. **Paste your JSON** into the input textarea
3. **Enter a type name** (or click the auto-generate button)
4. **Click "Convert"**
5. **Click "Copy"** to copy the TypeScript type to your clipboard

### Method 3: Keyboard Shortcut

1. **Select JSON text** on any webpage
2. **Press Control+Cmd+C** (Mac) or **Control+Shift+C** (Windows/Linux)
3. The JSON will be converted to TypeScript and **automatically copied to your clipboard**
4. A notification will confirm the conversion and copy

### Method 4: Custom Fields Arrays Mode

For JSON objects containing a `custom_fields` array, this mode generates TypeScript types for each field's content:

1. **Click the extension icon** in your Chrome toolbar
2. **Check the "Custom Fields Arrays" checkbox**
3. **Enter a page name** (e.g., "Home", "About", "Product")
4. **Paste your JSON** with a `custom_fields` array (each item must have a `key` field)
5. **Click "Convert"**
6. Each field's `details` (or content) will be converted to a separate type named `{PageName}{Key}Section`

**Supports both formats:**
- Direct: `{ "custom_fields": [...] }`
- Nested: `{ "data": { "custom_fields": [...] } }`

**Example Input:**
```json
{
  "custom_fields": [
    {
      "key": "cover",
      "sort": 166,
      "details": {
        "status": true,
        "banner_list": []
      }
    },
    {
      "key": "video",
      "sort": 163,
      "details": {
        "status": true,
        "label": "Video Section",
        "video_option": []
      }
    }
  ]
}
```

**Example Output (Page Name: "Home"):**
```typescript
export type HomeCoverSection = {
  status: boolean;
  banner_list: any[]
};

export type HomeVideoSection = {
  status: boolean;
  label: string;
  video_option: any[]
};
```

**Note:** The output includes only the section content (the `details` field), not the field metadata like `key` or `sort`.

## Example

**Input JSON:**
```json
{
  "key": "model_mobil",
  "sort": 158,
  "details": {
    "status": true,
    "description": "Temukan kendaraan yang sempurna untuk gaya hidup Anda.",
    "title": "Temukan Model Terbaru dari Toyota"
  }
}
```

**Generated Type Name:** `ModelMobilSection` (auto-generated from the `key` field)

**Output TypeScript:**
```typescript
type ModelMobilSection = {
  key: string;
  sort: number;
  details: {
    status: boolean;
    description: string;
    title: string
  }
};
```

## Features in Detail

### Auto-Generated Type Names

The extension intelligently generates type names by:
1. Looking for a `key` field in your JSON
2. Converting it to PascalCase (e.g., `model_mobil` → `ModelMobil`)
3. Adding a suffix like "Section" or "Type"

If no `key` field is found, it looks for other common fields like `name`, `id`, `type`, or `title`.

### Supported JSON Types

- ✅ Objects
- ✅ Nested objects
- ✅ Arrays
- ✅ Primitives (string, number, boolean, null)
- ✅ Mixed types

## Keyboard Shortcuts

- **Ctrl+Enter** in the JSON input textarea to convert
- **Control+Cmd+C** (Mac) or **Control+Shift+C** (Windows/Linux) to convert selected JSON on any webpage and copy the TypeScript result

## Development

### File Structure

```
atoms-type-extension/
├── manifest.json          # Chrome extension configuration
├── background.js          # Service worker for context menu
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and event handlers
├── popup.css             # Styling for the popup
├── converter.js          # JSON to TypeScript conversion logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Customizing Icons

The extension includes placeholder icons. To create custom icons:

1. Create 16x16, 48x48, and 128x128 PNG images
2. Save them in the `icons/` directory
3. Name them `icon16.png`, `icon48.png`, and `icon128.png`
4. Reload the extension in Chrome

Recommended icon design: Use a gradient background (#667eea to #764ba2) with "TS" text in white.

## Technologies Used

- **Manifest V3** - Latest Chrome extension format
- **Vanilla JavaScript** - No framework dependencies
- **Modern CSS** - Gradient backgrounds and smooth transitions
- **Context Menus API** - Right-click functionality
- **Chrome Storage API** - Temporary data storage for context menu

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

MIT License - feel free to use this extension in your projects!

## Changelog

### Version 1.2.0
- 🎯 **Custom Fields Arrays Mode** - New feature to convert `custom_fields` arrays into multiple page-specific type definitions
- 📝 **Page Name Input** - Add custom page names to generate types like `HomeCoverSection`, `HomeVideoSection`, etc.
- ✨ **Batch Type Generation** - Generate multiple TypeScript types from a single JSON input

### Version 1.1.0
- ✨ **Auto Beautify** - JSON is now automatically beautified when loaded via context menu
- ⌨️ **Quick Convert Shortcut** - Added keyboard shortcut Control+Cmd+C (Mac) or Control+Shift+C (Windows/Linux) to convert selected JSON and copy TypeScript result directly from any webpage

### Version 1.0.0
- Initial release
- Context menu integration
- Auto-generated type names from JSON keys
- Custom type name support
- Copy to clipboard functionality
- Beautiful gradient UI

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.

---

Made with ❤️ for TypeScript developers

