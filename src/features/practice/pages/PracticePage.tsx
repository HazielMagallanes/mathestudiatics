import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import { randomSeed } from '@/content/blocks/random'
import { generateExercise } from '@/content/generate'
import type { Difficulty } from '@/content/schema'
import type { MixPreference } from '@/content/select'
import { ExerciseCard } from '@/features/practice/components/ExerciseCard'
import { HistoryPanel } from '@/features/practice/components/HistoryPanel'
import { PracticeControls } from '@/features/practice/components/PracticeControls'
import {
  clearHistory,
  exportHistory,
  importHistory,
  listHistory,
  recordExercise,
  setEntryStatus,
} from '@/features/practice/history/history'
import type { HistoryEntry, HistoryStatus } from '@/features/practice/history/history-utils'
import { readPinnedExercise, writePinnedExercise } from '@/features/practice/state/pinned-exercise'
import { buildPracticeSearch, parsePracticeSearch } from '@/features/practice/state/practice-search'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { PageHeader } from '@/shared/ui/PageHeader'

function downloadJson(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/** Read through a function so TypeScript keeps the `undefined` possibility. */
function getClipboard(): Clipboard | undefined {
  return typeof navigator === 'undefined' ? undefined : navigator.clipboard
}

export default function PracticePage() {
  const { t } = useTranslation()
  const title = t('practice.title')

  useDocumentTitle(title)

  const [searchParams, setSearchParams] = useSearchParams()
  const selection = parsePracticeSearch(searchParams)
  const unitsKey = selection.units.join(',')
  const { difficulty, mix } = selection

  const [seed, setSeed] = useState(() => selection.seed ?? randomSeed())
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [importedMessage, setImportedMessage] = useState<string | null>(null)
  const [pinnedSeed, setPinnedSeed] = useState<string | null>(
    () => readPinnedExercise()?.seed ?? null,
  )
  const navigate = useNavigate()

  // Keep the URL in sync so every exercise is bookmarkable and shareable.
  const desiredSearch = useMemo(
    () => buildPracticeSearch({ units: unitsKey.split(','), difficulty, mix, seed }).toString(),
    [unitsKey, difficulty, mix, seed],
  )

  useEffect(() => {
    if (desiredSearch !== searchParams.toString()) {
      setSearchParams(new URLSearchParams(desiredSearch), { replace: true })
    }
  }, [desiredSearch, searchParams, setSearchParams])

  const exercise = useMemo(
    () => generateExercise({ units: unitsKey.split(','), difficulty, mix, seed }),
    [unitsKey, difficulty, mix, seed],
  )

  const syncToken = useRef(0)

  useEffect(() => {
    const token = ++syncToken.current

    const syncHistory = async (): Promise<void> => {
      const entries = await listHistory()

      if (!exercise) {
        setHistory(entries)
        return
      }

      const next = await recordExercise({
        id: exercise.id,
        seed: exercise.seed,
        units: [...exercise.unitIds],
        difficulty: exercise.difficulty,
        mix,
      })

      if (syncToken.current === token) {
        setHistory(next)
      }
    }

    void syncHistory()
  }, [exercise, mix])

  const updateSelection = useCallback(
    (patch: { units?: string[]; difficulty?: Difficulty; mix?: MixPreference }) => {
      setSearchParams(
        buildPracticeSearch({
          units: patch.units ?? selection.units,
          difficulty: patch.difficulty ?? difficulty,
          mix: patch.mix ?? mix,
          seed,
        }),
      )
    },
    [difficulty, mix, seed, selection.units, setSearchParams],
  )

  const handleToggleUnit = (unitId: string): void => {
    const isSelected = selection.units.includes(unitId)

    if (isSelected) {
      if (selection.units.length > 1) {
        updateSelection({ units: selection.units.filter((unit) => unit !== unitId) })
      }

      return
    }

    if (selection.units.length < 2) {
      updateSelection({ units: [...selection.units, unitId] })
    }
  }

  const handleCopyLink = (): void => {
    const clipboard = getClipboard()

    if (!clipboard) {
      return
    }

    void clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
      .catch(() => {
        // Clipboard unavailable (insecure context): the URL is still visible.
      })
  }

  const handlePin = (): void => {
    writePinnedExercise({ seed, units: selection.units, difficulty, mix })
    setPinnedSeed(seed)
  }

  const handlePinAndGo = (): void => {
    handlePin()
    void navigate('/board')
  }

  const handleOpenEntry = (entry: HistoryEntry): void => {
    setSeed(entry.seed)
    setSearchParams(
      buildPracticeSearch({
        units: entry.units,
        difficulty: entry.difficulty,
        mix: entry.mix,
        seed: entry.seed,
      }),
    )
  }

  const handleStatusChange = (id: string, status: HistoryStatus): void => {
    void setEntryStatus(id, status).then(setHistory)
  }

  const handleClear = (): void => {
    void clearHistory().then(setHistory)
  }

  const handleExport = (): void => {
    void exportHistory().then((json) => {
      downloadJson('mathestudiatics-history.json', json)
    })
  }

  const handleImport = (file: File): void => {
    void file
      .text()
      .then((contents) => importHistory(contents))
      .then(({ entries, imported }) => {
        setHistory(entries)
        setImportedMessage(t('practice.history.imported', { count: imported }))
      })
      .catch((error: unknown) => {
        setImportedMessage(error instanceof Error ? error.message : String(error))
      })
  }

  return (
    <div className="space-y-8">
      <PageHeader title={title} description={t('practice.description')} />

      <PracticeControls
        selectedUnits={selection.units}
        difficulty={difficulty}
        mix={mix}
        onToggleUnit={handleToggleUnit}
        onDifficultyChange={(next) => {
          updateSelection({ difficulty: next })
        }}
        onMixChange={(next) => {
          updateSelection({ mix: next })
        }}
      />

      {exercise ? (
        <ExerciseCard
          exercise={exercise}
          copied={copied}
          pinned={pinnedSeed === seed}
          onNewExercise={() => {
            setSeed(randomSeed())
            setCopied(false)
          }}
          onCopyLink={handleCopyLink}
          onPin={handlePin}
          onPinAndGo={handlePinAndGo}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-rule bg-surface-raised p-5 text-sm text-fg-muted">
          {t('practice.noGenerator')}
        </p>
      )}

      <HistoryPanel
        entries={history}
        importedMessage={importedMessage}
        onOpen={handleOpenEntry}
        onStatusChange={handleStatusChange}
        onClear={handleClear}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  )
}
