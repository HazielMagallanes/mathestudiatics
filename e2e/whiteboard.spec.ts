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

async function addNotepadLine(page: Page, value: string): Promise<void> {
  const notepad = page.getByLabel('Nueva línea')

  await notepad.fill(value)
  await notepad.press('Enter')
}

test('renders typed lines on the board and undoes them', async ({ page }) => {
  const { board } = await openBoard(page)

  await addNotepadLine(page, '1/2 + 3/4')

  await expect(board.locator('[data-object-kind="math"]')).toHaveCount(1)
  await expect(board.locator('foreignObject .katex')).toHaveCount(1)

  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(board.locator('[data-object-kind="math"]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Rehacer' }).click()
  await expect(board.locator('[data-object-kind="math"]')).toHaveCount(1)
})

test('stacks typed lines from the top-left', async ({ page }) => {
  const { board } = await openBoard(page)

  await addNotepadLine(page, 'x^2 - 4 = 0')
  await addNotepadLine(page, '2x + 3 = 7')

  const boxes = await board.locator('foreignObject').evaluateAll((nodes) =>
    nodes.map((node) => ({
      x: Number(node.getAttribute('x')),
      y: Number(node.getAttribute('y')),
    })),
  )

  expect(boxes).toHaveLength(2)
  expect(boxes[0]?.x).toBe(48)
  expect(boxes[1]?.x).toBe(48)
  expect((boxes[1]?.y ?? 0) > (boxes[0]?.y ?? 0)).toBe(true)
})

test('selects a line, moves it with the keyboard and deletes it', async ({ page }) => {
  const { board } = await openBoard(page)

  await addNotepadLine(page, 'x + 1 = 3')

  const line = board.locator('[data-object-kind="math"]')
  const lineBox = await line.locator('foreignObject').boundingBox()

  if (!lineBox) {
    throw new Error('typed line has no bounding box')
  }

  await page.mouse.click(lineBox.x + lineBox.width / 2, lineBox.y + lineBox.height / 2)

  await expect(board.locator('[data-selection="true"]')).toHaveCount(1)

  const before = await line.locator('foreignObject').getAttribute('y')

  await page.keyboard.press('ArrowDown')

  await expect.poll(async () => line.locator('foreignObject').getAttribute('y')).not.toBe(before)

  await page.keyboard.press('Delete')

  await expect(line).toHaveCount(0)
})

test('edits and deletes notepad lines', async ({ page }) => {
  const { board } = await openBoard(page)

  await addNotepadLine(page, 'x^2 - 4 = 0')

  await page.getByRole('button', { name: 'Línea 1', exact: true }).click()

  const line = page.getByLabel('Línea 1', { exact: true })

  await line.fill('2x + 3 = 7')
  await line.press('Enter')

  await expect(board.locator('[data-object-kind="math"]')).toHaveCount(1)

  await page.getByRole('button', { name: 'Borrar la línea 1' }).click()

  await expect(board.locator('[data-object-kind="math"]')).toHaveCount(0)
})

test('adds typed text to the board', async ({ page }) => {
  const { board } = await openBoard(page)

  await page.getByLabel('Texto').fill('Paso 1')
  await page.getByRole('button', { name: 'Agregar texto' }).click()

  await expect(board.locator('[data-object-kind="text"]')).toHaveCount(1)
  await expect(board.locator('[data-object-kind="text"]')).toContainText('Paso 1')
})

test('keeps the board when navigating away and back', async ({ page }) => {
  const { board } = await openBoard(page)

  await addNotepadLine(page, '3/4')

  await expect(board.locator('[data-object-kind="math"]')).toHaveCount(1)

  // Client-side navigation unmounts the board, which flushes the save.
  await page
    .getByRole('navigation', { name: 'Menú' })
    .getByRole('link', { name: 'Herramientas' })
    .click()
  await expect(page.getByRole('heading', { level: 1, name: 'Herramientas' })).toBeVisible()

  await page.getByRole('link', { name: 'Abrir pizarra' }).click()
  await expect(page.locator('[data-object-kind="math"]')).toHaveCount(1)
})

test('has no accessibility violations', async ({ page }) => {
  const { board } = await openBoard(page)

  await expect(board).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
