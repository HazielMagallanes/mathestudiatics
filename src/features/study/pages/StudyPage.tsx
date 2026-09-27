import { useTranslation } from 'react-i18next'

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
          <li key={unit.id} className="rounded-lg border border-rule bg-surface-raised p-5">
            <h2 className="text-lg font-semibold">{unit.title[locale]}</h2>
            <p className="mt-2 text-sm text-fg-muted">{unit.description[locale]}</p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-fg-muted uppercase">
              {t('study.theoryPending')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
