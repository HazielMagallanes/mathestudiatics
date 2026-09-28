# Performance budgets / Presupuestos de rendimiento

> Measured, not guessed: the budgets below come from the current build
> (`pnpm build && pnpm check:bundle`) with headroom for small additions.
>
> Medidos, no adivinados: los presupuestos surgen del build actual
> (`pnpm build && pnpm check:bundle`) con margen para agregados menores.

## Budgets

| Metric / Métrica         | Budget                           | Enforced by                          |
| ------------------------ | -------------------------------- | ------------------------------------ |
| Entry JS chunk (gzipped) | ≤ 150 kB                         | `scripts/check-bundle-size.mjs` (CI) |
| Any JS chunk (gzipped)   | ≤ 170 kB                         | `scripts/check-bundle-size.mjs` (CI) |
| Total `dist/` (gzipped)  | ≤ 2.3 MB                         | `scripts/check-bundle-size.mjs` (CI) |
| Unit test coverage       | statements ≥ 80%, branches ≥ 70% | Vitest coverage thresholds           |
| Accessibility            | 0 axe violations                 | unit tests + Playwright E2E          |

## How the app stays inside the budgets

- Routes are **lazy-loaded**; the study reader (react-markdown + KaTeX
  pipeline) and the whiteboard live in their own chunks.
- KaTeX, fonts and icons are **self-hosted** and precached by the service
  worker, so offline use costs no extra network.
- Content is plain TypeScript/Markdown compiled into the bundle — no runtime
  fetching.
- The calculator is hand-written (no math library) and the whiteboard model is
  dependency-free apart from `perfect-freehand`.

## Measuring locally

```bash
pnpm build
pnpm check:bundle        # prints the largest chunks and the total
pnpm test:coverage       # coverage table with thresholds
pnpm e2e                 # includes axe checks per route
```

## Known tradeoffs

- The study reader chunk is large (~117 kB gz) because of the Markdown + KaTeX
  pipeline; it only loads on theory pages.
- `foreignObject` maths in the whiteboard are DOM-heavy; very large boards
  (thousands of objects) would need virtualization (documented in ADR 0004).
