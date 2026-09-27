import katex from 'katex'
import { Fragment, useMemo } from 'react'

import { splitMathSegments } from '@/shared/ui/math-segments'

interface MathTextProps {
  text: string
  className?: string
}

/**
 * Renders text with embedded `$…$` (inline) and `$$…$$` (display) math using
 * KaTeX. Content is authored by us; `trust: false` keeps KaTeX from rendering
 * arbitrary HTML or URLs even if a template ever contained untrusted text.
 */
export function MathText({ text, className }: MathTextProps) {
  const segments = useMemo(() => splitMathSegments(text), [text])

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.kind === 'text') {
          return <Fragment key={index}>{segment.value}</Fragment>
        }

        const html = katex.renderToString(segment.value, {
          throwOnError: false,
          trust: false,
          displayMode: segment.kind === 'display',
          output: 'html',
        })

        return (
          <span
            key={index}
            className={segment.kind === 'display' ? 'my-2 block overflow-x-auto' : undefined}
            // Safe: KaTeX escapes its input and trust is disabled.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })}
    </span>
  )
}
