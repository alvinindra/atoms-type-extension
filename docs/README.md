# JSON to TypeScript Converter - Web Version

This is the GitHub Pages version of the JSON to TypeScript Converter extension.

## Live Demo

Visit the live site at: `https://yourusername.github.io/atoms-type-extension/`

## Features

✨ **Smart Type Name Generation** - Automatically generates type names based on the JSON structure

🎯 **Custom Type Names** - Rename your types to match your naming conventions

🎨 **Beautiful UI** - Modern, gradient-styled interface with syntax highlighting

📋 **One-Click Copy** - Copy generated TypeScript types to clipboard instantly

🔧 **Auto Beautify** - JSON is automatically formatted for better readability

🎯 **Custom Fields Arrays** - Convert JSON with `custom_fields` arrays into multiple type definitions

## Local Development

To run locally:

1. Clone the repository
2. Navigate to the `docs` folder
3. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

## Deployment

This site is designed to be deployed on GitHub Pages:

1. Push the `docs` folder to your GitHub repository
2. Go to repository Settings > Pages
3. Set Source to "Deploy from a branch"
4. Select `main` branch and `/docs` folder
5. Click Save

GitHub Pages will automatically build and deploy your site.

## Files Structure

```
docs/
├── index.html       # Main HTML file
├── styles.css       # Styles for the web version
├── app.js          # Web-specific JavaScript (no Chrome APIs)
├── converter.js    # Core conversion logic
└── README.md       # This file
```

## Browser Compatibility

This web version works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Chrome Extension

Want the full experience with context menus and keyboard shortcuts? 
Check out the [Chrome Extension version](../README.md).

## License

MIT License - feel free to use this tool in your projects!

