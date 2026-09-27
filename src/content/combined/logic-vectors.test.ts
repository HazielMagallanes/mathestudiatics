import { describe, expect, it } from 'vitest'

import {
  booleanAnswerValue,
  generateSamples,
  numberParam,
  stringParam,
} from '@/test/generate-samples'
import {
  oracleDot,
  oracleIsOrthogonal,
  oracleIsParallel,
  oracleNorm,
  parseComponentsParam,
} from '@/test/vector-oracle'

import combinedLogicVectors from './logic-vectors.generator'

const [statementTruth] = combinedLogicVectors

if (!statementTruth) {
  throw new Error('combined logic-vectors generator is missing')
}

describe('combined.logic-vectors.truth', () => {
  it('matches the statement evaluated independently', () => {
    for (const exercise of generateSamples(statementTruth)) {
      const left = parseComponentsParam(stringParam(exercise, 'uComponents'))
      const right = parseComponentsParam(stringParam(exercise, 'vComponents'))
      const kind = stringParam(exercise, 'statementKind')
      const normTarget = numberParam(exercise, 'normTarget')
      const dotTarget = numberParam(exercise, 'dotTarget')

      const expected =
        kind === 'orthogonal-and-norm'
          ? oracleIsOrthogonal(left, right) && oracleNorm(left) === normTarget
          : oracleIsParallel(left, right) || oracleDot(left, right) === dotTarget

      expect(booleanAnswerValue(exercise)).toBe(expected)
    }
  })
})
