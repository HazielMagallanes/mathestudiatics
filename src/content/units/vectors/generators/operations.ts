import { integerAnswer, step, vectorAnswer } from '@/content/blocks/answers'
import { vectorLatex } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import {
  addVectors,
  dotProduct,
  randomVector,
  scaleVector,
  subtractVectors,
} from '@/content/blocks/vectors'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

const OPERATIONS = ['sum', 'difference', 'scale', 'combination'] as const
type VectorOperation = (typeof OPERATIONS)[number]

const OPERATION_NAMES: Record<VectorOperation, { es: string; en: string }> = {
  sum: { es: 'la suma', en: 'the sum' },
  difference: { es: 'la resta', en: 'the difference' },
  scale: { es: 'el producto por un escalar', en: 'the scalar product' },
  combination: { es: 'la combinación lineal', en: 'the linear combination' },
}

function componentsParam(components: readonly number[]): string {
  return components.join(',')
}

export const vectorOperations: ExerciseGenerator = {
  id: 'vectors.operations',
  units: ['vectors'],
  difficulty: 'medium',
  tags: ['operations'],
  generate(rng: Rng): ExerciseContent {
    const dimension = rng.bool(0.6) ? 2 : 3
    const left = randomVector(rng, dimension, -7, 7, { nonZero: true })
    const right = randomVector(rng, dimension, -7, 7, { nonZero: true })
    const operation: VectorOperation = rng.pick(OPERATIONS)
    const leftScalar = rng.int(2, 3)
    const rightScalar = rng.int(2, 3) * (rng.bool() ? 1 : -1)
    let result: number[]
    let expression: string

    switch (operation) {
      case 'sum':
        result = addVectors(left, right)
        expression = `\\vec{u} + \\vec{v}`
        break
      case 'difference':
        result = subtractVectors(left, right)
        expression = `\\vec{u} - \\vec{v}`
        break
      case 'scale':
        result = scaleVector(leftScalar, left)
        expression = String(leftScalar) + '\\vec{u}'
        break
      case 'combination':
        result = addVectors(scaleVector(leftScalar, left), scaleVector(rightScalar, right))
        expression = `${String(leftScalar)}\\vec{u} ${rightScalar > 0 ? '+' : '-'} ${String(Math.abs(rightScalar))}\\vec{v}`
        break
    }

    const params: TemplateParams = {
      u: vectorLatex(left),
      v: vectorLatex(right),
      uComponents: componentsParam(left),
      vComponents: componentsParam(right),
      operation,
      leftScalar,
      rightScalar,
      expression,
    }

    return {
      parts: [
        {
          prompt: template(
            'Dados $\\vec{u} = {{u}}$ y $\\vec{v} = {{v}}$, calculá ${{expression}}$',
            'Given $\\vec{u} = {{u}}$ and $\\vec{v} = {{v}}$, compute ${{expression}}$',
            params,
          ),
          answer: vectorAnswer(result),
          steps: [
            step(
              `Aplicamos ${OPERATION_NAMES[operation].es} componente a componente`,
              `Apply ${OPERATION_NAMES[operation].en} component by component`,
              vectorLatex(result),
            ),
          ],
        },
      ],
    }
  },
}

export const vectorDotProduct: ExerciseGenerator = {
  id: 'vectors.dot-product',
  units: ['vectors'],
  difficulty: 'medium',
  tags: ['dot-product'],
  generate(rng: Rng): ExerciseContent {
    const dimension = rng.bool(0.7) ? 2 : 3
    const left = randomVector(rng, dimension, -6, 6, { nonZero: true })
    const right = randomVector(rng, dimension, -6, 6, { nonZero: true })
    const result = dotProduct(left, right)
    const products = left.map(
      (value, index) => `${String(value)} \\cdot ${String(right[index] ?? 0)}`,
    )

    return {
      parts: [
        {
          prompt: template(
            'Calculá $\\vec{u} \\cdot \\vec{v}$ para $\\vec{u} = {{u}}$ y $\\vec{v} = {{v}}$',
            'Compute $\\vec{u} \\cdot \\vec{v}$ for $\\vec{u} = {{u}}$ and $\\vec{v} = {{v}}$',
            {
              u: vectorLatex(left),
              v: vectorLatex(right),
              uComponents: componentsParam(left),
              vComponents: componentsParam(right),
            },
          ),
          answer: integerAnswer(result),
          steps: [
            step(
              'Multiplicamos componente a componente y sumamos',
              'Multiply component-wise and add',
              `${products.join(' + ')} = ${String(result)}`,
            ),
          ],
        },
      ],
    }
  },
}
