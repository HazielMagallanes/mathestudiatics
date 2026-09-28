import {
  evaluateExpression,
  type AngleMode,
  type EvaluationContext,
} from '@/features/calculator/engine/evaluate'
import { parseTokens, type ExpressionNode } from '@/features/calculator/engine/parser'
import { toPolynomial } from '@/features/calculator/engine/polynomial'
import { solvePolynomialEquation, type EquationSolution } from '@/features/calculator/engine/solve'
import { tokenize, type CalculatorError } from '@/features/calculator/engine/tokenizer'
import { plainToLatex } from '@/shared/math/plain-to-latex'

export type CalculatorOutcome =
  | { kind: 'value'; value: number }
  | { kind: 'equation'; solution: EquationSolution }
  | { kind: 'symbolic'; latex: string }
  | { kind: 'error'; error: CalculatorError }

export function containsVariable(node: ExpressionNode): boolean {
  switch (node.kind) {
    case 'variable':
      return true
    case 'number':
    case 'constant':
      return false
    case 'unary':
      return containsVariable(node.operand)
    case 'factorial':
      return containsVariable(node.operand)
    case 'call':
      return containsVariable(node.argument)
    case 'binary':
      return containsVariable(node.left) || containsVariable(node.right)
  }
}

/** First `=` that is not part of `<=`, `>=` or `!=`. */
function findEquationSeparator(input: string): number {
  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== '=') {
      continue
    }

    const previous = input[index - 1]

    if (previous === '<' || previous === '>' || previous === '!') {
      continue
    }

    const next = input[index + 1]

    if (next === '=') {
      index += 1
      continue
    }

    return index
  }

  return -1
}

function parseSide(
  input: string,
): { ok: true; node: ExpressionNode } | { ok: false; error: CalculatorError } {
  const tokenized = tokenize(input)

  if ('error' in tokenized) {
    return { ok: false, error: tokenized.error }
  }

  const parsed = parseTokens(tokenized.tokens)

  if (!parsed.ok) {
    return { ok: false, error: parsed.error }
  }

  return { ok: true, node: parsed.node }
}

export function evaluateInput(input: string, context: EvaluationContext): CalculatorOutcome {
  const trimmed = input.trim()

  if (trimmed.length === 0) {
    return { kind: 'error', error: { code: 'syntax' } }
  }

  const separator = findEquationSeparator(trimmed)

  if (separator >= 0) {
    const leftText = trimmed.slice(0, separator)
    const rightText = trimmed.slice(separator + 1)
    const left = parseSide(leftText)

    if (!left.ok) {
      return { kind: 'error', error: left.error }
    }

    const right = parseSide(rightText)

    if (!right.ok) {
      return { kind: 'error', error: right.error }
    }

    const leftPolynomial = toPolynomial(left.node, context.angleMode, context.ans)

    if (!leftPolynomial.ok) {
      return { kind: 'error', error: leftPolynomial.error }
    }

    const rightPolynomial = toPolynomial(right.node, context.angleMode, context.ans)

    if (!rightPolynomial.ok) {
      return { kind: 'error', error: rightPolynomial.error }
    }

    return {
      kind: 'equation',
      solution: solvePolynomialEquation(leftPolynomial.polynomial, rightPolynomial.polynomial),
    }
  }

  const parsed = parseSide(trimmed)

  if (!parsed.ok) {
    return { kind: 'error', error: parsed.error }
  }

  if (containsVariable(parsed.node)) {
    return { kind: 'symbolic', latex: plainToLatex(trimmed) }
  }

  const numeric = evaluateExpression(trimmed, context)

  return numeric.ok
    ? { kind: 'value', value: numeric.value }
    : { kind: 'error', error: numeric.error }
}

export type { AngleMode }
