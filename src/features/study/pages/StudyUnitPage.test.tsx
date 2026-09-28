import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import i18n from '@/shared/i18n'
import { expectNoA11yViolations } from '@/test/a11y'
import { renderApp } from '@/test/renderApp'

async function renderUnit(unitId: string) {
  const view = renderApp([`/study/${unitId}`])

  await screen.findByRole('heading', { level: 1 })

  return view
}

beforeEach(async () => {
  window.localStorage.clear()
  await i18n.changeLanguage('es')
})

describe('study unit page', () => {
  it('renders the theory and the formula sheet with KaTeX', async () => {
    const { container } = await renderUnit('logic')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Lógica proposicional' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Teoría' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Formulario' })).toBeInTheDocument()
    expect(container.querySelector('.katex')).not.toBeNull()
  })

  it('links to practice with the unit preselected and offers printing', async () => {
    await renderUnit('vectors')

    expect(await screen.findByRole('link', { name: 'Practicar esta unidad' })).toHaveAttribute(
      'href',
      '/practice?units=vectors',
    )
    expect(screen.getByRole('button', { name: 'Imprimir' })).toBeInTheDocument()
  })

  it('shows a friendly message for unknown units', async () => {
    await renderUnit('astrology')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Unidad no encontrada' }),
    ).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderUnit('trigonometry')

    await expectNoA11yViolations(container)
  })
})
