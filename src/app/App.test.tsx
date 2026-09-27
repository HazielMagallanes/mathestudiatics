import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import i18n, { LOCALE_STORAGE_KEY } from '@/shared/i18n'
import { THEME_STORAGE_KEY } from '@/shared/theme/theme'
import { expectNoA11yViolations } from '@/test/a11y'
import { renderApp } from '@/test/renderApp'

async function renderHome() {
  const view = renderApp()

  await screen.findByRole('heading', { level: 1, name: /a tu ritmo/i })

  return view
}

function visibleNavLink(name: string): HTMLElement {
  const links = screen.getAllByRole('link', { name })
  const [firstLink] = links

  if (!firstLink) {
    throw new Error(`No link named "${name}" found`)
  }

  return firstLink
}

beforeEach(async () => {
  window.localStorage.clear()
  document.documentElement.classList.remove('dark')
  document.documentElement.lang = 'es'
  await i18n.changeLanguage('es')
})

describe('app shell', () => {
  it('renders the home page and its navigation', async () => {
    await renderHome()

    expect(visibleNavLink('Teoría')).toBeInTheDocument()
    expect(visibleNavLink('Práctica')).toBeInTheDocument()
    expect(visibleNavLink('Herramientas')).toBeInTheDocument()
    expect(visibleNavLink('Acerca de')).toBeInTheDocument()
  })

  it('navigates to the practice page', async () => {
    const user = userEvent.setup()
    const { router } = await renderHome()

    await user.click(visibleNavLink('Práctica'))

    expect(await screen.findByRole('heading', { level: 1, name: 'Práctica' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/practice')
  })

  it('shows the not-found page for unknown routes', async () => {
    renderApp(['/does-not-exist'])

    expect(
      await screen.findByRole('heading', { level: 1, name: /no encontrada/i }),
    ).toBeInTheDocument()
  })

  it('switches language and persists the choice', async () => {
    const user = userEvent.setup()
    await renderHome()

    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: /at your own pace/i }),
    ).toBeInTheDocument()
    expect(i18n.resolvedLanguage).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
  })

  it('applies and persists the dark theme', async () => {
    const user = userEvent.setup()
    await renderHome()

    await user.selectOptions(screen.getByRole('combobox', { name: /tema/i }), 'dark')

    expect(document.documentElement).toHaveClass('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('has no accessibility violations on the home page', async () => {
    const { container } = await renderHome()

    await expectNoA11yViolations(container)
  })
})
