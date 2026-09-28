import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import i18n from '@/shared/i18n'
import { expectNoA11yViolations } from '@/test/a11y'
import { renderApp } from '@/test/renderApp'

async function renderCalculator() {
  const view = renderApp(['/calculator'])

  await screen.findByRole('heading', { level: 1, name: 'Calculadora científica' })

  return view
}

beforeEach(async () => {
  window.localStorage.clear()
  await i18n.changeLanguage('es')
})

describe('calculator page', () => {
  it('evaluates an expression and shows the result', async () => {
    const user = userEvent.setup()
    await renderCalculator()

    const input = screen.getByLabelText('Expresión')

    await user.type(input, '2 + 3 * 4')
    await user.click(screen.getByRole('button', { name: 'Calcular' }))

    expect(screen.getByRole('status')).toHaveTextContent('14')
    expect(input).toHaveValue('14')
  })

  it('evaluates trigonometry in degrees by default', async () => {
    const user = userEvent.setup()
    await renderCalculator()

    await user.type(screen.getByLabelText('Expresión'), 'sin(30)')
    await user.click(screen.getByRole('button', { name: 'Calcular' }))

    expect(screen.getByRole('status')).toHaveTextContent('0.5')
  })

  it('reports domain errors in plain language', async () => {
    const user = userEvent.setup()
    await renderCalculator()

    await user.type(screen.getByLabelText('Expresión'), 'sqrt(-1)')

    expect(screen.getByRole('status')).toHaveTextContent(/dominio/)
  })

  it('supports the keypad and memory', async () => {
    const user = userEvent.setup()
    await renderCalculator()

    await user.click(screen.getByRole('button', { name: '7' }))
    await user.click(screen.getByRole('button', { name: 'Sumar' }))
    await user.click(screen.getByRole('button', { name: '8' }))

    expect(screen.getByLabelText('Expresión')).toHaveValue('7+8')

    await user.click(screen.getByRole('button', { name: 'M+' }))

    expect(screen.getByText(/Memoria:/)).toHaveTextContent('15')
  })

  it('keeps a history of calculations', async () => {
    const user = userEvent.setup()
    await renderCalculator()

    await user.type(screen.getByLabelText('Expresión'), '1/3')
    await user.click(screen.getByRole('button', { name: 'Calcular' }))

    await user.click(screen.getByText(/Historial/))

    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(screen.getAllByText('0.333333333333')).toHaveLength(2)
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderCalculator()

    await expectNoA11yViolations(container)
  })
})
