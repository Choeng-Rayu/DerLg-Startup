# Cloudinary Media Storage Integration

## Overview

Cloudinary is integrated into the DerLg Tourism Platform for efficient media storage, optimization, and delivery. This document covers setup, usage, and best practices for managing images across the platform.

## Features

- **Automatic Image Optimization**: Images are automatically optimized for web delivery
- **Responsive Images**: Generate multiple sizes for different devices
- **Format Conversion**: Automatic WebP conversion for supported browsers
- **CDN Delivery**: Fast global content delivery
- **Thumbnail Generation**: Automatic thumbnail creation
- **Folder Organization**: Organized storage by content type
- **Secure URLs**: HTTPS delivery by default

## Setup

### 1. Create Cloudinary Account

1. Sign up at [https://cloudinary.com](https://cloudinary.com)
2. Navigate to Dashboard to find your credentials
3. Note your Cloud Name, API Key, and API Secret

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Verify Installation

The `cloudinary` package is already installed. Verify by running:

```bash
npm test:cloudinary
```

## Folder Structure

Images are organized in the following folder structure:

```
derlg/
├── hotels/          # Hotel property images
├── rooms/           # Room type images
├── tours/           # Tour and activity images
├── events/          # Cultural event images
├── profiles/        # User profile images
└── reviews/         # Review images uploaded by users
```

## Usage

### Import the Service

```typescript
import cloudinaryService from '../services/cloudinary.service';
```

### Upload Single Image

```typescript
// Upload from base64 string
const result = await cloudinaryService.uploadBase64Image(
  base64ImageString,
  'hotels',  // folder name
  { tags: ['hotel', 'featured'] }  // optional metadata
);

console.log(result.url);       // Full image URL
console.log(result.publicId);  // Cloudinary public ID
```

### Upload Multiple Images

```typescript
const images = [base64Image1, base64Image2, base64Image3];
const results = await cloudinaryService.uploadMultipleBase64Images(
  images,
  'rooms'
);

// Returns array of { url, publicId }
results.forEach(result => {
  console.log(result.url);
});
```

### Generate Optimized URLs

```typescript
// Custom optimization
const optimizedUrl = cloudinaryService.getOptimizedImageUrl(
  publicId,
  {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto'
  }
);

// Generate thumbnail (300x200)
const thumbnailUrl = cloudinaryService.getThumbnailUrl(publicId);
```

### Delete Images

```typescript
// Delete single image
await cloudinaryService.deleteImage(publicId);

// Delete multiple images
await cloudinaryService.deleteMultipleImages([publicId1, publicId2]);
```

## Controller Integration Examples

### Hotel Profile Image Upload

```typescript
import cloudinaryService from '../services/cloudinary.service';

export const updateHotelProfile = async (req: Request, res: Response) => {
  try {
    const { images } = req.body; // Array of base64 images
    
    // Upload images to Cloudinary
    const uploadResults = await cloudinaryService.uploadMultipleBase64Images(
      images,
      'hotels'
    );
    
    // Extract URLs
    const imageUrls = uploadResults.map(result => result.url);
    
    // Update hotel in database
    await hotel.update({ images: imageUrls });
    
    res.json({ success: true, images: imageUrls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### Room Image Management

```typescript
export const addRoomImages = async (req: Request, res: Response) => {
  try {
    const { roomId, images } = req.body;
    
    // Upload room images
    const uploadResults = await cloudinaryService.uploadMultipleBase64Images(
      images,
      'rooms'
    );
    
    const room = await Room.findByPk(roomId);
    const existingImages = room.images || [];
    const newImages = uploadResults.map(r => r.url);
    
    // Append new images to existing
    await room.update({
      images: [...existingImages, ...newImages]
    });
    
    res.json({ success: true, images: newImages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### Profile Picture Upload

```typescript
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { image } = req.body; // base64 image
    
    const user = await User.findByPk(userId);
    
    // Delete old profile image if exists
    if (user.profile_image) {
      const oldPublicId = extractPublicId(user.profile_image);
      await cloudinaryService.deleteImage(oldPublicId);
    }
    
    // Upload new profile image
    const result = await cloudinaryService.uploadBase64Image(
      image,
      'profiles',
      { tags: ['profile', userId] }
    );
    
    // Update user
    await user.update({ profile_image: result.url });
    
    res.json({ success: true, profileImage: result.url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to extract public ID from Cloudinary URL
function extractPublicId(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
}
```

## Image Transformation Options

### Crop Modes

- `fill`: Resize and crop to exact dimensions
- `fit`: Resize to fit within dimensions (maintains aspect ratio)
- `limit`: Resize only if larger than dimensions
- `scale`: Resize to exact dimensions (may distort)
- `pad`: Resize and add padding to exact dimensions

### Quality Options

- `auto`: Automatic quality optimization
- `auto:best`: Best quality with optimization
- `auto:good`: Good quality with more compression
- `auto:eco`: Maximum compression
- `auto:low`: Low quality, smallest file size
- `1-100`: Manual quality setting

### Example Transformations

```typescript
// Square thumbnail for profile pictures
const profileThumb = cloudinaryService.getOptimizedImageUrl(publicId, {
  width: 150,
  height: 150,
  crop: 'fill',
  quality: 'auto'
});

// Hero image for hotel detail page
const heroImage = cloudinaryService.getOptimizedImageUrl(publicId, {
  width: 1920,
  height: 1080,
  crop: 'fill',
  quality: 'auto:best'
});

// Mobile-optimized image
const mobileImage = cloudinaryService.getOptimizedImageUrl(publicId, {
  width: 640,
  height: 480,
  crop: 'fill',
  quality: 'auto:good'
});
```

## Best Practices

### 1. Image Upload

- **Validate file size**: Limit uploads to 5MB per image
- **Validate format**: Accept only JPEG, PNG, WebP
- **Use appropriate folders**: Organize by content type
- **Add tags**: Use tags for easier management and search

```typescript
// Example validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

function validateImage(base64Image: string): boolean {
  // Check size
  const sizeInBytes = Buffer.from(base64Image.split(',')[1], 'base64').length;
  if (sizeInBytes > MAX_FILE_SIZE) {
    throw new Error('Image size exceeds 5MB limit');
  }
  
  // Check format
  const format = base64Image.split(';')[0].split(':')[1];
  if (!ALLOWED_FORMATS.includes(format)) {
    throw new Error('Invalid image format');
  }
  
  return true;
}
```

### 2. Image Deletion

- **Always delete old images**: When updating, delete the old image first
- **Batch deletions**: Use `deleteMultipleImages` for efficiency
- **Handle errors gracefully**: Don't fail the entire operation if deletion fails

```typescript
// Safe deletion with error handling
async function safeDeleteImage(publicId: string): Promise<void> {
  try {
    await cloudinaryService.deleteImage(publicId);
  } catch (error) {
    logger.warn(`Failed to delete image ${publicId}:`, error);
    // Don't throw - log and continue
  }
}
```

### 3. URL Generation

- **Use optimized URLs**: Always generate optimized URLs for frontend
- **Responsive images**: Generate multiple sizes for different devices
- **Cache URLs**: Store generated URLs to avoid repeated API calls

```typescript
// Generate responsive image set
function generateResponsiveImages(publicId: string) {
  return {
    thumbnail: cloudinaryService.getThumbnailUrl(publicId),
    small: cloudinaryService.getOptimizedImageUrl(publicId, {
      width: 640,
      height: 480,
      crop: 'fill'
    }),
    medium: cloudinaryService.getOptimizedImageUrl(publicId, {
      width: 1024,
      height: 768,
      crop: 'fill'
    }),
    large: cloudinaryService.getOptimizedImageUrl(publicId, {
      width: 1920,
      height: 1080,
      crop: 'fill'
    }),
    original: cloudinaryService.getOptimizedImageUrl(publicId, {
      quality: 'auto:best'
    })
  };
}
```

### 4. Error Handling

```typescript
try {
  const result = await cloudinaryService.uploadBase64Image(image, 'hotels');
  return result;
} catch (error) {
  if (error.message.includes('Invalid image')) {
    throw new Error('Please upload a valid image file');
  } else if (error.message.includes('quota')) {
    throw new Error('Storage quota exceeded. Please contact support.');
  } else {
    throw new Error('Failed to upload image. Please try again.');
  }
}
```

## Frontend Integration

### Sending Images to Backend

```typescript
// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Upload image
async function uploadHotelImage(file: File) {
  const base64Image = await fileToBase64(file);
  
  const response = await fetch('/api/hotels/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image: base64Image })
  });
  
  const data = await response.json();
  return data.url;
}
```

### Displaying Optimized Images

```tsx
// React component with responsive images
function HotelImage({ publicId, alt }: { publicId: string; alt: string }) {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return (
    <img
      src={`${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/${publicId}`}
      srcSet={`
        ${baseUrl}/w_400,h_300,c_fill,q_auto,f_auto/${publicId} 400w,
        ${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/${publicId} 800w,
        ${baseUrl}/w_1200,h_900,c_fill,q_auto,f_auto/${publicId} 1200w
      `}
      sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
      alt={alt}
      loading="lazy"
    />
  );
}
```

## Testing

Run the Cloudinary integration test:

```bash
npm run test:cloudinary
```

This test will:
1. Upload a single image
2. Generate optimized URLs
3. Generate thumbnails
4. Upload multiple images
5. Delete images
6. Test folder organization

## Troubleshooting

### Issue: "Invalid credentials"

**Solution**: Verify your Cloudinary credentials in `.env` file

```bash
# Check if credentials are set
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
```

### Issue: "Upload failed"

**Possible causes**:
1. Image size too large (>10MB)
2. Invalid base64 format
3. Network connectivity issues
4. Cloudinary quota exceeded

**Solution**: Check error message and validate input

### Issue: "Image not found"

**Solution**: Verify the public ID is correct and the image exists in Cloudinary dashboard

### Issue: "Slow upload times"

**Solution**: 
1. Compress images before upload
2. Use batch uploads for multiple images
3. Consider using Cloudinary's upload presets

## Monitoring and Limits

### Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

### Monitoring Usage

Check your usage in the Cloudinary dashboard:
1. Go to [https://cloudinary.com/console](https://cloudinary.com/console)
2. View usage statistics
3. Set up alerts for quota limits

## Security

### API Key Protection

- **Never expose API keys**: Keep credentials in `.env` file
- **Use environment variables**: Don't hardcode credentials
- **Rotate keys regularly**: Update keys periodically

### Upload Security

- **Validate file types**: Only accept image formats
- **Limit file sizes**: Prevent abuse with size limits
- **Sanitize filenames**: Remove special characters
- **Use signed uploads**: For sensitive content (optional)

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Reference](https://cloudinary.com/documentation/node_integration)
- [Image Transformation Reference](https://cloudinary.com/documentation/image_transformations)
- [Optimization Best Practices](https://cloudinary.com/documentation/image_optimization)

## Support

For issues or questions:
1. Check this documentation
2. Review Cloudinary documentation
3. Check the test script for examples
4. Contact the development team
