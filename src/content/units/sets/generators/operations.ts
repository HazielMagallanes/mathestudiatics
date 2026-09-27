import { integerAnswer, setAnswer, step } from '@/content/blocks/answers'
import {
  difference,
  intersection,
  randomIntegerSet,
  symmetricDifference,
  union,
  type IntegerSet,
} from '@/content/blocks/sets'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator } from '@/content/schema'

const OPERATIONS = ['intersection', 'union', 'difference', 'symmetric'] as const
type SetOperation = (typeof OPERATIONS)[number]

const OPERATION_LATEX: Record<SetOperation, string> = {
  intersection: '\\cap',
  union: '\\cup',
  difference: '\\setminus',
  symmetric: '\\triangle',
}

const OPERATION_NAMES: Record<SetOperation, { es: string; en: string }> = {
  intersection: { es: 'intersección', en: 'intersection' },
  union: { es: 'unión', en: 'union' },
  difference: { es: 'diferencia', en: 'difference' },
  symmetric: { es: 'diferencia simétrica', en: 'symmetric difference' },
}

function applyOperation(operation: SetOperation, left: IntegerSet, right: IntegerSet): number[] {
  switch (operation) {
    case 'intersection':
      return intersection(left, right)
    case 'union':
      return union(left, right)
    case 'difference':
      return difference(left, right)
    case 'symmetric':
      return symmetricDifference(left, right)
  }
}

function setLatex(values: IntegerSet): string {
  return `\\left\\{${values.join(',\\, ')}\\right\\}`
}

export const setOperations: ExerciseGenerator = {
  id: 'sets.operations',
  units: ['sets'],
  difficulty: 'medium',
  tags: ['operations'],
  generate(rng: Rng): ExerciseContent {
    const setA = randomIntegerSet(rng, { size: rng.int(4, 6), min: -5, max: 9 })
    const setB = randomIntegerSet(rng, { size: rng.int(4, 6), min: -3, max: 11 })
    const operation: SetOperation = rng.pick(OPERATIONS)
    const result = applyOperation(operation, setA, setB)
    const names = OPERATION_NAMES[operation]

    return {
      parts: [
        {
          prompt: template(
            'Dados $A = {{A}}$ y $B = {{B}}$, hallá $A {{symbol}} B$',
            'Given $A = {{A}}$ and $B = {{B}}$, find $A {{symbol}} B$',
            {
              A: setLatex(setA),
              B: setLatex(setB),
              symbol: OPERATION_LATEX[operation],
              operation,
            },
          ),
          answer: setAnswer(result),
          steps: [
            step(
              `La ${names.es} reúne los elementos según la definición`,
              `The ${names.en} collects the elements by definition`,
              result.length > 0 ? result.join(',\\; ') : '\\varnothing',
            ),
          ],
        },
      ],
    }
  },
}

export const setCardinality: ExerciseGenerator = {
  id: 'sets.cardinality',
  units: ['sets'],
  difficulty: 'medium',
  tags: ['cardinality'],
  generate(rng: Rng): ExerciseContent {
    const setA = randomIntegerSet(rng, { size: rng.int(4, 7), min: -5, max: 9 })
    const setB = randomIntegerSet(rng, { size: rng.int(3, 6), min: -3, max: 11 })
    const operation: SetOperation = rng.pick(['union', 'difference', 'symmetric'])
    const result = applyOperation(operation, setA, setB)

    return {
      parts: [
        {
          prompt: template(
            'Dados $A = {{A}}$ y $B = {{B}}$, calculá $\\left|A {{symbol}} B\\right|$',
            'Given $A = {{A}}$ and $B = {{B}}$, compute $\\left|A {{symbol}} B\\right|$',
            {
              A: setLatex(setA),
              B: setLatex(setB),
              symbol: OPERATION_LATEX[operation],
              operation,
            },
          ),
          answer: integerAnswer(result.length),
          steps: [
            step(
              'Escribimos el conjunto resultante',
              'Write the resulting set',
              result.length > 0 ? result.join(',\\; ') : '\\varnothing',
            ),
            step('Contamos sus elementos', 'Count its elements', String(result.length)),
          ],
        },
      ],
    }
  },
}
