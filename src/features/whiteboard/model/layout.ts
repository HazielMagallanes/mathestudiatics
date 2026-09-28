import type { Board, MathObject, Point } from '@/features/whiteboard/model/types'

/** Where keyboard entries start on the board (top-left, like an algebra view). */
export const KEYBOARD_ENTRY_ORIGIN: Point = { x: 48, y: 72 }
export const KEYBOARD_ENTRY_SPACING = 84

export function keyboardEntryPosition(index: number): Point {
  return {
    x: KEYBOARD_ENTRY_ORIGIN.x,
    y: KEYBOARD_ENTRY_ORIGIN.y + index * KEYBOARD_ENTRY_SPACING,
  }
}

/** Math objects created from the notepad, in notepad order. */
export function keyboardEntries(board: Board): MathObject[] {
  return board.objects
    .filter(
      (object): object is MathObject => object.kind === 'math' && object.entryIndex !== undefined,
    )
    .sort((left, right) => (left.entryIndex ?? 0) - (right.entryIndex ?? 0))
}

/** Free slot for a new keyboard entry. */
export function nextEntryIndex(board: Board): number {
  const entries = keyboardEntries(board)

  if (entries.length === 0) {
    return 0
  }

  return Math.max(...entries.map((entry) => entry.entryIndex ?? 0)) + 1
}

/**
 * Repositions every auto entry so the notepad reads top-down. Entries the user
 * dragged keep their free position.
 */
export function relayoutKeyboardEntries(board: Board): Board {
  const entries = keyboardEntries(board)
  const positions = new Map<string, Point>()

  entries.forEach((entry, index) => {
    if (entry.positionMode !== 'free') {
      positions.set(entry.id, keyboardEntryPosition(index))
    }
  })

  if (positions.size === 0) {
    return board
  }

  return {
    objects: board.objects.map((object) => {
      const position = positions.get(object.id)

      return position ? { ...object, position } : object
    }),
  }
}
