/**
 * A small, independent evaluator for the LaTeX subset produced by the
 * generators. Tests use it as an oracle: they parse the *rendered statement*
 * and recompute the answer, instead of trusting the generator's own math.
 */

export interface Rational {
  numerator: number
  denominator: number
}

export function rational(numerator: number, denominator = 1): Rational {
  if (denominator === 0) {
    throw new Error('Rational with zero denominator')
  }

  if (numerator === 0) {
    return { numerator: 0, denominator: 1 }
  }

  const sign = denominator < 0 ? -1 : 1
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator)) || 1

  return {
    numerator: (sign * numerator) / divisor,
    denominator: (sign * denominator) / divisor,
  }
}

function gcd(a: number, b: number): number {
  let x = a
  let y = b

  while (y !== 0) {
    const remainder = x % y
    x = y
    y = remainder
  }

  return x
}

export function rAdd(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  )
}

export function rSub(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  )
}

export function rMul(left: Rational, right: Rational): Rational {
  return rational(left.numerator * right.numerator, left.denominator * right.denominator)
}

export function rDiv(left: Rational, right: Rational): Rational {
  if (right.numerator === 0) {
    throw new Error('Division by zero in oracle')
  }

  return rational(left.numerator * right.denominator, left.denominator * right.numerator)
}

export function rNeg(value: Rational): Rational {
  return rational(-value.numerator, value.denominator)
}

export function rPowInt(base: Rational, exponent: number): Rational {
  if (!Number.isInteger(exponent)) {
    throw new Error('Oracle only supports integer exponents')
  }

  let result = rational(1)

  for (let index = 0; index < Math.abs(exponent); index += 1) {
    result = rMul(result, base)
  }

  return exponent < 0 ? rDiv(rational(1), result) : result
}

export function rEquals(left: Rational, right: Rational): boolean {
  return left.numerator * right.denominator === right.numerator * left.denominator
}

export function rCompare(left: Rational, right: Rational): number {
  return left.numerator * right.denominator - right.numerator * left.denominator
}

export function rToNumber(value: Rational): number {
  return value.numerator / value.denominator
}

/** Linear polynomial a·x + b with rational coefficients. */
export interface Polynomial {
  a: Rational
  b: Rational
}

type Operator = '+' | '-' | '*' | ':' | '^' | '='
type ComparisonOperator = '<' | '>' | '<=' | '>='

type Token =
  | { kind: 'int'; value: number }
  | { kind: 'variable' }
  | { kind: 'op'; value: Operator }
  | { kind: 'cmp'; value: ComparisonOperator }
  | { kind: 'cmd'; value: 'frac' | 'sqrt' | 'log' | 'ln' }
  | { kind: 'lparen' }
  | { kind: 'rparen' }
  | { kind: 'lbrace' }
  | { kind: 'rbrace' }
  | { kind: 'lbracket' }
  | { kind: 'rbracket' }
  | { kind: 'underscore' }

