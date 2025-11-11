import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * Cloudinary Service
 * Handles image uploads and transformations
 */
class CloudinaryService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload image from base64 string
   * @param base64Image - Base64 encoded image string
   * @param folder - Folder path in Cloudinary
   * @param options - Additional upload options
   * @returns Upload result with URL
   */
  async uploadBase64Image(
    base64Image: string,
    folder: string = 'hotels',
    options: any = {}
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(base64Image, {
        folder: `derlg/${folder}`,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions
          { quality: 'auto' }, // Auto quality
          { fetch_format: 'auto' }, // Auto format (WebP when supported)
        ],
        ...options,
      });

      logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      logger.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload multiple images from base64 strings
   * @param base64Images - Array of base64 encoded image strings
   * @param folder - Folder path in Cloudinary
   * @returns Array of upload results
   */
  async uploadMultipleBase64Images(
    base64Images: string[],
    folder: string = 'hotels'
  ): Promise<{ url: string; publicId: string }[]> {
    try {
      const uploadPromises = base64Images.map((image) =>
        this.uploadBase64Image(image, folder)
      );
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      logger.error('Multiple image upload error:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted from Cloudinary: ${publicId}`);
    } catch (error: any) {
      logger.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Delete multiple images from Cloudinary
   * @param publicIds - Array of public IDs to delete
   */
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    try {
      const deletePromises = publicIds.map((publicId) => this.deleteImage(publicId));
      await Promise.all(deletePromises);
    } catch (error: any) {
      logger.error('Multiple image delete error:', error);
      throw new Error(`Failed to delete images: ${error.message}`);
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param publicId - Public ID of the image
   * @param options - Transformation options
   * @returns Optimized image URL
   */
  getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    } = {}
  ): string {
    const { width = 800, height = 600, crop = 'fill', quality = 'auto' } = options;

    return cloudinary.url(publicId, {
      transformation: [{ width, height, crop }, { quality }, { fetch_format: 'auto' }],
      secure: true,
    });
  }

  /**
   * Generate thumbnail URL
   * @param publicId - Public ID of the image
   * @returns Thumbnail URL
   */
  getThumbnailUrl(publicId: string): string {
    return this.getOptimizedImageUrl(publicId, {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 'auto',
    });
  }
}

export default new CloudinaryService();
