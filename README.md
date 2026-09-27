# Mathestudiatics

> Bilingual platform to **study math from any device**: theory, randomly generated
> exercises, a whiteboard and a scientific calculator — 100% static, open source,
> no accounts, no tracking.
>
> Plataforma bilingüe para **estudiar matemática desde cualquier dispositivo**:
> teoría, ejercicios generados al azar, pizarra y calculadora científica — 100%
> estática, código abierto, sin cuentas ni rastreo.

[![CI](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/ci.yml/badge.svg)](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/ci.yml)
[![Deploy](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/deploy.yml/badge.svg)](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-lightgrey.svg)](docs/anonymization-policy.md)

**Live:** https://hazielmagallanes.github.io/mathestudiatics/

## Features / Funcionalidades

- **Random exercise generator** — pick one or two units plus a difficulty and get a
  fresh exercise; answers and worked solutions stay hidden behind native
  `<details>` dropdowns. Exercises are deterministic per seed, so any exercise can
  be bookmarked or shared (`#/practice?units=…&difficulty=…&seed=…`).
- **Generator aleatorio de ejercicios** — elegí una o dos unidades y una dificultad,
  y obtené un ejercicio nuevo; las respuestas y soluciones se muestran en
  desplegables nativos. Cada ejercicio es determinista por semilla: se puede
  guardar o compartir el enlace.
- **Combined units / Unidades combinadas** — the selector can blend two topics
  (e.g. a trigonometric equation whose solution set is analyzed with sets).
- **Whiteboard / Pizarra** — keyboard- and mouse-first (typed LaTeX supported) and
  touch/stylus-friendly: objects, shapes, undo/redo, grid, PNG export, autosave.
- **Scientific calculator / Calculadora científica** — own parser (no `eval`),
  DEG/RAD, ANS and memory, expression history.
- **GeoGebra quick launch** — one click to the graphing calculator when you need
  plots.
- **Bilingual ES/EN** with anonymized, original theory content and printable
  formula sheets.
- **Offline-ready** — installable PWA; all data stays on your device (JSON
  export/import to move between devices).

## Quick start / Inicio rápido

Requirements: Node >= 24 and pnpm (pinned via `packageManager`).

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Quality gates / Controles de calidad:

```bash
pnpm lint           # ESLint (flat config, typed)
pnpm typecheck      # tsc -b
pnpm test           # Vitest unit tests
pnpm test:coverage  # coverage report
pnpm e2e            # Playwright (needs: pnpm e2e:install once)
pnpm build          # production build in dist/
pnpm format:check   # Prettier
```

## Project structure / Estructura

```
src/
  app/         shell: router, providers, layout
  content/     pure content + logic: schema, blocks, units
    units/     one folder per unit — drop-in extensible
  features/    practice, whiteboard, calculator, study, geogebra
  shared/      UI primitives, i18n, storage, seeded RNG, math rendering
docs/
  adr/         architecture decision records (append-only)
```

See [docs/architecture.md](docs/architecture.md) for diagrams and the
[anonymization policy](docs/anonymization-policy.md) for content rules.

## Extending a unit / Extender una unidad

Adding a unit means adding one folder under `src/content/units/<unit>/` with
`index.ts` (generators), theory files and formula sheets; the registry discovers
it automatically. A conformance test suite runs every generator across seeds and
difficulties. Details in [docs/architecture.md](docs/architecture.md).

## Contributing / Contribuir

Issues and PRs are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[security policy](SECURITY.md). Commit messages follow Conventional Commits; every
change must keep lint, typecheck, unit tests and E2E green.

## License / Licencia

- **Code:** [MIT](LICENSE).
- **Content (theory, exercises, translations):** CC BY-SA 4.0 — see the
  [anonymization policy](docs/anonymization-policy.md) for authoring rules.
