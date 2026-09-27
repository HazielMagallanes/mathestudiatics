import {
  addFractions,
  commonDenominatorFactors,
  divideFractions,
  multiplyFractions,
  simplifyFraction,
  subtractFractions,
  type Fraction,
} from '@/content/blocks/fractions'
import { fractionLatex } from '@/content/blocks/latex'
import { nonZeroInt } from '@/content/blocks/random'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, LocalizedAnswer } from '@/content/schema'

import { fractionAnswer, step } from './shared'

type AddSubtractOperator = '+' | '-'
type MultiplyDivideOperator = '·' | ':'

function randomFraction(rng: Rng, maxDenominator: number, integer = false): Fraction {
  if (integer) {
    return { numerator: nonZeroInt(rng, 2, 9), denominator: 1 }
  }

  const denominator = rng.int(2, maxDenominator)

  return { numerator: nonZeroInt(rng, 1, denominator - 1), denominator }
}

function addSubtractSteps(
  left: Fraction,
  operator: AddSubtractOperator,
  right: Fraction,
): { result: Fraction; steps: LocalizedAnswer[] } {
  const factors = commonDenominatorFactors(left, right)
  const scaledLeft = {
    numerator: left.numerator * factors.leftFactor,
    denominator: factors.denominator,
  }
  const scaledRight = {
    numerator: right.numerator * factors.rightFactor,
    denominator: factors.denominator,
  }
  const rawResult =
    operator === '+'
      ? addFractions(scaledLeft, scaledRight)
      : subtractFractions(scaledLeft, scaledRight)
  const simplified = simplifyFraction(rawResult.numerator, rawResult.denominator)
  const steps: LocalizedAnswer[] = []

  if (factors.leftFactor !== 1 || factors.rightFactor !== 1) {
    steps.push(
      step(
        'Buscamos un denominador común',
        'Find a common denominator',
        `${fractionLatex(scaledLeft)} ${operator} ${fractionLatex(scaledRight)}`,
      ),
    )
  }

  steps.push(step('Operamos', 'Compute', fractionLatex(rawResult)))

  if (
    rawResult.numerator !== simplified.numerator ||
    rawResult.denominator !== simplified.denominator
  ) {
    steps.push(step('Simplificamos', 'Simplify', fractionLatex(simplified)))
  }

  return { result: simplified, steps }
}

function multiplyDivideSteps(
  left: Fraction,
  operator: MultiplyDivideOperator,
  right: Fraction,
): { result: Fraction; steps: LocalizedAnswer[] } {
  const steps: LocalizedAnswer[] = []

  if (operator === ':') {
    steps.push(
      step(
        'Invertimos el divisor y multiplicamos',
        'Invert the divisor and multiply',
        `${fractionLatex(left)} \\cdot ${fractionLatex({ numerator: right.denominator, denominator: right.numerator })}`,
      ),
    )
  }

  const result = operator === '·' ? multiplyFractions(left, right) : divideFractions(left, right)

  steps.push(
    step(
      operator === '·' ? 'Multiplicamos' : 'Multiplicamos cruzado',
      operator === '·' ? 'Multiply' : 'Multiply across',
      fractionLatex(result),
    ),
  )

  return { result, steps }
}

export const operationsAddSubtract: ExerciseGenerator = {
  id: 'review.operations.add-subtract',
  units: ['review'],
  difficulty: 'easy',
  tags: ['fractions'],
  generate(rng: Rng): ExerciseContent {
    const left = randomFraction(rng, 6, rng.bool(0.3))
    const right = randomFraction(rng, 6, !left.denominator && rng.bool(0.2))
    const operator: AddSubtractOperator = rng.bool() ? '+' : '-'
    const { result, steps } = addSubtractSteps(left, operator, right)

    return {
      parts: [
        {
          prompt: template(
            'Calculá y simplificá: {{expression}}',
            'Compute and simplify: {{expression}}',
            {
              expression: `$${fractionLatex(left)} ${operator} ${fractionLatex(right)}$`,
            },
          ),
          answer: fractionAnswer(result),
          steps,
        },
      ],
    }
  },
}

