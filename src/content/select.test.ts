import { describe, expect, it } from 'vitest'

import { generateExerciseFrom } from '@/content/generate'
import { createRng } from '@/content/rng'
import { eligibleGenerators, selectGenerator } from '@/content/select'
import type { Difficulty, ExerciseGenerator } from '@/content/schema'

function fakeGenerator(id: string, units: string[], difficulty: Difficulty): ExerciseGenerator {
  return {
    id,
    units,
    difficulty,
    tags: [],
    generate: () => ({
      parts: [
        {
          prompt: { es: id, en: id, params: {} },
          answer: { latex: '0' },
          steps: [],
        },
      ],
    }),
  }
}

const single = fakeGenerator('a.single', ['a'], 'easy')
const singleB = fakeGenerator('b.single', ['b'], 'easy')
const combined = fakeGenerator('a.b.combined', ['a', 'b'], 'easy')
const hardSingle = fakeGenerator('a.hard', ['a'], 'hard')

const generators = [single, singleB, combined, hardSingle]

describe('eligibleGenerators', () => {
  it('filters by difficulty and unit subset', () => {
    expect(eligibleGenerators(generators, { units: ['a'], difficulty: 'easy' })).toEqual([single])
    expect(eligibleGenerators(generators, { units: ['a', 'b'], difficulty: 'easy' })).toEqual([
      single,
      singleB,
      combined,
    ])
    expect(eligibleGenerators(generators, { units: ['a'], difficulty: 'hard' })).toEqual([
      hardSingle,
    ])
    expect(eligibleGenerators(generators, { units: ['b'], difficulty: 'hard' })).toEqual([])
  })

  it('excludes combined generators when only one of their units is selected', () => {
    expect(eligibleGenerators(generators, { units: ['a'], difficulty: 'easy' })).not.toContain(
      combined,
    )
  })
})

describe('selectGenerator', () => {
  it('returns null when nothing matches', () => {
    expect(
      selectGenerator(generators, { units: ['unknown'], difficulty: 'easy' }, createRng('x')),
    ).toBeNull()
  })

  it('respects the single mix preference', () => {
    const rng = createRng('mix-single')

    for (let index = 0; index < 20; index += 1) {
      const generator = selectGenerator(
        generators,
        { units: ['a', 'b'], difficulty: 'easy' },
        rng,
        'single',
      )
      expect(generator?.units).toHaveLength(1)
    }
  })

  it('respects the combined mix preference', () => {
    const rng = createRng('mix-combined')

    for (let index = 0; index < 20; index += 1) {
      const generator = selectGenerator(
        generators,
        { units: ['a', 'b'], difficulty: 'easy' },
        rng,
        'combined',
      )
      expect(generator).toBe(combined)
    }
  })

  it('falls back to single-unit generators when no combined ones exist', () => {
    const rng = createRng('fallback')

    const generator = selectGenerator(
      [single],
      { units: ['a'], difficulty: 'easy' },
      rng,
      'combined',
    )

    expect(generator).toBe(single)
  })

  it('balances both pools by default', () => {
    const seen = new Set<string>()

    for (let index = 0; index < 200; index += 1) {
      const exercise = generateExerciseFrom(generators, {
        units: ['a', 'b'],
        difficulty: 'easy',
        seed: `seed-${String(index)}`,
      })
      seen.add(exercise?.id.split(':')[0] ?? '')
    }

    expect(seen.has('a.single')).toBe(true)
    expect(seen.has('b.single')).toBe(true)
    expect(seen.has('a.b.combined')).toBe(true)
  })
})
