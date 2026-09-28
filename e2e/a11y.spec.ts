import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const ROUTES = [
  { path: './', heading: /a tu ritmo/ },
  { path: './#/study', heading: 'Teoría' },
  { path: './#/study/logic', heading: 'Lógica proposicional' },
  { path: './#/practice?units=logic&difficulty=easy', heading: 'Práctica' },
  { path: './#/board', heading: 'Pizarra' },
  { path: './#/calculator', heading: 'Calculadora científica' },
  { path: './#/tools', heading: 'Herramientas' },
  { path: './#/about', heading: 'Acerca de' },
  { path: './#/does-not-exist', heading: /no encontrada/ },
]

test.describe('accessibility sweep', () => {
  for (const route of ROUTES) {
    test(`no axe violations on ${route.path}`, async ({ page }) => {
      await page.goto(route.path)

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.heading)

      const results = await new AxeBuilder({ page }).analyze()

      expect(results.violations).toEqual([])
    })
  }
})
