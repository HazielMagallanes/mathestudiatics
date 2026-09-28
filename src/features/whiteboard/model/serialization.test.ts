import { describe, expect, it } from 'vitest'

import {
  addObject,
  createMath,
  createShape,
  createStroke,
  createText,
  emptyBoard,
} from '@/features/whiteboard/model/board'
import { deserializeBoard, serializeBoard } from '@/features/whiteboard/model/serialization'
import { strokePath } from '@/features/whiteboard/model/stroke'

describe('serialization', () => {
  const board = addObject(
    addObject(
      addObject(
        addObject(
          emptyBoard(),
          createStroke(
            [
              { x: 0, y: 0, pressure: 0.5 },
              { x: 10, y: 10, pressure: 0.7 },
            ],
            { color: '#123456', width: 3, highlighter: true },
          ),
        ),
        createShape('arrow', { x: 0, y: 0 }, { x: 50, y: 50 }, { color: '#111111', width: 2 }),
      ),
      createText({ x: 5, y: 5 }, 'hola\nmundo', { color: '#222222' }),
    ),
    createMath({ x: 1, y: 2 }, '\\frac{1}{2}'),
  )

  it('round-trips a board', () => {
    expect(deserializeBoard(serializeBoard(board))).toEqual(board)
  })

  it('rejects malformed payloads instead of throwing', () => {
    expect(deserializeBoard('not json')).toBeNull()
    expect(deserializeBoard('{"version":1}')).toBeNull()
    expect(deserializeBoard('{"version":99,"objects":[]}')).toBeNull()
    expect(deserializeBoard('{"version":1,"objects":[{"kind":"stroke"}]}')).toBeNull()
  })

  it('rejects objects with non-finite numbers', () => {
    const payload = JSON.stringify({
      version: 1,
      objects: [
        {
          id: 'a',
          kind: 'text',
          position: { x: 'NaN', y: 0 },
          text: 'x',
          color: '#000000',
          fontSize: 20,
        },
      ],
    })

    expect(deserializeBoard(payload)).toBeNull()
  })
})

describe('strokePath', () => {
  it('builds a closed SVG path from points', () => {
    const path = strokePath(
      [
        { x: 0, y: 0, pressure: 0.5 },
        { x: 10, y: 10, pressure: 0.5 },
        { x: 20, y: 0, pressure: 0.5 },
      ],
      { width: 4, highlighter: false },
    )

    expect(path.startsWith('M ')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
    expect(path).toContain('Q')
  })

  it('returns an empty path without points', () => {
    expect(strokePath([], { width: 4, highlighter: false })).toBe('')
  })

  it('produces a path for a single tap', () => {
    const path = strokePath([{ x: 5, y: 5, pressure: 0.5 }], { width: 4, highlighter: false })

    expect(path.length).toBeGreaterThan(0)
  })
})
