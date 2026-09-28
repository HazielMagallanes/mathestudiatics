import type { Board } from '@/features/whiteboard/model/types'

const HISTORY_LIMIT = 100

export interface BoardHistory {
  past: Board[]
  present: Board
  future: Board[]
}

export function createHistory(board: Board): BoardHistory {
  return { past: [], present: board, future: [] }
}

/** Commits a new board state, clearing the redo stack. */
export function commit(history: BoardHistory, board: Board): BoardHistory {
  if (board === history.present) {
    return history
  }

  const past = [...history.past, history.present].slice(-HISTORY_LIMIT)

  return { past, present: board, future: [] }
}

export function undo(history: BoardHistory): BoardHistory {
  const previous = history.past[history.past.length - 1]

  if (!previous) {
    return history
  }

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export function redo(history: BoardHistory): BoardHistory {
  const [next, ...rest] = history.future

  if (!next) {
    return history
  }

  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: rest,
  }
}

export function canUndo(history: BoardHistory): boolean {
  return history.past.length > 0
}

export function canRedo(history: BoardHistory): boolean {
  return history.future.length > 0
}
