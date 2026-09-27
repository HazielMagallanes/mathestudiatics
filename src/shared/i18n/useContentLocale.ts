import { useTranslation } from 'react-i18next'

import type { ContentLocale } from '@/content/blocks/templates'
import { FALLBACK_LOCALE, isSupportedLocale } from '@/shared/i18n'

/** The current UI language, narrowed to the locales content is authored in. */
export function useContentLocale(): ContentLocale {
  const { i18n } = useTranslation()

  return isSupportedLocale(i18n.resolvedLanguage) ? i18n.resolvedLanguage : FALLBACK_LOCALE
}
