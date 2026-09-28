import { expect, test } from '@playwright/test'

test('serves a web app manifest and registers a service worker', async ({ page }) => {
  await page.goto('./')

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]')

    if (!link) {
      return null
    }

    const response = await fetch(link.getAttribute('href') ?? '')

    return response.ok ? ((await response.json()) as { name?: string; display?: string }) : null
  })

  expect(manifest?.name).toContain('Mathestudiatics')
  expect(manifest?.display).toBe('standalone')

  await expect
    .poll(
      async () =>
        page.evaluate(() =>
          navigator.serviceWorker.getRegistrations().then((items) => items.length),
        ),
      {
        timeout: 15_000,
      },
    )
    .toBeGreaterThan(0)
})