function tokenize(latex: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  const pushCommand = (name: string): void => {
    switch (name) {
      case 'frac':
      case 'sqrt':
      case 'log':
      case 'ln':
        tokens.push({ kind: 'cmd', value: name })
        return
      case 'cdot':
        tokens.push({ kind: 'op', value: '*' })
        return
      case 'left':
      case 'right':
        return // delimiters carry no meaning for evaluation
      case 'lt':
        tokens.push({ kind: 'cmp', value: '<' })
        return
      case 'le':
        tokens.push({ kind: 'cmp', value: '<=' })
        return
      case 'gt':
        tokens.push({ kind: 'cmp', value: '>' })
        return
      case 'ge':
        tokens.push({ kind: 'cmp', value: '>=' })
        return
      default:
        throw new Error(`Oracle: unsupported command \\${name}`)
    }
  }

  while (index < latex.length) {
    const character = latex[index]

    if (character === undefined) {
      break
    }

    if (/\s/.test(character)) {
      index += 1
      continue
    }

    if (character === '\\') {
      const match = /^\\([a-zA-Z]+)/.exec(latex.slice(index))
      const command = match?.[1]

      if (!command) {
        throw new Error(`Oracle: bad command at "${latex.slice(index, index + 10)}"`)
      }

      pushCommand(command)
      index += match[0].length
      continue
    }

    if (/[0-9]/.test(character)) {
      const match = /^\d+/.exec(latex.slice(index))

      if (!match) {
        throw new Error('Oracle: bad number')
      }

      tokens.push({ kind: 'int', value: Number.parseInt(match[0], 10) })
      index += match[0].length
      continue
    }

    switch (character) {
      case '+':
        tokens.push({ kind: 'op', value: '+' })
        break
      case '-':
        tokens.push({ kind: 'op', value: '-' })
        break
      case '·':
        tokens.push({ kind: 'op', value: '*' })
        break
      case ':':
        tokens.push({ kind: 'op', value: ':' })
        break
      case '^':
        tokens.push({ kind: 'op', value: '^' })
        break
      case '=':
        tokens.push({ kind: 'op', value: '=' })
        break
      case '<':
        tokens.push({ kind: 'cmp', value: '<' })
        break
      case '>':
        tokens.push({ kind: 'cmp', value: '>' })
        break
      case '(':
        tokens.push({ kind: 'lparen' })
        break
      case ')':
        tokens.push({ kind: 'rparen' })
        break
      case '{':
        tokens.push({ kind: 'lbrace' })
        break
      case '}':
        tokens.push({ kind: 'rbrace' })
        break
      case '[':
        tokens.push({ kind: 'lbracket' })
        break
      case ']':
        tokens.push({ kind: 'rbracket' })
        break
      case '_':
        tokens.push({ kind: 'underscore' })
        break
      case 'x':
        tokens.push({ kind: 'variable' })
        break
      default:
        throw new Error(`Oracle: unsupported character "${character}"`)
    }

    index += 1
  }

  return tokens
}

class Parser {
  private position = 0
  private readonly tokens: readonly Token[]

  constructor(tokens: readonly Token[]) {
    this.tokens = tokens
  }

  peek(): Token | undefined {
    return this.tokens[this.position]
  }

  next(): Token | undefined {
    const token = this.tokens[this.position]
    this.position += 1
    return token
  }

  atEnd(): boolean {
    return this.position >= this.tokens.length
  }

  expect(kind: Token['kind']): Token {
    const token = this.next()

    if (!token) {
      throw new Error(`Oracle: expected ${kind}, got end of input`)
    }

    if (token.kind !== kind) {
      throw new Error(`Oracle: expected ${kind}, got ${token.kind}`)
    }

    return token
  }

  /** expression := term (('+' | '-') term)* */
  parseExpression(): Polynomial {
    let left = this.parseTerm()

    for (;;) {
      const token = this.peek()

      if (token?.kind === 'op' && (token.value === '+' || token.value === '-')) {
        this.next()
        const right = this.parseTerm()
        left = token.value === '+' ? addPolynomials(left, right) : subtractPolynomials(left, right)
        continue
      }

      return left
    }
  }

  /** term := factor (('*' | ':') factor | implicit factor)* */
  parseTerm(): Polynomial {
    let left = this.parseFactor()

    for (;;) {
      const token = this.peek()

      if (token?.kind === 'op' && (token.value === '*' || token.value === ':')) {
        this.next()
        const right = this.parseFactor()
        left =
          token.value === '*' ? multiplyPolynomials(left, right) : dividePolynomials(left, right)
        continue
      }

      // Implicit multiplication: `3x`, `2\sqrt{2}`, `4\left(x + 1\right)`.
      if (
        token &&
        (token.kind === 'variable' ||
          token.kind === 'lparen' ||
          token.kind === 'lbrace' ||
          token.kind === 'cmd')
      ) {
        const right = this.parseFactor()
        left = multiplyPolynomials(left, right)
        continue
      }

      return left
    }
  }

  /** factor := '-' factor | atom ('^' exponent)? */
  parseFactor(): Polynomial {
    const token = this.peek()

    if (token?.kind === 'op' && (token.value === '-' || token.value === '+')) {
      this.next()

      const inner = this.parseFactor()

      return token.value === '-' ? scalePolynomial(inner, rational(-1)) : inner
    }

    let base = this.parseAtom()
    const next = this.peek()

    if (next?.kind === 'op' && next.value === '^') {
      this.next()
      const exponent = this.parseExponent()
      base = powerPolynomial(base, exponent)
    }

    return base
  }

