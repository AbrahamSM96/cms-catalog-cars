'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { SelectInput, useField, useTranslation } from '@payloadcms/ui'

import type { Translated } from '../../i18n/locales'
import { pick } from '../../i18n/locales'

interface TimeFieldProps {
  field?: {
    admin?: { description?: unknown; width?: string }
    label?: unknown
    required?: boolean
  }
  path: string
}

interface TimeOption {
  label: string
  value: string
}

/** Granularity of the dropdown. 15 covers real opening times (09:30, 14:45). */
const STEP_MINUTES = 15

const MINUTES_IN_DAY = 24 * 60

/**
 * Every "HH:MM" of the day at `STEP_MINUTES` increments.
 *
 * Labels are the 24-hour value itself, so the dropdown reads the same on every
 * machine — a native `<input type="time">` would fall back to the operating
 * system locale and show AM/PM on an English install.
 */
function buildOptions(): TimeOption[] {
  const options: TimeOption[] = []

  for (let mins = 0; mins < MINUTES_IN_DAY; mins += STEP_MINUTES) {
    const value = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(
      mins % 60
    ).padStart(2, '0')}`

    options.push({ label: value, value })
  }

  return options
}

const OPTIONS = buildOptions()

/**
 * Resolve a Payload field label, which may arrive as a plain string or as one
 * of our `msg()` translation records.
 *
 * @param label - The raw label from the field config.
 * @param language - The admin language, from `useTranslation()`.
 */
function resolveLabel(label: unknown, language: string): string {
  if (typeof label === 'string') return label
  if (label && typeof label === 'object') {
    return pick(label as Translated, language)
  }

  return ''
}

/**
 * Opening/closing time picker for the dealership schedule.
 *
 * The value stays a "HH:MM" string in a text column — the contract
 * `lib/hours.ts` parses to decide whether a dealership is open right now — so
 * this is a UI change only: no migration, and no timezone shifting the way a
 * `date` field storing a timestamp would.
 *
 * Picking from a list also means the stored value cannot be a typo like "9am",
 * which `parseTime()` rejects, silently breaking the open/closed badge on the
 * public site.
 *
 * @param props - The Payload field component props.
 */
export function TimeField(props: TimeFieldProps): React.JSX.Element {
  const { field, path } = props
  const { setValue, value } = useField<string>({ path })
  const { i18n } = useTranslation()

  /**
   * Store the picked "HH:MM", or clear the field when the select is emptied.
   *
   * @param option - The selected react-select option(s).
   */
  const handleChange = (option: unknown): void => {
    const opt = Array.isArray(option) ? option[0] : option
    const raw = (opt as TimeOption | null)?.value

    setValue(raw ?? null)
  }

  // A time saved before this component existed (or through the API) may not sit
  // on the 15-minute grid. Offer it as an option so opening the document does
  // not blank it out.
  const options =
    value && !OPTIONS.some((option) => option.value === value)
      ? [{ label: value, value }, ...OPTIONS]
      : OPTIONS

  return (
    <SelectInput
      label={resolveLabel(field?.label, i18n.language)}
      name={path}
      onChange={handleChange}
      options={options}
      path={path}
      placeholder="--:--"
      required={field?.required}
      style={{ '--field-width': field?.admin?.width } as React.CSSProperties}
      value={value ?? ''}
    />
  )
}
