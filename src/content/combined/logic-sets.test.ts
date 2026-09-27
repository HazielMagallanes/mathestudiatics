import { describe, expect, it } from 'vitest'

import { evaluatePredicateAt } from '@/test/latex-oracle'
import { parseSetLatex } from '@/test/sets-oracle'
import {
  booleanAnswerValue,
  booleanParam,
  generateSamples,
  numberParam,
  stringParam,
} from '@/test/generate-samples'

import combinedLogicSets from './logic-sets.generator'

const [quantifiedOverSet, membershipImplication] = combinedLogicSets

if (!quantifiedOverSet || !membershipImplication) {
  throw new Error('combined logic-sets generators are missing')
}

describe('combined.logic-sets.quantified', () => {
  it('matches the quantifier evaluated over the explicit set', () => {
    for (const exercise of generateSamples(quantifiedOverSet)) {
      const setA = parseSetLatex(stringParam(exercise, 'A'))
      const predicate = stringParam(exercise, 'predicate')
      const isUniversal = booleanParam(exercise, 'isUniversal')
      const values = setA.map((value) => evaluatePredicateAt(predicate, value))
      const expected = isUniversal ? values.every(Boolean) : values.some(Boolean)

      expect(booleanAnswerValue(exercise)).toBe(expected)
    }
  })

  it('describes the same domain in the parameters and the statement', () => {
    for (const exercise of generateSamples(quantifiedOverSet, 20)) {
      const setA = parseSetLatex(stringParam(exercise, 'A'))
      const from = numberParam(exercise, 'from')
      const to = numberParam(exercise, 'to')

      expect(setA).toEqual(Array.from({ length: to - from + 1 }, (_, index) => from + index))
    }
  })
})

describe('combined.logic-sets.implication', () => {
  it('matches the quantifier evaluated over both sets', () => {
    for (const exercise of generateSamples(membershipImplication)) {
      const setA = parseSetLatex(stringParam(exercise, 'A'))
      const setB = parseSetLatex(stringParam(exercise, 'B'))
      const isUniversal = booleanParam(exercise, 'isUniversal')
      const values = setA.map((value) => setB.includes(value))
      const expected = isUniversal ? values.every(Boolean) : values.some(Boolean)

      expect(booleanAnswerValue(exercise)).toBe(expected)
    }
  })
})
