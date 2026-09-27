import { integerAnswer, step, textAnswer } from '@/content/blocks/answers'
import { vectorLatex } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import {
  isOrthogonal,
  isParallel,
  perpendicularVector,
  randomVector,
  scaleVector,
} from '@/content/blocks/vectors'
import type { Rng } from '@/content/rng'
import type {
  ExerciseContent,
  ExerciseGenerator,
  LocalizedText,
  TemplateParams,
} from '@/content/schema'

const ANGLES = [0, 45, 90, 135, 180] as const
type KnownAngle = (typeof ANGLES)[number]

function componentsParam(components: readonly number[]): string {
  return components.join(',')
}

export const angleBetweenVectors: ExerciseGenerator = {
  id: 'vectors.angle',
  units: ['vectors'],
  difficulty: 'hard',
  tags: ['angle', 'dot-product'],
  generate(rng: Rng): ExerciseContent {
    const angle: KnownAngle = rng.pick(ANGLES)
    let left: number[]
    let right: number[]

    switch (angle) {
      case 0:
      case 180: {
        left = randomVector(rng, 2, -5, 5, { nonZero: true })
        const factor = rng.int(2, 3) * (angle === 0 ? 1 : -1)
        right = scaleVector(factor, left)
        break
      }
      case 90: {
        left = randomVector(rng, 2, -5, 5, { nonZero: true })
        right = perpendicularVector(left)
        break
      }
      case 45:
      case 135: {
        const first = rng.int(2, 5)
        const second = rng.int(1, 4)
        left = [first, 0]
        right = angle === 45 ? [second, second] : [-second, second]
        break
      }
    }

    const params: TemplateParams = {
      u: vectorLatex(left),
      v: vectorLatex(right),
      uComponents: componentsParam(left),
      vComponents: componentsParam(right),
      angleDegrees: angle,
    }

    return {
      parts: [
        {
          prompt: template(
            'Calculá el ángulo entre $\\vec{u} = {{u}}$ y $\\vec{v} = {{v}}$ (en grados)',
            'Compute the angle between $\\vec{u} = {{u}}$ and $\\vec{v} = {{v}}$ (in degrees)',
            params,
          ),
          answer: integerAnswer(angle),
          steps: [
            step(
              'Usamos el producto escalar para hallar el coseno',
              'Use the dot product to find the cosine',
              `\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{\\left\\|\\vec{u}\\right\\|\\left\\|\\vec{v}\\right\\|}`,
            ),
            step('Identificamos el ángulo', 'Identify the angle', `${String(angle)}°`),
          ],
        },
      ],
    }
  },
}

const RELATIONS = ['parallel', 'orthogonal', 'neither'] as const
type Relation = (typeof RELATIONS)[number]

const RELATION_LABELS: Record<Relation, LocalizedText> = {
  parallel: { es: 'Paralelos', en: 'Parallel' },
  orthogonal: { es: 'Ortogonales', en: 'Orthogonal' },
  neither: { es: 'Ni paralelos ni ortogonales', en: 'Neither parallel nor orthogonal' },
}

export const vectorRelation: ExerciseGenerator = {
  id: 'vectors.relation',
  units: ['vectors'],
  difficulty: 'hard',
  tags: ['parallel', 'orthogonal'],
  generate(rng: Rng): ExerciseContent {
    const relation: Relation = rng.pick(RELATIONS)
    let left: number[]
    let right: number[]

    switch (relation) {
      case 'parallel': {
        left = randomVector(rng, 2, -5, 5, { nonZero: true })
        right = scaleVector(rng.int(2, 3) * (rng.bool() ? 1 : -1), left)
        break
      }
      case 'orthogonal': {
        left = randomVector(rng, 2, -5, 5, { nonZero: true })
        right = perpendicularVector(left)
        break
      }
      case 'neither': {
        let attempts = 0

        do {
          left = randomVector(rng, 2, -4, 4, { nonZero: true })
          right = randomVector(rng, 2, -4, 4, { nonZero: true })
          attempts += 1
        } while ((isParallel(left, right) || isOrthogonal(left, right)) && attempts < 60)

        if (isParallel(left, right) || isOrthogonal(left, right)) {
          left = [1, 0]
          right = [1, 1]
        }
        break
      }
    }

    return {
      parts: [
        {
          prompt: template(
            '¿Qué relación hay entre $\\vec{u} = {{u}}$ y $\\vec{v} = {{v}}$?',
            'What is the relation between $\\vec{u} = {{u}}$ and $\\vec{v} = {{v}}$?',
            {
              u: vectorLatex(left),
              v: vectorLatex(right),
              uComponents: componentsParam(left),
              vComponents: componentsParam(right),
              relation,
            },
          ),
          answer: textAnswer(relation, `\\text{${RELATION_LABELS[relation].en}}`, {
            latexByLocale: {
              es: `\\text{${RELATION_LABELS[relation].es}}`,
              en: `\\text{${RELATION_LABELS[relation].en}}`,
            },
          }),
          steps: [
            step(
              'Comparamos con el producto escalar y el paralelismo',
              'Check the dot product and parallelism',
              '\\vec{u} \\cdot \\vec{v} = 0 \\Rightarrow \\text{ortogonales},\\quad \\vec{u} \\parallel \\vec{v} \\Rightarrow \\text{paralelos}',
            ),
          ],
        },
      ],
    }
  },
}
