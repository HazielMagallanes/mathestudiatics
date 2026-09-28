import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { units } from '@/content/registry'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useContentLocale } from '@/shared/i18n/useContentLocale'
import { PageHeader } from '@/shared/ui/PageHeader'

export default function StudyPage() {
  const { t } = useTranslation()
  const locale = useContentLocale()
  const title = t('study.title')

  useDocumentTitle(title)

  return (
    <div className="space-y-8">
      <PageHeader title={title} description={t('study.description')} />

      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
        {units.map((unit) => (
          <li
            key={unit.id}
            className="flex flex-col rounded-lg border border-rule bg-surface-raised p-5"
          >
            <h2 className="text-lg font-semibold">{unit.title[locale]}</h2>
            <p className="mt-2 flex-1 text-sm text-fg-muted">{unit.description[locale]}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <Link
                to={`/study/${unit.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                {t('study.readUnit')}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                to={`/practice?units=${unit.id}`}
                className="text-sm font-medium text-fg-muted underline-offset-4 hover:text-accent hover:underline"
              >
                {t('study.practiceThisUnit')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
