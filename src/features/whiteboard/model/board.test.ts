import { describe, expect, it } from 'vitest'

import {
  addObject,
  bringToFront,
  createMath,
  createText,
  duplicateObject,
  emptyBoard,
  findObject,
  moveObject,
  removeObject,
  updateObject,
} from '@/features/whiteboard/model/board'
import type { ShapeObject, StrokeObject } from '@/features/whiteboard/model/types'

/** Objects saved by older versions: the board renders and moves them. */
function legacyStroke(): StrokeObject {
  return {
    id: 'stroke-1',
    kind: 'stroke',
    points: [
      { x: 10, y: 10, pressure: 0.5 },
      { x: 40, y: 30, pressure: 0.6 },
    ],
    color: '#111111',
    width: 4,
    highlighter: false,
  }
}

function legacyShape(): ShapeObject {
  return {
    id: 'shape-1',
    kind: 'rect',
    start: { x: 0, y: 0 },
    end: { x: 20, y: 10 },
    color: '#111111',
    width: 2,
  }
}

describe('board operations', () => {
  it('adds, finds and removes objects without mutating the original', () => {
    const board = emptyBoard()
    const math = createMath({ x: 0, y: 0 }, 'x^{2}')
    const withMath = addObject(board, math)

    expect(board.objects).toHaveLength(0)
    expect(findObject(withMath, math.id)).toBe(math)
    expect(removeObject(withMath, math.id).objects).toHaveLength(0)
    expect(findObject(withMath, 'missing')).toBeUndefined()
  })

  it('moves math, text and legacy objects', () => {
    const math = createMath({ x: 5, y: 5 }, 'x^{2}')
    const text = createText({ x: 5, y: 5 }, 'hola', { color: '#111111' })
    const stroke = legacyStroke()
    let board = addObject(addObject(addObject(emptyBoard(), math), text), stroke)

    board = moveObject(board, math.id, 10, -5)
    board = moveObject(board, text.id, 0, 7)
    board = moveObject(board, stroke.id, -3, 3)

    expect(findObject(board, math.id)).toMatchObject({ position: { x: 15, y: 0 } })
    expect(findObject(board, text.id)).toMatchObject({ position: { x: 5, y: 12 } })

    const movedStroke = findObject(board, stroke.id)

    expect(movedStroke?.kind === 'stroke' && movedStroke.points[0]).toMatchObject({ x: 7, y: 13 })
  })

  it('updates an object through a function', () => {
    const text = createText({ x: 0, y: 0 }, 'antes', { color: '#111111' })
    const board = updateObject(addObject(emptyBoard(), text), text.id, (object) =>
      object.kind === 'text' ? { ...object, text: 'después' } : object,
    )

    expect(findObject(board, text.id)).toMatchObject({ text: 'después' })
  })

  it('duplicates with a new id and an offset', () => {
    const math = createMath({ x: 10, y: 10 }, 'x^{2}')
    const board = duplicateObject(addObject(emptyBoard(), math), math.id)

    expect(board.objects).toHaveLength(2)

    const [original, copy] = board.objects

    expect(copy?.id).not.toBe(original?.id)
    expect(copy).toMatchObject({ kind: 'math', position: { x: 34, y: 34 } })
  })

  it('ignores duplication and reordering of missing objects', () => {
    const board = addObject(emptyBoard(), legacyShape())

    expect(duplicateObject(board, 'missing')).toBe(board)
    expect(bringToFront(board, 'missing')).toBe(board)
  })

  it('brings an object to the front', () => {
    const first = createText({ x: 0, y: 0 }, 'a', { color: '#111111' })
    const second = createMath({ x: 0, y: 0 }, 'x^2')
    const board = bringToFront(addObject(addObject(emptyBoard(), first), second), first.id)

    expect(board.objects.map((object) => object.id)).toEqual([second.id, first.id])
  })

  it('creates objects with sensible defaults', () => {
    const math = createMath({ x: 1, y: 2 }, '\\frac{1}{2}')
    const text = createText({ x: 0, y: 0 }, 'hola', { color: '#000000' })

    expect(math).toMatchObject({ kind: 'math', latex: '\\frac{1}{2}', fontSize: 28 })
    expect(text).toMatchObject({ kind: 'text', text: 'hola', fontSize: 28 })
  })
})
