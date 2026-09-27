import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const title = t('notFound.title')

  useDocumentTitle(title)

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-fg-muted">{t('notFound.description')}</p>
      <Link
        to="/"
        className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast"
      >
        {t('notFound.back')}
      </Link>
    </div>
  )
}
