import { describe, expect, it } from 'vitest'

import en from '@/shared/i18n/locales/en.json'
import es from '@/shared/i18n/locales/es.json'

function flatten(tree: Record<string, unknown>, prefix = ''): Map<string, string> {
  const entries = new Map<string, string>()

  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      entries.set(path, value)
    } else if (typeof value === 'object' && value !== null) {
      for (const [nestedKey, nestedValue] of flatten(value as Record<string, unknown>, path)) {
        entries.set(nestedKey, nestedValue)
      }
    }
  }

  return entries
}

function interpolationTokens(value: string): string[] {
  return [...value.matchAll(/\{\{(\w+)\}\}/g)]
    .map((match) => match[1] ?? '')
    .sort((a, b) => a.localeCompare(b))
}

const esEntries = flatten(es)
const enEntries = flatten(en)

describe('locales', () => {
  it('has exactly the same keys in every language (es is the source of truth)', () => {
    expect([...enEntries.keys()].sort()).toEqual([...esEntries.keys()].sort())
  })

  it('has no empty strings', () => {
    for (const [key, value] of [...esEntries, ...enEntries]) {
      expect(value.trim(), `key "${key}" must not be empty`).not.toBe('')
    }
  })

  it('uses the same interpolation placeholders in every language', () => {
    for (const [key, esValue] of esEntries) {
      const enValue = enEntries.get(key)

      expect(enValue, `missing key "${key}"`).toBeDefined()
      expect(interpolationTokens(enValue ?? ''), `placeholders differ for "${key}"`).toEqual(
        interpolationTokens(esValue),
      )
    }
  })
})
