import { fileURLToPath } from 'url'
import path from 'path'

import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Brands } from './collections/Brands'
import { CarModels } from './collections/CarModels'
import { Cars } from './collections/Cars'
import { CarVersions } from './collections/CarVersions'
import { Colors } from './collections/Colors'
import { Contact } from './globals/Contact'
import { Dealerships } from './collections/Dealerships'
import { Homepage } from './globals/Homepage'
import { Media } from './collections/Media'
import { MEDIA_PREFIX, r2PublicUrl } from './lib/r2'
import { SiteSettings } from './globals/SiteSettings'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const importMap = {
  baseDir: path.resolve(dirname),
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
    Colors,
    Dealerships,
    Media,
    Users,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // v1 ships with schema push everywhere: Payload creates/updates the schema
    // on boot (no migration files needed). Set PAYLOAD_DB_PUSH=false per deploy
    // once versioned migrations exist (Fase 1) to switch to `payload migrate`.
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  editor: lexicalEditor(),
  globals: [Homepage, Contact, SiteSettings],
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
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
