import type { BoardObject, Point, Rect } from '@/features/whiteboard/model/types'

export function normalizeRect(start: Point, end: Point): Rect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

export function pointsBounds(points: readonly Point[]): Rect {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/** Rough text box: SVG text is proportional, so this is an estimate. */
export function estimateTextBox(text: string, fontSize: number): Rect {
  const longestLine = Math.max(...text.split('\n').map((line) => line.length), 1)
  const lines = text.split('\n').length

  return { x: 0, y: 0, width: longestLine * fontSize * 0.62, height: lines * fontSize * 1.35 }
}

/** Rough math box: wide enough for typical expressions rendered by KaTeX. */
export function estimateMathBox(latex: string, fontSize: number): Rect {
  const width = Math.min(Math.max(latex.length * fontSize * 0.6, fontSize * 3), 720)

  return { x: 0, y: 0, width, height: fontSize * 2.2 }
}

export function objectBounds(object: BoardObject): Rect {
  switch (object.kind) {
    case 'stroke': {
      const bounds = pointsBounds(object.points)
      const padding = object.width / 2 + 2

      return {
        x: bounds.x - padding,
        y: bounds.y - padding,
        width: bounds.width + padding * 2,
        height: bounds.height + padding * 2,
      }
    }
    case 'line':
    case 'arrow':
    case 'rect':
    case 'circle': {
      const bounds = normalizeRect(object.start, object.end)
      const padding = object.width / 2 + 2

      return {
        x: bounds.x - padding,
        y: bounds.y - padding,
        width: bounds.width + padding * 2,
        height: bounds.height + padding * 2,
      }
    }
    case 'text': {
      const size = estimateTextBox(object.text, object.fontSize)

      return { ...size, x: object.position.x, y: object.position.y - object.fontSize }
    }
    case 'math': {
      const size = estimateMathBox(object.latex, object.fontSize)

      return { ...size, x: object.position.x, y: object.position.y - object.fontSize }
    }
  }
}

export function pointInRect(point: Point, rect: Rect, tolerance = 0): boolean {
  return (
    point.x >= rect.x - tolerance &&
    point.x <= rect.x + rect.width + tolerance &&
    point.y >= rect.y - tolerance &&
    point.y <= rect.y + rect.height + tolerance
  )
}

export function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y)
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
  )
  const projectionX = start.x + t * dx
  const projectionY = start.y + t * dy

  return Math.hypot(point.x - projectionX, point.y - projectionY)
}

export function hitTest(object: BoardObject, point: Point, tolerance: number): boolean {
  switch (object.kind) {
    case 'stroke': {
      const threshold = tolerance + object.width / 2
      const points = object.points

      if (points.length === 1) {
        const only = points[0]

        return only ? Math.hypot(point.x - only.x, point.y - only.y) <= threshold : false
      }

      for (let index = 1; index < points.length; index += 1) {
        const start = points[index - 1]
        const end = points[index]

        if (start && end && distanceToSegment(point, start, end) <= threshold) {
          return true
        }
      }

      return pointInRect(point, objectBounds(object), tolerance)
    }
    case 'line':
    case 'arrow': {
      const threshold = tolerance + object.width / 2

      return distanceToSegment(point, object.start, object.end) <= threshold
    }
    case 'rect':
    case 'circle':
    case 'text':
    case 'math':
      return pointInRect(point, objectBounds(object), tolerance)
  }
}
