import type { UnitDefinition } from '@/content/schema'

import { equivalenceCheck } from './generators/equivalence'
import { negationSimplify } from './generators/negation'
import { propositionsClassify } from './generators/propositions'
import { quantifiersTruth } from './generators/quantifiers'
import { truthTableClassify } from './generators/truth-table'
import { connectivesTruthValue } from './generators/truth-value'

const logic: UnitDefinition = {
  id: 'logic',
  order: 1,
  title: { es: 'Lógica proposicional', en: 'Propositional logic' },
  description: {
    es: 'Proposiciones, conectivas, tablas de verdad, equivalencias y cuantificadores.',
    en: 'Propositions, connectives, truth tables, equivalences and quantifiers.',
  },
  generators: [
    propositionsClassify,
    connectivesTruthValue,
    truthTableClassify,
    negationSimplify,
    equivalenceCheck,
    quantifiersTruth,
  ],
}

export default logic
