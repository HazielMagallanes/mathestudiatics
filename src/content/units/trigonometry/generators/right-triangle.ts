import { fractionAnswer, integerAnswer, step, textAnswer } from '@/content/blocks/answers'
import { template } from '@/content/blocks/templates'
import { PYTHAGOREAN_TRIPLES_2D } from '@/content/blocks/vectors'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

const RATIOS = ['sin', 'cos', 'tan'] as const
type Ratio = (typeof RATIOS)[number]

const RATIO_LATEX: Record<Ratio, string> = {
  sin: '\\sin',
  cos: '\\cos',
  tan: '\\tan',
}

export const rightTriangleRatios: ExerciseGenerator = {
  id: 'trigonometry.right-triangle',
  units: ['trigonometry'],
  difficulty: 'easy',
  tags: ['right-triangle'],
  generate(rng: Rng): ExerciseContent {
    const [firstLeg, secondLeg, hypotenuse] = rng.pick(PYTHAGOREAN_TRIPLES_2D)
    const ratio: Ratio = rng.pick(RATIOS)
    const opposite = ratio === 'cos' ? secondLeg : firstLeg
    const adjacent = ratio === 'cos' ? firstLeg : secondLeg
    const answer =
      ratio === 'sin'
        ? { numerator: firstLeg, denominator: hypotenuse }
        : ratio === 'cos'
          ? { numerator: secondLeg, denominator: hypotenuse }
          : { numerator: firstLeg, denominator: secondLeg }
    const params: TemplateParams = {
      opposite: firstLeg,
      adjacent: secondLeg,
      hypotenuse,
      ratio,
      ratioLatex: RATIO_LATEX[ratio],
    }

    return {
      parts: [
        {
          prompt: template(
            'En un triángulo rectángulo, el cateto opuesto a $\\theta$ mide {{opposite}} y el adyacente mide {{adjacent}}. Calculá ${{ratioLatex}}\\left(\\theta\\right)$',
            'In a right triangle, the leg opposite to $\\theta$ measures {{opposite}} and the adjacent leg measures {{adjacent}}. Compute ${{ratioLatex}}\\left(\\theta\\right)$',
            params,
          ),
          answer: fractionAnswer(answer),
          steps: [
            step(
              ratio === 'tan'
                ? 'La tangente es cateto opuesto sobre cateto adyacente'
                : 'El seno es opuesto sobre hipotenusa y el coseno, adyacente sobre hipotenusa',
              ratio === 'tan'
                ? 'Tangent is opposite over adjacent'
                : 'Sine is opposite over hypotenuse and cosine is adjacent over hypotenuse',
              `\\text{opuesto} = ${String(opposite)},\\; \\text{adyacente} = ${String(adjacent)},\\; \\text{hipotenusa} = ${String(hypotenuse)}`,
            ),
            step(
              'Escribimos la razón',
              'Write the ratio',
              `\\frac{${String(answer.numerator)}}{${String(answer.denominator)}}`,
            ),
          ],
        },
      ],
    }
  },
}

export const amplitudePeriod: ExerciseGenerator = {
  id: 'trigonometry.amplitude-period',
  units: ['trigonometry'],
  difficulty: 'medium',
  tags: ['graphs'],
  generate(rng: Rng): ExerciseContent {
    const amplitude = rng.int(2, 5)
    const frequency = rng.int(2, 4)
    const functionName = rng.pick(['\\sin', '\\cos'] as const)
    const periodLatex =
      frequency === 2 ? '\\pi' : frequency === 3 ? '\\frac{2\\pi}{3}' : '\\frac{\\pi}{2}'
    const periodCanonical = frequency === 2 ? 'pi' : frequency === 3 ? '2pi/3' : 'pi/2'
    const params: TemplateParams = { amplitude, frequency, fn: functionName }

    return {
      intro: template(
        'Para $y = {{amplitude}}{{fn}}\\left({{frequency}}x\\right)$:',
        'For $y = {{amplitude}}{{fn}}\\left({{frequency}}x\\right)$:',
        params,
      ),
      parts: [
        {
          prompt: template('¿Cuál es la amplitud?', 'What is the amplitude?'),
          answer: integerAnswer(amplitude),
          steps: [
            step(
              'Amplitud',
              'Amplitude',
              `\\left|${String(amplitude)}\\right| = ${String(amplitude)}`,
            ),
          ],
        },
        {
          prompt: template('¿Cuál es el período?', 'What is the period?'),
          answer: textAnswer(periodCanonical, periodLatex),
          steps: [
            step(
              'El período es dos pi dividido el coeficiente de x',
              'The period is two pi divided by the coefficient of x',
              `\\frac{2\\pi}{${String(frequency)}} = ${periodLatex}`,
            ),
          ],
        },
      ],
    }
  },
}
