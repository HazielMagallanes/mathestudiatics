/** Independent helpers for vector exercises. */

export function parseVectorLatex(latex: string): number[] {
  const match = /\\left\(([^)]*)\\right\)/.exec(latex)

  if (!match) {
    throw new Error(`vector oracle: cannot parse "${latex}"`)
  }

  return (match[1] ?? '').split(',').map((part) => Number(part.replace(/[\\;,\s]/g, '')))
}

export function parseComponentsParam(text: string): number[] {
  return text.split(',').map(Number)
}

export function oracleDot(left: readonly number[], right: readonly number[]): number {
  return left.reduce((total, value, index) => total + value * (right[index] ?? 0), 0)
}

export function oracleNorm(left: readonly number[]): number {
  return Math.sqrt(oracleDot(left, left))
}

export function oracleIsParallel(left: readonly number[], right: readonly number[]): boolean {
  if (left.length === 2 && right.length === 2) {
    return (left[0] ?? 0) * (right[1] ?? 0) - (left[1] ?? 0) * (right[0] ?? 0) === 0
  }

  const [ax = 0, ay = 0, az = 0] = left
  const [bx = 0, by = 0, bz = 0] = right

  return ay * bz - az * by === 0 && az * bx - ax * bz === 0 && ax * by - ay * bx === 0
}

export function oracleIsOrthogonal(left: readonly number[], right: readonly number[]): boolean {
  return oracleDot(left, right) === 0
}
