import { describe, expect, it } from 'vitest'

import { generateExerciseFrom } from '@/content/generate'
import type { Exercise, ExerciseGenerator, ExercisePart } from '@/content/schema'
import {
  evaluateArithmetic,
  rEquals,
  rMul,
  rPowInt,
  rToNumber,
  rational,
  solveEquation,
  solveInequality,
  type IntervalResult,
} from '@/test/latex-oracle'

import { intervalsCompound, intervalsExpress, intervalsSolve } from './generators/intervals'
import {
  linearEquationBasic,
  linearEquationBothSides,
  linearEquationParentheses,
} from './generators/linear-equations'
import {
  logarithmsCombined,
  logarithmsDefinition,
  logarithmsNegative,
} from './generators/logarithms'
import {
  operationsAddSubtract,
  operationsAddSubtractChained,
  operationsChained,
  operationsMultiplyDivide,
} from './generators/operations'
import { powersExponents, powersInteger, powersLaws, powersNegative } from './generators/powers'
import { rootsExact, rootsRationalExponent, rootsSimplify } from './generators/roots'

const SEEDS_PER_GENERATOR = 60

function generateAll(generator: ExerciseGenerator): Exercise[] {
  return Array.from({ length: SEEDS_PER_GENERATOR }, (_, index) => {
    const exercise = generateExerciseFrom([generator], {
      units: generator.units,
      difficulty: generator.difficulty,
      seed: `oracle-${String(index)}`,
    })

    if (!exercise) {
      throw new Error(`generator "${generator.id}" produced no exercise`)
    }

    return exercise
  })
}

function partOf(exercise: Exercise): ExercisePart {
  const part = exercise.parts[0]

  if (!part) {
    throw new Error('exercise has no parts')
  }

  return part
}

function param(exercise: Exercise, key: string): string {
  const value = partOf(exercise).prompt.params[key]

  if (typeof value !== 'string') {
    throw new Error(`missing string parameter "${key}"`)
  }

  return value
}

function strippedParam(exercise: Exercise, key: string): string {
  return param(exercise, key).replace(/^\$|\$$/g, '')
}

function integerAnswer(exercise: Exercise): number {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'integer') {
    throw new Error('expected an integer answer')
  }

  return value.value
}

function fractionAnswer(exercise: Exercise): { numerator: number; denominator: number } {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'fraction') {
    throw new Error('expected a fraction answer')
  }

  return { numerator: value.numerator, denominator: value.denominator }
}

function radicalAnswer(exercise: Exercise): { coefficient: number; radicand: number } {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'radical') {
    throw new Error('expected a radical answer')
  }

  return { coefficient: value.coefficient, radicand: value.radicand }
}

function intervalAnswer(exercise: Exercise): {
  from: number | null
  to: number | null
  fromInclusive: boolean
  toInclusive: boolean
} {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'interval') {
    throw new Error('expected an interval answer')
  }

  return value
}

function expectSameFraction(
  expected: { numerator: number; denominator: number },
  actual: { numerator: number; denominator: number },
): void {
  expect(
    rEquals(
      rational(expected.numerator, expected.denominator),
      rational(actual.numerator, actual.denominator),
    ),
  ).toBe(true)
}

function expectSameInterval(
  expected: IntervalResult,
  actual: ReturnType<typeof intervalAnswer>,
): void {
  expect(expected.from === null ? null : rToNumber(expected.from)).toBe(actual.from)
  expect(expected.to === null ? null : rToNumber(expected.to)).toBe(actual.to)
  expect(expected.fromInclusive).toBe(actual.fromInclusive)
  expect(expected.toInclusive).toBe(actual.toInclusive)
}

describe('review: arithmetic expressions', () => {
  const generators = [
    operationsAddSubtract,
    operationsAddSubtractChained,
    operationsMultiplyDivide,
    operationsChained,
  ]

  for (const generator of generators) {
    it(`${generator.id} matches the expression evaluated independently`, () => {
      for (const exercise of generateAll(generator)) {
        const expected = evaluateArithmetic(strippedParam(exercise, 'expression'))
        const answer = fractionAnswer(exercise)

        expect(rToNumber(expected)).toBeCloseTo(answer.numerator / answer.denominator, 10)
      }
    })
  }
})

describe('review: powers', () => {
  it('review.powers.integer and exponents match the power evaluated independently', () => {
    for (const generator of [powersInteger, powersExponents]) {
      for (const exercise of generateAll(generator)) {
        const expected = evaluateArithmetic(strippedParam(exercise, 'expression'))

        expect(rToNumber(expected)).toBe(integerAnswer(exercise))
      }
    }
  })

  it('review.powers.negative matches the inverted power', () => {
    for (const exercise of generateAll(powersNegative)) {
      const expected = evaluateArithmetic(strippedParam(exercise, 'expression'))
      const answer = fractionAnswer(exercise)

      expectSameFraction(
        { numerator: expected.numerator, denominator: expected.denominator },
        answer,
      )
    }
  })

  it('review.powers.laws matches the property-based evaluation', () => {
    for (const exercise of generateAll(powersLaws)) {
      const expected = evaluateArithmetic(strippedParam(exercise, 'expression'))

      expect(rToNumber(expected)).toBe(integerAnswer(exercise))
    }
  })
})

