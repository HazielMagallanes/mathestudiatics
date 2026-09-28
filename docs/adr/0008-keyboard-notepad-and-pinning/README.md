# ADR 0008: Keyboard math notepad, embedded calculator and pinned exercises

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Haziel Magallanes

## Context

The whiteboard is comfortable with a mouse or stylus, but solving an exercise on a
laptop is mostly **typing**: writing line after line of algebra, checking a value
with the calculator, and keeping the statement visible. Three needs came up:

1. Typing math should render like paper (no raw LaTeX on screen) and land in a
   predictable place on the board.
2. Equation solving belongs to the **calculator** (the user does the algebra
   line by line; the tool should not solve for them), and the calculator should
   be reachable without leaving the board.
3. Navigating away must never lose the board, and an exercise should be
   pinnable so it stays visible while solving.

## Decision

- **Math notepad**: a line-based editor where each line is one step. Plain
  notation (`1/2`, `sqrt(2)`, `x^2`, `<=`) is converted to LaTeX by
  `shared/math/plain-to-latex` and rendered live; lines starting with `\` pass
  through as raw LaTeX. **No evaluation or solving happens here.**
- Each committed line becomes a `MathObject` with `source`, `entryIndex` and
  `positionMode`; auto entries are laid out **top-left and stacked**
  (`model/layout.ts`). Dragging marks an entry `free` so it keeps its place;
  double-clicking a board line focuses it in the notepad (single source of
  truth). Board JSON moves to **version 2** with a v1 migration.
- **Calculator equation mode**: variable `x` in the tokenizer/parser, a
  polynomial path (degree ≤ 2) and a solver: linear, quadratic (rational roots
  as exact fractions; irrational roots as `x = (-b ± k√m) / 2a` with `≈`
  approximations), no-solution/infinite/no-real cases, and an `unsupported`
  error for anything else. Numeric results are shown as exact fractions when
  possible.
- **Calculator on the board page** as a collapsible panel, plus board
  persistence that **flushes on unmount, tab hide and page unload** (short
  300 ms debounce in the meantime).
- **Pinned exercise**: the practice card pins `{ seed, units, difficulty, mix }`
  to localStorage; the board page re-derives the exercise from the seed and
  shows it above the board with answers/solutions, unpin and a link back.

## Consequences

**Positive**

- Typing algebra is first-class on a laptop while pen/touch still work.
- The tool never solves the user's exercise for them, but the calculator is one
  panel away and keeps exact fractions.
- Seeds keep pins tiny and reproducible; boards survive navigation.

**Negative / accepted tradeoffs**

- The plain-notation converter is heuristic: nested fractions or nested
  `sqrt(...)` are not converted (use raw LaTeX for those).
- Only linear and quadratic equations are solved; higher degrees and
  non-polynomial equations report `unsupported`.
- Full-page navigations (typing a URL, closing the tab) rely on the unload
  flush, which is best-effort; in-app navigation always flushes on unmount.

**Supersedes / Superseded by:** extends ADR 0004 and ADR 0005.
