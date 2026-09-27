import { describe, expect, it } from 'vitest'

import {
  extractSquareFactor,
  fractionLatex,
  intervalLatex,
  logLatex,
  naturalLogLatex,
  powerLatex,
  radicalLatex,
  setLatex,
} from '@/content/blocks/latex'

describe('fractionLatex', () => {
  it('renders integers without a fraction', () => {
    expect(fractionLatex({ numerator: 3, denominator: 1 })).toBe('3')
    expect(fractionLatex({ numerator: -3, denominator: 1 })).toBe('-3')
  })

  it('keeps the sign outside the fraction', () => {
    expect(fractionLatex({ numerator: -3, denominator: 4 })).toBe('-\\frac{3}{4}')
    expect(fractionLatex({ numerator: 3, denominator: 4 })).toBe('\\frac{3}{4}')
  })
})

describe('radicalLatex', () => {
  it('omits unnecessary parts', () => {
    expect(radicalLatex(3, 2)).toBe('3\\sqrt{2}')
    expect(radicalLatex(1, 2)).toBe('\\sqrt{2}')
    expect(radicalLatex(-2, 3)).toBe('-2\\sqrt{3}')
    expect(radicalLatex(4, 1)).toBe('4')
  })
})

describe('powerLatex and logarithms', () => {
  it('formats powers and logs', () => {
    expect(powerLatex('x', 2)).toBe('x^{2}')
    expect(powerLatex('2', -3)).toBe('2^{-3}')
    expect(logLatex(2, '8')).toBe('\\log_{2}\\left(8\\right)')
    expect(naturalLogLatex('1')).toBe('\\ln\\left(1\\right)')
  })
})

describe('intervalLatex', () => {
  it('renders bounded intervals', () => {
    expect(intervalLatex({ from: 3, to: 5, fromInclusive: true, toInclusive: false })).toBe(
      '\\left[3,\\, 5\\right)',
    )
  })

  it('renders unbounded intervals with infinite limits', () => {
    expect(intervalLatex({ from: 3, to: null, fromInclusive: true, toInclusive: false })).toBe(
      '\\left[3,\\, +\\infty\\right)',
    )
    expect(intervalLatex({ from: null, to: -2, fromInclusive: false, toInclusive: true })).toBe(
      '\\left(-\\infty,\\, -2\\right]',
    )
  })
})

describe('setLatex', () => {
  it('renders finite sets and the empty set', () => {
    expect(setLatex([1, 2, 3])).toBe('\\left\\{1,\\, 2,\\, 3\\right\\}')
    expect(setLatex([])).toBe('\\varnothing')
    expect(setLatex([], { empty: 'S' })).toBe('S')
  })
})

describe('extractSquareFactor', () => {
  it.each([
    [72, 6, 2],
    [12, 2, 3],
    [49, 7, 1],
    [17, 1, 17],
    [1, 1, 1],
    [20, 2, 5],
  ])('%i → %i√%i', (radicand, outside, inside) => {
    expect(extractSquareFactor(radicand)).toEqual({ outside, inside })
  })

  it('rejects negative radicands', () => {
    expect(() => extractSquareFactor(-4)).toThrow(RangeError)
  })
})
