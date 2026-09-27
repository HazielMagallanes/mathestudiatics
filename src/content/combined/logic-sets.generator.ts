import { booleanAnswer, step } from '@/content/blocks/answers'
import { integerRange } from '@/content/blocks/sets'
import { randomLinearPredicate } from '@/content/blocks/linear-predicates'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

function setLatex(values: readonly number[]): string {
  return `\\left\\{${values.join(',\\, ')}\\right\\}`
}

const quantifiedOverSet: ExerciseGenerator = {
  id: 'combined.logic-sets.quantified',
  units: ['logic', 'sets'],
  difficulty: 'hard',
  tags: ['combined', 'quantifiers'],
  generate(rng: Rng): ExerciseContent {
    const from = rng.int(-4, 1)
    const to = from + rng.int(2, 6)
    const domain = integerRange(from, to)
    const predicate = randomLinearPredicate(rng)
    const isUniversal = rng.bool()
    const truth = isUniversal ? domain.every(predicate.test) : domain.some(predicate.test)
    const quantifier = isUniversal ? '\\forall' : '\\exists'
    const evaluations = domain
      .map((value) => `x = ${String(value)}: ${predicate.test(value) ? 'V' : 'F'}`)
      .join(',\\; ')
    const params: TemplateParams = {
      A: setLatex(domain),
      predicate: predicate.latex,
      quantifier,
      isUniversal: isUniversal ? 1 : 0,
      from,
      to,
    }

    return {
      parts: [
        {
          prompt: template(
            'Dado $A = {{A}}$, determiná el valor de verdad de ${{quantifier}} x \\in A: {{predicate}}$',
            'Given $A = {{A}}$, determine the truth value of ${{quantifier}} x \\in A: {{predicate}}$',
            params,
          ),
          answer: booleanAnswer(truth),
          steps: [
            step(
              'Evaluamos el predicado en cada elemento de A',
              'Evaluate the predicate at every element of A',
              evaluations,
            ),
          ],
        },
      ],
    }
  },
}

const membershipImplication: ExerciseGenerator = {
  id: 'combined.logic-sets.implication',
  units: ['logic', 'sets'],
  difficulty: 'medium',
  tags: ['combined', 'subsets', 'implication'],
  generate(rng: Rng): ExerciseContent {
    const setA = integerRange(rng.int(-3, 0), 0).concat(integerRange(1, rng.int(1, 4)))
    const shuffled = rng.shuffle(setA)
    const setB = [...new Set([...shuffled, ...integerRange(5, 5 + rng.int(0, 3))])].sort(
      (a, b) => a - b,
    )
    const isUniversal = rng.bool()
    const truth = isUniversal
      ? setA.every((value) => setB.includes(value))
      : setA.some((value) => setB.includes(value))
    const quantifier = isUniversal ? '\\forall' : '\\exists'
    const params: TemplateParams = {
      A: setLatex(setA),
      B: setLatex(setB),
      quantifier,
      isUniversal: isUniversal ? 1 : 0,
    }

    return {
      parts: [
        {
          prompt: template(
            'Dados $A = {{A}}$ y $B = {{B}}$, determiná el valor de verdad de ${{quantifier}} x \\in A: x \\in B$',
            'Given $A = {{A}}$ and $B = {{B}}$, determine the truth value of ${{quantifier}} x \\in A: x \\in B$',
            params,
          ),
          answer: booleanAnswer(truth),
          steps: [
            step(
              isUniversal
                ? 'Si algún elemento de A no está en B, la proposición es falsa'
                : 'Si algún elemento de A está en B, la proposición es verdadera',
              isUniversal
                ? 'If any element of A is missing from B, the statement is false'
                : 'If any element of A is in B, the statement is true',
              '',
            ),
          ],
        },
      ],
    }
  },
}

export default [quantifiedOverSet, membershipImplication] satisfies readonly ExerciseGenerator[]