  parseExponent(): number {
    const braced = this.peek()?.kind === 'lbrace'

    if (braced) {
      this.next()
    }

    const token = this.peek()
    let sign = 1

    if (token?.kind === 'op' && (token.value === '-' || token.value === '+')) {
      this.next()
      sign = token.value === '-' ? -1 : 1
    }

    const number = this.expect('int')

    if (number.kind !== 'int') {
      throw new Error('Oracle: invalid exponent')
    }

    if (braced) {
      this.expect('rbrace')
    }

    return sign * number.value
  }

  parseAtom(): Polynomial {
    const token = this.next()

    if (!token) {
      throw new Error('Oracle: unexpected end of input')
    }

    switch (token.kind) {
      case 'int':
        return constantPolynomial(rational(token.value))
      case 'variable':
        return { a: rational(1), b: rational(0) }
      case 'lparen': {
        const inner = this.parseExpression()
        this.expect('rparen')
        return inner
      }
      case 'lbracket': {
        const inner = this.parseExpression()
        this.expect('rbracket')
        return inner
      }
      case 'lbrace': {
        // Grouping braces around a base: `{2}^{3}`.
        const inner = this.parseExpression()
        this.expect('rbrace')
        return inner
      }
      case 'cmd':
        return this.parseCommand(token.value)
      default:
        throw new Error(`Oracle: unexpected token ${token.kind}`)
    }
  }

  private parseBracedExpression(): Polynomial {
    this.expect('lbrace')
    const inner = this.parseExpression()
    this.expect('rbrace')
    return inner
  }

  private parseCommand(command: 'frac' | 'sqrt' | 'log' | 'ln'): Polynomial {
    switch (command) {
      case 'frac': {
        const numerator = this.parseBracedExpression()
        const denominator = this.parseBracedExpression()
        return dividePolynomials(numerator, denominator)
      }
      case 'sqrt': {
        let rootDegree = 2

        if (this.peek()?.kind === 'lbracket') {
          this.next()
          const degree = this.expect('int')

          if (degree.kind !== 'int') {
            throw new Error('Oracle: invalid root index')
          }

          rootDegree = degree.value
          this.expect('rbracket')
        }

        const radicand = this.parseBracedExpression()
        const value = evaluatePolynomial(radicand)

        if (value === null) {
          throw new Error('Oracle: roots of expressions with x are not supported')
        }

        return constantPolynomial(exactRoot(value, rootDegree))
      }
      case 'log': {
        this.expect('underscore')
        const base = evaluatePolynomial(this.parseBracedExpression())
        const argument = evaluatePolynomial(this.parseParenthesised())

        if (base === null || argument === null) {
          throw new Error('Oracle: logarithms require constant base and argument')
        }

        return constantPolynomial(exactLog(base, argument))
      }
      case 'ln': {
        const argument = evaluatePolynomial(this.parseParenthesised())

        if (argument === null) {
          throw new Error('Oracle: ln requires a constant argument')
        }

        if (rEquals(argument, rational(1))) {
          return constantPolynomial(rational(0))
        }

        throw new Error('Oracle: only ln(1) is supported exactly')
      }
    }
  }

  private parseParenthesised(): Polynomial {
    if (this.peek()?.kind === 'lparen') {
      this.next()
      const inner = this.parseExpression()
      this.expect('rparen')
      return inner
    }

    if (this.peek()?.kind === 'lbrace') {
      return this.parseBracedExpression()
    }

    throw new Error('Oracle: expected a parenthesised group')
  }
}

function constantPolynomial(value: Rational): Polynomial {
  return { a: rational(0), b: value }
}

export function addPolynomials(left: Polynomial, right: Polynomial): Polynomial {
  return { a: rAdd(left.a, right.a), b: rAdd(left.b, right.b) }
}

export function subtractPolynomials(left: Polynomial, right: Polynomial): Polynomial {
  return { a: rSub(left.a, right.a), b: rSub(left.b, right.b) }
}

function scalePolynomial(value: Polynomial, factor: Rational): Polynomial {
  return { a: rMul(value.a, factor), b: rMul(value.b, factor) }
}

