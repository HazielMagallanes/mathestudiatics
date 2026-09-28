import { memo } from 'react'

import { estimateMathBox } from '@/features/whiteboard/model/geometry'
import type { BoardObject } from '@/features/whiteboard/model/types'
import { MathText } from '@/shared/ui/MathText'

export const ObjectView = memo(function ObjectView({ object }: { object: BoardObject }) {
  return (
    <g data-object-id={object.id} data-object-kind={object.kind}>
      <ObjectContent object={object} />
    </g>
  )
})

function ObjectContent({ object }: { object: BoardObject }) {
  switch (object.kind) {
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
