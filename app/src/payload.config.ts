import { fileURLToPath } from 'url'
import path from 'path'

import { buildConfig } from 'payload'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { MEDIA_PREFIX, r2PublicUrl } from './lib/r2'
import { Brands } from './collections/Brands'
import { CarModels } from './collections/CarModels'
import { Cars } from './collections/Cars'
import { CarVersions } from './collections/CarVersions'
import { Cities } from './collections/Cities'
import { Colors } from './collections/Colors'
import { Contact } from './globals/Contact'
import { Dealerships } from './collections/Dealerships'
import { emailAdapter } from './lib/email'
import { Homepage } from './globals/Homepage'
import { Media } from './collections/Media'
import { SiteSettings } from './globals/SiteSettings'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const importMap = {
  baseDir: path.resolve(dirname),
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
 */
function serverUrl(): string {
  if (process.env.NODE_ENV !== 'production') return ''

  return process.env.NEXT_PUBLIC_SITE_URL ?? ''
}

export default buildConfig({
  admin: {
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
    Media,
    Users,
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
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
  serverURL: serverUrl(),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
