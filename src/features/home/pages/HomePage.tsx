import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

const CARDS = [
  {
    to: '/study',
    titleKey: 'home.cards.study.title',
    descriptionKey: 'home.cards.study.description',
    ctaKey: 'home.cards.study.cta',
  },
  {
    to: '/practice',
    titleKey: 'home.cards.practice.title',
    descriptionKey: 'home.cards.practice.description',
    ctaKey: 'home.cards.practice.cta',
  },
  {
    to: '/tools',
    titleKey: 'home.cards.tools.title',
    descriptionKey: 'home.cards.tools.description',
    ctaKey: 'home.cards.tools.cta',
  },
] as const

const HOW_STEPS = ['home.how.step1', 'home.how.step2', 'home.how.step3'] as const

export default function HomePage() {
  const { t } = useTranslation()

  useDocumentTitle()

  return (
    <div className="space-y-14">
      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t('home.title')}
        </h1>
        <p className="mt-4 text-lg text-fg-muted">{t('home.subtitle')}</p>
      </section>

      <ul className="grid list-none gap-4 p-0 sm:grid-cols-3">
        {CARDS.map((card) => (
          <li
            key={card.to}
            className="flex flex-col rounded-lg border border-rule bg-surface-raised p-5"
          >
            <h2 className="text-xl font-semibold">{t(card.titleKey)}</h2>
            <p className="mt-2 flex-1 text-sm text-fg-muted">{t(card.descriptionKey)}</p>
            <Link
              to={card.to}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              {t(card.ctaKey)}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-lg border border-rule bg-surface-raised p-6">
        <h2 className="text-xl font-semibold">{t('home.how.title')}</h2>
        <ol className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-3">
          {HOW_STEPS.map((stepKey, index) => (
            <li key={stepKey} className="flex gap-3">
              <span aria-hidden="true" className="font-serif text-2xl leading-none text-accent">
                {index + 1}
              </span>
              <span className="text-sm text-fg-muted">{t(stepKey)}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-sm text-fg-muted">{t('home.offline')}</p>
    </div>
  )
}
