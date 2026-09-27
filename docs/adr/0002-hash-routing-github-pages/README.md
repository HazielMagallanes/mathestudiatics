# ADR 0002: Hash routing on GitHub Pages

- **Status:** Accepted
- **Date:** 2026-09-27
- **Deciders:** Haziel Magallanes

## Context

GitHub Pages serves static files without URL rewriting: a request to
`/mathestudiatics/practice` returns 404 unless the app is served from
`index.html`. The React app needs deep links for reproducibility
(`…/#/practice?units=…&difficulty=…&seed=…`) and for bookmarks on any device.

Two options were considered:

1. **BrowserRouter + `404.html` fallback** that stores the requested path and
   redirects to `index.html` (the well-known GitHub Pages SPA hack).
2. **HashRouter**, where all routes live after `#` and the server always serves
   `index.html` at the project root.

## Decision

Use **HashRouter** (React Router 7).

## Consequences

**Positive**

- Deep links always work: no 404 round-trip, no redirect flash, no extra build
  step, no per-route history rewrite.
- Zero server configuration; identical behavior on GH Pages, forks and `file://`
  previews.

**Negative / accepted tradeoffs**

- URLs contain `#/…`; the hash is not sent to the server.
- The app is not indexable by search engines — acceptable, since SEO is not a goal
  for a personal study tool.

**Supersedes / Superseded by:** none.
