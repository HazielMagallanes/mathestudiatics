import type { Rng } from '@/content/rng'

/** Picks a uniformly random integer in [min, max], never zero. */
export function nonZeroInt(rng: Rng, min: number, max: number): number {
  const value = rng.int(min, max)

  if (value !== 0) {
    return value
  }

  if (min === 0 && max === 0) {
    throw new RangeError('Range contains only zero')
  }

  return min !== 0 ? min : max
}

/** Returns `count` distinct integers from [min, max] (inclusive). */
export function distinctInts(rng: Rng, count: number, min: number, max: number): number[] {
  const range = max - min + 1

  if (count > range) {
    throw new RangeError(`Cannot pick ${String(count)} distinct values from ${String(range)}`)
  }

  const picked = new Set<number>()

  while (picked.size < count) {
    picked.add(rng.int(min, max))
  }

  return [...picked]
}

const SEED_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** A random base-36 seed, safe to put in URLs. */
export function randomSeed(length = 10): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)

  return [...bytes].map((byte) => SEED_ALPHABET[byte % SEED_ALPHABET.length]).join('')
}
