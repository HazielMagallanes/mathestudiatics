import { useTranslation } from 'react-i18next'

import { buttonGhost, buttonSecondary } from '@/shared/ui/buttons'
import { MathText } from '@/shared/ui/MathText'

const SYMBOLS: readonly { latex: string; label: string }[] = [
  { latex: '\\frac{}{}', label: 'a/b' },
  { latex: '^{}', label: 'xⁿ' },
  { latex: '\\sqrt{}', label: '√' },
  { latex: '\\pi', label: 'π' },
  { latex: '\\le', label: '≤' },
  { latex: '\\ge', label: '≥' },
  { latex: '\\neq', label: '≠' },
  { latex: '\\in', label: '∈' },
  { latex: '\\notin', label: '∉' },
  { latex: '\\cap', label: '∩' },
  { latex: '\\cup', label: '∪' },
  { latex: '\\Rightarrow', label: '⇒' },
  { latex: '\\Leftrightarrow', label: '⇔' },
  { latex: '\\infty', label: '∞' },
  { latex: '\\cdot', label: '·' },
  { latex: '\\theta', label: 'θ' },
  { latex: '\\alpha', label: 'α' },
  { latex: '\\beta', label: 'β' },
]

interface MathScratchpadProps {
  text: string
  latex: string
  onTextChange: (text: string) => void
  onLatexChange: (latex: string) => void
  onAddText: () => void
  onAddMath: () => void
}

export function MathScratchpad({
  text,
  latex,
  onTextChange,
  onLatexChange,
  onAddText,
  onAddMath,
}: MathScratchpadProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-4 rounded-lg border border-rule bg-surface-raised p-3">
      <div>
        <label htmlFor="whiteboard-text" className="block text-xs font-semibold">
          {t('whiteboard.writeText')}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="whiteboard-text"
            value={text}
            onChange={(event) => {
              onTextChange(event.target.value)
            }}
            placeholder={t('whiteboard.writeTextPlaceholder')}
            className="border-rule bg-surface min-w-0 flex-1 rounded-md border px-2 py-1 text-sm"
          />
          <button type="button" className={buttonSecondary} onClick={onAddText}>
            {t('whiteboard.addText')}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="whiteboard-math" className="block text-xs font-semibold">
          {t('whiteboard.writeMath')}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="whiteboard-math"
            value={latex}
            onChange={(event) => {
              onLatexChange(event.target.value)
            }}
            placeholder={t('whiteboard.writeMathPlaceholder')}
            className="border-rule bg-surface min-w-0 flex-1 rounded-md border px-2 py-1 font-mono text-sm"
          />
          <button type="button" className={buttonSecondary} onClick={onAddMath}>
            {t('whiteboard.addMath')}
          </button>
        </div>

        <div className="border-rule bg-surface mt-2 min-h-12 overflow-x-auto rounded-md border border-dashed p-2 text-lg">
          {latex.trim().length > 0 ? (
            <MathText text={`$${latex}$`} />
          ) : (
            <span className="text-xs text-fg-muted">{t('whiteboard.preview')}</span>
          )}
        </div>

        <div
          role="group"
          aria-label={t('whiteboard.symbols')}
          className="mt-2 flex flex-wrap gap-1"
        >
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol.latex}
              type="button"
              className={buttonGhost}
              title={symbol.latex}
              onClick={() => {
                onLatexChange(latex + symbol.latex)
              }}
            >
              {symbol.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
