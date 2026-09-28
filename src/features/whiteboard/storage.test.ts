import 'fake-indexeddb/auto'

import { describe, expect, it } from 'vitest'

import { addObject, createMath, emptyBoard } from '@/features/whiteboard/model/board'
import { clearSavedBoard, loadBoard, saveBoard } from '@/features/whiteboard/storage'

describe('whiteboard storage', () => {
  it('saves and loads a board', async () => {
    const board = addObject(emptyBoard(), createMath({ x: 1, y: 2 }, '\\sqrt{2}'))

    await saveBoard(board)

    expect(await loadBoard()).toEqual(board)
  })

  it('returns null when nothing was saved', async () => {
    await clearSavedBoard()

    expect(await loadBoard()).toBeNull()
  })

  it('ignores corrupted stored payloads', async () => {
    const { createStore, set } = await import('idb-keyval')
    const store = createStore('mathestudiatics', 'whiteboard')

    await set('board', '{"version":1,"objects":[{"bad":true}]}', store)

    expect(await loadBoard()).toBeNull()
  })
})
