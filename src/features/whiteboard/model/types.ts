export interface Point {
  x: number
  y: number
}

export interface StrokePoint extends Point {
  pressure: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export const TOOLS = [
  'select',
  'pen',
  'highlighter',
  'eraser',
  'line',
  'arrow',
  'rect',
  'circle',
  'text',
  'pan',
] as const

export type ToolId = (typeof TOOLS)[number]

export const TOOL_SHORTCUTS: Record<ToolId, string> = {
  select: 'V',
  pen: 'P',
  highlighter: 'H',
  eraser: 'E',
  line: 'L',
  arrow: 'A',
  rect: 'R',
  circle: 'C',
  text: 'T',
  pan: 'O',
}

export type ShapeKind = 'line' | 'arrow' | 'rect' | 'circle'

interface BoardObjectBase {
  id: string
}

export interface StrokeObject extends BoardObjectBase {
  kind: 'stroke'
  points: StrokePoint[]
  color: string
  width: number
  highlighter: boolean
}

export interface ShapeObject extends BoardObjectBase {
  kind: ShapeKind
  start: Point
  end: Point
  color: string
  width: number
}

export interface TextObject extends BoardObjectBase {
  kind: 'text'
  position: Point
  text: string
  color: string
  fontSize: number
}

export interface MathObject extends BoardObjectBase {
  kind: 'math'
  position: Point
  /** LaTeX rendered on the board. */
  latex: string
  /** Original keyboard input (plain notation) when created from the notepad. */
  source?: string | undefined
  /** Order inside the keyboard notepad. */
  entryIndex?: number | undefined
  /** Auto-laid-out entries keep their slot; dragging makes a position free. */
  positionMode?: 'auto' | 'free' | undefined
  fontSize: number
}

export type BoardObject = StrokeObject | ShapeObject | TextObject | MathObject

export interface Board {
  objects: BoardObject[]
}

export const BOARD_WIDTH = 1600
export const BOARD_HEIGHT = 1000

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `id-${String(Date.now())}-${String(Math.floor(Math.random() * 1e9))}`
}
