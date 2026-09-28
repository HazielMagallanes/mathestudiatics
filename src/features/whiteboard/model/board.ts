import {
  createId,
  type Board,
  type BoardObject,
  type MathObject,
  type Point,
  type ShapeKind,
  type ShapeObject,
  type StrokeObject,
  type StrokePoint,
  type TextObject,
} from '@/features/whiteboard/model/types'

export function emptyBoard(): Board {
  return { objects: [] }
}

export function addObject(board: Board, object: BoardObject): Board {
  return { objects: [...board.objects, object] }
}

export function removeObject(board: Board, id: string): Board {
  return { objects: board.objects.filter((object) => object.id !== id) }
}

export function findObject(board: Board, id: string): BoardObject | undefined {
  return board.objects.find((object) => object.id === id)
}

export function updateObject(
  board: Board,
  id: string,
  update: (object: BoardObject) => BoardObject,
): Board {
  return {
    objects: board.objects.map((object) => (object.id === id ? update(object) : object)),
  }
}

export function moveObject(board: Board, id: string, dx: number, dy: number): Board {
  return updateObject(board, id, (object) => translateObject(object, dx, dy))
}

export function translateObject(object: BoardObject, dx: number, dy: number): BoardObject {
  switch (object.kind) {
    case 'stroke':
      return {
        ...object,
        points: object.points.map((point) => ({ ...point, x: point.x + dx, y: point.y + dy })),
      }
    case 'text':
    case 'math':
      return { ...object, position: { x: object.position.x + dx, y: object.position.y + dy } }
    default:
      return {
        ...object,
        start: { x: object.start.x + dx, y: object.start.y + dy },
        end: { x: object.end.x + dx, y: object.end.y + dy },
      }
  }
}

/** Duplicates an object with a fresh id, offset a little so it is visible. */
export function duplicateObject(board: Board, id: string, offset = 24): Board {
  const original = findObject(board, id)

  if (!original) {
    return board
  }

  const copy = { ...translateObject(original, offset, offset), id: createId() }

  return addObject(board, copy)
}

export function bringToFront(board: Board, id: string): Board {
  const object = findObject(board, id)

  if (!object) {
    return board
  }

  return { objects: [...board.objects.filter((candidate) => candidate.id !== id), object] }
}

export function createStroke(
  points: StrokePoint[],
  options: { color: string; width: number; highlighter?: boolean },
): StrokeObject {
  return {
    id: createId(),
    kind: 'stroke',
    points,
    color: options.color,
    width: options.width,
    highlighter: options.highlighter ?? false,
  }
}

export function createShape(
  kind: ShapeKind,
  start: Point,
  end: Point,
  options: { color: string; width: number },
): ShapeObject {
  return { id: createId(), kind, start, end, color: options.color, width: options.width }
}

export function createText(
  position: Point,
  text: string,
  options: { color: string; fontSize?: number },
): TextObject {
  return {
    id: createId(),
    kind: 'text',
    position,
    text,
    color: options.color,
    fontSize: options.fontSize ?? 28,
  }
}

export function createMath(
  position: Point,
  latex: string,
  options: {
    fontSize?: number
    source?: string
    entryIndex?: number
    positionMode?: 'auto' | 'free'
  } = {},
): MathObject {
  return {
    id: createId(),
    kind: 'math',
    position,
    latex,
    fontSize: options.fontSize ?? 28,
    ...(options.source !== undefined ? { source: options.source } : {}),
    ...(options.entryIndex !== undefined ? { entryIndex: options.entryIndex } : {}),
    ...(options.positionMode !== undefined ? { positionMode: options.positionMode } : {}),
  }
}
