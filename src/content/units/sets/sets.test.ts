import { describe, expect, it } from 'vitest'

import {
  booleanAnswerValue,
  generateSamples,
  integerAnswerValue,
  intervalAnswerValue,
  numberParam,
  paramsOf,
  setAnswerValues,
  stringParam,
  strippedStringParam,
} from '@/test/generate-samples'
import {
  intervalContains,
  intervalFromParams,
  parseSetLatex,
  samplePoints,
} from '@/test/sets-oracle'
import { rToNumber } from '@/test/latex-oracle'

import { extensionFromComprehension, membershipTruth } from './generators/basic'
import { intervalOperations } from './generators/intervals'
import { setCardinality, setOperations } from './generators/operations'
import { powerSetCount } from './generators/power-set'

function applySetOperation(operation: string, left: number[], right: number[]): number[] {
  const inRight = new Set(right)

  switch (operation) {
    case 'intersection':
      return left.filter((value) => inRight.has(value))
    case 'union':
      return [...new Set([...left, ...right])].sort((a, b) => a - b)
    case 'difference':
      return left.filter((value) => !inRight.has(value))
    case 'symmetric':
      return [
        ...new Set([
          ...left.filter((value) => !inRight.has(value)),
          ...right.filter((value) => !left.includes(value)),
        ]),
      ].sort((a, b) => a - b)
    default:
      throw new Error(`unknown operation "${operation}"`)
  }
}

describe('sets.extension', () => {
  it('lists exactly the integers that satisfy the condition', () => {
    for (const exercise of generateSamples(extensionFromComprehension)) {
      const from = numberParam(exercise, 'from')
      const to = numberParam(exercise, 'to')
      const first = numberParam(exercise, 'fromInclusive') === 1 ? from : from + 1
      const last = numberParam(exercise, 'toInclusive') === 1 ? to : to - 1
      const expected: number[] = []

      for (let value = first; value <= last; value += 1) {
        expected.push(value)
      }

      expect(setAnswerValues(exercise)).toEqual(expected)
    }
  })
})

describe('sets.membership.truth', () => {
  it('matches membership and subset relations computed independently', () => {
    for (const exercise of generateSamples(membershipTruth)) {
      const setA = parseSetLatex(stringParam(exercise, 'A'))
      const setB = parseSetLatex(stringParam(exercise, 'B'))
      const kind = stringParam(exercise, 'kind')
      const statement = strippedStringParam(exercise, 'statement')
      let expected: boolean

      switch (kind) {
        case 'element': {
          const match = /^(-?\d+) \\in A$/.exec(statement)
          const element = Number(match?.[1])

          expect(match, `unexpected element statement "${statement}"`).not.toBeNull()
          expected = setA.includes(element)
          break
        }
        case 'subset':
          expected = setA.every((value) => setB.includes(value))
          break
        case 'proper-subset':
          expected = setA.every((value) => setB.includes(value)) && setA.length < setB.length
          break
        case 'empty-subset':
          expected = setA.length > 0
          break
        case 'singleton-subset': {
          const match = /^\\left\\\{(-?\d+)\\right\\\} \\subset A$/.exec(statement)

          expect(match, `unexpected singleton statement "${statement}"`).not.toBeNull()
          expected = setA.includes(Number(match?.[1]))
          break
        }
        default:
          throw new Error(`unknown statement kind "${kind}"`)
      }

      expect(booleanAnswerValue(exercise)).toBe(expected)
    }
  })
})

describe('sets.operations', () => {
  it('matches the set operation computed independently', () => {
    for (const exercise of generateSamples(setOperations)) {
      const setA = parseSetLatex(stringParam(exercise, 'A'))
      const setB = parseSetLatex(stringParam(exercise, 'B'))
      const operation = stringParam(exercise, 'operation')

      expect(setAnswerValues(exercise)).toEqual(applySetOperation(operation, setA, setB))
    }
  })
})

describe('sets.cardinality', () => {
  it('matches the cardinality computed independently', () => {
    for (const exercise of generateSamples(setCardinality)) {
      const setA = parseSetLatex(stringParam(exercise, 'A'))
      const setB = parseSetLatex(stringParam(exercise, 'B'))
      const operation = stringParam(exercise, 'operation')

      expect(integerAnswerValue(exercise)).toBe(applySetOperation(operation, setA, setB).length)
    }
  })
})

describe('sets.power-set', () => {
  it('counts subsets with the power-set formula', () => {
    for (const exercise of generateSamples(powerSetCount)) {
      const size = numberParam(exercise, 'size')
      const kind = stringParam(exercise, 'kind')
      const element = numberParam(exercise, 'element')
      const setA = parseSetLatex(stringParam(exercise, 'A'))
      const expected =
        kind === 'subsets' ? 2 ** size : kind === 'proper' ? 2 ** size - 1 : 2 ** (size - 1)

      expect(setA).toHaveLength(size)
      expect(setA).toContain(element)
      expect(integerAnswerValue(exercise)).toBe(expected)
    }
  })
})

describe('sets.intervals.operations', () => {
  it('matches membership of the resulting interval at sample points', () => {
    for (const exercise of generateSamples(intervalOperations)) {
      const params = paramsOf(exercise)
      const intervalA = intervalFromParams(params, 'a')
      const intervalB = intervalFromParams(params, 'b')
      const operation = stringParam(exercise, 'operation')
      const result = intervalAnswerValue(exercise)
      const points = samplePoints(
        Math.min(intervalA.from ?? 0, intervalB.from ?? 0),
        Math.max(intervalA.to ?? 0, intervalB.to ?? 0),
      )

      for (const point of points) {
        const inA = intervalContains(intervalA, point)
        const inB = intervalContains(intervalB, point)
        const expected =
          operation === 'intersection'
            ? inA && inB
            : operation === 'union'
              ? inA || inB
              : inA && !inB

        expect(
          intervalContains(result, point),
          `point ${String(rToNumber(point))} for ${operation}`,
        ).toBe(expected)
      }
    }
  })
})
