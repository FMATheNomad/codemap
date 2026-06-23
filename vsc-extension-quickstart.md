# codemap — VS Code Extension Quickstart

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Compile**
   ```bash
   npm run compile
   ```

3. **Debug**
   - Open this folder in VS Code
   - Press `F5` to launch a new Extension Development Host window
   - Open any project folder and run the `codemap: Generate Map` command

## Project Structure

- `src/extension.ts` — Extension entry point
- `src/activate.ts` — Activation logic
- `src/commands.ts` — Command registrations
- `src/parser/` — Language-specific parsers + graph engine
- `src/providers/` — Tree view, map data, CodeLens providers
- `src/views/` — Webview visualization + sidebar tree
- `src/status/` — Status bar and progress indicators
- `src/utils/` — File walker, filtering, configuration
- `test/` — Test suite with sample fixtures

## Key Commands

| Command | ID | Shortcut |
|---------|-----|----------|
| Generate Map | `codemap.generateMap` | `Ctrl+Shift+M` |
| Refresh Map | `codemap.refreshMap` | `Ctrl+Shift+R` |
| Find Circular | `codemap.findCircular` | — |
| Export Map | `codemap.exportMap` | — |
| Toggle Map | `codemap.toggleMap` | — |
| Show Dependencies | `codemap.showDependencies` | — |

## Testing

```bash
npm test
```

## Publishing

1. Install `vsce`: `npm install -g @vscode/vsce`
2. Package: `vsce package`
3. Publish: `vsce publish`

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [D3.js Documentation](https://d3js.org/)
