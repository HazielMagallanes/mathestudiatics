import { step, textAnswer } from '@/content/blocks/answers'
import {
  allValuations,
  evaluateFormula,
  formulaLatex,
  formulaVariables,
  randomFormulaOfType,
  type FormulaType,
  type LogicFormula,
  type LogicVariable,
} from '@/content/blocks/logic'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, LocalizedText } from '@/content/schema'

const CLASSIFICATION_LABELS: Record<FormulaType, LocalizedText> = {
  tautology: { es: 'Tautología', en: 'Tautology' },
  contradiction: { es: 'Contradicción', en: 'Contradiction' },
  contingency: { es: 'Contingencia', en: 'Contingency' },
}

const CLASSIFICATION_LATEX: Record<FormulaType, LocalizedText> = {
  tautology: { es: '\\text{Tautología}', en: '\\text{Tautology}' },
  contradiction: { es: '\\text{Contradicción}', en: '\\text{Contradiction}' },
  contingency: { es: '\\text{Contingencia}', en: '\\text{Contingency}' },
}

function truthTableLatex(formula: LogicFormula, variables: readonly LogicVariable[]): string {
  const alignment = `${'c|'.repeat(variables.length)}c`
  const header = [...variables, formulaLatex(formula)].join(' & ')
  const rows = allValuations(variables).map((valuation) =>
    [
      ...variables.map((name) => (valuation[name] ? 'V' : 'F')),
      evaluateFormula(formula, valuation) ? 'V' : 'F',
    ].join(' & '),
  )

  return `\\begin{array}{${alignment}} ${header} \\\\ \\hline ${rows.join(' \\\\ ')} \\end{array}`
}

export const truthTableClassify: ExerciseGenerator = {
  id: 'logic.truth-table.classify',
  units: ['logic'],
  difficulty: 'medium',
  tags: ['truth-tables'],
  generate(rng: Rng): ExerciseContent {
    const variables: LogicVariable[] = rng.bool(0.7) ? ['p', 'q'] : ['p', 'q', 'r']
    const type = rng.pick(['tautology', 'contradiction', 'contingency'] as const)
    const formula = randomFormulaOfType(rng, variables, type)
    const usedVariables = formulaVariables(formula)
    const label = CLASSIFICATION_LABELS[type]

    return {
      parts: [
        {
          prompt: template(
            'Confeccioná la tabla de verdad y clasificá: {{formula}}',
            'Build the truth table and classify: {{formula}}',
            { formula: `$${formulaLatex(formula)}$` },
          ),
          answer: textAnswer(type, CLASSIFICATION_LATEX[type].en, {
            latexByLocale: CLASSIFICATION_LATEX[type],
          }),
          steps: [
            step(
              'Comparamos todas las combinaciones de valores',
              'Check every combination of values',
              truthTableLatex(formula, usedVariables),
            ),
            step(
              `La fórmula es siempre ${label.es.toLowerCase()}`,
              `The formula is always a ${label.en.toLowerCase()}`,
              '',
            ),
          ],
        },
      ],
    }
  },
}
