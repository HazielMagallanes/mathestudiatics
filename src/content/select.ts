import type { Rng } from '@/content/rng'
import type { Difficulty, ExerciseGenerator, UnitId } from '@/content/schema'

export const MIX_PREFERENCES = ['balanced', 'single', 'combined'] as const

/**
 * How the selector balances regular and combined generators when two units
 * are selected:
 * - `single`: only one-unit exercises,
 * - `combined`: only combined exercises (falls back to single when none exist),
 * - `balanced`: single-unit exercises favoured at ~60%.
 */
export type MixPreference = (typeof MIX_PREFERENCES)[number]

export function isMixPreference(value: unknown): value is MixPreference {
  return typeof value === 'string' && (MIX_PREFERENCES as readonly string[]).includes(value)
}

export interface GeneratorQuery {
  units: readonly UnitId[]
  difficulty: Difficulty
}

/** Generators whose units are all part of the selection, at this difficulty. */
export function eligibleGenerators(
  generators: readonly ExerciseGenerator[],
  query: GeneratorQuery,
): ExerciseGenerator[] {
  return generators.filter(
    (generator) =>
      generator.difficulty === query.difficulty &&
      generator.units.every((unitId) => query.units.includes(unitId)),
  )
}

export function selectGenerator(
  generators: readonly ExerciseGenerator[],
  query: GeneratorQuery,
  rng: Rng,
  mix: MixPreference = 'balanced',
): ExerciseGenerator | null {
  const eligible = eligibleGenerators(generators, query)

  if (eligible.length === 0) {
    return null
  }

  const singleUnit = eligible.filter((generator) => generator.units.length === 1)
  const combined = eligible.filter((generator) => generator.units.length > 1)

  const preferredPool = (): ExerciseGenerator[] => {
    switch (mix) {
      case 'single':
        return singleUnit.length > 0 ? singleUnit : eligible
      case 'combined':
        return combined.length > 0 ? combined : singleUnit.length > 0 ? singleUnit : eligible
      case 'balanced':
        if (singleUnit.length > 0 && combined.length > 0) {
          return rng.next() < 0.6 ? singleUnit : combined
        }
        return eligible
    }
  }

  return rng.pick(preferredPool())
}
