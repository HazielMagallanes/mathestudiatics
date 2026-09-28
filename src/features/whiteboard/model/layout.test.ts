import { describe, expect, it } from 'vitest'

import { addObject, createMath, emptyBoard } from '@/features/whiteboard/model/board'
import {
  KEYBOARD_ENTRY_ORIGIN,
  KEYBOARD_ENTRY_SPACING,
  keyboardEntries,
  keyboardEntryPosition,
  nextEntryIndex,
  relayoutKeyboardEntries,
} from '@/features/whiteboard/model/layout'
import type { Board } from '@/features/whiteboard/model/types'

function boardWithEntries(): Board {
  let board = emptyBoard()

  board = addObject(
    board,
    createMath({ x: 999, y: 999 }, 'x^{2}', { source: 'x^2', entryIndex: 0, positionMode: 'auto' }),
  )
  board = addObject(
    board,
    createMath({ x: 999, y: 999 }, '2x', { source: '2x', entryIndex: 1, positionMode: 'auto' }),
  )
  board = addObject(
    board,
    createMath({ x: 500, y: 500 }, 'y', { source: 'y', entryIndex: 2, positionMode: 'free' }),
  )

  return board
}

describe('keyboard entry layout', () => {
  it('starts at the top-left and stacks downward', () => {
    expect(keyboardEntryPosition(0)).toEqual(KEYBOARD_ENTRY_ORIGIN)
    expect(keyboardEntryPosition(2)).toEqual({
      x: KEYBOARD_ENTRY_ORIGIN.x,
      y: KEYBOARD_ENTRY_ORIGIN.y + 2 * KEYBOARD_ENTRY_SPACING,
    })
  })

  it('lists entries in notepad order', () => {
    const entries = keyboardEntries(boardWithEntries())

    expect(entries.map((entry) => entry.source)).toEqual(['x^2', '2x', 'y'])
  })

  it('computes the next free index', () => {
    expect(nextEntryIndex(emptyBoard())).toBe(0)
    expect(nextEntryIndex(boardWithEntries())).toBe(3)
  })

  it('repositions auto entries and keeps free ones', () => {
    const board = relayoutKeyboardEntries(boardWithEntries())
    const entries = keyboardEntries(board)

    expect(entries[0]?.position).toEqual(keyboardEntryPosition(0))
    expect(entries[1]?.position).toEqual(keyboardEntryPosition(1))
    expect(entries[2]?.position).toEqual({ x: 500, y: 500 })
  })

  it('returns the same board when there is nothing to reposition', () => {
    const board = emptyBoard()

    expect(relayoutKeyboardEntries(board)).toBe(board)
  })
})
