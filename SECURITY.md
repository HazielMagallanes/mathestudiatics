# Security policy / Política de seguridad

## Scope / Alcance

Mathestudiatics is a fully static site: there is no backend, no database, no
accounts and no telemetry. Security work focuses on the client:

- No `eval` / `new Function` anywhere (the calculator has its own parser).
- Content rendering never allows raw HTML; KaTeX runs with `trust: false`.
- A strict Content-Security-Policy is injected into production builds.
- Dependencies are pinned, audited in CI (`pnpm audit`), scanned with CodeQL and
  updated through Dependabot with a 7-day minimum release age.

## Reporting a vulnerability / Reportar una vulnerabilidad

Please **do not open a public issue**. Email `contactame.haziel@gmail.com` with:

- A description of the issue and its impact.
- Reproduction steps or a proof of concept.
- Affected versions (commit hash if possible).

You will get an acknowledgement as soon as possible; fixes are released as patch
versions with credit unless you prefer otherwise.
