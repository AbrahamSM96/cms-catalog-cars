export type FilterKey =
  | 'brand'
  | 'minYear'
  | 'search'
  | 'status'
  | 'transmission'

const FILTER_KEYS: FilterKey[] = [
  'brand',
  'minYear',
  'search',
  'status',
  'transmission',
]

/**
 * Apply a single filter value to URLSearchParams. Empty string or 'all'
 * removes the key; otherwise sets it.
 *
 * @param current - the current search params.
 * @param key - the filter key.
 * @param value - the filter value.
 * @returns the stringified query (without leading '?').
 */
export function applyFilter(
  current: URLSearchParams,
  key: FilterKey,
  value: string
): string {
  const params = new URLSearchParams(current.toString())
  if (value === '' || value === 'all') {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  return params.toString()
}

/**
 * Check whether any of the known filter keys are present in the params.
 *
 * @param params - the current URL search params.
 * @returns true if at least one filter is active.
 */
export function hasActiveFilters(params: URLSearchParams): boolean {
  return FILTER_KEYS.some((key) => params.get(key) !== null)
}
