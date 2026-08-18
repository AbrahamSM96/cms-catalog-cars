import type { PayloadRequest } from 'payload'

/**
 * Capitalize the first letter of every word (Title Case).
 *
 * @param value - The text to format.
 */
export function toTitleCase(value?: string): string | undefined {
  if (!value) return value
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Resolve a brand name from a relationship reference. When the reference is an
 * object with a `name` property it is used directly; when it is an ID the
 * Payload `findByID` method is called.
 *
 * @param brandRef - The brand reference (object with name, or an ID).
 * @param payload - The Payload instance available on the request.
 */
export async function resolveBrandName(
  brandRef: unknown,
  payload: PayloadRequest['payload']
): Promise<string> {
  if (!brandRef) return ''
  if (typeof brandRef === 'object' && brandRef !== null && 'name' in brandRef) {
    return (brandRef as { name: string }).name ?? ''
  }
  try {
    const brand = await payload.findByID({
      collection: 'brands',
      depth: 0,
      id: brandRef as string | number,
    })
    return brand?.name ?? ''
  } catch {
    return ''
  }
}

/**
 * Build the display title for a car: "Brand Model Year". Missing parts are
 * silently omitted.
 *
 * @param props - Title components.
 * @param props.brand - Brand relationship reference.
 * @param props.model - Car model string.
 * @param props.payload - The Payload instance available on the request.
 * @param props.year - Model year number.
 */
export async function buildCarTitle(props: {
  brand?: unknown
  model?: string
  payload: PayloadRequest['payload']
  year?: number
}): Promise<string> {
  const { brand, model, payload, year } = props
  const brandName = await resolveBrandName(brand, payload)
  return [brandName, model, year].filter(Boolean).join(' ')
}
