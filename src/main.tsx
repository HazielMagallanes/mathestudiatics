// Variable fonts, self-hosted. @font-face rules carry unicode-ranges, so browsers
// only download the subsets the page actually uses.
import '@fontsource-variable/inter'
import '@fontsource-variable/source-serif-4'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App'
import '@/shared/i18n'
import '@/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
