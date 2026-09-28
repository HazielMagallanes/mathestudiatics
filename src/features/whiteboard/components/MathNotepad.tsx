import { useCallback, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { useTranslation } from 'react-i18next'

import type { MathObject } from '@/features/whiteboard/model/types'
import { plainToLatex } from '@/shared/math/plain-to-latex'
import { buttonGhost } from '@/shared/ui/buttons'
import { cn } from '@/shared/ui/cn'
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
  { latex: '\\cap', label: '∩' },
  { latex: '\\cup', label: '∪' },
  { latex: '\\Rightarrow', label: '⇒' },
  { latex: '\\Leftrightarrow', label: '⇔' },
  { latex: '\\infty', label: '∞' },
  { latex: '\\cdot', label: '·' },
  { latex: '\\theta', label: 'θ' },
]

export const NOTEPAD_NEW_LINE_ID = 'whiteboard-notepad-new'

export interface MathNotepadHandle {
  focusEntry: (entryId: string) => void
}

interface MathNotepadProps {
  /** Keyboard entries in notepad order. */
  entries: readonly MathObject[]
  /** `null` commits a brand new line. */
  onCommit: (entryId: string | null, source: string) => void
  onRemove: (entryId: string) => void
  ref?: Ref<MathNotepadHandle>
}

type ActiveLine = string | null

const NEW_LINE = 'new'

