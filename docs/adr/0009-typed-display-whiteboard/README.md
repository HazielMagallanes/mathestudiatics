# ADR 0009: The whiteboard as a typed display surface

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Haziel Magallanes

## Context

ADR 0004 and ADR 0008 gave the whiteboard a full drawing toolset (pen,
highlighter, eraser, shapes) next to the keyboard notepad. In practice the
board is used on a laptop, where solving means **typing** lines of algebra: the
drawing tools added a toolbar, state and interactions that were rarely used and
made the board noisier.

## Decision

The board becomes a **display surface for typed input**:

- The **math notepad** is the only way to add math; the text box adds
  annotations. No pen, highlighter, eraser, shapes or tool palette.
- Pointer input is only for **selecting, moving and panning**: click/drag an
  object to move it, drag empty space with the mouse wheel/trackpad plus
  `Space` (or middle button) to pan, `Ctrl`+wheel and the toolbar buttons to
  zoom. Keyboard nudge, duplicate (`Ctrl+D`), delete (`Del`), undo/redo and
  `N` to focus the notepad remain.
- The toolbar keeps the **view controls**: grid, axes, zoom, undo/redo, clear
  and SVG/PNG export.
- **Legacy objects are preserved**: boards saved before this change still load,
  render, move and export (strokes and shapes keep their model, rendering and
  hit testing; only the creators and the drawing interactions were removed).
  Board JSON stays at version 2.

## Consequences

**Positive**

- A simpler, quieter surface: the toolbar is only about the view, and every
  object on the board comes from something the user typed.
- Less code and fewer interactions to maintain; the notepad tests and the
  layout stay the single source of truth for content.

**Negative / accepted tradeoffs**

- Freehand sketching is gone: quick diagrams must be typed (or made in
  GeoGebra, which is one click away). This is the intended tradeoff.
- Boards made with the old tools keep rendering, but their objects can no
  longer be drawn anew; the model keeps the legacy kinds for compatibility.

**Supersedes / Superseded by:** narrows ADR 0004 (drawing toolset) and extends
ADR 0008 (keyboard workspace).
