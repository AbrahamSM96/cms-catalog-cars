'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  SelectInput,
  useAllFormFields,
  useField,
  useForm,
  useFormFields,
  useTranslation,
} from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import { useEffect, useRef, useState } from 'react'

import type { VersionDoc, VersionOption } from '../../lib/car-versions'

import { buildVersionOptions } from '../../lib/car-versions'
import { parseVersionDescription } from '../../lib/version-specs'
import { pick } from '../../i18n/locales'
import { takeSuggestion } from './vin-suggestions'
import { ui } from '../../i18n/labels'

interface VersionFieldProps {
  field?: { admin?: { width?: string }; label?: unknown; required?: boolean }
  path: string
}

interface ModelDoc {
  id?: number | string
}

/** One row of the `features` array as the form holds it. */
interface FeatureRow {
  feature?: string
}

type SelectOption = { label?: string; value?: string }

/**
 * Version dropdown for the Cars form: Payload's styled select, populated with
 * the versions of the selected brand + model. Stores a plain string and resets
 * whenever brand, model, or year changes.
 *
 * Every version of the model is fetched, not just the ones tagged with this
 * car's year, and `buildVersionOptions` decides what to show: the exact year
 * when the catalogue has it, the nearest years labelled with where they came
 * from when it does not. See `lib/car-versions.ts` for why.
 *
 * Picking a version also fills in the specs its description already states —
 * occupants, doors, cylinders, gearbox and equipment. For cars sold in Mexico
 * this catalogue knows more than a VIN decoder does, so the pick is worth
 * mining. The specs follow the version on every pick; the equipment rows are
 * only ever appended, since the editor may have added their own.
 *
 * @param props - The Payload field component props.
 */
export function VersionField(props: VersionFieldProps): React.JSX.Element {
  const { field, path } = props
  const { setValue, value } = useField<string>({ path })
  const { addFieldRow, dispatchFields } = useForm()
  const [allFields] = useAllFormFields()
  const { i18n } = useTranslation()
  const brandId = useFormFields(([fields]) => fields?.brand?.value)
  const modelName = useFormFields(([fields]) => fields?.model?.value)
  const year = useFormFields(([fields]) => fields?.year?.value)
  const vin = useFormFields(([fields]) => fields?.vin?.value)
  const [options, setOptions] = useState<VersionOption[]>([])

  const formValues = reduceFieldsToValues(allFields, true) as Record<
    string,
    unknown
  >
  const currentFeatures = formValues.features

  const setValueRef = useRef(setValue)
  setValueRef.current = setValue
  // Assigned further down, once the specs helpers exist. The version restored
  // from a VIN decode has to be mined too, and that happens inside the effect.
  const applySpecsRef = useRef<(description: string) => void>(() => {})
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
     * Resolve the model id, then load every version it has.
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
        `/api/car-versions?where[model][equals]=${String(modelId)}&depth=0&limit=1000&sort=description`
      )
      const versionData = (await versionRes.json()) as { docs?: VersionDoc[] }
      if (!active) return

      const built = buildVersionOptions({
        docs: versionData.docs ?? [],
        year: Number(year),
      })
      setOptions(built)

      // A VIN decode may have left a version behind for this brand, model and
      // year; the reset above just wiped it, so it is restored now that the
      // options are in.
      const suggested = takeSuggestion('version', Date.now())
      if (
        suggested !== undefined &&
        built.some((option) => option.value === suggested)
      ) {
        setValueRef.current(suggested)
        // The VIN gave us the version; the version gives us the rest.
        applySpecsRef.current(suggested)
      }
    }

    void load().catch((): void => {})
    return (): void => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  /**
   * Write a spec the version states.
   *
   * These follow the version rather than being filled only when empty: picking
   * a different version is the editor saying this is a different car, so a
   * gearbox or door count left over from the previous pick would be wrong.
   * A spec the description does not state is left alone.
   *
   * @param fieldPath - The field to set.
   * @param next - The value the catalogue states, or null when it states none.
   */
  const setFromVersion = (
    fieldPath: string,
    next: number | string | null
  ): void => {
    if (next === null) return
    dispatchFields({ path: fieldPath, type: 'UPDATE', value: next })
  }

  /**
   * Append equipment rows the car does not already list.
   *
   * @param rows - The equipment named by the version description.
   */
  const appendFeatures = (rows: string[]): void => {
    const existing = new Set(
      (Array.isArray(currentFeatures) ? (currentFeatures as FeatureRow[]) : [])
        .map((row) => row?.feature)
        .filter((feature): feature is string => Boolean(feature))
    )

    let index = existing.size
    for (const row of rows) {
      if (existing.has(row)) continue
      addFieldRow({
        path: 'features',
        rowIndex: index,
        schemaPath: 'cars.features',
        subFieldState: {
          feature: { initialValue: row, valid: true, value: row },
        },
      })
      index += 1
    }
  }

  /**
   * Mine a version description for every spec it states and write them.
   *
   * @param description - The catalogue version description.
   */
  const applyVersionSpecs = (description: string): void => {
    const specs = parseVersionDescription(description)
    setFromVersion('transmission', specs.transmission)
    setFromVersion('passengers', specs.passengers)
    setFromVersion('doors', specs.doors)
    setFromVersion('cylinders', specs.cylinders)
    appendFeatures(specs.features)
  }

  /**
   * Persist the picked version and mine its description for the specs it
   * already states, so the editor does not retype what the catalogue knows.
   *
   * @param option - The selected react-select option(s).
   */
  const handleChange = (option: unknown): void => {
    const opt = Array.isArray(option) ? option[0] : option
    const picked = (opt as SelectOption | null)?.value ?? ''
    setValue(picked)

    if (!picked) return
    applyVersionSpecs(picked)
  }
  applySpecsRef.current = applyVersionSpecs

  const label = typeof field?.label === 'string' ? field.label : 'Version'
  const ready = Boolean(brandId && modelName && year)
  // A VIN identifies the unit on its own, so the version stops being required
  // (see `validateVersion` in Cars.ts). The field config cannot express that —
  // `required` there is a static boolean that would also make the column NOT
  // NULL — so the asterisk is decided here, and it tracks the same rule the
  // validator enforces.
  const required = !vin
  const current = value ?? ''
  // A saved version the catalogue no longer lists still has to be selectable,
  // or opening an old car would silently blank its version.
  const shown =
    current && !options.some((option) => option.value === current)
      ? [{ label: current, value: current }, ...options]
      : options

  return (
    <SelectInput
      label={label}
      name={path}
      onChange={handleChange}
      options={shown}
      path={path}
      placeholder={
        ready
          ? pick(ui.fields.selectVersion, i18n.language)
          : pick(ui.fields.pickBrandModelYearFirst, i18n.language)
      }
      readOnly={!ready}
      required={required}
      style={{ '--field-width': field?.admin?.width } as React.CSSProperties}
      value={current}
    />
  )
}
