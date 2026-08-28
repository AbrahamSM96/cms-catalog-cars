'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { useTranslation } from '@payloadcms/ui'

import { fill, pick } from '../i18n/locales'
import { ui } from '../i18n/labels'

/**
 * CopyBtn
 *
 * @param props - Component props.
 * @param props.copiedKey - The key currently marked as copied, if any.
 * @param props.id - The key of the field to copy.
 * @param props.onCopy - Callback invoked to copy the given text.
 * @param props.text - The text to copy.
 */
export function CopyBtn({
  copiedKey,
  id,
  onCopy,
  text,
}: {
  copiedKey: string | null
  id: string
  onCopy: (id: string, text: string) => void
  text: string
}): React.JSX.Element {
  const { i18n } = useTranslation()

  return (
    <button
      aria-label={fill(pick(ui.copyBtn.ariaLabel, i18n.language), {
        field: id,
      })}
      disabled={!text}
      onClick={() => onCopy(id, text)}
      style={{
        background: copiedKey === id ? '#16a34a' : 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        color: copiedKey === id ? '#fff' : 'var(--theme-elevation-800)',
        cursor: text ? 'pointer' : 'not-allowed',
        fontSize: '0.75rem',
        fontWeight: 600,
        opacity: text ? 1 : 0.4,
        padding: '0.25rem 0.6rem',
        whiteSpace: 'nowrap',
      }}
      type="button"
    >
      {copiedKey === id
        ? pick(ui.copyBtn.copied, i18n.language)
        : pick(ui.copyBtn.copy, i18n.language)}
    </button>
  )
}
