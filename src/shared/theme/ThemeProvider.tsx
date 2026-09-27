import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { readLocalStorage, writeLocalStorage } from '@/shared/storage/local-storage'
import { ThemeContext, type ThemeContextValue } from '@/shared/theme/ThemeContext'
import {
  isThemePreference,
  resolveEffectiveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '@/shared/theme/theme'

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

function getSystemPrefersDark(): boolean {
  if (typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia(DARK_MEDIA_QUERY).matches
}

function readStoredPreference(): ThemePreference {
  const stored = readLocalStorage(THEME_STORAGE_KEY)

  return isThemePreference(stored) ? stored : 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference)
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const media = window.matchMedia(DARK_MEDIA_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches)
    }

    media.addEventListener('change', onChange)

    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [])

  const effectiveTheme = resolveEffectiveTheme(preference, systemPrefersDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark')
  }, [effectiveTheme])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    writeLocalStorage(THEME_STORAGE_KEY, next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, effectiveTheme, setPreference }),
    [preference, effectiveTheme, setPreference],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
