import { useTranslation } from 'react-i18next'

import { formatTemplate } from '@/content/blocks/templates'
import type { Exercise, LocalizedAnswer } from '@/content/schema'
import { useContentLocale } from '@/shared/i18n/useContentLocale'
import { MathText } from '@/shared/ui/MathText'

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

/** Statement, answers and worked steps for one exercise. */
export function ExerciseStatement({ exercise }: { exercise: Exercise }) {
  const { t } = useTranslation()
  const locale = useContentLocale()

  return (
    <>
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
    </>
  )
}
