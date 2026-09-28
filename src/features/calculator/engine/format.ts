/**
 * Formats a result for display: hides binary floating-point noise
 * (0.1 + 0.2 → 0.3), keeps up to 12 significant digits, and switches to
 * scientific notation only for very large or very small magnitudes.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return value > 0 ? '∞' : '-∞'
  }

  if (value === 0) {
    return '0'
  }

  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return String(value)
  }

  const rounded = Number(value.toPrecision(12))

  if (rounded === 0) {
    return '0'
  }

  if (Math.abs(rounded) >= 1e15 || Math.abs(rounded) < 1e-9) {
    return rounded
      .toExponential(8)
      .replace(/\.?0+e/, 'e')
      .replace('e+', 'e')
  }

  return String(rounded)
}

export interface ExactFraction {
  numerator: number
  denominator: number
}

/**
 * Recovers a small rational number from a float using continued fractions.
 * `0.3333333333333333 → 1/3`, `0.8333333333333334 → 5/6`.
 */
export function toExactFraction(
  value: number,
  maxDenominator = 10_000,
  tolerance = 1e-9,
): ExactFraction | null {
  if (!Number.isFinite(value)) {
    return null
  }

  if (Number.isInteger(value)) {
    return { numerator: value, denominator: 1 }
  }

  const sign = value < 0 ? -1 : 1
  const target = Math.abs(value)
  let h0 = 0
  let h1 = 1
  let k0 = 1
  let k1 = 0
  let remainder = target

  for (let iteration = 0; iteration < 40; iteration += 1) {
    const whole = Math.floor(remainder)
    const h2 = whole * h1 + h0
    const k2 = whole * k1 + k0

    if (k2 > maxDenominator) {
      return null
    }

    h0 = h1
    h1 = h2
    k0 = k1
    k1 = k2

    if (Math.abs(h1 / k1 - target) < tolerance) {
      return { numerator: sign * h1, denominator: k1 }
    }

    const fractionPart = remainder - whole

    if (fractionPart < 1e-12) {
      return null
    }

    remainder = 1 / fractionPart
  }

  return null
}

export interface FormattedValue {
  /** LaTeX for the result (exact fraction or decimal). */
  latex: string
  /** True when the value is exactly a rational number. */
  exact: boolean
}

export function formatValue(value: number): FormattedValue {
  const fraction = toExactFraction(value)

  if (fraction) {
    const sign = fraction.numerator < 0 ? '-' : ''
    const absolute = Math.abs(fraction.numerator)

    return {
      latex:
        fraction.denominator === 1
          ? `${sign}${String(absolute)}`
          : `${sign}\\frac{${String(absolute)}}{${String(fraction.denominator)}}`,
      exact: true,
    }
  }

  return { latex: formatNumber(value), exact: false }
}
