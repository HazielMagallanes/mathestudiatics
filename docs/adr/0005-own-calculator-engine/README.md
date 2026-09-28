# ADR 0005: Own expression engine for the calculator

- **Status:** Accepted
- **Date:** 2026-09-27
- **Deciders:** Haziel Magallanes

## Context

The platform needs a scientific calculator that works offline, keyboard-first,
with degrees/radians, memory, `ans` and history. The obvious shortcuts have
problems:

1. `eval` / `new Function` — executes arbitrary code; unacceptable (security
   standards forbid it, and a strict CSP would block it anyway).
2. A third-party math library (mathjs, …) — large bundle for the subset we need,
   and its evaluator still parses untrusted input.
3. A hand-written tokenizer + parser + evaluator (chosen) — small, testable,
   and it gives exact control over error messages and limits.

## Decision

Implement the engine in `src/features/calculator/engine/`:

- **tokenizer**: numbers (accepts decimal comma), operators, functions,
  constants, parentheses and postfix factorial; normalises `× ÷ − √ ∛ π ,`.
- **parser**: recursive descent with correct precedence, right-associative `^`,
  unary minus looser than `^` (`-2^2 = -4`), factorial as postfix, and implicit
  multiplication for `2π`, `3(4+5)`, `2sin(30)`.
- **evaluator**: pure function over the AST with an explicit context
  (`angleMode`, `ans`, `memory`); domain checks instead of `NaN`
  (`sqrt(-1)`, `ln(0)`, `tan(90°)`, `2.5!`), division-by-zero and overflow
  errors, and a hard input-length limit.
- **formatting**: 12 significant digits, floating-point noise removed
  (`0.1 + 0.2 → 0.3`), scientific notation only for extreme magnitudes.

The UI maps error codes to bilingual messages; the engine never returns `NaN`
or `Infinity` to the user.

## Consequences

**Positive**

- No code execution surface; the strict CSP stays intact.
- Fully unit-tested (precedence, associativity, domain errors, formatting) —
  the engine is the most tested module in the app.
- Small bundle and no runtime dependency for the calculator.

**Negative / accepted tradeoffs**

- Only the functions we implement exist; adding one is a small, tested change.
- No symbolic algebra or exact fractions (decimal results, like a physical
  scientific calculator).

**Supersedes / Superseded by:** none.