export function multiplyPolynomials(left: Polynomial, right: Polynomial): Polynomial {
  if (!isConstant(left) && !isConstant(right)) {
    throw new Error('Oracle: product of two linear expressions is not supported')
  }

  const constant = isConstant(left) ? left.b : right.b
  const other = isConstant(left) ? right : left

  return scalePolynomial(other, constant)
}

function dividePolynomials(left: Polynomial, right: Polynomial): Polynomial {
  if (!isConstant(right)) {
    throw new Error('Oracle: division by a linear expression is not supported')
  }

  return scalePolynomial(left, rDiv(rational(1), right.b))
}

function powerPolynomial(base: Polynomial, exponent: number): Polynomial {
  if (!isConstant(base)) {
    if (exponent === 1) {
      return base
    }

    throw new Error('Oracle: only constant powers are supported')
  }

  return constantPolynomial(rPowInt(base.b, exponent))
}

function isConstant(value: Polynomial): boolean {
  return value.a.numerator === 0
}

/** Returns the constant value, or null when the polynomial contains x. */
export function evaluatePolynomial(value: Polynomial): Rational | null {
  return isConstant(value) ? value.b : null
}

function exactRoot(value: Rational, degree: number): Rational {
  if (value.denominator !== 1) {
    throw new Error('Oracle: only integer radicands are supported')
  }

  const candidate = Math.round(value.numerator ** (1 / degree))

  if (candidate ** degree === value.numerator) {
    return rational(candidate)
  }

  throw new Error(
    `Oracle: ${String(value.numerator)} is not a perfect power of degree ${String(degree)}`,
  )
}

function exactLog(base: Rational, argument: Rational): Rational {
  if (argument.numerator === 0) {
    throw new Error('Oracle: log of zero')
  }

  if (rCompare(base, rational(1)) <= 0) {
    throw new Error('Oracle: log base must be greater than 1')
  }

  let value = argument
  let exponent = 0

  while (rCompare(value, rational(1)) > 0 && exponent < 64) {
    value = rDiv(value, base)
    exponent += 1
  }

  while (rCompare(value, rational(1)) < 0 && exponent > -64) {
    value = rMul(value, base)
    exponent -= 1
  }

  if (rEquals(value, rational(1))) {
    return rational(exponent)
  }

  throw new Error('Oracle: logarithm is not an exact integer')
}

/** Evaluates a constant LaTeX arithmetic expression. */
export function evaluateArithmetic(latex: string): Rational {
  return evaluateConstant(parseLinear(latex), latex)
}

function evaluateConstant(value: Polynomial, latex: string): Rational {
  const result = evaluatePolynomial(value)

  if (result === null) {
    throw new Error(`Oracle: expression contains x: "${latex}"`)
  }

  return result
}

/** Parses a LaTeX arithmetic expression into a linear polynomial. */
export function parseLinear(latex: string): Polynomial {
  const parser = new Parser(tokenize(latex))
  const value = parser.parseExpression()

  if (!parser.atEnd()) {
    throw new Error(`Oracle: trailing input in "${latex}"`)
  }

  return value
}

/** Solves `left = right` for x, where both sides are linear in x. */
export function solveEquation(latex: string): Rational {
  const [leftLatex, rightLatex] = splitOnce(latex, '=')
  const left = parseLinear(leftLatex)
  const right = parseLinear(rightLatex)
  const coefficient = rSub(left.a, right.a)

  if (coefficient.numerator === 0) {
    throw new Error('Oracle: equation has no unique solution')
  }

  return rDiv(rSub(right.b, left.b), coefficient)
}

export interface IntervalResult {
  from: Rational | null
  to: Rational | null
  fromInclusive: boolean
  toInclusive: boolean
}

function splitOnce(latex: string, separator: string): [string, string] {
  const index = latex.indexOf(separator)

  if (index < 0) {
    throw new Error(`Oracle: separator "${separator}" not found in "${latex}"`)
  }

  return [latex.slice(0, index), latex.slice(index + separator.length)]
}

interface ComparisonChain {
  parts: string[]
  operators: ComparisonOperator[]
}

