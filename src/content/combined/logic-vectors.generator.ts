import { booleanAnswer, step } from '@/content/blocks/answers'
import { vectorLatex } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import {
  dotProduct,
  isOrthogonal,
  isParallel,
  normSquared,
  randomVector,
} from '@/content/blocks/vectors'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

const STATEMENT_KINDS = ['orthogonal-and-norm', 'parallel-or-dot'] as const
type StatementKind = (typeof STATEMENT_KINDS)[number]

export const vectorStatementTruth: ExerciseGenerator = {
  id: 'combined.logic-vectors.truth',
  units: ['logic', 'vectors'],
  difficulty: 'medium',
  tags: ['combined', 'connectives'],
  generate(rng: Rng): ExerciseContent {
    const kind: StatementKind = rng.pick(STATEMENT_KINDS)
    const left = randomVector(rng, 2, -5, 5, { nonZero: true })
    const right = randomVector(rng, 2, -5, 5, { nonZero: true })
    const norm = Math.sqrt(normSquared(left))
    const normTarget = Number.isInteger(norm) ? norm : Math.floor(norm) + 1
    const dot = dotProduct(left, right)
    const dotTarget = dot + rng.int(1, 3) * (rng.bool() ? 1 : -1)

    const statementLatex =
      kind === 'orthogonal-and-norm'
        ? `\\vec{u} \\perp \\vec{v} \\land \\left\\|\\vec{u}\\right\\| = ${String(normTarget)}`
        : `\\vec{u} \\parallel \\vec{v} \\lor \\vec{u} \\cdot \\vec{v} = ${String(dotTarget)}`

    const truth =
      kind === 'orthogonal-and-norm'
        ? isOrthogonal(left, right) && norm === normTarget
        : isParallel(left, right) || dot === dotTarget

    const params: TemplateParams = {
      u: vectorLatex(left),
      v: vectorLatex(right),
      uComponents: left.join(','),
      vComponents: right.join(','),
      statementKind: kind,
      normTarget,
      dotTarget,
    }

    return {
      parts: [
        {
          prompt: template(
            'Dados $\\vec{u} = {{u}}$ y $\\vec{v} = {{v}}$, determiná el valor de verdad de ${{statement}}$',
            'Given $\\vec{u} = {{u}}$ and $\\vec{v} = {{v}}$, determine the truth value of ${{statement}}$',
            { ...params, statement: statementLatex },
          ),
          answer: booleanAnswer(truth),
          steps: [
            step(
              'Calculamos el producto escalar, el paralelismo y la norma',
              'Compute the dot product, parallelism and norm',
              `\\vec{u} \\cdot \\vec{v} = ${String(dot)},\\quad \\left\\|\\vec{u}\\right\\| = ${String(Math.round(norm * 1000) / 1000)}`,
            ),
            step(
              'Evaluamos la conectiva con esos valores',
              'Evaluate the connective with those values',
              statementLatex,
            ),
          ],
        },
      ],
    }
  },
}

export default [vectorStatementTruth] satisfies readonly ExerciseGenerator[]
