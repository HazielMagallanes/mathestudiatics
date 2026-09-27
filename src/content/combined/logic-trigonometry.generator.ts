import { booleanAnswer, step } from '@/content/blocks/answers'
import {
  cosExact,
  exactCanonical,
  exactEquals,
  exactSign,
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
  { kind: 'radical', coefficient: { numerator: -1, denominator: 2 }, radicand: 3 },
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

export const quantifiedTrigTruth: ExerciseGenerator = {
  id: 'combined.logic-trigonometry.quantified',
  units: ['logic', 'trigonometry'],
  difficulty: 'hard',
  tags: ['combined', 'quantifiers'],
  generate(rng: Rng): ExerciseContent {
    const shuffled = rng.shuffle(specialAngles())
    const chosen = shuffled
      .slice(0, rng.int(3, 5))
      .sort(
        (left, right) => left.numerator * right.denominator - right.numerator * left.denominator,
      )
    const fn: TrigFunction = rng.pick(FUNCTIONS)
    const useEquality = rng.bool()
    const target = rng.pick(TARGETS)
    const isUniversal = rng.bool()
    const comparison = useEquality ? '=' : rng.pick(['\\ge', '\\lt'] as const)

    const matches = (angle: { numerator: number; denominator: number }): boolean => {
      const value = evaluate(fn, angle)

      if (useEquality) {
        return exactEquals(value, target)
      }

      const sign = exactSign(value)

      return sign === null ? false : comparison === '\\ge' ? sign >= 0 : sign < 0
    }

    const truth = isUniversal ? chosen.every(matches) : chosen.some(matches)
    const setLatex = `\\left\\{${chosen.map((angle) => piFractionLatex(angle.numerator, angle.denominator)).join(',\\; ')}\\right\\}`
    const predicateLatex = useEquality
      ? `${FUNCTION_LATEX[fn]}\\left(x\\right) = ${exactCanonical(target)}`
      : `${FUNCTION_LATEX[fn]}\\left(x\\right) ${comparison} 0`
    const params: TemplateParams = {
      A: setLatex,
      angles: chosen.map((angle) => piMultipleCanonical(angle)).join(','),
      functionName: fn,
      predicateKind: useEquality ? 'equals' : 'sign',
      targetCanonical: exactCanonical(target),
      comparison,
      isUniversal: isUniversal ? 1 : 0,
    }

    return {
      parts: [
        {
          prompt: template(
            'Dado $A = {{A}}$, determiná el valor de verdad de ${{quantifier}} x \\in A: {{predicate}}$',
            'Given $A = {{A}}$, determine the truth value of ${{quantifier}} x \\in A: {{predicate}}$',
            {
              ...params,
              quantifier: isUniversal ? '\\forall' : '\\exists',
              predicate: predicateLatex,
            },
          ),
          answer: booleanAnswer(truth),
          steps: [
            step(
              'Evaluamos la función trigonométrica en cada ángulo del conjunto',
              'Evaluate the trigonometric function at every angle in the set',
              chosen
                .map(
                  (angle) =>
                    `x = ${piFractionLatex(angle.numerator, angle.denominator)}: ${matches(angle) ? 'V' : 'F'}`,
                )
                .join(',\\; '),
            ),
          ],
        },
      ],
    }
  },
}

export default [quantifiedTrigTruth] satisfies readonly ExerciseGenerator[]
