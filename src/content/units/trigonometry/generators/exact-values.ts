import { fractionAnswer, integerAnswer, step, textAnswer } from '@/content/blocks/answers'
import {
  cosExact,
  exactLatex,
  sinExact,
  specialAngles,
  tanExact,
  type ExactValue,
} from '@/content/blocks/exact-trigonometry'
import { piFractionLatex } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type {
  ExerciseContent,
  ExerciseGenerator,
  LocalizedAnswer,
  TemplateParams,
} from '@/content/schema'

const FUNCTIONS = ['sin', 'cos', 'tan'] as const
type TrigFunction = (typeof FUNCTIONS)[number]

const FUNCTION_LATEX: Record<TrigFunction, string> = {
  sin: '\\sin',
  cos: '\\cos',
  tan: '\\tan',
}

function evaluate(fn: TrigFunction, angle: { numerator: number; denominator: number }): ExactValue {
  switch (fn) {
    case 'sin':
      return sinExact(angle)
    case 'cos':
      return cosExact(angle)
    case 'tan':
      return tanExact(angle)
  }
}

function exactAnswer(value: ExactValue): LocalizedAnswer {
  switch (value.kind) {
    case 'undefined':
      return textAnswer('undefined', '\\text{no definido}', {
        latexByLocale: { es: '\\text{no definido}', en: '\\text{undefined}' },
      })
    case 'rational':
      return value.fraction.denominator === 1
        ? integerAnswer(value.fraction.numerator)
        : fractionAnswer(value.fraction)
    case 'radical':
      return {
        latex: exactLatex(value),
        value: {
          kind: 'radical',
          coefficient: value.coefficient.numerator / value.coefficient.denominator,
          radicand: value.radicand,
        },
      }
  }
}

export const exactValues: ExerciseGenerator = {
  id: 'trigonometry.exact-values',
  units: ['trigonometry'],
  difficulty: 'medium',
  tags: ['exact-values', 'unit-circle'],
  generate(rng: Rng): ExerciseContent {
    const fn: TrigFunction = rng.pick(FUNCTIONS)
    const angle = rng.pick(specialAngles())
    const value = evaluate(fn, angle)
    const params: TemplateParams = {
      fn: FUNCTION_LATEX[fn],
      angle: piFractionLatex(angle.numerator, angle.denominator),
      angleNumerator: angle.numerator,
      angleDenominator: angle.denominator,
      functionName: fn,
    }

    return {
      parts: [
        {
          prompt: template(
            'Calculá el valor exacto de ${{fn}}\\left({{angle}}\\right)$',
            'Compute the exact value of ${{fn}}\\left({{angle}}\\right)$',
            params,
          ),
          answer: exactAnswer(value),
          steps: [
            step(
              'Ubicamos el ángulo en la circunferencia unitaria',
              'Locate the angle on the unit circle',
              piFractionLatex(angle.numerator, angle.denominator),
            ),
            step('Leemos el valor exacto', 'Read the exact value', exactLatex(value)),
          ],
        },
      ],
    }
  },
}
