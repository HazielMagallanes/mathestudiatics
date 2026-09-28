import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home renders with its navigation and has no accessibility violations', async ({ page }) => {
  await page.goto('./')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('a tu ritmo')

  const nav = page.getByRole('navigation', { name: 'Menú' })
  await expect(nav.getByRole('link', { name: 'Práctica' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Herramientas' })).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('navigates between sections', async ({ page }) => {
  await page.goto('./')

  await page
    .getByRole('navigation', { name: 'Menú' })
    .getByRole('link', { name: 'Práctica' })
    .click()

  await expect(page.getByRole('heading', { level: 1, name: 'Práctica' })).toBeVisible()
  expect(page.url()).toContain('#/practice')

  await page
    .getByRole('navigation', { name: 'Menú' })
    .getByRole('link', { name: 'Acerca de' })
    .click()

  await expect(page.getByRole('heading', { level: 1, name: 'Acerca de' })).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('switches language and persists it across reloads', async ({ page }) => {
  await page.goto('./')

  await page.getByRole('button', { name: /Idioma actual/ }).click()

  await expect(page.getByRole('heading', { level: 1 })).toContainText('at your own pace')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')

  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('at your own pace')
})

test('applies dark theme and persists it across reloads', async ({ page }) => {
  await page.goto('./')

  const themeButton = page.getByRole('button', { name: /^Tema:/ })

  // system → light → dark
  await themeButton.click()
  await themeButton.click()

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(themeButton).toHaveAccessibleName(/Oscuro/)

  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('shows the not-found page for unknown routes', async ({ page }) => {
  await page.goto('./#/nope')

  await expect(page.getByRole('heading', { level: 1, name: /no encontrada/i })).toBeVisible()
})
