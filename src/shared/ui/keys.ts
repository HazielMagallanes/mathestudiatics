interface KeyLike {
  key: string
  keyCode?: number
}

/**
 * Enter detection that also works on mobile and IME keyboards, where `key`
 * can be "Unidentified" while `keyCode` is still 13.
 */
export function isEnterKey(event: KeyLike): boolean {
  return event.key === 'Enter' || event.keyCode === 13
}
