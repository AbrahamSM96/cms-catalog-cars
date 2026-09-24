import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Brands } from './collections/Brands'
import { CarModels } from './collections/CarModels'
import { Cars } from './collections/Cars'
import { CarVersions } from './collections/CarVersions'
import { Cities } from './collections/Cities'
import { Colors } from './collections/Colors'
import { Dealerships } from './collections/Dealerships'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { VinDecodes } from './collections/VinDecodes'
import { Contact } from './globals/Contact'
import { Homepage } from './globals/Homepage'
import { SiteSettings } from './globals/SiteSettings'
import { emailAdapter } from './lib/email'
import { MEDIA_PREFIX, r2PublicUrl } from './lib/r2'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const importMap = {
  baseDir: path.resolve(dirname),
}

/**
 * Read a variable production cannot run without, refusing to boot when it is
 * missing.
 *
 * The two callers below used to degrade in silence instead: the signing secret
 * fell back to a placeholder committed to this repository, and the public
 * origin fell back to the incoming `Host` header. Neither failure surfaces
 * anywhere — the app boots, the admin works, and the only party who notices is
 * someone forging a session cookie or a password-reset link. Since every client
 * gets its own deploy, one forgotten variable out of N is a question of when.
 *
 * Outside production the fallback stands, so `bun dev`, the test suite and the
 * type generators still run with no environment at all.
 *
 * @param name - Environment variable to read.
 * @param devFallback - Value to use when NODE_ENV is not `production`.
 */
function requiredEnv(name: string, devFallback: string): string {
  const value = process.env[name]?.trim()
  if (value) return value

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `${name} is missing. Set it in this deploy's environment — ` +
        'production refuses to start without it.'
    )
  }

  return devFallback
}

/**
 * Resolve which database this process talks to.
 *
 * `DATABASE_URI` wins whenever it is set: that is what Docker Compose and the
 * hosting provider inject into the container, and it has to stay authoritative
 * there.
 *
 * Locally it is absent, so NODE_ENV picks the target instead — DATABASE_URI_DEV
 * for `bun dev`, DATABASE_URI_PROD for the production-mode commands (`migrate`,
 * `seed`, `start`). Splitting them is what keeps development off the live
 * database: in development Payload pushes schema changes on boot, so a dev
 * server pointed at production would rewrite its schema behind the migrations'
 * back.
 */
function databaseUri(): string | undefined {
  if (process.env.DATABASE_URI) return process.env.DATABASE_URI

  return process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URI_PROD
    : process.env.DATABASE_URI_DEV
}

/**
 * Public origin Payload writes into the links it emails (the password reset
 * URL, the verification URL).
 *
 * An empty string tells Payload to rebuild the origin from the incoming
 * request host, which is what we want in development and in any preview deploy
 * where the domain is not known ahead of time. In production the host header
 * comes from whatever proxy sits in front of the app, so the real domain is
 * pinned instead — a spoofed or internal host would otherwise end up inside a
 * reset link.
 *
 * That pinning is the whole point, so the variable is required rather than
 * defaulted: an empty `NEXT_PUBLIC_SITE_URL` in production would hand the
 * origin back to the `Host` header, and a reset link built from an attacker's
 * host delivers the victim's token to the attacker.
 */
function serverUrl(): string {
  if (process.env.NODE_ENV !== 'production') return ''

  return requiredEnv('NEXT_PUBLIC_SITE_URL', '')
}

export default buildConfig({
  admin: {
    components: {
      // Inventory overview above the stock dashboard (components/admin/dashboard.css).
      beforeDashboard: [
        '/components/admin/AdminDashboardHero#AdminDashboardHero',
      ],
      // Left half of the split-screen sign-in view (components/admin/login.css).
      beforeLogin: ['/components/admin/LoginBrandPanel#LoginBrandPanel'],
      graphics: {
        // The Payload mark in the breadcrumb, which links back to the dashboard.
        Icon: '/components/admin/AdminIcon#AdminIcon',
      },
    },
    importMap,
    user: 'users',
  },
  collections: [
    Brands,
    CarModels,
    CarVersions,
    Cars,
    Cities,
    Colors,
    Dealerships,
    Leads,
    Media,
    Users,
    VinDecodes,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri(),
    },
    // Development only: the adapter itself ignores this in production, where the
    // schema belongs to the migrations in ./migrations. Set PAYLOAD_DB_PUSH=false
    // to develop against a schema you do not want rewritten on boot.
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  editor: lexicalEditor(),
  email: emailAdapter(),
  globals: [Homepage, Contact, SiteSettings],
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en, es },
  },
  plugins: [
    s3Storage({
      bucket: process.env.R2_BUCKET ?? '',
      collections: {
        media: {
          disableLocalStorage: true,

          /**
           * generateFileURL — build the public R2 URL for a stored file.
           *
           * @param props - component props
           * @param props.filename - filename to generate the URL for
           */
          generateFileURL: ({ filename: fileToUrl }): string =>
            r2PublicUrl(fileToUrl),
          prefix: MEDIA_PREFIX,
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
        },
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
        region: 'auto',
      },
    }),
  ],
  // Signs every admin session cookie. The development fallback is deliberately
  // labelled: it is public knowledge, so a deploy running on it authenticates
  // anyone who forges a token with it.
  secret: requiredEnv('PAYLOAD_SECRET', 'dev-only-insecure-secret'),
  serverURL: serverUrl(),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
