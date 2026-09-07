/**
 * Payload owns `page.tsx` and the route group's `layout.tsx` and may rewrite
 * them at any time, so anything of ours lives here instead: the Cache
 * Components opt-out below, and the admin stylesheets.
 *
 * Order matters — `theme.css` declares the tokens the other two consume. The
 * screen-specific sheets are scoped to classes Payload only renders on their
 * own route, so loading all three everywhere is harmless.
 */
import '@/components/admin/theme.css'
import '@/components/admin/dashboard.css'
import '@/components/admin/login.css'

/**
 * The Payload admin reads cookies and queries the database on every request —
 * it is a logged-in application, not a page that can be prerendered. Cache
 * Components would otherwise fail the build trying to produce a static shell
 * for it.
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
