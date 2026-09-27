import type { Rng } from '@/content/rng'

export interface LinearPredicate {
  latex: string
  test: (x: number) => boolean
}

/** A random linear predicate in x, with both a LaTeX form and an evaluator. */
export function randomLinearPredicate(rng: Rng): LinearPredicate {
  const shape = rng.int(0, 4)

  switch (shape) {
    case 0: {
      const constant = rng.int(-5, 5)
      const target = rng.int(-8, 8)

      return {
        latex: `x ${constant >= 0 ? '+' : '-'} ${String(Math.abs(constant))} = ${String(target)}`,
        test: (x) => x + constant === target,
      }
    }
    case 1: {
      const coefficient = rng.int(2, 4)
      const target = rng.int(-9, 9)

      return {
        latex: `${String(coefficient)}x = ${String(target)}`,
        test: (x) => coefficient * x === target,
      }
    }
    case 2: {
      const coefficient = rng.int(2, 4)
      const constant = rng.int(-6, 6)
      const target = rng.int(-9, 9)
      const comparison = rng.pick(['\\le', '\\lt', '\\ge', '\\gt'] as const)

      return {
        latex: `${String(coefficient)}x ${constant >= 0 ? '+' : '-'} ${String(Math.abs(constant))} ${comparison} ${String(target)}`,
        test: (x) => {
          const value = coefficient * x + constant

          switch (comparison) {
            case '\\le':
              return value <= target
            case '\\lt':
              return value < target
            case '\\ge':
              return value >= target
            case '\\gt':
              return value > target
          }
        },
      }
    }
    case 3: {
      const target = rng.int(-6, 6)
      const comparison = rng.pick(['\\ge', '\\gt'] as const)

      return {
        latex: `x ${comparison} ${String(target)}`,
        test: (x) => (comparison === '\\ge' ? x >= target : x > target),
      }
    }
    default: {
      const target = rng.int(-6, 6)
      const comparison = rng.pick(['\\le', '\\lt'] as const)

      return {
        latex: `x ${comparison} ${String(target)}`,
        test: (x) => (comparison === '\\le' ? x <= target : x < target),
      }
    }
  }
}
