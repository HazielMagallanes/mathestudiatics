import { extractSquareFactor } from '@/content/blocks/latex'
import {
  formatValue,
  toExactFraction,
  type ExactFraction,
} from '@/features/calculator/engine/format'
import {
  degree,
  subtractPolynomials,
  type Polynomial,
} from '@/features/calculator/engine/polynomial'

export type SolutionKind = 'solved' | 'none' | 'infinite' | 'no-real'

export interface EquationSolution {
  kind: SolutionKind
  /** LaTeX for the solution line, e.g. `x = 2`, `x = \pm 2`, `x_1 = 2,\; x_2 = -3`. */
  latex: string
  /** Numeric roots when they are not exact (for the ≈ line). */
  approximations: number[]
  exact: boolean
  doubleRoot?: boolean
}

const EPSILON = 1e-12

function isPerfectSquare(value: number): boolean {
  if (value < 0) {
    return false
  }

  const root = Math.round(Math.sqrt(value))

  return Math.abs(root * root - value) < 1e-9
}

function fractionSqrt(fraction: ExactFraction): ExactFraction | null {
  if (!isPerfectSquare(fraction.numerator) || !isPerfectSquare(fraction.denominator)) {
    return null
  }

  return {
    numerator: Math.round(Math.sqrt(fraction.numerator)),
    denominator: Math.round(Math.sqrt(fraction.denominator)),
  }
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y !== 0) {
    const remainder = x % y
    x = y
    y = remainder
  }

  return x || 1
}

function linearSolution(b: number, a: number): EquationSolution {
  const root = -b / a
  const formatted = formatValue(root)

  return {
    kind: 'solved',
    latex: formatted.exact ? `x = ${formatted.latex}` : `x \\approx ${formatted.latex}`,
    approximations: formatted.exact ? [] : [root],
    exact: formatted.exact,
  }
}

function solutionFromRoots(rootOne: number, rootTwo: number, doubleRoot = false): EquationSolution {
  const first = formatValue(rootOne)
  const second = formatValue(rootTwo)

  if (doubleRoot) {
    return {
      kind: 'solved',
      latex: first.exact ? `x = ${first.latex}` : `x \\approx ${first.latex}`,
      approximations: first.exact ? [] : [rootOne],
      exact: first.exact,
      doubleRoot: true,
    }
  }

  if (first.exact && second.exact) {
    if (Math.abs(rootOne + rootTwo) < EPSILON) {
      return {
        kind: 'solved',
        latex: `x = \\pm ${first.latex.replace('-', '')}`,
        approximations: [],
        exact: true,
      }
    }

    return {
      kind: 'solved',
      latex: `x_1 = ${first.latex},\\quad x_2 = ${second.latex}`,
      approximations: [],
      exact: true,
    }
  }

  return {
    kind: 'solved',
    latex: `x_1 \\approx ${first.latex},\\quad x_2 \\approx ${second.latex}`,
    approximations: [rootOne, rootTwo],
    exact: false,
  }
}

/** Irrational quadratic roots: `x = (-b ± k√m) / (2a)` with a simplified radical. */
function irrationalQuadraticSolution(a: number, b: number, delta: number): EquationSolution | null {
  const deltaFraction = toExactFraction(delta)

  if (!deltaFraction) {
    return null
  }

  const { numerator, denominator } = deltaFraction
  const product = numerator * denominator
  const { outside, inside } = extractSquareFactor(Math.abs(product))

  if (inside === 1) {
    return null
  }

  const denominatorFactor = denominator
  const minusB = -b * denominatorFactor
  const linearTerm = 2 * a * denominatorFactor

  const firstRoot = (-b + Math.sqrt(delta)) / (2 * a)
  const secondRoot = (-b - Math.sqrt(delta)) / (2 * a)

  const round = (value: number): number => Math.round(value)

  if (Math.abs(minusB - round(minusB)) > 1e-9 || Math.abs(linearTerm - round(linearTerm)) > 1e-9) {
    return null
  }

  const divisor = gcd(gcd(round(minusB), outside), round(linearTerm))
  const numeratorValue = round(minusB) / divisor
  const radicalCoefficient = outside / divisor
  const denominatorValue = round(linearTerm) / divisor
  const radical =
    radicalCoefficient === 1
      ? `\\sqrt{${String(inside)}}`
      : `${String(radicalCoefficient)}\\sqrt{${String(inside)}}`
  const latex =
    denominatorValue === 1
      ? numeratorValue === 0
        ? `x = \\pm ${radical}`
        : `x = ${String(numeratorValue)} \\pm ${radical}`
      : `x = \\frac{${String(numeratorValue)} \\pm ${radical}}{${String(denominatorValue)}}`

  return {
    kind: 'solved',
    latex,
    approximations: [firstRoot, secondRoot],
    exact: false,
  }
}

export function solvePolynomialEquation(left: Polynomial, right: Polynomial): EquationSolution {
  const equation = subtractPolynomials(left, right)
  const equationDegree = degree(equation)
  const constant = equation.coefficients[0] ?? 0
  const linear = equation.coefficients[1] ?? 0
  const quadratic = equation.coefficients[2] ?? 0

  if (equationDegree === 0) {
    return Math.abs(constant) < EPSILON
      ? { kind: 'infinite', latex: '', approximations: [], exact: true }
      : { kind: 'none', latex: '', approximations: [], exact: true }
  }

  if (equationDegree === 1) {
    return linearSolution(constant, linear)
  }

  const delta = linear * linear - 4 * quadratic * constant

  if (delta < -EPSILON) {
    return { kind: 'no-real', latex: '', approximations: [], exact: false }
  }

  if (Math.abs(delta) <= EPSILON) {
    return solutionFromRoots(-linear / (2 * quadratic), -linear / (2 * quadratic), true)
  }

  const exactDelta = toExactFraction(delta)
  const deltaRoot = exactDelta ? fractionSqrt(exactDelta) : null

  if (exactDelta && deltaRoot) {
    const root = deltaRoot.numerator / deltaRoot.denominator

    return solutionFromRoots((-linear + root) / (2 * quadratic), (-linear - root) / (2 * quadratic))
  }

  const irrational = irrationalQuadraticSolution(quadratic, linear, delta)

  if (irrational) {
    return irrational
  }

  return solutionFromRoots(
    (-linear + Math.sqrt(delta)) / (2 * quadratic),
    (-linear - Math.sqrt(delta)) / (2 * quadratic),
  )
}
