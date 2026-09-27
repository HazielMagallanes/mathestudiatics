import { z } from 'zod'

import { units } from '@/content/registry'
import { MIX_PREFERENCES, type MixPreference } from '@/content/select'
import type { Difficulty } from '@/content/schema'

const difficultySchema = z.enum(['easy', 'medium', 'hard']).catch('easy')
const mixSchema = z.enum(MIX_PREFERENCES).catch('balanced')
const seedSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)

const searchSchema = z.object({
  units: z.string().optional(),
  difficulty: difficultySchema.optional(),
  mix: mixSchema.optional(),
  seed: z.string().optional(),
})

export interface PracticeSelection {
  units: string[]
  difficulty: Difficulty
  mix: MixPreference
  /** null when the URL has no (valid) seed yet. */
  seed: string | null
}

export function knownUnitIds(): string[] {
  return units.map((unit) => unit.id)
}

/**
 * Parses practice URL parameters, falling back to safe defaults instead of
 * failing: unknown units are dropped, at most two are kept, invalid values
 * fall back to the defaults.
 */
export function parsePracticeSearch(search: URLSearchParams): PracticeSelection {
  const parsed = searchSchema.safeParse(Object.fromEntries(search.entries()))
  const data = parsed.success ? parsed.data : {}
  const known = new Set(knownUnitIds())
  const requested = (data.units ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
  const selected = [...new Set(requested.filter((value) => known.has(value)))].slice(0, 2)
  const fallback = knownUnitIds().slice(0, 1)
  const seed = seedSchema.safeParse(data.seed)

  return {
    units: selected.length > 0 ? selected : fallback,
    difficulty: data.difficulty ?? 'easy',
    mix: data.mix ?? 'balanced',
    seed: seed.success ? seed.data : null,
  }
}

export function buildPracticeSearch(selection: {
  units: readonly string[]
  difficulty: Difficulty
  mix: MixPreference
  seed?: string | null
}): URLSearchParams {
  const params = new URLSearchParams()

  params.set('units', selection.units.join(','))
  params.set('difficulty', selection.difficulty)
  params.set('mix', selection.mix)

  if (selection.seed) {
    params.set('seed', selection.seed)
  }

  return params
}
