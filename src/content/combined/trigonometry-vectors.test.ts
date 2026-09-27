import { describe, expect, it } from 'vitest'

import {
  answerValueOf,
  generateSamples,
  numberParam,
  vectorAnswerValue,
} from '@/test/generate-samples'
import {
  oracleCos,
  oracleEquals,
  oracleMultiply,
  oracleRational,
  oracleSin,
  parseOracleCanonical,
} from '@/test/trig-oracle'

import combinedTrigonometryVectors from './trigonometry-vectors.generator'

const [magnitudeDirection] = combinedTrigonometryVectors

if (!magnitudeDirection) {
  throw new Error('combined trigonometry-vectors generator is missing')
}

describe('combined.trigonometry-vectors.magnitude-direction', () => {
  it('matches the polar components computed exactly', () => {
    for (const exercise of generateSamples(magnitudeDirection)) {
      const magnitude = numberParam(exercise, 'magnitude')
      const angle = {
        numerator: numberParam(exercise, 'angleNumerator'),
        denominator: numberParam(exercise, 'angleDenominator'),
      }
      const expectedX = oracleMultiply(oracleRational(magnitude), oracleCos(angle))
      const expectedY = oracleMultiply(oracleRational(magnitude), oracleSin(angle))
      const answer = answerValueOf(exercise)

      if (answer.kind === 'vector') {
        const components = vectorAnswerValue(exercise)

        expect(oracleEquals(expectedX, oracleRational(components[0] ?? 0)), 'x component').toBe(
          true,
        )
        expect(oracleEquals(expectedY, oracleRational(components[1] ?? 0)), 'y component').toBe(
          true,
        )
        continue
      }

      expect(answer.kind).toBe('text')

      if (answer.kind === 'text') {
        const [xText = '', yText = ''] = answer.value.split(',')

        expect(oracleEquals(expectedX, parseOracleCanonical(xText)), 'x component').toBe(true)
        expect(oracleEquals(expectedY, parseOracleCanonical(yText)), 'y component').toBe(true)
      }
    }
  })

  it('keeps the magnitude of the resulting vector', () => {
    for (const exercise of generateSamples(magnitudeDirection, 30)) {
      const magnitude = numberParam(exercise, 'magnitude')
      const answer = answerValueOf(exercise)

      if (answer.kind === 'vector') {
        const [x = 0, y = 0] = vectorAnswerValue(exercise)

        expect(Math.hypot(x, y)).toBeCloseTo(magnitude, 9)
      }
    }
  })
})
