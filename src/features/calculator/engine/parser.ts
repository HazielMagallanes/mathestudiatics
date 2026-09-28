import type { CalculatorError, Token } from '@/features/calculator/engine/tokenizer'

export type ExpressionNode =
  | { kind: 'number'; value: number }
  | { kind: 'constant'; name: 'pi' | 'e' | 'ans' }
  | { kind: 'unary'; operator: '+' | '-'; operand: ExpressionNode }
  | {
      kind: 'binary'
      operator: '+' | '-' | '*' | '/' | '^'
      left: ExpressionNode
      right: ExpressionNode
    }
  | { kind: 'call'; name: string; argument: ExpressionNode }
  | { kind: 'factorial'; operand: ExpressionNode }

export type ParseResult = { ok: true; node: ExpressionNode } | { ok: false; error: CalculatorError }

class Parser {
  private position = 0
  private readonly tokens: readonly Token[]

  constructor(tokens: readonly Token[]) {
    this.tokens = tokens
  }

  parse(): ParseResult {
    if (this.tokens.length === 0) {
      return { ok: false, error: { code: 'syntax' } }
    }

    const node = this.parseExpression()

    if ('error' in node) {
      return { ok: false, error: node.error }
    }

    if (this.position < this.tokens.length) {
      const token = this.tokens[this.position]

      return {
        ok: false,
        error: {
          code: 'syntax',
          ...(token ? { position: token.position } : {}),
        },
      }
    }

    return { ok: true, node: node.value }
  }

  private peek(): Token | undefined {
    return this.tokens[this.position]
  }

  private next(): Token | undefined {
    const token = this.tokens[this.position]
    this.position += 1
    return token
  }

  /** expression := term (('+' | '-') term)* */
  private parseExpression(): { value: ExpressionNode } | { error: CalculatorError } {
    let left = this.parseTerm()

    if ('error' in left) {
      return left
    }

    for (;;) {
      const token = this.peek()

      if (token?.type === 'operator' && (token.value === '+' || token.value === '-')) {
        this.next()
        const right = this.parseTerm()

        if ('error' in right) {
          return right
        }

        left = {
          value: {
            kind: 'binary',
            operator: token.value,
            left: left.value,
            right: right.value,
          },
        }
        continue
      }

      return left
    }
  }

  /** term := unary (('*' | '/' | implicit) unary)* */
  private parseTerm(): { value: ExpressionNode } | { error: CalculatorError } {
    let left = this.parseUnary()

    if ('error' in left) {
      return left
    }

    for (;;) {
      const token = this.peek()

      if (token?.type === 'operator' && (token.value === '*' || token.value === '/')) {
        this.next()
        const right = this.parseUnary()

        if ('error' in right) {
          return right
        }

        left = {
          value: { kind: 'binary', operator: token.value, left: left.value, right: right.value },
        }
        continue
      }

      // Implicit multiplication: 2π, 3(4+5), 2sin(30).
      if (token?.type === 'constant' || token?.type === 'function' || token?.type === 'lparen') {
        const right = this.parseUnary()

        if ('error' in right) {
          return right
        }

        left = { value: { kind: 'binary', operator: '*', left: left.value, right: right.value } }
        continue
      }

      return left
    }
  }

  /** power := postfix ('^' unary)? — right associative. */
  private parsePower(): { value: ExpressionNode } | { error: CalculatorError } {
    const base = this.parsePostfix()

    if ('error' in base) {
      return base
    }

    const token = this.peek()

    if (token?.type === 'operator' && token.value === '^') {
      this.next()
      const exponent = this.parseUnary()

      if ('error' in exponent) {
        return exponent
      }

      return { value: { kind: 'binary', operator: '^', left: base.value, right: exponent.value } }
    }

    return base
  }

  /** unary := ('+' | '-') unary | power */
  private parseUnary(): { value: ExpressionNode } | { error: CalculatorError } {
    const token = this.peek()

    if (token?.type === 'operator' && (token.value === '+' || token.value === '-')) {
      this.next()
      const operand = this.parseUnary()

      if ('error' in operand) {
        return operand
      }

      return { value: { kind: 'unary', operator: token.value, operand: operand.value } }
    }

    return this.parsePower()
  }

  /** postfix := primary ('!')* */
  private parsePostfix(): { value: ExpressionNode } | { error: CalculatorError } {
    let node = this.parsePrimary()

    if ('error' in node) {
      return node
    }

    while (this.peek()?.type === 'factorial') {
      this.next()
      node = { value: { kind: 'factorial', operand: node.value } }
    }

    return node
  }

  /** primary := number | constant | function '(' expression ')' | '(' expression ')' */
  private parsePrimary(): { value: ExpressionNode } | { error: CalculatorError } {
    const token = this.next()

    if (!token) {
      return { error: { code: 'syntax' } }
    }

    if (token.type === 'number') {
      return { value: { kind: 'number', value: token.number ?? 0 } }
    }

    if (token.type === 'constant') {
      if (token.value === 'pi' || token.value === 'e' || token.value === 'ans') {
        return { value: { kind: 'constant', name: token.value } }
      }

      return { error: { code: 'syntax', position: token.position } }
    }

    if (token.type === 'function') {
      const opening = this.next()

      if (opening?.type !== 'lparen') {
        return { error: { code: 'syntax', position: token.position } }
      }

      const argument = this.parseExpression()

      if ('error' in argument) {
        return argument
      }

      const closing = this.next()

      if (closing?.type !== 'rparen') {
        return { error: { code: 'syntax', position: closing?.position ?? token.position } }
      }

      return { value: { kind: 'call', name: token.value, argument: argument.value } }
    }

    if (token.type === 'lparen') {
      const inner = this.parseExpression()

      if ('error' in inner) {
        return inner
      }

      const closing = this.next()

      if (closing?.type !== 'rparen') {
        return { error: { code: 'syntax', position: closing?.position ?? token.position } }
      }

      return inner
    }

    return { error: { code: 'syntax', position: token.position } }
  }
}

export function parseTokens(tokens: readonly Token[]): ParseResult {
  return new Parser(tokens).parse()
}
