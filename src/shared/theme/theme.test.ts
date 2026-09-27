import { describe, expect, it } from 'vitest'

import { isThemePreference, resolveEffectiveTheme } from '@/shared/theme/theme'

describe('isThemePreference', () => {
  it.each(['light', 'dark', 'system'])('accepts "%s"', (value) => {
    expect(isThemePreference(value)).toBe(true)
  })

  it.each(['', 'Dark', 'auto', null, undefined, 42])('rejects %j', (value) => {
    expect(isThemePreference(value)).toBe(false)
  })
})

describe('resolveEffectiveTheme', () => {
  it('follows the system preference when set to "system"', () => {
    expect(resolveEffectiveTheme('system', true)).toBe('dark')
    expect(resolveEffectiveTheme('system', false)).toBe('light')
  })

  it('overrides the system preference when an explicit theme is set', () => {
    expect(resolveEffectiveTheme('dark', false)).toBe('dark')
    expect(resolveEffectiveTheme('light', true)).toBe('light')
  })
})
