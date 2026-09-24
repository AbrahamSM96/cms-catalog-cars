'use client'

// eslint-disable-next-line import/no-extraneous-dependencies
import { useLivePreviewContext, useTranslation } from '@payloadcms/ui'

import { pick } from '../../i18n/locales'
import { ui } from '../../i18n/labels'

/**
 * ViewOnSiteButton — replaces Payload's stock preview button in the Cars edit
 * view.
 *
 * The stock control is a bare external-link icon with no label, easy to miss
 * beside the filled Save button; this one is an accented pill that reads
 * "Ver en el sitio", so an editor who just saved a car can see where to go.
 *
 * The URL comes from the same live-preview context the stock button reads, so
 * `Cars.admin.preview` stays the single place the link is built. While the
 * context has no URL — an unsaved document — nothing renders, matching the
 * stock behaviour rather than offering a link that would 404.
 *
 * Styling lives in `preview-button.css` and consumes the tokens from
 * `theme.css`, so the pill follows the admin's light/dark toggle.
 */
export function ViewOnSiteButton(): React.JSX.Element | null {
  const { previewURL } = useLivePreviewContext()
  const { i18n } = useTranslation()

  if (!previewURL) return null

  const label = pick(ui.previewButton.label, i18n.language)

  return (
    <a
      className="view-on-site"
      href={previewURL}
      id="preview-button"
      rel="noreferrer"
      target="_blank"
      title={pick(ui.previewButton.title, i18n.language)}
    >
      <svg
        aria-hidden="true"
        className="view-on-site__icon"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </svg>
      <span className="view-on-site__label">{label}</span>
    </a>
  )
}
