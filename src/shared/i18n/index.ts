import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from '@/shared/i18n/locales/en.json'
import es from '@/shared/i18n/locales/es.json'

export const supportedLocales = ['es', 'en'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export const FALLBACK_LOCALE: SupportedLocale = 'es'
export const LOCALE_STORAGE_KEY = 'mathestudiatics.locale'

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (supportedLocales as readonly string[]).includes(value)
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: supportedLocales,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    // Bundled resources: init synchronously to avoid a first-paint flash.
    initAsync: false,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

export default i18n
