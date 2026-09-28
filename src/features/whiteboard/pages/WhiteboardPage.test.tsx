import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import i18n from '@/shared/i18n'
import { expectNoA11yViolations } from '@/test/a11y'
import { renderApp } from '@/test/renderApp'

async function renderBoard() {
  const view = renderApp(['/board'])

  await screen.findByRole('heading', { level: 1, name: 'Pizarra' })

  return view
}

beforeEach(async () => {
  window.localStorage.clear()
  await i18n.changeLanguage('es')
})

describe('whiteboard page', () => {
  it('renders the board and the toolbar', async () => {
    await renderBoard()

    expect(screen.getByRole('application', { name: 'Pizarra de resolución' })).toBeInTheDocument()
    expect(screen.getByRole('toolbar', { name: 'Herramientas de la pizarra' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lápiz' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches tools through the toolbar and keyboard shortcuts', async () => {
    const user = userEvent.setup()
    await renderBoard()

    await user.click(screen.getByRole('button', { name: 'Goma' }))

    expect(screen.getByRole('button', { name: 'Goma' })).toHaveAttribute('aria-pressed', 'true')

    await user.keyboard('p')

    expect(screen.getByRole('button', { name: 'Lápiz' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('adds a typed formula to the board with a live preview', async () => {
    const user = userEvent.setup()
    await renderBoard()

    const input = screen.getByLabelText('Fórmula (LaTeX)')

    await user.type(input, '\\frac{1}{2}')

    expect(document.querySelector('.katex')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Agregar fórmula' }))

    const board = screen.getByRole('application', { name: 'Pizarra de resolución' })

    expect(board.querySelector('foreignObject')).not.toBeNull()
    expect(within(board).getAllByText(/1|2/).length).toBeGreaterThan(0)
    expect(input).toHaveValue('')
  })

  it('adds typed text and keeps the scratchpad clean', async () => {
    const user = userEvent.setup()
    await renderBoard()

    const input = screen.getByLabelText('Texto')

    await user.type(input, 'Paso 1')
    await user.click(screen.getByRole('button', { name: 'Agregar texto' }))

    const board = screen.getByRole('application', { name: 'Pizarra de resolución' })

    expect(within(board).getByText('Paso 1')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderBoard()

    await expectNoA11yViolations(container)
  })
})
