'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { SelectInput, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

interface ModelFieldProps {
  field?: { admin?: { width?: string }; label?: unknown; required?: boolean }
  path: string
}

interface ModelDoc {
  name?: string
}

type SelectOption = { label?: string; value?: string }

/**
 * Model dropdown for the Cars form: Payload's styled select, populated with the
 * selected brand's catalog models. Stores a plain string and resets when the
 * brand changes, while preserving an existing value not in the catalog.
 *
 * @param props - The Payload field component props.
 */
export function ModelField(props: ModelFieldProps): React.JSX.Element {
  const { field, path } = props
  const { setValue, value } = useField<string>({ path })
  const brandId = useFormFields(([fields]) => fields?.brand?.value)
  const [options, setOptions] = useState<string[]>([])

  // Ref so the effect can reset the value without depending on setValue.
  const setValueRef = useRef(setValue)
  setValueRef.current = setValue
  const didMount = useRef(false)
  const prevBrand = useRef<unknown>(undefined)

  useEffect((): (() => void) | void => {
    // Reset the model when the brand actually changes (not on first mount).
    if (didMount.current && prevBrand.current !== brandId) {
      setValueRef.current('')
    }
    prevBrand.current = brandId
    didMount.current = true

    if (!brandId) {
      setOptions([])
      return
    }

    let active = true
    fetch(
      `/api/car-models?where[brand][equals]=${String(brandId)}&depth=0&limit=1000&sort=name`
    )
      .then((res): Promise<{ docs?: ModelDoc[] }> => res.json())
      .then((data): void => {
        if (!active) return
        const names = (data.docs ?? [])
          .map((doc) => doc.name)
          .filter((name): name is string => Boolean(name))
        setOptions([...new Set(names)])
      })
      .catch((): void => {})
    return (): void => {
      active = false
    }
  }, [brandId])

  /**
   * Persist the picked option's value.
   *
   * @param option - The selected react-select option(s).
   */
  const handleChange = (option: unknown): void => {
    const opt = Array.isArray(option) ? option[0] : option
    setValue((opt as SelectOption | null)?.value ?? '')
  }

  const label = typeof field?.label === 'string' ? field.label : 'Model'
  const current = value ?? ''
  const names =
    current && !options.includes(current) ? [current, ...options] : options

  return (
    <SelectInput
      label={label}
      name={path}
      onChange={handleChange}
      options={names.map((name) => ({ label: name, value: name }))}
      path={path}
      placeholder={brandId ? 'Selecciona modelo' : 'Elige una marca primero'}
      readOnly={!brandId}
      required={field?.required}
      style={{ '--field-width': field?.admin?.width } as React.CSSProperties}
      value={current}
    />
  )
}
