import { fractionAnswer, step } from '@/content/blocks/answers'
import { fractionLatex } from '@/content/blocks/latex'
import { template } from '@/content/blocks/templates'
import { PYTHAGOREAN_TRIPLES_2D } from '@/content/blocks/vectors'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

export const identityFromSine: ExerciseGenerator = {
  id: 'trigonometry.identity',
  units: ['trigonometry'],
  difficulty: 'medium',
  tags: ['identities'],
  generate(rng: Rng): ExerciseContent {
    const [firstLeg, secondLeg, hypotenuse] = rng.pick(PYTHAGOREAN_TRIPLES_2D)
    const quadrant = rng.pick([1, 2] as const)
    const cosineSign = quadrant === 1 ? 1 : -1
    const cosine = { numerator: cosineSign * secondLeg, denominator: hypotenuse }
    const params: TemplateParams = {
      sineNumerator: firstLeg,
      sineDenominator: hypotenuse,
      quadrant,
      cosineNumerator: cosine.numerator,
      cosineDenominator: cosine.denominator,
    }

    return {
      parts: [
        {
          prompt: template(
            'Si $\\sin\\left(\\theta\\right) = {{sine}}$ y $\\theta$ está en el cuadrante {{quadrant}}, calculá $\\cos\\left(\\theta\\right)$',
            'If $\\sin\\left(\\theta\\right) = {{sine}}$ and $\\theta$ is in quadrant {{quadrant}}, compute $\\cos\\left(\\theta\\right)$',
            {
              ...params,
              sine: `\\frac{${String(firstLeg)}}{${String(hypotenuse)}}`,
            },
          ),
          answer: fractionAnswer(cosine),
          steps: [
            step(
              'Usamos la identidad pitagórica',
              'Use the Pythagorean identity',
              `\\sin^2\\theta + \\cos^2\\theta = 1`,
            ),
            step(
              'Despejamos el coseno',
              'Solve for the cosine',
              `\\cos\\theta = \\pm\\sqrt{1 - \\left(\\frac{${String(firstLeg)}}{${String(hypotenuse)}}\\right)^2} = \\pm\\frac{${String(secondLeg)}}{${String(hypotenuse)}}`,
            ),
            step(
              quadrant === 1
                ? 'En el primer cuadrante el coseno es positivo'
                : 'En el segundo cuadrante el coseno es negativo',
              quadrant === 1
                ? 'In the first quadrant the cosine is positive'
                : 'In the second quadrant the cosine is negative',
              fractionLatex(cosine),
            ),
          ],
        },
      ],
    }
  },
}