export const operationsAddSubtractChained: ExerciseGenerator = {
  id: 'review.operations.add-subtract-chained',
  units: ['review'],
  difficulty: 'medium',
  tags: ['fractions'],
  generate(rng: Rng): ExerciseContent {
    const [first, second, third] = [
      randomFraction(rng, 12, rng.bool(0.2)),
      randomFraction(rng, 12),
      randomFraction(rng, 12),
    ] as const
    const [firstOperator, secondOperator] = [
      rng.bool() ? '+' : '-',
      rng.bool() ? '+' : '-',
    ] as const

    const firstStep = addSubtractSteps(first, firstOperator, second)
    const secondStep = addSubtractSteps(firstStep.result, secondOperator, third)

    return {
      parts: [
        {
          prompt: template(
            'Calculá y simplificá: {{expression}}',
            'Compute and simplify: {{expression}}',
            {
              expression: `$${fractionLatex(first)} ${firstOperator} ${fractionLatex(second)} ${secondOperator} ${fractionLatex(third)}$`,
            },
          ),
          answer: fractionAnswer(secondStep.result),
          steps: [...firstStep.steps, ...secondStep.steps],
        },
      ],
    }
  },
}

export const operationsMultiplyDivide: ExerciseGenerator = {
  id: 'review.operations.multiply-divide',
  units: ['review'],
  difficulty: 'medium',
  tags: ['fractions'],
  generate(rng: Rng): ExerciseContent {
    const left = randomFraction(rng, 10)
    const right = randomFraction(rng, 10)
    const operator: MultiplyDivideOperator = rng.bool() ? '·' : ':'
    const { result, steps } = multiplyDivideSteps(left, operator, right)

    return {
      parts: [
        {
          prompt: template(
            'Calculá y simplificá: {{expression}}',
            'Compute and simplify: {{expression}}',
            {
              expression: `$${fractionLatex(left)} ${operator} ${fractionLatex(right)}$`,
            },
          ),
          answer: fractionAnswer(result),
          steps,
        },
      ],
    }
  },
}

export const operationsChained: ExerciseGenerator = {
  id: 'review.operations.chained',
  units: ['review'],
  difficulty: 'hard',
  tags: ['fractions'],
  generate(rng: Rng): ExerciseContent {
    const [first, second, third] = [
      randomFraction(rng, 9),
      randomFraction(rng, 9),
      randomFraction(rng, 9),
    ] as const
    const outerOperator: MultiplyDivideOperator = rng.bool() ? '·' : ':'
    const innerOperator: AddSubtractOperator = rng.bool() ? '+' : '-'

    const group = addSubtractSteps(second, innerOperator, third)
    // Dividing by a zero group would be invalid: fall back to multiplication.
    const safeOuterOperator: MultiplyDivideOperator =
      outerOperator === ':' && group.result.numerator === 0 ? '·' : outerOperator
    const outer = multiplyDivideSteps(first, safeOuterOperator, group.result)

    return {
      parts: [
        {
          prompt: template(
            'Calculá y simplificá: {{expression}}',
            'Compute and simplify: {{expression}}',
            {
              expression: `$${fractionLatex(first)} ${safeOuterOperator} \\left(${fractionLatex(second)} ${innerOperator} ${fractionLatex(third)}\\right)$`,
            },
          ),
          answer: fractionAnswer(outer.result),
          steps: [
            step(
              'Resolvemos primero el paréntesis',
              'Solve the parentheses first',
              `${fractionLatex(second)} ${innerOperator} ${fractionLatex(third)} = ${fractionLatex(group.result)}`,
            ),
            ...group.steps,
            step(
              'Ahora la operación exterior',
              'Now the outer operation',
              `${fractionLatex(first)} ${safeOuterOperator} ${fractionLatex(group.result)}`,
            ),
            ...outer.steps,
          ],
        },
      ],
    }
  },
}
