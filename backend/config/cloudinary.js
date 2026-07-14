import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded if this file is imported from seeders/scripts directly
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Dynamic-Ticks',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  },
});

/**
 * Extracts Cloudinary public ID from a secure URL.
 * Example input: https://res.cloudinary.com/.../image/upload/v12345/Dynamic-Ticks/image.jpg
 * Output: Dynamic-Ticks/image
 */
export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    
    let publicIdPart = parts[1];
    // Remove version prefix if exists (e.g. v123456789/)
    publicIdPart = publicIdPart.replace(/^v\d+\//, '');
    
    // Remove extension
    const dotIndex = publicIdPart.lastIndexOf('.');
    if (dotIndex !== -1) {
      publicIdPart = publicIdPart.substring(0, dotIndex);
    }
    return publicIdPart;
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
};

/**
 * Deletes a single image from Cloudinary by its secure URL.
 */
export const deleteFromCloudinary = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (publicId) {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      console.log(`Cloudinary deletion response for ${publicId}:`, res);
      return res;
    } catch (error) {
      console.error(`Failed to delete image ${publicId} from Cloudinary:`, error);
    }
  }
  return null;
};

export { cloudinary, storage };
