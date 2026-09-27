import { describe, expect, it } from 'vitest'

import { createRng } from '@/content/rng'

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const first = createRng('same-seed')
    const second = createRng('same-seed')

    const firstValues = Array.from({ length: 25 }, () => first.next())
    const secondValues = Array.from({ length: 25 }, () => second.next())

    expect(firstValues).toEqual(secondValues)
  })

  it('produces different streams for different seeds', () => {
    const first = createRng('seed-a')
    const second = createRng('seed-b')

    const firstValues = Array.from({ length: 10 }, () => first.next())
    const secondValues = Array.from({ length: 10 }, () => second.next())

    expect(firstValues).not.toEqual(secondValues)
  })

  it('returns values in [0, 1)', () => {
    const rng = createRng('range')

    for (let index = 0; index < 1_000; index += 1) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('produces integers within inclusive bounds', () => {
    const rng = createRng('ints')
    const values = new Set<number>()

    for (let index = 0; index < 1_000; index += 1) {
      const value = rng.int(1, 6)
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(6)
      values.add(value)
    }

    expect([...values].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('supports single-value ranges', () => {
    const rng = createRng('single')

    expect(rng.int(5, 5)).toBe(5)
  })

  it('rejects invalid ranges', () => {
    const rng = createRng('invalid')

    expect(() => rng.int(5, 4)).toThrow(RangeError)
    expect(() => rng.int(1.5, 3)).toThrow(RangeError)
  })

  it('picks items and refuses empty arrays', () => {
    const rng = createRng('pick')

    expect(rng.pick(['only'])).toBe('only')
    expect(() => rng.pick([])).toThrow(RangeError)

    const letters = new Set(['a', 'b', 'c'])
    for (let index = 0; index < 50; index += 1) {
      expect(letters.has(rng.pick([...letters]))).toBe(true)
    }
  })

  it('shuffles without mutating the input', () => {
    const rng = createRng('shuffle')
    const original = [1, 2, 3, 4, 5, 6, 7, 8]
    const shuffled = rng.shuffle(original)

    expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect([...shuffled].sort((a, b) => a - b)).toEqual(original)
  })

  it('honours probability bounds in bool()', () => {
    const rng = createRng('bool')

    expect(rng.bool(1)).toBe(true)
    expect(rng.bool(0)).toBe(false)
  })
})
