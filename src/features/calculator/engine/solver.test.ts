import { describe, expect, it } from 'vitest'

import { formatValue, toExactFraction } from '@/features/calculator/engine/format'
import { evaluateInput, type CalculatorOutcome } from '@/features/calculator/engine/input'
import type { EvaluationContext } from '@/features/calculator/engine/evaluate'

const context: EvaluationContext = { angleMode: 'deg', ans: 0, memory: 0 }

function outcome(
  expression: string,
  overrides: Partial<EvaluationContext> = {},
): CalculatorOutcome {
  return evaluateInput(expression, { ...context, ...overrides })
}

function solutionOf(expression: string, overrides: Partial<EvaluationContext> = {}) {
  const result = outcome(expression, overrides)

  if (result.kind !== 'equation') {
    throw new Error(`expected an equation, got ${result.kind}`)
  }

  return result.solution
}

describe('toExactFraction', () => {
  it('recovers exact fractions from floats', () => {
    expect(toExactFraction(0.5)).toEqual({ numerator: 1, denominator: 2 })
    expect(toExactFraction(5 / 6)).toEqual({ numerator: 5, denominator: 6 })
    expect(toExactFraction(-1 / 3)).toEqual({ numerator: -1, denominator: 3 })
    expect(toExactFraction(4)).toEqual({ numerator: 4, denominator: 1 })
  })

  it('rejects irrational-looking values', () => {
    expect(toExactFraction(Math.SQRT2)).toBeNull()
    expect(toExactFraction(Math.PI)).toBeNull()
  })
})

describe('formatValue', () => {
  it('renders exact fractions and integers', () => {
    expect(formatValue(5 / 6)).toEqual({ latex: '\\frac{5}{6}', exact: true })
    expect(formatValue(-2)).toEqual({ latex: '-2', exact: true })
  })

  it('falls back to decimals', () => {
    const formatted = formatValue(Math.SQRT2)

    expect(formatted.exact).toBe(false)
    expect(formatted.latex).toBe('1.41421356237')
  })
})

describe('evaluateInput: expressions', () => {
  it('still evaluates plain arithmetic exactly', () => {
    expect(outcome('2 + 3 * 4')).toEqual({ kind: 'value', value: 14 })
    expect(formatValue(1 / 3)).toEqual({ latex: '\\frac{1}{3}', exact: true })
  })

  it('keeps expressions with x symbolic', () => {
    const result = outcome('2x + 3')

    expect(result.kind).toBe('symbolic')

    if (result.kind === 'symbolic') {
      expect(result.latex).toBe('2x + 3')
    }
  })
})

describe('evaluateInput: linear equations', () => {
  it('solves with exact fractions', () => {
    expect(solutionOf('2x + 3 = 7')).toMatchObject({ kind: 'solved', latex: 'x = 2', exact: true })
    expect(solutionOf('3x = 1')).toMatchObject({ latex: 'x = \\frac{1}{3}' })
    expect(solutionOf('x/2 + 1 = 0')).toMatchObject({ latex: 'x = -2' })
  })

  it('detects contradictions and identities', () => {
    expect(solutionOf('2x = 2x + 1').kind).toBe('none')
    expect(solutionOf('2x = 2x').kind).toBe('infinite')
  })
})

describe('evaluateInput: quadratic equations', () => {
  it('solves with rational roots', () => {
    expect(solutionOf('x^2 - 4 = 0')).toMatchObject({ latex: 'x = \\pm 2', exact: true })
    expect(solutionOf('x^2 + x - 6 = 0')).toMatchObject({
      latex: 'x_1 = 2,\\quad x_2 = -3',
      exact: true,
    })
    expect(solutionOf('2x^2 + 4x - 6 = 0')).toMatchObject({ exact: true })
  })

  it('solves with irrational roots showing the exact formula and approximations', () => {
    const solution = solutionOf('x^2 + x - 1 = 0')

    expect(solution.kind).toBe('solved')
    expect(solution.exact).toBe(false)
    expect(solution.latex).toBe('x = \\frac{-1 \\pm \\sqrt{5}}{2}')
    expect(solution.approximations[0]).toBeCloseTo(0.6180339887, 8)
  })

  it('simplifies radicals without a denominator', () => {
    expect(solutionOf('x^2 - 2 = 0').latex).toBe('x = \\pm \\sqrt{2}')
  })

  it('detects double roots and missing real roots', () => {
    expect(solutionOf('x^2 - 4x + 4 = 0')).toMatchObject({ latex: 'x = 2', doubleRoot: true })
    expect(solutionOf('x^2 + 1 = 0').kind).toBe('no-real')
  })

  it('rejects equations beyond the supported degree', () => {
    const result = outcome('x^3 = 8')

    expect(result.kind).toBe('error')

    if (result.kind === 'error') {
      expect(result.error.code).toBe('unsupported')
    }
  })

  it('rejects non-polynomial equations', () => {
    const result = outcome('sin(x) = 0')

    expect(result.kind).toBe('error')

    if (result.kind === 'error') {
      expect(result.error.code).toBe('unsupported')
    }
  })
})
