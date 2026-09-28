import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

/**
 * Renders study material. Raw HTML is intentionally not enabled: only the
 * Markdown subset plus KaTeX math is rendered.
 */
export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose-study">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
