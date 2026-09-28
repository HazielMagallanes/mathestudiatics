import type { CalculatorError } from '@/features/calculator/engine/tokenizer'
import type { ExpressionNode } from '@/features/calculator/engine/parser'
import { evaluateExpression, type AngleMode } from '@/features/calculator/engine/evaluate'

/**
 * Polynomials up to degree 2 (enough for linear and quadratic equations),
 * with numeric coefficients. Exactness is recovered at display time by
 * detecting rationals (see `toExactFraction`).
 */
export interface Polynomial {
  /** coefficients[0] + coefficients[1]·x + coefficients[2]·x² */
  coefficients: number[]
}

export const MAX_DEGREE = 2

function trim(polynomial: Polynomial): Polynomial {
  const coefficients = [...polynomial.coefficients]

  while (coefficients.length > 1 && Math.abs(coefficients[coefficients.length - 1] ?? 0) < 1e-12) {
    coefficients.pop()
  }

  return { coefficients }
}

export function constantPolynomial(value: number): Polynomial {
  return { coefficients: [value] }
}

export function degree(polynomial: Polynomial): number {
  return polynomial.coefficients.length - 1
}

export function addPolynomials(left: Polynomial, right: Polynomial): Polynomial {
  const length = Math.max(left.coefficients.length, right.coefficients.length)
  const coefficients: number[] = []

  for (let index = 0; index < length; index += 1) {
    coefficients.push((left.coefficients[index] ?? 0) + (right.coefficients[index] ?? 0))
  }

  return trim({ coefficients })
}

export function subtractPolynomials(left: Polynomial, right: Polynomial): Polynomial {
  return addPolynomials(left, {
    coefficients: right.coefficients.map((coefficient) => -coefficient),
  })
}

export function multiplyPolynomials(left: Polynomial, right: Polynomial): Polynomial | null {
  const coefficients = new Array<number>(
    left.coefficients.length + right.coefficients.length - 1,
  ).fill(0)

  for (let leftIndex = 0; leftIndex < left.coefficients.length; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < right.coefficients.length; rightIndex += 1) {
      const position = leftIndex + rightIndex
      const current = coefficients[position] ?? 0

      coefficients[position] =
        current + (left.coefficients[leftIndex] ?? 0) * (right.coefficients[rightIndex] ?? 0)
    }
  }

  const result = trim({ coefficients })

  return degree(result) > MAX_DEGREE ? null : result
}

function scalePolynomial(polynomial: Polynomial, factor: number): Polynomial {
  return trim({ coefficients: polynomial.coefficients.map((coefficient) => coefficient * factor) })
}

export function powerPolynomial(base: Polynomial, exponent: number): Polynomial | null {
  if (!Number.isInteger(exponent) || exponent < 0) {
    return null
  }

  if (degree(base) === 0) {
    return constantPolynomial((base.coefficients[0] ?? 0) ** exponent)
  }

  if (degree(base) * exponent > MAX_DEGREE) {
    return null
  }

  let result = constantPolynomial(1)

  for (let index = 0; index < exponent; index += 1) {
    const next = multiplyPolynomials(result, base)

    if (!next) {
      return null
    }

    result = next
  }

  return result
}

export type PolynomialResult =
  { ok: true; polynomial: Polynomial } | { ok: false; error: CalculatorError }

/** Builds a polynomial from an AST; functions of x are not polynomial. */
export function toPolynomial(
  node: ExpressionNode,
  angleMode: AngleMode,
  ans: number,
): PolynomialResult {
  switch (node.kind) {
    case 'number':
      return { ok: true, polynomial: constantPolynomial(node.value) }
    case 'variable':
      return { ok: true, polynomial: { coefficients: [0, 1] } }
    case 'constant': {
      const numeric = evaluateExpression(node.name, { angleMode, ans, memory: 0 })

      return numeric.ok
        ? { ok: true, polynomial: constantPolynomial(numeric.value) }
        : { ok: false, error: numeric.error }
    }
    case 'unary': {
      const operand = toPolynomial(node.operand, angleMode, ans)

      if (!operand.ok) {
        return operand
      }

      return {
        ok: true,
        polynomial:
          node.operator === '-' ? scalePolynomial(operand.polynomial, -1) : operand.polynomial,
      }
    }
    case 'binary': {
      const left = toPolynomial(node.left, angleMode, ans)

      if (!left.ok) {
        return left
      }

      const right = toPolynomial(node.right, angleMode, ans)

      if (!right.ok) {
        return right
      }

      switch (node.operator) {
        case '+':
          return { ok: true, polynomial: addPolynomials(left.polynomial, right.polynomial) }
        case '-':
          return { ok: true, polynomial: subtractPolynomials(left.polynomial, right.polynomial) }
        case '*': {
          const product = multiplyPolynomials(left.polynomial, right.polynomial)

          return product
            ? { ok: true, polynomial: product }
            : { ok: false, error: { code: 'unsupported' } }
        }
        case '/': {
          if (degree(right.polynomial) > 0) {
            return { ok: false, error: { code: 'unsupported' } }
          }

          const divisor = right.polynomial.coefficients[0] ?? 0

          if (divisor === 0) {
            return { ok: false, error: { code: 'divisionByZero' } }
          }

          return { ok: true, polynomial: scalePolynomial(left.polynomial, 1 / divisor) }
        }
        case '^': {
          if (degree(right.polynomial) > 0) {
            return { ok: false, error: { code: 'unsupported' } }
          }

          const exponent = right.polynomial.coefficients[0] ?? 0
          const powered = powerPolynomial(left.polynomial, exponent)

          return powered
            ? { ok: true, polynomial: powered }
            : { ok: false, error: { code: 'unsupported' } }
        }
      }
      return { ok: false, error: { code: 'syntax' } }
    }
    case 'call': {
      const argument = toPolynomial(node.argument, angleMode, ans)

      if (!argument.ok) {
        return argument
      }

      if (degree(argument.polynomial) > 0) {
        // sin(x), ln(x), … cannot be solved with the polynomial path.
        return { ok: false, error: { code: 'unsupported' } }
      }

      const numeric = evaluateExpression(
        `${node.name}(${String(argument.polynomial.coefficients[0] ?? 0)})`,
        { angleMode, ans, memory: 0 },
      )

      return numeric.ok
        ? { ok: true, polynomial: constantPolynomial(numeric.value) }
        : { ok: false, error: numeric.error }
    }
    case 'factorial': {
      const operand = toPolynomial(node.operand, angleMode, ans)

      if (!operand.ok) {
        return operand
      }

      if (degree(operand.polynomial) > 0) {
        return { ok: false, error: { code: 'unsupported' } }
      }

      const numeric = evaluateExpression(`${String(operand.polynomial.coefficients[0] ?? 0)}!`, {
        angleMode,
        ans,
        memory: 0,
      })

      return numeric.ok
        ? { ok: true, polynomial: constantPolynomial(numeric.value) }
        : { ok: false, error: numeric.error }
    }
  }
}
