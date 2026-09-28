import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Lazy routes plus axe can be slow when the whole suite runs in parallel.
configure({ asyncUtilTimeout: 15_000 })

afterEach(() => {
  cleanup()
})

// jsdom does not implement matchMedia; ThemeProvider and the pre-paint
// bootstrap both depend on it.
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}
