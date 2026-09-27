import { setLatex } from '@/content/blocks/latex'
import { distinctInts } from '@/content/blocks/random'
import type { Rng } from '@/content/rng'

export type IntegerSet = readonly number[]

export function setLatexFromNumbers(values: IntegerSet): string {
  return setLatex(values)
}

/** Sorted, deduplicated set. */
export function normalizeSet(values: IntegerSet): number[] {
  return [...new Set(values)].sort((a, b) => a - b)
}

export function randomIntegerSet(
  rng: Rng,
  options: { size: number; min: number; max: number },
): number[] {
  return normalizeSet(distinctInts(rng, options.size, options.min, options.max))
}

export function union(left: IntegerSet, right: IntegerSet): number[] {
  return normalizeSet([...left, ...right])
}

export function intersection(left: IntegerSet, right: IntegerSet): number[] {
  const rightValues = new Set(right)

  return normalizeSet(left.filter((value) => rightValues.has(value)))
}

export function difference(left: IntegerSet, right: IntegerSet): number[] {
  const rightValues = new Set(right)

  return normalizeSet(left.filter((value) => !rightValues.has(value)))
}

export function symmetricDifference(left: IntegerSet, right: IntegerSet): number[] {
  return union(difference(left, right), difference(right, left))
}

export function isSubset(left: IntegerSet, right: IntegerSet): boolean {
  const rightValues = new Set(right)

  return left.every((value) => rightValues.has(value))
}

export function isProperSubset(left: IntegerSet, right: IntegerSet): boolean {
  return isSubset(left, right) && left.length < right.length
}

export function setsEqual(left: IntegerSet, right: IntegerSet): boolean {
  return isSubset(left, right) && isSubset(right, left)
}

/** Number of subsets (2^n) and proper subsets (2^n − 1). */
export function subsetCounts(size: number): { subsets: number; properSubsets: number } {
  const subsets = 2 ** size

  return { subsets, properSubsets: subsets - 1 }
}

export function integerRange(from: number, to: number): number[] {
  const values: number[] = []

  for (let value = from; value <= to; value += 1) {
    values.push(value)
  }

  return values
}
