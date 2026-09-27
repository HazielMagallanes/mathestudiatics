import { booleanAnswer, setAnswer, step } from '@/content/blocks/answers'
import { integerRange, isProperSubset, randomIntegerSet } from '@/content/blocks/sets'
import { template } from '@/content/blocks/templates'
import { nonZeroInt } from '@/content/blocks/random'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

export const extensionFromComprehension: ExerciseGenerator = {
  id: 'sets.extension',
  units: ['sets'],
  difficulty: 'easy',
  tags: ['extension', 'comprehension'],
  generate(rng: Rng): ExerciseContent {
    const from = rng.int(-6, 0)
    const to = from + rng.int(3, 8)
    const fromInclusive = rng.bool(0.7)
    const toInclusive = rng.bool(0.7)
    const values = integerRange(fromInclusive ? from : from + 1, toInclusive ? to : to - 1)
    const definition = `${String(from)} ${fromInclusive ? '\\le' : '\\lt'} x ${toInclusive ? '\\le' : '\\lt'} ${String(to)}`
    const params: TemplateParams = {
      definition,
      from,
      to,
      fromInclusive: fromInclusive ? 1 : 0,
      toInclusive: toInclusive ? 1 : 0,
    }

    return {
      parts: [
        {
          prompt: template('Escribí por extensión: {{set}}', 'Write by extension: {{set}}', {
            ...params,
            set: `$A = \\left\\{x \\in \\mathbb{Z}: ${definition}\\right\\}$`,
          }),
          answer: setAnswer(values),
          steps: [
            step(
              'Leemos los extremos y si se incluyen',
              'Read the endpoints and whether they are included',
              definition,
            ),
            step(
              'Listamos los enteros que cumplen la condición',
              'List the integers that satisfy the condition',
              values.join(',\\; '),
            ),
          ],
        },
      ],
    }
  },
}

const SET_KINDS = [
  'element',
  'subset',
  'proper-subset',
  'empty-subset',
  'singleton-subset',
] as const
type SetKind = (typeof SET_KINDS)[number]

export const membershipTruth: ExerciseGenerator = {
  id: 'sets.membership.truth',
  units: ['sets'],
  difficulty: 'easy',
  tags: ['membership', 'subsets'],
  generate(rng: Rng): ExerciseContent {
    const kind: SetKind = rng.pick(SET_KINDS)
    const setA = randomIntegerSet(rng, { size: rng.int(4, 6), min: -4, max: 9 })
    const element = kind === 'element' ? nonZeroInt(rng, -6, 11) : nonZeroInt(rng, -4, 9)
    const setB =
      kind === 'subset' || kind === 'proper-subset'
        ? [
            ...new Set([
              ...setA,
              ...randomIntegerSet(rng, { size: rng.int(1, 3), min: -6, max: 11 }),
            ]),
          ].sort((a, b) => a - b)
        : []
    const latexA = `\\left\\{${setA.join(',\\, ')}\\right\\}`

    let statement: string
    let truth: boolean

    switch (kind) {
      case 'element':
        statement = `${String(element)} \\in A`
        truth = setA.includes(element)
        break
      case 'subset':
        statement = `A \\subseteq B`
        truth = setA.every((value) => setB.includes(value))
        break
      case 'proper-subset':
        statement = `A \\subset B`
        truth = isProperSubset(setA, setB)
        break
      case 'empty-subset':
        statement = `\\varnothing \\subset A`
        truth = setA.length > 0
        break
      case 'singleton-subset':
        statement = `\\left\\{${String(element)}\\right\\} \\subset A`
        truth = setA.includes(element)
        break
    }

    return {
      parts: [
        {
          prompt: template(
            'Dados $A = {{A}}$ y $B = {{B}}$, determiná si es verdadero o falso: {{statement}}',
            'Given $A = {{A}}$ and $B = {{B}}$, decide whether it is true or false: {{statement}}',
            {
              A: `$${latexA}$`,
              B: `$\\left\\{${setB.join(',\\, ')}\\right\\}$`,
              statement: `$${statement}$`,
              kind,
            },
          ),
          answer: booleanAnswer(truth),
          steps: [
            step(
              'Recordamos que ⊂ es la inclusión estricta y ⊆ admite la igualdad',
              'Recall that ⊂ is strict inclusion and ⊆ allows equality',
              '',
            ),
          ],
        },
      ],
    }
  },
}
