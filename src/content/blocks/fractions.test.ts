import { describe, expect, it } from 'vitest'

import {
  addFractions,
  commonDenominatorFactors,
  divideFractions,
  gcd,
  isInteger,
  lcm,
  multiplyFractions,
  simplifyFraction,
  subtractFractions,
} from '@/content/blocks/fractions'

describe('gcd and lcm', () => {
  it.each([
    [12, 18, 6],
    [7, 13, 1],
    [-12, 18, 6],
    [12, -18, 6],
    [0, 5, 5],
    [0, 0, 0],
  ])('gcd(%i, %i) = %i', (a, b, expected) => {
    expect(gcd(a, b)).toBe(expected)
  })

  it.each([
    [4, 6, 12],
    [3, 5, 15],
    [0, 5, 0],
  ])('lcm(%i, %i) = %i', (a, b, expected) => {
    expect(lcm(a, b)).toBe(expected)
  })
})

describe('simplifyFraction', () => {
  it('reduces to lowest terms', () => {
    expect(simplifyFraction(6, 8)).toEqual({ numerator: 3, denominator: 4 })
    expect(simplifyFraction(10, 5)).toEqual({ numerator: 2, denominator: 1 })
  })

  it('keeps the sign on the numerator', () => {
    expect(simplifyFraction(3, -6)).toEqual({ numerator: -1, denominator: 2 })
    expect(simplifyFraction(-3, -6)).toEqual({ numerator: 1, denominator: 2 })
  })

  it('rejects zero denominators', () => {
    expect(() => simplifyFraction(1, 0)).toThrow(RangeError)
  })
})

describe('fraction operations', () => {
  it('adds and subtracts with exact fractions', () => {
    expect(
      addFractions({ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }),
    ).toEqual({
      numerator: 5,
      denominator: 6,
    })
    expect(
      subtractFractions({ numerator: 3, denominator: 4 }, { numerator: 1, denominator: 2 }),
    ).toEqual({ numerator: 1, denominator: 4 })
  })

  it('multiplies and divides with simplification', () => {
    expect(
      multiplyFractions({ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 4 }),
    ).toEqual({ numerator: 1, denominator: 2 })
    expect(
      divideFractions({ numerator: 1, denominator: 2 }, { numerator: 3, denominator: 4 }),
    ).toEqual({ numerator: 2, denominator: 3 })
  })

  it('rejects division by a zero fraction', () => {
    expect(() =>
      divideFractions({ numerator: 1, denominator: 2 }, { numerator: 0, denominator: 3 }),
    ).toThrow(RangeError)
  })
})

describe('commonDenominatorFactors', () => {
  it('computes the lcm and the scaling factors', () => {
    expect(
      commonDenominatorFactors({ numerator: 1, denominator: 4 }, { numerator: 1, denominator: 6 }),
    ).toEqual({ leftFactor: 3, rightFactor: 2, denominator: 12 })
  })

  it('uses factor 1 when denominators are equal', () => {
    expect(
      commonDenominatorFactors({ numerator: 1, denominator: 5 }, { numerator: 2, denominator: 5 }),
    ).toEqual({ leftFactor: 1, rightFactor: 1, denominator: 5 })
  })
})

describe('isInteger', () => {
  it('detects integer fractions', () => {
    expect(isInteger({ numerator: 4, denominator: 1 })).toBe(true)
    expect(isInteger({ numerator: 4, denominator: 2 })).toBe(false)
  })
})
