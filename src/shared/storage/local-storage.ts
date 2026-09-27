/**
 * Thin, safe wrappers around localStorage: reads and writes can throw in
 * private-mode or sandboxed contexts, and the app must never crash over a
 * preference.
 */
export function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore: preferences are best-effort.
  }
}
