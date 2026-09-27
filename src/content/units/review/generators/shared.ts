import type { Fraction } from '@/content/blocks/fractions'
import {
  fractionLatex,
  intervalLatex,
  radicalLatex,
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

export function step(es: string, en: string, latex: string): LocalizedAnswer {
  return { latex, note: { es, en } }
}
