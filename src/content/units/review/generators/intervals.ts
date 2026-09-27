import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, LocalizedText } from '@/content/schema'

import { intervalAnswer, step } from '@/content/blocks/answers'

type Comparison = '\\lt' | '\\gt' | '\\le' | '\\ge'

const COMPARISONS: readonly Comparison[] = ['\\lt', '\\gt', '\\le', '\\ge']

interface ResolvedInequality {
  from: number | null
  to: number | null
  fromInclusive: boolean
  toInclusive: boolean
}

function comparisonIncludesBound(comparison: Comparison): boolean {
  return comparison === '\\le' || comparison === '\\ge'
}

function solveLinear(
  coefficient: number,
  constant: number,
  rightSide: number,
  comparison: Comparison,
) {
  const bound = (rightSide - constant) / coefficient
  const includes = comparisonIncludesBound(comparison)
  const pointsUp = comparison === '\\gt' || comparison === '\\ge'

  return pointsUp
    ? { from: bound, to: null, fromInclusive: includes, toInclusive: false }
    : { from: null, to: bound, fromInclusive: false, toInclusive: includes }
}

const INFINITY_NOTE: LocalizedText = {
  es: 'El infinito nunca se incluye: se escribe con paréntesis.',
  en: 'Infinity is never included: it is written with a parenthesis.',
}

export const intervalsExpress: ExerciseGenerator = {
  id: 'review.intervals.express',
  units: ['review'],
  difficulty: 'easy',
  tags: ['intervals'],
  generate(rng: Rng): ExerciseContent {
    const useSimple = rng.bool(0.6)
    let statementLatex: string
    let answer: ResolvedInequality
    let extraNote: LocalizedText

    if (useSimple) {
      const comparison = rng.pick(COMPARISONS)
      const bound = rng.int(-6, 8)
      const includes = comparisonIncludesBound(comparison)
      const pointsUp = comparison === '\\gt' || comparison === '\\ge'
      statementLatex = `x ${comparison} ${String(bound)}`
      answer = pointsUp
        ? { from: bound, to: null, fromInclusive: includes, toInclusive: false }
        : { from: null, to: bound, fromInclusive: false, toInclusive: includes }
      extraNote = {
        es: 'El extremo finito lleva corchete si la desigualdad es ≤ o ≥, y paréntesis si es < o >.',
        en: 'The finite endpoint gets a bracket for ≤ or ≥, and a parenthesis for < or >.',
      }
    } else {
      const lower = rng.int(-8, 4)
      const upper = lower + rng.int(2, 8)
      const lowerInclusive = rng.bool()
      const upperInclusive = rng.bool()
      statementLatex = `${String(lower)} ${lowerInclusive ? '\\le' : '\\lt'} x ${upperInclusive ? '\\le' : '\\lt'} ${String(upper)}`
      answer = {
        from: lower,
        to: upper,
        fromInclusive: lowerInclusive,
        toInclusive: upperInclusive,
      }
      extraNote = {
        es: 'Los extremos que aparecen en la desigualdad se incluyen o no según el signo.',
        en: 'Each endpoint is included exactly when its comparison allows it.',
      }
    }

    const steps = [
      step(
        'Leemos los extremos y sus signos',
        'Read the endpoints and their signs',
        statementLatex,
      ),
    ]

    steps.push(step(extraNote.es, extraNote.en, ''))

    if (answer.from === null || answer.to === null) {
      steps.push(step(INFINITY_NOTE.es, INFINITY_NOTE.en, ''))
    }

    return {
      parts: [
        {
          prompt: template(
            'Escribí como intervalo: {{inequality}}',
            'Write as an interval: {{inequality}}',
            {
              inequality: `$${statementLatex}$`,
            },
          ),
          answer: intervalAnswer(answer),
          steps,
        },
      ],
    }
  },
}

export const intervalsSolve: ExerciseGenerator = {
  id: 'review.intervals.solve',
  units: ['review'],
  difficulty: 'medium',
  tags: ['intervals', 'equations'],
  generate(rng: Rng): ExerciseContent {
    const comparison = rng.pick(COMPARISONS)
    const coefficient = rng.int(2, 6)
    const bound = rng.int(-6, 6)
    const constant = rng.int(-9, 9)
    const rightSide = coefficient * bound + constant
    const inequalityLatex = `${String(coefficient)}x ${constant > 0 ? '+' : '-'} ${String(Math.abs(constant))} ${comparison} ${String(rightSide)}`
    const solution = solveLinear(coefficient, constant, rightSide, comparison)

    return {
      parts: [
        {
          prompt: template(
            'Resolvé y expresá como intervalo: {{inequality}}',
            'Solve and write as an interval: {{inequality}}',
            {
              inequality: `$${inequalityLatex}$`,
            },
          ),
          answer: intervalAnswer(solution),
          steps: [
            step(
              'Restamos el término independiente',
              'Subtract the constant term',
              `${String(coefficient)}x ${comparison} ${String(rightSide - constant)}`,
            ),
            step(
              'Dividimos por el coeficiente (positivo: no cambia el sentido)',
              'Divide by the (positive) coefficient: the comparison does not flip',
              `x ${comparison} ${String(bound)}`,
            ),
          ],
        },
      ],
    }
  },
}

export const intervalsCompound: ExerciseGenerator = {
  id: 'review.intervals.compound',
  units: ['review'],
  difficulty: 'hard',
  tags: ['intervals', 'equations'],
  generate(rng: Rng): ExerciseContent {
    const coefficient = rng.int(2, 5)
    const constant = rng.int(-7, 7)
    const lower = rng.int(-6, 2)
    const upper = lower + rng.int(2, 7)
    const lowerInclusive = rng.bool()
    const upperInclusive = rng.bool()
    const lowerSide = coefficient * lower + constant
    const upperSide = coefficient * upper + constant
    const inequalityLatex = `${String(lowerSide)} ${lowerInclusive ? '\\le' : '\\lt'} ${String(coefficient)}x ${constant > 0 ? '+' : '-'} ${String(Math.abs(constant))} ${upperInclusive ? '\\le' : '\\lt'} ${String(upperSide)}`

    return {
      parts: [
        {
          prompt: template(
            'Resolvé y expresá como intervalo: {{inequality}}',
            'Solve and write as an interval: {{inequality}}',
            {
              inequality: `$${inequalityLatex}$`,
            },
          ),
          answer: intervalAnswer({
            from: lower,
            to: upper,
            fromInclusive: lowerInclusive,
            toInclusive: upperInclusive,
          }),
          steps: [
            step(
              'Restamos el término independiente en los tres miembros',
              'Subtract the constant term from all three members',
              `${String(lowerSide - constant)} ${lowerInclusive ? '\\le' : '\\lt'} ${String(coefficient)}x ${upperInclusive ? '\\le' : '\\lt'} ${String(upperSide - constant)}`,
            ),
            step(
              'Dividimos por el coeficiente positivo',
              'Divide by the positive coefficient',
              `${String(lower)} ${lowerInclusive ? '\\le' : '\\lt'} x ${upperInclusive ? '\\le' : '\\lt'} ${String(upper)}`,
            ),
          ],
        },
      ],
    }
  },
}
