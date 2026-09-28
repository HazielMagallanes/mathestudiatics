# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-09-28

### Changed

- The whiteboard is now a **display surface for typed input**: the pen,
  highlighter, eraser, shapes and the tool palette were removed. Lines come from
  the math notepad, and pointer input is for selecting, moving and panning.
- The board toolbar keeps only the view controls: grid, axes, zoom, undo/redo,
  clear and SVG/PNG export.
- Boards saved by older versions still load, render, move and export: the legacy
  stroke and shape kinds are kept for compatibility.

### Removed

- Drawing tools (pen, highlighter, eraser, line, arrow, rectangle, circle) and
  the formula tool, which the notepad already replaced.

## [1.1.0] - 2026-09-28

### Added

- **Math notepad** on the whiteboard: type one step per line in plain notation
  (`1/2 + 3/4`, `x^2 - 4 = 0`, `sqrt(2)`), see it rendered instantly, edit any
  line, and get the lines laid out top-left on the board. Enter adds a line,
  arrows navigate, `N` focuses the notepad, double-clicking a board line edits it.
- **Calculator equation mode**: solves linear and quadratic equations with `x`
  (`2x + 3 = 7`, `x^2 - 4 = 0`, `x^2 + x - 6 = 0`), shows exact fractions,
  simplifies irrational roots (`x = (-1 ± √5)/2`) with `≈` values, and reports
  no-solution, infinite-solution and no-real-solution cases.
- **Calculator on the board page** as a collapsible panel, so you never leave the
  whiteboard to compute.
- **Pin an exercise to the whiteboard** from practice (also "pin and go"), shown
  above the board with its answers and worked solutions.
- Board saves now flush on unmount, tab hide and page unload (no work lost when
  navigating).

### Changed

- Board files move to version 2 (older boards keep loading and keep their object
  positions).
- The formula input was replaced by the notepad; the board's formula tool is gone
  (keyboard typing replaces it).

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
