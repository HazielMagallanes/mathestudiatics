import { describe, expect, it } from 'vitest'

import { addObject, createMath, createText, emptyBoard } from '@/features/whiteboard/model/board'
import { deserializeBoard, serializeBoard } from '@/features/whiteboard/model/serialization'

describe('serialization', () => {
  const board = addObject(
    addObject(emptyBoard(), createText({ x: 5, y: 5 }, 'hola\nmundo', { color: '#222222' })),
    createMath({ x: 1, y: 2 }, '\\frac{1}{2}'),
  )

  it('round-trips a board', () => {
    expect(deserializeBoard(serializeBoard(board))).toEqual(board)
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
    expect(deserializeBoard('{"version":2,"objects":[]}')).toBeNull()
    expect(deserializeBoard('{"version":1,"objects":[{"kind":"math"}]}')).toBeNull()
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
