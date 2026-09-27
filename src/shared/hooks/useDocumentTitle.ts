import { useEffect } from 'react'

const APP_NAME = 'Mathestudiatics'

/**
 * Keeps `document.title` in sync with the current screen and language.
 * Callers pass the already-translated page title.
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
