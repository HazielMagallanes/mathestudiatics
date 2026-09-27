import type { UnitDefinition } from '@/content/schema'

import { trigEquations } from './generators/equations'
import { exactValues } from './generators/exact-values'
import { identityFromSine } from './generators/identity'
import { amplitudePeriod, rightTriangleRatios } from './generators/right-triangle'
import { wordProblem } from './generators/word-problem'

const trigonometry: UnitDefinition = {
  id: 'trigonometry',
  order: 3,
  title: { es: 'Trigonometría', en: 'Trigonometry' },
  description: {
    es: 'Razones, valores exactos, identidades, ecuaciones y aplicaciones.',
    en: 'Ratios, exact values, identities, equations and applications.',
  },
  generators: [
    rightTriangleRatios,
    amplitudePeriod,
    exactValues,
    identityFromSine,
    trigEquations,
    wordProblem,
  ],
}

export default trigonometry
