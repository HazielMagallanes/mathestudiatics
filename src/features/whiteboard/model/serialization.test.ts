import { describe, expect, it } from 'vitest'

import { addObject, createMath, createText, emptyBoard } from '@/features/whiteboard/model/board'
import { deserializeBoard, serializeBoard } from '@/features/whiteboard/model/serialization'
import { strokePath } from '@/features/whiteboard/model/stroke'
import type { ShapeObject, StrokeObject } from '@/features/whiteboard/model/types'

/** Legacy objects: boards saved by older versions still load and render. */
const legacyStroke: StrokeObject = {
  id: 'stroke-1',
  kind: 'stroke',
  points: [
    { x: 0, y: 0, pressure: 0.5 },
    { x: 10, y: 10, pressure: 0.7 },
  ],
  color: '#123456',
  width: 3,
  highlighter: true,
}

const legacyShape: ShapeObject = {
  id: 'shape-1',
  kind: 'arrow',
  start: { x: 0, y: 0 },
  end: { x: 50, y: 50 },
  color: '#111111',
  width: 2,
}

describe('serialization', () => {
  const board = addObject(
    addObject(
      addObject(addObject(emptyBoard(), legacyStroke), legacyShape),
      createText({ x: 5, y: 5 }, 'hola\nmundo', { color: '#222222' }),
    ),
    createMath({ x: 1, y: 2 }, '\\frac{1}{2}'),
  )

  it('round-trips a board', () => {
    expect(deserializeBoard(serializeBoard(board))).toEqual(board)
  })

  it('writes version 2 payloads', () => {
    const payload: unknown = JSON.parse(serializeBoard(board))

    expect(payload).toMatchObject({ version: 2 })
  })

  it('migrates version 1 boards, keeping old math objects in place', () => {
    const legacy = JSON.stringify({
      version: 1,
      objects: [
        {
          id: 'legacy-math',
          kind: 'math',
          position: { x: 320, y: 210 },
          latex: 'x^{2}',
          fontSize: 28,
        },
      ],
    })

    const migrated = deserializeBoard(legacy)

    expect(migrated?.objects).toHaveLength(1)
    expect(migrated?.objects[0]).toMatchObject({
      kind: 'math',
      positionMode: 'free',
      position: { x: 320, y: 210 },
    })
  })

  it('keeps notepad metadata through a round trip', () => {
    const withEntry = addObject(
      emptyBoard(),
      createMath({ x: 48, y: 72 }, '\\frac{1}{2}', {
        source: '1/2',
        entryIndex: 0,
        positionMode: 'auto',
      }),
    )

    expect(deserializeBoard(serializeBoard(withEntry))).toEqual(withEntry)
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

describe('strokePath (legacy strokes)', () => {
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
