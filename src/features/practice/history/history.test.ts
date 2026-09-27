import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearHistory,
  exportHistory,
  importHistory,
  listHistory,
  recordExercise,
  setEntryStatus,
} from '@/features/practice/history/history'

const base = {
  units: ['logic'],
  difficulty: 'easy',
  mix: 'balanced',
} as const

beforeEach(async () => {
  await clearHistory()
})

describe('history store', () => {
  it('records exercises and lists them newest first', async () => {
    await recordExercise({ ...base, id: 'a:1', seed: '1' })
    await recordExercise({ ...base, id: 'b:2', seed: '2' })

    const entries = await listHistory()

    expect(entries.map((entry) => entry.id)).toEqual(['b:2', 'a:1'])
  })

  it('deduplicates by exercise id', async () => {
    await recordExercise({ ...base, id: 'a:1', seed: '1' })
    await recordExercise({ ...base, id: 'a:1', seed: '1' })

    expect(await listHistory()).toHaveLength(1)
  })

  it('updates the self-assessment status', async () => {
    await recordExercise({ ...base, id: 'a:1', seed: '1' })
    await setEntryStatus('a:1', 'solved')

    expect((await listHistory())[0]?.status).toBe('solved')
  })

  it('exports and re-imports the history', async () => {
    await recordExercise({ ...base, id: 'a:1', seed: '1' })
    await setEntryStatus('a:1', 'review')

    const json = await exportHistory()
    await clearHistory()

    const { imported, entries } = await importHistory(json)

    expect(imported).toBe(1)
    expect(entries[0]?.status).toBe('review')
    expect(await listHistory()).toHaveLength(1)
  })

  it('rejects malformed imports', async () => {
    await expect(importHistory('not json')).rejects.toThrow(/not valid JSON/)
    await expect(importHistory('{"entries":[{"bad":true}]}')).rejects.toThrow(/no valid entries/)
    await expect(importHistory('{"version":1}')).rejects.toThrow(/missing entries array/)
  })
})
