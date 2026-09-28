import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearPinnedExercise,
  PINNED_STORAGE_KEY,
  readPinnedExercise,
  writePinnedExercise,
} from '@/features/practice/state/pinned-exercise'

beforeEach(() => {
  window.localStorage.clear()
})

describe('pinned exercise', () => {
  it('returns null when nothing is pinned', () => {
    expect(readPinnedExercise()).toBeNull()
  })

  it('round-trips a pinned exercise', () => {
    const entry = writePinnedExercise({
      seed: 'abc123',
      units: ['logic', 'sets'],
      difficulty: 'hard',
      mix: 'combined',
    })

    expect(readPinnedExercise()).toEqual(entry)
    expect(entry.pinnedAt).toBeGreaterThan(0)
  })

  it('ignores invalid or corrupted payloads', () => {
    window.localStorage.setItem(PINNED_STORAGE_KEY, '{"seed":""}')
    expect(readPinnedExercise()).toBeNull()

    window.localStorage.setItem(PINNED_STORAGE_KEY, 'not json')
    expect(readPinnedExercise()).toBeNull()

    window.localStorage.setItem(
      PINNED_STORAGE_KEY,
      JSON.stringify({ seed: 'x', units: [], difficulty: 'impossible', mix: 'chaos', pinnedAt: 1 }),
    )
    expect(readPinnedExercise()).toBeNull()
  })

  it('clears the pin', () => {
    writePinnedExercise({ seed: 'abc', units: ['review'], difficulty: 'easy', mix: 'balanced' })
    clearPinnedExercise()

    expect(readPinnedExercise()).toBeNull()
  })
})
