import { useTranslation } from 'react-i18next'

import { REPOSITORY_URL } from '@/shared/site'
import { ExternalLink } from '@/shared/ui/ExternalLink'

export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="mt-16 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t('footer.license')}</p>
        <ExternalLink href={REPOSITORY_URL}>{t('footer.source')}</ExternalLink>
      </div>
    </footer>
  )
}
