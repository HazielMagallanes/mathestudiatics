import { describe, expect, it } from 'vitest'

import { buildPracticeSearch, parsePracticeSearch } from './practice-search'

function search(query: string): URLSearchParams {
  return new URLSearchParams(query)
}

describe('parsePracticeSearch', () => {
  it('reads a full, valid selection', () => {
    expect(
      parsePracticeSearch(search('units=logic,sets&difficulty=hard&mix=combined&seed=abc123')),
    ).toEqual({
      units: ['logic', 'sets'],
      difficulty: 'hard',
      mix: 'combined',
      seed: 'abc123',
    })
  })

  it('falls back to the first unit and easy difficulty by default', () => {
    const selection = parsePracticeSearch(search(''))

    expect(selection.units).toEqual(['review'])
    expect(selection.difficulty).toBe('easy')
    expect(selection.mix).toBe('balanced')
    expect(selection.seed).toBeNull()
  })

  it('drops unknown units and duplicates', () => {
    expect(parsePracticeSearch(search('units=logic,logic,astrology')).units).toEqual(['logic'])
  })

  it('keeps at most two units', () => {
    expect(parsePracticeSearch(search('units=logic,sets,vectors,trigonometry')).units).toEqual([
      'logic',
      'sets',
    ])
  })

  it('falls back on invalid difficulty and mix values', () => {
    const selection = parsePracticeSearch(search('difficulty=impossible&mix=chaos'))

    expect(selection.difficulty).toBe('easy')
    expect(selection.mix).toBe('balanced')
  })

  it('rejects invalid seeds', () => {
    expect(
      parsePracticeSearch(search('seed=' + encodeURIComponent('ñandú/../../'))).seed,
    ).toBeNull()
    expect(parsePracticeSearch(search('seed=ok-seed_123')).seed).toBe('ok-seed_123')
  })
})

describe('buildPracticeSearch', () => {
  it('round-trips a selection', () => {
    const selection = {
      units: ['vectors', 'trigonometry'],
      difficulty: 'medium',
      mix: 'single',
      seed: 'seed-9',
    } as const

    expect(parsePracticeSearch(buildPracticeSearch(selection))).toEqual({
      units: ['vectors', 'trigonometry'],
      difficulty: 'medium',
      mix: 'single',
      seed: 'seed-9',
    })
  })

  it('omits a null seed', () => {
    expect(
      buildPracticeSearch({
        units: ['logic'],
        difficulty: 'easy',
        mix: 'balanced',
        seed: null,
      }).has('seed'),
    ).toBe(false)
  })
})
