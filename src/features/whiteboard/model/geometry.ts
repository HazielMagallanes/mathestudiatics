import type { BoardObject, Point, Rect } from '@/features/whiteboard/model/types'

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

export function hitTest(object: BoardObject, point: Point, tolerance: number): boolean {
  return pointInRect(point, objectBounds(object), tolerance)
}
