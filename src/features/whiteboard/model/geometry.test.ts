import { describe, expect, it } from 'vitest'

import {
  createMath,
  createShape,
  createStroke,
  createText,
} from '@/features/whiteboard/model/board'
import {
  distanceToSegment,
  hitTest,
  normalizeRect,
  objectBounds,
  pointInRect,
  snapToGrid,
  snapToStep,
} from '@/features/whiteboard/model/geometry'

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
  it('covers stroke points with padding', () => {
    const stroke = createStroke(
      [
        { x: 0, y: 0, pressure: 0.5 },
        { x: 10, y: 20, pressure: 0.5 },
      ],
      { color: '#111111', width: 4 },
    )
    const bounds = objectBounds(stroke)

    expect(bounds.x).toBeLessThan(0)
    expect(bounds.width).toBeGreaterThan(10)
  })

  it('covers shapes and text', () => {
    const rect = createShape(
      'rect',
      { x: 5, y: 5 },
      { x: 25, y: 15 },
      { color: '#111111', width: 2 },
    )
    const text = createText({ x: 100, y: 100 }, 'hola', { color: '#111111' })
    const math = createMath({ x: 200, y: 100 }, '\\frac{1}{2}')

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
  const stroke = createStroke(
    [
      { x: 0, y: 0, pressure: 0.5 },
      { x: 100, y: 0, pressure: 0.5 },
    ],
    { color: '#111111', width: 4 },
  )
  const line = createShape(
    'line',
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { color: '#111111', width: 2 },
  )
  const text = createText({ x: 0, y: 200 }, 'hola', { color: '#111111' })

  it('hits strokes near the path', () => {
    expect(hitTest(stroke, { x: 50, y: 2 }, 4)).toBe(true)
    expect(hitTest(stroke, { x: 50, y: 40 }, 4)).toBe(false)
  })

  it('hits lines and text boxes', () => {
    expect(hitTest(line, { x: 50, y: 102 }, 3)).toBe(true)
    expect(hitTest(line, { x: 50, y: 130 }, 3)).toBe(false)
    expect(hitTest(text, { x: 10, y: 195 }, 0)).toBe(true)
    expect(hitTest(text, { x: 10, y: 400 }, 0)).toBe(false)
  })
})

describe('snapping', () => {
  it('snaps to the grid', () => {
    expect(snapToGrid({ x: 13, y: 26 }, 10)).toEqual({ x: 10, y: 30 })
    expect(snapToGrid({ x: 13, y: 26 }, 0)).toEqual({ x: 13, y: 26 })
  })

  it('snaps to 45 degree steps', () => {
    const snapped = snapToStep({ x: 0, y: 0 }, { x: 10, y: 9 })

    expect(snapped.x).toBeCloseTo(snapped.y)
    expect(Math.hypot(snapped.x, snapped.y)).toBeCloseTo(Math.hypot(10, 9))
  })

  it('snaps to the horizontal when the angle is closer to it', () => {
    const snapped = snapToStep({ x: 0, y: 0 }, { x: 10, y: 3 })

    expect(snapped.y).toBeCloseTo(0)
    expect(snapped.x).toBeCloseTo(Math.hypot(10, 3))
  })

  it('keeps degenerate segments untouched', () => {
    expect(snapToStep({ x: 5, y: 5 }, { x: 5, y: 5 })).toEqual({ x: 5, y: 5 })
  })
})
