import { integerAnswer, step, vectorAnswer } from '@/content/blocks/answers'
import { vectorLatex } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import { PYTHAGOREAN_TRIPLES_3D, subtractVectors, randomVector } from '@/content/blocks/vectors'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

function componentsParam(components: readonly number[]): string {
  return components.join(',')
}

export const componentsFromPoints: ExerciseGenerator = {
  id: 'vectors.components',
  units: ['vectors'],
  difficulty: 'easy',
  tags: ['components'],
  generate(rng: Rng): ExerciseContent {
    const dimension = rng.bool(0.65) ? 2 : 3
    const pointA = randomVector(rng, dimension, -8, 8, { nonZero: true })
    const pointB = randomVector(rng, dimension, -8, 8, { nonZero: true })
    const vector = subtractVectors(pointB, pointA)
    const params: TemplateParams = {
      A: vectorLatex(pointA),
      B: vectorLatex(pointB),
      aComponents: componentsParam(pointA),
      bComponents: componentsParam(pointB),
      dimension,
    }

    return {
      parts: [
        {
          prompt: template(
            'Dados $A = {{A}}$ y $B = {{B}}$, hallá las componentes de $\\vec{AB}$',
            'Given $A = {{A}}$ and $B = {{B}}$, find the components of $\\vec{AB}$',
            params,
          ),
          answer: vectorAnswer(vector),
          steps: [
            step(
              'Restamos las coordenadas del origen a las del extremo',
              'Subtract the origin coordinates from the endpoint coordinates',
              `\\vec{AB} = B - A = ${vectorLatex(vector)}`,
            ),
          ],
        },
      ],
    }
  },
}

export const vectorNorm: ExerciseGenerator = {
  id: 'vectors.norm',
  units: ['vectors'],
  difficulty: 'easy',
  tags: ['norm'],
  generate(rng: Rng): ExerciseContent {
    const useThreeDimensions = rng.bool(0.5)
    let components: number[]
    let norm: number

    if (useThreeDimensions) {
      const [triple, expectedNorm] = rng.pick(PYTHAGOREAN_TRIPLES_3D)
      components = triple.map((value) => (rng.bool() ? value : -value))
      norm = expectedNorm
    } else {
      const [first, second, hypotenuse] = rng.pick([
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [8, 15, 17],
        [9, 12, 15],
        [20, 21, 29],
      ] as const)
      components = [rng.bool() ? first : -first, rng.bool() ? second : -second]
      norm = hypotenuse
    }

    return {
      parts: [
        {
          prompt: template(
            'Calculá la norma de $\\vec{u} = {{u}}$',
            'Compute the norm of $\\vec{u} = {{u}}$',
            { u: vectorLatex(components), uComponents: componentsParam(components) },
          ),
          answer: integerAnswer(norm),
          steps: [
            step(
              'Elevamos cada componente al cuadrado y sumamos',
              'Square each component and add',
              `${components.map((value) => String(value * value)).join(' + ')} = ${String(norm * norm)}`,
            ),
            step(
              'Aplicamos la raíz cuadrada',
              'Take the square root',
              `\\sqrt{${String(norm * norm)}} = ${String(norm)}`,
            ),
          ],
        },
      ],
    }
  },
}
