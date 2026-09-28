import { isEnterKey } from '@/shared/ui/keys'
import { describe, expect, it } from 'vitest'

describe('isEnterKey', () => {
  it('accepts the standard Enter key', () => {
    expect(isEnterKey({ key: 'Enter' })).toBe(true)
  })

  it('accepts legacy/IME keyboards that only report keyCode 13', () => {
    expect(isEnterKey({ key: 'Unidentified', keyCode: 13 })).toBe(true)
  })

  it('rejects other keys', () => {
    expect(isEnterKey({ key: 'a', keyCode: 65 })).toBe(false)
    expect(isEnterKey({ key: 'Next' })).toBe(false)
  })
})
