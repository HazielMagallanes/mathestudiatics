import { getStroke } from 'perfect-freehand'

import type { StrokePoint } from '@/features/whiteboard/model/types'

function svgPathFromOutline(points: number[][]): string {
  if (points.length === 0) {
    return ''
  }

  const average = (first: number[], second: number[]): [number, number] => [
    ((first[0] ?? 0) + (second[0] ?? 0)) / 2,
    ((first[1] ?? 0) + (second[1] ?? 0)) / 2,
  ]

  let path = ''
  let previous: number[] | undefined

  for (const point of points) {
    const x = point[0] ?? 0
    const y = point[1] ?? 0

    if (!previous) {
      path += `M ${String(x)},${String(y)}`
    } else {
      const [controlX, controlY] = average(previous, point)
      path += ` Q ${String(controlX)},${String(controlY)} ${String(x)},${String(y)}`
    }

    previous = point
  }

  return `${path} Z`
}

export interface StrokeRenderOptions {
  width: number
  highlighter: boolean
}

/**
 * Converts captured points into a filled SVG path using perfect-freehand, so
 * strokes look like ink and react to stylus pressure.
 */
export function strokePath(points: readonly StrokePoint[], options: StrokeRenderOptions): string {
  if (points.length === 0) {
    return ''
  }

  const hasRealPressure = points.some((point) => point.pressure !== 0.5)
  const input = points.map((point) => [point.x, point.y, point.pressure])
  const outline = getStroke(input, {
    size: options.highlighter ? options.width * 4 : options.width,
    thinning: options.highlighter ? 0 : 0.55,
    smoothing: 0.5,
    streamline: 0.4,
    simulatePressure: !hasRealPressure,
    last: true,
  })

  return svgPathFromOutline(outline)
}
