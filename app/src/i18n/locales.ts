export const LOCALES = ['en', 'es'] as const

export type Locale = (typeof LOCALES)[number]

export type Translated = Record<Locale, string>

/**
 * Build a label covering every supported admin locale.
 *
 * @param en - English text.
 * @param es - Spanish text.
 */
export function msg(en: string, es: string): Translated {
  return { en, es }
}

/**
 * Resolve a translated text for a request language.
 *
 * @param text - The translated text.
 * @param language - The request language, from `req.i18n.language`.
 */
export function pick(text: Translated, language: string): string {
  return language in text ? text[language as Locale] : text.en
}

/**
 * Replace {name} tokens in a resolved string.
 *
 * @param text - The resolved text.
 * @param vars - Values keyed by token name.
 */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match)
}
