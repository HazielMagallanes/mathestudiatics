import { generateExerciseFrom } from '@/content/generate'
import type { Exercise, ExerciseGenerator, ExercisePart, TemplateParams } from '@/content/schema'

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

export function paramsOf(exercise: Exercise): TemplateParams {
  return partOf(exercise).prompt.params
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
