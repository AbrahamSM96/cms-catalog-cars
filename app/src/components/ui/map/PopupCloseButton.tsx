'use client'

import { X } from 'lucide-react'

/**
 * Close button rendered inside popups.
 *
 * @param props - Component props.
 * @param props.onClick - Callback invoked when the button is pressed.
 * @returns The close button element.
 */
function PopupCloseButton({
  onClick,
}: {
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      aria-label="Close popup"
      className="absolute top-1 right-1 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      onClick={onClick}
      type="button"
    >
      <X className="size-3.5" />
    </button>
  )
}

export { PopupCloseButton }
