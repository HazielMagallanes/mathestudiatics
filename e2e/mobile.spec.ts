import { expect, test } from '@playwright/test'

const ROUTES = [
  './',
  './#/study',
  './#/study/logic',
  './#/practice?units=logic,sets&difficulty=hard&mix=combined&seed=mobile',
  './#/board',
  './#/calculator',
  './#/tools',
  './#/about',
]

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 360, height: 740 },
]

test.describe('mobile layout', () => {
  test.use({ hasTouch: true, isMobile: true })

  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`no horizontal overflow on ${route} at ${String(viewport.width)}px`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport)
        await page.goto(route)
        await page.waitForTimeout(300)

        const overflow = await page.evaluate(() => {
          const documentElement = document.documentElement

          return documentElement.scrollWidth - documentElement.clientWidth
        })

        expect(overflow, 'horizontal overflow in pixels').toBeLessThanOrEqual(1)
      })
    }
  }

  test('the burger opens the panel with the language and theme controls', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('./')

    const burger = page.getByRole('button', { name: 'Abrir menú' })

    await expect(burger).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Menú (móvil)' })).toBeHidden()

    await burger.click()

    const panel = page.getByRole('navigation', { name: 'Menú (móvil)' })

    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Práctica' })).toBeVisible()
    await expect(panel.getByRole('group', { name: 'Idioma' })).toBeVisible()
    await expect(panel.getByRole('combobox', { name: 'Tema' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeVisible()
  })

  test('compact controls appear from 380px and the nav from 768px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('./')

    await expect(page.getByRole('button', { name: /Idioma actual/ })).toBeHidden()

    await page.setViewportSize({ width: 500, height: 800 })

    await expect(page.getByRole('button', { name: /Idioma actual/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Tema:/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeVisible()

    await page.setViewportSize({ width: 1024, height: 800 })

    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeHidden()
    await expect(page.getByRole('navigation', { name: 'Menú' })).toBeVisible()
  })

  test('the language toggle switches the UI', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 })
    await page.goto('./')

    await page.getByRole('button', { name: /Idioma actual/ }).click()

    await expect(page.getByRole('heading', { level: 1 })).toContainText('at your own pace')
  })

  test('the notepad works with the on-screen keyboard flow (button commit)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('./#/board')

    const notepad = page.getByLabel('Nueva línea')

    await notepad.scrollIntoViewIfNeeded()
    await notepad.fill('1/2 + 1/4')

    // Mobile keyboards show "Next"/"Go"; the button commits the line.
    await page.getByRole('button', { name: 'Agregar línea' }).click()

    const board = page.getByRole('application', { name: 'Pizarra de resolución' })

    await expect(board.locator('[data-object-kind="math"]')).toHaveCount(1)
    await expect(notepad).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Línea 1', exact: true })).toBeVisible()
  })

  test('every display formula fits the screen without horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })

    for (const unit of ['review', 'logic', 'sets', 'trigonometry', 'vectors']) {
      await page.goto(`./#/study/${unit}`)
      await page.waitForTimeout(300)

      const wide = await page.evaluate(() =>
        [...document.querySelectorAll('.katex-display')]
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => {
            const annotation = element.querySelector('annotation[encoding="application/x-tex"]')

            return `${String(element.scrollWidth)}/${String(element.clientWidth)}: ${(annotation?.textContent ?? '').slice(0, 60)}`
          }),
      )

      expect(wide, `unit "${unit}" has formulas wider than the screen`).toEqual([])
    }
  })
})
