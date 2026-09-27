import axe from 'axe-core'
import { expect } from 'vitest'

/**
 * Runs axe-core against a rendered container and fails on any violation.
 * jsdom has no layout engine, so rules that need layout report "incomplete"
 * instead of "violations"; unit tests are a fast first gate, while the
 * Playwright suite runs axe in a real browser.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container)
  expect(results.violations).toEqual([])
}
