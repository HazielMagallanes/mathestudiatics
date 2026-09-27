/** Independent helpers for set-based exercises. */

import type { Rational } from '@/test/latex-oracle'
import { rCompare, rational } from '@/test/latex-oracle'

/** Parses `\left\{1,\, 2,\, 3\right\}` (or `\varnothing`) into a sorted set. */
export function parseSetLatex(latex: string): number[] {
  if (latex.includes('varnothing') || latex.includes('emptyset')) {
    return []
  }

  const match = /\\left\\\{([^}]*)\\right\\\}/.exec(latex)

  if (!match) {
    throw new Error(`Sets oracle: cannot parse set "${latex}"`)
  }

  const numbers = (match[1] ?? '').match(/-?\d+/g) ?? []

  return [...new Set(numbers.map(Number))].sort((a, b) => a - b)
}

export interface IntervalSpec {
  from: number | null
  to: number | null
  fromInclusive: boolean
  toInclusive: boolean
}

export function intervalContains(interval: IntervalSpec, point: Rational): boolean {
  if (interval.from !== null) {
    const comparison = rCompare(point, rational(interval.from))

    if (comparison < 0 || (comparison === 0 && !interval.fromInclusive)) {
      return false
    }
  }

  if (interval.to !== null) {
    const comparison = rCompare(point, rational(interval.to))

    if (comparison > 0 || (comparison === 0 && !interval.toInclusive)) {
      return false
    }
  }

  return true
}

export function intervalFromParams(
  params: Record<string, string | number>,
  prefix: 'a' | 'b',
): IntervalSpec {
  const from = Number(params[`${prefix}From`])
  const to = Number(params[`${prefix}To`])

  return {
    from: Number.isFinite(from) ? from : null,
    to: Number.isFinite(to) ? to : null,
    fromInclusive: Number(params[`${prefix}FromInclusive`]) === 1,
    toInclusive: Number(params[`${prefix}ToInclusive`]) === 1,
  }
}

/** Samples points around an interval pair to compare membership independently. */
export function samplePoints(from: number, to: number): Rational[] {
  const points: Rational[] = []

  for (let step = from - 1; step <= to + 1; step += 1) {
    points.push(rational(step))
    points.push(rational(2 * step + 1, 2))
  }

  return points
}
