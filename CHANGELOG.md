# Changelog

All notable changes to codemap will be documented in this file.

## [0.1.0] - 2026-06-24

### Added
- Initial release
- Interactive D3.js force-directed graph visualization
- TypeScript/JavaScript import parser (ES imports, require/exports)
- Python import parser (import, from-import, relative imports)
- Generic file reference parser
- Circular dependency detection via DFS
- Centrality scoring (PageRank-like algorithm)
- Entry point detection (main.ts, index.ts, main.py, etc.)
- Orphan file detection
- Multi-language support with color-coded nodes
- Sidebar tree view with file hierarchy
- CodeLens showing dependency counts inline
- Search/filter nodes in graph
- Export map as JSON
- Status bar with file/dependency count
- Keyboard shortcuts (Ctrl+Shift+M, Ctrl+Shift+R)
- Context menu integration
- Configurable max depth, exclude patterns, and theme
- Auto-generate on workspace open
- Progress bar for large workspaces
- Dark and light theme support
