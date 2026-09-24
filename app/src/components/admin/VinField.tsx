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

import { ui } from '../../i18n/labels'
import { fill, pick } from '../../i18n/locales'
import type { Translated } from '../../i18n/locales'

import { publishSuggestions } from './vin-suggestions'

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
  inferred: 'var(--theme-elevation-600)',
}

/**
 * VIN panel for the Cars form: decodes the serial number and proposes values
 * for the fields it can fill.
 *
 * Nothing is written until the editor applies it, and nothing is saved until
 * they save the document — the decode is a suggestion, not an import.
 *
 * All of the layout lives in `vin.css` — the input row and the suggestion
 * list both. The only inline style left is the confidence badge's colour,
 * which is data, not layout.
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
    <div className="vin-panel">
      <div className="vin-panel__row">
        <div className="vin-panel__field">
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
          className="vin-panel__decode"
          data-busy={busy}
          disabled={busy || vin.length === 0}
          onClick={(): void => {
            void decode()
          }}
          type="button"
        >
          {pick(busy ? ui.vinPanel.decoding : ui.vinPanel.decode, i18n.language)}
        </button>
      </div>

      <div className="vin-panel__notes">
        <p className="vin-panel__note">{pick(ui.vinPanel.intro, i18n.language)}</p>
        <p className="vin-panel__note">{pick(ui.vinPanel.scope, i18n.language)}</p>
      </div>

      {error ? (
        <p className="vin-panel__message vin-panel__message--error">
          {pick(error, i18n.language)}
        </p>
      ) : null}

      {duplicate ? (
        <p className="vin-panel__message vin-panel__message--warning">
          {`${pick(ui.vinPanel.duplicate, i18n.language)} (${duplicate})`}
        </p>
      ) : null}

      {suggestions !== null && suggestions.length === 0 ? (
        <p className="vin-panel__message vin-panel__message--muted">
          {pick(ui.vinPanel.noSuggestions, i18n.language)}
        </p>
      ) : null}

      {suggestions !== null && suggestions.length > 0 ? (
        <div className="vin-panel__suggestions">
          <div className="vin-panel__suggestions-header">
            <strong className="vin-panel__suggestions-heading">
              {pick(ui.vinPanel.suggestionsHeading, i18n.language)}
            </strong>
            <span className="vin-panel__suggestions-count">
              {fill(pick(ui.vinPanel.selectedCount, i18n.language), {
                chosen: String(suggestions.length - skipped.size),
                total: String(suggestions.length),
              })}
            </span>
          </div>

          <div className="vin-panel__suggestion-list">
            {suggestions.map((suggestion) => {
              const now = current[suggestion.path]
              const shown = suggestion.display ?? String(suggestion.value)

              return (
                <label
                  className="vin-panel__suggestion"
                  data-skipped={skipped.has(suggestion.path)}
                  key={suggestion.path}
                >
                  <input
                    checked={!skipped.has(suggestion.path)}
                    className="vin-panel__suggestion-check"
                    onChange={(): void => toggle(suggestion.path)}
                    type="checkbox"
                  />
                  <span className="vin-panel__suggestion-label">
                    {pick(suggestion.label, i18n.language)}
                  </span>
                  <span className="vin-panel__suggestion-now">
                    {`${pick(ui.vinPanel.current, i18n.language)}: ${now === undefined || now === null || now === ''
                      ? pick(ui.vinPanel.empty, i18n.language)
                      : String(now)
                      }`}
                  </span>
                  <span className="vin-panel__suggestion-value">{shown}</span>
                  <span
                    className="vin-panel__suggestion-badge"
                    style={
                      {
                        '--badge-color': BADGE_COLORS[suggestion.confidence],
                      } as React.CSSProperties
                    }
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
            className="vin-panel__apply"
            disabled={skipped.size === suggestions.length}
            onClick={apply}
            type="button"
          >
            {pick(ui.vinPanel.apply, i18n.language)}
          </button>
        </div>
      ) : null}
    </div>
  )
}
