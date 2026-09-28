import { memo } from 'react'

import { estimateMathBox, normalizeRect } from '@/features/whiteboard/model/geometry'
import { strokePath } from '@/features/whiteboard/model/stroke'
import type { BoardObject } from '@/features/whiteboard/model/types'
import { MathText } from '@/shared/ui/MathText'

export const ARROW_MARKER_ID = 'whiteboard-arrow'

export const ObjectView = memo(function ObjectView({ object }: { object: BoardObject }) {
  return (
    <g data-object-id={object.id} data-object-kind={object.kind}>
      <ObjectShape object={object} />
    </g>
  )
})

function ObjectShape({ object }: { object: BoardObject }) {
  switch (object.kind) {
    case 'stroke':
      return (
        <path
          d={strokePath(object.points, {
            width: object.width,
            highlighter: object.highlighter,
          })}
          fill={object.color}
          opacity={object.highlighter ? 0.35 : 1}
        />
      )
    case 'line':
      return (
        <line
          x1={object.start.x}
          y1={object.start.y}
          x2={object.end.x}
          y2={object.end.y}
          stroke={object.color}
          strokeWidth={object.width}
          strokeLinecap="round"
        />
      )
    case 'arrow':
      return (
        <line
          x1={object.start.x}
          y1={object.start.y}
          x2={object.end.x}
          y2={object.end.y}
          stroke={object.color}
          strokeWidth={object.width}
          strokeLinecap="round"
          markerEnd={`url(#${ARROW_MARKER_ID})`}
        />
      )
    case 'rect': {
      const rect = normalizeRect(object.start, object.end)

      return (
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="none"
          stroke={object.color}
          strokeWidth={object.width}
        />
      )
    }
    case 'circle': {
      const rect = normalizeRect(object.start, object.end)

      return (
        <ellipse
          cx={rect.x + rect.width / 2}
          cy={rect.y + rect.height / 2}
          rx={rect.width / 2}
          ry={rect.height / 2}
          fill="none"
          stroke={object.color}
          strokeWidth={object.width}
        />
      )
    }
    case 'text':
      return (
        <text
          x={object.position.x}
          y={object.position.y}
          fill={object.color}
          fontSize={object.fontSize}
          className="font-sans"
        >
          {object.text}
        </text>
      )
    case 'math': {
      const box = estimateMathBox(object.latex, object.fontSize)

      return (
        <foreignObject
          x={object.position.x}
          y={object.position.y - object.fontSize}
          width={box.width}
          height={box.height}
        >
          <div
            // foreignObject content lives in the HTML namespace.
            {...{ xmlns: 'http://www.w3.org/1999/xhtml' }}
            className="text-fg"
            style={{ fontSize: object.fontSize }}
          >
            <MathText text={`$${object.latex}$`} />
          </div>
        </foreignObject>
      )
    }
  }
}
