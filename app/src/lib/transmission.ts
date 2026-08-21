export type Transmission = 'automatic' | 'manual'

/**
 * Long, unambiguous automatic-transmission keywords that can appear anywhere in
 * a version description (they never collide with other words).
 */
const AUTOMATIC_KEYWORDS = [
  'AUTOMATICA',
  'AUTOMATICO',
  'AUTOSTICK',
  'CVT',
  'DCT',
  'DSG',
  'EASYTRONIC',
  'GEARTRONIC',
  'HYDRAMATIC',
  'MULTITRONIC',
  'PDK',
  'POWERSHIFT',
  'SECUENCIAL',
  'SELESPEED',
  'SPEEDSHIFT',
  'SPORTSHIFT',
  'STEPTRONIC',
  'TIPTRONIC',
  'TRONIC',
  'XTRONIC',
]

/**
 * Long, unambiguous manual-transmission keywords.
 */
const MANUAL_KEYWORDS = ['ESTANDAR', 'MANUAL']

/**
 * Short automatic abbreviations that must be matched as whole tokens so they
 * don't hit substrings of unrelated words (e.g. "AT" inside "PLATINUM").
 */
const AUTOMATIC_ABBREVIATIONS = ['AT', 'AUT', 'TA']

/**
 * Short manual abbreviations matched as whole tokens.
 */
const MANUAL_ABBREVIATIONS = ['MT', 'STD', 'TM']

/**
 * Build a regex that matches any of the given whole-word tokens.
 *
 * @param tokens - The tokens to match as standalone words.
 */
function wordRegex(tokens: string[]): RegExp {
  return new RegExp(`\\b(?:${tokens.join('|')})\\b`)
}

const AUTOMATIC_KEYWORD_RE = new RegExp(AUTOMATIC_KEYWORDS.join('|'))
const MANUAL_KEYWORD_RE = new RegExp(MANUAL_KEYWORDS.join('|'))
const AUTOMATIC_ABBR_RE = wordRegex(AUTOMATIC_ABBREVIATIONS)
const MANUAL_ABBR_RE = wordRegex(MANUAL_ABBREVIATIONS)

/**
 * Infer the transmission type from a car version description (as scraped into
 * the catalogue, e.g. "2.0L EX AA EE CD BA ESTANDAR HATCHBACK 4 CIL 5 P").
 * Manual keywords win over automatic ones on the rare mixed string. Returns
 * `null` when no transmission can be determined.
 *
 * @param description - The version description text.
 */
export function detectTransmission(description?: string): Transmission | null {
  if (!description) return null
  const text = description.toUpperCase()

  if (MANUAL_KEYWORD_RE.test(text) || MANUAL_ABBR_RE.test(text)) return 'manual'
  if (AUTOMATIC_KEYWORD_RE.test(text) || AUTOMATIC_ABBR_RE.test(text)) {
    return 'automatic'
  }
  return null
}
