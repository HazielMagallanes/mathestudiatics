import type { Fraction } from '@/content/blocks/fractions'

/** Formats a reduced fraction as LaTeX (`-3/2` → `-\frac{3}{2}`). */
export function fractionLatex(fraction: Fraction): string {
  const { numerator, denominator } = fraction

  if (denominator === 1) {
    return String(numerator)
  }

  const sign = numerator < 0 ? '-' : ''
  const absoluteNumerator = Math.abs(numerator)

  return `${sign}\\frac{${String(absoluteNumerator)}}{${String(denominator)}}`
}

/** `coefficient√radicand`, omitting parts that are 1. */
export function radicalLatex(coefficient: number, radicand: number): string {
  const sign = coefficient < 0 ? '-' : ''
  const absoluteCoefficient = Math.abs(coefficient)

  if (radicand === 1) {
    return `${sign}${String(absoluteCoefficient)}`
  }

  const prefix = absoluteCoefficient === 1 ? '' : String(absoluteCoefficient)

  return `${sign}${prefix}\\sqrt{${String(radicand)}}`
}

export function powerLatex(base: string, exponent: string | number): string {
  return `${base}^{${String(exponent)}}`
}

export function logLatex(base: string | number, argument: string): string {
  return `\\log_{${String(base)}}\\left(${argument}\\right)`
}

export function naturalLogLatex(argument: string): string {
  return `\\ln\\left(${argument}\\right)`
}

export interface IntervalBounds {
  from: number | null
  to: number | null
  fromInclusive: boolean
  toInclusive: boolean
}

export function intervalLatex(bounds: IntervalBounds): string {
  const left = bounds.from === null ? '(' : bounds.fromInclusive ? '[' : '('
  const right = bounds.to === null ? ')' : bounds.toInclusive ? ']' : ')'
  const from = bounds.from === null ? '-\\infty' : String(bounds.from)
  const to = bounds.to === null ? '+\\infty' : String(bounds.to)

  return `\\left${left}${from},\\, ${to}\\right${right}`
}

export function setLatex(values: readonly number[], options?: { empty?: string }): string {
  if (values.length === 0) {
    return options?.empty ?? '\\varnothing'
  }

  return `\\left\\{${values.join(',\\, ')}\\right\\}`
}

/**
 * Rewrites an integer as a squared factor times the remaining radicand:
 * `72 → { outside: 6, inside: 2 }` because 72 = 6² · 2.
 */
export function extractSquareFactor(radicand: number): { outside: number; inside: number } {
  if (radicand < 0) {
    throw new RangeError('extractSquareFactor expects a non-negative radicand')
  }

  let outside = 1
  let inside = radicand

  for (let factor = 2; factor * factor <= inside; factor += 1) {
    while (inside % (factor * factor) === 0) {
      inside /= factor * factor
      outside *= factor
    }
  }

  return { outside, inside }
}
