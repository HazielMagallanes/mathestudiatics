import 'i18next'

import type es from '@/shared/i18n/locales/es.json'

/**
 * Makes `t('...')` type-safe against the Spanish locale, which is the source
 * of truth for keys: `en.json` parity is enforced by a unit test.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof es
    }
  }
}
