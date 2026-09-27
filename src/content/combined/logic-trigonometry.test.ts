import { describe, expect, it } from 'vitest'

import {
  booleanAnswerValue,
  booleanParam,
  generateSamples,
  stringParam,
} from '@/test/generate-samples'
import {
  oracleCos,
  oracleEquals,
  oracleSign,
  oracleSin,
  oracleTan,
  parseAngleCanonical,
  parseOracleCanonical,
  type OracleExact,
} from '@/test/trig-oracle'

import combinedLogicTrigonometry from './logic-trigonometry.generator'

const [quantified] = combinedLogicTrigonometry

if (!quantified) {
  throw new Error('combined logic-trigonometry generator is missing')
}

function evaluate(name: string, angle: { numerator: number; denominator: number }): OracleExact {
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

describe('combined.logic-trigonometry.quantified', () => {
  it('matches the quantifier evaluated with independent exact values', () => {
    for (const exercise of generateSamples(quantified)) {
      const angles = stringParam(exercise, 'angles').split(',').map(parseAngleCanonical)
      const fn = stringParam(exercise, 'functionName')
      const predicateKind = stringParam(exercise, 'predicateKind')
      const comparison = stringParam(exercise, 'comparison')
      const target = parseOracleCanonical(stringParam(exercise, 'targetCanonical'))
      const isUniversal = booleanParam(exercise, 'isUniversal')

      const values = angles.map((angle) => {
        const value = evaluate(fn, angle)

        if (predicateKind === 'equals') {
          return oracleEquals(value, target)
        }

        const sign = oracleSign(value)

        return sign === null ? false : comparison === '\\ge' ? sign >= 0 : sign < 0
      })

      expect(booleanAnswerValue(exercise)).toBe(
        isUniversal ? values.every(Boolean) : values.some(Boolean),
      )
    }
  })
})
