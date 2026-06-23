---
name: codemap
description: VS Code extension for interactive codebase visualization — generates D3.js force-directed dependency graphs with circular dependency detection, centrality scoring, and multi-language parsing for TypeScript, JavaScript, and Python
license: MIT
---

## What I do

codemap transforms any codebase into an interactive D3.js force-directed graph inside VS Code. Every file is a node, every import/require is an edge. One command, zero config.

### Key capabilities

- **Parse imports** — TypeScript (ES imports, require, exports), Python (import, from-import), generic file references
- **Detect circular dependencies** — DFS-based cycle detection, highlighted in red with dashed edges
- **Calculate centrality** — PageRank-like algorithm identifies the most important files (bigger nodes)
- **Find entry points** — auto-detect main.ts, index.ts, app.tsx, main.py, etc. (orange borders)
- **Spot orphan files** — files with no dependents are dimmed to 50% opacity
- **Navigate visually** — click any node to open the file, hover for tooltip, search to filter
- **Export** — save graph as JSON for documentation

### Supported languages

| Language | Imports parsed |
|----------|---------------|
| TypeScript | `import`, `export`, `require` |
| JavaScript | `import`, `require`, `exports` |
| Python | `import`, `from...import`, relative imports |
| Generic | File references in strings (`"./config.json"`) |

### Quick start

1. Install from VS Code Marketplace
2. Open any project
3. Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac)

### Commands

| Command | Shortcut |
|---------|----------|
| Generate Map | Ctrl+Shift+M / Cmd+Shift+M |
| Refresh Map | Ctrl+Shift+R / Cmd+Shift+R |
| Find Circular Dependencies | — |
| Export Map | — |
| Toggle Map | — |
| Show Dependencies | — |

### Links

- **GitHub**: https://github.com/FMATheNomad/codemap
- **Issues**: https://github.com/FMATheNomad/codemap/issues
- **Marketplace**: https://marketplace.visualstudio.com/items?itemName=FMATheNomad.codemap
