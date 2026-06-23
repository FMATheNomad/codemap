# Changelog

All notable changes to codemap will be documented in this file.

## [0.2.0] - 2026-06-24

### Added
- TypeScript 6.0.3 + Node 26 + ES2022 target
- Full CI workflow with Node 18/20/22/26 matrix
- CONTRIBUTING.md with PR checklist and code style guide
- Issue templates (bug report + feature request)
- GitHub topics (20 tags including solo-founder, code-map)
- Hero-section sponsor/star CTA for solo founder branding
- Feature comparison table vs alternatives
- Problem-Solution narrative structure
- Mermaid architecture diagram
- Social share buttons (X/Twitter + Reddit)
- Roadmap with checkboxes for planned features
- Dogfooding section (codemap analyzing itself)
- Saweria.co funding option in FUNDING.yml

### Changed
- Updated to 2026 ecosystem (TypeScript 6.0, Mocha 11, @vscode/test-electron 3.0)
- Overhauled README with virality patterns matching FMA OSS repos

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
