/**
 * Shared substring lookup for the translation tables.
 *
 * vPIC rarely answers with a bare word: `BodyClass` reads
 * "Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)" and
 * `TransmissionStyle` reads "Continuously Variable Transmission (CVT)". So the
 * tables match on substrings, ordered most specific first, and every table
 * ends without a catch-all: a value we do not recognize produces no
 * suggestion, which is the whole point — a blank field beats a wrong one.
 */

/** A translation table: pairs of needle to look for and value to propose. */
export type LookupTable = [string, string][]

/**
 * Find the first entry whose needle appears in the given text.
 *
 * @param table - The translation table to walk.
 * @param text - The value vPIC returned, possibly null.
 */
export function lookup(table: LookupTable, text: string | null): string | null {
  const haystack = (text ?? '').toUpperCase()
  const found = table.find(([needle]) => haystack.includes(needle))
  return found ? found[1] : null
}
