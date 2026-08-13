/**
 * Merge a base paint object with a hover variant, wrapping each overridden
 * property in a MapLibre `case` expression keyed on the `hover` feature-state
 * so only the hovered feature adopts the hover value.
 *
 * @param paint - The base paint properties.
 * @param hoverPaint - Paint applied to the feature under the cursor, if any.
 * @returns The merged paint object.
 */
function mergeHoverPaint<T extends Record<string, unknown>>(
  paint: T,
  hoverPaint: T | undefined
): T {
  if (!hoverPaint) return paint
  const merged: Record<string, unknown> = { ...paint }
  for (const [key, hoverValue] of Object.entries(hoverPaint)) {
    if (hoverValue === undefined) continue
    const baseValue = merged[key]
    merged[key] =
      baseValue === undefined
        ? hoverValue
        : [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            hoverValue,
            baseValue,
          ]
  }
  return merged as T
}

export { mergeHoverPaint }
