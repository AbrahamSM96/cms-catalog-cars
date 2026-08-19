/**
 * Per-client brand configuration.
 *
 * This is the single place to customise the site for a new dealership: brand
 * name, tagline, SEO defaults and brand colours. Everything else (page logic,
 * components, the vehicle catalogue) stays shared across clients. Colours here
 * override the CSS-variable defaults in globals.css via the root layout, so a
 * new brand accent only needs to change once, right here.
 */
export interface SiteConfig {
  /** Short brand blurb shown in the footer. */
  description: string
  /** Full brand name, shown in the navbar wordmark, footer and SEO. */
  name: string
  /** SEO defaults for titles, description and social sharing. */
  seo: {
    /** Long meta description used on pages without their own. */
    description: string
    /** Meta keywords. */
    keywords: string[]
    /** Shorter description used for Open Graph / social cards. */
    ogDescription: string
    /** Default `<title>` and Open Graph title. */
    titleDefault: string
    /** Title template for inner pages, e.g. `%s | Brand`. */
    titleTemplate: string
  }
  /** Short slogan shown under the brand in the footer. */
  tagline: string
  /** Brand colours, injected as CSS variables by the root layout. */
  theme: {
    /** Primary accent (buttons, highlights, top loader). */
    accent: string
    /** Darker accent for hover/pressed states. */
    accentStrong: string
    /** Primary neutral (text, dark surfaces). */
    primary: string
  }
}

export const siteConfig: SiteConfig = {
  description:
    'Autos seminuevos con garantía de calidad, financiamiento disponible y facilidades de pago.',
  name: 'AutoCatálogo',
  seo: {
    description:
      'Encuentra tu auto seminuevo ideal. La mejor selección de autos con garantía de calidad, financiamiento disponible y facilidades de pago.',
    keywords: [
      'autos seminuevos',
      'carros usados',
      'venta de autos',
      'autos de segunda mano',
      'financiamiento de autos',
    ],
    ogDescription:
      'La mejor selección de autos seminuevos con garantía de calidad',
    titleDefault: 'AutoCatálogo - Autos Seminuevos de Calidad',
    titleTemplate: '%s | AutoCatálogo',
  },
  tagline: 'Autos seminuevos de calidad',
  theme: {
    accent: '#276CF5',
    accentStrong: '#b91c1c',
    primary: '#0f172a',
  },
}
