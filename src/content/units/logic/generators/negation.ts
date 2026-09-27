import { step, textAnswer } from '@/content/blocks/answers'
import {
  formulaLatex,
  randomFormula,
  simplifyNegation,
  type LogicVariable,
} from '@/content/blocks/logic'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator } from '@/content/schema'

export const negationSimplify: ExerciseGenerator = {
  id: 'logic.negation.simplify',
  units: ['logic'],
  difficulty: 'medium',
  tags: ['negation', 'de-morgan'],
  generate(rng: Rng): ExerciseContent {
    const variables: LogicVariable[] = ['p', 'q']
    const formula = randomFormula(rng, variables, 2)
    const simplified = simplifyNegation({ kind: 'not', operand: formula })
    const simplifiedLatex = formulaLatex(simplified)

    return {
      parts: [
        {
          prompt: template(
            'Escribí la negación de {{formula}} sin dejar negaciones fuera de los paréntesis',
            'Write the negation of {{formula}} without leaving negations outside parentheses',
            { formula: `$${formulaLatex(formula)}$` },
          ),
          answer: textAnswer(simplifiedLatex, simplifiedLatex, {
            note: {
              es: 'Aplicamos las leyes de De Morgan y la doble negación.',
              en: 'Apply De Morgan laws and double negation.',
            },
          }),
          steps: [
            step(
              'Negamos la fórmula completa',
              'Negate the whole formula',
              `\\lnot \\left(${formulaLatex(formula)}\\right)`,
            ),
            step(
              'Distribuimos la negación hacia adentro',
              'Push the negation inwards',
              simplifiedLatex,
            ),
          ],
        },
      ],
    }
  },
}
