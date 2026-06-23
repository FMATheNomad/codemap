---
name: codemap
description: VS Code extension for interactive codebase visualization — generates D3.js force-directed dependency graphs, detects circular deps, entry points, and orphan files for TypeScript, JavaScript, and Python projects
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: code-analysis
---

## What I do

I analyze a codebase and produce an interactive dependency graph visualization inside VS Code. Every file becomes a node, every import/require becomes an edge. I can:

- Parse TypeScript (ES imports, require, exports), Python (import, from-import), and generic file references
- Detect circular dependencies using DFS and highlight them in red
- Calculate centrality scores (PageRank-like algorithm) to identify the most important files
- Find entry points (main.ts, index.ts, app.tsx, etc.) and mark them with orange borders
- Detect orphan files (no dependents) and dim them
- Generate a D3.js force-directed graph where node size = centrality and node color = language

## When to use me

Use me when you need to:

- **Onboard to a new codebase** — instantly see the architecture, entry points, and key files
- **Find circular dependencies** — identify and fix import cycles before they cause production issues
- **Identify dead code** — spot orphan files that nobody imports
- **Understand refactoring impact** — see which files depend on a module before changing it
- **Document architecture** — export the dependency graph as JSON for documentation
- **Navigate large projects** — search and filter files in the visual graph, click to open any file
- **Audit monorepos** — understand cross-package dependencies

## How to use

1. Install codemap from VS Code Marketplace
2. Open any project folder
3. Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) to generate the map
4. Click any node to open the file in the editor
5. Hover over nodes for tooltip details
6. Use the search box to filter files by name
7. Red dashed edges indicate circular dependencies

## Commands

| Command | Shortcut | Action |
|---------|----------|--------|
| Generate Map | Ctrl+Shift+M / Cmd+Shift+M | Generate interactive dependency map |
| Refresh Map | Ctrl+Shift+R / Cmd+Shift+R | Re-scan and regenerate |
| Find Circular Dependencies | — | List all circular deps |
| Export Map | — | Export as JSON |
| Toggle Map | — | Show/hide map panel |
| Show Dependencies | — | Show deps of current file |

## Configuration

- `codemap.maxDepth` — max directory depth (default: 3)
- `codemap.excludePatterns` — glob patterns to skip (default: node_modules, .git, dist, etc.)
- `codemap.autoGenerateOnOpen` — auto-generate on workspace open (default: true)
- `codemap.theme` — dark or light theme (default: dark)
- `codemap.maxNodes` — max nodes before warning (default: 10000)
