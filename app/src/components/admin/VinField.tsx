'use client'

/* eslint-disable import/no-extraneous-dependencies */
import {
  TextInput,
  useAllFormFields,
  useDocumentInfo,
  useField,
  useForm,
  useTranslation,
} from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import { useState } from 'react'

import type { Translated } from '../../i18n/locales'

import { pick } from '../../i18n/locales'
import { publishSuggestions } from './vin-suggestions'
import { ui } from '../../i18n/labels'

/**
 * Confidence the server attached to a proposed value.
 */
type Confidence = 'exact' | 'guess' | 'inferred'

interface Suggestion {
  confidence: Confidence
  display?: string
  label: Translated
  path: string
  value: number | string | string[]
}

type DecodeReason =
  | 'forbidden'
  | 'invalid-vin'
  | 'not-found'
  | 'rate-limited'
  | 'unavailable'

interface DecodeResponse {
  duplicate?: { id: number | string; title: string } | null
  ok?: boolean
  reason?: DecodeReason
  suggestions?: Suggestion[]
}

/** One row of the `features` array as the form holds it. */
interface FeatureRow {
  feature?: string
}

interface VinFieldProps {
  field?: {
    admin?: { placeholder?: Record<string, string> | string }
    label?: unknown
  }
  path: string
}

/**
 * Fields that clear themselves when the brand, model or year changes. Their
 * values are handed over through `vin-suggestions` instead of being written
 * directly, or the reset would swallow them.
 */
const CASCADING_PATHS = new Set(['model', 'version'])

/**
 * The message each failure gets. A caller who hit the rate limit is told the
 * service did not answer: from the editor's seat that is the same situation,
 * and "you are going too fast" invites them to keep clicking.
 */
const REASON_MESSAGES: Record<DecodeReason, Translated> = {
  forbidden: ui.vinPanel.errors.forbidden,
  'invalid-vin': ui.vinPanel.errors.invalidVin,
  'not-found': ui.vinPanel.errors.notFound,
  'rate-limited': ui.vinPanel.errors.unavailable,
  unavailable: ui.vinPanel.errors.unavailable,
}

/** Badge colour per confidence, in the admin's own palette. */
const BADGE_COLORS: Record<Confidence, string> = {
  exact: 'var(--theme-success-500)',
  guess: 'var(--theme-warning-500)',
  inferred: 'var(--theme-elevation-400)',
}

/**
 * VIN panel for the Cars form: decodes the serial number and proposes values
 * for the fields it can fill.
 *
 * Nothing is written until the editor applies it, and nothing is saved until
 * they save the document — the decode is a suggestion, not an import.
 *
 * @param props - The Payload field component props.
 */
