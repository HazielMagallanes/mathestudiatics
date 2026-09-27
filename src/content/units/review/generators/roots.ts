import { extractSquareFactor } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator } from '@/content/schema'

import { fractionAnswer, integerAnswer, radicalAnswer, step } from '@/content/blocks/answers'

function isSquareFree(value: number): boolean {
  for (let factor = 2; factor * factor <= value; factor += 1) {
    if (value % (factor * factor) === 0) {
      return false
    }
  }

  return true
}

export const rootsExact: ExerciseGenerator = {
  id: 'review.roots.exact',
  units: ['review'],
  difficulty: 'easy',
  tags: ['roots'],
  generate(rng: Rng): ExerciseContent {
    const useCube = rng.bool(0.35)
    const root = useCube ? rng.int(2, 5) : rng.int(2, 12)
    const radicand = useCube ? root ** 3 : root ** 2

    return {
      parts: [
        {
          prompt: template('Calculá: {{expression}}', 'Compute: {{expression}}', {
            expression: `$\\sqrt${useCube ? '[3]' : ''}{${String(radicand)}}$`,
          }),
          answer: integerAnswer(root),
          steps: [
            step(
              'Buscamos el número que elevado a la raíz da el radicando',
              'Find the number whose power equals the radicand',
              `${String(root)}${useCube ? '^3' : '^2'} = ${String(radicand)}`,
            ),
          ],
        },
      ],
    }
  },
}

export const rootsSimplify: ExerciseGenerator = {
  id: 'review.roots.simplify',
  units: ['review'],
  difficulty: 'medium',
  tags: ['roots'],
  generate(rng: Rng): ExerciseContent {
    const coefficient = rng.int(2, 6)
    let radicand = rng.int(2, 15)

    while (!isSquareFree(radicand) || radicand === 1) {
      radicand = rng.int(2, 15)
    }

    const value = coefficient * coefficient * radicand
    const extracted = extractSquareFactor(value)

    return {
      parts: [
        {
          prompt: template(
            'Extraé factores y simplificá: {{expression}}',
            'Extract factors and simplify: {{expression}}',
            {
              expression: `$\\sqrt{${String(value)}}$`,
            },
          ),
          answer: radicalAnswer(extracted.outside, extracted.inside),
          steps: [
            step(
              'Escribimos el radicando como producto de un cuadrado',
              'Write the radicand as a square times a remainder',
              `${String(value)} = ${String(coefficient * coefficient)} \\cdot ${String(radicand)}`,
            ),
            step(
              'Separamos la raíz del cuadrado',
              'Split the square root',
              `\\sqrt{${String(coefficient * coefficient)}} \\cdot \\sqrt{${String(radicand)}}`,
            ),
            step(
              'Resolvemos',
              'Evaluate',
              `${String(extracted.outside)}\\sqrt{${String(extracted.inside)}}`,
            ),
          ],
        },
      ],
    }
  },
}

export const rootsRationalExponent: ExerciseGenerator = {
  id: 'review.roots.rational-exponent',
  units: ['review'],
  difficulty: 'hard',
  tags: ['roots', 'powers'],
  generate(rng: Rng): ExerciseContent {
    const root = rng.int(2, 6)
    const square = root * root

    return {
      parts: [
        {
          prompt: template('Calculá: {{expression}}', 'Compute: {{expression}}', {
            expression: `$${String(square)}^{-\\frac{1}{2}}$`,
          }),
          answer: fractionAnswer({ numerator: 1, denominator: root }),
          steps: [
            step(
              'Un exponente negativo invierte la base',
              'A negative exponent inverts the base',
              `\\frac{1}{${String(square)}^{\\frac{1}{2}}}`,
            ),
            step(
              'La raíz cuadrada del radicando es la base',
              'The square root is the base',
              `\\frac{1}{${String(root)}}`,
            ),
          ],
        },
      ],
    }
  },
}
