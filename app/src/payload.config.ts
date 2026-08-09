import { postgresAdapter } from "@payloadcms/db-postgres";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import type { HandleDelete, HandleUpload } from "@payloadcms/plugin-cloud-storage/types";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { Brands } from "./collections/Brands";
import { Cars } from "./collections/Cars";
import { Colors } from "./collections/Colors";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { Homepage } from "./globals/Homepage";
import { filenameToPublicId } from "./lib/cloudinary-path";
import { brandsList } from "./seed/brands";
import { colorsList } from "./seed/colors";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryAdapter = () => ({
  name: "cloudinary-adapter",
  async handleUpload({ file }: Parameters<HandleUpload>[0]) {
    // Upload to a public_id derived deterministically from the (already
    // deduplicated) Payload filename, so the stored filename and the Cloudinary
    // location always map to each other via filenameToPublicId. No timestamp,
    // no reliance on mutating file.filename (the plugin does not persist that).
    const publicId = filenameToPublicId(file.filename);
    try {
      await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            public_id: publicId,
            overwrite: true,
            use_filename: false,
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("No result returned from Cloudinary"));
            resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      console.error(`Cloudinary upload failed for ${publicId}:`, err);
      throw err;
    }
  },

  async handleDelete({ filename }: Parameters<HandleDelete>[0]) {
    try {
      await cloudinary.uploader.destroy(filenameToPublicId(filename));
    } catch (error) {
      console.error("Cloudinary Delete Error:", error);
    }
  },
  staticHandler() {
    return new Response("Not implemented", { status: 501 });
  },
});

export const importMap = {
  baseDir: path.resolve(dirname),
};

export default buildConfig({
  admin: {
    user: "users",
    importMap,
  },
  collections: [Brands, Cars, Colors, Media, Users],
  globals: [Homepage],
  editor: lexicalEditor(),
  sharp,
  secret: process.env.PAYLOAD_SECRET || "your-secret-key-here",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // In dev, Payload pushes schema changes automatically (no migration files).
    // In production, run `payload migrate` from versioned migrations instead.
    push: process.env.NODE_ENV !== "production",
  }),
  plugins: [
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter,
          disableLocalStorage: true,

          generateFileURL: ({ filename }) => {
            return cloudinary.url(filenameToPublicId(filename), { secure: true });
          },
        },
      },
    }),
  ],
  onInit: async (payload) => {
    try {
      // what is payload.count() method does is it will count the number of documents in the specified collection and return an object with totalDocs property which indicates the total number of documents in that collection
      const existingBrands = await payload.count({
        collection: "brands",
      });

      if (existingBrands.totalDocs === 0) {
        console.log("🌱 Seeding brands...");

        for (const brand of brandsList) {
          try {
            await payload.create({
              collection: "brands",
              data: brand,
            });
            console.log(`✅ Created: ${brand.name}`);
          } catch (error) {
            console.error(`❌ Error creating ${brand.name}:`, error);
          }
        }

        console.log("✨ Brands seeded successfully!");
      } else {
        console.log(`ℹ️  Brands already exist (${existingBrands.totalDocs} brands)`);
      }
    } catch (error) {
      console.error("❌ Error seeding brands:", error);
    }

    try {
      const existingColors = await payload.count({ collection: "colors" });

      if (existingColors.totalDocs === 0) {
        console.log("🌱 Seeding colors...");
        for (const color of colorsList) {
          try {
            await payload.create({ collection: "colors", data: color });
          } catch (error) {
            console.error(`❌ Error creating color ${color.name}:`, error);
          }
        }
        console.log("✨ Colors seeded successfully!");
      } else {
        console.log(`ℹ️  Colors already exist (${existingColors.totalDocs} colors)`);
      }
    } catch (error) {
      console.error("❌ Error seeding colors:", error);
    }
  },
});
