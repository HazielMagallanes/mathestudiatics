import { useTranslation } from 'react-i18next'

import { useTheme } from '@/shared/theme/ThemeContext'
import { isThemePreference, type ThemePreference } from '@/shared/theme/theme'

const ORDER: readonly ThemePreference[] = ['system', 'light', 'dark']

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  const common = {
    'aria-hidden': true,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'size-4',
  }

  if (preference === 'light') {
    return (
      <svg {...common}>
        <circle cx="10" cy="10" r="3.4" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4" />
      </svg>
    )
  }

  if (preference === 'dark') {
    return (
      <svg {...common}>
        <path d="M15.5 12.4A6 6 0 0 1 7.6 4.5a6 6 0 1 0 7.9 7.9Z" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <rect x="2.5" y="4" width="15" height="10" rx="1.5" />
      <path d="M7.5 17h5" />
    </svg>
  )
}

interface ThemeSwitcherProps {
  /** Single cycle button for narrow bars. */
  compact?: boolean
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { t } = useTranslation()
  const { preference, setPreference } = useTheme()

  if (compact) {
    const index = ORDER.indexOf(preference)
    const next = ORDER[(index + 1) % ORDER.length] ?? 'system'
    const label = t('theme.cycle', {
      current: t(`theme.${preference}`),
      next: t(`theme.${next}`),
    })

    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => {
          setPreference(next)
        }}
        className="border-rule bg-surface-raised text-fg-muted hover:text-accent flex size-8 items-center justify-center rounded-md border"
      >
        <ThemeIcon preference={preference} />
      </button>
    )
  }

  return (
    <label className="flex items-center">
      <span className="sr-only">{t('theme.label')}</span>
      <select
        value={preference}
        onChange={(event) => {
          const next = event.target.value

          if (isThemePreference(next)) {
            setPreference(next)
          }
        }}
        className="border-rule bg-surface-raised text-fg-muted rounded-md border px-1.5 py-1 text-xs font-medium"
      >
        <option value="system">{t('theme.system')}</option>
        <option value="light">{t('theme.light')}</option>
        <option value="dark">{t('theme.dark')}</option>
      </select>
    </label>
  )
}
