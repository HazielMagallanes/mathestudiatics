import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('generates an exercise, reveals the answer and generates another one', async ({ page }) => {
  await page.goto('./#/practice')

  const card = page.getByRole('article', { name: 'Práctica' })

  await expect(card).toBeVisible()
  await expect(card.locator('.katex').first()).toBeVisible()

  const seedBadge = card.locator('header span').last()
  const firstSeed = await seedBadge.textContent()

  await card.getByText('Ver respuesta').first().click()
  await expect(card.locator('details[open]')).toHaveCount(1)

  await card.getByRole('button', { name: 'Otro ejercicio' }).click()
  await expect(seedBadge).not.toHaveText(firstSeed ?? '')
})

test('honours a shared deep link and changes the selection', async ({ page }) => {
  await page.goto('./#/practice?units=vectors&difficulty=hard&mix=single&seed=e2e-seed')

  const card = page.getByRole('article', { name: 'Práctica' })

  await expect(card.getByText('Vectores')).toBeVisible()
  await expect(card.getByText('Difícil')).toBeVisible()
  await expect(card.getByText(/e2e-seed/)).toBeVisible()

  await page.getByText('Fácil', { exact: true }).click()
  await expect(page).toHaveURL(/difficulty=easy/)
  await expect(card.getByText('Fácil')).toBeVisible()
})

test('keeps a local history of generated exercises', async ({ page }) => {
  await page.goto('./#/practice?units=review&difficulty=easy&seed=history-seed')

  const history = page.locator('details', { hasText: 'Historial' })

  await history.locator('summary').click()
  await expect(history.getByText('history-seed')).toBeVisible()
  await expect(history.getByRole('button', { name: 'Resuelto' }).first()).toBeVisible()
})

test('has no accessibility violations', async ({ page }) => {
  await page.goto('./#/practice?units=logic&difficulty=easy')

  await expect(page.getByRole('article', { name: 'Práctica' })).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
