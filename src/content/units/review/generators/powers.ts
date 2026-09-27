import { nonZeroInt } from '@/content/blocks/random'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator } from '@/content/schema'

import { fractionAnswer, integerAnswer, step } from './shared'

function signedPowerLatex(base: number, exponent: number): string {
  const formattedBase = base < 0 ? `\\left(${String(base)}\\right)` : String(base)

  return `{${formattedBase}}^{${String(exponent)}}`
}

function expandedProduct(base: number, exponent: number): string {
  return Array.from({ length: exponent }, () =>
    base < 0 ? `\\left(${String(base)}\\right)` : String(base),
  ).join(' \\cdot ')
}

export const powersInteger: ExerciseGenerator = {
  id: 'review.powers.integer',
  units: ['review'],
  difficulty: 'easy',
  tags: ['powers'],
  generate(rng: Rng): ExerciseContent {
    const base = nonZeroInt(rng, -5, 5)
    const exponent = rng.int(2, 3)
    const value = base ** exponent

    return {
      parts: [
        {
          prompt: template('Calculá: {{expression}}', 'Compute: {{expression}}', {
            expression: `$${signedPowerLatex(base, exponent)}$`,
          }),
          answer: integerAnswer(value),
          steps: [
            step('Desarrollamos la potencia', 'Expand the power', expandedProduct(base, exponent)),
          ],
        },
      ],
    }
  },
}

export const powersExponents: ExerciseGenerator = {
  id: 'review.powers.exponents',
  units: ['review'],
  difficulty: 'medium',
  tags: ['powers'],
  generate(rng: Rng): ExerciseContent {
    const base = nonZeroInt(rng, -6, 6)
    const exponent = rng.int(2, 4)
    const value = base ** exponent

    return {
      parts: [
        {
          prompt: template('Calculá: {{expression}}', 'Compute: {{expression}}', {
            expression: `$${signedPowerLatex(base, exponent)}$`,
          }),
          answer: integerAnswer(value),
          steps: [
            step('Desarrollamos la potencia', 'Expand the power', expandedProduct(base, exponent)),
            step('Multiplicamos', 'Multiply', String(value)),
          ],
        },
      ],
    }
  },
}

export const powersNegative: ExerciseGenerator = {
  id: 'review.powers.negative',
  units: ['review'],
  difficulty: 'hard',
  tags: ['powers'],
  generate(rng: Rng): ExerciseContent {
    const base = nonZeroInt(rng, 2, 5)
    const exponent = rng.int(2, 4)
    const power = base ** exponent

    return {
      parts: [
        {
          prompt: template('Calculá: {{expression}}', 'Compute: {{expression}}', {
            expression: `$${signedPowerLatex(base, -exponent)}$`,
          }),
          answer: fractionAnswer({ numerator: 1, denominator: power }),
          steps: [
            step(
              'Un exponente negativo invierte la base',
              'A negative exponent inverts the base',
              `${signedPowerLatex(base, -exponent)} = \\frac{1}{${signedPowerLatex(base, exponent)}}`,
            ),
            step('Calculamos la potencia', 'Compute the power', `\\frac{1}{${String(power)}}`),
          ],
        },
      ],
    }
  },
}

export const powersLaws: ExerciseGenerator = {
  id: 'review.powers.laws',
  units: ['review'],
  difficulty: 'hard',
  tags: ['powers'],
  generate(rng: Rng): ExerciseContent {
    const base = rng.int(2, 4)
    const firstExponent = rng.int(2, 4)
    const secondExponent = rng.int(1, 3)
    const multiply = rng.bool()
    const combinedExponent = multiply
      ? firstExponent + secondExponent
      : firstExponent - secondExponent
    const value = base ** combinedExponent

    return {
      parts: [
        {
          prompt: template(
            'Calculá usando propiedades: {{expression}}',
            'Compute using properties: {{expression}}',
            {
              expression: `$${signedPowerLatex(base, firstExponent)} ${multiply ? '\\cdot' : ':'} ${signedPowerLatex(base, secondExponent)}$`,
            },
          ),
          answer: integerAnswer(value),
          steps: [
            step(
              multiply ? 'Sumamos los exponentes' : 'Restamos los exponentes',
              multiply ? 'Add the exponents' : 'Subtract the exponents',
              signedPowerLatex(base, combinedExponent),
            ),
            step('Calculamos', 'Compute', String(value)),
          ],
        },
      ],
    }
  },
}
