export interface Fraction {
  numerator: number
  denominator: number
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a))
  let y = Math.abs(Math.trunc(b))

  while (y !== 0) {
    const remainder = x % y
    x = y
    y = remainder
  }

  return x
}

export function lcm(a: number, b: number): number {
  const left = Math.abs(Math.trunc(a))
  const right = Math.abs(Math.trunc(b))

  if (left === 0 || right === 0) {
    return 0
  }

  return (left / gcd(left, right)) * right
}

/** Reduces a fraction to lowest terms, keeping the denominator positive. */
export function simplifyFraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) {
    throw new RangeError('Fraction with zero denominator')
  }

  const sign = denominator < 0 ? -1 : 1
  const divisor = gcd(numerator, denominator) || 1
  const reducedNumerator = (sign * numerator) / divisor
  const reducedDenominator = (sign * denominator) / divisor

  return { numerator: reducedNumerator, denominator: reducedDenominator }
}

export function addFractions(left: Fraction, right: Fraction): Fraction {
  return simplifyFraction(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  )
}

export function subtractFractions(left: Fraction, right: Fraction): Fraction {
  return addFractions(left, { numerator: -right.numerator, denominator: right.denominator })
}

export function multiplyFractions(left: Fraction, right: Fraction): Fraction {
  return simplifyFraction(left.numerator * right.numerator, left.denominator * right.denominator)
}

export function divideFractions(left: Fraction, right: Fraction): Fraction {
  if (right.numerator === 0) {
    throw new RangeError('Division by zero fraction')
  }

  return simplifyFraction(left.numerator * right.denominator, left.denominator * right.numerator)
}

export function fractionToNumber(fraction: Fraction): number {
  return fraction.numerator / fraction.denominator
}

export function isInteger(fraction: Fraction): boolean {
  return fraction.denominator === 1
}

/** Amount to multiply both fractions by to get a common denominator. */
export function commonDenominatorFactors(
  left: Fraction,
  right: Fraction,
): { leftFactor: number; rightFactor: number; denominator: number } {
  const denominator = lcm(left.denominator, right.denominator)

  return {
    leftFactor: denominator / left.denominator,
    rightFactor: denominator / right.denominator,
    denominator,
  }
}
