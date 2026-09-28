import { useTranslation } from 'react-i18next'

import { FALLBACK_LOCALE, isSupportedLocale, supportedLocales } from '@/shared/i18n'
import { cn } from '@/shared/ui/cn'

interface LocaleSwitcherProps {
  /** Single toggle button for narrow bars. */
  compact?: boolean
}

export function LocaleSwitcher({ compact = false }: LocaleSwitcherProps) {
  const { i18n, t } = useTranslation()
  const current = isSupportedLocale(i18n.resolvedLanguage) ? i18n.resolvedLanguage : FALLBACK_LOCALE

  if (compact) {
    const next = current === 'es' ? 'en' : 'es'
    const label = t('locale.switchTo', {
      current: t(`locale.${current}`),
      language: t(`locale.${next}`),
    })

    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => {
          void i18n.changeLanguage(next)
        }}
        className="border-rule bg-surface-raised text-fg-muted hover:text-accent rounded-md border px-2 py-1 text-xs font-semibold uppercase"
      >
        <span aria-hidden="true">{current}</span>
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label={t('locale.label')}
      className="border-rule flex overflow-hidden rounded-md border"
    >
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={current === locale}
          onClick={() => {
            void i18n.changeLanguage(locale)
          }}
          className={cn(
            'px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
            current === locale
              ? 'bg-primary text-primary-contrast'
              : 'bg-surface-raised text-fg-muted hover:text-accent',
          )}
        >
          <span aria-hidden="true">{locale}</span>
          <span className="sr-only">{t(`locale.${locale}`)}</span>
        </button>
      ))}
    </div>
  )
}
