import { z } from 'zod'

import type { Board } from '@/features/whiteboard/model/types'

export const BOARD_FILE_VERSION = 1

const pointSchema = z.object({ x: z.number(), y: z.number() })

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

const objectSchema = z.discriminatedUnion('kind', [textSchema, mathSchema])

const boardFileSchema = z.object({
  version: z.literal(BOARD_FILE_VERSION),
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

    return result.success ? { objects: result.data.objects } : null
  } catch {
    return null
  }
}
