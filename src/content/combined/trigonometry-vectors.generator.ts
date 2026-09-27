import { step, textAnswer, vectorAnswer } from '@/content/blocks/answers'
import {
  cosExact,
  exactCanonical,
  exactLatex,
  exactMultiply,
  exactRational,
  sinExact,
} from '@/content/blocks/exact-trigonometry'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, TemplateParams } from '@/content/schema'

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const
type Direction = (typeof ANGLES)[number]

function angleFraction(degrees: Direction): { numerator: number; denominator: number } {
  const numerator = degrees / 45

  return { numerator, denominator: 4 }
}

export const magnitudeDirection: ExerciseGenerator = {
  id: 'combined.trigonometry-vectors.magnitude-direction',
  units: ['trigonometry', 'vectors'],
  difficulty: 'medium',
  tags: ['combined', 'components'],
  generate(rng: Rng): ExerciseContent {
    const direction: Direction = rng.pick(ANGLES)
    const diagonal = direction % 90 !== 0
    const magnitude = diagonal ? rng.int(1, 4) * 2 : rng.int(2, 8)
    const angle = angleFraction(direction)
    const x = exactMultiply(exactRational(magnitude), cosExact(angle))
    const y = exactMultiply(exactRational(magnitude), sinExact(angle))
    const params: TemplateParams = {
      magnitude,
      angleDegrees: direction,
      angleNumerator: angle.numerator,
      angleDenominator: angle.denominator,
    }

    const componentsLatex = `\\left(${exactLatex(x)},\\; ${exactLatex(y)}\\right)`
    const canonical = `${exactCanonical(x)},${exactCanonical(y)}`

    const answer =
      x.kind === 'rational' && y.kind === 'rational'
        ? vectorAnswer([
            x.fraction.numerator / x.fraction.denominator,
            y.fraction.numerator / y.fraction.denominator,
          ])
        : textAnswer(canonical, componentsLatex)

    return {
      parts: [
        {
          prompt: template(
            'Un vector tiene módulo {{magnitude}} y dirección {{angleDegrees}}° medida desde el eje $x$. Hallá sus componentes.',
            'A vector has magnitude {{magnitude}} and direction {{angleDegrees}}° measured from the x-axis. Find its components.',
            params,
          ),
          answer,
          steps: [
            step(
              'Usamos las componentes polares',
              'Use the polar components',
              `v_x = ${String(magnitude)}\\cos\\left(${String(direction)}°\\right),\\quad v_y = ${String(magnitude)}\\sin\\left(${String(direction)}°\\right)`,
            ),
            step(
              'Evaluamos con los valores exactos',
              'Evaluate with exact values',
              componentsLatex,
            ),
          ],
        },
      ],
    }
  },
}

export default [magnitudeDirection] satisfies readonly ExerciseGenerator[]
