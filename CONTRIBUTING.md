# Contributing / Contribuir

Thanks for helping! / ¡Gracias por ayudar!

## Ground rules / Reglas

1. **Read [docs/architecture.md](architecture.md) and the
   [anonymization policy](anonymization-policy.md) first.** Content must be
   original prose with no personal or institutional identifiers.
2. **TDD.** Start from a failing test (unit or E2E) that encodes the behavior.
   Keep tests behavior-focused, not implementation-bound.
3. **Bilingual.** New UI strings go to both `es` and `en` with the same keys;
   a parity test fails otherwise.
4. **Accessibility.** WCAG 2.2 AA: keyboard operability, visible focus, sufficient
   contrast, semantic HTML first (ARIA only when needed).
5. **Conventional Commits**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`,
   `perf`, `build`, `ci`, `style`. One focused idea per commit.
6. **Approval for commits.** In this project, commits are only created after
   explicit approval, and never mix unrelated changes.

## Before opening a PR / Antes de abrir un PR

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm e2e
```

- Update docs/ADRs when a decision changes behavior or architecture.
- Keep bundle size in mind: prefer route-level splitting for new heavy features.
- Never commit secrets, personal data or material from the private `material/`
  directory (it is git-ignored on purpose).

## Adding a unit / Agregar una unidad

1. Create `src/content/units/<unit>/index.ts` exporting a typed `UnitDefinition`
   with generators per difficulty (and combined generators when it blends with
   another unit).
2. Add `theory.es.md`, `theory.en.md`, `formulas.es.md`, `formulas.en.md`.
3. Run `pnpm test` — the conformance suite validates every generator across seeds
   and difficulties.
