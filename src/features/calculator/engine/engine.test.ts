import { describe, expect, it } from 'vitest'

import { evaluateExpression, type EvaluationContext } from '@/features/calculator/engine/evaluate'
import { formatNumber } from '@/features/calculator/engine/format'
import { tokenize } from '@/features/calculator/engine/tokenizer'

const baseContext: EvaluationContext = { angleMode: 'rad', ans: 0, memory: 0 }

function evaluate(expression: string, context: Partial<EvaluationContext> = {}): number {
  const result = evaluateExpression(expression, { ...baseContext, ...context })

  if (!result.ok) {
    throw new Error(`expected success, got ${result.error.code}`)
  }

  return result.value
}

function expectError(
  expression: string,
  code: string,
  context: Partial<EvaluationContext> = {},
): void {
  const result = evaluateExpression(expression, { ...baseContext, ...context })

  expect(result.ok).toBe(false)

  if (!result.ok) {
    expect(result.error.code).toBe(code)
  }
}

describe('tokenizer', () => {
  it('tokenizes numbers, operators and parentheses', () => {
    const result = tokenize('1.5 + 2 * (3 - 4)')

    expect('tokens' in result && result.tokens.map((token) => token.type)).toEqual([
      'number',
      'operator',
      'number',
      'operator',
      'lparen',
      'number',
      'operator',
      'number',
      'rparen',
    ])
  })

  it('accepts decimal commas and unicode symbols', () => {
    expect('tokens' in tokenize('1,5 × 2')).toBe(true)
    expect('tokens' in tokenize('√9 ÷ 3')).toBe(true)
    expect('tokens' in tokenize('π')).toBe(true)
  })

  it('rejects unknown words and characters', () => {
    expect(tokenize('foo(2)')).toEqual({ error: { code: 'syntax', position: 0 } })
    expect(tokenize('2 & 3')).toEqual({ error: { code: 'syntax', position: 2 } })
  })

  it('rejects overly long input', () => {
    expect(tokenize('1'.repeat(500))).toEqual({ error: { code: 'limit' } })
  })
})

describe('evaluation: arithmetic', () => {
  it('respects precedence and associativity', () => {
    expect(evaluate('2 + 3 * 4')).toBe(14)
    expect(evaluate('(2 + 3) * 4')).toBe(20)
    expect(evaluate('2 - 3 - 4')).toBe(-5)
    expect(evaluate('2 ^ 3 ^ 2')).toBe(512)
    expect(evaluate('-2 ^ 2')).toBe(-4)
    expect(evaluate('(-2) ^ 2')).toBe(4)
  })

  it('supports implicit multiplication', () => {
    expect(evaluate('2π')).toBeCloseTo(2 * Math.PI)
    expect(evaluate('3(4 + 5)')).toBe(27)
    expect(evaluate('2sin(0)')).toBe(0)
  })

  it('supports factorial', () => {
    expect(evaluate('5!')).toBe(120)
    expect(evaluate('3! + 1')).toBe(7)
    expectError('2.5!', 'domain')
    expectError('(-1)!', 'domain')
  })

  it('uses ans and constants', () => {
    expect(evaluate('ans + 1', { ans: 41 })).toBe(42)
    expect(evaluate('e')).toBeCloseTo(Math.E)
  })
})

describe('evaluation: functions and angle modes', () => {
  it('evaluates trigonometry in radians', () => {
    expect(evaluate('sin(0)')).toBe(0)
    expect(evaluate('cos(0)')).toBe(1)
    expect(evaluate('sin(pi / 2)')).toBeCloseTo(1)
    expect(evaluate('asin(1)')).toBeCloseTo(Math.PI / 2)
  })

  it('evaluates trigonometry in degrees', () => {
    expect(evaluate('sin(30)', { angleMode: 'deg' })).toBeCloseTo(0.5)
    expect(evaluate('cos(60)', { angleMode: 'deg' })).toBeCloseTo(0.5)
    expect(evaluate('asin(0.5)', { angleMode: 'deg' })).toBeCloseTo(30)
    expect(evaluate('atan(1)', { angleMode: 'deg' })).toBeCloseTo(45)
  })

  it('evaluates roots, logarithms and absolute value', () => {
    expect(evaluate('sqrt(16)')).toBe(4)
    expect(evaluate('cbrt(27)')).toBe(3)
    expect(evaluate('ln(e)')).toBeCloseTo(1)
    expect(evaluate('log(1000)')).toBeCloseTo(3)
    expect(evaluate('abs(-7)')).toBe(7)
  })

  it('reports domain errors instead of NaN', () => {
    expectError('sqrt(-1)', 'domain')
    expectError('ln(0)', 'domain')
    expectError('log(-5)', 'domain')
    expectError('asin(2)', 'domain')
    expectError('tan(90)', 'domain', { angleMode: 'deg' })
    expectError('(-8) ^ 0.5', 'domain')
  })

  it('reports division by zero', () => {
    expectError('1 / 0', 'divisionByZero')
    expectError('0 ^ -1', 'divisionByZero')
  })

  it('reports overflow', () => {
    expectError('9 ^ 99999', 'overflow')
  })

  it('reports syntax errors with a position when available', () => {
    const result = evaluateExpression('1 + ', baseContext)

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.error.code).toBe('syntax')
    }
  })
})

describe('formatNumber', () => {
  it('hides floating point noise', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3')
    expect(formatNumber(1 / 3)).toBe('0.333333333333')
    expect(formatNumber(2 / 3)).toBe('0.666666666667')
  })

  it('keeps integers intact', () => {
    expect(formatNumber(42)).toBe('42')
    expect(formatNumber(-7)).toBe('-7')
    expect(formatNumber(0)).toBe('0')
  })

  it('uses scientific notation for extreme magnitudes', () => {
    expect(formatNumber(1e20)).toBe('1e20')
    expect(formatNumber(1e-12)).toBe('1e-12')
  })

  it('handles non-finite values defensively', () => {
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('∞')
  })
})
