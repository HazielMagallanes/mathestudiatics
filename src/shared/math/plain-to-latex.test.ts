import { describe, expect, it } from 'vitest'

import { looksLikeLatex, plainToLatex } from '@/shared/math/plain-to-latex'

describe('plainToLatex', () => {
  it('converts fractions', () => {
    expect(plainToLatex('1/2')).toBe('\\frac{1}{2}')
    expect(plainToLatex('1/2 + 3/4')).toBe('\\frac{1}{2} + \\frac{3}{4}')
    expect(plainToLatex('(x+1)/3')).toBe('\\frac{x+1}{3}')
    expect(plainToLatex('-1/2')).toBe('-\\frac{1}{2}')
    expect(plainToLatex('x^2/4')).toBe('\\frac{x^{2}}{4}')
  })

  it('converts roots', () => {
    expect(plainToLatex('sqrt(2)')).toBe('\\sqrt{2}')
    expect(plainToLatex('sqrt(x + 1)/2')).toBe('\\frac{\\sqrt{x + 1}}{2}')
    expect(plainToLatex('3sqrt(2)')).toBe('3\\sqrt{2}')
  })

  it('converts exponents and operators', () => {
    expect(plainToLatex('x^2 - 4 = 0')).toBe('x^{2} - 4 = 0')
    expect(plainToLatex('x^12')).toBe('x^{12}')
    expect(plainToLatex('2 * 3')).toBe('2  \\cdot  3')
    expect(plainToLatex('2x + 3 <= 7')).toBe('2x + 3 \\le  7')
    expect(plainToLatex('a >= b')).toBe('a \\ge  b')
    expect(plainToLatex('a != b')).toBe('a \\neq  b')
  })

  it('converts functions and symbols', () => {
    expect(plainToLatex('sin(30) * pi')).toBe('\\sin\\left(30)  \\cdot  \\pi ')
    expect(plainToLatex('ln(e)')).toBe('\\ln\\left(e)')
    expect(plainToLatex('theta + alpha')).toBe('\\theta  + \\alpha ')
  })

  it('passes LaTeX through untouched', () => {
    const latex = '\\frac{1}{2} + \\sqrt{3}'

    expect(looksLikeLatex(latex)).toBe(true)
    expect(plainToLatex(latex)).toBe(latex)
  })

  it('handles decimal commas and empty input', () => {
    expect(plainToLatex('1,5 + 2')).toBe('1{,}5 + 2')
    expect(plainToLatex('   ')).toBe('')
  })

  it('keeps comparisons untouched when they are not escaped operators', () => {
    expect(plainToLatex('x < 3')).toBe('x < 3')
    expect(plainToLatex('x > 3')).toBe('x > 3')
  })
})
