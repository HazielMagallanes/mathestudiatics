import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

/**
 * Tables can be wider than a phone screen, so they scroll horizontally
 * instead of stretching the page.
 */
const COMPONENTS: Components = {
  table: ({ children, ...props }) => (
    <div className="border-rule overflow-x-auto rounded-md border">
      <table {...props}>{children}</table>
    </div>
  ),
}

/**
 * Renders study material: Markdown with GFM (tables, strikethrough, task
 * lists) and KaTeX math. Raw HTML is intentionally not enabled.
 */
export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose-study">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={COMPONENTS}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
