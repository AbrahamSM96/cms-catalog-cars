'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { SelectInput, useField, useTranslation } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import { pick } from '../../i18n/locales'
import { ui } from '../../i18n/labels'

interface BrandDoc {
  id?: number | string
  name?: string
}

interface BrandFieldProps {
  field?: { admin?: { width?: string }; label?: unknown; required?: boolean }
  path: string
}

interface BrandOption {
  id: number | string
  name: string
}

type SelectOption = { label?: string; value?: string }

// Module-level cache so the brand list is fetched a single time per session,
// shared across every mount of the field (no re-fetch when the dropdown is
// reopened, and no 10-at-a-time pagination like Payload's default relationship
// input).
let brandsCache: BrandOption[] | undefined
let brandsPromise: Promise<BrandOption[]> | undefined

/**
 * Fetch every brand once and memoize the result at module scope.
 *
 * @returns The full, name-sorted list of brand options.
 */
function loadBrands(): Promise<BrandOption[]> {
  if (brandsCache) return Promise.resolve(brandsCache)
  brandsPromise ??= fetch('/api/brands?depth=0&limit=1000&sort=name')
    .then((res): Promise<{ docs?: BrandDoc[] }> => res.json())
    .then((data): BrandOption[] => {
      const options = (data.docs ?? [])
        .filter(
          (doc): doc is BrandOption => doc.id !== undefined && Boolean(doc.name)
        )
        .map((doc) => ({ id: doc.id, name: doc.name as string }))
      brandsCache = options
      return options
    })
    .catch((): BrandOption[] => {
      brandsPromise = undefined
      return []
    })
  return brandsPromise
}

/**
 * Brand dropdown for the Cars form: Payload's styled select populated with the
 * complete brand catalog in a single request, cached at module scope. Stores
 * the brand id (kept numeric for Postgres) so it behaves like the underlying
 * relationship field.
 *
 * @param props - The Payload field component props.
 */
export function BrandField(props: BrandFieldProps): React.JSX.Element {
  const { field, path } = props
  const { setValue, value } = useField<number | string>({ path })
  const { i18n } = useTranslation()
  const [options, setOptions] = useState<BrandOption[]>(brandsCache ?? [])

  useEffect((): (() => void) => {
    let active = true
    void loadBrands().then((brands): void => {
      if (active) setOptions(brands)
    })
    return (): void => {
      active = false
    }
  }, [])

  /**
   * Persist the picked brand id, coerced back to a number when possible.
   *
   * @param option - The selected react-select option(s).
   */
  const handleChange = (option: unknown): void => {
    const opt = Array.isArray(option) ? option[0] : option
    const raw = (opt as SelectOption | null)?.value
    if (!raw) {
      setValue(null)
      return
    }
    const asNumber = Number(raw)
    setValue(Number.isNaN(asNumber) ? raw : asNumber)
  }

  const label = typeof field?.label === 'string' ? field.label : 'Brand'
  const current = value == null ? '' : String(value)

  return (
    <SelectInput
      label={label}
      name={path}
      onChange={handleChange}
      options={options.map((brand) => ({
        label: brand.name,
        value: String(brand.id),
      }))}
      path={path}
      placeholder={pick(ui.fields.selectBrand, i18n.language)}
      required={field?.required}
      style={{ '--field-width': field?.admin?.width } as React.CSSProperties}
      value={current}
    />
  )
}
