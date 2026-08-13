'use client'

/**
 * Visual container that groups map control buttons into a single card.
 *
 * @param props - Component props.
 * @param props.children - The control buttons to render.
 * @returns The control group element.
 */
function ControlGroup({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border">
      {children}
    </div>
  )
}

export { ControlGroup }
