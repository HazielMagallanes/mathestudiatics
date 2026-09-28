import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { findUnit } from '@/content/registry'
import type { Exercise } from '@/content/schema'
import { ExerciseStatement } from '@/features/practice/components/ExerciseStatement'
import { useContentLocale } from '@/shared/i18n/useContentLocale'
import { GEOGEBRA_APPS } from '@/shared/site'
import { buttonGhost, buttonPrimary, buttonSecondary } from '@/shared/ui/buttons'
import { ExternalLink } from '@/shared/ui/ExternalLink'

interface ExerciseCardProps {
  exercise: Exercise
  copied: boolean
  pinned: boolean
  onNewExercise: () => void
  onCopyLink: () => void
  onPin: () => void
  onPinAndGo: () => void
}

export function ExerciseCard({
  exercise,
  copied,
  pinned,
  onNewExercise,
  onCopyLink,
  onPin,
  onPinAndGo,
}: ExerciseCardProps) {
  const { t } = useTranslation()
  const locale = useContentLocale()
  const badgeClass = 'rounded-full border border-rule px-2 py-0.5 text-xs font-medium text-fg-muted'

  return (
    <article
      aria-label={t('practice.title')}
      className="rounded-lg border border-rule bg-surface-raised p-5 sm:p-6"
    >
      <header className="flex flex-wrap items-center gap-2">
        {exercise.unitIds.map((unitId) => (
          <span key={unitId} className={badgeClass}>
            {findUnit(unitId)?.title[locale] ?? unitId}
          </span>
        ))}
        {exercise.unitIds.length > 1 ? (
          <span className="rounded-full border border-accent px-2 py-0.5 text-xs font-semibold text-accent">
            {t('practice.combined')}
          </span>
        ) : null}
        <span className={badgeClass}>{t(`practice.difficulties.${exercise.difficulty}`)}</span>
        <span className="ml-auto font-mono text-xs text-fg-muted">
          {t('practice.seed')}: {exercise.seed}
        </span>
      </header>

      <ExerciseStatement exercise={exercise} />

      <footer className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className={buttonPrimary} onClick={onNewExercise}>
          {t('practice.newExercise')}
        </button>
        <button type="button" className={buttonSecondary} onClick={onCopyLink}>
          {copied ? t('practice.linkCopied') : t('practice.copyLink')}
        </button>
        <button type="button" className={buttonSecondary} onClick={onPin}>
          {pinned ? t('practice.pinned') : t('practice.pin')}
        </button>
        <button type="button" className={buttonGhost} onClick={onPinAndGo}>
          {t('practice.pinAndGo')}
        </button>
      </footer>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <Link to="/board" className="font-medium text-accent underline-offset-4 hover:underline">
          {t('practice.board')}
        </Link>
        <Link
          to="/calculator"
          className="font-medium text-fg-muted underline-offset-4 hover:text-accent hover:underline"
        >
          {t('practice.calculator')}
        </Link>
        <ExternalLink href={GEOGEBRA_APPS.graphing} className="text-sm">
          {t('practice.geogebra')}
        </ExternalLink>
      </p>
    </article>
  )
}
