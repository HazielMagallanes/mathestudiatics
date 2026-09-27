import { describe, expect, it } from 'vitest'

import {
  allParsedValuations,
  evaluateParsedFormula,
  isNegationNormalForm,
  parseLogicLatex,
  parseValuationLatex,
  parsedVariables,
  type ParsedFormula,
} from '@/test/logic-oracle'
import { evaluatePredicateAt } from '@/test/latex-oracle'
import {
  booleanAnswerValue,
  booleanParam,
  generateSamples,
  numberParam,
  stringParam,
  strippedStringParam,
  textAnswerValue,
} from '@/test/generate-samples'

import { equivalenceCheck } from './generators/equivalence'
import { negationSimplify } from './generators/negation'
import { propositionsClassify } from './generators/propositions'
import { quantifiersTruth } from './generators/quantifiers'
import { truthTableClassify } from './generators/truth-table'
import { connectivesTruthValue } from './generators/truth-value'

function classifyParsed(formula: ParsedFormula): 'tautology' | 'contradiction' | 'contingency' {
  const variables = parsedVariables(formula)
  let sawTrue = false
  let sawFalse = false

  for (const valuation of allParsedValuations(variables)) {
    if (evaluateParsedFormula(formula, valuation)) {
      sawTrue = true
    } else {
      sawFalse = true
    }

    if (sawTrue && sawFalse) {
      return 'contingency'
    }
  }

  return sawTrue ? 'tautology' : 'contradiction'
}

function areEquivalentParsed(left: ParsedFormula, right: ParsedFormula): boolean {
  const variables = [...new Set([...parsedVariables(left), ...parsedVariables(right)])]

  return allParsedValuations(variables).every(
    (valuation) =>
      evaluateParsedFormula(left, valuation) === evaluateParsedFormula(right, valuation),
  )
}

describe('logic.connectives.truth-value', () => {
  it('matches the formula evaluated independently', () => {
    for (const exercise of generateSamples(connectivesTruthValue)) {
      const valuation = parseValuationLatex(stringParam(exercise, 'valuation'))
      const formula = parseLogicLatex(strippedStringParam(exercise, 'formula'))

      expect(booleanAnswerValue(exercise)).toBe(evaluateParsedFormula(formula, valuation))
    }
  })
})

describe('logic.truth-table.classify', () => {
  it('classifies the formula exactly as its truth table does', () => {
    for (const exercise of generateSamples(truthTableClassify)) {
      const formula = parseLogicLatex(strippedStringParam(exercise, 'formula'))

      expect(textAnswerValue(exercise)).toBe(classifyParsed(formula))
    }
  })
})

describe('logic.negation.simplify', () => {
  it('produces a negation-normal form equivalent to the negation', () => {
    for (const exercise of generateSamples(negationSimplify)) {
      const original = parseLogicLatex(strippedStringParam(exercise, 'formula'))
      const answer = parseLogicLatex(textAnswerValue(exercise))

      expect(isNegationNormalForm(answer)).toBe(true)

      const variables = [...new Set([...parsedVariables(original), ...parsedVariables(answer)])]

      for (const valuation of allParsedValuations(variables)) {
        expect(evaluateParsedFormula(answer, valuation)).toBe(
          !evaluateParsedFormula(original, valuation),
        )
      }
    }
  })
})

describe('logic.equivalence.check', () => {
  it('matches equivalence computed independently', () => {
    for (const exercise of generateSamples(equivalenceCheck)) {
      const left = parseLogicLatex(strippedStringParam(exercise, 'left'))
      const right = parseLogicLatex(strippedStringParam(exercise, 'right'))

      expect(booleanAnswerValue(exercise)).toBe(areEquivalentParsed(left, right))
    }
  })
})

describe('logic.quantifiers.truth', () => {
  it('matches the quantifier evaluated over the domain', () => {
    for (const exercise of generateSamples(quantifiersTruth)) {
      const from = numberParam(exercise, 'from')
      const to = numberParam(exercise, 'to')
      const predicate = stringParam(exercise, 'predicate')
      const isUniversal = booleanParam(exercise, 'isUniversal')
      const values: boolean[] = []

      for (let value = from; value <= to; value += 1) {
        values.push(evaluatePredicateAt(predicate, value))
      }

      const expected = isUniversal ? values.every(Boolean) : values.some(Boolean)

      expect(booleanAnswerValue(exercise)).toBe(expected)
    }
  })
})

describe('logic.propositions.classify', () => {
  const NON_DECLARATIVE_MARKERS = ['Ojalá', '¿', 'Prohibido', 'bendiga', 'x + 1 = 3']

  it('agrees with the declarative/non-declarative nature of the sentence', () => {
    for (const exercise of generateSamples(propositionsClassify)) {
      const prompt = exercise.parts[0]?.prompt.es ?? ''
      const sentence = prompt.replace(/^¿Es una proposición\?\s*/, '')
      const hasMarker = NON_DECLARATIVE_MARKERS.some((marker) => sentence.includes(marker))

      expect(booleanAnswerValue(exercise)).toBe(!hasMarker)
    }
  })

  it('renders the sentence in both languages', () => {
    for (const exercise of generateSamples(propositionsClassify, 20)) {
      const part = exercise.parts[0]

      expect(part?.prompt.es).toContain('¿Es una proposición?')
      expect(part?.prompt.en).toContain('Is it a proposition?')
    }
  })
})
