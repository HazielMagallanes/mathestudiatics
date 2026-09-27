import { booleanAnswer, step } from '@/content/blocks/answers'
import { template } from '@/content/blocks/templates'
import type { Rng } from '@/content/rng'
import type { ExerciseContent, ExerciseGenerator, LocalizedText } from '@/content/schema'

interface SentenceItem {
  es: string
  en: string
  isProposition: boolean
  reason: LocalizedText
}

const SENTENCES: readonly SentenceItem[] = [
  {
    es: '20 es múltiplo de 4.',
    en: '20 is a multiple of 4.',
    isProposition: true,
    reason: {
      es: 'Es una oración declarativa con un valor de verdad definido: es falsa porque 20 no es múltiplo de 4.',
      en: 'It is a declarative sentence with a definite truth value: false, because 20 is not a multiple of 4.',
    },
  },
  {
    es: 'Pitágoras era griego y geómetra.',
    en: 'Pythagoras was Greek and a geometer.',
    isProposition: true,
    reason: {
      es: 'Afirma un hecho: es una proposición compuesta verdadera.',
      en: 'It states a fact: a true compound proposition.',
    },
  },
  {
    es: 'Si voy al cine, entonces no voy al teatro.',
    en: 'If I go to the cinema, then I do not go to the theatre.',
    isProposition: true,
    reason: {
      es: 'Es una proposición condicional: tiene valor de verdad aunque no sepamos cuál.',
      en: 'It is a conditional proposition: it has a truth value even if we do not know which one.',
    },
  },
  {
    es: '3 + 2 = 7',
    en: '3 + 2 = 7',
    isProposition: true,
    reason: {
      es: 'Es una proposición matemática falsa, pero proposición al fin.',
      en: 'It is a false mathematical proposition — but a proposition nonetheless.',
    },
  },
  {
    es: 'Ojalá que no llueva.',
    en: 'I hope it does not rain.',
    isProposition: false,
    reason: {
      es: 'Expresa un deseo: no se puede decir que sea verdadera o falsa.',
      en: 'It expresses a wish: it cannot be true or false.',
    },
  },
  {
    es: '¿Quién es el autor de «El Quijote»?',
    en: 'Who is the author of "Don Quixote"?',
    isProposition: false,
    reason: {
      es: 'Es una pregunta: no afirma nada que pueda ser verdadero o falso.',
      en: 'It is a question: it asserts nothing that could be true or false.',
    },
  },
  {
    es: 'Prohibido pasar.',
    en: 'No entry.',
    isProposition: false,
    reason: {
      es: 'Es una orden o prohibición, no una afirmación.',
      en: 'It is an order or prohibition, not a statement.',
    },
  },
  {
    es: 'Dios te bendiga.',
    en: 'May God bless you.',
    isProposition: false,
    reason: {
      es: 'Es una expresión de deseo: carece de valor de verdad.',
      en: 'It is an expression of a wish: it has no truth value.',
    },
  },
  {
    es: 'Ana regala los libros viejos o los que no le sirven.',
    en: 'Ana gives away the old books or the ones she does not need.',
    isProposition: true,
    reason: {
      es: 'Es una disyunción: una proposición compuesta.',
      en: 'It is a disjunction: a compound proposition.',
    },
  },
  {
    es: 'Mi perro es hermoso, pero huele feo.',
    en: 'My dog is beautiful, but he smells bad.',
    isProposition: true,
    reason: {
      es: '«pero» funciona como conjunción: es una proposición compuesta.',
      en: '"but" works as a conjunction: it is a compound proposition.',
    },
  },
  {
    es: 'x + 1 = 3',
    en: 'x + 1 = 3',
    isProposition: false,
    reason: {
      es: 'No es una proposición: su valor de verdad depende del valor de x. Es una función proposicional.',
      en: 'It is not a proposition: its truth depends on x. It is a propositional function.',
    },
  },
  {
    es: 'El número 17 es primo.',
    en: 'The number 17 is prime.',
    isProposition: true,
    reason: {
      es: 'Afirma un hecho matemático verdadero.',
      en: 'It states a true mathematical fact.',
    },
  },
]

export const propositionsClassify: ExerciseGenerator = {
  id: 'logic.propositions.classify',
  units: ['logic'],
  difficulty: 'easy',
  tags: ['propositions'],
  generate(rng: Rng): ExerciseContent {
    const item = rng.pick(SENTENCES)

    return {
      parts: [
        {
          prompt: template(
            `¿Es una proposición? «${item.es}»`,
            `Is it a proposition? "${item.en}"`,
          ),
          answer: booleanAnswer(item.isProposition, {
            es: 'Una proposición es una oración declarativa que puede ser verdadera o falsa.',
            en: 'A proposition is a declarative sentence that can be either true or false.',
          }),
          steps: [step(item.reason.es, item.reason.en, '')],
        },
      ],
    }
  },
}
