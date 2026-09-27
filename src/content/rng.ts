/**
 * Deterministic random number generator.
 *
 * Exercises must be reproducible from a seed (shareable URLs, tests,
 * debugging), so the app never uses Math.random for content.
 */

export interface Rng {
  /** Uniform value in [0, 1). */
  next(): number
  /** Uniform integer in [min, max], both inclusive. */
  int(min: number, max: number): number
  /** Uniformly picks one item; throws on empty input. */
  pick<T>(items: readonly T[]): T
  /** Returns a new shuffled array (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[]
  /** True with the given probability (default 0.5). */
  bool(probability?: number): boolean
}

/** xmur3 string hash: turns any seed string into a 32-bit integer stream. */
function xmur3(seed: string): () => number {
  let h = 1779033703 ^ seed.length

  for (let index = 0; index < seed.length; index += 1) {
    h = Math.imul(h ^ seed.charCodeAt(index), 3432918353)
    h = (h << 13) | (h >>> 19)
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

/** mulberry32: small, fast, well-distributed 32-bit PRNG. */
function mulberry32(seed: number): () => number {
  let state = seed

  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed: string): Rng {
  const random = mulberry32(xmur3(seed)())

  const next = (): number => random()

  const int = (min: number, max: number): number => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`Invalid integer range [${String(min)}, ${String(max)}]`)
    }

    return min + Math.floor(random() * (max - min + 1))
  }

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new RangeError('Cannot pick from an empty array')
    }

    const item = items[int(0, items.length - 1)]

    if (item === undefined) {
      throw new Error('Unreachable: pick index out of range')
    }

    return item
  }

  const shuffle = <T>(items: readonly T[]): T[] => {
    const copy = [...items]

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = int(0, index)
      const current = copy[index]
      const other = copy[target]

      if (current === undefined || other === undefined) {
        throw new Error('Unreachable: shuffle index out of range')
      }

      copy[index] = other
      copy[target] = current
    }

    return copy
  }

  const bool = (probability = 0.5): boolean => next() < probability

  return { next, int, pick, shuffle, bool }
}
