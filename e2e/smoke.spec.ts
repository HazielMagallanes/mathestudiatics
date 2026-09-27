import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home renders and has no accessibility violations', async ({ page }) => {
  await page.goto('./')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mathestudiatics')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
