import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('reads a unit theory page with rendered math', async ({ page }) => {
  await page.goto('./#/study')

  await expect(page.getByRole('heading', { level: 1, name: 'Teoría' })).toBeVisible()

  await page
    .getByRole('listitem')
    .filter({ hasText: 'Lógica proposicional' })
    .getByRole('link', { name: 'Leer teoría' })
    .click()

  await expect(page.getByRole('heading', { level: 1, name: 'Lógica proposicional' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Formulario' })).toBeVisible()
  await expect(page.locator('.katex').first()).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('jumps from a unit to practice with the unit preselected', async ({ page }) => {
  await page.goto('./#/study/vectors')

  await page.getByRole('link', { name: 'Practicar esta unidad' }).click()

  await expect(page).toHaveURL(/units=vectors/)
  await expect(page.getByRole('article', { name: 'Práctica' })).toBeVisible()
  await expect(page.getByText('Vectores').first()).toBeVisible()
})
