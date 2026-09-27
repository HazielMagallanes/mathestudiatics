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

const TARGETS: readonly ExactValue[] = [
  { kind: 'rational', fraction: { numerator: 1, denominator: 2 } },
  { kind: 'rational', fraction: { numerator: -1, denominator: 2 } },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 2 }, radicand: 2 },
  { kind: 'radical', coefficient: { numerator: -1, denominator: 2 }, radicand: 2 },
  { kind: 'radical', coefficient: { numerator: 1, denominator: 2 }, radicand: 3 },
  { kind: 'rational', fraction: { numerator: 0, denominator: 1 } },
  { kind: 'rational', fraction: { numerator: 1, denominator: 1 } },
  { kind: 'rational', fraction: { numerator: -1, denominator: 1 } },
]

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

function solutionSet(
  fn: TrigFunction,
  target: ExactValue,
): { numerator: number; denominator: number }[] {
  return specialAngles().filter((angle) => exactEquals(evaluate(fn, angle), target))
}

function setLatex(angles: readonly { numerator: number; denominator: number }[]): string {
  if (angles.length === 0) {
    return '\\varnothing'
  }

  return `\\left\\{${angles.map((angle) => piFractionLatex(angle.numerator, angle.denominator)).join(',\\; ')}\\right\\}`
}

export const trigSolutionSets: ExerciseGenerator = {
  id: 'combined.sets-trigonometry.solution-sets',
  units: ['sets', 'trigonometry'],
  difficulty: 'hard',
  tags: ['combined', 'equations'],
  generate(rng: Rng): ExerciseContent {
    const fn: TrigFunction = rng.pick(FUNCTIONS)
    const target = rng.pick(TARGETS)
    const solutions = solutionSet(fn, target)
    const useIntersection = rng.bool(0.5)

    if (useIntersection) {
      for (let attempt = 0; attempt < 25; attempt += 1) {
        const secondFn: TrigFunction = rng.pick(FUNCTIONS)
        const secondTarget = rng.pick(TARGETS)
        const secondSolutions = solutionSet(secondFn, secondTarget)
        const intersection = solutions.filter((angle) =>
          secondSolutions.some(
            (other) => angle.numerator * other.denominator === other.numerator * angle.denominator,
          ),
        )

        if (intersection.length > 0 && secondSolutions.length > 0) {
          const params: TemplateParams = {
            S: setLatex(solutions),
            T: setLatex(secondSolutions),
            firstFunction: fn,
            secondFunction: secondFn,
            firstTarget: exactCanonical(target),
            secondTarget: exactCanonical(secondTarget),
            kind: 'intersection',
          }
          const canonical = intersection.map((angle) => piMultipleCanonical(angle)).join(',')

          return {
            parts: [
              {
                prompt: template(
                  'Dados $S = {{S}}$ y $T = {{T}}$, hallá $S \\cap T$',
                  'Given $S = {{S}}$ and $T = {{T}}$, find $S \\cap T$',
                  params,
                ),
                answer: textAnswer(canonical, setLatex(intersection)),
                steps: [
                  step(
                    'Comparamos los ángulos que aparecen en ambos conjuntos',
                    'Compare the angles that appear in both sets',
                    setLatex(intersection),
                  ),
                ],
              },
            ],
          }
        }
      }
    }

    const params: TemplateParams = {
      functionLatex: FUNCTION_LATEX[fn],
      valueLatex: exactLatex(target),
      functionName: fn,
      targetCanonical: exactCanonical(target),
      kind: 'extension',
    }

    return {
      parts: [
        {
          prompt: template(
            'Escribí por extensión el conjunto $S = \\left\\{x \\in \\left[0, 2\\pi\\right): {{functionLatex}}\\left(x\\right) = {{valueLatex}}\\right\\}$',
            'Write by extension the set $S = \\left\\{x \\in \\left[0, 2\\pi\\right): {{functionLatex}}\\left(x\\right) = {{valueLatex}}\\right\\}$',
            params,
          ),
          answer: textAnswer(
            solutions.map((angle) => piMultipleCanonical(angle)).join(','),
            setLatex(solutions),
          ),
          steps: [
            step(
              'Buscamos los ángulos del intervalo con ese valor',
              'Find the angles in the interval with that value',
              setLatex(solutions),
            ),
          ],
        },
      ],
    }
  },
}

export default [trigSolutionSets] satisfies readonly ExerciseGenerator[]
