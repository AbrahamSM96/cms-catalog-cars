'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { useField } from '@payloadcms/ui'

/**
 * PriceDescription
 */
export function PriceDescription(): React.JSX.Element | null {
  const { value } = useField<number>()

  if (!value || value === 0) return null

  const formatted = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(value)

  return (
    <div
      style={{
        backgroundColor: '#f0f9ff',
        borderLeft: '3px solid #0ea5e9',
        borderRadius: '4px',
        marginTop: '0.5rem',
        padding: '0.75rem',
      }}
    >
      <strong style={{ color: '#0369a1', fontSize: '1.1rem' }}>
        {formatted}
      </strong>
    </div>
  )
}
