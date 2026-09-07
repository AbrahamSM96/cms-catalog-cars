/**
 * Replaces the Payload mark in the breadcrumb bar
 * (`admin.components.graphics.Icon`).
 *
 * Payload renders it inside `.step-nav__home`, a 16–18px link back to the
 * dashboard, so a house reads truer than a brand mark at that size — the
 * element is a "go home" control, not a logo.
 *
 * It paints with `currentColor` and fills its slot, which is what lets it
 * follow the admin's light/dark toggle and the hover colour set in
 * `theme.css` without any props.
 */
export function AdminIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="admin-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10.5 12 3l9 7.5M5.25 9.5V19a1 1 0 0 0 1 1H9.5v-4.75a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V20h3.25a1 1 0 0 0 1-1V9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  )
}
