/**
 * Independent exact trigonometry for angles that are multiples of π/6 or π/4.
 * The table is written separately from the production blocks on purpose:
 * tests must not trust the implementation they are checking.
 */

export type OracleExact =
  | { kind: 'rational'; numerator: number; denominator: number }
  | { kind: 'radical'; numerator: number; denominator: number; radicand: 2 | 3 }
  | { kind: 'undefined' }

function reduce(
  numerator: number,
  denominator: number,
): { numerator: number; denominator: number } {
  let a = Math.abs(numerator)
  let b = Math.abs(denominator)

  while (b !== 0) {
    const remainder = a % b
    a = b
    b = remainder
  }

  const divisor = a || 1

  return { numerator: numerator / divisor, denominator: denominator / divisor }
}

function sinTable(angle: { numerator: number; denominator: number }): OracleExact {
  const { numerator, denominator } = angle
  const key = `${String(numerator)}/${String(denominator)}`

  switch (key) {
    case '0/1':
    case '1/1':
      return { kind: 'rational', numerator: 0, denominator: 1 }
    case '1/6':
    case '5/6':
      return { kind: 'rational', numerator: 1, denominator: 2 }
    case '7/6':
    case '11/6':
      return { kind: 'rational', numerator: -1, denominator: 2 }
    case '1/4':
    case '3/4':
      return { kind: 'radical', numerator: 1, denominator: 2, radicand: 2 }
    case '5/4':
    case '7/4':
      return { kind: 'radical', numerator: -1, denominator: 2, radicand: 2 }
    case '1/3':
    case '2/3':
      return { kind: 'radical', numerator: 1, denominator: 2, radicand: 3 }
    case '4/3':
    case '5/3':
      return { kind: 'radical', numerator: -1, denominator: 2, radicand: 3 }
    case '1/2':
      return { kind: 'rational', numerator: 1, denominator: 1 }
    case '3/2':
      return { kind: 'rational', numerator: -1, denominator: 1 }
    default:
      throw new Error(`trig oracle: sin not tabulated for ${key}π`)
  }
}

function normalize(angle: { numerator: number; denominator: number }): {
  numerator: number
  denominator: number
} {
  const period = 2 * angle.denominator
  const numerator = ((angle.numerator % period) + period) % period

  return reduce(numerator, angle.denominator)
}

export function oracleSin(angle: { numerator: number; denominator: number }): OracleExact {
  return sinTable(normalize(angle))
}

export function oracleCos(angle: { numerator: number; denominator: number }): OracleExact {
  const shifted = normalize({
    numerator: angle.numerator * 2 + angle.denominator,
    denominator: angle.denominator * 2,
  })

  return sinTable(shifted)
}

export function oracleTan(angle: { numerator: number; denominator: number }): OracleExact {
  const sine = oracleSin(angle)
  const cosine = oracleCos(angle)

  if (cosine.kind === 'rational' && cosine.numerator === 0) {
    return { kind: 'undefined' }
  }

  return divideOracle(sine, cosine)
}

function multiplyOracle(left: OracleExact, right: OracleExact): OracleExact {
  if (left.kind === 'undefined' || right.kind === 'undefined') {
    return { kind: 'undefined' }
  }

  if (left.kind === 'rational' && right.kind === 'rational') {
    return {
      kind: 'rational',
      numerator: left.numerator * right.numerator,
      denominator: left.denominator * right.denominator,
    }
  }

  if (left.kind === 'radical' && right.kind === 'radical') {
    if (left.radicand === right.radicand) {
      return {
        kind: 'rational',
        numerator: left.numerator * right.numerator * left.radicand,
        denominator: left.denominator * right.denominator,
      }
    }

    throw new Error('trig oracle: √2·√3 is not needed by these exercises')
  }

  const radical =
    left.kind === 'radical' ? left : (right as Extract<OracleExact, { kind: 'radical' }>)
  const rational =
    left.kind === 'rational' ? left : (right as Extract<OracleExact, { kind: 'rational' }>)

  return {
    kind: 'radical',
    numerator: radical.numerator * rational.numerator,
    denominator: radical.denominator * rational.denominator,
    radicand: radical.radicand,
  }
}

function divideOracle(left: OracleExact, right: OracleExact): OracleExact {
  if (left.kind === 'undefined' || right.kind === 'undefined') {
    return { kind: 'undefined' }
  }

  if (right.kind === 'rational' && right.numerator === 0) {
    return { kind: 'undefined' }
  }

  if (left.kind === 'rational' && right.kind === 'rational') {
    return {
      kind: 'rational',
      numerator: left.numerator * right.denominator,
      denominator: left.denominator * right.numerator,
    }
  }

  if (left.kind === 'radical' && right.kind === 'rational') {
    return {
      kind: 'radical',
      numerator: left.numerator * right.denominator,
      denominator: left.denominator * right.numerator,
      radicand: left.radicand,
    }
  }

  if (left.kind === 'rational' && right.kind === 'radical') {
    return {
      kind: 'radical',
      numerator: left.numerator * right.denominator,
      denominator: left.denominator * right.numerator * right.radicand,
      radicand: right.radicand,
    }
  }

  if (left.kind === 'radical' && right.kind === 'radical') {
    if (left.radicand !== right.radicand) {
      throw new Error('trig oracle: division of different radicands is not needed')
    }

    return {
      kind: 'rational',
      numerator: left.numerator * right.denominator,
      denominator: left.denominator * right.numerator,
    }
  }

  return { kind: 'undefined' }
}

