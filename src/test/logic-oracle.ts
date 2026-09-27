/**
 * Independent evaluator for the propositional-logic LaTeX produced by the
 * generators: parses `\lnot`, `\land`, `\lor`, `\Rightarrow` and
 * `\Leftrightarrow` with the usual precedence and evaluates valuations.
 */

export type ParsedFormula =
  | { kind: 'variable'; name: string }
  | { kind: 'not'; operand: ParsedFormula }
  | {
      kind: 'binary'
      op: 'and' | 'or' | 'implies' | 'iff'
      left: ParsedFormula
      right: ParsedFormula
    }

type Token =
  | { kind: 'not' }
  | { kind: 'op'; value: 'and' | 'or' | 'implies' | 'iff' }
  | { kind: 'lparen' }
  | { kind: 'rparen' }
  | { kind: 'variable'; name: string }

function tokenize(latex: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < latex.length) {
    const character = latex[index]

    if (character === undefined) {
      break
    }

    if (/\s/.test(character)) {
      index += 1
      continue
    }

    if (character === '\\') {
      const match = /^\\([a-zA-Z]+)/.exec(latex.slice(index))

      if (!match) {
        throw new Error(`Logic oracle: bad command at "${latex.slice(index, index + 10)}"`)
      }

      const command = match[1]

      if (!command) {
        throw new Error(`Logic oracle: bad command at "${latex.slice(index, index + 10)}"`)
      }

      switch (command) {
        case 'lnot':
          tokens.push({ kind: 'not' })
          break
        case 'land':
          tokens.push({ kind: 'op', value: 'and' })
          break
        case 'lor':
          tokens.push({ kind: 'op', value: 'or' })
          break
        case 'Rightarrow':
          tokens.push({ kind: 'op', value: 'implies' })
          break
        case 'Leftrightarrow':
          tokens.push({ kind: 'op', value: 'iff' })
          break
        case 'left':
        case 'right':
          break
        default:
          throw new Error(`Logic oracle: unsupported command \\${command}`)
      }

      index += match[0].length
      continue
    }

    if (character === '(') {
      tokens.push({ kind: 'lparen' })
      index += 1
      continue
    }

    if (character === ')') {
      tokens.push({ kind: 'rparen' })
      index += 1
      continue
    }

    if (/[a-zA-Z]/.test(character)) {
      tokens.push({ kind: 'variable', name: character })
      index += 1
      continue
    }

    throw new Error(`Logic oracle: unsupported character "${character}"`)
  }

  return tokens
}

class Parser {
  private position = 0
  private readonly tokens: readonly Token[]

  constructor(tokens: readonly Token[]) {
    this.tokens = tokens
  }

  atEnd(): boolean {
    return this.position >= this.tokens.length
  }

  private peek(): Token | undefined {
    return this.tokens[this.position]
  }

  private next(): Token | undefined {
    const token = this.tokens[this.position]
    this.position += 1
    return token
  }

  parseFormula(): ParsedFormula {
    return this.parseIff()
  }

  private parseIff(): ParsedFormula {
    let left = this.parseImplies()

    for (;;) {
      const token = this.peek()

      if (token?.kind === 'op' && token.value === 'iff') {
        this.next()
        left = { kind: 'binary', op: 'iff', left, right: this.parseImplies() }
        continue
      }

      return left
    }
  }

  private parseImplies(): ParsedFormula {
    let left = this.parseOr()

    for (;;) {
      const token = this.peek()

      if (token?.kind === 'op' && token.value === 'implies') {
        this.next()
        left = { kind: 'binary', op: 'implies', left, right: this.parseOr() }
        continue
      }

      return left
    }
  }

  private parseOr(): ParsedFormula {
    let left = this.parseAnd()

    for (;;) {
      const token = this.peek()

      if (token?.kind === 'op' && token.value === 'or') {
        this.next()
        left = { kind: 'binary', op: 'or', left, right: this.parseAnd() }
        continue
      }

      return left
    }
  }

  private parseAnd(): ParsedFormula {
    let left = this.parseNot()

    for (;;) {
      const token = this.peek()

      if (token?.kind === 'op' && token.value === 'and') {
        this.next()
        left = { kind: 'binary', op: 'and', left, right: this.parseNot() }
        continue
      }

      return left
    }
  }

  private parseNot(): ParsedFormula {
    const token = this.peek()

    if (token?.kind === 'not') {
      this.next()
      return { kind: 'not', operand: this.parseNot() }
    }

    return this.parseAtom()
  }

  private parseAtom(): ParsedFormula {
    const token = this.next()

    if (!token) {
      throw new Error('Logic oracle: unexpected end of input')
    }

    if (token.kind === 'variable') {
      return { kind: 'variable', name: token.name }
    }

    if (token.kind === 'lparen') {
      const inner = this.parseFormula()
      const closing = this.next()

      if (closing?.kind !== 'rparen') {
        throw new Error('Logic oracle: missing closing parenthesis')
      }

      return inner
    }

    throw new Error(`Logic oracle: unexpected token ${token.kind}`)
  }
}

export function parseLogicLatex(latex: string): ParsedFormula {
  const parser = new Parser(tokenize(latex))
  const formula = parser.parseFormula()

  if (!parser.atEnd()) {
    throw new Error(`Logic oracle: trailing input in "${latex}"`)
  }

  return formula
}

export function evaluateParsedFormula(
  formula: ParsedFormula,
  valuation: Record<string, boolean>,
): boolean {
  switch (formula.kind) {
    case 'variable': {
      const value = valuation[formula.name]

      if (value === undefined) {
        throw new Error(`Logic oracle: missing value for "${formula.name}"`)
      }

      return value
    }
    case 'not':
      return !evaluateParsedFormula(formula.operand, valuation)
    case 'binary': {
      const left = evaluateParsedFormula(formula.left, valuation)
      const right = evaluateParsedFormula(formula.right, valuation)

      switch (formula.op) {
        case 'and':
          return left && right
        case 'or':
          return left || right
        case 'implies':
          return !left || right
        case 'iff':
          return left === right
      }
    }
  }
}

export function parsedVariables(formula: ParsedFormula): string[] {
  switch (formula.kind) {
    case 'variable':
      return [formula.name]
    case 'not':
      return parsedVariables(formula.operand)
    case 'binary':
      return [...new Set([...parsedVariables(formula.left), ...parsedVariables(formula.right)])]
  }
}

export function allParsedValuations(variables: readonly string[]): Record<string, boolean>[] {
  const valuations: Record<string, boolean>[] = []

  for (let mask = 0; mask < 2 ** variables.length; mask += 1) {
    const valuation: Record<string, boolean> = {}

    variables.forEach((name, index) => {
      valuation[name] = ((mask >> index) & 1) === 1
    })

    valuations.push(valuation)
  }

  return valuations
}

/** Parses a valuation rendered as `p = V,\; q = F`. */
export function parseValuationLatex(latex: string): Record<string, boolean> {
  const valuation: Record<string, boolean> = {}
  const pattern = /([a-z])\s*=\s*([VF])/g

  for (const match of latex.matchAll(pattern)) {
    const name = match[1]
    const value = match[2]

    if (name && value) {
      valuation[name] = value === 'V'
    }
  }

  return valuation
}

export function isNegationNormalForm(formula: ParsedFormula): boolean {
  switch (formula.kind) {
    case 'variable':
      return true
    case 'not':
      return formula.operand.kind === 'variable'
    case 'binary':
      return isNegationNormalForm(formula.left) && isNegationNormalForm(formula.right)
  }
}
