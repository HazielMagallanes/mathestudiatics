import { describe, expect, it } from 'vitest'

import type { ExercisePart } from '@/content/schema'
import {
  answerValueOf,
  decimalAnswerValue,
  fractionAnswerValue,
  generateSamples,
  integerAnswerValue,
  introParamsOf,
  numberParam,
  partAt,
  stringParam,
} from '@/test/generate-samples'
import {
  oracleCos,
  oracleEquals,
  oracleMultiply,
  oracleRational,
  oracleSin,
  oracleTan,
  parseAngleCanonical,
  parseExactLatex,
  parseOracleCanonical,
  type OracleExact,
} from '@/test/trig-oracle'

import { trigEquations } from './generators/equations'
import { exactValues } from './generators/exact-values'
import { identityFromSine } from './generators/identity'
import { amplitudePeriod, rightTriangleRatios } from './generators/right-triangle'
import { wordProblem } from './generators/word-problem'

function oracleFromAnswer(part: ExercisePart): OracleExact {
  const value = answerValueOf(part)

  if (value.kind === 'text') {
    return parseOracleCanonical(value.value)
  }

  return parseExactLatex(part.answer.latex)
}

function oracleFunction(
  name: string,
  angle: { numerator: number; denominator: number },
): OracleExact {
  switch (name) {
    case 'sin':
      return oracleSin(angle)
    case 'cos':
      return oracleCos(angle)
    case 'tan':
      return oracleTan(angle)
    default:
      throw new Error(`unknown function "${name}"`)
  }
}

describe('trigonometry.right-triangle', () => {
  it('matches the ratio computed from the triangle sides', () => {
    for (const exercise of generateSamples(rightTriangleRatios)) {
      const opposite = numberParam(exercise, 'opposite')
      const adjacent = numberParam(exercise, 'adjacent')
      const hypotenuse = numberParam(exercise, 'hypotenuse')
      const ratio = stringParam(exercise, 'ratio')
      const answer = fractionAnswerValue(exercise)
      const expected =
        ratio === 'sin'
          ? { numerator: opposite, denominator: hypotenuse }
          : ratio === 'cos'
            ? { numerator: adjacent, denominator: hypotenuse }
            : { numerator: opposite, denominator: adjacent }

      expect(answer.numerator * expected.denominator).toBe(expected.numerator * answer.denominator)
      expect(opposite * opposite + adjacent * adjacent).toBe(hypotenuse * hypotenuse)
    }
  })
})

describe('trigonometry.amplitude-period', () => {
  it('states the amplitude and the period independently', () => {
    for (const exercise of generateSamples(amplitudePeriod)) {
      const introParams = introParamsOf(exercise)
      const amplitude = Number(introParams.amplitude)
      const frequency = Number(introParams.frequency)
      const periodAnswer = answerValueOf(partAt(exercise, 1))

      expect(integerAnswerValue(exercise)).toBe(amplitude)
      expect(periodAnswer.kind).toBe('text')

      if (periodAnswer.kind === 'text') {
        const expected =
          frequency === 2 ? 'pi' : frequency === 3 ? '2pi/3' : frequency === 4 ? 'pi/2' : '?'
        const angle = parseAngleCanonical(periodAnswer.value)

        expect(periodAnswer.value).toBe(expected)
        expect(angle.numerator / angle.denominator).toBeCloseTo(2 / frequency, 10)
      }
    }
  })
})

describe('trigonometry.exact-values', () => {
  it('matches the exact value evaluated independently', () => {
    for (const exercise of generateSamples(exactValues)) {
      const fn = stringParam(exercise, 'functionName')
      const angle = {
        numerator: numberParam(exercise, 'angleNumerator'),
        denominator: numberParam(exercise, 'angleDenominator'),
      }
      const expected = oracleFunction(fn, angle)
      const actual = oracleFromAnswer(partAt(exercise, 0))

      expect(
        oracleEquals(expected, actual),
        `${fn}(${String(angle.numerator)}π/${String(angle.denominator)})`,
      ).toBe(true)
    }
  })
})

