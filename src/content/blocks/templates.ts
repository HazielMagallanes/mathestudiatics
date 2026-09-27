import type { LocalizedTemplate, TemplateParams } from '@/content/schema'

export const LOCALES = ['es', 'en'] as const
export type ContentLocale = (typeof LOCALES)[number]

export function template(es: string, en: string, params: TemplateParams = {}): LocalizedTemplate {
  return { es, en, params }
}

/** Renders a bilingual template for one locale, substituting `{{param}}`. */
export function formatTemplate(value: LocalizedTemplate, locale: ContentLocale): string {
  return value[locale].replace(/\{\{(\w+)\}\}/g, (placeholder, key: string) => {
    const param = value.params[key]

    return param === undefined ? placeholder : String(param)
  })
}

/** Every `{{param}}` referenced by either language, deduplicated. */
export function referencedParams(value: LocalizedTemplate): string[] {
  const keys = new Set<string>()

  for (const locale of LOCALES) {
    for (const match of value[locale].matchAll(/\{\{(\w+)\}\}/g)) {
      if (match[1]) {
        keys.add(match[1])
      }
    }
  }

  return [...keys]
}
