import { createContext, useContext } from 'react'

import type { EffectiveTheme, ThemePreference } from '@/shared/theme/theme'

export interface ThemeContextValue {
  preference: ThemePreference
  effectiveTheme: EffectiveTheme
  setPreference: (preference: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider')
  }

  return context
}
