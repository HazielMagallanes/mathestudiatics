import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { generateExercise } from '@/content/generate'
import { findUnit } from '@/content/registry'
import { ExerciseStatement } from '@/features/practice/components/ExerciseStatement'
import {
  clearPinnedExercise,
  readPinnedExercise,
  type PinnedExercise,
} from '@/features/practice/state/pinned-exercise'
import { buildPracticeSearch } from '@/features/practice/state/practice-search'
import { useContentLocale } from '@/shared/i18n/useContentLocale'
import { buttonGhost, buttonSecondary } from '@/shared/ui/buttons'

/** Shows the exercise pinned from the practice page, if any. */
export function PinnedExercisePanel() {
  const { t } = useTranslation()
  const locale = useContentLocale()
  const [pinned, setPinned] = useState<PinnedExercise | null>(readPinnedExercise)

  if (!pinned) {
    return null
  }

  const exercise = generateExercise({
    units: pinned.units,
    difficulty: pinned.difficulty,
    mix: pinned.mix,
    seed: pinned.seed,
  })

  if (!exercise) {
    return null
  }

  const badgeClass = 'rounded-full border border-rule px-2 py-0.5 text-xs font-medium text-fg-muted'

  return (
    <section
      aria-label={t('whiteboard.pinned.title')}
      className="border-rule bg-surface-raised rounded-lg border p-5"
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold">{t('whiteboard.pinned.title')}</h2>
        {exercise.unitIds.map((unitId) => (
          <span key={unitId} className={badgeClass}>
            {findUnit(unitId)?.title[locale] ?? unitId}
          </span>
        ))}
        <span className={badgeClass}>{t(`practice.difficulties.${exercise.difficulty}`)}</span>
        <span className="font-mono text-xs text-fg-muted">
          {t('practice.seed')}: {exercise.seed}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <Link
            to={`/practice?${buildPracticeSearch({
              units: exercise.unitIds,
              difficulty: exercise.difficulty,
              mix: pinned.mix,
              seed: exercise.seed,
            }).toString()}`}
            className={buttonSecondary}
          >
            {t('whiteboard.pinned.openInPractice')}
          </Link>
          <button
            type="button"
            className={buttonGhost}
            onClick={() => {
              clearPinnedExercise()
              setPinned(null)
            }}
          >
            {t('whiteboard.pinned.unpin')}
          </button>
        </span>
      </header>

      <ExerciseStatement exercise={exercise} />
    </section>
  )
}
