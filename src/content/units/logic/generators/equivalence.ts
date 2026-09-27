import { booleanAnswer, step } from '@/content/blocks/answers'
import {
  allValuations,
  andNode,
  areEquivalent,
  evaluateFormula,
  formulaLatex,
  formulaVariables,
  iffNode,
  impliesNode,
  notNode,
  orNode,
  randomFormula,
  variableNode,
  type LogicFormula,
  type LogicVariable,
  type Valuation,
} from '@/content/blocks/logic'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator } from '@/content/schema'

interface EquivalentPair {
  left: (p: LogicFormula, q: LogicFormula) => LogicFormula
  right: (p: LogicFormula, q: LogicFormula) => LogicFormula
}

const EQUIVALENT_PAIRS: readonly EquivalentPair[] = [
  {
    // Contrapositive
    left: (p, q) => impliesNode(p, q),
    right: (p, q) => impliesNode(notNode(q), notNode(p)),
  },
  {
    // De Morgan (negation of a conjunction)
    left: (p, q) => notNode(andNode(p, q)),
    right: (p, q) => orNode(notNode(p), notNode(q)),
  },
  {
    // Biconditional as two implications
    left: (p, q) => iffNode(p, q),
    right: (p, q) => andNode(impliesNode(p, q), impliesNode(q, p)),
  },
]

function valuationLatex(valuation: Valuation, variables: readonly LogicVariable[]): string {
  return variables.map((name) => `${name} = ${valuation[name] ? 'V' : 'F'}`).join(',\\; ')
}

function findCounterexample(
  left: LogicFormula,
  right: LogicFormula,
): { valuation: Valuation; variables: LogicVariable[] } | null {
  const variables = [...new Set([...formulaVariables(left), ...formulaVariables(right)])]

  for (const valuation of allValuations(variables)) {
    if (evaluateFormula(left, valuation) !== evaluateFormula(right, valuation)) {
      return { valuation, variables }
    }
  }

  return null
}

export const equivalenceCheck: ExerciseGenerator = {
  id: 'logic.equivalence.check',
  units: ['logic'],
  difficulty: 'hard',
  tags: ['equivalence'],
  generate(rng: Rng): ExerciseContent {
    const equivalent = rng.bool(0.5)
    let left: LogicFormula
    let right: LogicFormula

    if (equivalent) {
      const pair = rng.pick(EQUIVALENT_PAIRS)
      const [first = 'p', second = 'q'] = rng.shuffle(['p', 'q'] as const)
      left = pair.left(variableNode(first), variableNode(second))
      right = pair.right(variableNode(first), variableNode(second))
    } else {
      let attempts = 0

      do {
        left = randomFormula(rng, ['p', 'q'], 2)
        right = randomFormula(rng, ['p', 'q'], 2)
        attempts += 1
      } while (areEquivalent(left, right) && attempts < 40)

      if (areEquivalent(left, right)) {
        // Guaranteed non-equivalent fallback.
        left = variableNode('p')
        right = notNode(variableNode('p'))
      }
    }

    const witness = findCounterexample(left, right)

    return {
      parts: [
        {
          prompt: template(
            '¿Son equivalentes {{left}} y {{right}}?',
            'Are {{left}} and {{right}} equivalent?',
            {
              left: `$${formulaLatex(left)}$`,
              right: `$${formulaLatex(right)}$`,
            },
          ),
          answer: booleanAnswer(areEquivalent(left, right)),
          steps: witness
            ? [
                step(
                  'Encontramos una valuación donde difieren',
                  'We found a valuation where they differ',
                  valuationLatex(witness.valuation, witness.variables),
                ),
              ]
            : [
                step(
                  'Coinciden en todas las valuaciones posibles',
                  'They agree on every possible valuation',
                  '',
                ),
              ],
        },
      ],
    }
  },
}
