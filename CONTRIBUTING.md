# Contributing to codemap

First off, thanks for taking the time to contribute! 🎉

> **⭐️ Star this repo** — it helps other developers discover codemap
> **❤️ Sponsor** — [github.com/sponsors/FMATheNomad](https://github.com/sponsors/FMATheNomad) — supports solo founder development

---

## 🐛 Reporting Bugs

1. Check if the bug already exists in [Issues](https://github.com/FMATheNomad/codemap/issues)
2. Use the bug report template when creating an issue
3. Include:
   - VS Code version (`code --version`)
   - OS and version
   - Reproduction steps (minimal repo if possible)
   - Expected vs actual behavior

## 💡 Suggesting Features

1. Check if the feature is already planned in [Roadmap](README.md#-roadmap)
2. Open a feature request issue describing:
   - The problem you're trying to solve
   - How codemap could help
   - Alternative solutions you've considered

## 🔧 Pull Requests

### PR Checklist

- [ ] Code compiles cleanly (`npm run compile`)
- [ ] Tests pass (`npm test`)
- [ ] No new warnings or errors
- [ ] Follows existing code style
- [ ] Updated CHANGELOG.md if adding a feature

### Development Setup

```bash
git clone https://github.com/FMATheNomad/codemap
cd codemap
npm install
npm run compile
code .
# F5 to debug
```

### Code Style

- **TypeScript** — strict mode, no `any` types
- **No comments in production code** — code should be self-documenting
- **ES2022 features** preferred (optional chaining, nullish coalescing, etc.)
- **Small, focused files** — one responsibility per file
- **Async where possible** — use `async/await` over raw promises

### Adding a New Language Parser

1. Create a new parser file in `src/parser/` implementing the `Parser` interface
2. Register the language extension in `src/parser/index.ts#detectLanguage()`
3. Add the parser to `src/parser/index.ts#parseFile()`
4. Add test fixtures to `test/fixtures/<language>/`
5. Add parser tests in `test/suite/parser.test.ts`

### Testing

```bash
npm test
```

The test suite includes:
- **Parser tests** — verify each language parser detects imports correctly
- **Graph tests** — verify circular detection, centrality, orphan computation
- Test fixtures in `test/fixtures/` provide sample projects

---

## 🗺️ Roadmap Contributions

See [README.md#-roadmap](README.md#-roadmap) for planned features. Priority items:
- Go parser support
- Rust parser support
- File watcher auto-refresh
- Export as PNG/SVG

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Questions?** Open a [Discussion](https://github.com/FMATheNomad/codemap/discussions) or [Issue](https://github.com/FMATheNomad/codemap/issues).
