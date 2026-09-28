# ADR 0006: Installable PWA with prompt-based updates

- **Status:** Accepted
- **Date:** 2026-09-27
- **Deciders:** Haziel Magallanes

## Context

"Study from any device" includes phones and tablets, often on flaky connections.
The app is fully static and self-hosted, so it can be cached completely; the
only question is how updates should reach the user.

Options: no service worker (always network), `autoUpdate` (silent reload when a
new version is deployed) or `prompt` (a banner asks the user to update).

## Decision

Use `vite-plugin-pwa` with:

- a **web app manifest** (name, icons including a maskable one, standalone
  display, theme colours) so the app can be installed;
- a **generated service worker** that precaches the app shell and all assets
  (fonts, KaTeX, content — everything is local);
- `registerType: 'prompt'` with an in-app banner: a mid-study reload is worse
  than a stale version, so the user decides when to update.

## Consequences

**Positive**

- Installs on phones/desktops and works offline, including generated exercises
  and the whiteboard (IndexedDB).
- No third-party requests at runtime; the SW only serves same-origin files.
- Updates are explicit, never a surprise reload.

**Negative / accepted tradeoffs**

- A new deployment is not applied until the user accepts the banner (or clears
  storage); acceptable for a study tool.
- Service workers require HTTPS/localhost; GitHub Pages provides HTTPS.

**Supersedes / Superseded by:** none.
