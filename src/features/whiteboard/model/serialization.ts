import { z } from 'zod'

import type { Board } from '@/features/whiteboard/model/types'

export const BOARD_FILE_VERSION = 2

const pointSchema = z.object({ x: z.number(), y: z.number() })
const strokePointSchema = pointSchema.extend({ pressure: z.number() })

const strokeSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('stroke'),
  points: z.array(strokePointSchema).min(1),
  color: z.string().min(1),
  width: z.number().positive(),
  highlighter: z.boolean(),
})

const shapeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['line', 'arrow', 'rect', 'circle']),
  start: pointSchema,
  end: pointSchema,
  color: z.string().min(1),
  width: z.number().positive(),
})

const textSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('text'),
  position: pointSchema,
  text: z.string(),
  color: z.string().min(1),
  fontSize: z.number().positive(),
})

const mathSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('math'),
  position: pointSchema,
  latex: z.string(),
  source: z.string().optional(),
  entryIndex: z.number().int().nonnegative().optional(),
  positionMode: z.enum(['auto', 'free']).optional(),
  fontSize: z.number().positive(),
})

const objectSchema = z.discriminatedUnion('kind', [
  strokeSchema,
  shapeSchema,
  textSchema,
  mathSchema,
])

const boardFileSchema = z.object({
  // Version 1 boards (before the keyboard notepad) still load.
  version: z.union([z.literal(1), z.literal(2)]),
  objects: z.array(objectSchema),
})

export function serializeBoard(board: Board): string {
  return JSON.stringify({ version: BOARD_FILE_VERSION, objects: board.objects })
}

/** Returns null for invalid payloads instead of throwing. */
export function deserializeBoard(json: string): Board | null {
  try {
    const parsed: unknown = JSON.parse(json)
    const result = boardFileSchema.safeParse(parsed)

    if (!result.success) {
      return null
    }

    const isLegacy = result.data.version === 1
    const objects = result.data.objects.map((object) => {
      if (isLegacy && object.kind === 'math' && object.positionMode === undefined) {
        // Math objects from older boards keep the position the user chose.
        return { ...object, positionMode: 'free' as const }
      }

      return object
    })

    return { objects }
  } catch {
    return null
  }
}
