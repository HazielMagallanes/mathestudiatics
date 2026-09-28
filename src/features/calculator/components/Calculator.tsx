import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  evaluateExpression,
  type AngleMode,
  type EvaluationContext,
} from '@/features/calculator/engine/evaluate'
import { formatNumber } from '@/features/calculator/engine/format'
import type { CalculatorErrorCode } from '@/features/calculator/engine/tokenizer'
import { readLocalStorage, writeLocalStorage } from '@/shared/storage/local-storage'
import { buttonGhost, buttonSecondary } from '@/shared/ui/buttons'
import { cn } from '@/shared/ui/cn'

const HISTORY_STORAGE_KEY = 'mathestudiatics.calculator.history'
const HISTORY_LIMIT = 20

interface HistoryItem {
  expression: string
  result: string
}

type KeyLabelKey =
  | 'clear'
  | 'backspace'
  | 'power'
  | 'divide'
  | 'multiply'
  | 'subtract'
  | 'add'
  | 'sqrt'
  | 'cbrt'
  | 'abs'
  | 'factorial'
  | 'decimal'
  | 'asin'
  | 'acos'
  | 'atan'

interface KeypadButton {
  label: string
  insert: string
  ariaLabelKey?: KeyLabelKey
  className?: string
}

const KEYPAD: readonly KeypadButton[][] = [
  [
    { label: 'C', insert: '', ariaLabelKey: 'clear' },
    { label: '⌫', insert: '', ariaLabelKey: 'backspace' },
    { label: '(', insert: '(' },
    { label: ')', insert: ')' },
    { label: 'xʸ', insert: '^', ariaLabelKey: 'power' },
  ],
  [
    { label: '7', insert: '7' },
    { label: '8', insert: '8' },
    { label: '9', insert: '9' },
    { label: '÷', insert: '/', ariaLabelKey: 'divide' },
    { label: '√', insert: 'sqrt(', ariaLabelKey: 'sqrt' },
  ],
  [
    { label: '4', insert: '4' },
    { label: '5', insert: '5' },
    { label: '6', insert: '6' },
    { label: '×', insert: '*', ariaLabelKey: 'multiply' },
    { label: '∛', insert: 'cbrt(', ariaLabelKey: 'cbrt' },
  ],
  [
    { label: '1', insert: '1' },
    { label: '2', insert: '2' },
    { label: '3', insert: '3' },
    { label: '−', insert: '-', ariaLabelKey: 'subtract' },
    { label: '|x|', insert: 'abs(', ariaLabelKey: 'abs' },
  ],
  [
    { label: '0', insert: '0' },
    { label: ',', insert: ',', ariaLabelKey: 'decimal' },
    { label: 'π', insert: 'pi' },
    { label: '+', insert: '+', ariaLabelKey: 'add' },
    { label: 'n!', insert: '!', ariaLabelKey: 'factorial' },
  ],
  [
    { label: 'sin', insert: 'sin(' },
    { label: 'cos', insert: 'cos(' },
    { label: 'tan', insert: 'tan(' },
    { label: 'ln', insert: 'ln(' },
    { label: 'log', insert: 'log(' },
  ],
  [
    { label: 'sin⁻¹', insert: 'asin(', ariaLabelKey: 'asin' },
    { label: 'cos⁻¹', insert: 'acos(', ariaLabelKey: 'acos' },
    { label: 'tan⁻¹', insert: 'atan(', ariaLabelKey: 'atan' },
    { label: 'e', insert: 'e' },
    { label: 'ANS', insert: 'ans' },
  ],
]

