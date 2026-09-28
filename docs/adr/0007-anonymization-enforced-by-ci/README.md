# ADR 0007: Anonymization enforced by CI

- **Status:** Accepted
- **Date:** 2026-09-27
- **Deciders:** Haziel Magallanes

## Context

The study material is written from private notes and institutional practice
sheets. Publishing anything derived from them must not identify people or
institutions, and must not reproduce third-party content. A written policy
alone is easy to break by accident.

## Decision

- Published material is **original prose**: theory and formula sheets are
  rewritten from scratch, never copied.
- The private source files stay in a git-ignored `material/` directory.
- `docs/anonymization-policy.md` states the rules.
- `scripts/check-anonymization.mjs` scans `src/content`, `public`,
  `src/features/study` and `src/shared/i18n` for a **denylist** of
  institutional and course identifiers (`scripts/anonymization-denylist.json`),
  and **CI fails** when any term appears (`pnpm check:anonymization`).
- A unit test additionally checks that every unit has theory and formula sheets
  in both languages and that they contain no denylisted terms.

## Consequences

**Positive**

- The rule is executable, not aspirational: leaks fail the build.
- The denylist lives in one JSON file, easy to extend without touching code.

**Negative / accepted tradeoffs**

- Substring matching can produce false positives; the list is kept short and
  specific, and the rationale is documented in the JSON file.
- The check only covers the configured paths; new content directories must be
  added to the script.

**Supersedes / Superseded by:** none.
