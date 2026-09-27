import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import i18n from '@/shared/i18n'
import { expectNoA11yViolations } from '@/test/a11y'
import { renderApp } from '@/test/renderApp'

async function renderPractice(search = '') {
  const view = renderApp([`/practice${search}`])

  await screen.findByRole('heading', { level: 1, name: 'Práctica' })

  return view
}

beforeEach(async () => {
  window.localStorage.clear()
  await i18n.changeLanguage('es')
})

describe('practice page', () => {
  it('generates an exercise from the default selection', async () => {
    await renderPractice()

    const card = await screen.findByRole('article', { name: 'Práctica' })

    expect(within(card).getByText(/Revisión/)).toBeInTheDocument()
    expect(within(card).getByText(/Semilla:/)).toBeInTheDocument()
    expect(card.querySelector('.katex')).not.toBeNull()
  })

  it('honours a deep link with units, difficulty and seed', async () => {
    const { router } = await renderPractice(
      '?units=vectors&difficulty=hard&mix=single&seed=deep-link',
    )

    const card = await screen.findByRole('article', { name: 'Práctica' })

    expect(within(card).getByText('Vectores')).toBeInTheDocument()
    expect(within(card).getByText('Difícil')).toBeInTheDocument()
    expect(within(card).getByText(/deep-link/)).toBeInTheDocument()
    expect(router.state.location.search).toContain('seed=deep-link')
  })

  it('reveals the answer and the worked solution behind details', async () => {
    const user = userEvent.setup()
    await renderPractice('?units=review&difficulty=easy&seed=answers')

    const answerSummary = await screen.findByText('Ver respuesta')

    expect(answerSummary.closest('details')).not.toHaveAttribute('open')

    await user.click(answerSummary)

    expect(answerSummary.closest('details')).toHaveAttribute('open')
    expect(screen.getByText('Ver resolución').closest('details')).not.toHaveAttribute('open')
  })

  it('generates a different exercise when asking for another one', async () => {
    const user = userEvent.setup()
    const { router } = await renderPractice('?units=review&difficulty=easy&seed=first-seed')

    const firstSeed = router.state.location.search

    await user.click(await screen.findByRole('button', { name: 'Otro ejercicio' }))

    expect(router.state.location.search).not.toBe(firstSeed)
    expect(router.state.location.search).toMatch(/seed=/)
  })

  it('changes the difficulty through the controls', async () => {
    const user = userEvent.setup()
    const { router } = await renderPractice()

    await user.click(await screen.findByRole('radio', { name: 'Difícil' }))

    expect(router.state.location.search).toContain('difficulty=hard')

    const card = await screen.findByRole('article', { name: 'Práctica' })

    expect(within(card).getByText('Difícil')).toBeInTheDocument()
  })

  it('combines two units and reports it', async () => {
    const user = userEvent.setup()
    await renderPractice('?units=logic&difficulty=medium&mix=combined')

    await user.click(await screen.findByRole('checkbox', { name: 'Conjuntos' }))

    const card = await screen.findByRole('article', { name: 'Práctica' })

    expect(within(card).getByText('Combinado')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderPractice('?units=logic&difficulty=easy')

    await screen.findByRole('article', { name: 'Práctica' })

    await expectNoA11yViolations(container)
  })
})