function readStoredHistory(): HistoryItem[] {
  const stored = readLocalStorage(HISTORY_STORAGE_KEY)

  if (!stored) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter(
        (item): item is HistoryItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as HistoryItem).expression === 'string' &&
          typeof (item as HistoryItem).result === 'string',
      )
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function Calculator({ className }: { className?: string }) {
  const { t } = useTranslation()
  const [expression, setExpression] = useState('')
  const [angleMode, setAngleMode] = useState<AngleMode>('deg')
  const [ans, setAns] = useState(0)
  const [memory, setMemory] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>(readStoredHistory)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const context: EvaluationContext = useMemo(
    () => ({ angleMode, ans, memory }),
    [angleMode, ans, memory],
  )
  const preview = useMemo(
    () => (expression.trim().length > 0 ? evaluateExpression(expression, context) : null),
    [expression, context],
  )

  useEffect(() => {
    writeLocalStorage(HISTORY_STORAGE_KEY, JSON.stringify(history))
  }, [history])

  const insert = (text: string): void => {
    const input = inputRef.current

    if (!input) {
      setExpression((current) => current + text)
      return
    }

    const start = input.selectionStart ?? expression.length
    const end = input.selectionEnd ?? start
    const next = expression.slice(0, start) + text + expression.slice(end)

    setExpression(next)

    window.requestAnimationFrame(() => {
      input.focus()
      const position = start + text.length
      input.setSelectionRange(position, position)
    })
  }

  const submit = (): void => {
    if (expression.trim().length === 0) {
      return
    }

    const result = evaluateExpression(expression, context)

    if (!result.ok) {
      return
    }

    const formatted = formatNumber(result.value)

    setAns(result.value)
    setHistory((current) => [{ expression, result: formatted }, ...current].slice(0, HISTORY_LIMIT))
    setExpression(formatted)
  }

  const clearAll = (): void => {
    setExpression('')
    inputRef.current?.focus()
  }

  const backspace = (): void => {
    const input = inputRef.current

    if (!input) {
      setExpression((current) => current.slice(0, -1))
      return
    }

    const start = input.selectionStart ?? expression.length
    const end = input.selectionEnd ?? start

    if (start === end && start === 0) {
      return
    }

    const next =
      start === end
        ? expression.slice(0, Math.max(0, start - 1)) + expression.slice(end)
        : expression.slice(0, start) + expression.slice(end)

    setExpression(next)

    window.requestAnimationFrame(() => {
      input.focus()
      const position = start === end ? Math.max(0, start - 1) : start
      input.setSelectionRange(position, position)
    })
  }

  const applyMemory = (operation: 'add' | 'subtract' | 'recall' | 'clear'): void => {
    switch (operation) {
      case 'add':
        if (preview?.ok) {
          setMemory((current) => current + preview.value)
        }
        return
      case 'subtract':
        if (preview?.ok) {
          setMemory((current) => current - preview.value)
        }
        return
      case 'recall':
        insert(formatNumber(memory))
        return
      case 'clear':
        setMemory(0)
    }
  }

  const errorCode: CalculatorErrorCode | null = preview && !preview.ok ? preview.error.code : null
  const resultText = preview?.ok ? formatNumber(preview.value) : ''

  return (
    <div className={cn('space-y-4', className)}>
      <div className="border-rule bg-surface-raised space-y-3 rounded-lg border p-4">
        <label htmlFor="calculator-expression" className="block text-xs font-semibold">
          {t('calculator.expression')}
        </label>
        <input
          id="calculator-expression"
          ref={inputRef}
          value={expression}
          onChange={(event) => {
            setExpression(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }

            if (event.key === 'Escape') {
              clearAll()
            }
          }}
          placeholder={t('calculator.expressionPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          className="border-rule bg-surface w-full rounded-md border px-3 py-2 font-mono text-lg"
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-fg-muted">{t('calculator.result')}</span>
          <span
            role="status"
            aria-live="polite"
            className={cn('font-mono text-lg', errorCode ? 'text-accent' : 'text-fg')}
          >
            {errorCode ? t(`calculator.errors.${errorCode}`) : resultText}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">{t('calculator.angleMode')}</legend>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="calculator-angle-mode"
                checked={angleMode === 'deg'}
                onChange={() => {
                  setAngleMode('deg')
                }}
              />
              {t('calculator.degrees')}
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="calculator-angle-mode"
                checked={angleMode === 'rad'}
                onChange={() => {
                  setAngleMode('rad')
                }}
              />
              {t('calculator.radians')}
            </label>
          </fieldset>

          <span className="text-fg-muted" aria-live="polite">
            {t('calculator.memory')}: {memory !== 0 ? formatNumber(memory) : '—'}
          </span>

          <span className="flex gap-1">
            <button
              type="button"
              className={buttonGhost}
              onClick={() => {
                applyMemory('add')
              }}
            >
              {t('calculator.memoryAdd')}
            </button>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => {
                applyMemory('subtract')
              }}
            >
              {t('calculator.memorySubtract')}
            </button>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => {
                applyMemory('recall')
              }}
            >
              {t('calculator.memoryRecall')}
            </button>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => {
                applyMemory('clear')
              }}
            >
              {t('calculator.memoryClear')}
            </button>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {KEYPAD.flat().map((button, index) => (
            <button
              key={`${button.label}-${String(index)}`}
              type="button"
              aria-label={
                button.ariaLabelKey ? t(`calculator.keys.${button.ariaLabelKey}`) : undefined
              }
              onClick={() => {
                if (button.ariaLabelKey === 'clear') {
                  clearAll()
                  return
                }

                if (button.ariaLabelKey === 'backspace') {
                  backspace()
                  return
                }

                insert(button.insert)
              }}
              className="border-rule bg-surface hover:border-accent rounded-md border px-1 py-2 text-sm font-medium"
            >
              {button.label}
            </button>
          ))}
        </div>

        <button type="button" className={cn(buttonSecondary, 'w-full')} onClick={submit}>
          {t('calculator.equals')}
        </button>
      </div>

      <details className="border-rule bg-surface-raised rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-semibold select-none">
          {t('calculator.history')} ({history.length})
        </summary>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">{t('calculator.historyEmpty')}</p>
        ) : (
          <ul className="mt-2 list-none space-y-1 p-0 text-sm">
            {history.map((item, index) => (
              <li key={`${item.expression}-${String(index)}`} className="flex items-center gap-2">
                <button
                  type="button"
                  className={buttonGhost}
                  onClick={() => {
                    insert(item.expression)
                  }}
                >
                  {t('calculator.reuse')}
                </button>
                <span className="font-mono text-xs text-fg-muted">{item.expression}</span>
                <span aria-hidden="true">=</span>
                <span className="font-mono">{item.result}</span>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  )
}
