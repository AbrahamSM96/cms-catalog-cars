import { fileURLToPath } from 'url'
import path from 'path'

import type {
  GeneratedAdapter,
  HandleDelete,
  HandleUpload,
} from '@payloadcms/plugin-cloud-storage/types'
import { buildConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import type { UploadApiResponse } from 'cloudinary'

import { Brands } from './collections/Brands'
import { brandsList } from './seed/brands'
import { CarModels } from './collections/CarModels'
import { Cars } from './collections/Cars'
import { CarVersions } from './collections/CarVersions'
import { Colors } from './collections/Colors'
import { colorsList } from './seed/colors'
import { Contact } from './globals/Contact'
import { Dealerships } from './collections/Dealerships'
import { filenameToPublicId } from './lib/cloudinary-path'
import { Homepage } from './globals/Homepage'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { vehicleCatalog } from './seed/vehicleCatalog'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
})

/**
 * cloudinaryAdapters
 */
const cloudinaryAdapter = (): GeneratedAdapter => ({
  /**
   * handleDelete
   *
   * @param props - component props
   * @param props.filename - filename to delete
   */
  async handleDelete({ filename: fileToDelete }: Parameters<HandleDelete>[0]) {
    try {
      await cloudinary.uploader.destroy(filenameToPublicId(fileToDelete))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Cloudinary Delete Error:', error)
    }
  },

  /**
   * handleUpload
   *
   * @param props - component props
   * @param props.file - file to upload
   */
  async handleUpload({ file }: Parameters<HandleUpload>[0]) {
    // Upload to a public_id derived deterministically from the (already
    // deduplicated) Payload filename, so the stored filename and the Cloudinary
    // location always map to each other via filenameToPublicId. No timestamp,
    // no reliance on mutating file.filename (the plugin does not persist that).
    const publicId = filenameToPublicId(file.filename)
    try {
      await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            overwrite: true,
            public_id: publicId,
            resource_type: 'auto',
            use_filename: false,
          },
          (error, result) => {
            if (error) return reject(error)
            if (!result)
              return reject(new Error('No result returned from Cloudinary'))
            resolve(result)
          }
        )
        uploadStream.end(file.buffer)
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Cloudinary upload failed for ${publicId}:`, err)
      throw err
    }
  },
  name: 'cloudinary-adapter',

  /**
   * staticHandler
   */
  staticHandler() {
    return new Response('Not implemented', { status: 501 })
  },
})

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
    // In dev, Payload pushes schema changes automatically (no migration files).
    // In production, run `payload migrate` from versioned migrations instead.
    push: process.env.NODE_ENV !== 'production',
  }),
  editor: lexicalEditor(),
  globals: [Homepage, Contact],
  /**
   * onInit
   *
   * @param payload - Payload instance
   */
  onInit: async (payload) => {
    try {
      // what is payload.count() method does is it will count the number of documents in the specified collection and return an object with totalDocs property which indicates the total number of documents in that collection
      const existingBrands = await payload.count({
        collection: 'brands',
      })

      if (existingBrands.totalDocs === 0) {
        // eslint-disable-next-line no-console
        console.log('🌱 Seeding brands...')

        for (const brand of brandsList) {
          try {
            await payload.create({
              collection: 'brands',
              data: brand,
            })
            // eslint-disable-next-line no-console
            console.log(`✅ Created: ${brand.name}`)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`❌ Error creating ${brand.name}:`, error)
          }
        }

        // eslint-disable-next-line no-console
        console.log('✨ Brands seeded successfully!')
      } else {
        // eslint-disable-next-line no-console
        console.log(
          `ℹ️  Brands already exist (${existingBrands.totalDocs} brands)`
        )
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error seeding brands:', error)
    }

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
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter,
          disableLocalStorage: true,

          /**
           * generateFileURL
           *
           * @param props - component props
           * @param props.filename - filename to generate URL for
           */
          generateFileURL: ({ filename: fileToUrl }) => {
            return cloudinary.url(filenameToPublicId(fileToUrl), {
              secure: true,
            })
          },
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