function splitComparisonChain(latex: string): ComparisonChain {
  const operators: ComparisonOperator[] = []
  const parts: string[] = []
  let current = ''
  let index = 0

  while (index < latex.length) {
    const character = latex[index]

    if (character === undefined) {
      break
    }

    if (character === '\\') {
      const match = /^\\(le|ge|lt|gt)/.exec(latex.slice(index))
      const comparison = match?.[1]

      if (comparison) {
        const operator =
          comparison === 'le' ? '<=' : comparison === 'ge' ? '>=' : comparison === 'lt' ? '<' : '>'
        operators.push(operator)
        parts.push(current)
        current = ''
        index += match[0].length
        continue
      }
    }

    if (character === '<' || character === '>') {
      const isOrEqual = latex[index + 1] === '='

      operators.push(character === '<' ? (isOrEqual ? '<=' : '<') : isOrEqual ? '>=' : '>')
      parts.push(current)
      current = ''
      index += isOrEqual ? 2 : 1
      continue
    }

    current += character
    index += 1
  }

  parts.push(current)

  return { parts, operators }
}

function comparisonToInterval(
  polynomial: Polynomial,
  operator: ComparisonOperator,
): IntervalResult {
  const { a, b } = polynomial

  if (a.numerator === 0) {
    throw new Error('Oracle: comparison without x is not supported')
  }

  const bound = rDiv(rNeg(b), a)
  const positiveCoefficient = a.numerator > 0
  const effective: ComparisonOperator = positiveCoefficient
    ? operator
    : operator === '<'
      ? '>'
      : operator === '<='
        ? '>='
        : operator === '>'
          ? '<'
          : '<='

  switch (effective) {
    case '<':
      return { from: null, to: bound, fromInclusive: false, toInclusive: false }
    case '<=':
      return { from: null, to: bound, fromInclusive: false, toInclusive: true }
    case '>':
      return { from: bound, to: null, fromInclusive: false, toInclusive: false }
    case '>=':
      return { from: bound, to: null, fromInclusive: true, toInclusive: false }
  }
}

function intersect(left: IntervalResult, right: IntervalResult): IntervalResult {
  let from: Rational | null
  let fromInclusive: boolean

  if (left.from === null) {
    from = right.from
    fromInclusive = right.fromInclusive
  } else if (right.from === null) {
    from = left.from
    fromInclusive = left.fromInclusive
  } else {
    const comparison = rCompare(left.from, right.from)

    if (comparison > 0) {
      from = left.from
      fromInclusive = left.fromInclusive
    } else if (comparison < 0) {
      from = right.from
      fromInclusive = right.fromInclusive
    } else {
      from = left.from
      fromInclusive = left.fromInclusive && right.fromInclusive
    }
  }

  let to: Rational | null
  let toInclusive: boolean

  if (left.to === null) {
    to = right.to
    toInclusive = right.toInclusive
  } else if (right.to === null) {
    to = left.to
    toInclusive = left.toInclusive
  } else {
    const comparison = rCompare(left.to, right.to)

    if (comparison < 0) {
      to = left.to
      toInclusive = left.toInclusive
    } else if (comparison > 0) {
      to = right.to
      toInclusive = right.toInclusive
    } else {
      to = left.to
      toInclusive = left.toInclusive && right.toInclusive
    }
  }

  return { from, to, fromInclusive, toInclusive }
}

/**
 * Solves a linear inequality (simple or compound) into an interval.
 * Examples: `3x - 1 < 5`, `-1 \le 2x + 3 \lt 7`, `x \ge -2`.
 */
export function solveInequality(latex: string): IntervalResult {
  const { parts, operators } = splitComparisonChain(latex)

  if (parts.length !== operators.length + 1) {
    throw new Error(`Oracle: malformed inequality "${latex}"`)
  }

  const intervals: IntervalResult[] = []

  for (let index = 0; index < operators.length; index += 1) {
    const left = parseLinear(parts[index] ?? '')
    const right = parseLinear(parts[index + 1] ?? '')
    const operator = operators[index]

    if (!operator) {
      throw new Error('Oracle: missing comparison operator')
    }

    // left operator right  →  left - right operator 0
    intervals.push(comparisonToInterval(subtractPolynomials(left, right), operator))
  }

  const [first, ...rest] = intervals

  if (!first) {
    throw new Error('Oracle: no comparison found')
  }

  return rest.reduce(intersect, first)
}
