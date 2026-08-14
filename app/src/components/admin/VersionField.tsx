'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { SelectInput, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

interface VersionFieldProps {
  field?: { admin?: { width?: string }; label?: unknown; required?: boolean }
  path: string
}

interface ModelDoc {
  id?: number | string
}

interface VersionDoc {
  description?: string
}

type SelectOption = { label?: string; value?: string }

/**
 * Version dropdown for the Cars form: Payload's styled select, populated with
 * the versions for the selected brand + model + year. Stores a plain string and
 * resets whenever brand, model, or year changes.
 *
 * @param props - The Payload field component props.
 */
export function VersionField(props: VersionFieldProps): React.JSX.Element {
  const { field, path } = props
  const { setValue, value } = useField<string>({ path })
  const brandId = useFormFields(([fields]) => fields?.brand?.value)
  const modelName = useFormFields(([fields]) => fields?.model?.value)
  const year = useFormFields(([fields]) => fields?.year?.value)
  const [options, setOptions] = useState<string[]>([])

  const setValueRef = useRef(setValue)
  setValueRef.current = setValue
  const didMount = useRef(false)
  const prevKey = useRef('')

  const key = `${String(brandId)}|${String(modelName)}|${String(year)}`

  useEffect((): (() => void) | void => {
    // Reset the version when brand/model/year changes (not on first mount).
    if (didMount.current && prevKey.current !== key) {
      setValueRef.current('')
    }
    prevKey.current = key
    didMount.current = true

    if (!brandId || !modelName || !year) {
      setOptions([])
      return
    }

    let active = true

    /**
     * Resolve the model id, then load its versions for the selected year.
     */
    const load = async (): Promise<void> => {
      const modelRes = await fetch(
        `/api/car-models?where[and][0][brand][equals]=${String(brandId)}&where[and][1][name][equals]=${encodeURIComponent(String(modelName))}&depth=0&limit=1`
      )
      const modelData = (await modelRes.json()) as { docs?: ModelDoc[] }
      const modelId = modelData.docs?.[0]?.id
      if (!modelId) {
        if (active) setOptions([])
        return
      }

      const versionRes = await fetch(
        `/api/car-versions?where[and][0][model][equals]=${String(modelId)}&where[and][1][years][equals]=${String(year)}&depth=0&limit=1000&sort=description`
      )
      const versionData = (await versionRes.json()) as { docs?: VersionDoc[] }
      if (!active) return
      const descriptions = (versionData.docs ?? [])
        .map((doc) => doc.description)
        .filter((desc): desc is string => Boolean(desc))
      setOptions([...new Set(descriptions)])
    }

    void load().catch((): void => {})
    return (): void => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  /**
   * Persist the picked option's value.
   *
   * @param option - The selected react-select option(s).
   */
  const handleChange = (option: unknown): void => {
    const opt = Array.isArray(option) ? option[0] : option
    setValue((opt as SelectOption | null)?.value ?? '')
  }

  const label = typeof field?.label === 'string' ? field.label : 'Version'
  const ready = Boolean(brandId && modelName && year)
  const current = value ?? ''
  const descriptions =
    current && !options.includes(current) ? [current, ...options] : options

  return (
    <SelectInput
      label={label}
      name={path}
      onChange={handleChange}
      options={descriptions.map((desc) => ({ label: desc, value: desc }))}
      path={path}
      placeholder={
        ready ? 'Selecciona versión' : 'Elige marca, modelo y año primero'
      }
      readOnly={!ready}
      required={field?.required}
      style={{ '--field-width': field?.admin?.width } as React.CSSProperties}
      value={current}
    />
  )
}