export function MathNotepad({ entries, onCommit, onRemove, ref }: MathNotepadProps) {
  const { t } = useTranslation()
  const [activeLine, setActiveLine] = useState<ActiveLine>(null)
  const [drafts, setDrafts] = useState<ReadonlyMap<string, string>>(() => new Map())
  const [newLine, setNewLine] = useState('')
  const inputRefs = useRef(new Map<string, HTMLInputElement>())

  const draftOf = useCallback(
    (entry: MathObject): string => drafts.get(entry.id) ?? entry.source ?? '',
    [drafts],
  )

  const focusLine = useCallback((line: ActiveLine) => {
    if (line === null) {
      return
    }

    window.requestAnimationFrame(() => {
      inputRefs.current.get(line === NEW_LINE ? NOTEPAD_NEW_LINE_ID : line)?.focus()
    })
  }, [])

  const activate = useCallback(
    (line: ActiveLine) => {
      setActiveLine(line)
      focusLine(line)
    },
    [focusLine],
  )

  useImperativeHandle(
    ref,
    () => ({
      focusEntry: (entryId: string) => {
        activate(entryId)
      },
    }),
    [activate],
  )

  const clearDraft = (entryId: string): void => {
    setDrafts((current) => {
      const next = new Map(current)
      next.delete(entryId)
      return next
    })
  }

  const commit = (line: ActiveLine): void => {
    if (line === null) {
      return
    }

    const value = line === NEW_LINE ? newLine : (drafts.get(line) ?? '')

    if (value.trim().length === 0) {
      if (line !== NEW_LINE) {
        onRemove(line)
      }

      return
    }

    onCommit(line === NEW_LINE ? null : line, value)

    if (line === NEW_LINE) {
      setNewLine('')
      focusLine(NEW_LINE)
      return
    }

    clearDraft(line)

    const index = entries.findIndex((entry) => entry.id === line)
    const following = entries[index + 1]

    activate(following ? following.id : NEW_LINE)
  }

  const cancel = (line: ActiveLine): void => {
    if (line === null) {
      return
    }

    if (line === NEW_LINE) {
      setNewLine('')
    } else {
      clearDraft(line)
    }

    setActiveLine(null)
  }

  const move = (line: ActiveLine, direction: -1 | 1): void => {
    if (line === null) {
      return
    }

    const order: string[] = [...entries.map((entry) => entry.id), NEW_LINE]
    const index = order.indexOf(line)

    if (index < 0) {
      return
    }

    const next = order[index + direction]

    if (next === undefined) {
      return
    }

    activate(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, line: ActiveLine): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit(line)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancel(line)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(line, 1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(line, -1)
      return
    }

    if (event.key === 'Backspace' && line !== null && line !== NEW_LINE) {
      const value = drafts.get(line) ?? ''

      if (value.length === 0) {
        event.preventDefault()
        onRemove(line)
        setActiveLine(null)
      }
    }
  }

  const insertSymbol = (latex: string): void => {
    if (activeLine === null || activeLine === NEW_LINE) {
      setActiveLine(NEW_LINE)
      setNewLine((current) => current + latex)
      focusLine(NEW_LINE)
      return
    }

    setDrafts((current) =>
      new Map(current).set(activeLine, (current.get(activeLine) ?? '') + latex),
    )
  }

  return (
    <section className="border-rule bg-surface-raised space-y-3 rounded-lg border p-3">
      <div>
        <h2 className="text-sm font-semibold">{t('whiteboard.notepad.title')}</h2>
        <p className="text-xs text-fg-muted">{t('whiteboard.notepad.hint')}</p>
      </div>

      {entries.length === 0 && activeLine === null ? (
        <p className="text-xs text-fg-muted">{t('whiteboard.notepad.empty')}</p>
      ) : null}

      <ol className="list-none space-y-2 p-0">
        {entries.map((entry, index) => {
          const isActive = activeLine === entry.id

          return (
            <li key={entry.id} className="flex items-start gap-2">
              <span aria-hidden="true" className="pt-1 text-xs text-fg-muted">
                {index + 1}
              </span>

              {isActive ? (
                <div className="min-w-0 flex-1 space-y-1">
                  <input
                    ref={(element) => {
                      if (element) {
                        inputRefs.current.set(entry.id, element)
                      } else {
                        inputRefs.current.delete(entry.id)
                      }
                    }}
                    value={draftOf(entry)}
                    aria-label={t('whiteboard.notepad.lineLabel', { index: index + 1 })}
                    onChange={(event) => {
                      setDrafts((current) => new Map(current).set(entry.id, event.target.value))
                    }}
                    onKeyDown={(event) => {
                      handleKeyDown(event, entry.id)
                    }}
                    className="border-rule bg-surface w-full rounded-md border px-2 py-1 font-mono text-sm"
                  />
                  <p className="text-sm text-fg-muted">
                    <MathText text={`$${plainToLatex(draftOf(entry))}$`} />
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={t('whiteboard.notepad.lineLabel', { index: index + 1 })}
                  onClick={() => {
                    activate(entry.id)
                  }}
                  className="hover:border-accent min-w-0 flex-1 rounded-md border border-transparent px-2 py-1 text-left"
                >
                  <MathText text={`$${entry.latex}$`} />
                </button>
              )}

              <button
                type="button"
                className={buttonGhost}
                aria-label={t('whiteboard.notepad.deleteLine', { index: index + 1 })}
                onClick={() => {
                  onRemove(entry.id)
                }}
              >
                ×
              </button>
            </li>
          )
        })}

        <li className="flex items-start gap-2">
          <span aria-hidden="true" className="pt-1 text-xs text-fg-muted">
            {entries.length + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <input
              id={NOTEPAD_NEW_LINE_ID}
              ref={(element) => {
                if (element) {
                  inputRefs.current.set(NOTEPAD_NEW_LINE_ID, element)
                } else {
                  inputRefs.current.delete(NOTEPAD_NEW_LINE_ID)
                }
              }}
              value={newLine}
              placeholder={t('whiteboard.notepad.placeholder')}
              aria-label={t('whiteboard.notepad.newLineLabel')}
              onFocus={() => {
                setActiveLine(NEW_LINE)
              }}
              onChange={(event) => {
                setNewLine(event.target.value)
              }}
              onKeyDown={(event) => {
                handleKeyDown(event, NEW_LINE)
              }}
              className="border-rule bg-surface w-full rounded-md border px-2 py-1 font-mono text-sm"
            />
            {activeLine === NEW_LINE && newLine.trim().length > 0 ? (
              <p className="text-sm text-fg-muted">
                <MathText text={`$${plainToLatex(newLine)}$`} />
              </p>
            ) : null}
          </div>
        </li>
      </ol>

      <div role="group" aria-label={t('whiteboard.symbols')} className="flex flex-wrap gap-1">
        {SYMBOLS.map((symbol) => (
          <button
            key={symbol.latex}
            type="button"
            className={cn(buttonGhost)}
            title={symbol.latex}
            onClick={() => {
              insertSymbol(symbol.latex)
            }}
          >
            {symbol.label}
          </button>
        ))}
      </div>
    </section>
  )
}
