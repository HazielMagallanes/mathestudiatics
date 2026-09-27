import { generateExerciseFrom } from '@/content/generate'
import type {
  Exercise,
  ExerciseGenerator,
  ExercisePart,
  LocalizedAnswer,
  TemplateParams,
} from '@/content/schema'

/** Deterministically samples exercises from a single generator. */
export function generateSamples(generator: ExerciseGenerator, count = 60): Exercise[] {
  return Array.from({ length: count }, (_, index) => {
    const exercise = generateExerciseFrom([generator], {
      units: generator.units,
      difficulty: generator.difficulty,
      seed: `sample-${String(index)}`,
    })

    if (!exercise) {
      throw new Error(`generator "${generator.id}" produced no exercise`)
    }

    return exercise
  })
}

export function partOf(exercise: Exercise): ExercisePart {
  const part = exercise.parts[0]

  if (!part) {
    throw new Error('exercise has no parts')
  }

  return part
}

export function partAt(exercise: Exercise, index: number): ExercisePart {
  const part = exercise.parts[index]

  if (!part) {
    throw new Error(`exercise has no part at index ${String(index)}`)
  }

  return part
}

export function answerValueOf(
  source: Exercise | ExercisePart,
): NonNullable<LocalizedAnswer['value']> {
  const part = 'answer' in source ? source : partOf(source)
  const value = part.answer.value

  if (!value) {
    throw new Error('answer has no machine-checkable value')
  }

  return value
}

export function paramsOf(exercise: Exercise): TemplateParams {
  return partOf(exercise).prompt.params
}

/** Parameters of the shared intro, when the exercise has one. */
export function introParamsOf(exercise: Exercise): TemplateParams {
  return exercise.intro?.params ?? {}
}

function rawParam(exercise: Exercise, key: string): string | number {
  const value = paramsOf(exercise)[key]

  if (value === undefined) {
    throw new Error(`missing parameter "${key}"`)
  }

  return value
}

export function stringParam(exercise: Exercise, key: string): string {
  const value = rawParam(exercise, key)

  return String(value)
}

export function strippedStringParam(exercise: Exercise, key: string): string {
  return stringParam(exercise, key).replace(/^\$|\$$/g, '')
}

export function numberParam(exercise: Exercise, key: string): number {
  return Number(rawParam(exercise, key))
}

export function booleanParam(exercise: Exercise, key: string): boolean {
  return numberParam(exercise, key) === 1
}

export function booleanAnswerValue(exercise: Exercise): boolean {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'boolean') {
    throw new Error('expected a boolean answer')
  }

  return value.value
}

export function integerAnswerValue(exercise: Exercise): number {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'integer') {
    throw new Error('expected an integer answer')
  }

  return value.value
}

export function textAnswerValue(exercise: Exercise): string {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'text') {
    throw new Error('expected a text answer')
  }

  return value.value
}

export function setAnswerValues(exercise: Exercise): number[] {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'set') {
    throw new Error('expected a set answer')
  }

  return [...value.values]
}

export function intervalAnswerValue(exercise: Exercise): {
  from: number | null
  to: number | null
  fromInclusive: boolean
  toInclusive: boolean
} {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'interval') {
    throw new Error('expected an interval answer')
  }

  return value
}

export function fractionAnswerValue(exercise: Exercise): {
  numerator: number
  denominator: number
} {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'fraction') {
    throw new Error('expected a fraction answer')
  }

  return { numerator: value.numerator, denominator: value.denominator }
}

export function vectorAnswerValue(exercise: Exercise): number[] {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'vector') {
    throw new Error('expected a vector answer')
  }

  return [...value.components]
}

export function decimalAnswerValue(exercise: Exercise): number {
  const value = partOf(exercise).answer.value

  if (value?.kind !== 'decimal') {
    throw new Error('expected a decimal answer')
  }

  return value.value
}
