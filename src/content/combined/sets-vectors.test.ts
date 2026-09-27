import { describe, expect, it } from 'vitest'

import {
  answerValueOf,
  generateSamples,
  integerAnswerValue,
  numberParam,
  stringParam,
} from '@/test/generate-samples'

import combinedSetsVectors from './sets-vectors.generator'

const [latticePoints] = combinedSetsVectors

if (!latticePoints) {
  throw new Error('combined sets-vectors generator is missing')
}

function parsePoints(text: string): string[] {
  return text === ''
    ? []
    : text
        .split(';')
        .map((point) => point.split(',').map(Number))
        .map(([x, y]) => `${String(x)},${String(y)}`)
        .sort()
}

describe('combined.sets-vectors.lattice-points', () => {
  it('enumerates the lattice points of the linear condition', () => {
    for (const exercise of generateSamples(latticePoints)) {
      const sum = numberParam(exercise, 'sum')
      const maxX = numberParam(exercise, 'maxX')
      const kind = stringParam(exercise, 'kind')
      const expected: string[] = []

      for (let x = 0; x <= maxX; x += 1) {
        expected.push(`${String(x)},${String(sum - x)}`)
      }

      expected.sort()

      if (kind === 'cardinality') {
        expect(integerAnswerValue(exercise)).toBe(expected.length)
        continue
      }

      const answer = answerValueOf(exercise)

      expect(answer.kind).toBe('text')

      if (answer.kind === 'text') {
        expect(parsePoints(answer.value)).toEqual(expected)
      }
    }
  })
})
