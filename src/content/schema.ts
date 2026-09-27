import type { Rng } from '@/content/rng'

export type Difficulty = 'easy' | 'medium' | 'hard'

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard']

export type UnitId = string

export interface LocalizedText {
  es: string
  en: string
}

export type TemplateParams = Record<string, string | number>

/** A bilingual template with the parameters needed to render it. */
export interface LocalizedTemplate extends LocalizedText {
  params: TemplateParams
}

export type AnswerValue =
  | { kind: 'integer'; value: number }
  | { kind: 'fraction'; numerator: number; denominator: number }
  | { kind: 'decimal'; value: number }
  | { kind: 'radical'; coefficient: number; radicand: number }
  | { kind: 'vector'; components: readonly number[] }
  | {
      kind: 'interval'
      from: number | null
      to: number | null
      fromInclusive: boolean
      toInclusive: boolean
    }
  | { kind: 'set'; values: readonly number[] }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'text'; value: string }

export interface LocalizedAnswer {
  latex: string
  /** Per-language rendering when the answer contains words (e.g. "Tautología"). */
  latexByLocale?: LocalizedText
  /** Machine-checkable form, used by tests today and by self-check later. */
  value?: AnswerValue
  note?: LocalizedText
}

export interface ExercisePart {
  prompt: LocalizedTemplate
  answer: LocalizedAnswer
  steps: readonly LocalizedAnswer[]
}

export interface ExerciseContent {
  intro?: LocalizedTemplate
  parts: readonly ExercisePart[]
}

export interface ExerciseGenerator {
  id: string
  /** One unit = regular exercise; two or more = combined exercise. */
  units: readonly UnitId[]
  difficulty: Difficulty
  tags: readonly string[]
  generate(rng: Rng): ExerciseContent
}

export interface UnitDefinition {
  id: UnitId
  /** Display order in lists and selectors. */
  order: number
  title: LocalizedText
  description: LocalizedText
  generators: readonly ExerciseGenerator[]
}

/** A generated exercise: content plus everything needed to reproduce it. */
export interface Exercise {
  id: string
  seed: string
  unitIds: readonly UnitId[]
  difficulty: Difficulty
  intro?: LocalizedTemplate
  parts: readonly ExercisePart[]
}
