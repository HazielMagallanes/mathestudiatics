import {
  addFractions,
  divideFractions,
  gcd,
  multiplyFractions,
  type Fraction,
} from '@/content/blocks/fractions'
import { fractionLatex } from '@/content/blocks/latex'

/**
 * Exact trigonometric values at multiples of π/6 and π/4.
 *
 * A value is either a rational number, a rational multiple of √2, √3 or √6,
 * or undefined (tan at odd multiples of π/2).
 */
export type ExactValue =
  | { kind: 'rational'; fraction: Fraction }
  | { kind: 'radical'; coefficient: Fraction; radicand: 2 | 3 | 6 }
  | { kind: 'undefined' }

export function exactRational(numerator: number, denominator = 1): ExactValue {
  return { kind: 'rational', fraction: { numerator, denominator } }
}

export function exactRadical(coefficient: Fraction, radicand: 2 | 3 | 6): ExactValue {
  return { kind: 'radical', coefficient, radicand }
}

export function reduceFraction(fraction: Fraction): Fraction {
  const divisor = gcd(fraction.numerator, fraction.denominator) || 1

  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor,
  }
}

export function exactLatex(value: ExactValue): string {
  switch (value.kind) {
    case 'undefined':
      return '\\text{no definido}'
    case 'rational':
      return fractionLatex(value.fraction)
    case 'radical': {
      const { coefficient, radicand } = value

      if (coefficient.numerator === 0) {
        return '0'
      }

      const radical = `\\sqrt{${String(radicand)}}`

      if (coefficient.denominator === 1) {
        const sign = coefficient.numerator < 0 ? '-' : ''
        const absolute = Math.abs(coefficient.numerator)

        return absolute === 1 ? `${sign}${radical}` : `${sign}${String(absolute)}${radical}`
      }

      return `${fractionLatex(coefficient)}${radical}`
    }
  }
}

export function exactMultiply(left: ExactValue, right: ExactValue): ExactValue {
  if (left.kind === 'undefined' || right.kind === 'undefined') {
    return { kind: 'undefined' }
  }

  if (left.kind === 'rational' && right.kind === 'rational') {
    return { kind: 'rational', fraction: multiplyFractions(left.fraction, right.fraction) }
  }

  if (left.kind === 'radical' && right.kind === 'radical') {
    const coefficient = multiplyFractions(left.coefficient, right.coefficient)

    if (left.radicand === right.radicand) {
      return {
        kind: 'rational',
        fraction: multiplyFractions(coefficient, { numerator: left.radicand, denominator: 1 }),
      }
    }

    return { kind: 'radical', coefficient, radicand: 6 }
  }

  if (left.kind === 'radical') {
    if (right.kind !== 'rational') {
      throw new Error('Unreachable: radical times radical was handled above')
    }

    const rational = right.fraction

    return {
      kind: 'radical',
      coefficient: multiplyFractions(left.coefficient, rational),
      radicand: left.radicand,
    }
  }

  const radical = right as Extract<ExactValue, { kind: 'radical' }>
  const rational = left.fraction

  return {
    kind: 'radical',
    coefficient: multiplyFractions(radical.coefficient, rational),
    radicand: radical.radicand,
  }
}

export function exactDivide(left: ExactValue, right: ExactValue): ExactValue {
  if (left.kind === 'undefined' || right.kind === 'undefined') {
    return { kind: 'undefined' }
  }

  if (right.kind === 'rational' && right.fraction.numerator === 0) {
    return { kind: 'undefined' }
  }

  if (left.kind === 'rational' && right.kind === 'rational') {
    return { kind: 'rational', fraction: divideFractions(left.fraction, right.fraction) }
  }

  if (left.kind === 'radical' && right.kind === 'rational') {
    return {
      kind: 'radical',
      coefficient: divideFractions(left.coefficient, right.fraction),
      radicand: left.radicand,
    }
  }

  if (left.kind === 'rational' && right.kind === 'radical') {
    // a / (b√r) = (a / (b·r)) √r
    const denominator = multiplyFractions(right.coefficient, {
      numerator: right.radicand,
      denominator: 1,
    })

    return {
      kind: 'radical',
      coefficient: divideFractions(left.fraction, denominator),
      radicand: right.radicand,
    }
  }

  if (left.kind === 'radical' && right.kind === 'radical') {
    const coefficient = divideFractions(left.coefficient, right.coefficient)

    if (left.radicand === right.radicand) {
      return { kind: 'rational', fraction: coefficient }
    }

    // (a√p) / (b√q) = (a / (b·q)) √(p·q)
    return {
      kind: 'radical',
      coefficient: divideFractions(coefficient, { numerator: right.radicand, denominator: 1 }),
      radicand: 6,
    }
  }

  return { kind: 'undefined' }
}

