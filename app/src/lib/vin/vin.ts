/**
 * VIN primitives — pure, no network, no database.
 *
 * A VIN is not an opaque identifier. ISO 3779 splits its 17 characters into
 * blocks, and only some of them describe the vehicle:
 *
 * ```
 *   1-3   WMI  manufacturer + country
 *   4-8   VDS  model, body, engine, restraint system
 *   9          check digit (derived from the other 16)
 *  10          model year
 *  11          assembly plant
 * 12-17        serial number — unique per unit, describes nothing
 * ```
 *
 * That is why {@link squishVin} exists: every vehicle sharing positions
 * 1-8, 10 and 11 decodes to exactly the same attributes, so one network call
 * answers for all of them. NHTSA itself confirms this by accepting partial
 * VINs with wildcards (`DecodeVin/5UXWX7C5*BA?year=2011`).
 */

/** Number of characters in a VIN. */
const VIN_LENGTH = 17

/** Zero-based index of the check digit (position 9). */
const CHECK_DIGIT_INDEX = 8

/**
 * I, O and Q are excluded from the VIN alphabet so they cannot be confused
 * with 1 and 0.
 */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/

/** Positional weights used by the ISO 3779 check-digit algorithm. */
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

/**
 * Numeric value of each letter for the check-digit algorithm. Digits are worth
 * themselves; letters follow the transliteration table of the standard.
 */
const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
}

/**
 * Model-year codes for position 10. The table repeats every 30 years, so the
 * same letter means two different years (a 1980 and a 2010 both read "A").
 * {@link modelYearFromVin} disambiguates using position 7.
 */
const YEAR_CODES = 'ABCDEFGHJKLMNPRSTVWXY123456789'

/** First year of the current 30-year cycle. */
const CYCLE_START = 2010

/** First year of the previous 30-year cycle. */
const PREVIOUS_CYCLE_START = 1980

/**
 * Strip spaces and dashes and upper-case the result, so a VIN copied from a
 * windshield photo or an invoice is comparable with a typed one.
 *
 * @param raw - The VIN as the user typed or pasted it.
 */
export function normalizeVin(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase()
}

/**
 * Value a single VIN character contributes to the checksum.
 *
 * @param char - One character of an already normalized VIN.
 */
function charValue(char: string): number {
  return LETTER_VALUES[char] ?? Number(char)
}

/**
 * Compute the ISO 3779 check digit for a normalized VIN. The digit at
 * position 9 is ignored while computing, since that is the value being
 * verified.
 *
 * @param vin - A normalized, 17-character VIN.
 */
function checkDigit(vin: string): string {
  let sum = 0
  for (let i = 0; i < VIN_LENGTH; i += 1) {
    sum += charValue(vin[i]) * WEIGHTS[i]
  }
  const remainder = sum % 11
  return remainder === 10 ? 'X' : String(remainder)
}

/**
 * Whether a VIN is structurally valid: right length, legal alphabet and a
 * matching check digit.
 *
 * Catching a typo here is what keeps a mistyped VIN from spending a network
 * call and then coming back as an unhelpful "not found".
 *
 * @param raw - The VIN to validate, normalized or not.
 */
export function isValidVin(raw: string): boolean {
  const vin = normalizeVin(raw)
  if (!VIN_PATTERN.test(vin)) return false
  return vin[CHECK_DIGIT_INDEX] === checkDigit(vin)
}

/**
 * Build the cache key shared by every vehicle that decodes identically:
 * positions 1-8 (manufacturer and attributes), 10 (model year) and 11 (plant).
 * The check digit is derived and the serial number describes nothing, so both
 * are dropped.
 *
 * @param raw - The VIN to reduce, normalized or not.
 */
export function squishVin(raw: string): string {
  const vin = normalizeVin(raw)
  return vin.slice(0, 8) + vin.slice(9, 11)
}

/**
 * Resolve the model year encoded in position 10.
 *
 * The code repeats every 30 years, so position 7 breaks the tie: on cars built
 * from 2010 onward it holds a letter, while on the 1980-2009 cycle it holds a
 * digit. Returns `null` when the character is not a valid year code.
 *
 * @param raw - The VIN to read, normalized or not.
 */
export function modelYearFromVin(raw: string): number | null {
  const vin = normalizeVin(raw)
  if (vin.length < 11) return null

  const index = YEAR_CODES.indexOf(vin[9])
  if (index === -1) return null

  const currentCycle = /[A-Z]/.test(vin[6])
  const base = currentCycle ? CYCLE_START : PREVIOUS_CYCLE_START
  return base + index
}
