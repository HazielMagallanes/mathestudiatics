import { describe, expect, it } from 'vitest'

import { formatTemplate, LOCALES, referencedParams } from '@/content/blocks/templates'
import { generateExerciseFrom } from '@/content/generate'
import { allGeneratorsOf, units } from '@/content/registry'
import {
  DIFFICULTIES,
  type Exercise,
  type ExerciseGenerator,
  type LocalizedTemplate,
} from '@/content/schema'

const SEEDS_PER_GENERATOR = 80

function seeds(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${String(index)}`)
}

function generateFrom(generator: ExerciseGenerator, seed: string): Exercise {
  const exercise = generateExerciseFrom([generator], {
    units: generator.units,
    difficulty: generator.difficulty,
    seed,
  })

  if (!exercise) {
    throw new Error(`generator "${generator.id}" produced no exercise for seed "${seed}"`)
  }

  return exercise
}

function checkTemplate(value: LocalizedTemplate, context: string): void {
  for (const locale of LOCALES) {
    const rendered = formatTemplate(value, locale)

    expect(rendered, `${context} (${locale}) must not be empty`).not.toBe('')
    expect(rendered, `${context} (${locale}) has unresolved or invalid values`).not.toMatch(
      /undefined|NaN|\{\{/,
    )

    const dollars = (rendered.match(/\$/g) ?? []).length
    expect(dollars % 2, `${context} (${locale}) has unbalanced $ delimiters`).toBe(0)
  }

  for (const key of referencedParams(value)) {
    expect(value.params, `${context} misses parameter "${key}"`).toHaveProperty(key)
  }
}

function checkLatex(latex: string, context: string): void {
  // `\text{...}` may legitimately contain words like "undefined".
  const withoutText = latex.replace(/\\text\{[^}]*\}/g, '')

  expect(withoutText, `${context} must not contain invalid values`).not.toMatch(/undefined|NaN/)

  if (latex === '') {
    return
  }

  const openBraces = (latex.match(/\{/g) ?? []).length
  const closeBraces = (latex.match(/\}/g) ?? []).length
  expect(openBraces, `${context} has unbalanced braces`).toBe(closeBraces)

  const leftDelimiters = (latex.match(/\\left/g) ?? []).length
  const rightDelimiters = (latex.match(/\\right/g) ?? []).length
  expect(leftDelimiters, `${context} has unbalanced \\left/\\right`).toBe(rightDelimiters)
}

describe('content registry', () => {
  it('has at least one unit', () => {
    expect(units.length).toBeGreaterThan(0)
  })

  it('has unique unit ids and display orders', () => {
    const ids = units.map((unit) => unit.id)
    const orders = units.map((unit) => unit.order)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(orders).size).toBe(orders.length)
  })

  it('describes every unit in both languages', () => {
    for (const unit of units) {
      expect(unit.title.es.length, `${unit.id} title.es`).toBeGreaterThan(0)
      expect(unit.title.en.length, `${unit.id} title.en`).toBeGreaterThan(0)
      expect(unit.description.es.length, `${unit.id} description.es`).toBeGreaterThan(0)
      expect(unit.description.en.length, `${unit.id} description.en`).toBeGreaterThan(0)
    }
  })

  it('has unique generator ids across the whole registry', () => {
    const ids = allGeneratorsOf().map((generator) => generator.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only references known units and never repeats one', () => {
    const known = new Set(units.map((unit) => unit.id))

    for (const generator of allGeneratorsOf()) {
      expect(
        generator.units.length,
        `${generator.id} must target at least one unit`,
      ).toBeGreaterThan(0)
      expect(new Set(generator.units).size, `${generator.id} repeats a unit`).toBe(
        generator.units.length,
      )

      for (const unitId of generator.units) {
        expect(known.has(unitId), `${generator.id} references unknown unit "${unitId}"`).toBe(true)
      }
    }
  })

  it('marks combined generators with two or more units', () => {
    for (const generator of allGeneratorsOf()) {
      if (generator.tags.includes('combined')) {
        expect(
          generator.units.length,
          `${generator.id} is combined but has one unit`,
        ).toBeGreaterThan(1)
      }
    }
  })

  it('offers every difficulty in every unit', () => {
    for (const unit of units) {
      const difficulties = new Set(unit.generators.map((generator) => generator.difficulty))

      for (const difficulty of DIFFICULTIES) {
        expect(
          difficulties.has(difficulty),
          `unit "${unit.id}" has no ${difficulty} generator`,
        ).toBe(true)
      }
    }
  })
})

describe('generator conformance', () => {
  for (const generator of allGeneratorsOf()) {
    describe(generator.id, () => {
      const exercises = seeds(generator.id, SEEDS_PER_GENERATOR).map((seed) =>
        generateFrom(generator, seed),
      )

      it('produces well-formed bilingual exercises', () => {
        for (const exercise of exercises) {
          expect(exercise.parts.length, `${generator.id} has no parts`).toBeGreaterThan(0)

          if (exercise.intro) {
            checkTemplate(exercise.intro, `${generator.id} intro`)
          }

          for (const part of exercise.parts) {
            checkTemplate(part.prompt, `${generator.id} prompt`)
            checkLatex(part.answer.latex, `${generator.id} answer`)
            expect(part.answer.latex, `${generator.id} has an empty answer`).not.toBe('')

            if (part.answer.latexByLocale) {
              for (const locale of LOCALES) {
                const localized = part.answer.latexByLocale[locale]

                expect(localized, `${generator.id} answer (${locale})`).not.toBe('')
                checkLatex(localized, `${generator.id} answer (${locale})`)
              }
            }

            for (const step of part.steps) {
              checkLatex(step.latex, `${generator.id} step`)
            }
          }
        }
      })

      it('is deterministic for a given seed', () => {
        for (const seed of seeds(`${generator.id}-determinism`, 10)) {
          const first = generateFrom(generator, seed)
          const second = generateFrom(generator, seed)

          expect(JSON.stringify(first)).toBe(JSON.stringify(second))
        }
      })

      it('varies across seeds', () => {
        const prompts = new Set(
          exercises.map((exercise) =>
            JSON.stringify({ intro: exercise.intro ?? null, parts: exercise.parts }),
          ),
        )

        expect(
          prompts.size,
          `${generator.id} produces the same exercise every time`,
        ).toBeGreaterThan(1)
      })
    })
  }
})
