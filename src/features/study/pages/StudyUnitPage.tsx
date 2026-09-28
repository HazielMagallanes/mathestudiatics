import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { contentFor, findUnit } from '@/content/registry'
import { MarkdownContent } from '@/features/study/components/MarkdownContent'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useContentLocale } from '@/shared/i18n/useContentLocale'
import { buttonPrimary, buttonSecondary } from '@/shared/ui/buttons'
import { PageHeader } from '@/shared/ui/PageHeader'

export default function StudyUnitPage() {
  const { t } = useTranslation()
  const locale = useContentLocale()
  const { unitId } = useParams<{ unitId: string }>()
  const unit = unitId ? findUnit(unitId) : undefined
  const content = unitId ? contentFor(unitId) : undefined
  const title = unit ? unit.title[locale] : t('study.notFound.title')

  useDocumentTitle(title)

  if (!unit || !content) {
    return (
      <div className="max-w-2xl space-y-5">
        <h1 className="text-3xl font-semibold tracking-tight">{t('study.notFound.title')}</h1>
        <p className="text-fg-muted">{t('study.notFound.description')}</p>
        <Link to="/study" className={buttonPrimary}>
          {t('study.notFound.back')}
        </Link>
      </div>
    )
  }

  return (
    <article className="space-y-10">
      <PageHeader title={unit.title[locale]} description={unit.description[locale]} />

      <div className="flex flex-wrap gap-3 print:hidden">
        <Link to={`/practice?units=${unit.id}`} className={buttonPrimary}>
          {t('study.practiceThisUnit')}
        </Link>
        <button
          type="button"
          className={buttonSecondary}
          onClick={() => {
            window.print()
          }}
        >
          {t('study.print')}
        </button>
      </div>

      <section aria-labelledby="study-theory" className="space-y-4">
        <h2 id="study-theory" className="border-b border-rule pb-1 text-2xl font-semibold">
          {t('study.theorySection')}
        </h2>
        <MarkdownContent markdown={content.theory[locale]} />
      </section>

      <section aria-labelledby="study-formulas" className="space-y-4">
        <h2 id="study-formulas" className="border-b border-rule pb-1 text-2xl font-semibold">
          {t('study.formulasSection')}
        </h2>
        <MarkdownContent markdown={content.formulas[locale]} />
      </section>

      <p className="text-sm text-fg-muted print:hidden">{t('study.contentNote')}</p>
    </article>
  )
}
