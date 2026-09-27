import { createRng, type Rng } from '@/content/rng'
import { allGeneratorsOf } from '@/content/registry'
import { selectGenerator, type MixPreference } from '@/content/select'
import type { Difficulty, Exercise, ExerciseGenerator, UnitId } from '@/content/schema'

export interface GenerateOptions {
  units: readonly UnitId[]
  difficulty: Difficulty
  seed: string
  mix?: MixPreference
}

export function createExerciseRng(options: {
  units: readonly UnitId[]
  difficulty: Difficulty
  seed: string
}): Rng {
  const units = [...options.units].sort((a, b) => a.localeCompare(b))

  return createRng(`mathestudiatics|${units.join(',')}|${options.difficulty}|${options.seed}`)
}

/**
 * Deterministically generates the exercise for a seed, or null when the
 * selection has no eligible generator. Used directly with synthetic
 * generators in tests.
 */
export function generateExerciseFrom(
  generators: readonly ExerciseGenerator[],
  options: GenerateOptions,
): Exercise | null {
  const rng = createExerciseRng(options)
  const generator = selectGenerator(
    generators,
    { units: options.units, difficulty: options.difficulty },
    rng,
    options.mix ?? 'balanced',
  )

  if (!generator) {
    return null
  }

  const content = generator.generate(rng)

  return {
    id: `${generator.id}:${options.seed}`,
    seed: options.seed,
    unitIds: generator.units,
    difficulty: options.difficulty,
    parts: content.parts,
    ...(content.intro ? { intro: content.intro } : {}),
  }
}

/** Generates an exercise from the whole registry; null when nothing matches. */
export function generateExercise(options: GenerateOptions): Exercise | null {
  return generateExerciseFrom(allGeneratorsOf(), options)
}
