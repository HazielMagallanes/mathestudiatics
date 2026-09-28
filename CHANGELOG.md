# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-09-27

First complete release: the platform covers theory, practice, tools and offline
use, with all quality gates enforced in CI.

### Added

- **Study material**: original bilingual theory and formula sheets for all five
  units (Review, Logic, Sets, Trigonometry, Vectors), rendered with KaTeX and
  printable.
- **Exercise generator**: seeded and reproducible, with difficulty and unit
  selection (one or two units), curated combined exercises, hidden answers and
  worked solutions, and shareable deep links.
- **Content framework**: typed, auto-discovered content packs; a conformance
  suite plus independent oracles (LaTeX, logic, exact trigonometry, sets and
  vectors) verify every generator.
- **Whiteboard**: SVG object model with pressure-sensitive ink, shapes, text and
  typed formulas; keyboard shortcuts, nudge/duplicate/delete, snapping, grid and
  axes, undo/redo, autosave, and SVG/PNG export.
- **Scientific calculator**: own tokenizer, parser and evaluator (no `eval`),
  degrees/radians, memory, `ans`, history and domain-aware error messages.
- **Practice tools**: local history with self-assessment and JSON
  export/import, plus quick access to the whiteboard, the calculator and
  GeoGebra.
- **PWA**: installable with offline support and prompt-based updates.
- **Bilingual UI (ES/EN)** with typed translation keys and a key-parity test.
- **Quality gates**: ESLint, strict TypeScript, Vitest with coverage
  thresholds, Playwright + axe on every route, bundle-size budgets,
  anonymization check, CodeQL, dependency audit and Dependabot.

### Security

- Strict Content-Security-Policy injected into production builds (inline theme
  bootstrap covered by a hash).
- No `eval`/`new Function`, no raw HTML rendering, KaTeX with `trust: false`.
- No third-party requests at runtime; all data stays on the device.

### Documentation

- Architecture guide with diagrams, performance budgets, anonymization policy
  and ADRs 0001–0007.