export function VinField(props: VinFieldProps): React.JSX.Element {
  const { field, path } = props
  const { setValue, value } = useField<string>({ path })
  const { addFieldRow, dispatchFields } = useForm()
  const { id } = useDocumentInfo()
  const { i18n } = useTranslation()
  const [fields] = useAllFormFields()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Translated | null>(null)
  const [duplicate, setDuplicate] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)
  const [skipped, setSkipped] = useState<Set<string>>(new Set())

  const current = reduceFieldsToValues(fields, true) as Record<string, unknown>
  const vin = value ?? ''

  /**
   * Ask the server to decode the VIN currently in the field.
   */
  const decode = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    setDuplicate(null)
    setSuggestions(null)

    try {
      const response = await fetch('/api/cars/decode-vin', {
        body: JSON.stringify({ carId: id, vin }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const body = (await response.json()) as DecodeResponse

      if (!body.ok) {
        setError(REASON_MESSAGES[body.reason ?? 'unavailable'])
        return
      }

      setSuggestions(body.suggestions ?? [])
      setSkipped(new Set())
      if (body.duplicate) setDuplicate(body.duplicate.title)
    } catch {
      setError(ui.vinPanel.errors.unavailable)
    } finally {
      setBusy(false)
    }
  }

  /**
   * Append rows to an array field, skipping the ones already listed.
   *
   * An array field is not a value the form can be handed — it is a set of rows
   * — so these go in through the form's own row API. Existing rows are left
   * alone: whatever the editor already wrote outranks a decode.
   *
   * @param fieldPath - The array field's path, e.g. `features`.
   * @param rows - The values to append, one row each.
   */
  const appendRows = (fieldPath: string, rows: string[]): void => {
    const currentRows = current[fieldPath]
    const existing = new Set(
      (Array.isArray(currentRows) ? (currentRows as FeatureRow[]) : [])
        .map((row) => row?.feature)
        .filter((feature): feature is string => Boolean(feature))
    )

    let index = existing.size
    for (const row of rows) {
      if (existing.has(row)) continue
      addFieldRow({
        path: fieldPath,
        rowIndex: index,
        schemaPath: `cars.${fieldPath}`,
        subFieldState: {
          feature: { initialValue: row, valid: true, value: row },
        },
      })
      index += 1
    }
  }

  /**
   * Write the checked proposals into the form.
   *
   * The cascading fields are handed their value instead of being written to,
   * because setting the brand and the year makes them clear themselves first.
   */
  const apply = (): void => {
    const chosen = (suggestions ?? []).filter((s) => !skipped.has(s.path))
    const now = Date.now()

    const handed: Record<string, string> = {}
    for (const suggestion of chosen) {
      if (CASCADING_PATHS.has(suggestion.path)) {
        handed[suggestion.path] = String(suggestion.value)
      }
    }
    publishSuggestions(handed, now)

    for (const suggestion of chosen) {
      if (Array.isArray(suggestion.value)) {
        appendRows(suggestion.path, suggestion.value)
        continue
      }
      dispatchFields({ path: suggestion.path, type: 'UPDATE', value: suggestion.value })
    }

    setSuggestions(null)
  }

  /**
   * Toggle whether one proposal will be applied.
   *
   * @param fieldPath - The proposal's field path.
   */
  const toggle = (fieldPath: string): void => {
    setSkipped((previous) => {
      const next = new Set(previous)
      if (next.has(fieldPath)) next.delete(fieldPath)
      else next.add(fieldPath)
      return next
    })
  }

  const label = typeof field?.label === 'string' ? field.label : 'VIN'

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ alignItems: 'flex-end', display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <TextInput
            label={label}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              setValue(event.target.value.toUpperCase())
            }
            path={path}
            placeholder={field?.admin?.placeholder}
            value={vin}
          />
        </div>
        <button
          disabled={busy || vin.length === 0}
          onClick={(): void => {
            void decode()
          }}
          style={{
            background: 'var(--theme-elevation-800)',
            border: 'none',
            borderRadius: '6px',
            color: 'var(--theme-elevation-0)',
            cursor: busy ? 'progress' : 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            opacity: vin.length === 0 ? 0.5 : 1,
            padding: '0.55rem 1.1rem',
          }}
          type="button"
        >
          {pick(busy ? ui.vinPanel.decoding : ui.vinPanel.decode, i18n.language)}
        </button>
      </div>

      <p
        style={{
          color: 'var(--theme-elevation-500)',
          fontSize: '0.78rem',
          margin: '0 0 0.5rem',
        }}
      >
        {pick(ui.vinPanel.intro, i18n.language)}
      </p>

      {error ? (
        <p
          style={{
            color: 'var(--theme-error-500)',
            fontSize: '0.82rem',
            margin: '0.25rem 0',
          }}
        >
          {pick(error, i18n.language)}
        </p>
      ) : null}

      {duplicate ? (
        <p
          style={{
            color: 'var(--theme-warning-500)',
            fontSize: '0.82rem',
            margin: '0.25rem 0',
          }}
        >
          {`${pick(ui.vinPanel.duplicate, i18n.language)} (${duplicate})`}
        </p>
      ) : null}

      {suggestions !== null && suggestions.length === 0 ? (
        <p
          style={{
            color: 'var(--theme-elevation-500)',
            fontSize: '0.82rem',
            margin: '0.25rem 0',
          }}
        >
          {pick(ui.vinPanel.noSuggestions, i18n.language)}
        </p>
      ) : null}

      {suggestions !== null && suggestions.length > 0 ? (
        <div
          style={{
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '8px',
            marginTop: '0.75rem',
            padding: '0.85rem',
          }}
        >
          <strong
            style={{
              color: 'var(--theme-elevation-800)',
              display: 'block',
              fontSize: '0.85rem',
              marginBottom: '0.6rem',
            }}
          >
            {pick(ui.vinPanel.suggestionsHeading, i18n.language)}
          </strong>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
          >
            {suggestions.map((suggestion) => {
              const now = current[suggestion.path]
              const shown = suggestion.display ?? String(suggestion.value)

              return (
                <label
                  key={suggestion.path}
                  style={{
                    alignItems: 'center',
                    background: 'var(--theme-elevation-50)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '0.7rem',
                    padding: '0.4rem 0.6rem',
                  }}
                >
                  <input
                    checked={!skipped.has(suggestion.path)}
                    onChange={(): void => toggle(suggestion.path)}
                    type="checkbox"
                  />
                  <span
                    style={{
                      color: 'var(--theme-elevation-500)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      minWidth: '120px',
                    }}
                  >
                    {pick(suggestion.label, i18n.language)}
                  </span>
                  <span
                    style={{
                      color: 'var(--theme-elevation-400)',
                      fontSize: '0.75rem',
                      minWidth: '90px',
                    }}
                  >
                    {`${pick(ui.vinPanel.current, i18n.language)}: ${
                      now === undefined || now === null || now === ''
                        ? pick(ui.vinPanel.empty, i18n.language)
                        : String(now)
                    }`}
                  </span>
                  <span
                    style={{
                      color: 'var(--theme-elevation-900)',
                      flex: 1,
                      fontSize: '0.85rem',
                    }}
                  >
                    {shown}
                  </span>
                  <span
                    style={{
                      color: BADGE_COLORS[suggestion.confidence],
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {pick(
                      ui.vinPanel.confidence[suggestion.confidence],
                      i18n.language
                    )}
                  </span>
                </label>
              )
            })}
          </div>

          <button
            onClick={apply}
            style={{
              background: 'var(--theme-success-500)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginTop: '0.75rem',
              padding: '0.45rem 1rem',
            }}
            type="button"
          >
            {pick(ui.vinPanel.apply, i18n.language)}
          </button>
        </div>
      ) : null}
    </div>
  )
}
