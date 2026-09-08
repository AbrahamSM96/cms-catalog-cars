/* eslint-disable import/no-extraneous-dependencies */
'use client'

import { useField } from '@payloadcms/ui'

/**
 * MileageDescription
 */
export function MileageDescription(): React.JSX.Element | null {
  const { value } = useField<number>()

  if (!value || value === 0) return null

  const formatted = new Intl.NumberFormat('en-US').format(value)

  return (
    <div
      style={{
        backgroundColor: '#f0fdf4',
        borderLeft: '3px solid #22c55e',
        borderRadius: '4px',
        marginTop: '0.5rem',
        padding: '0.75rem',
      }}
    >
      <strong style={{ color: '#15803d', fontSize: '1.1rem' }}>
        {formatted} km
      </strong>
    </div>
  )
}
