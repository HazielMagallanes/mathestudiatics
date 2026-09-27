import { integerAnswer, step, textAnswer } from '@/content/blocks/answers'
import { template } from '@/content/blocks/templates'
import { vectorLatex } from '@/content/blocks/latex'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

const KINDS = ['extension', 'cardinality'] as const
type PointSetKind = (typeof KINDS)[number]

export const latticePointSets: ExerciseGenerator = {
  id: 'combined.sets-vectors.lattice-points',
  units: ['sets', 'vectors'],
  difficulty: 'medium',
  tags: ['combined', 'extension', 'cardinality'],
  generate(rng: Rng): ExerciseContent {
    const sum = rng.int(2, 7)
    const maxX = rng.int(1, 4)
    const points: [number, number][] = []

    for (let x = 0; x <= maxX; x += 1) {
      points.push([x, sum - x])
    }

    const kind: PointSetKind = rng.pick(KINDS)
    const pointsLatex = points.map(([x, y]) => vectorLatex([x, y])).join(',\\; ')
    const params: TemplateParams = {
      sum,
      maxX,
      kind,
      points: points.map(([x, y]) => `${String(x)},${String(y)}`).join(';'),
    }
    const definition = `A = \\left\\{\\left(x, y\\right) \\in \\mathbb{Z}^2: x + y = ${String(sum)},\\; 0 \\le x \\le ${String(maxX)}\\right\\}`

    if (kind === 'cardinality') {
      return {
        parts: [
          {
            prompt: template(
              'Dado ${{definition}}$, calculá $\\left|A\\right|$',
              'Given ${{definition}}$, compute $\\left|A\\right|$',
              { ...params, definition },
            ),
            answer: integerAnswer(points.length),
            steps: [
              step('Listamos los puntos', 'List the points', `\\left\\{${pointsLatex}\\right\\}`),
              step('Contamos', 'Count', String(points.length)),
            ],
          },
        ],
      }
    }

    return {
      parts: [
        {
          prompt: template(
            'Escribí por extensión ${{definition}}$',
            'Write by extension ${{definition}}$',
            { ...params, definition },
          ),
          answer: textAnswer(
            points.map(([x, y]) => `${String(x)},${String(y)}`).join(';'),
            `\\left\\{${pointsLatex}\\right\\}`,
          ),
          steps: [
            step(
              'Damos valores enteros a x y despejamos y',
              'Give integer values to x and solve for y',
              `\\left\\{${pointsLatex}\\right\\}`,
            ),
          ],
        },
      ],
    }
  },
}

export default [latticePointSets] satisfies readonly ExerciseGenerator[]