export function oracleMultiply(left: OracleExact, right: OracleExact): OracleExact {
  return multiplyOracle(left, right)
}

export function oracleRational(numerator: number, denominator = 1): OracleExact {
  return { kind: 'rational', numerator, denominator }
}

export function oracleEquals(left: OracleExact, right: OracleExact): boolean {
  if (left.kind === 'undefined' || right.kind === 'undefined') {
    return left.kind === right.kind
  }

  if (left.kind === 'rational' && right.kind === 'rational') {
    return left.numerator * right.denominator === right.numerator * left.denominator
  }

  if (left.kind === 'radical' && right.kind === 'radical') {
    return (
      left.radicand === right.radicand &&
      left.numerator * right.denominator === right.numerator * left.denominator
    )
  }

  return false
}

export function oracleSign(value: OracleExact): number | null {
  switch (value.kind) {
    case 'undefined':
      return null
    case 'rational':
      return Math.sign(value.numerator * value.denominator)
    case 'radical':
      return Math.sign(value.numerator * value.denominator)
  }
}

export function oracleCanonical(value: OracleExact): string {
  switch (value.kind) {
    case 'undefined':
      return 'undefined'
    case 'rational': {
      const fraction = reduce(value.numerator, value.denominator)

      return fraction.denominator === 1
        ? String(fraction.numerator)
        : `${String(fraction.numerator)}/${String(fraction.denominator)}`
    }
    case 'radical': {
      const coefficient = reduce(value.numerator, value.denominator)
      const coefficientText =
        coefficient.denominator === 1
          ? String(coefficient.numerator)
          : `${String(coefficient.numerator)}/${String(coefficient.denominator)}`

      return `${coefficientText}√${String(value.radicand)}`
    }
  }
}

/** Parses the canonical form produced by the content blocks. */
export function parseOracleCanonical(text: string): OracleExact {
  const trimmed = text.trim()

  if (trimmed === 'undefined') {
    return { kind: 'undefined' }
  }

  const radical = /^(-?\d+(?:\/\d+)?)√([23])$/.exec(trimmed)

  if (radical) {
    const [numerator, denominator] = splitFraction(radical[1] ?? '0')

    return { kind: 'radical', numerator, denominator, radicand: Number(radical[2]) as 2 | 3 }
  }

  const [numerator, denominator] = splitFraction(trimmed)

  return { kind: 'rational', numerator, denominator }
}

function splitFraction(text: string): [number, number] {
  const [numeratorText, denominatorText] = text.split('/')

  return [Number(numeratorText), Number(denominatorText ?? '1')]
}

/** Parses an angle canonical such as `pi`, `2pi/3` or `0` into a π multiple. */
export function parseAngleCanonical(text: string): { numerator: number; denominator: number } {
  const trimmed = text.trim()

  if (trimmed === '0') {
    return { numerator: 0, denominator: 1 }
  }

  const match = /^(-?\d*)pi(?:\/(\d+))?$/.exec(trimmed)

  if (!match) {
    throw new Error(`trig oracle: cannot parse angle "${text}"`)
  }

  const numerator = match[1] === '' || match[1] === undefined ? 1 : Number(match[1])
  const denominator = match[2] === undefined ? 1 : Number(match[2])

  return { numerator, denominator }
}

function parseRationalLatex(text: string): { numerator: number; denominator: number } | null {
  const fraction = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(text)

  if (fraction) {
    return {
      numerator: (fraction[1] ? -1 : 1) * Number(fraction[2]),
      denominator: Number(fraction[3]),
    }
  }

  const integer = /^(-?\d+)$/.exec(text)

  if (integer) {
    return { numerator: Number(integer[1]), denominator: 1 }
  }

  return null
}

/** Parses the LaTeX emitted by the content blocks for exact values. */
export function parseExactLatex(latex: string): OracleExact {
  const text = latex.trim()

  if (text.includes('\\text{')) {
    return { kind: 'undefined' }
  }

  const radical = /^(.*)\\sqrt\{([236])\}$/.exec(text)

  if (radical) {
    const coefficientText = radical[1] ?? ''
    const rational = parseRationalLatex(
      coefficientText === '' ? '1' : coefficientText === '-' ? '-1' : coefficientText,
    )

    if (!rational) {
      throw new Error(`trig oracle: cannot parse radical coefficient in "${latex}"`)
    }

    return {
      kind: 'radical',
      numerator: rational.numerator,
      denominator: rational.denominator,
      radicand: Number(radical[2]) as 2 | 3,
    }
  }

  const rational = parseRationalLatex(text)

  if (!rational) {
    throw new Error(`trig oracle: cannot parse exact latex "${latex}"`)
  }

  return { kind: 'rational', numerator: rational.numerator, denominator: rational.denominator }
}
