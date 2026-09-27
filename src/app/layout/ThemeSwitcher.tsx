import { useTranslation } from 'react-i18next'

import { useTheme } from '@/shared/theme/ThemeContext'
import { isThemePreference } from '@/shared/theme/theme'

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const { preference, setPreference } = useTheme()

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
        className="rounded-md border border-rule bg-surface-raised px-1.5 py-1 text-xs font-medium text-fg-muted"
      >
        <option value="system">{t('theme.system')}</option>
        <option value="light">{t('theme.light')}</option>
        <option value="dark">{t('theme.dark')}</option>
      </select>
    </label>
  )
}
