export type CalculatorErrorCode =
  'syntax' | 'divisionByZero' | 'domain' | 'overflow' | 'limit' | 'unsupported'

export interface CalculatorError {
  code: CalculatorErrorCode
  /** Character position where the problem was detected, when known. */
  position?: number
}

export type TokenType =
  'number' | 'operator' | 'function' | 'constant' | 'variable' | 'lparen' | 'rparen' | 'factorial'

export interface Token {
  type: TokenType
  value: string
  position: number
  number?: number
}

export const MAX_EXPRESSION_LENGTH = 200

const OPERATORS = new Set(['+', '-', '*', '/', '^'])
const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'ln',
  'log',
  'sqrt',
  'cbrt',
  'abs',
])
const CONSTANTS = new Set(['pi', 'e', 'ans'])

/** Characters we normalise to plain ASCII operators. */
const NORMALISED_SYMBOLS: Record<string, string> = {
  '×': '*',
  '·': '*',
  '÷': '/',
  '−': '-',
  '–': '-',
  '√': 'sqrt',
  '∛': 'cbrt',
  π: 'pi',
  ',': '.',
}

export function normalizeExpression(input: string): string {
  let result = ''

  for (const character of input) {
    result += NORMALISED_SYMBOLS[character] ?? character
  }

  return result
}

export function tokenize(input: string): { tokens: Token[] } | { error: CalculatorError } {
  if (input.length > MAX_EXPRESSION_LENGTH) {
    return { error: { code: 'limit' } }
  }

  const source = normalizeExpression(input)
  const tokens: Token[] = []
  let index = 0

  while (index < source.length) {
    const character = source[index]

    if (character === undefined) {
      break
    }

    if (/\s/.test(character)) {
      index += 1
      continue
    }

    if (/[0-9.]/.test(character)) {
      const match = /^\d*\.?\d*/.exec(source.slice(index))

      if (!match || match[0].length === 0 || match[0] === '.') {
        return { error: { code: 'syntax', position: index } }
      }

      const value = Number(match[0])

      if (!Number.isFinite(value)) {
        return { error: { code: 'syntax', position: index } }
      }

      tokens.push({ type: 'number', value: match[0], number: value, position: index })
      index += match[0].length
      continue
    }

    if (/[a-zA-Z]/.test(character)) {
      const match = /^[a-zA-Z]+/.exec(source.slice(index))

      if (!match) {
        return { error: { code: 'syntax', position: index } }
      }

      const word = match[0].toLowerCase()

      if (FUNCTIONS.has(word)) {
        tokens.push({ type: 'function', value: word, position: index })
      } else if (CONSTANTS.has(word)) {
        tokens.push({ type: 'constant', value: word, position: index })
      } else if (word === 'x') {
        tokens.push({ type: 'variable', value: 'x', position: index })
      } else {
        return { error: { code: 'syntax', position: index } }
      }

      index += match[0].length
      continue
    }

    if (OPERATORS.has(character)) {
      tokens.push({ type: 'operator', value: character, position: index })
      index += 1
      continue
    }

    if (character === '!') {
      tokens.push({ type: 'factorial', value: '!', position: index })
      index += 1
      continue
    }

    if (character === '(') {
      tokens.push({ type: 'lparen', value: '(', position: index })
      index += 1
      continue
    }

    if (character === ')') {
      tokens.push({ type: 'rparen', value: ')', position: index })
      index += 1
      continue
    }

    return { error: { code: 'syntax', position: index } }
  }

  return { tokens }
}
