import { describe, expect, it } from 'vitest'

import { generateExerciseFrom } from '@/content/generate'
import type { ExerciseGenerator } from '@/content/schema'
import { template } from '@/content/blocks/templates'

const generator: ExerciseGenerator = {
  id: 'test.generator',
  units: ['test'],
  difficulty: 'easy',
  tags: ['test'],
  generate: (rng) => ({
    intro: template('Contexto {{value}}', 'Context {{value}}', { value: rng.int(1, 9) }),
    parts: [
      {
        prompt: template('¿Cuánto es {{value}}?', 'What is {{value}}?', { value: '1 + 1' }),
        answer: { latex: '2', value: { kind: 'integer', value: 2 } },
        steps: [{ latex: '1 + 1 = 2' }],
      },
    ],
  }),
}

const options = { units: ['test'], difficulty: 'easy', seed: 'abc' } as const

describe('generateExerciseFrom', () => {
  it('is deterministic for the same seed', () => {
    const first = generateExerciseFrom([generator], options)
    const second = generateExerciseFrom([generator], options)

    expect(first).toEqual(second)
  })

  it('copies metadata from the generator', () => {
    const exercise = generateExerciseFrom([generator], options)

    expect(exercise?.id).toBe('test.generator:abc')
    expect(exercise?.seed).toBe('abc')
    expect(exercise?.unitIds).toEqual(['test'])
    expect(exercise?.difficulty).toBe('easy')
    expect(exercise?.intro).toBeDefined()
    expect(exercise?.parts).toHaveLength(1)
  })

  it('returns null when no generator matches the selection', () => {
    expect(generateExerciseFrom([generator], { ...options, units: ['other'] })).toBeNull()
    expect(generateExerciseFrom([generator], { ...options, difficulty: 'hard' })).toBeNull()
    expect(generateExerciseFrom([], options)).toBeNull()
  })

  it('produces different exercises for different seeds', () => {
    const first = generateExerciseFrom([generator], { ...options, seed: 'seed-1' })
    const second = generateExerciseFrom([generator], { ...options, seed: 'seed-2' })

    expect(first?.id).not.toBe(second?.id)
  })

  it('is reproducible with the same RNG sequence used by selection', () => {
    // Two identical runs must consume the RNG identically, even though
    // selection and generation share one stream.
    const first = generateExerciseFrom([generator], options)
    const second = generateExerciseFrom([generator], options)

    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })
})

describe('createRng seed independence', () => {
  it('keeps the seed stream stable regardless of unit order', () => {
    const a = generateExerciseFrom([generator], {
      units: ['test', 'test'],
      difficulty: 'easy',
      seed: 's',
    })
    const b = generateExerciseFrom([generator], { units: ['test'], difficulty: 'easy', seed: 's' })

    expect(a?.id).toBe(b?.id)
  })

  it('does not depend on Math.random', () => {
    const original = Math.random
    Math.random = () => {
      throw new Error('generation must not use Math.random')
    }

    try {
      expect(() => generateExerciseFrom([generator], options)).not.toThrow()
    } finally {
      Math.random = original
    }
  })
})