describe('review: roots', () => {
  it('review.roots.exact is a perfect root', () => {
    for (const exercise of generateAll(rootsExact)) {
      const expected = evaluateArithmetic(strippedParam(exercise, 'expression'))

      expect(rToNumber(expected)).toBe(integerAnswer(exercise))
    }
  })

  it('review.roots.simplify extracts the largest square factor', () => {
    for (const exercise of generateAll(rootsSimplify)) {
      const match = /^\\sqrt\{(\d+)\}$/.exec(strippedParam(exercise, 'expression'))

      expect(match, 'unexpected radical statement').not.toBeNull()

      const radicand = Number(match?.[1])
      const { coefficient, radicand: inner } = radicalAnswer(exercise)

      expect(coefficient * coefficient * inner).toBe(radicand)
      expect(coefficient).toBeGreaterThan(1)
      expect(inner).toBeGreaterThan(1)

      for (let factor = 2; factor * factor <= inner; factor += 1) {
        expect(inner % (factor * factor)).not.toBe(0)
      }
    }
  })

  it('review.roots.rational-exponent matches the root', () => {
    for (const exercise of generateAll(rootsRationalExponent)) {
      const match = /^(\d+)\^\{-\\frac\{1\}\{2\}\}$/.exec(strippedParam(exercise, 'expression'))

      expect(match, 'unexpected rational exponent statement').not.toBeNull()

      const base = Number(match?.[1])
      const root = Math.round(Math.sqrt(base))
      const answer = fractionAnswer(exercise)

      expect(root * root).toBe(base)
      expectSameFraction({ numerator: 1, denominator: root }, answer)
    }
  })
})

describe('review: logarithms', () => {
  function checkLogEquation(base: number, argumentLatex: string, exponent: number): void {
    const argument = evaluateArithmetic(argumentLatex)

    expect(rEquals(rPowInt(rational(base), exponent), argument)).toBe(true)
  }

  it('review.logarithms.definition and negative are exact powers', () => {
    for (const generator of [logarithmsDefinition, logarithmsNegative]) {
      for (const exercise of generateAll(generator)) {
        const match = /^\\log_\{(\d+)\}\\left\((.*)\\right\)$/.exec(
          strippedParam(exercise, 'expression'),
        )

        expect(match, 'unexpected logarithm statement').not.toBeNull()
        checkLogEquation(Number(match?.[1]), match?.[2] ?? '', integerAnswer(exercise))
      }
    }
  })

  it('review.logarithms.combined uses the logarithm properties', () => {
    for (const exercise of generateAll(logarithmsCombined)) {
      const expression = strippedParam(exercise, 'expression')
      const answer = integerAnswer(exercise)

      const coefficientForm = /^(\d+) \\cdot \\log_\{(\d+)\}\\left\((.*)\\right\)$/.exec(expression)

      if (coefficientForm) {
        const [, coefficient, base, argumentLatex] = coefficientForm
        const argument = evaluateArithmetic(argumentLatex ?? '')

        expect(
          rEquals(rPowInt(rational(Number(base)), answer), rPowInt(argument, Number(coefficient))),
        ).toBe(true)
        continue
      }

      const differenceForm =
        /^\\log_\{(\d+)\}\\left\((.*)\\right\) - \\log_\{(\d+)\}\\left\((.*)\\right\)$/.exec(
          expression,
        )

      expect(differenceForm, 'unexpected combined logarithm statement').not.toBeNull()

      if (!differenceForm) {
        throw new Error('unexpected combined logarithm statement')
      }

      const base = differenceForm[1] ?? ''
      const firstLatex = differenceForm[2] ?? ''
      const secondLatex = differenceForm[4] ?? ''
      const first = evaluateArithmetic(firstLatex)
      const second = evaluateArithmetic(secondLatex)

      expect(rEquals(rMul(rPowInt(rational(Number(base)), answer), second), first)).toBe(true)
    }
  })
})

describe('review: linear equations', () => {
  const generators = [linearEquationBasic, linearEquationBothSides, linearEquationParentheses]

  for (const generator of generators) {
    it(`${generator.id} solves to the answer`, () => {
      for (const exercise of generateAll(generator)) {
        const solution = solveEquation(strippedParam(exercise, 'equation'))

        expectSameFraction(
          { numerator: solution.numerator, denominator: solution.denominator },
          fractionAnswer(exercise),
        )
      }
    })
  }
})

describe('review: intervals', () => {
  const generators = [intervalsExpress, intervalsSolve, intervalsCompound]

  for (const generator of generators) {
    it(`${generator.id} solves to the interval answer`, () => {
      for (const exercise of generateAll(generator)) {
        expectSameInterval(
          solveInequality(strippedParam(exercise, 'inequality')),
          intervalAnswer(exercise),
        )
      }
    })
  }
})
