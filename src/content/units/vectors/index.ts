import type { UnitDefinition } from '@/content/schema'

import { componentsFromPoints, vectorNorm } from './generators/basic'
import { vectorDotProduct, vectorOperations } from './generators/operations'
import { angleBetweenVectors, vectorRelation } from './generators/relations'

const vectors: UnitDefinition = {
  id: 'vectors',
  order: 4,
  title: { es: 'Vectores', en: 'Vectors' },
  description: {
    es: 'Componentes, operaciones, norma, producto escalar, ángulos y paralelismo.',
    en: 'Components, operations, norm, dot product, angles and parallelism.',
  },
  generators: [
    componentsFromPoints,
    vectorNorm,
    vectorOperations,
    vectorDotProduct,
    angleBetweenVectors,
    vectorRelation,
  ],
}

export default vectors
