import type { MixPreference } from '@/content/select'
import type { Difficulty } from '@/content/schema'

export const HISTORY_LIMIT = 200

export type HistoryStatus = 'solved' | 'review'

export interface HistoryEntry {
  /** Exercise id: `<generator>:<seed>`. */
  id: string
  seed: string
  units: string[]
  difficulty: Difficulty
  mix: MixPreference
  createdAt: number
  status?: HistoryStatus
}

export function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.seed === 'string' &&
    Array.isArray(candidate.units) &&
    candidate.units.every((unit) => typeof unit === 'string') &&
    typeof candidate.difficulty === 'string' &&
    typeof candidate.createdAt === 'number' &&
    (candidate.status === undefined ||
      candidate.status === 'solved' ||
      candidate.status === 'review')
  )
}

/** Newest first, at most `limit` entries. */
export function capHistory(
  entries: readonly HistoryEntry[],
  limit = HISTORY_LIMIT,
): HistoryEntry[] {
  return [...entries].sort((left, right) => right.createdAt - left.createdAt).slice(0, limit)
}

/**
 * Merges two histories by exercise id. When an entry appears in both, the
 * one carrying a self-assessment status wins; otherwise the newest wins.
 */
export function mergeHistory(
  existing: readonly HistoryEntry[],
  incoming: readonly HistoryEntry[],
): HistoryEntry[] {
  const byId = new Map<string, HistoryEntry>()

  for (const entry of [...existing, ...incoming]) {
    const current = byId.get(entry.id)

    if (!current) {
      byId.set(entry.id, entry)
      continue
    }

    if (current.status && !entry.status) {
      byId.set(entry.id, { ...current, createdAt: Math.max(current.createdAt, entry.createdAt) })
      continue
    }

    if (!current.status && entry.status) {
      byId.set(entry.id, { ...entry, createdAt: Math.max(current.createdAt, entry.createdAt) })
      continue
    }

    byId.set(entry.id, current.createdAt >= entry.createdAt ? current : entry)
  }

  return capHistory([...byId.values()])
}

export interface HistoryStats {
  total: number
  solved: number
  review: number
  byUnit: Record<string, number>
  byDifficulty: Record<Difficulty, number>
}

export function historyStats(entries: readonly HistoryEntry[]): HistoryStats {
  const stats: HistoryStats = {
    total: entries.length,
    solved: 0,
    review: 0,
    byUnit: {},
    byDifficulty: { easy: 0, medium: 0, hard: 0 },
  }

  for (const entry of entries) {
    if (entry.status === 'solved') {
      stats.solved += 1
    } else if (entry.status === 'review') {
      stats.review += 1
    }

    stats.byDifficulty[entry.difficulty] += 1

    for (const unit of entry.units) {
      stats.byUnit[unit] = (stats.byUnit[unit] ?? 0) + 1
    }
  }

  return stats
}
