import clsx from 'clsx'

type BadgeVariant = 'glass' | 'solid'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  /** Shows the pulsing accent dot before the content. */
  dot?: boolean
  /** `solid` = opaque white card; `glass` = translucent with neon outline. */
  variant?: BadgeVariant
}

const VARIANTS: Record<BadgeVariant, string> = {
  glass:
    'neon-border gap-2.5 border-slate-900/10 bg-white/70 px-5 py-2 backdrop-blur-sm',
  solid: 'shadow-soft gap-2 border-slate-200 bg-white px-4 py-2',
}

/**
 * Rounded pill used for section eyebrows and status labels.
 * @param props - Component props.
 */
export function Badge(props: BadgeProps): React.JSX.Element {
  const { children, className, dot = false, variant = 'solid' } = props

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-full border',
        VARIANTS[variant],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
        </span>
      )}
      {children}
    </div>
  )
}
