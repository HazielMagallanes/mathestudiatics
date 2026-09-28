import { describe, expect, it } from 'vitest'

import { addObject, createText, emptyBoard } from '@/features/whiteboard/model/board'
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  redo,
  undo,
} from '@/features/whiteboard/model/history'

const empty = emptyBoard()
const withText = addObject(empty, createText({ x: 0, y: 0 }, 'a', { color: '#111111' }))
const withTwo = addObject(withText, createText({ x: 0, y: 0 }, 'b', { color: '#111111' }))

describe('board history', () => {
  it('starts empty', () => {
    const history = createHistory(empty)

    expect(canUndo(history)).toBe(false)
    expect(canRedo(history)).toBe(false)
  })

  it('commits states and undoes them', () => {
    let history = createHistory(empty)
    history = commit(history, withText)
    history = commit(history, withTwo)

    expect(canUndo(history)).toBe(true)
    expect(history.present.objects).toHaveLength(2)

    history = undo(history)

    expect(history.present.objects).toHaveLength(1)

    history = undo(history)

    expect(history.present.objects).toHaveLength(0)
    expect(canUndo(history)).toBe(false)
  })

  it('redoes what was undone', () => {
    let history = createHistory(empty)
    history = commit(history, withText)
    history = undo(history)
    history = redo(history)

    expect(history.present.objects).toHaveLength(1)
    expect(canRedo(history)).toBe(false)
  })

  it('clears the redo stack on a new commit', () => {
    let history = createHistory(empty)
    history = commit(history, withText)
    history = undo(history)
    history = commit(history, withText)

    expect(canRedo(history)).toBe(false)
    expect(history.present.objects).toHaveLength(1)
  })

  it('ignores commits of the same board instance', () => {
    const history = createHistory(empty)

    expect(commit(history, empty)).toBe(history)
  })

  it('ignores undo and redo at the edges', () => {
    const history = createHistory(empty)

    expect(undo(history)).toBe(history)
    expect(redo(history)).toBe(history)
  })
})
