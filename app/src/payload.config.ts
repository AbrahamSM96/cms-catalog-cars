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
import { colorsList } from './seed/colors'
import { Contact } from './globals/Contact'
import { Dealerships } from './collections/Dealerships'
import { Homepage } from './globals/Homepage'
import { Media } from './collections/Media'
import { MEDIA_PREFIX, r2PublicUrl } from './lib/r2'
import { SiteSettings } from './globals/SiteSettings'
import { Users } from './collections/Users'
import { vehicleCatalog } from './seed/vehicleCatalog'

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
  /**
   * onInit
   *
   * @param payload - Payload instance
   */
  onInit: async (payload) => {
    try {
      const existingColors = await payload.count({ collection: 'colors' })

      if (existingColors.totalDocs === 0) {
        // eslint-disable-next-line no-console
        console.log('🌱 Seeding colors...')
        for (const color of colorsList) {
          try {
            await payload.create({ collection: 'colors', data: color })
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`❌ Error creating color ${color.name}:`, error)
          }
        }
        // eslint-disable-next-line no-console
        console.log('✨ Colors seeded successfully!')
      } else {
        // eslint-disable-next-line no-console
        console.log(
          `ℹ️  Colors already exist (${existingColors.totalDocs} colors)`
        )
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error seeding colors:', error)
    }

    try {
      const existingVersions = await payload.count({
        collection: 'car-versions',
      })

      if (existingVersions.totalDocs === 0) {
        // eslint-disable-next-line no-console
        console.log('🌱 Seeding vehicle catalog (this runs once)...')

        for (const brand of vehicleCatalog) {
          // Upsert the brand by slug: skip if it already exists.
          const found = await payload.find({
            collection: 'brands',
            depth: 0,
            limit: 1,
            where: { slug: { equals: brand.slug } },
          })
          const brandDoc =
            found.docs[0] ??
            (await payload.create({
              collection: 'brands',
              data: { name: brand.name, slug: brand.slug },
            }))

          for (const model of brand.models) {
            const modelDoc = await payload.create({
              collection: 'car-models',
              data: { brand: brandDoc.id, name: model.name },
            })

            for (const version of model.versions) {
              await payload.create({
                collection: 'car-versions',
                data: {
                  clave: version.clave,
                  description: version.description,
                  model: modelDoc.id,
                  years: version.years,
                },
              })
            }
          }
          // eslint-disable-next-line no-console
          console.log(`✅ ${brand.name}: ${brand.models.length} models`)
        }

        // eslint-disable-next-line no-console
        console.log('✨ Vehicle catalog seeded successfully!')
      } else {
        // eslint-disable-next-line no-console
        console.log(
          `ℹ️  Vehicle catalog already seeded (${existingVersions.totalDocs} versions)`
        )
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error seeding vehicle catalog:', error)
    }
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
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
