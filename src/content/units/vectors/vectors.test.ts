import { describe, expect, it } from 'vitest'

import {
  answerValueOf,
  generateSamples,
  integerAnswerValue,
  numberParam,
  stringParam,
  vectorAnswerValue,
} from '@/test/generate-samples'
import {
  oracleDot,
  oracleIsOrthogonal,
  oracleIsParallel,
  oracleNorm,
  parseComponentsParam,
} from '@/test/vector-oracle'

import { componentsFromPoints, vectorNorm } from './generators/basic'
import { vectorDotProduct, vectorOperations } from './generators/operations'
import { angleBetweenVectors, vectorRelation } from './generators/relations'

describe('vectors.components', () => {
  it('subtracts the origin from the endpoint', () => {
    for (const exercise of generateSamples(componentsFromPoints)) {
      const pointA = parseComponentsParam(stringParam(exercise, 'aComponents'))
      const pointB = parseComponentsParam(stringParam(exercise, 'bComponents'))
      const expected = pointB.map((value, index) => value - (pointA[index] ?? 0))

      expect(vectorAnswerValue(exercise)).toEqual(expected)
    }
  })
})

describe('vectors.norm', () => {
  it('matches the square root of the sum of squares', () => {
    for (const exercise of generateSamples(vectorNorm)) {
      const components = parseComponentsParam(stringParam(exercise, 'uComponents'))
      const norm = oracleNorm(components)

      expect(Number.isInteger(norm)).toBe(true)
      expect(integerAnswerValue(exercise)).toBe(norm)
    }
  })
})

describe('vectors.operations', () => {
  it('matches the operation computed component-wise', () => {
    for (const exercise of generateSamples(vectorOperations)) {
      const left = parseComponentsParam(stringParam(exercise, 'uComponents'))
      const right = parseComponentsParam(stringParam(exercise, 'vComponents'))
      const operation = stringParam(exercise, 'operation')
      const leftScalar = numberParam(exercise, 'leftScalar')
      const rightScalar = numberParam(exercise, 'rightScalar')
      const expected = left.map((value, index) => {
        const other = right[index] ?? 0

        switch (operation) {
          case 'sum':
            return value + other
          case 'difference':
            return value - other
          case 'scale':
            return leftScalar * value
          case 'combination':
            return leftScalar * value + rightScalar * other
          default:
            throw new Error(`unknown operation "${operation}"`)
        }
      })

      expect(vectorAnswerValue(exercise)).toEqual(expected)
    }
  })
})

describe('vectors.dot-product', () => {
  it('matches the dot product computed independently', () => {
    for (const exercise of generateSamples(vectorDotProduct)) {
      const left = parseComponentsParam(stringParam(exercise, 'uComponents'))
      const right = parseComponentsParam(stringParam(exercise, 'vComponents'))

      expect(integerAnswerValue(exercise)).toBe(oracleDot(left, right))
    }
  })
})

describe('vectors.angle', () => {
  it('matches the angle computed from the cosine', () => {
    for (const exercise of generateSamples(angleBetweenVectors)) {
      const left = parseComponentsParam(stringParam(exercise, 'uComponents'))
      const right = parseComponentsParam(stringParam(exercise, 'vComponents'))
      const degrees = numberParam(exercise, 'angleDegrees')
      const cosine = oracleDot(left, right) / (oracleNorm(left) * oracleNorm(right))

      expect(cosine).toBeCloseTo(Math.cos((degrees * Math.PI) / 180), 9)
      expect(integerAnswerValue(exercise)).toBe(degrees)
    }
  })
})

describe('vectors.relation', () => {
  it('classifies the relation between the vectors correctly', () => {
    for (const exercise of generateSamples(vectorRelation)) {
      const left = parseComponentsParam(stringParam(exercise, 'uComponents'))
      const right = parseComponentsParam(stringParam(exercise, 'vComponents'))
      const expected = oracleIsOrthogonal(left, right)
        ? 'orthogonal'
        : oracleIsParallel(left, right)
          ? 'parallel'
          : 'neither'
      const answer = answerValueOf(exercise)

      expect(answer.kind).toBe('text')

      if (answer.kind === 'text') {
        expect(answer.value).toBe(expected)
      }
    }
  })
})
