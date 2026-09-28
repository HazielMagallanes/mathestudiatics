import { createStore, del, get, set } from 'idb-keyval'

import { deserializeBoard, serializeBoard } from '@/features/whiteboard/model/serialization'
import type { Board } from '@/features/whiteboard/model/types'

const BOARD_KEY = 'board'
const store = createStore('mathestudiatics', 'whiteboard')

export async function loadBoard(): Promise<Board | null> {
  const stored = await get<unknown>(BOARD_KEY, store)

  if (typeof stored !== 'string' || stored.length === 0) {
    return null
  }

  return deserializeBoard(stored)
}

export async function saveBoard(board: Board): Promise<void> {
  await set(BOARD_KEY, serializeBoard(board), store)
}

export async function clearSavedBoard(): Promise<void> {
  await del(BOARD_KEY, store)
}
