import { describe, expect, it } from 'vitest'

import { createMath, createText } from '@/features/whiteboard/model/board'
import {
  distanceToSegment,
  hitTest,
  normalizeRect,
  objectBounds,
  pointInRect,
} from '@/features/whiteboard/model/geometry'
import type { ShapeObject, StrokeObject } from '@/features/whiteboard/model/types'

const stroke: StrokeObject = {
  id: 'stroke-1',
  kind: 'stroke',
  points: [
    { x: 0, y: 0, pressure: 0.5 },
    { x: 100, y: 0, pressure: 0.5 },
  ],
  color: '#111111',
  width: 4,
  highlighter: false,
}

const line: ShapeObject = {
  id: 'shape-1',
  kind: 'line',
  start: { x: 0, y: 100 },
  end: { x: 100, y: 100 },
  color: '#111111',
  width: 2,
}

const rect: ShapeObject = {
  id: 'shape-2',
  kind: 'rect',
  start: { x: 5, y: 5 },
  end: { x: 25, y: 15 },
  color: '#111111',
  width: 2,
}

const text = createText({ x: 100, y: 100 }, 'hola', { color: '#111111' })
const math = createMath({ x: 200, y: 100 }, '\\frac{1}{2}')

describe('normalizeRect', () => {
  it('normalizes any corner order', () => {
    expect(normalizeRect({ x: 10, y: 10 }, { x: 0, y: 0 })).toEqual({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    })
  })
})

describe('objectBounds', () => {
  it('covers legacy strokes with padding', () => {
    const bounds = objectBounds(stroke)

    expect(bounds.x).toBeLessThan(0)
    expect(bounds.width).toBeGreaterThan(100)
  })

  it('covers shapes, text and math', () => {
    expect(pointInRect({ x: 15, y: 10 }, objectBounds(rect))).toBe(true)
    expect(pointInRect({ x: 101, y: 95 }, objectBounds(text))).toBe(true)
    expect(pointInRect({ x: 210, y: 95 }, objectBounds(math))).toBe(true)
  })
})

describe('distanceToSegment', () => {
  it('measures perpendicular distance', () => {
    expect(distanceToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(3)
  })

  it('measures to the nearest endpoint outside the segment', () => {
    expect(distanceToSegment({ x: -3, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(5)
  })

  it('handles degenerate segments', () => {
    expect(distanceToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeCloseTo(5)
  })
})

describe('hitTest', () => {
  it('hits legacy strokes near the path', () => {
    expect(hitTest(stroke, { x: 50, y: 2 }, 4)).toBe(true)
    expect(hitTest(stroke, { x: 50, y: 40 }, 4)).toBe(false)
  })

  it('hits lines, text and math boxes', () => {
    expect(hitTest(line, { x: 50, y: 102 }, 3)).toBe(true)
    expect(hitTest(line, { x: 50, y: 130 }, 3)).toBe(false)
    expect(hitTest(text, { x: 110, y: 95 }, 0)).toBe(true)
    expect(hitTest(text, { x: 400, y: 400 }, 0)).toBe(false)
    expect(hitTest(math, { x: 210, y: 95 }, 0)).toBe(true)
  })
})
