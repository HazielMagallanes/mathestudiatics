import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MathText } from '@/shared/ui/MathText'
import { splitMathSegments } from '@/shared/ui/math-segments'

describe('splitMathSegments', () => {
  it('splits text, inline math and display math', () => {
    expect(splitMathSegments('Sea $x^2$ y $$\\frac{1}{2}$$ fin')).toEqual([
      { kind: 'text', value: 'Sea ' },
      { kind: 'inline', value: 'x^2' },
      { kind: 'text', value: ' y ' },
      { kind: 'display', value: '\\frac{1}{2}' },
      { kind: 'text', value: ' fin' },
    ])
  })

  it('returns a single text segment when there is no math', () => {
    expect(splitMathSegments('sin matemática')).toEqual([{ kind: 'text', value: 'sin matemática' }])
  })

  it('ignores an unmatched dollar sign', () => {
    expect(splitMathSegments('cuesta $5 y nada más')).toEqual([
      { kind: 'text', value: 'cuesta $5 y nada más' },
    ])
  })
})

describe('MathText', () => {
  it('renders inline math with KaTeX', () => {
    const { container } = render(<MathText text="Suma $\\frac{1}{2} + \\frac{1}{3}$" />)

    expect(container.querySelector('.katex')).not.toBeNull()
    expect(screen.getByText(/Suma/)).toBeInTheDocument()
  })

  it('renders display math as a block', () => {
    const { container } = render(<MathText text="$$x^2 + y^2 = r^2$$" />)

    expect(container.querySelector('.katex-display')).not.toBeNull()
  })

  it('does not throw on invalid LaTeX', () => {
    expect(() => render(<MathText text="$\\frac{1}$" />)).not.toThrow()
  })

  it('escapes plain text instead of rendering HTML', () => {
    const { container } = render(<MathText text="<script>alert('x')</script>" />)

    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toContain("<script>alert('x')</script>")
  })

  it('does not render links from untrusted math input', () => {
    const { container } = render(<MathText text="$\\href{javascript:alert(1)}{x}$" />)

    expect(container.querySelector('a')).toBeNull()
  })
})
