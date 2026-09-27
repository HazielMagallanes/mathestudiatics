import { booleanAnswer, step } from '@/content/blocks/answers'
import { randomLinearPredicate } from '@/content/blocks/linear-predicates'
import { integerRange } from '@/content/blocks/sets'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator } from '@/content/schema'

export const quantifiersTruth: ExerciseGenerator = {
  id: 'logic.quantifiers.truth',
  units: ['logic'],
  difficulty: 'hard',
  tags: ['quantifiers'],
  generate(rng: Rng): ExerciseContent {
    const from = rng.int(-3, 1)
    const to = from + rng.int(2, 6)
    const domain = integerRange(from, to)
    const isUniversal = rng.bool()
    const predicate = randomLinearPredicate(rng)
    const truth = isUniversal ? domain.every(predicate.test) : domain.some(predicate.test)
    const quantifier = isUniversal ? '\\forall' : '\\exists'
    const evaluations = domain
      .map((value) => `x = ${String(value)}: ${predicate.test(value) ? 'V' : 'F'}`)
      .join(',\\; ')

    return {
      parts: [
        {
          prompt: template(
            'Determiná el valor de verdad de {{statement}}',
            'Determine the truth value of {{statement}}',
            {
              statement: `$${quantifier} x \\in \\left\\{x \\in \\mathbb{Z}: ${String(from)} \\le x \\le ${String(to)}\\right\\}: ${predicate.latex}$`,
              from,
              to,
              predicate: predicate.latex,
              isUniversal: isUniversal ? 1 : 0,
            },
          ),
          answer: booleanAnswer(truth),
          steps: [
            step(
              'Evaluamos el predicado en cada elemento del dominio',
              'Evaluate the predicate at every element of the domain',
              evaluations,
            ),
            step(
              isUniversal
                ? 'Alcanza con un contraejemplo para que sea falsa'
                : 'Alcanza con un ejemplo para que sea verdadera',
              isUniversal
                ? 'A single counterexample makes it false'
                : 'A single example makes it true',
              '',
            ),
          ],
        },
      ],
    }
  },
}
