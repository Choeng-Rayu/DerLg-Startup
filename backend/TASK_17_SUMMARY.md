# Task 17: Hotel Admin Profile Management - Implementation Summary

## Overview

Implemented hotel admin profile management endpoints that allow hotel administrators to view and update their hotel information. The implementation includes Cloudinary integration for image uploads, comprehensive validation, and proper authentication/authorization.

## Implementation Details

### 1. Cloudinary Service (`src/services/cloudinary.service.ts`)

Created a comprehensive Cloudinary service for image management:

**Features:**
- Upload base64 images to Cloudinary
- Upload multiple images in batch
- Delete images from Cloudinary
- Generate optimized image URLs with transformations
- Generate thumbnail URLs
- Automatic image optimization (quality, format, dimensions)

**Configuration:**
- Cloud name, API key, and API secret from environment variables
- Upload folder: `derlg/hotels/` for hotel images, `derlg/hotels/logos/` for logos
- Max dimensions: 1920x1080
- Auto quality and format optimization
- WebP format when supported

### 2. Hotel Controller Updates (`src/controllers/hotel.controller.ts`)

Added two new methods to the HotelController class:

#### `getHotelProfile()`
- **Endpoint:** `GET /api/hotel/profile`
- **Purpose:** Retrieve complete hotel profile for authenticated admin
- **Returns:** Hotel data with all rooms
- **Authorization:** Requires admin role
- **Error Handling:** Returns 404 if no hotel found for admin

#### `updateHotelProfile()`
- **Endpoint:** `PUT /api/hotel/profile`
- **Purpose:** Update hotel information
- **Supports Updating:**
  - Name (2-255 characters)
  - Description (required if provided)
  - Location (address, city, province, country, coordinates)
  - Contact (phone, email, website)
  - Amenities (array)
  - Images (URLs or base64 strings)
  - Logo (URL or base64 string)
  - Star rating (1-5)
- **Image Handling:**
  - Accepts existing URLs (preserved as-is)
  - Accepts base64 strings (uploaded to Cloudinary)
  - Returns Cloudinary URLs in response
- **Validation:**
  - Name length validation
  - Description required validation
  - Location field validation
  - Coordinate range validation (-90 to 90 for latitude, -180 to 180 for longitude)
  - Email format validation
  - Array type validation for amenities and images
  - Star rating range validation (1-5)
- **Authorization:** Requires admin role
- **Returns:** Updated hotel data with success message

### 3. Hotel Admin Routes (`src/routes/hotel-admin.routes.ts`)

Created new route file for hotel admin endpoints:

**Routes:**
- `GET /api/hotel/profile` - Get hotel profile
- `PUT /api/hotel/profile` - Update hotel profile

**Middleware:**
- `authenticate` - Verifies JWT token
- `authorize([UserType.ADMIN])` - Ensures user is hotel admin

### 4. Route Registration (`src/routes/index.ts`)

Registered hotel admin routes:
- Imported `hotel-admin.routes.ts`
- Mounted at `/api/hotel` path
- Separate from public hotel routes (`/api/hotels`)

### 5. Test Script (`src/scripts/testHotelAdminProfile.ts`)

Comprehensive test script covering:

**Test Cases:**
1. Admin login authentication
2. Get hotel profile
3. Update hotel basic info (name, description)
4. Update hotel contact information
5. Update hotel amenities
6. Update hotel star rating
7. Validation - Invalid name (too short)
8. Validation - Invalid email format
9. Authorization - Access without token

**Test Features:**
- Detailed logging of each test
- Success/failure tracking
- Test summary with statistics
- Error message validation
- Response data verification

**Run Command:**
```bash
npm run test:hotel-admin-profile
```

### 6. Documentation (`docs/HOTEL_ADMIN_PROFILE.md`)

Created comprehensive API documentation including:
- Endpoint descriptions
- Request/response examples
- Authentication requirements
- Validation rules
- Error responses
- Cloudinary integration details
- Usage examples with curl commands
- Security considerations
- Performance notes

## Files Created

1. `backend/src/services/cloudinary.service.ts` - Cloudinary integration service
2. `backend/src/routes/hotel-admin.routes.ts` - Hotel admin routes
3. `backend/src/scripts/testHotelAdminProfile.ts` - Test script
4. `backend/docs/HOTEL_ADMIN_PROFILE.md` - API documentation
5. `backend/TASK_17_SUMMARY.md` - This summary document

## Files Modified

1. `backend/src/controllers/hotel.controller.ts` - Added profile management methods
2. `backend/src/routes/index.ts` - Registered hotel admin routes
3. `backend/package.json` - Added test script command

## API Endpoints

### GET /api/hotel/profile

**Purpose:** Retrieve hotel profile for authenticated admin

**Authentication:** Required (JWT token)

**Authorization:** Admin role only

