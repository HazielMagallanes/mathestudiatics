import { booleanAnswer, step } from '@/content/blocks/answers'
import {
  evaluateFormula,
  formulaLatex,
  randomFormula,
  type LogicFormula,
  type LogicVariable,
  type Valuation,
} from '@/content/blocks/logic'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, LocalizedAnswer } from '@/content/schema'

function truth(value: boolean): string {
  return value ? 'V' : 'F'
}

function valuationLatex(variables: readonly LogicVariable[], valuation: Valuation): string {
  return variables.map((name) => `${name} = ${truth(valuation[name])}`).join(',\\; ')
}

/** One step per compound subformula, in evaluation order. */
function evaluationSteps(formula: LogicFormula, valuation: Valuation): LocalizedAnswer[] {
  const steps: LocalizedAnswer[] = []

  const visit = (node: LogicFormula): boolean => {
    switch (node.kind) {
      case 'variable':
        return evaluateFormula(node, valuation)
      case 'not': {
        const value = visit(node.operand)
        steps.push(step('Negamos', 'Negate', `${formulaLatex(node)} = ${truth(!value)}`))
        return !value
      }
      default: {
        visit(node.left)
        visit(node.right)
        const value = evaluateFormula(node, valuation)
        steps.push(
          step(
            'Evaluamos la conectiva',
            'Evaluate the connective',
            `${formulaLatex(node)} = ${truth(value)}`,
          ),
        )
        return value
      }
    }
  }

  visit(formula)

  return steps
}

export const connectivesTruthValue: ExerciseGenerator = {
  id: 'logic.connectives.truth-value',
  units: ['logic'],
  difficulty: 'easy',
  tags: ['connectives'],
  generate(rng: Rng): ExerciseContent {
    const variables: LogicVariable[] = rng.bool(0.5) ? ['p', 'q'] : ['p', 'q', 'r']
    const formula = randomFormula(rng, variables, 2)
    const valuation = {} as Valuation

    for (const name of variables) {
      valuation[name] = rng.bool()
    }

    return {
      parts: [
        {
          prompt: template(
            'Sabiendo que {{valuation}}, hallá el valor de verdad de {{formula}}',
            'Given {{valuation}}, find the truth value of {{formula}}',
            {
              valuation: `$${valuationLatex(variables, valuation)}$`,
              formula: `$${formulaLatex(formula)}$`,
            },
          ),
          answer: booleanAnswer(evaluateFormula(formula, valuation)),
          steps: [
            step(
              'Reemplazamos cada variable por su valor',
              'Replace each variable by its value',
              valuationLatex(variables, valuation),
            ),
            ...evaluationSteps(formula, valuation),
          ],
        },
      ],
    }
  },
}
