'use client'
/* eslint-disable import/no-extraneous-dependencies */
import { useEffect, useMemo, useState } from 'react'
import { reduceFieldsToValues } from 'payload/shared'
import { useAllFormFields, useTranslation } from '@payloadcms/ui'

import {
  buildMarketplaceDescription,
  buildMarketplaceFields,
  type MarketplaceValues,
} from '../lib/marketplace'
import { fill, pick } from '../i18n/locales'
import { ui } from '../i18n/labels'

import { CopyBtn } from './CopyBtn'

interface FeatureRow {
  feature?: string
}

/**
 * Resolve the `name` of a relationship value (id or populated object) by
 * fetching the referenced collection document. Used for brand and colors.
 *
 * @param collection - The collection slug.
 * @param value - The relationship value (id or populated object).
 */
function useRelationName(collection: string, value: unknown): string {
  const id =
    value &&
      typeof value === 'object' &&
      'value' in (value as Record<string, unknown>)
      ? (value as { value: unknown }).value
      : value

  // Already-populated object with a name: no fetch needed.
  const populatedName =
    typeof id === 'object' && id !== null && 'name' in id
      ? String((id as { name: string }).name)
      : null
  const shouldFetch =
    populatedName === null && id !== undefined && id !== null && id !== ''

  // The fetched name is kept together with the id it belongs to, so a stale
  // name is discarded during render instead of cleared from an effect.
  const [fetched, setFetched] = useState<{ id: unknown; name: string }>({
    id: undefined,
    name: '',
  })

  useEffect(() => {
    if (!shouldFetch) return

    let cancelled = false
    fetch(`/api/${collection}/${id}?depth=0`)
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        if (!cancelled) {
          setFetched({ id, name: doc?.name ? String(doc.name) : '' })
        }
      })
      .catch(() => {
        if (!cancelled) setFetched({ id, name: '' })
      })

    return (): void => {
      cancelled = true
    }
  }, [collection, id, shouldFetch])

  if (populatedName !== null) return populatedName
  return fetched.id === id ? fetched.name : ''
}

/**
 * FacebookMarketplacePanel
 */
