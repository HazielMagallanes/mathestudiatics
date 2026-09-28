import { z } from 'zod'

import { MIX_PREFERENCES } from '@/content/select'
import { readLocalStorage, writeLocalStorage } from '@/shared/storage/local-storage'

export const PINNED_STORAGE_KEY = 'mathestudiatics.pinned-exercise'

const pinnedSchema = z.object({
  seed: z.string().min(1).max(64),
  units: z.array(z.string().min(1)).min(1).max(2),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  mix: z.enum(MIX_PREFERENCES),
  pinnedAt: z.number(),
})

export type PinnedExercise = z.infer<typeof pinnedSchema>

export function readPinnedExercise(): PinnedExercise | null {
  const stored = readLocalStorage(PINNED_STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    const parsed = pinnedSchema.safeParse(JSON.parse(stored))

    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function writePinnedExercise(value: Omit<PinnedExercise, 'pinnedAt'>): PinnedExercise {
  const entry: PinnedExercise = { ...value, pinnedAt: Date.now() }

  writeLocalStorage(PINNED_STORAGE_KEY, JSON.stringify(entry))

  return entry
}

export function clearPinnedExercise(): void {
  writeLocalStorage(PINNED_STORAGE_KEY, '')
}
