import type { UnitDefinition } from '@/content/schema'

import { intervalsCompound, intervalsExpress, intervalsSolve } from './generators/intervals'
import {
  linearEquationBasic,
  linearEquationBothSides,
  linearEquationParentheses,
} from './generators/linear-equations'
import {
  logarithmsCombined,
  logarithmsDefinition,
  logarithmsNegative,
} from './generators/logarithms'
import {
  operationsAddSubtract,
  operationsAddSubtractChained,
  operationsChained,
  operationsMultiplyDivide,
} from './generators/operations'
import { powersExponents, powersInteger, powersLaws, powersNegative } from './generators/powers'
import { rootsExact, rootsRationalExponent, rootsSimplify } from './generators/roots'

const review: UnitDefinition = {
  id: 'review',
  order: 0,
  title: { es: 'Revisión', en: 'Review' },
  description: {
    es: 'Operaciones con fracciones, potencias, raíces, logaritmos, ecuaciones e intervalos.',
    en: 'Fractions, powers, roots, logarithms, equations and intervals.',
  },
  generators: [
    operationsAddSubtract,
    operationsAddSubtractChained,
    operationsMultiplyDivide,
    operationsChained,
    powersInteger,
    powersExponents,
    powersNegative,
    powersLaws,
    rootsExact,
    rootsSimplify,
    rootsRationalExponent,
    logarithmsDefinition,
    logarithmsNegative,
    logarithmsCombined,
    linearEquationBasic,
    linearEquationBothSides,
    linearEquationParentheses,
    intervalsExpress,
    intervalsSolve,
    intervalsCompound,
  ],
}

export default review
