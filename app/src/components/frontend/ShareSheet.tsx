'use client'

import clsx from 'clsx'
import { Check, Copy, Link2, Mail, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ShareSheetProps {
  onClose: () => void
  text: string
  title: string
  url: string
}

interface ShareTarget {
  bg: string
  href: (url: string, text: string) => string
  icon: React.ReactNode
  label: string
}

const SHARE_TARGETS: ShareTarget[] = [
  {
    bg: 'bg-[#25D366]',
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    icon: (
      <svg
        aria-hidden="true"
        className="h-8 w-8 fill-white"
        viewBox="0 0 24 24"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
    label: 'WhatsApp',
  },
  {
    bg: 'bg-white ring-1 ring-slate-900/10',
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg
        aria-hidden="true"
        className="h-9 w-9 fill-[#1877F2]"
        viewBox="0 0 24 24"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    label: 'Facebook',
  },
  {
    bg: 'bg-white ring-1 ring-slate-900/10',
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    icon: (
      <svg
        aria-hidden="true"
        className="h-9 w-9 fill-[#229ED9]"
        viewBox="0 0 24 24"
      >
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    label: 'Telegram',
  },
  {
    bg: 'bg-black',
    href: (url, text) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    icon: (
      <svg
        aria-hidden="true"
        className="h-7 w-7 fill-white"
        viewBox="0 0 24 24"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: 'X',
  },
]

/**
 * Native-feeling share sheet, used when the device has no `navigator.share`.
 * Mirrors the iOS share sheet: translucent card, app row and action row.
 *
 * @param props - Component props.
 */
export function ShareSheet(props: ShareSheetProps): React.JSX.Element | null {
  const { onClose, text, title, url } = props
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame((): void => {
      setVisible(true)
    })
    return (): void => {
      cancelAnimationFrame(frame)
    }
  }, [])

  /**
   * Plays the exit transition before unmounting the sheet.
   */
  const close = useCallback((): void => {
    setVisible(false)
    window.setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    /**
     * Closes the sheet on Escape.
     * @param event - The keyboard event.
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return (): void => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close])

  if (typeof document === 'undefined') return null

  const host = url.replace(/^https?:\/\//, '').split('/')[0]

  /**
   * Copies the link and shows the confirmation state.
   */
  const handleCopy = (): void => {
    void navigator.clipboard?.writeText(url)
    setCopied(true)
    window.setTimeout((): void => {
      setCopied(false)
    }, 1800)
  }

  /**
   * Opens a share target in a new tab and dismisses the sheet.
   * @param href - The share URL to open.
   */
  const handleOpen = (href: string): void => {
    window.open(href, '_blank', 'noopener,noreferrer')
    close()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        aria-label="Cerrar"
        className={clsx(
          'absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={close}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-labelledby="share-sheet-title"
        aria-modal="true"
        className={clsx(
          'relative m-2 w-full max-w-md origin-bottom overflow-hidden rounded-[26px] bg-white/85 shadow-2xl ring-1 ring-slate-900/10 backdrop-blur-2xl transition duration-300 ease-out motion-reduce:transition-none sm:m-0',
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-8 scale-[0.98] opacity-0',
        )}
        role="dialog"
      >
        {/* Preview header: what is being shared */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-slate-900 text-white">
            <Link2 aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className="truncate text-[15px] font-semibold text-slate-900"
              id="share-sheet-title"
            >
              {title}
            </p>
            <p className="truncate text-sm text-slate-500">{host}</p>
          </div>
          <button
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-900/8 text-slate-500 transition-colors hover:bg-slate-900/12 hover:text-slate-700"
            onClick={close}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>

        <div className="h-px bg-slate-900/10" />

        {/* App row */}
        <div className="flex gap-4 overflow-x-auto px-5 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SHARE_TARGETS.map((target) => (
            <button
              className="group flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1.5"
              key={target.label}
              onClick={(): void => {
                handleOpen(target.href(url, text))
              }}
              type="button"
            >
              <span
                className={clsx(
                  'flex h-15 w-15 items-center justify-center rounded-[18px] shadow-sm transition-transform duration-150 group-active:scale-95',
                  target.bg,
                )}
              >
                {target.icon}
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium text-slate-700">
                {target.label}
              </span>
            </button>
          ))}
        </div>

        <div className="h-px bg-slate-900/10" />

        {/* Action row */}
        <div className="flex gap-4 px-5 py-4">
          <button
            className="group flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1.5"
            onClick={handleCopy}
            type="button"
          >
            <span className="flex h-15 w-15 items-center justify-center rounded-full bg-slate-900/8 text-slate-700 transition-transform duration-150 group-active:scale-95">
              {copied ? (
                <Check
                  aria-hidden="true"
                  className="h-6 w-6 text-accent-600"
                  strokeWidth={2}
                />
              ) : (
                <Copy aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
              )}
            </span>
            <span className="w-full truncate text-center text-[11px] font-medium text-slate-700">
              {copied ? 'Copiado' : 'Copiar'}
            </span>
          </button>

          <button
            className="group flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1.5"
            onClick={(): void => {
              handleOpen(
                `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
              )
            }}
            type="button"
          >
            <span className="flex h-15 w-15 items-center justify-center rounded-full bg-slate-900/8 text-slate-700 transition-transform duration-150 group-active:scale-95">
              <Mail aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="w-full truncate text-center text-[11px] font-medium text-slate-700">
              Correo
            </span>
          </button>
        </div>

        <div className="h-px bg-slate-900/10" />

        <button
          className="w-full cursor-pointer px-5 py-4 text-[15px] font-semibold text-slate-600 transition-colors hover:bg-slate-900/4 active:bg-slate-900/8"
          onClick={close}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </div>,
    document.body,
  )
}
