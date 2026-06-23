# codemap — VS Code Extension

This is a VS Code extension that generates interactive dependency graphs for any codebase. Written in TypeScript, compiled to CommonJS, bundled with D3.js v7 locally.

## Project Structure

- `src/extension.ts` — VS Code entry point (exports activate/deactivate)
- `src/commands.ts` — All 8 registered commands + webview panel management
- `src/parser/` — Dependency graph engine
  - `graph.ts` — GraphNode/GraphEdge interfaces, DFS circular detection, PageRank centrality
  - `typescript.ts` — ES imports, require, exports parser
  - `python.ts` — Python import/from-import parser
  - `generic.ts` — File reference catcher ("./config.json")
  - `index.ts` — CodeMapGenerator orchestrator (walk + parse + build + analyze)
- `src/providers/` — Tree provider, map data provider, CodeLens provider
- `src/views/webview/` — D3.js HTML/CSS/JS (offline, no CDN)
- `src/status/` — Status bar + progress indicators
- `src/utils/` — File walker, glob filter, config reader
- `test/` — Mocha test suite + TS/Python fixtures

## Key Technical Details

- **TypeScript 6.0.3**, target ES2022, module node16 (outputs CommonJS via "type": "commonjs" in package.json)
- **VS Code 1.96+** API minimum
- **D3.js v7.9.0** bundled locally in `src/views/webview/d3.min.js` — fully offline
- **No external API calls** — all analysis is local filesystem only
- **Max 10,000 nodes** default, configurable via codemap.maxNodes

## Build & Test

```bash
npm install          # copies d3.min.js to webview folder
npm run compile      # tsc -p ./
npm test             # runs mocha test suite
code .               # open in VS Code
# F5 to debug extension
```

## Commands

| ID | Shortcut |
|----|----------|
| `codemap.generateMap` | Ctrl+Shift+M |
| `codemap.refreshMap` | Ctrl+Shift+R |
| `codemap.findCircular` | — |
| `codemap.exportMap` | — |
| `codemap.toggleMap` | — |
| `codemap.openInMap` | — |
| `codemap.showDependencies` | — |
| `codemap.focusFile` | — |

## Code Style

- Strict TypeScript, no `any` types
- No comments in production code
- Small focused files — one responsibility per file
- Use VS Code API types from @types/vscode