describe('trigonometry.identity', () => {
  it('respects the Pythagorean identity and the quadrant sign', () => {
    for (const exercise of generateSamples(identityFromSine)) {
      const sineNumerator = numberParam(exercise, 'sineNumerator')
      const sineDenominator = numberParam(exercise, 'sineDenominator')
      const quadrant = numberParam(exercise, 'quadrant')
      const answer = fractionAnswerValue(exercise)
      const cosineLegSquared = sineDenominator ** 2 - sineNumerator ** 2
      const cosineLeg = Math.round(Math.sqrt(cosineLegSquared))

      expect(cosineLeg * cosineLeg).toBe(cosineLegSquared)
      expect(Math.abs(answer.numerator)).toBe(cosineLeg)
      expect(answer.denominator).toBe(sineDenominator)
      expect(Math.sign(answer.numerator)).toBe(quadrant === 1 ? 1 : -1)
    }
  })
})

describe('trigonometry.equations', () => {
  it('lists exactly the solutions of the equation in [0, 2π)', () => {
    for (const exercise of generateSamples(trigEquations)) {
      const fn = stringParam(exercise, 'functionName')
      const target = parseOracleCanonical(stringParam(exercise, 'targetCanonical'))
      const answer = answerValueOf(exercise)

      expect(answer.kind).toBe('text')

      if (answer.kind !== 'text') {
        continue
      }

      const listed = answer.value === '' ? [] : answer.value.split(',').map(parseAngleCanonical)

      for (const angle of listed) {
        expect(
          oracleEquals(oracleFunction(fn, angle), target),
          `${fn} at ${String(angle.numerator)}π/${String(angle.denominator)}`,
        ).toBe(true)
      }

      const expected: string[] = []

      for (let twelfths = 0; twelfths < 24; twelfths += 1) {
        if (twelfths % 2 !== 0 && twelfths % 3 !== 0) {
          continue
        }

        const angle = { numerator: twelfths, denominator: 12 }

        if (oracleEquals(oracleFunction(fn, angle), target)) {
          expected.push(`${String(twelfths)}/12`)
        }
      }

      const listedNormalized = listed.map(
        (angle) => `${String(angle.numerator * (12 / angle.denominator))}/12`,
      )

      expect([...listedNormalized].sort()).toEqual([...expected].sort())
    }
  })
})

describe('trigonometry.word-problem', () => {
  it('matches the trigonometric computation with two decimals', () => {
    for (const exercise of generateSamples(wordProblem)) {
      const angle = numberParam(exercise, 'angle')
      const kind = stringParam(exercise, 'kind')
      const radians = (angle * Math.PI) / 180
      const answer = decimalAnswerValue(exercise)
      const expected =
        kind === 'height'
          ? numberParam(exercise, 'distance') * Math.tan(radians)
          : numberParam(exercise, 'height') / Math.sin(radians)

      expect(answer).toBeCloseTo(Number(expected.toFixed(2)), 2)
    }
  })
})

describe('trigonometry helper sanity', () => {
  it('oracle agrees with the canonical parser on rational values', () => {
    expect(oracleEquals(oracleRational(1, 2), parseOracleCanonical('1/2'))).toBe(true)
    expect(
      oracleEquals(
        { kind: 'radical', numerator: 1, denominator: 2, radicand: 2 },
        parseOracleCanonical('1/2√2'),
      ),
    ).toBe(true)
  })

  it('oracle multiply keeps exact values', () => {
    expect(
      oracleEquals(
        oracleMultiply(oracleRational(2), {
          kind: 'radical',
          numerator: 1,
          denominator: 2,
          radicand: 2,
        }),
        { kind: 'radical', numerator: 1, denominator: 1, radicand: 2 },
      ),
    ).toBe(true)
  })
})
