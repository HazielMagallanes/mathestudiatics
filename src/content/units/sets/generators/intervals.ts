import { intervalAnswer, step } from '@/content/blocks/answers'
import { intervalLatex, type IntervalBounds } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

const OPERATIONS = ['intersection', 'union', 'difference'] as const
type IntervalOperation = (typeof OPERATIONS)[number]

const OPERATION_LATEX: Record<IntervalOperation, string> = {
  intersection: '\\cap',
  union: '\\cup',
  difference: '\\setminus',
}

interface Interval extends IntervalBounds {
  from: number
  to: number
}

function intervalParams(prefix: 'a' | 'b', interval: Interval): TemplateParams {
  return {
    [`${prefix}From`]: interval.from,
    [`${prefix}To`]: interval.to,
    [`${prefix}FromInclusive`]: interval.fromInclusive ? 1 : 0,
    [`${prefix}ToInclusive`]: interval.toInclusive ? 1 : 0,
  }
}

function unionOf(a: Interval, b: Interval): Interval {
  const from = Math.min(a.from, b.from)
  const to = Math.max(a.to, b.to)

  return {
    from,
    to,
    fromInclusive:
      a.from < b.from
        ? a.fromInclusive
        : b.from < a.from
          ? b.fromInclusive
          : a.fromInclusive || b.fromInclusive,
    toInclusive:
      a.to > b.to ? a.toInclusive : b.to > a.to ? b.toInclusive : a.toInclusive || b.toInclusive,
  }
}

function intersectionOf(a: Interval, b: Interval): Interval {
  const from = Math.max(a.from, b.from)
  const to = Math.min(a.to, b.to)

  return {
    from,
    to,
    fromInclusive:
      a.from > b.from
        ? a.fromInclusive
        : b.from > a.from
          ? b.fromInclusive
          : a.fromInclusive && b.fromInclusive,
    toInclusive:
      a.to < b.to ? a.toInclusive : b.to < a.to ? b.toInclusive : a.toInclusive && b.toInclusive,
  }
}

function resolveOperation(
  rng: Rng,
  operation: IntervalOperation,
  a: Interval,
): { b: Interval; result: Interval } {
  switch (operation) {
    case 'intersection': {
      const from = rng.int(a.from + 1, a.to - 1)
      const to = rng.int(from + 1, a.to)
      const b: Interval = {
        from,
        to,
        fromInclusive: rng.bool(),
        toInclusive: rng.bool(),
      }

      return { b, result: intersectionOf(a, b) }
    }
    case 'union': {
      // Start strictly inside A so the union is always a single interval.
      const from = rng.int(a.from + 1, a.to - 1)
      const to = rng.int(from + 1, from + 6)
      const b: Interval = {
        from,
        to,
        fromInclusive: rng.bool(),
        toInclusive: rng.bool(),
      }

      return { b, result: unionOf(a, b) }
    }
    case 'difference': {
      // B starts before A and ends inside it, so A − B stays a single interval.
      const from = rng.int(a.from - 5, a.from - 1)
      const to = rng.int(a.from, a.to - 1)
      const b: Interval = {
        from,
        to,
        fromInclusive: rng.bool(),
        toInclusive: rng.bool(),
      }
      const result: Interval = {
        from: to,
        to: a.to,
        // The cut point stays in A − B only if A contains it and B does not.
        fromInclusive: (to > a.from || a.fromInclusive) && !b.toInclusive,
        toInclusive: a.toInclusive,
      }

      return { b, result }
    }
  }
}

export const intervalOperations: ExerciseGenerator = {
  id: 'sets.intervals.operations',
  units: ['sets'],
  difficulty: 'hard',
  tags: ['intervals', 'operations'],
  generate(rng: Rng): ExerciseContent {
    const a: Interval = {
      from: rng.int(-6, -1),
      to: 0,
      fromInclusive: rng.bool(),
      toInclusive: rng.bool(),
    }
    a.to = a.from + rng.int(4, 8)

    const operation: IntervalOperation = rng.pick(OPERATIONS)
    const { b, result } = resolveOperation(rng, operation, a)

    const params: TemplateParams = {
      A: intervalLatex(a),
      B: intervalLatex(b),
      operation,
      ...intervalParams('a', a),
      ...intervalParams('b', b),
    }

    return {
      parts: [
        {
          prompt: template(
            'Dados $A = {{A}}$ y $B = {{B}}$, hallá $A {{symbol}} B$',
            'Given $A = {{A}}$ and $B = {{B}}$, find $A {{symbol}} B$',
            { ...params, symbol: OPERATION_LATEX[operation] },
          ),
          answer: intervalAnswer(result),
          steps: [
            step(
              'Ubicamos los extremos de ambos intervalos',
              'Locate the endpoints of both intervals',
              `A = ${intervalLatex(a)},\\; B = ${intervalLatex(b)}`,
            ),
            step(
              'Resolvemos la operación y cuidamos la inclusión de los extremos',
              'Resolve the operation, minding endpoint inclusion',
              intervalLatex(result),
            ),
          ],
        },
      ],
    }
  },
}
