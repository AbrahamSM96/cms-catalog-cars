'use client'

import { clsx } from 'clsx'

/**
 * Single map control button.
 *
 * @param props - Component props.
 * @param props.children - The button icon/content.
 * @param props.disabled - Whether the button is disabled.
 * @param props.label - Accessible label for the button.
 * @param props.onClick - Callback invoked when the button is pressed.
 * @returns The control button element.
 */
function ControlButton({
  children,
  disabled = false,
  label,
  onClick,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  disabled?: boolean
}): React.JSX.Element {
  return (
    <button
      aria-label={label}
      className={clsx(
        'flex size-8 items-center justify-center transition-colors',
        'first:rounded-t-md last:rounded-b-md',
        'hover:bg-accent dark:hover:bg-accent/40',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset',
        'disabled:pointer-events-none disabled:opacity-50'
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export { ControlButton }
