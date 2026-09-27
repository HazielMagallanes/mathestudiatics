import { describe, expect, it } from 'vitest'

import { formatTemplate, referencedParams, template } from '@/content/blocks/templates'

describe('template + formatTemplate', () => {
  it('renders each locale with its parameters', () => {
    const value = template('Sumá {{a}} y {{b}}', 'Add {{a}} and {{b}}', { a: 2, b: 3 })

    expect(formatTemplate(value, 'es')).toBe('Sumá 2 y 3')
    expect(formatTemplate(value, 'en')).toBe('Add 2 and 3')
  })

  it('leaves unknown parameters visible so tests can catch them', () => {
    const value = template('Valor {{missing}}', 'Value {{missing}}')

    expect(formatTemplate(value, 'es')).toBe('Valor {{missing}}')
  })

  it('replaces every occurrence', () => {
    const value = template('{{x}} + {{x}}', '{{x}} + {{x}}', { x: 1 })

    expect(formatTemplate(value, 'en')).toBe('1 + 1')
  })
})

describe('referencedParams', () => {
  it('collects placeholders from both languages without duplicates', () => {
    const value = template('{{a}} y {{b}}', '{{b}} and {{c}}', { a: 1, b: 2, c: 3 })

    expect(referencedParams(value).sort()).toEqual(['a', 'b', 'c'])
  })

  it('returns an empty array when there are no placeholders', () => {
    expect(referencedParams(template('Hola', 'Hello'))).toEqual([])
  })
})
