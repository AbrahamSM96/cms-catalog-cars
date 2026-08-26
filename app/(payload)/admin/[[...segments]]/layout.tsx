/**
 * The Payload admin reads cookies and queries the database on every request —
 * it is a logged-in application, not a page that can be prerendered. Cache
 * Components would otherwise fail the build trying to produce a static shell
 * for it.
 *
 * This layout exists only to carry that opt-out. Payload generates
 * `page.tsx` and the route group's `layout.tsx` and may rewrite them at any
 * time, so the config lives in a file Payload does not own.
 */
export const instant = false

/**
 * AdminLayout — pass-through wrapper around the generated admin views.
 *
 * @param props - Component props.
 * @param props.children - The Payload admin views.
 */
export default function AdminLayout(props: {
  children: React.ReactNode
}): React.ReactNode {
  return props.children
}
