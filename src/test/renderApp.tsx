import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { routes } from '@/app/router'
import '@/shared/i18n'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'

export function renderApp(initialEntries: string[] = ['/']) {
  const router = createMemoryRouter(routes, { initialEntries })

  const view = render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )

  return { ...view, router }
}
