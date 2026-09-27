import { describe, expect, it } from 'vitest'

import {
  capHistory,
  historyStats,
  isHistoryEntry,
  mergeHistory,
  type HistoryEntry,
} from '@/features/practice/history/history-utils'

function entry(id: string, overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id,
    seed: id.split(':')[1] ?? 'seed',
    units: ['logic'],
    difficulty: 'easy',
    mix: 'balanced',
    createdAt: 1_000,
    ...overrides,
  }
}

describe('capHistory', () => {
  it('sorts newest first and truncates', () => {
    const entries = [
      entry('a:1', { createdAt: 100 }),
      entry('b:2', { createdAt: 300 }),
      entry('c:3', { createdAt: 200 }),
    ]

    expect(capHistory(entries, 2).map((item) => item.id)).toEqual(['b:2', 'c:3'])
  })
})

describe('mergeHistory', () => {
  it('deduplicates by id', () => {
    const merged = mergeHistory([entry('a:1')], [entry('a:1', { createdAt: 2_000 })])

    expect(merged).toHaveLength(1)
    expect(merged[0]?.createdAt).toBe(2_000)
  })

  it('keeps the self-assessment status when the other copy lacks it', () => {
    const merged = mergeHistory(
      [entry('a:1', { status: 'solved' })],
      [entry('a:1', { createdAt: 2_000 })],
    )

    expect(merged[0]?.status).toBe('solved')
    expect(merged[0]?.createdAt).toBe(2_000)
  })

  it('prefers the copy with a status', () => {
    const merged = mergeHistory([entry('a:1')], [entry('a:1', { status: 'review' })])

    expect(merged[0]?.status).toBe('review')
  })
})

describe('historyStats', () => {
  it('counts totals, statuses, units and difficulties', () => {
    const stats = historyStats([
      entry('a:1', { units: ['logic', 'sets'], difficulty: 'hard', status: 'solved' }),
      entry('b:2', { units: ['sets'], difficulty: 'hard', status: 'review' }),
      entry('c:3', { units: ['vectors'], difficulty: 'easy' }),
    ])

    expect(stats.total).toBe(3)
    expect(stats.solved).toBe(1)
    expect(stats.review).toBe(1)
    expect(stats.byUnit).toEqual({ logic: 1, sets: 2, vectors: 1 })
    expect(stats.byDifficulty).toEqual({ easy: 1, medium: 0, hard: 2 })
  })
})

describe('isHistoryEntry', () => {
  it('accepts valid entries and rejects malformed ones', () => {
    expect(isHistoryEntry(entry('a:1'))).toBe(true)
    expect(isHistoryEntry({ id: 1 })).toBe(false)
    expect(isHistoryEntry({ ...entry('a:1'), status: 'maybe' })).toBe(false)
    expect(isHistoryEntry(null)).toBe(false)
  })
})