**Response:**
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Hotel Name",
      "description": "Hotel description",
      "location": { ... },
      "contact": { ... },
      "amenities": [...],
      "images": [...],
      "logo": "url",
      "star_rating": 5,
      "average_rating": 4.5,
      "total_reviews": 120,
      "status": "active",
      "rooms": [...]
    }
  }
}
```

### PUT /api/hotel/profile

**Purpose:** Update hotel information

**Authentication:** Required (JWT token)

**Authorization:** Admin role only

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "location": {
    "address": "123 Street",
    "city": "City",
    "province": "Province",
    "country": "Country",
    "latitude": 11.5564,
    "longitude": 104.9282,
    "google_maps_url": "https://..."
  },
  "contact": {
    "phone": "+855-12-345-678",
    "email": "email@hotel.com",
    "website": "https://hotel.com"
  },
  "amenities": ["wifi", "parking", "pool"],
  "images": [
    "https://existing-url.jpg",
    "data:image/jpeg;base64,..."
  ],
  "logo": "data:image/png;base64,...",
  "star_rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Hotel profile updated successfully",
    "hotel": { ... }
  }
}
```

## Validation Rules

1. **Name:** 2-255 characters
2. **Description:** Required if provided, cannot be empty
3. **Location:**
   - All fields required: address, city, province, country, latitude, longitude
   - Latitude: -90 to 90
   - Longitude: -180 to 180
4. **Contact:**
   - Phone and email required
   - Email must be valid format
5. **Amenities:** Must be an array
6. **Images:** Must be an array (URLs or base64 strings)
7. **Star Rating:** 1-5 integer

## Cloudinary Integration

**Upload Process:**
1. Detect base64 image strings (starting with `data:image`)
2. Upload to Cloudinary with optimizations
3. Store returned secure URL in database
4. Existing URLs are preserved as-is

**Optimizations:**
- Max dimensions: 1920x1080
- Auto quality
- Auto format (WebP when supported)
- Organized in folders: `derlg/hotels/` and `derlg/hotels/logos/`

## Security Features

1. **Authentication:** JWT token required for all endpoints
2. **Authorization:** Only admin role can access
3. **Ownership:** Admins can only access their own hotel (filtered by `admin_id`)
4. **Input Validation:** Comprehensive validation prevents malicious data
5. **Image Validation:** Only valid image formats accepted

## Testing

Run the test script:
```bash
npm run test:hotel-admin-profile
```

**Prerequisites:**
- Server running on http://localhost:5000
- Database set up with hotel admin user
- Admin credentials: admin@hotel.com / Admin123!
- Hotel associated with admin account

**Test Coverage:**
- Authentication flow
- Profile retrieval
- Profile updates (various fields)
- Validation rules
- Authorization checks

## Requirements Satisfied

✅ **Requirement 6.1:** Hotel admin can view complete hotel profile with edit capabilities
- Implemented `GET /api/hotel/profile` endpoint
- Returns complete hotel data including rooms

✅ **Requirement 6.2:** Hotel admin can update hotel information
- Implemented `PUT /api/hotel/profile` endpoint
- Supports updating name, description, amenities, images, contact, location
- Changes reflected immediately

✅ **Requirement 6.4:** Images stored using Cloudinary with optimized thumbnails
- Integrated Cloudinary service
- Automatic image optimization
- Thumbnail generation support
- Base64 upload support

## Performance Considerations

1. **Profile Retrieval:** Optimized query with proper includes
2. **Image Upload:** Async upload to Cloudinary (1-3 seconds per image)
3. **Validation:** Fast in-memory validation before database operations
4. **Database:** Uses existing indexes on `admin_id` for fast lookups

## Future Enhancements

Potential improvements for future tasks:
1. Bulk image upload optimization
2. Image deletion from Cloudinary when replaced
3. Image cropping and editing capabilities
4. Version history for profile changes
5. Approval workflow for profile updates
6. Image compression before upload
7. Support for video uploads
8. Multi-language descriptions

## Notes

- Hotel admins can only manage their own hotel (linked by `admin_id`)
- Partial updates supported - only send fields to change
- Images uploaded to Cloudinary are permanent (manual deletion required)
- Star rating is separate from average rating (calculated from reviews)
- Changes are reflected immediately in the database
- No caching implemented yet (can be added in future)

## Conclusion

Task 17 has been successfully implemented with:
- ✅ GET /api/hotel/profile endpoint
- ✅ PUT /api/hotel/profile endpoint
- ✅ Cloudinary integration for image uploads
- ✅ Comprehensive validation
- ✅ Proper authentication and authorization
- ✅ Test script with 9 test cases
- ✅ Complete API documentation
- ✅ All requirements satisfied (6.1, 6.2, 6.4)

The implementation is production-ready and follows best practices for security, validation, and error handling.
