import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

async function openBoard(page: Page): Promise<{ board: Locator; box: { x: number; y: number } }> {
  await page.goto('./#/board')

  const board = page.getByRole('application', { name: 'Pizarra de resolución' })

  await expect(board).toBeVisible()
  await board.scrollIntoViewIfNeeded()

  const boundingBox = await board.boundingBox()

  if (!boundingBox) {
    throw new Error('board has no bounding box')
  }

  return { board, box: { x: boundingBox.x, y: boundingBox.y } }
}

async function drawStroke(
  page: Page,
  box: { x: number; y: number },
  path: readonly [number, number][],
): Promise<void> {
  const [first, ...rest] = path

  if (!first) {
    return
  }

  await page.mouse.move(box.x + first[0], box.y + first[1])
  await page.mouse.down()

  for (const [x, y] of rest) {
    await page.mouse.move(box.x + x, box.y + y, { steps: 8 })
  }

  await page.mouse.up()
}

test('draws a stroke, undoes and redoes it', async ({ page }) => {
  const { board, box } = await openBoard(page)

  await drawStroke(page, box, [
    [120, 120],
    [220, 180],
    [300, 140],
  ])

  await expect(board.locator('[data-object-kind="stroke"]')).toHaveCount(1)

  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(board.locator('[data-object-kind="stroke"]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Rehacer' }).click()
  await expect(board.locator('[data-object-kind="stroke"]')).toHaveCount(1)
})

test('selects a stroke, nudges it with the keyboard and deletes it', async ({ page }) => {
  const { board, box } = await openBoard(page)

  await drawStroke(page, box, [
    [150, 150],
    [260, 200],
  ])

  const stroke = board.locator('[data-object-kind="stroke"]')

  await page.keyboard.press('v')
  await page.mouse.click(box.x + 205, box.y + 175)

  await expect(board.locator('[data-selection="true"]')).toHaveCount(1)

  const before = await stroke.locator('path').getAttribute('d')

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')

  await expect.poll(async () => stroke.locator('path').getAttribute('d')).not.toBe(before)

  await page.keyboard.press('Delete')

  await expect(stroke).toHaveCount(0)
})

test('adds typed text and a formula to the board', async ({ page }) => {
  const { board } = await openBoard(page)

  await page.getByLabel('Texto').fill('Paso 1')
  await page.getByRole('button', { name: 'Agregar texto' }).click()
  await expect(board.locator('[data-object-kind="text"]')).toHaveCount(1)
  await expect(board.locator('[data-object-kind="text"]')).toContainText('Paso 1')

  await page.getByLabel('Fórmula (LaTeX)').fill('\\frac{1}{2}')
  await page.getByRole('button', { name: 'Agregar fórmula' }).click()
  await expect(board.locator('[data-object-kind="math"]')).toHaveCount(1)
  await expect(board.locator('foreignObject .katex')).toHaveCount(1)
})

test('switches tools with keyboard shortcuts', async ({ page }) => {
  const { board } = await openBoard(page)

  await board.click({ position: { x: 40, y: 40 } })

  await page.keyboard.press('e')
  await expect(page.getByRole('button', { name: 'Goma' })).toHaveAttribute('aria-pressed', 'true')

  await page.keyboard.press('p')
  await expect(page.getByRole('button', { name: 'Lápiz' })).toHaveAttribute('aria-pressed', 'true')
})

test('has no accessibility violations', async ({ page }) => {
  const { board } = await openBoard(page)

  await expect(board).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
