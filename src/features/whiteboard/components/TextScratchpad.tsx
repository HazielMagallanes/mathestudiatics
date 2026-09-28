import { useTranslation } from 'react-i18next'

import { buttonSecondary } from '@/shared/ui/buttons'

interface TextScratchpadProps {
  text: string
  onTextChange: (text: string) => void
  onAddText: () => void
}

/** Types plain text and places it on the board (annotations). */
export function TextScratchpad({ text, onTextChange, onAddText }: TextScratchpadProps) {
  const { t } = useTranslation()

  return (
    <section className="border-rule bg-surface-raised space-y-2 rounded-lg border p-3">
      <label htmlFor="whiteboard-text" className="block text-xs font-semibold">
        {t('whiteboard.writeText')}
      </label>
      <div className="flex gap-2">
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
    </section>
  )
}
