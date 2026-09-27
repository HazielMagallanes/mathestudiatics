import { createStore, get, set } from 'idb-keyval'

import type { MixPreference } from '@/content/select'
import type { Difficulty } from '@/content/schema'
import {
  capHistory,
  isHistoryEntry,
  mergeHistory,
  type HistoryEntry,
  type HistoryStatus,
} from '@/features/practice/history/history-utils'

const HISTORY_KEY = 'entries'
const store = createStore('mathestudiatics', 'practice-history')

export async function listHistory(): Promise<HistoryEntry[]> {
  const stored = await get<unknown>(HISTORY_KEY, store)

  if (!Array.isArray(stored)) {
    return []
  }

  return capHistory(stored.filter(isHistoryEntry))
}

async function saveHistory(entries: readonly HistoryEntry[]): Promise<HistoryEntry[]> {
  const next = capHistory(entries)
  await set(HISTORY_KEY, next, store)

  return next
}

export interface RecordInput {
  id: string
  seed: string
  units: readonly string[]
  difficulty: Difficulty
  mix: MixPreference
}

export async function recordExercise(input: RecordInput): Promise<HistoryEntry[]> {
  const entries = await listHistory()
  const entry: HistoryEntry = {
    ...input,
    units: [...input.units],
    createdAt: Date.now(),
  }

  return saveHistory([entry, ...entries.filter((existing) => existing.id !== entry.id)])
}

export async function setEntryStatus(id: string, status: HistoryStatus): Promise<HistoryEntry[]> {
  const entries = await listHistory()

  return saveHistory(entries.map((entry) => (entry.id === id ? { ...entry, status } : entry)))
}

export async function clearHistory(): Promise<HistoryEntry[]> {
  return saveHistory([])
}

export async function exportHistory(): Promise<string> {
  const entries = await listHistory()

  return JSON.stringify({ version: 1, entries }, null, 2)
}

export async function importHistory(
  json: string,
): Promise<{ entries: HistoryEntry[]; imported: number }> {
  let parsed: unknown

  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid history file: not valid JSON')
  }

  const rawEntries =
    typeof parsed === 'object' && parsed !== null && 'entries' in parsed ? parsed.entries : parsed

  if (!Array.isArray(rawEntries)) {
    throw new Error('Invalid history file: missing entries array')
  }

  const incoming = rawEntries.filter(isHistoryEntry)

  if (incoming.length === 0) {
    throw new Error('Invalid history file: no valid entries')
  }

  const merged = mergeHistory(await listHistory(), incoming)
  await saveHistory(merged)

  return { entries: merged, imported: incoming.length }
}
