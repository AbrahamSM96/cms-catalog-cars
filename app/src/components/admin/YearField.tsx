'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { SelectInput, useField } from '@payloadcms/ui'

interface YearFieldProps {
  field?: { admin?: { width?: string }; label?: unknown; required?: boolean }
  path: string
}

type SelectOption = { label?: string; value?: string }

const START_YEAR = 2018

/**
 * Year dropdown for the Cars form: Payload's styled select from 2018 to next
 * year, computed at render so the range extends automatically every year.
 *
 * @param props - The Payload field component props.
 */
export function YearField(props: YearFieldProps): React.JSX.Element {
  const { field, path } = props
  const { setValue, value } = useField<number>({ path })

  const maxYear = new Date().getFullYear() + 1
  const years = Array.from(
    { length: maxYear - START_YEAR + 1 },
    (_, i) => maxYear - i
  )
  // Keep any out-of-range existing value visible.
  if (typeof value === 'number' && !years.includes(value)) {
    years.push(value)
    years.sort((a, b) => b - a)
  }

  /**
   * Persist the picked year as a number.
   *
   * @param option - The selected react-select option(s).
   */
  const handleChange = (option: unknown): void => {
    const opt = Array.isArray(option) ? option[0] : option
    const picked = (opt as SelectOption | null)?.value
    setValue(picked ? Number(picked) : null)
  }

  const label = typeof field?.label === 'string' ? field.label : 'Year'

  return (
    <SelectInput
      label={label}
      name={path}
      onChange={handleChange}
      options={years.map((y) => ({ label: String(y), value: String(y) }))}
      path={path}
      placeholder="Selecciona año"
      required={field?.required}
      style={{ '--field-width': field?.admin?.width } as React.CSSProperties}
      value={typeof value === 'number' ? String(value) : ''}
    />
  )
}
