import type { Media, SiteSettings } from '@/types/car'
import { getImageUrl } from '@/lib/images'

/**
 * Per-client brand configuration.
 *
 * The live values come from the `site-settings` global in the CMS, so each
 * dealership brands its own site from the admin panel (stored in its own DB).
 * The object below is only the FALLBACK used when the global is empty or fails
 * to load — it also documents the shape. Use `resolveSiteConfig()` to merge the
 * CMS values over these defaults.
 */
export interface SiteConfig {
  /** Short brand blurb shown in the footer. */
  description: string
  /** Public URL of the favicon, or undefined to use the static default. */
  faviconUrl?: string
  /** Alt text for the brand logo, falling back to the brand name. */
  logoAlt?: string
  /** Public URL of the brand logo, or undefined to use the built-in icon. */
  logoUrl?: string
  /** Full brand name, shown in the navbar wordmark, footer and SEO. */
  name: string
  /** Public URL of the Open Graph / social sharing image. */
  ogImageUrl?: string
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
  /** Whether the brand name is shown next to the logo. */
  showName: boolean
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
  showName: true,
  tagline: 'Autos seminuevos de calidad',
  theme: {
    accent: '#276CF5',
    accentStrong: '#b91c1c',
    primary: '#0f172a',
  },
}

/**
 * mediaUrl — resolve the public URL of an upload field (populated or not).
 *
 * @param media - upload value from the CMS (populated Media, id or undefined)
 */
function mediaUrl(media?: Media | string | number): string | undefined {
  if (!media || typeof media !== 'object') {
    return undefined
  }

  return media.url ?? getImageUrl(media.filename)
}

/**
 * mediaAlt — read the alt text of an upload field when it is populated.
 *
 * @param media - upload value from the CMS (populated Media, id or undefined)
 */
function mediaAlt(media?: Media | string | number): string | undefined {
  if (!media || typeof media !== 'object') {
    return undefined
  }

  return media.alt
}

/**
 * resolveSiteConfig — merge the CMS `site-settings` global over the static
 * defaults, so a missing/empty field always falls back to a sane value.
 *
 * @param settings - the SiteSettings global, or null when it failed to load
 */
export function resolveSiteConfig(settings: SiteSettings | null): SiteConfig {
  if (!settings) {
    return siteConfig
  }

  const keywords = settings.seo?.keywords
    ?.map((k) => k.value)
    .filter((v): v is string => Boolean(v))

  return {
    description: settings.brand?.description || siteConfig.description,
    faviconUrl: mediaUrl(settings.media?.favicon),
    logoAlt: mediaAlt(settings.media?.logo),
    logoUrl: mediaUrl(settings.media?.logo),
    name: settings.brand?.name || siteConfig.name,
    ogImageUrl: mediaUrl(settings.media?.ogImage),
    seo: {
      description: settings.seo?.description || siteConfig.seo.description,
      keywords: keywords?.length ? keywords : siteConfig.seo.keywords,
      ogDescription:
        settings.seo?.ogDescription || siteConfig.seo.ogDescription,
      titleDefault: settings.seo?.titleDefault || siteConfig.seo.titleDefault,
      titleTemplate:
        settings.seo?.titleTemplate || siteConfig.seo.titleTemplate,
    },
    showName: settings.brand?.showName ?? siteConfig.showName,
    tagline: settings.brand?.tagline || siteConfig.tagline,
    theme: {
      accent: settings.theme?.accent || siteConfig.theme.accent,
      accentStrong:
        settings.theme?.accentStrong || siteConfig.theme.accentStrong,
      primary: settings.theme?.primary || siteConfig.theme.primary,
    },
  }
}
