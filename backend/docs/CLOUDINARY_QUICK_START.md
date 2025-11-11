# Cloudinary Quick Start Guide

## 5-Minute Setup

### 1. Get Cloudinary Credentials

1. Sign up at [https://cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configure Environment

Add to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Test Integration

```bash
cd backend
npm run test:cloudinary
```

You should see:
```
=== All Cloudinary Tests Passed ===
✓ Single image upload
✓ Optimized URL generation
✓ Thumbnail generation
✓ Multiple image upload
✓ Single image deletion
✓ Multiple image deletion
✓ Folder organization
```

## Common Use Cases

### Upload Hotel Image

```typescript
import cloudinaryService from '../services/cloudinary.service';

// In your controller
const result = await cloudinaryService.uploadBase64Image(
  req.body.image,
  'hotels'
);

// Save URL to database
await hotel.update({ images: [result.url] });
```

### Upload Multiple Room Images

```typescript
const results = await cloudinaryService.uploadMultipleBase64Images(
  req.body.images,
  'rooms'
);

const imageUrls = results.map(r => r.url);
await room.update({ images: imageUrls });
```

### Generate Thumbnail

```typescript
const thumbnailUrl = cloudinaryService.getThumbnailUrl(publicId);
```

### Delete Old Image

```typescript
// Extract public ID from URL
const publicId = url.split('/').slice(-2).join('/').split('.')[0];

// Delete from Cloudinary
await cloudinaryService.deleteImage(publicId);
```

## Frontend Example

```typescript
// Convert file to base64
async function uploadImage(file: File) {
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve) => {
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  // Send to backend
  const response = await fetch('/api/hotels/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 })
  });

  return response.json();
}
```

## Folder Structure

```
derlg/
├── hotels/      # Hotel images
├── rooms/       # Room images
├── tours/       # Tour images
├── events/      # Event images
├── profiles/    # User profiles
└── reviews/     # Review images
```

## Next Steps

1. ✅ Test the integration
2. 📖 Read [CLOUDINARY_INTEGRATION.md](./CLOUDINARY_INTEGRATION.md) for detailed usage
3. 🔧 Implement image upload in your controllers
4. 🎨 Use optimized URLs in your frontend

## Troubleshooting

**Test fails?**
- Check credentials in `.env`
- Verify internet connection
- Check Cloudinary dashboard for account status

**Upload fails?**
- Validate image is base64 format
- Check file size (max 10MB)
- Ensure valid image format (JPEG, PNG, WebP)

## Support

- 📚 [Full Documentation](./CLOUDINARY_INTEGRATION.md)
- 🌐 [Cloudinary Docs](https://cloudinary.com/documentation)
- 🧪 Test script: `backend/src/scripts/testCloudinary.ts`
