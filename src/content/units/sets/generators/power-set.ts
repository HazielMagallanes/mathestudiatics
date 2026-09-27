import { integerAnswer, step } from '@/content/blocks/answers'
import { randomIntegerSet, subsetCounts } from '@/content/blocks/sets'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator } from '@/content/schema'

const KINDS = ['subsets', 'proper', 'containing'] as const
type PowerSetKind = (typeof KINDS)[number]

export const powerSetCount: ExerciseGenerator = {
  id: 'sets.power-set',
  units: ['sets'],
  difficulty: 'hard',
  tags: ['power-set'],
  generate(rng: Rng): ExerciseContent {
    const set = randomIntegerSet(rng, { size: rng.int(3, 5), min: -4, max: 8 })
    const kind: PowerSetKind = rng.pick(KINDS)
    const element = rng.pick(set)
    const counts = subsetCounts(set.length)
    const latexSet = `\\left\\{${set.join(',\\, ')}\\right\\}`

    const promptByKind: Record<PowerSetKind, { es: string; en: string }> = {
      subsets: {
        es: '¿Cuántos subconjuntos tiene $A$?',
        en: 'How many subsets does $A$ have?',
      },
      proper: {
        es: '¿Cuántos subconjuntos propios tiene $A$?',
        en: 'How many proper subsets does $A$ have?',
      },
      containing: {
        es: `¿Cuántos subconjuntos de $A$ contienen al elemento ${String(element)}?`,
        en: `How many subsets of $A$ contain the element ${String(element)}?`,
      },
    }

    const answerByKind: Record<PowerSetKind, number> = {
      subsets: counts.subsets,
      proper: counts.properSubsets,
      containing: 2 ** (set.length - 1),
    }

    const steps = [
      step(
        'Cada elemento puede estar o no en el subconjunto',
        'Each element can be in the subset or not',
        `2^{${String(set.length)}} = ${String(counts.subsets)}`,
      ),
    ]

    if (kind === 'proper') {
      steps.push(
        step(
          'Quitamos el subconjunto igual a A',
          'Exclude the subset equal to A',
          `${String(counts.subsets)} - 1 = ${String(counts.properSubsets)}`,
        ),
      )
    }

    if (kind === 'containing') {
      steps.push(
        step(
          'El elemento elegido queda fijo; los demás son libres',
          'The chosen element is fixed; the others are free',
          `2^{${String(set.length - 1)}} = ${String(2 ** (set.length - 1))}`,
        ),
      )
    }

    return {
      parts: [
        {
          prompt: template(
            `Dado $A = ${latexSet}$. ${promptByKind[kind].es}`,
            `Given $A = ${latexSet}$. ${promptByKind[kind].en}`,
            {
              A: latexSet,
              size: set.length,
              kind,
              element,
            },
          ),
          answer: integerAnswer(answerByKind[kind]),
          steps,
        },
      ],
    }
  },
}
