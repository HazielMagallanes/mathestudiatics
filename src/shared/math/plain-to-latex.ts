/**
 * Converts comfortable keyboard notation into LaTeX for rendering.
 *
 * `1/2 + sqrt(2)`, `x^2 - 4 = 0`, `sin(30) * pi` become rendered math, while
 * lines that already contain LaTeX commands are passed through untouched.
 */

const FUNCTION_NAMES: readonly string[] = [
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'arcsin',
  'arccos',
  'arctan',
  'ln',
  'log',
  'exp',
]

const SYMBOLS: readonly (readonly [RegExp, string])[] = [
  [/\bpi\b/g, '\\pi '],
  [/\binf\b/g, '\\infty '],
  [/\binfty\b/g, '\\infty '],
  [/\btheta\b/g, '\\theta '],
  [/\balpha\b/g, '\\alpha '],
  [/\bbeta\b/g, '\\beta '],
  [/\blambda\b/g, '\\lambda '],
  [/<=/g, '\\le '],
  [/>=/g, '\\ge '],
  [/!=/g, '\\neq '],
  [/(?<![<>=!])<(?!=)/g, '<'],
  [/(?<![<>=!])>(?!=)/g, '>'],
]

const BASE_ATOM = String.raw`(?:\\sqrt\{[^{}]*\}|\{[^{}]*\}|\([^()]*\)|\d+(?:[.,]\d+)?|[a-zA-Z]\w*)`
const ATOM = String.raw`${BASE_ATOM}(?:\^\{[^{}]*\})?`

function stripDelimiters(value: string): string {
  const trimmed = value.trim()

  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

/** `sqrt(x + 1)` → `\sqrt{x + 1}` (balanced parentheses, non-nested). */
function convertSqrt(input: string): string {
  let result = input
  let guard = 0

  for (;;) {
    const match = /sqrt\s*\(([^()]*)\)/.exec(result)

    if (!match || guard > 20) {
      return result
    }

    result = `${result.slice(0, match.index)}\\sqrt{${match[1] ?? ''}}${result.slice(match.index + match[0].length)}`
    guard += 1
  }
}

function convertFunctions(input: string): string {
  let result = input

  for (const name of FUNCTION_NAMES) {
    result = result.replace(new RegExp(`\\b${name}\\s*\\(`, 'g'), `\\${name}\\left(`)
  }

  return result
}

function convertOperators(input: string): string {
  return input.replace(/\*/g, ' \\cdot ').replace(/·/g, ' \\cdot ')
}

/** `1/2`, `(x+1)/3`, `sqrt(2)/2` → `\frac{...}{...}`. */
function convertFractions(input: string): string {
  const fractionPattern = new RegExp(`(${ATOM})\\s*/\\s*(${ATOM})`, 'g')
  let result = input
  let guard = 0

  for (;;) {
    const next = result.replace(
      fractionPattern,
      (_match, numerator: string, denominator: string) => {
        return `\\frac{${stripDelimiters(numerator)}}{${stripDelimiters(denominator)}}`
      },
    )

    guard += 1

    if (next === result || guard > 10) {
      return next
    }

    result = next
  }
}

/** `x^2`, `x^12` → `x^{2}`, `x^{12}`; leaves `x^{2}` untouched. */
function convertExponents(input: string): string {
  return input.replace(/\^(\{[^}]*\}|-?\d+(?:[.,]\d+)?|[a-zA-Z])/g, (_match, exponent: string) => {
    const value = exponent.startsWith('{') ? exponent.slice(1, -1) : exponent

    return `^{${value}}`
  })
}

function convertDecimals(input: string): string {
  // Spanish decimal commas inside numbers render better grouped: 1,5 → 1{,}5
  return input.replace(/(\d),(\d)/g, '$1{,}$2')
}

export function looksLikeLatex(input: string): boolean {
  return input.includes('\\')
}

export function plainToLatex(input: string): string {
  const trimmed = input.trim()

  if (trimmed.length === 0 || looksLikeLatex(trimmed)) {
    return trimmed
  }

  let result = convertFunctions(trimmed)
  result = convertSqrt(result)

  for (const [pattern, replacement] of SYMBOLS) {
    result = result.replace(pattern, replacement)
  }

  result = convertOperators(result)
  result = convertExponents(result)
  result = convertFractions(result)
  result = convertDecimals(result)

  return result
}
