import type { ExpressionNode } from '@/features/calculator/engine/parser'
import { parseTokens } from '@/features/calculator/engine/parser'
import { tokenize, type CalculatorError } from '@/features/calculator/engine/tokenizer'

export type AngleMode = 'deg' | 'rad'

export interface EvaluationContext {
  angleMode: AngleMode
  /** Previous result, available as `ans`. */
  ans: number
  memory: number
}

export type EvaluationResult = { ok: true; value: number } | { ok: false; error: CalculatorError }

const DEGREES_PER_RADIAN = 180 / Math.PI

function toRadians(value: number, mode: AngleMode): number {
  return mode === 'deg' ? (value * Math.PI) / 180 : value
}

function fromRadians(value: number, mode: AngleMode): number {
  return mode === 'deg' ? value * DEGREES_PER_RADIAN : value
}

function factorial(value: number): number | null {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    return null
  }

  let result = 1

  for (let factor = 2; factor <= value; factor += 1) {
    result *= factor
  }

  return result
}

class Evaluator {
  private readonly context: EvaluationContext

  constructor(context: EvaluationContext) {
    this.context = context
  }

  evaluate(node: ExpressionNode): { value: number } | { error: CalculatorError } {
    switch (node.kind) {
      case 'number':
        return { value: node.value }

      case 'constant':
        switch (node.name) {
          case 'pi':
            return { value: Math.PI }
          case 'e':
            return { value: Math.E }
          case 'ans':
            return { value: this.context.ans }
        }
        return { error: { code: 'syntax' } }

      case 'unary': {
        const operand = this.evaluate(node.operand)

        if ('error' in operand) {
          return operand
        }

        return { value: node.operator === '-' ? -operand.value : operand.value }
      }

      case 'binary': {
        const left = this.evaluate(node.left)

        if ('error' in left) {
          return left
        }

        const right = this.evaluate(node.right)

        if ('error' in right) {
          return right
        }

        switch (node.operator) {
          case '+':
            return { value: left.value + right.value }
          case '-':
            return { value: left.value - right.value }
          case '*':
            return { value: left.value * right.value }
          case '/':
            if (right.value === 0) {
              return { error: { code: 'divisionByZero' } }
            }

            return { value: left.value / right.value }
          case '^':
            if (left.value === 0 && right.value < 0) {
              return { error: { code: 'divisionByZero' } }
            }

            if (left.value < 0 && !Number.isInteger(right.value)) {
              return { error: { code: 'domain' } }
            }

            return { value: left.value ** right.value }
        }
        return { error: { code: 'syntax' } }
      }

      case 'factorial': {
        const operand = this.evaluate(node.operand)

        if ('error' in operand) {
          return operand
        }

        const result = factorial(operand.value)

        return result === null ? { error: { code: 'domain' } } : { value: result }
      }

      case 'call': {
        const argument = this.evaluate(node.argument)

        if ('error' in argument) {
          return argument
        }

        const value = argument.value

        switch (node.name) {
          case 'sin':
            return { value: Math.sin(toRadians(value, this.context.angleMode)) }
          case 'cos':
            return { value: Math.cos(toRadians(value, this.context.angleMode)) }
          case 'tan': {
            const radians = toRadians(value, this.context.angleMode)

            if (Math.abs(Math.cos(radians)) < 1e-12) {
              return { error: { code: 'domain' } }
            }

            return { value: Math.tan(radians) }
          }
          case 'asin':
            return value < -1 || value > 1
              ? { error: { code: 'domain' } }
              : { value: fromRadians(Math.asin(value), this.context.angleMode) }
          case 'acos':
            return value < -1 || value > 1
              ? { error: { code: 'domain' } }
              : { value: fromRadians(Math.acos(value), this.context.angleMode) }
          case 'atan':
            return { value: fromRadians(Math.atan(value), this.context.angleMode) }
          case 'ln':
            return value <= 0 ? { error: { code: 'domain' } } : { value: Math.log(value) }
          case 'log':
            return value <= 0 ? { error: { code: 'domain' } } : { value: Math.log10(value) }
          case 'sqrt':
            return value < 0 ? { error: { code: 'domain' } } : { value: Math.sqrt(value) }
          case 'cbrt':
            return { value: Math.cbrt(value) }
          case 'abs':
            return { value: Math.abs(value) }
          default:
            return { error: { code: 'syntax' } }
        }
      }
    }
  }
}

export function evaluateExpression(input: string, context: EvaluationContext): EvaluationResult {
  const tokenized = tokenize(input)

  if ('error' in tokenized) {
    return { ok: false, error: tokenized.error }
  }

  const parsed = parseTokens(tokenized.tokens)

  if (!parsed.ok) {
    return { ok: false, error: parsed.error }
  }

  const result = new Evaluator(context).evaluate(parsed.node)

  if ('error' in result) {
    return { ok: false, error: result.error }
  }

  if (!Number.isFinite(result.value)) {
    return { ok: false, error: { code: 'overflow' } }
  }

  return { ok: true, value: result.value }
}