export function exactEquals(left: ExactValue, right: ExactValue): boolean {
  if (left.kind === 'undefined' || right.kind === 'undefined') {
    return left.kind === right.kind
  }

  if (left.kind === 'rational' && right.kind === 'rational') {
    return (
      left.fraction.numerator * right.fraction.denominator ===
      right.fraction.numerator * left.fraction.denominator
    )
  }

  if (left.kind === 'radical' && right.kind === 'radical') {
    return (
      left.radicand === right.radicand &&
      left.coefficient.numerator * right.coefficient.denominator ===
        right.coefficient.numerator * left.coefficient.denominator
    )
  }

  return false
}

/** Sign of an exact value: -1, 0 or 1; null when undefined. */
export function exactSign(value: ExactValue): number | null {
  switch (value.kind) {
    case 'undefined':
      return null
    case 'rational':
      return Math.sign(value.fraction.numerator)
    case 'radical':
      return Math.sign(value.coefficient.numerator)
  }
}

/** Compact, language-neutral representation used for machine checks. */
export function exactCanonical(value: ExactValue): string {
  switch (value.kind) {
    case 'undefined':
      return 'undefined'
    case 'rational': {
      const fraction = reduceFraction(value.fraction)

      return fraction.denominator === 1
        ? String(fraction.numerator)
        : `${String(fraction.numerator)}/${String(fraction.denominator)}`
    }
    case 'radical': {
      const coefficient = reduceFraction(value.coefficient)
      const coefficientText =
        coefficient.denominator === 1
          ? String(coefficient.numerator)
          : `${String(coefficient.numerator)}/${String(coefficient.denominator)}`

      return `${coefficientText}√${String(value.radicand)}`
    }
  }
}

/** Table for sin(q·π) with q reduced; other angles are derived by symmetry. */
function sinTable(q: Fraction): ExactValue {
  const key = `${String(q.numerator)}/${String(q.denominator)}`

  switch (key) {
    case '0/1':
    case '1/1':
      return exactRational(0)
    case '1/6':
    case '5/6':
      return exactRational(1, 2)
    case '7/6':
    case '11/6':
      return exactRational(-1, 2)
    case '1/4':
    case '3/4':
      return exactRadical({ numerator: 1, denominator: 2 }, 2)
    case '5/4':
    case '7/4':
      return exactRadical({ numerator: -1, denominator: 2 }, 2)
    case '1/3':
    case '2/3':
      return exactRadical({ numerator: 1, denominator: 2 }, 3)
    case '4/3':
    case '5/3':
      return exactRadical({ numerator: -1, denominator: 2 }, 3)
    case '1/2':
      return exactRational(1)
    case '3/2':
      return exactRational(-1)
    default:
      return { kind: 'undefined' }
  }
}

/** Normalizes an angle given as a multiple of π into [0, 2) and reduces it. */
export function normalizePiMultiple(q: Fraction): Fraction {
  const numerator = ((q.numerator % (2 * q.denominator)) + 2 * q.denominator) % (2 * q.denominator)

  return reduceFraction({ numerator, denominator: q.denominator })
}

export function sinExact(q: Fraction): ExactValue {
  return sinTable(normalizePiMultiple(q))
}

export function cosExact(q: Fraction): ExactValue {
  // cos(qπ) = sin((q + 1/2)π)
  return sinExact(addFractions(q, { numerator: 1, denominator: 2 }))
}

export function tanExact(q: Fraction): ExactValue {
  const cosine = cosExact(q)

  if (cosine.kind === 'rational' && cosine.fraction.numerator === 0) {
    return { kind: 'undefined' }
  }

  return exactDivide(sinExact(q), cosine)
}

/** Every angle (as a multiple of π) that is a multiple of π/6 or π/4 in [0, 2). */
export function specialAngles(): Fraction[] {
  const angles: Fraction[] = []

  for (let twelfths = 0; twelfths < 24; twelfths += 1) {
    if (twelfths % 2 === 0 || twelfths % 3 === 0) {
      angles.push(reduceFraction({ numerator: twelfths, denominator: 12 }))
    }
  }

  return angles
}

/** Language-neutral angle text: `0`, `pi`, `2pi/3`, `pi/6`. */
export function piMultipleCanonical(angle: Fraction): string {
  const reduced = reduceFraction(angle)

  if (reduced.numerator === 0) {
    return '0'
  }

  const prefix = reduced.numerator === 1 ? '' : String(reduced.numerator)

  return reduced.denominator === 1 ? `${prefix}pi` : `${prefix}pi/${String(reduced.denominator)}`
}
