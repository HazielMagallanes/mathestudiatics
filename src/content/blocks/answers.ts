import type { Fraction } from '@/content/blocks/fractions'
import {
  fractionLatex,
  intervalLatex,
  radicalLatex,
  setLatex,
  vectorLatex,
  type IntervalBounds,
} from '@/content/blocks/latex'
import type { LocalizedAnswer, LocalizedText } from '@/content/schema'

export function integerAnswer(value: number, note?: LocalizedText): LocalizedAnswer {
  return {
    latex: String(value),
    value: { kind: 'integer', value },
    ...(note ? { note } : {}),
  }
}

export function fractionAnswer(fraction: Fraction, note?: LocalizedText): LocalizedAnswer {
  return {
    latex: fractionLatex(fraction),
    value: {
      kind: 'fraction',
      numerator: fraction.numerator,
      denominator: fraction.denominator,
    },
    ...(note ? { note } : {}),
  }
}

export function radicalAnswer(
  coefficient: number,
  radicand: number,
  note?: LocalizedText,
): LocalizedAnswer {
  return {
    latex: radicalLatex(coefficient, radicand),
    value: { kind: 'radical', coefficient, radicand },
    ...(note ? { note } : {}),
  }
}

export function intervalAnswer(bounds: IntervalBounds, note?: LocalizedText): LocalizedAnswer {
  return {
    latex: intervalLatex(bounds),
    value: {
      kind: 'interval',
      from: bounds.from,
      to: bounds.to,
      fromInclusive: bounds.fromInclusive,
      toInclusive: bounds.toInclusive,
    },
    ...(note ? { note } : {}),
  }
}

export function setAnswer(values: readonly number[], note?: LocalizedText): LocalizedAnswer {
  return {
    latex: setLatex(values),
    value: { kind: 'set', values: [...values].sort((a, b) => a - b) },
    ...(note ? { note } : {}),
  }
}

export function booleanAnswer(value: boolean, note?: LocalizedText): LocalizedAnswer {
  return {
    latex: value ? 'V' : 'F',
    latexByLocale: {
      es: value ? '\\text{Verdadero}' : '\\text{Falso}',
      en: value ? '\\text{True}' : '\\text{False}',
    },
    value: { kind: 'boolean', value },
    ...(note ? { note } : {}),
  }
}

export function textAnswer(
  value: string,
  latex: string,
  options?: { note?: LocalizedText; latexByLocale?: LocalizedText },
): LocalizedAnswer {
  return {
    latex,
    value: { kind: 'text', value },
    ...(options?.latexByLocale ? { latexByLocale: options.latexByLocale } : {}),
    ...(options?.note ? { note: options.note } : {}),
  }
}

export function vectorAnswer(components: readonly number[], note?: LocalizedText): LocalizedAnswer {
  return {
    latex: vectorLatex(components),
    value: { kind: 'vector', components: [...components] },
    ...(note ? { note } : {}),
  }
}

export function decimalAnswer(value: number, digits = 2, note?: LocalizedText): LocalizedAnswer {
  const rounded = Number(value.toFixed(digits))

  return {
    latex: String(rounded).replace('.', '{,}'),
    value: { kind: 'decimal', value: rounded },
    ...(note ? { note } : {}),
  }
}

export function step(es: string, en: string, latex: string): LocalizedAnswer {
  return { latex, note: { es, en } }
}
