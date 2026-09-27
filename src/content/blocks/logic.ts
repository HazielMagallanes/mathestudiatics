import type { Rng } from '@/content/rng'

export type LogicVariable = 'p' | 'q' | 'r'

export type LogicFormula =
  | { kind: 'variable'; name: LogicVariable }
  | { kind: 'not'; operand: LogicFormula }
  | { kind: 'and'; left: LogicFormula; right: LogicFormula }
  | { kind: 'or'; left: LogicFormula; right: LogicFormula }
  | { kind: 'implies'; left: LogicFormula; right: LogicFormula }
  | { kind: 'iff'; left: LogicFormula; right: LogicFormula }

export type Valuation = Record<LogicVariable, boolean>

export type FormulaType = 'tautology' | 'contradiction' | 'contingency'

const PRECEDENCE: Record<LogicFormula['kind'], number> = {
  iff: 0,
  implies: 1,
  or: 2,
  and: 3,
  not: 4,
  variable: 5,
}

const CONNECTIVE_LATEX = {
  and: '\\land',
  or: '\\lor',
  implies: '\\Rightarrow',
  iff: '\\Leftrightarrow',
} as const

function render(formula: LogicFormula, parentPrecedence: number, side: 'left' | 'right'): string {
  switch (formula.kind) {
    case 'variable':
      return formula.name
    case 'not': {
      const operand = render(formula.operand, PRECEDENCE.not, 'right')
      return `\\lnot ${operand}`
    }
    default: {
      const precedence = PRECEDENCE[formula.kind]
      const left = render(formula.left, precedence, 'left')
      const right = render(formula.right, precedence, 'right')
      const connective = CONNECTIVE_LATEX[formula.kind]
      const expression = `${left} ${connective} ${right}`

      const needsParentheses =
        precedence < parentPrecedence ||
        (precedence === parentPrecedence &&
          side === 'right' &&
          (formula.kind === 'implies' || formula.kind === 'iff'))

      return needsParentheses ? `\\left(${expression}\\right)` : expression
    }
  }
}

export function formulaLatex(formula: LogicFormula): string {
  return render(formula, -1, 'left')
}

export function evaluateFormula(formula: LogicFormula, valuation: Valuation): boolean {
  switch (formula.kind) {
    case 'variable':
      return valuation[formula.name]
    case 'not':
      return !evaluateFormula(formula.operand, valuation)
    case 'and':
      return evaluateFormula(formula.left, valuation) && evaluateFormula(formula.right, valuation)
    case 'or':
      return evaluateFormula(formula.left, valuation) || evaluateFormula(formula.right, valuation)
    case 'implies':
      return !evaluateFormula(formula.left, valuation) || evaluateFormula(formula.right, valuation)
    case 'iff':
      return evaluateFormula(formula.left, valuation) === evaluateFormula(formula.right, valuation)
  }
}

export function formulaVariables(formula: LogicFormula): LogicVariable[] {
  switch (formula.kind) {
    case 'variable':
      return [formula.name]
    case 'not':
      return formulaVariables(formula.operand)
    default:
      return [...new Set([...formulaVariables(formula.left), ...formulaVariables(formula.right)])]
  }
}

/** All valuations over the given variables, in a stable order. */
export function allValuations(variables: readonly LogicVariable[]): Valuation[] {
  const valuations: Valuation[] = []

  for (let mask = 0; mask < 2 ** variables.length; mask += 1) {
    const valuation = {} as Valuation

    variables.forEach((variable, index) => {
      valuation[variable] = ((mask >> index) & 1) === 1
    })

    valuations.push(valuation)
  }

  return valuations
}

export function classifyFormula(formula: LogicFormula): FormulaType {
  const variables = formulaVariables(formula)
  let sawTrue = false
  let sawFalse = false

  for (const valuation of allValuations(variables)) {
    if (evaluateFormula(formula, valuation)) {
      sawTrue = true
    } else {
      sawFalse = true
    }

    if (sawTrue && sawFalse) {
      return 'contingency'
    }
  }

  return sawTrue ? 'tautology' : 'contradiction'
}

export function areEquivalent(left: LogicFormula, right: LogicFormula): boolean {
  const variables = [...new Set([...formulaVariables(left), ...formulaVariables(right)])]

  return allValuations(variables).every(
    (valuation) => evaluateFormula(left, valuation) === evaluateFormula(right, valuation),
  )
}

function buildRandom(rng: Rng, variables: readonly LogicVariable[], depth: number): LogicFormula {
  if (depth <= 0) {
    const name = rng.pick(variables)

    return rng.bool(0.25)
      ? { kind: 'not', operand: { kind: 'variable', name } }
      : { kind: 'variable', name }
  }

  if (rng.bool(0.18)) {
    return { kind: 'not', operand: buildRandom(rng, variables, depth - 1) }
  }

  const kind = rng.pick(['and', 'or', 'implies', 'iff'] as const)

  return {
    kind,
    left: buildRandom(rng, variables, depth - 1),
    right: buildRandom(rng, variables, depth - 1),
  }
}

