import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import {
  historyStats,
  type HistoryEntry,
  type HistoryStatus,
} from '@/features/practice/history/history-utils'
import { buttonGhost, buttonSecondary } from '@/shared/ui/buttons'
import { cn } from '@/shared/ui/cn'

interface HistoryPanelProps {
  entries: HistoryEntry[]
  importedMessage: string | null
  onOpen: (entry: HistoryEntry) => void
  onStatusChange: (id: string, status: HistoryStatus) => void
  onClear: () => void
  onExport: () => void
  onImport: (file: File) => void
}

export function HistoryPanel({
  entries,
  importedMessage,
  onOpen,
  onStatusChange,
  onClear,
  onExport,
  onImport,
}: HistoryPanelProps) {
  const { t } = useTranslation()
  const fileInput = useRef<HTMLInputElement>(null)
  const stats = historyStats(entries)
  const recent = entries.slice(0, 10)

  return (
    <details className="rounded-lg border border-rule bg-surface-raised p-4">
      <summary className="cursor-pointer text-sm font-semibold select-none">
        {t('practice.history.title')} ({stats.total})
      </summary>

      <div className="mt-3 space-y-4">
        <p className="text-sm text-fg-muted">
          {t('practice.history.stats', {
            total: stats.total,
            solved: stats.solved,
            review: stats.review,
          })}
        </p>

        {importedMessage ? (
          <p role="status" className="text-sm text-accent">
            {importedMessage}
          </p>
        ) : null}

        {recent.length === 0 ? (
          <p className="text-sm text-fg-muted">{t('practice.history.empty')}</p>
        ) : (
          <ul className="list-none space-y-2 p-0">
            {recent.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-mono text-xs text-fg-muted">{entry.seed}</span>
                <span>{entry.units.join(' + ')}</span>
                <span className="text-xs text-fg-muted">
                  {t(`practice.difficulties.${entry.difficulty}`)}
                </span>
                <button
                  type="button"
                  className={buttonGhost}
                  onClick={() => {
                    onOpen(entry)
                  }}
                >
                  {t('practice.history.open')}
                </button>
                <button
                  type="button"
                  className={cn(buttonGhost, entry.status === 'solved' && 'text-accent')}
                  aria-pressed={entry.status === 'solved'}
                  onClick={() => {
                    onStatusChange(entry.id, 'solved')
                  }}
                >
                  {t('practice.history.solved')}
                </button>
                <button
                  type="button"
                  className={cn(buttonGhost, entry.status === 'review' && 'text-accent')}
                  aria-pressed={entry.status === 'review'}
                  onClick={() => {
                    onStatusChange(entry.id, 'review')
                  }}
                >
                  {t('practice.history.review')}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonSecondary} onClick={onExport}>
            {t('practice.history.export')}
          </button>
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => {
              fileInput.current?.click()
            }}
          >
            {t('practice.history.import')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]

              if (file) {
                onImport(file)
              }

              event.target.value = ''
            }}
          />
          <button type="button" className={buttonGhost} onClick={onClear}>
            {t('practice.history.clear')}
          </button>
        </div>
      </div>
    </details>
  )
}
