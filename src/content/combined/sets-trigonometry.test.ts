import { describe, expect, it } from 'vitest'

import { answerValueOf, generateSamples, stringParam } from '@/test/generate-samples'
import {
  oracleCos,
  oracleEquals,
  oracleSin,
  oracleTan,
  parseAngleCanonical,
  parseOracleCanonical,
  type OracleExact,
} from '@/test/trig-oracle'

import combinedSetsTrigonometry from './sets-trigonometry.generator'

const [solutionSets] = combinedSetsTrigonometry

if (!solutionSets) {
  throw new Error('combined sets-trigonometry generator is missing')
}

interface Angle {
  numerator: number
  denominator: number
}

function evaluate(name: string, angle: Angle): OracleExact {
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

/** Scans the π/6 and π/4 grid for solutions, independently of the generator. */
function solutionsOf(name: string, target: OracleExact): Angle[] {
  const found: Angle[] = []

  for (let twelfths = 0; twelfths < 24; twelfths += 1) {
    if (twelfths % 2 !== 0 && twelfths % 3 !== 0) {
      continue
    }

    const angle = { numerator: twelfths, denominator: 12 }

    if (oracleEquals(evaluate(name, angle), target)) {
      found.push(angle)
    }
  }

  return found
}

function angleKey(angle: Angle): string {
  const divisor = (() => {
    let a = Math.abs(angle.numerator)
    let b = angle.denominator

    while (b !== 0) {
      const remainder = a % b
      a = b
      b = remainder
    }

    return a || 1
  })()

  return `${String(angle.numerator / divisor)}/${String(angle.denominator / divisor)}`
}

function listedAngles(value: string): Angle[] {
  return value === '' ? [] : value.split(',').map(parseAngleCanonical)
}

describe('combined.sets-trigonometry.solution-sets', () => {
  it('lists exactly the solution set (or the intersection of two)', () => {
    for (const exercise of generateSamples(solutionSets)) {
      const kind = stringParam(exercise, 'kind')
      const answer = answerValueOf(exercise)

      expect(answer.kind).toBe('text')

      if (answer.kind !== 'text') {
        continue
      }

      if (kind === 'extension') {
        const fn = stringParam(exercise, 'functionName')
        const target = parseOracleCanonical(stringParam(exercise, 'targetCanonical'))
        const expected = solutionsOf(fn, target)

        expect(listedAngles(answer.value).map(angleKey).sort()).toEqual(
          expected.map(angleKey).sort(),
        )
        continue
      }

      const first = solutionsOf(
        stringParam(exercise, 'firstFunction'),
        parseOracleCanonical(stringParam(exercise, 'firstTarget')),
      )
      const second = solutionsOf(
        stringParam(exercise, 'secondFunction'),
        parseOracleCanonical(stringParam(exercise, 'secondTarget')),
      )
      const intersection = first.filter((angle) =>
        second.some((other) => angleKey(other) === angleKey(angle)),
      )

      expect(listedAngles(answer.value).map(angleKey).sort()).toEqual(
        intersection.map(angleKey).sort(),
      )
    }
  })
})
