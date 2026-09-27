import { nonZeroInt } from '@/content/blocks/random'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, LocalizedAnswer } from '@/content/schema'

import { fractionAnswer, step } from './shared'

/** `3x`, `-x`, `x` */
function linearTermLatex(coefficient: number): string {
  if (coefficient === 1) {
    return 'x'
  }

  if (coefficient === -1) {
    return '-x'
  }

  return `${String(coefficient)}x`
}

/** `3x + 5`, `3x - 5`, `3x` */
function linearBinomialLatex(coefficient: number, constant: number): string {
  if (constant === 0) {
    return linearTermLatex(coefficient)
  }

  const sign = constant > 0 ? '+' : '-'

  return `${linearTermLatex(coefficient)} ${sign} ${String(Math.abs(constant))}`
}

function signedNumberLatex(value: number): string {
  return value < 0 ? `\\left(${String(value)}\\right)` : String(value)
}

export const linearEquationBasic: ExerciseGenerator = {
  id: 'review.linear-equations.basic',
  units: ['review'],
  difficulty: 'easy',
  tags: ['equations'],
  generate(rng: Rng): ExerciseContent {
    const solution = nonZeroInt(rng, -6, 6)
    const coefficient = rng.int(2, 6)
    const constant = nonZeroInt(rng, -9, 9)
    const rightSide = coefficient * solution + constant

    return {
      parts: [
        {
          prompt: template(
            'Resolvé la ecuación: {{equation}}',
            'Solve the equation: {{equation}}',
            {
              equation: `$${linearBinomialLatex(coefficient, constant)} = ${String(rightSide)}$`,
            },
          ),
          answer: fractionAnswer({ numerator: solution, denominator: 1 }),
          steps: [
            step(
              'Restamos el término independiente',
              'Subtract the constant term',
              `${linearTermLatex(coefficient)} = ${String(rightSide)} - ${signedNumberLatex(constant)} = ${String(coefficient * solution)}`,
            ),
            step(
              'Dividimos por el coeficiente',
              'Divide by the coefficient',
              `x = \\frac{${String(coefficient * solution)}}{${String(coefficient)}} = ${String(solution)}`,
            ),
          ],
        },
      ],
    }
  },
}

export const linearEquationBothSides: ExerciseGenerator = {
  id: 'review.linear-equations.both-sides',
  units: ['review'],
  difficulty: 'medium',
  tags: ['equations'],
  generate(rng: Rng): ExerciseContent {
    const leftCoefficient = rng.int(2, 7)
    let rightCoefficient = rng.int(1, 7)

    while (rightCoefficient === leftCoefficient) {
      rightCoefficient = rng.int(1, 7)
    }

    const leftConstant = nonZeroInt(rng, -9, 9)
    let rightConstant = nonZeroInt(rng, -9, 9)

    while (rightConstant === leftConstant) {
      rightConstant = nonZeroInt(rng, -9, 9)
    }

    const numerator = rightConstant - leftConstant
    const denominator = leftCoefficient - rightCoefficient
    const coefficientDifference = leftCoefficient - rightCoefficient
    const steps: LocalizedAnswer[] = [
      step(
        'Agrupamos los términos con x',
        'Group the x terms',
        `${linearTermLatex(coefficientDifference)} = ${String(numerator)}`,
      ),
    ]

    return {
      parts: [
        {
          prompt: template(
            'Resolvé la ecuación: {{equation}}',
            'Solve the equation: {{equation}}',
            {
              equation: `$${linearBinomialLatex(leftCoefficient, leftConstant)} = ${linearBinomialLatex(rightCoefficient, rightConstant)}$`,
            },
          ),
          answer: fractionAnswer({ numerator, denominator }),
          steps,
        },
      ],
    }
  },
}

export const linearEquationParentheses: ExerciseGenerator = {
  id: 'review.linear-equations.parentheses',
  units: ['review'],
  difficulty: 'hard',
  tags: ['equations'],
  generate(rng: Rng): ExerciseContent {
    const coefficient = rng.int(2, 6)
    const solution = nonZeroInt(rng, -5, 5)
    const innerConstant = nonZeroInt(rng, -6, 6)
    const outerConstant = nonZeroInt(rng, -9, 9)
    const rightSide = coefficient * (solution + innerConstant) - outerConstant

    return {
      parts: [
        {
          prompt: template(
            'Resolvé la ecuación: {{equation}}',
            'Solve the equation: {{equation}}',
            {
              equation: `$${String(coefficient)}\\left(x ${innerConstant > 0 ? '+' : '-'} ${String(Math.abs(innerConstant))}\\right) ${outerConstant > 0 ? '-' : '+'} ${String(Math.abs(outerConstant))} = ${String(rightSide)}$`,
            },
          ),
          answer: fractionAnswer({ numerator: solution, denominator: 1 }),
          steps: [
            step(
              'Distribuimos',
              'Distribute',
              `${linearBinomialLatex(coefficient, coefficient * innerConstant)} ${outerConstant > 0 ? '-' : '+'} ${String(Math.abs(outerConstant))} = ${String(rightSide)}`,
            ),
            step(
              'Despejamos',
              'Isolate',
              `${linearTermLatex(coefficient)} = ${String(coefficient * (solution + innerConstant))} \\Rightarrow x = ${String(solution)}`,
            ),
          ],
        },
      ],
    }
  },
}
