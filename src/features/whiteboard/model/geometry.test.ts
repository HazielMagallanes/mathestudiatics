import { describe, expect, it } from 'vitest'

import { createMath, createText } from '@/features/whiteboard/model/board'
import { hitTest, objectBounds, pointInRect } from '@/features/whiteboard/model/geometry'

const text = createText({ x: 100, y: 100 }, 'hola', { color: '#111111' })
const math = createMath({ x: 200, y: 100 }, '\\frac{1}{2}')

describe('objectBounds', () => {
  it('covers text and math boxes', () => {
    expect(pointInRect({ x: 110, y: 95 }, objectBounds(text))).toBe(true)
    expect(pointInRect({ x: 400, y: 400 }, objectBounds(text))).toBe(false)
    expect(pointInRect({ x: 210, y: 95 }, objectBounds(math))).toBe(true)
  })
})

describe('hitTest', () => {
  it('hits text and math boxes', () => {
    expect(hitTest(text, { x: 110, y: 95 }, 0)).toBe(true)
    expect(hitTest(text, { x: 400, y: 400 }, 0)).toBe(false)
    expect(hitTest(math, { x: 210, y: 95 }, 0)).toBe(true)
  })

  it('respects the tolerance', () => {
    const bounds = objectBounds(math)
    const justOutside = { x: bounds.x + bounds.width + 4, y: bounds.y + 10 }

    expect(hitTest(math, justOutside, 0)).toBe(false)
    expect(hitTest(math, justOutside, 6)).toBe(true)
  })
})
