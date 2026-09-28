import { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { SiteFooter } from '@/app/layout/SiteFooter'
import { SiteHeader } from '@/app/layout/SiteHeader'
import { UpdatePrompt } from '@/app/layout/UpdatePrompt'
import { FALLBACK_LOCALE } from '@/shared/i18n'

function RouteFallback() {
  const { t } = useTranslation()

  return (
    <p role="status" className="text-fg-muted">
      {t('common.loading')}
    </p>
  )
}

export function AppLayout() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? FALLBACK_LOCALE
  }, [i18n.resolvedLanguage])

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-30 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-contrast"
      >
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <UpdatePrompt />
    </div>
  )
}
