import { dealerships } from '../i18n/labels'
import { pick } from '../i18n/locales'

/**
 * Subset of Payload's validate options this module reads. Kept structural so
 * the validators stay callable from unit tests without building a request.
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
 * Validate a latitude value for Payload field validation. Null / undefined
 * values are considered valid (the field is optional).
 *
 * @param value - The latitude value in decimal degrees.
 * @param options - Payload's validate options, used to resolve the language.
 */
export function validateLatitude(
  value: number | null | undefined,
  options?: ValidateContext
): true | string {
  return (
    value == null ||
    (value >= -90 && value <= 90) ||
    pick(dealerships.errors.latitude, languageOf(options))
  )
}

/**
 * Validate a longitude value for Payload field validation. Null / undefined
 * values are considered valid (the field is optional).
 *
 * @param value - The longitude value in decimal degrees.
 * @param options - Payload's validate options, used to resolve the language.
 */
export function validateLongitude(
  value: number | null | undefined,
  options?: ValidateContext
): true | string {
  return (
    value == null ||
    (value >= -180 && value <= 180) ||
    pick(dealerships.errors.longitude, languageOf(options))
  )
}
