# ADR 0010: Drop legacy board compatibility

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Haziel Magallanes

## Context

ADR 0009 turned the whiteboard into a typed display surface but kept the legacy
stroke/shape model, rendering, hit testing and a version migration "so boards
saved by older versions still load". At that point **nobody had used the
deployed site**, so there were no saved boards to preserve: the compatibility
layer was dead weight (a drawing engine, a dependency and a migration path for
data that does not exist).

## Decision

Remove the compatibility layer entirely:

- Delete the `stroke` and `shape` object kinds, the freehand renderer and the
  `perfect-freehand` dependency.
- The board has exactly two object kinds: **math** (notepad lines) and **text**
  (annotations).
- Board files keep a `version` field but only the current version is accepted;
  the previous-version migration is gone.
- Hit testing and bounds are box-based, which is all the remaining kinds need.

## Consequences

**Positive**

- Less code, one dependency fewer, no untested migration path, and no drawing
  engine to maintain.
- The serialization schema documents exactly what the app stores.

**Negative / accepted tradeoffs**

- Any board saved during the short window before this change (none in practice)
  would not load; the schema now rejects unknown kinds instead of migrating.
- If a future format change is needed, a new version with a migration will be
  added deliberately at that point.

**Supersedes / Superseded by:** supersedes the compatibility clause of ADR 0009
(the "legacy objects are preserved" part); the typed-display decision stands.
