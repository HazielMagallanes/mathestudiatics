export type MathSegment =
  | { kind: 'text'; value: string }
  | { kind: 'inline'; value: string }
  | { kind: 'display'; value: string }

const MATH_PATTERN = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g

/** Splits text with embedded math into plain-text and math segments. */
export function splitMathSegments(text: string): MathSegment[] {
  const segments: MathSegment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(MATH_PATTERN)) {
    const index = match.index

    if (index > lastIndex) {
      segments.push({ kind: 'text', value: text.slice(lastIndex, index) })
    }

    if (match[1] !== undefined) {
      segments.push({ kind: 'display', value: match[1] })
    } else if (match[2] !== undefined) {
      segments.push({ kind: 'inline', value: match[2] })
    }

    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ kind: 'text', value: text.slice(lastIndex) })
  }

  return segments
}
