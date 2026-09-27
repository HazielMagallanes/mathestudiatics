# ADR 0001: Static React SPA built with Vite for GitHub Pages

- **Status:** Accepted
- **Date:** 2026-09-27
- **Deciders:** Haziel Magallanes

## Context

The platform must let a single person study math from any device (phone, tablet,
laptop), ship as open source, and cost nothing to host. Exercises are generated
client-side from pure functions; study progress is personal and does not need to
sync between devices through a server. The source material (private PDFs) is
paraphrased into original content and must never be published.

Requirements that shaped the decision:

- Fully static output deployable to GitHub Pages (no server, no database).
- Type-safe codebase, TDD-friendly, extensible by adding content folders.
- Works offline and stays usable for years without maintenance.
- No user accounts, no telemetry, no third-party requests.

## Decision

Build a **single-page application** with **Vite + React 19 + TypeScript (strict)**,
styled with Tailwind CSS, and tested with Vitest/Testing Library (unit) and
Playwright (E2E). The production build is a static `dist/` deployed to GitHub Pages
via GitHub Actions.

Client-side capabilities replace a backend:

- Exercise generation runs in the browser with a **seeded PRNG** (reproducible,
  shareable via URL).
- Preferences live in `localStorage`; whiteboard sketches and history in
  **IndexedDB** (via `idb-keyval`), with explicit JSON export/import.
- No network calls: KaTeX, fonts and all assets are self-hosted.

## Consequences

**Positive**

- Free, durable hosting; trivial to fork/self-host; nothing to operate.
- Privacy by default: data never leaves the device.
- Reproducible exercises via seeds; no server round-trips.

**Negative / accepted tradeoffs**

- No cross-device sync or accounts; moving data requires explicit export/import.
- GitHub Pages cannot set HTTP headers: security headers are injected as a CSP
  `<meta>` at build time; `frame-ancestors` is unavailable.
- Bundle size matters more than in a server app: route-level code splitting and
  performance budgets are required (see docs/architecture.md).

**Supersedes / Superseded by:** none.
