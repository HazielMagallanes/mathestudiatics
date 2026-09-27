import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, LocalizedTemplate } from '@/content/schema'

import { integerAnswer, step } from './shared'

const BASES = [2, 3, 5, 10] as const

function logTemplate(base: number, argumentLatex: string): LocalizedTemplate {
  return template('Calculá el logaritmo: {{expression}}', 'Compute the logarithm: {{expression}}', {
    expression: `$\\log_{${String(base)}}\\left(${argumentLatex}\\right)$`,
  })
}

export const logarithmsDefinition: ExerciseGenerator = {
  id: 'review.logarithms.definition',
  units: ['review'],
  difficulty: 'easy',
  tags: ['logarithms'],
  generate(rng: Rng): ExerciseContent {
    const base = rng.pick(BASES)
    const exponent = rng.int(1, 4)
    const argument = base ** exponent

    return {
      parts: [
        {
          prompt: logTemplate(base, String(argument)),
          answer: integerAnswer(exponent),
          steps: [
            step(
              'Nos preguntamos a qué exponente elevar la base',
              'Ask which exponent of the base gives the argument',
              `${String(base)}^{${String(exponent)}} = ${String(argument)}`,
            ),
          ],
        },
      ],
    }
  },
}

export const logarithmsNegative: ExerciseGenerator = {
  id: 'review.logarithms.negative',
  units: ['review'],
  difficulty: 'medium',
  tags: ['logarithms'],
  generate(rng: Rng): ExerciseContent {
    const base = rng.pick(BASES)
    const exponent = rng.int(1, 4)
    const argument = base ** exponent

    return {
      parts: [
        {
          prompt: logTemplate(base, `\\frac{1}{${String(argument)}}`),
          answer: integerAnswer(-exponent),
          steps: [
            step(
              'Escribimos la fracción como potencia negativa',
              'Write the fraction as a negative power',
              `${String(base)}^{-${String(exponent)}} = \\frac{1}{${String(argument)}}`,
            ),
            step('El resultado es el exponente', 'The result is the exponent', String(-exponent)),
          ],
        },
      ],
    }
  },
}

export const logarithmsCombined: ExerciseGenerator = {
  id: 'review.logarithms.combined',
  units: ['review'],
  difficulty: 'hard',
  tags: ['logarithms'],
  generate(rng: Rng): ExerciseContent {
    const base = rng.pick(BASES)
    const exponent = rng.int(1, 3)
    const coefficient = rng.int(2, 3)
    const combine = rng.bool()

    if (combine) {
      const total = exponent * coefficient
      const argument = base ** exponent

      return {
        parts: [
          {
            prompt: template('Calculá: {{expression}}', 'Compute: {{expression}}', {
              expression: `$${String(coefficient)} \\cdot \\log_{${String(base)}}\\left(${String(argument)}\\right)$`,
            }),
            answer: integerAnswer(total),
            steps: [
              step(
                'El coeficiente pasa como exponente del argumento',
                'The coefficient becomes the exponent of the argument',
                `\\log_{${String(base)}}\\left(${String(argument)}^{${String(coefficient)}}\\right)`,
              ),
              step('Resolvemos el logaritmo', 'Evaluate the logarithm', String(total)),
            ],
          },
        ],
      }
    }

    const firstArgument = base ** exponent
    const secondArgument = base ** coefficient
    const quotientLog = exponent - coefficient

    return {
      parts: [
        {
          prompt: template('Calculá: {{expression}}', 'Compute: {{expression}}', {
            expression: `$\\log_{${String(base)}}\\left(${String(firstArgument)}\\right) - \\log_{${String(base)}}\\left(${String(secondArgument)}\\right)$`,
          }),
          answer: integerAnswer(quotientLog),
          steps: [
            step(
              'La resta de logaritmos es el logaritmo del cociente',
              'The difference of logarithms is the log of the quotient',
              `\\log_{${String(base)}}\\left(\\frac{${String(firstArgument)}}{${String(secondArgument)}}\\right)`,
            ),
            step('Resolvemos el logaritmo', 'Evaluate the logarithm', String(quotientLog)),
          ],
        },
      ],
    }
  },
}
