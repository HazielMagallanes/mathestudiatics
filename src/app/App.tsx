import { useState } from 'react'
import { RouterProvider } from 'react-router'

import { createAppRouter } from '@/app/router'
import '@/shared/i18n'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'

export default function App() {
  const [router] = useState(createAppRouter)

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
