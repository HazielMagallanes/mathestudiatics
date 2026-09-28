# Mathestudiatics

> Bilingual platform to **study math from any device**: theory and formula
> sheets, randomly generated exercises, a whiteboard, a scientific calculator
> and quick access to GeoGebra — 100% static, open source, no accounts, no
> tracking, works offline.
>
> Plataforma bilingüe para **estudiar matemática desde cualquier dispositivo**:
> teoría y formularios, ejercicios generados al azar, pizarra, calculadora
> científica y acceso rápido a GeoGebra — 100% estática, código abierto, sin
> cuentas ni rastreo, funciona sin conexión.

[![CI](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/ci.yml/badge.svg)](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/ci.yml)
[![Deploy](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/deploy.yml/badge.svg)](https://github.com/HazielMagallanes/mathestudiatics/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-lightgrey.svg)](docs/anonymization-policy.md)

**Live:** https://hazielmagallanes.github.io/mathestudiatics/

## Features / Funcionalidades

- **Theory and formula sheets** per unit, in Spanish and English, with rendered
  math and a print view.
- **Random exercise generator**: pick one or two units and a difficulty; answers
  and worked solutions stay hidden behind native `<details>` dropdowns. Every
  exercise is deterministic per seed, so any exercise can be bookmarked or
  shared (`#/practice?units=…&difficulty=…&seed=…`).
- **Combined units**: the selector blends two topics (for example, a
  trigonometric equation whose solution set is analysed with sets).
- **Pin an exercise to the whiteboard** and solve it there with the statement
  always visible.
- **Whiteboard**: a display surface for what you type — a **math notepad**
  where you write one step per line in plain notation (`1/2 + 3/4`,
  `x^2 - 4 = 0`) and see it rendered and placed on the board, with selection,
  movement, pan/zoom, grid and axes, undo/redo, SVG/PNG export and autosave.
- **Scientific calculator**: own parser (no `eval`), degrees/radians, memory,
  `ans`, history, plain-language errors, exact fractions and **equation solving**
  (linear and quadratic with `x`, including simplified irrational roots).
- **GeoGebra quick launch** and local history with self-assessment
  (solved / review) and JSON export/import.
- **Installable PWA**: works offline and keeps all data on your device.

## Units / Unidades

| Unit                         | Contents                                                                    |
| ---------------------------- | --------------------------------------------------------------------------- |
| Revisión / Review            | Fractions, powers and roots, logarithms, linear equations, intervals        |
| Lógica / Logic               | Propositions, connectives, truth tables, equivalences, quantifiers          |
| Conjuntos / Sets             | Extension and comprehension, operations, cardinality, power sets, intervals |
| Trigonometría / Trigonometry | Ratios, exact values, identities, equations, graphs, applications           |
| Vectores / Vectors           | Components, operations, norm, dot product, angles, parallelism              |

## Quick start / Inicio rápido

Requirements: Node >= 24 and pnpm (pinned via `packageManager`).

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Quality gates / Controles de calidad:

```bash
pnpm lint                 # ESLint (flat config, typed)
pnpm typecheck            # tsc -b
pnpm test                 # Vitest unit tests
pnpm test:coverage        # coverage with thresholds
pnpm e2e                  # Playwright + axe (needs: pnpm e2e:install once)
pnpm build                # production build in dist/
pnpm check:bundle         # performance budgets
pnpm check:anonymization  # content policy check
pnpm format:check         # Prettier
```

## Project structure / Estructura

```
src/
  app/         shell: router, providers, layout
  content/     pure content + logic
    units/     one folder per unit — drop-in extensible (theory, formulas, generators)
    combined/  cross-unit generators (declare two or more units)
  features/    practice, whiteboard, calculator, study, tools
  shared/      UI primitives, i18n, storage, seeded RNG, math rendering
docs/
  adr/         architecture decision records (append-only)
  architecture.md, performance.md, anonymization-policy.md
scripts/       anonymization and bundle-size checks (run in CI)
```

## Extending a unit / Extender una unidad

Adding a unit means adding one folder under `src/content/units/<unit>/` with
`index.ts` (generators), `theory.<locale>.md` and `formulas.<locale>.md`; the
registry discovers it automatically. A conformance suite runs every generator
across seeds and difficulties, and an independent LaTeX oracle re-computes the
answers. Details in [docs/architecture.md](docs/architecture.md) and
[ADR 0003](docs/adr/0003-content-packs-and-seeded-generators/README.md).

## Documentation / Documentación

- [Architecture](docs/architecture.md) — layers, data flow, content packs.
- [Performance budgets](docs/performance.md) — measured budgets and how they
  are enforced.
- [Anonymization policy](docs/anonymization-policy.md) — what may be published.
- [ADRs](docs/adr/README.md) — every significant decision, append-only.

## Contributing / Contribuir

Issues and PRs are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and
the [security policy](SECURITY.md). Commit messages follow Conventional
Commits; every change must keep lint, typecheck, unit tests, E2E and the policy
checks green.

## License / Licencia

- **Code:** [MIT](LICENSE).
- **Content (theory, exercises, translations):** CC BY-SA 4.0 — see the
  [anonymization policy](docs/anonymization-policy.md) for authoring rules.
