import { decimalAnswer, step } from '@/content/blocks/answers'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

const ANGLES = [30, 45, 60, 35, 50] as const
const KINDS = ['height', 'cable'] as const
type WordProblemKind = (typeof KINDS)[number]

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export const wordProblem: ExerciseGenerator = {
  id: 'trigonometry.word-problem',
  units: ['trigonometry'],
  difficulty: 'hard',
  tags: ['right-triangle', 'applications'],
  generate(rng: Rng): ExerciseContent {
    const kind: WordProblemKind = rng.pick(KINDS)
    const angle = rng.pick(ANGLES)
    const radians = toRadians(angle)

    if (kind === 'height') {
      const distance = rng.int(12, 90)
      const height = distance * Math.tan(radians)
      const params: TemplateParams = { angle, distance, kind, radians }
      const answer = decimalAnswer(height, 2)

      return {
        parts: [
          {
            prompt: template(
              'Desde un punto en el suelo, a {{distance}} m de la base, se observa el extremo superior de un poste bajo un ángulo de {{angle}}°. ¿Cuál es la altura del poste? (dos decimales)',
              'From a point on the ground, {{distance}} m away from the base, the top of a pole is seen at an angle of {{angle}}°. What is the height of the pole? (two decimals)',
              params,
            ),
            answer,
            steps: [
              step(
                'Identificamos cateto opuesto y adyacente',
                'Identify the opposite and adjacent legs',
                `\\tan\\left(${String(angle)}°\\right) = \\frac{h}{${String(distance)}}`,
              ),
              step(
                'Despejamos la altura',
                'Solve for the height',
                `h = ${String(distance)} \\cdot \\tan\\left(${String(angle)}°\\right) = ${answer.latex}`,
              ),
            ],
          },
        ],
      }
    }

    const height = rng.int(10, 60)
    const cable = height / Math.sin(radians)
    const params: TemplateParams = { angle, height, kind, radians }
    const answer = decimalAnswer(cable, 2)

    return {
      parts: [
        {
          prompt: template(
            'Un poste de {{height}} m se asegura con un cable que va desde su extremo superior hasta el suelo, formando un ángulo de {{angle}}° con el piso. ¿Cuánto mide el cable? (dos decimales)',
            'A {{height}} m pole is secured with a cable from its top to the ground, making an angle of {{angle}}° with the ground. How long is the cable? (two decimals)',
            params,
          ),
          answer,
          steps: [
            step(
              'Relacionamos el ángulo con la hipotenusa',
              'Relate the angle to the hypotenuse',
              `\\sin\\left(${String(angle)}°\\right) = \\frac{${String(height)}}{L}`,
            ),
            step(
              'Despejamos la longitud',
              'Solve for the length',
              `L = \\frac{${String(height)}}{\\sin\\left(${String(angle)}°\\right)} = ${answer.latex}`,
            ),
          ],
        },
      ],
    }
  },
}
