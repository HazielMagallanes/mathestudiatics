import { useTranslation } from 'react-i18next'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { PageHeader } from '@/shared/ui/PageHeader'

export default function StudyPage() {
  const { t } = useTranslation()
  const title = t('study.title')

  useDocumentTitle(title)

  return (
    <div className="space-y-8">
      <PageHeader title={title} description={t('study.description')} />
      <p className="max-w-3xl rounded-lg border border-dashed border-rule bg-surface-raised p-5 text-sm text-fg-muted">
        {t('study.comingSoon')}
      </p>
    </div>
  )
}
