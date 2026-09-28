import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarkdownContent } from '@/features/study/components/MarkdownContent'

/**
 * Renders every study file through the real pipeline (react-markdown + GFM +
 * remark-math + rehype-katex) and fails on any artifact: this is what catches
 * multi-line `$$` blocks, unescaped braces and unparsed tables.
 */
const files = import.meta.glob<string>('./*/{theory,formulas}.*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const entries = Object.entries(files)

describe('study content rendering', () => {
  it('finds every theory and formula file', () => {
    expect(entries.length).toBeGreaterThanOrEqual(20)
  })

  for (const [path, markdown] of entries) {
    describe(path, () => {
      it('renders without math or markdown artifacts', () => {
        const { container } = render(<MarkdownContent markdown={markdown} />)
        const text = container.textContent

        expect(container.querySelector('.katex-error'), 'KaTeX error').toBeNull()
        expect(container.querySelector('.katex'), 'rendered math').not.toBeNull()
        expect(text, 'literal display-math delimiters').not.toContain('$$')
        expect(text, 'literal bold markers').not.toContain('**')
        expect(text, 'literal heading markers').not.toContain('## ')
        expect(text, 'unparsed table separator').not.toMatch(/\|\s*-{3,}/)
      })

      const hasTable = /^\|.*\|$/m.test(markdown)

      if (hasTable) {
        it('renders tables as scrollable tables', () => {
          const { container } = render(<MarkdownContent markdown={markdown} />)
          const table = container.querySelector('table')

          expect(table, 'table element').not.toBeNull()
          expect(table?.parentElement?.className, 'scroll container').toContain('overflow-x-auto')
          expect(container.querySelector('th'), 'table header').not.toBeNull()
        })
      }
    })
  }
})