export function FacebookMarketplacePanel(): React.JSX.Element {
  const [fields] = useAllFormFields()
  const { i18n } = useTranslation()
  const data = reduceFieldsToValues(fields, true) as Record<string, unknown>

  const brandName = useRelationName('brands', data.brand)
  const exteriorColorName = useRelationName('colors', data.exteriorColor)
  const interiorColorName = useRelationName('colors', data.interiorColor)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const values: MarketplaceValues = useMemo(() => {
    const location =
      (data.location as { city?: string; state?: string } | undefined) ?? {}
    const featuresRaw = data.features
    const features = (
      Array.isArray(featuresRaw) ? (featuresRaw as FeatureRow[]) : []
    )
      .map((f) => f?.feature)
      .filter((f): f is string => Boolean(f))

    return {
      bodyType: data.bodyType as string | undefined,
      brandName,
      city: location.city,
      condition: data.condition as string | undefined,
      exteriorColor: exteriorColorName,
      features,
      fuelType: data.fuelType as string | undefined,
      interiorColor: interiorColorName,
      mileage: data.mileage as number | undefined,
      model: data.model as string | undefined,
      price: data.price as number | undefined,
      state: location.state,
      transmission: data.transmission as string | undefined,
      vehicleType: data.vehicleType as string | undefined,
      year: data.year as number | undefined,
    }
  }, [data, brandName, exteriorColorName, interiorColorName])

  const marketplaceFields = useMemo(
    () => buildMarketplaceFields(values),
    [values]
  )
  const description = useMemo(
    () => buildMarketplaceDescription(values),
    [values]
  )

  const photoCount = useMemo(() => {
    /**
     * count
     *
     * @param key - The key of the field to count.
     */
    const count = (key: string): number => {
      const v = data[key]
      return Array.isArray(v) ? v.length : 0
    }
    return count('images') + count('exteriorImages') + count('interiorImages')
  }, [data])

  /**
   * copy
   *
   * @param key - The key of the field to copy.
   * @param text - The text to copy.
   */
  const copy = async (key: string, text: string): Promise<void> => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
    } catch {
      // clipboard unavailable; silently ignore
    }
  }

  /**
   * copyAllFields
   */
  const copyAllFields = (): void => {
    const text = marketplaceFields
      .filter((f) => f.value)
      .map((f) => `${pick(f.label, i18n.language)}: ${f.value}`)
      .join('\n')
    copy('__all__', text)
  }

  return (
    <div
      style={{
        background: 'var(--theme-elevation-0)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          alignItems: 'center',
          background: '#1877f2',
          color: '#fff',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
        }}
      >
        <strong style={{ fontSize: '0.95rem' }}>
          {pick(ui.marketplacePanel.heading, i18n.language)}
        </strong>
        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
          {fill(
            pick(
              photoCount === 1
                ? ui.marketplacePanel.photoCountSingular
                : ui.marketplacePanel.photoCountPlural,
              i18n.language
            ),
            { count: String(photoCount) }
          )}{' '}
          · {pick(ui.marketplacePanel.uploadNote, i18n.language)}
        </span>
      </div>

      <div style={{ padding: '1rem' }}>
        <p
          style={{
            color: 'var(--theme-elevation-600)',
            fontSize: '0.8rem',
            margin: '0 0 0.75rem',
          }}
        >
          {pick(ui.marketplacePanel.copyInstructions, i18n.language)}
        </p>

        {/* Per-field rows */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}
        >
          {marketplaceFields.map((f) => (
            <div
              key={f.key}
              style={{
                alignItems: 'center',
                background: 'var(--theme-elevation-50)',
                borderRadius: '6px',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'space-between',
                padding: '0.4rem 0.6rem',
              }}
            >
              <span
                style={{
                  color: 'var(--theme-elevation-500)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  minWidth: '130px',
                }}
              >
                {pick(f.label, i18n.language)}
              </span>
              <span
                style={{
                  color: f.value
                    ? 'var(--theme-elevation-900)'
                    : 'var(--theme-elevation-400)',
                  flex: 1,
                  fontSize: '0.85rem',
                }}
              >
                {f.value || pick(ui.marketplacePanel.noData, i18n.language)}
              </span>
              <CopyBtn
                copiedKey={copiedKey}
                id={f.key}
                onCopy={copy}
                text={f.value}
              />
            </div>
          ))}
        </div>

        <button
          onClick={copyAllFields}
          style={{
            background:
              copiedKey === '__all__'
                ? '#16a34a'
                : 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '6px',
            color:
              copiedKey === '__all__' ? '#fff' : 'var(--theme-elevation-800)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginTop: '0.75rem',
            padding: '0.4rem 0.9rem',
          }}
          type="button"
        >
          {copiedKey === '__all__'
            ? pick(ui.copyBtn.copied, i18n.language)
            : pick(ui.marketplacePanel.copyAllFields, i18n.language)}
        </button>

        {/* Description */}
        <div style={{ marginTop: '1.25rem' }}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}
          >
            <strong
              style={{
                color: 'var(--theme-elevation-800)',
                fontSize: '0.85rem',
              }}
            >
              {pick(ui.marketplacePanel.descriptionFor, i18n.language)}
            </strong>
            <CopyBtn
              copiedKey={copiedKey}
              id="__desc__"
              onCopy={copy}
              text={description}
            />
          </div>
          <textarea
            readOnly
            rows={12}
            style={{
              background: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '6px',
              color: 'var(--theme-elevation-900)',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              padding: '0.6rem',
              resize: 'vertical',
              width: '100%',
            }}
            value={description}
          />
          <p
            style={{
              color: 'var(--theme-elevation-400)',
              fontSize: '0.72rem',
              margin: '0.4rem 0 0',
            }}
          >
            {pick(ui.marketplacePanel.comingSoonAI, i18n.language)}
          </p>
        </div>
      </div>
    </div>
  )
}
