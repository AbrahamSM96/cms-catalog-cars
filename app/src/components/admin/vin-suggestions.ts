/**
 * A tiny hand-off between the VIN panel and the cascading Brand → Model →
 * Version fields.
 *
 * Those fields clear themselves on purpose: `ModelField` blanks the model when
 * the brand changes and `VersionField` blanks the version when brand, model or
 * year changes, so an editor switching brands never keeps a model from the old
 * one. That is exactly what the VIN panel trips over — it sets the brand, the
 * year and the model in one go, and the resets wipe the last two on the way
 * out.
 *
 * So the panel does not fight the resets: it leaves the values here, and each
 * field picks up its own after it has reloaded its options. Entries expire
 * because a value left behind by a decode nobody applied must not resurface
 * half a minute later, when the editor changes the brand by hand.
 */

/** How long a value waits to be picked up before it is considered stale. */
const TTL_MS = 3000

interface PendingValue {
  publishedAt: number
  value: string
}

const pending = new Map<string, PendingValue>()

/**
 * Leave values for the cascading fields to pick up.
 *
 * @param values - Field path to value, e.g. `{ model: 'Jetta' }`.
 * @param now - The current time, in milliseconds.
 */
export function publishSuggestions(
  values: Record<string, string>,
  now: number
): void {
  for (const [path, value] of Object.entries(values)) {
    pending.set(path, { publishedAt: now, value })
  }
}

/**
 * Take the value left for a field, if one is still fresh. Reading consumes it.
 *
 * @param path - The field path to read.
 * @param now - The current time, in milliseconds.
 */
export function takeSuggestion(path: string, now: number): string | undefined {
  const entry = pending.get(path)
  if (entry === undefined) return undefined

  pending.delete(path)
  return now - entry.publishedAt < TTL_MS ? entry.value : undefined
}
