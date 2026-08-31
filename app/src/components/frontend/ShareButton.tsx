'use client'

import { Share } from 'lucide-react'
import { useState } from 'react'

import { ShareSheet } from './ShareSheet'

interface ShareButtonProps {
  text: string
  title: string
}

/**
 * ShareButton
 *
 * Uses the device's native share sheet when available (`navigator.share`),
 * and falls back to an in-page sheet that mirrors that same experience.
 *
 * @param props - Component props.
 */
export function ShareButton(props: ShareButtonProps): React.JSX.Element {
  const { text, title } = props
  const [url, setUrl] = useState('')

  /**
   * Opens the native share sheet, or ours when the browser has none.
   */
  const handleShare = (): void => {
    const href = window.location.href
    const payload = { text, title, url: href }

    // Prefer the device's own share sheet whenever the browser exposes it.
    if (typeof navigator.share === 'function') {
      navigator.share(payload).catch((error: unknown): void => {
        // The user dismissing the native sheet is not a failure.
        if (error instanceof Error && error.name === 'AbortError') return
        setUrl(href)
      })
      return
    }

    setUrl(href)
  }

  return (
    <>
      <button
        aria-label="Compartir"
        className="shadow-soft flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 active:bg-slate-50"
        onClick={handleShare}
        type="button"
      >
        <Share aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
        <span className="hidden sm:inline">Compartir</span>
      </button>

      {url !== '' && (
        <ShareSheet
          onClose={(): void => {
            setUrl('')
          }}
          text={text}
          title={title}
          url={url}
        />
      )}
    </>
  )
}
