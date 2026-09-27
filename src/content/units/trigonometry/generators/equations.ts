import { step, textAnswer } from '@/content/blocks/answers'
import {
  cosExact,
  exactCanonical,
  exactEquals,
  exactLatex,
  piMultipleCanonical,
  sinExact,
  specialAngles,
  tanExact,
  type ExactValue,
} from '@/content/blocks/exact-trigonometry'
import { piFractionLatex } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

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

const SIN_TARGETS: readonly ExactValue[] = [
  { kind: 'rational', fraction: { numerator: 1, denominator: 2 } },
  { kind: 'rational', fraction: { numerator: -1, denominator: 2 } },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 2 }, radicand: 2 },
  { kind: 'radical', coefficient: { numerator: -1, denominator: 2 }, radicand: 2 },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 2 }, radicand: 3 },
  { kind: 'rational', fraction: { numerator: 1, denominator: 1 } },
  { kind: 'rational', fraction: { numerator: 0, denominator: 1 } },
]

const COS_TARGETS: readonly ExactValue[] = [
  { kind: 'rational', fraction: { numerator: 1, denominator: 2 } },
  { kind: 'rational', fraction: { numerator: -1, denominator: 2 } },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 2 }, radicand: 2 },
  { kind: 'radical', coefficient: { numerator: -1, denominator: 2 }, radicand: 2 },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 2 }, radicand: 3 },
  { kind: 'rational', fraction: { numerator: 0, denominator: 1 } },
  { kind: 'rational', fraction: { numerator: 1, denominator: 1 } },
]

const TAN_TARGETS: readonly ExactValue[] = [
  { kind: 'rational', fraction: { numerator: 1, denominator: 1 } },
  { kind: 'rational', fraction: { numerator: -1, denominator: 1 } },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 1 }, radicand: 3 },
  { kind: 'radical', coefficient: { numerator: -1, denominator: 1 }, radicand: 3 },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 3 }, radicand: 3 },
  { kind: 'rational', fraction: { numerator: 0, denominator: 1 } },
]

function targetList(fn: TrigFunction): readonly ExactValue[] {
  switch (fn) {
    case 'sin':
      return SIN_TARGETS
    case 'cos':
      return COS_TARGETS
    case 'tan':
      return TAN_TARGETS
  }
}

export const trigEquations: ExerciseGenerator = {
  id: 'trigonometry.equations',
  units: ['trigonometry'],
  difficulty: 'hard',
  tags: ['equations'],
  generate(rng: Rng): ExerciseContent {
    const fn: TrigFunction = rng.pick(FUNCTIONS)
    const target = rng.pick(targetList(fn))
    const solutions = specialAngles().filter((angle) => exactEquals(evaluate(fn, angle), target))
    const solutionLatex = solutions
      .map((angle) => piFractionLatex(angle.numerator, angle.denominator))
      .join(',\\; ')
    const canonical = solutions.map((angle) => piMultipleCanonical(angle)).join(',')
    const valueLatex = exactLatex(target)
    const params: TemplateParams = {
      fn: FUNCTION_LATEX[fn],
      functionName: fn,
      valueLatex,
      targetCanonical: exactCanonical(target),
      solutions: solutionLatex,
    }

    return {
      parts: [
        {
          prompt: template(
            'Resolvé en $\\left[0, 2\\pi\\right)$: ${{fn}}\\left(x\\right) = {{valueLatex}}$',
            'Solve in $\\left[0, 2\\pi\\right)$: ${{fn}}\\left(x\\right) = {{valueLatex}}$',
            params,
          ),
          answer: textAnswer(canonical, `\\left\\{${solutionLatex}\\right\\}`),
          steps: [
            step(
              'Buscamos los ángulos de la circunferencia con ese valor',
              'Find the unit-circle angles with that value',
              `x = ${solutionLatex}`,
            ),
            step(
              'Verificamos que estén en el intervalo pedido',
              'Check that they lie in the requested interval',
              `\\left[0, 2\\pi\\right)`,
            ),
          ],
        },
      ],
    }
  },
}
