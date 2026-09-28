import { expect, test } from '@playwright/test'

test('solves a quadratic equation in the calculator on the board page', async ({ page }) => {
  await page.goto('./#/board')

  await page.getByText('Calculadora', { exact: true }).click()

  const input = page.getByLabel('Expresión').first()

  await input.fill('x^2 - 4 = 0')

  const status = page.getByRole('status').first()

  await expect(status).toContainText('x')
  await expect(status.locator('.katex')).toBeVisible()
})

test('pins an exercise from practice and shows it on the board', async ({ page }) => {
  await page.goto('./#/practice?units=vectors&difficulty=hard&mix=single&seed=pin-e2e')

  const card = page.getByRole('article', { name: 'Práctica' })

  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'Fijar en la pizarra' }).click()
  await expect(card.getByRole('button', { name: 'Ejercicio fijado' })).toBeVisible()

  await page.goto('./#/board')

  const pinned = page.getByRole('region', { name: 'Ejercicio fijado' })

  await expect(pinned).toBeVisible()
  await expect(pinned.getByText('Vectores')).toBeVisible()
  await expect(pinned.getByText(/pin-e2e/)).toBeVisible()
  await expect(pinned.locator('.katex').first()).toBeVisible()

  await pinned.getByRole('button', { name: 'Quitar' }).click()
  await expect(page.getByRole('region', { name: 'Ejercicio fijado' })).toHaveCount(0)
})

test('pins and jumps straight to the whiteboard', async ({ page }) => {
  await page.goto('./#/practice?units=review&difficulty=easy&seed=pin-go')

  await page.getByRole('button', { name: 'Fijar e ir a la pizarra' }).click()

  await expect(page).toHaveURL(/board/)
  await expect(page.getByRole('region', { name: 'Ejercicio fijado' })).toBeVisible()
})
