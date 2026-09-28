import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { GEOGEBRA_APPS } from '@/shared/site'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { ExternalLink } from '@/shared/ui/ExternalLink'
import { PageHeader } from '@/shared/ui/PageHeader'

const GEOGEBRA_APP_KEYS = ['graphing', 'classic', 'scientific', 'geometry'] as const

export default function ToolsPage() {
  const { t } = useTranslation()
  const title = t('tools.title')

  useDocumentTitle(title)

  return (
    <div className="space-y-10">
      <PageHeader title={title} description={t('tools.description')} />

      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
        <li className="rounded-lg border border-rule bg-surface-raised p-5">
          <h2 className="text-xl font-semibold">{t('tools.whiteboard.title')}</h2>
          <p className="mt-2 text-sm text-fg-muted">{t('tools.whiteboard.description')}</p>
          <Link
            to="/board"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {t('tools.whiteboard.open')}
            <span aria-hidden="true">→</span>
          </Link>
        </li>
        <li className="rounded-lg border border-rule bg-surface-raised p-5">
          <h2 className="text-xl font-semibold">{t('tools.calculator.title')}</h2>
          <p className="mt-2 text-sm text-fg-muted">{t('tools.calculator.description')}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            {t('common.comingSoon')}
          </p>
        </li>
        <li className="rounded-lg border border-rule bg-surface-raised p-5 sm:col-span-2">
          <h2 className="text-xl font-semibold">{t('tools.geogebra.title')}</h2>
          <p className="mt-2 text-sm text-fg-muted">{t('tools.geogebra.description')}</p>
          <ul className="mt-4 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm">
            {GEOGEBRA_APP_KEYS.map((app) => (
              <li key={app}>
                <ExternalLink href={GEOGEBRA_APPS[app]}>{t(`tools.geogebra.${app}`)}</ExternalLink>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  )
}
