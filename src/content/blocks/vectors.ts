import type { Rng } from '@/content/rng'

export type VectorComponents = readonly number[]

export function addVectors(left: VectorComponents, right: VectorComponents): number[] {
  return left.map((value, index) => value + (right[index] ?? 0))
}

export function subtractVectors(left: VectorComponents, right: VectorComponents): number[] {
  return left.map((value, index) => value - (right[index] ?? 0))
}

export function scaleVector(factor: number, vector: VectorComponents): number[] {
  return vector.map((value) => factor * value)
}

export function dotProduct(left: VectorComponents, right: VectorComponents): number {
  return left.reduce((total, value, index) => total + value * (right[index] ?? 0), 0)
}

export function normSquared(vector: VectorComponents): number {
  return dotProduct(vector, vector)
}

export function isOrthogonal(left: VectorComponents, right: VectorComponents): boolean {
  return dotProduct(left, right) === 0
}

/** Parallel in 2D (determinant 0) and 3D (cross product 0). */
export function isParallel(left: VectorComponents, right: VectorComponents): boolean {
  if (left.length === 2 && right.length === 2) {
    const [leftX = 0, leftY = 0] = left
    const [rightX = 0, rightY = 0] = right

    return leftX * rightY - leftY * rightX === 0
  }

  const [ax = 0, ay = 0, az = 0] = left
  const [bx = 0, by = 0, bz = 0] = right
  const cross = [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]

  return cross.every((component) => component === 0)
}

/** A 2D vector perpendicular to the given one. */
export function perpendicularVector(vector: VectorComponents): number[] {
  const [x = 0, y = 0] = vector

  return [-y, x]
}

export function randomVector(
  rng: Rng,
  dimension: 2 | 3,
  min: number,
  max: number,
  options?: { nonZero?: boolean },
): number[] {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const vector = Array.from({ length: dimension }, () => rng.int(min, max))

    if (!options?.nonZero || vector.some((component) => component !== 0)) {
      return vector
    }
  }

  return dimension === 2 ? [1, 1] : [1, 1, 1]
}

export const PYTHAGOREAN_TRIPLES_2D: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [20, 21, 29],
]

export const PYTHAGOREAN_TRIPLES_3D: readonly (readonly [readonly number[], number])[] = [
  [[1, 2, 2], 3],
  [[2, 3, 6], 7],
  [[1, 4, 8], 9],
  [[4, 4, 7], 9],
  [[2, 6, 9], 11],
  [[3, 4, 12], 13],
  [[1, 2, 2], 3],
]
