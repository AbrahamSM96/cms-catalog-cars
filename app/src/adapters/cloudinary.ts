import { v2 as cloudinary } from 'cloudinary'

/**
 * cloudinaryConfig
 */
export function cloudinaryConfig(): ReturnType<typeof cloudinary.config> {
  // At the top of your config file

  return cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  })
}
