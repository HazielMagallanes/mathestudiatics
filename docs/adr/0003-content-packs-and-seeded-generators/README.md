# ADR 0003: Content packs and seeded exercise generators

- **Status:** Accepted
- **Date:** 2026-09-27
- **Deciders:** Haziel Magallanes

## Context

The platform must grow unit by unit (Lógica, Conjuntos, Trigonometría, Vectores, …)
without touching core code, be fully bilingual (ES/EN), and produce **trustworthy**
exercises: the whole point of the generated practice is that the statements and the
hidden answers are mathematically correct. Exercises must also be reproducible so a
seed can be bookmarked or shared across devices.

Alternatives considered:

1. **Central registry of hand-written exercises** — no randomness, unbounded authoring
   effort, no difficulty scaling.
2. **Generators in plain JS with free-form strings** — easy to write, but untranslated
   text leaks into the wrong language and correctness is unverifiable.
3. **Content packs with typed generators, bilingual templates and machine-checkable
   answers** (chosen).

## Decision

- A unit is a folder `src/content/units/<id>/index.ts` that default-exports a
  `UnitDefinition`; `import.meta.glob` discovers it eagerly. Adding a unit is
  **adding a folder** — no registry edits.
- A generator declares `id`, `units` (one for regular, two or more for combined
  exercises), `difficulty`, `tags` and a pure `generate(rng)` returning bilingual
  `ExerciseContent` (statement/parts, answers, worked steps).
- Randomness comes from a **seeded PRNG** (xmur3 + mulberry32) derived from
  `units + difficulty + seed`; `Math.random` is forbidden in content.
- Text is authored as `{ es, en, params }` templates rendered at display time;
  `{{param}}` interpolation keeps both languages structurally identical.
- Answers carry an optional **machine-checkable `AnswerValue`** (integer, fraction,
  radical, interval, set, boolean, text) in addition to LaTeX.
- Verification is layered:
  - a **conformance suite** runs every generator over many seeds and checks
    well-formedness (params resolved, balanced LaTeX, deterministic output, variation),
  - unit tests use an **independent LaTeX oracle** (`src/test/latex-oracle.ts`) that
    parses the rendered statement and recomputes the answer (fractions, powers,
    roots, logarithms, linear equations, intervals).

## Consequences

**Positive**

- Units are additive and isolated; a unit can be reviewed/removed by deleting a folder.
- Bilingual output is guaranteed by construction: a missing translation cannot compile
  past the template type, and the conformance suite rejects unresolved placeholders.
- Bugs were already caught by the oracle during development (zero-division edge case,
  a mis-derived logarithm property), before any UI existed.
- Seeds make exercises reproducible and shareable across devices.

**Negative / accepted tradeoffs**

- Every generator must supply both languages and a machine-checkable answer (or an
  explicit `text` value); authoring is heavier than writing free-form strings.
- The oracle only understands the LaTeX subset the generators emit; new notation
  requires extending it (set builders, vectors, logic symbols).
- Combined generators must declare all units they use, and the selector only offers
  them when every unit in the selection matches.

**Supersedes / Superseded by:** none.
