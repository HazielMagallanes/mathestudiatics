import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { findUnit } from '@/content/registry'
import { formatTemplate } from '@/content/blocks/templates'
import type { Exercise, LocalizedAnswer } from '@/content/schema'
import { useContentLocale } from '@/shared/i18n/useContentLocale'
import { GEOGEBRA_APPS } from '@/shared/site'
import { buttonPrimary, buttonSecondary } from '@/shared/ui/buttons'
import { ExternalLink } from '@/shared/ui/ExternalLink'
import { MathText } from '@/shared/ui/MathText'

interface ExerciseCardProps {
  exercise: Exercise
  copied: boolean
  onNewExercise: () => void
  onCopyLink: () => void
}

function AnswerContent({ answer }: { answer: LocalizedAnswer }) {
  const locale = useContentLocale()
  const latex = answer.latexByLocale?.[locale] ?? answer.latex

  return (
    <div className="space-y-1">
      <MathText text={`$${latex}$`} className="text-lg" />
      {answer.note ? <p className="text-sm text-fg-muted">{answer.note[locale]}</p> : null}
    </div>
  )
}

export function ExerciseCard({ exercise, copied, onNewExercise, onCopyLink }: ExerciseCardProps) {
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

      {exercise.intro ? (
        <p className="mt-4 text-fg-muted">
          <MathText text={formatTemplate(exercise.intro, locale)} />
        </p>
      ) : null}

      <ol className="mt-4 list-none space-y-6 p-0">
        {exercise.parts.map((part, partIndex) => (
          <li key={partIndex}>
            <div className="overflow-x-auto text-lg leading-relaxed">
              <MathText text={formatTemplate(part.prompt, locale)} />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              <details className="min-w-40">
                <summary className="cursor-pointer text-sm font-semibold text-accent select-none">
                  {t('practice.answer')}
                </summary>
                <div className="mt-2">
                  <AnswerContent answer={part.answer} />
                </div>
              </details>

              {part.steps.length > 0 ? (
                <details className="min-w-40">
                  <summary className="cursor-pointer text-sm font-semibold text-accent select-none">
                    {t('practice.steps')}
                  </summary>
                  <ol className="mt-2 list-none space-y-3 p-0 text-sm">
                    {part.steps.map((stepItem, stepIndex) => (
                      <li key={stepIndex} className="flex gap-2">
                        <span aria-hidden="true" className="text-fg-muted">
                          {stepIndex + 1}.
                        </span>
                        <span className="space-y-1">
                          {stepItem.note ? (
                            <span className="block text-fg-muted">{stepItem.note[locale]}</span>
                          ) : null}
                          {stepItem.latex ? <MathText text={`$${stepItem.latex}$`} /> : null}
                        </span>
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <footer className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className={buttonPrimary} onClick={onNewExercise}>
          {t('practice.newExercise')}
        </button>
        <button type="button" className={buttonSecondary} onClick={onCopyLink}>
          {copied ? t('practice.linkCopied') : t('practice.copyLink')}
        </button>
        <Link to="/board" className={buttonSecondary}>
          {t('practice.board')}
        </Link>
        <Link to="/calculator" className={buttonSecondary}>
          {t('practice.calculator')}
        </Link>
        <ExternalLink href={GEOGEBRA_APPS.graphing} className="text-sm">
          {t('practice.geogebra')}
        </ExternalLink>
      </footer>
    </article>
  )
}