export function randomFormula(
  rng: Rng,
  variables: readonly LogicVariable[],
  depth = 2,
): LogicFormula {
  return buildRandom(rng, variables, depth)
}

type Pattern = (first: LogicVariable, second: LogicVariable) => LogicFormula

export const variableNode = (name: LogicVariable): LogicFormula => ({ kind: 'variable', name })
export const notNode = (operand: LogicFormula): LogicFormula => ({ kind: 'not', operand })
export const andNode = (left: LogicFormula, right: LogicFormula): LogicFormula => ({
  kind: 'and',
  left,
  right,
})
export const orNode = (left: LogicFormula, right: LogicFormula): LogicFormula => ({
  kind: 'or',
  left,
  right,
})
export const impliesNode = (left: LogicFormula, right: LogicFormula): LogicFormula => ({
  kind: 'implies',
  left,
  right,
})
export const iffNode = (left: LogicFormula, right: LogicFormula): LogicFormula => ({
  kind: 'iff',
  left,
  right,
})

const variable = variableNode
const not = notNode
const and = andNode
const or = orNode
const implies = impliesNode
const iff = iffNode

const TAUTOLOGY_PATTERNS: readonly Pattern[] = [
  (p) => implies(variable(p), variable(p)),
  (p, _q) => or(variable(p), not(variable(p))),
  (p, q) => implies(variable(p), or(variable(p), variable(q))),
  (p, q) => or(implies(variable(p), variable(q)), implies(variable(q), variable(p))),
  (p, q) => iff(not(and(variable(p), variable(q))), or(not(variable(p)), not(variable(q)))),
  (p, q) => implies(implies(variable(p), variable(q)), implies(not(variable(q)), not(variable(p)))),
]

const CONTRADICTION_PATTERNS: readonly Pattern[] = [
  (p) => and(variable(p), not(variable(p))),
  (p) => iff(variable(p), not(variable(p))),
  (p, q) => and(and(or(variable(p), variable(q)), not(variable(p))), not(variable(q))),
  (p, q) => and(and(implies(variable(p), variable(q)), variable(p)), not(variable(q))),
]

function pickDistinct(
  rng: Rng,
  variables: readonly LogicVariable[],
): [LogicVariable, LogicVariable] {
  if (variables.length < 2) {
    const only = variables[0]

    if (!only) {
      throw new RangeError('At least one variable is required')
    }

    return [only, only]
  }

  const shuffled = rng.shuffle(variables)
  const first = shuffled[0]
  const second = shuffled[1]

  if (!first || !second) {
    throw new Error('Unreachable: shuffle returned too few variables')
  }

  return [first, second]
}

/** A random formula of a known type, useful for classification exercises. */
export function randomFormulaOfType(
  rng: Rng,
  variables: readonly LogicVariable[],
  type: FormulaType,
): LogicFormula {
  if (type === 'contingency') {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = randomFormula(rng, variables, 2)

      if (classifyFormula(candidate) === 'contingency') {
        return candidate
      }
    }

    throw new Error('Could not build a contingency')
  }

  const patterns = type === 'tautology' ? TAUTOLOGY_PATTERNS : CONTRADICTION_PATTERNS
  const [first, second] = pickDistinct(rng, variables)
  const pattern = rng.pick(patterns)

  return pattern(first, second)
}

/** Pushes negations inwards: ¬(a ∧ b) → ¬a ∨ ¬b, ¬¬a → a, etc. */
export function simplifyNegation(formula: LogicFormula): LogicFormula {
  switch (formula.kind) {
    case 'variable':
      return formula
    case 'not': {
      const inner = formula.operand

      switch (inner.kind) {
        case 'variable':
          return formula
        case 'not':
          return simplifyNegation(inner.operand)
        case 'and':
          return {
            kind: 'or',
            left: simplifyNegation({ kind: 'not', operand: inner.left }),
            right: simplifyNegation({ kind: 'not', operand: inner.right }),
          }
        case 'or':
          return {
            kind: 'and',
            left: simplifyNegation({ kind: 'not', operand: inner.left }),
            right: simplifyNegation({ kind: 'not', operand: inner.right }),
          }
        case 'implies':
          return {
            kind: 'and',
            left: simplifyNegation(inner.left),
            right: simplifyNegation({ kind: 'not', operand: inner.right }),
          }
        case 'iff':
          return {
            kind: 'iff',
            left: simplifyNegation(inner.left),
            right: simplifyNegation({ kind: 'not', operand: inner.right }),
          }
      }
      break
    }
    default:
      return {
        kind: formula.kind,
        left: simplifyNegation(formula.left),
        right: simplifyNegation(formula.right),
      }
  }
}
