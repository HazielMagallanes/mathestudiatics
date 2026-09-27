import { useTranslation } from 'react-i18next'

import { ISSUES_URL, REPOSITORY_URL } from '@/shared/site'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { ExternalLink } from '@/shared/ui/ExternalLink'
import { PageHeader } from '@/shared/ui/PageHeader'

const SECTIONS = [
  { titleKey: 'about.content.title', bodyKey: 'about.content.body' },
  { titleKey: 'about.privacy.title', bodyKey: 'about.privacy.body' },
  { titleKey: 'about.license.title', bodyKey: 'about.license.body' },
] as const

export default function AboutPage() {
  const { t } = useTranslation()
  const title = t('about.title')

  useDocumentTitle(title)

  return (
    <div className="space-y-10">
      <PageHeader title={title} description={t('about.intro')} />

      <div className="grid gap-6 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <section key={section.titleKey}>
            <h2 className="text-lg font-semibold">{t(section.titleKey)}</h2>
            <p className="mt-2 text-sm text-fg-muted">{t(section.bodyKey)}</p>
          </section>
        ))}
      </div>

      <ul className="flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm">
        <li>
          <ExternalLink href={REPOSITORY_URL}>{t('about.repo')}</ExternalLink>
        </li>
        <li>
          <ExternalLink href={ISSUES_URL}>{t('about.issues')}</ExternalLink>
        </li>
      </ul>
    </div>
  )
}
