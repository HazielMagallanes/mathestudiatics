import { describe, expect, it } from 'vitest'

import denylist from '../../../scripts/anonymization-denylist.json'
import { contentFor, units } from '@/content/registry'

const LOCALES = ['es', 'en'] as const

describe('unit study content', () => {
  it('has theory and formula sheets for every unit in both languages', () => {
    for (const unit of units) {
      const content = contentFor(unit.id)

      expect(content, `unit "${unit.id}" has no study content`).toBeDefined()

      if (!content) {
        continue
      }

      for (const locale of LOCALES) {
        expect(
          content.theory[locale].length,
          `${unit.id} theory.${locale} is too short`,
        ).toBeGreaterThan(200)
        expect(
          content.formulas[locale].length,
          `${unit.id} formulas.${locale} is too short`,
        ).toBeGreaterThan(150)
      }
    }
  })

  it('renders math with dollar delimiters in every unit', () => {
    for (const unit of units) {
      const content = contentFor(unit.id)

      if (!content) {
        continue
      }

      for (const locale of LOCALES) {
        expect(content.theory[locale], `${unit.id} theory.${locale}`).toMatch(/\$/)
        expect(content.formulas[locale], `${unit.id} formulas.${locale}`).toMatch(/\$/)
      }
    }
  })

  it('never mentions denylisted institutional terms', () => {
    const terms = (denylist as { terms: string[] }).terms

    for (const unit of units) {
      const content = contentFor(unit.id)

      if (!content) {
        continue
      }

      for (const locale of LOCALES) {
        for (const text of [content.theory[locale], content.formulas[locale]]) {
          const lower = text.toLowerCase()

          for (const term of terms) {
            expect(
              lower.includes(term.toLowerCase()),
              `unit "${unit.id}" (${locale}) contains "${term}"`,
            ).toBe(false)
          }
        }
      }
    }
  })
})
