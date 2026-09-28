import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import i18n from '@/shared/i18n'
import { clearSavedBoard } from '@/features/whiteboard/storage'
import { expectNoA11yViolations } from '@/test/a11y'
import { renderApp } from '@/test/renderApp'

async function renderBoard() {
  const view = renderApp(['/board'])

  await screen.findByRole('heading', { level: 1, name: 'Pizarra' })

  return view
}

beforeEach(async () => {
  window.localStorage.clear()
  // The board autosaves to IndexedDB; start every test from a clean board.
  await clearSavedBoard()
  await i18n.changeLanguage('es')
})

describe('whiteboard page', () => {
  it('renders the board and the view controls', async () => {
    await renderBoard()

    expect(screen.getByRole('application', { name: 'Pizarra de resolución' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acercar' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cuadrícula')).toBeInTheDocument()
  })

  it('zooms and resets the view', async () => {
    const user = userEvent.setup()
    await renderBoard()

    const board = screen.getByRole('application', { name: 'Pizarra de resolución' })

    await user.click(screen.getByRole('button', { name: 'Acercar' }))

    expect(board.getAttribute('viewBox')).not.toBe('0 0 1600 1000')

    await user.click(screen.getByRole('button', { name: 'Vista inicial' }))

    expect(board.getAttribute('viewBox')).toBe('0 0 1600 1000')
  })

  it('adds a typed formula to the board with a live preview', async () => {
    const user = userEvent.setup()
    await renderBoard()

    const input = screen.getByLabelText('Nueva línea')

    await user.type(input, '1/2')
    await user.keyboard('{Enter}')

    const board = screen.getByRole('application', { name: 'Pizarra de resolución' })

    expect(board.querySelector('[data-object-kind="math"]')).not.toBeNull()
    expect(board.querySelector('foreignObject .katex')).not.toBeNull()
    expect(input).toHaveValue('')
  })

  it('renders the notepad lines and lets you edit them', async () => {
    const user = userEvent.setup()
    await renderBoard()

    const input = screen.getByLabelText('Nueva línea')

    await user.type(input, 'x^2 - 4 = 0')
    await user.keyboard('{Enter}')

    // The committed line is rendered (not raw text) and can be edited.
    await user.click(screen.getByRole('button', { name: 'Línea 1' }))

    const lineInput = screen.getByLabelText('Línea 1')

    await user.clear(lineInput)
    await user.type(lineInput, '2x + 3 = 7')
    await user.keyboard('{Enter}')

    const board = screen.getByRole('application', { name: 'Pizarra de resolución' })

    expect(board.textContent).toContain('7')
  })

  it('deletes a notepad line and removes it from the board', async () => {
    const user = userEvent.setup()
    await renderBoard()

    await user.type(screen.getByLabelText('Nueva línea'), '3/4')
    await user.keyboard('{Enter}')

    const board = screen.getByRole('application', { name: 'Pizarra de resolución' })

    expect(board.querySelector('[data-object-kind="math"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Borrar la línea 1' }))

    expect(board.querySelector('[data-object-kind="math"]')).toBeNull()
  })

  it('commits lines with the button too (mobile keyboards show Next, not Enter)', async () => {
    const user = userEvent.setup()
    await renderBoard()

    await user.type(screen.getByLabelText('Nueva línea'), '2/5 + 1/5')
    await user.click(screen.getByRole('button', { name: 'Agregar línea' }))

    const board = screen.getByRole('application', { name: 'Pizarra de resolución' })

    expect(board.querySelector('[data-object-kind="math"]')).not.toBeNull()
    expect(screen.getByLabelText('Nueva línea')).toHaveValue('')

    // Editing a line also has an explicit save button.
    await user.click(screen.getByRole('button', { name: 'Línea 1' }))
    await user.clear(screen.getByLabelText('Línea 1', { exact: true }))
    await user.type(screen.getByLabelText('Línea 1', { exact: true }), '3/5')
    await user.click(screen.getByRole('button', { name: 'Guardar la línea 1' }))

    expect(board.textContent).toContain('3')
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
