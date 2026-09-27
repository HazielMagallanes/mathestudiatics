import type { UnitDefinition } from '@/content/schema'

import { extensionFromComprehension, membershipTruth } from './generators/basic'
import { intervalOperations } from './generators/intervals'
import { setCardinality, setOperations } from './generators/operations'
import { powerSetCount } from './generators/power-set'

const sets: UnitDefinition = {
  id: 'sets',
  order: 2,
  title: { es: 'Conjuntos', en: 'Sets' },
  description: {
    es: 'Definición por extensión y comprensión, operaciones, cardinalidad, partes e intervalos.',
    en: 'Extension and comprehension, operations, cardinality, power sets and intervals.',
  },
  generators: [
    extensionFromComprehension,
    membershipTruth,
    setOperations,
    setCardinality,
    powerSetCount,
    intervalOperations,
  ],
}

export default sets
