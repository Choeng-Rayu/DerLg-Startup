# Hotel Admin Profile Management API

This document describes the Hotel Admin Profile Management endpoints that allow hotel administrators to view and update their hotel information.

## Overview

Hotel administrators can manage their hotel profile through dedicated endpoints. These endpoints require authentication and admin role authorization. The system supports updating hotel information including name, description, location, contact details, amenities, images, and star rating.

## Authentication

All endpoints require:
- Valid JWT access token in Authorization header
- User role: `admin` (hotel administrator)

## Endpoints

### 1. Get Hotel Profile

Retrieve the complete hotel profile for the authenticated admin.

**Endpoint:** `GET /api/hotel/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "uuid",
      "admin_id": "uuid",
      "name": "Grand Hotel Phnom Penh",
      "description": "Luxury hotel in the heart of Phnom Penh...",
      "location": {
        "address": "123 Monivong Blvd",
        "city": "Phnom Penh",
        "province": "Phnom Penh",
        "country": "Cambodia",
        "latitude": 11.5564,
        "longitude": 104.9282,
        "google_maps_url": "https://maps.google.com/..."
      },
      "contact": {
        "phone": "+855-23-123-456",
        "email": "info@grandhotel.com",
        "website": "https://grandhotel.com"
      },
      "amenities": ["wifi", "parking", "pool", "gym", "restaurant"],
      "images": [
        "https://res.cloudinary.com/derlg/hotels/image1.jpg",
        "https://res.cloudinary.com/derlg/hotels/image2.jpg"
      ],
      "logo": "https://res.cloudinary.com/derlg/hotels/logos/logo.jpg",
      "star_rating": 5,
      "average_rating": 4.5,
      "total_reviews": 120,
      "status": "active",
      "approval_date": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-10T08:00:00.000Z",
      "updated_at": "2024-01-20T14:30:00.000Z",
      "rooms": [
        {
          "id": "uuid",
          "room_type": "Deluxe Suite",
          "description": "Spacious suite with city view",
          "capacity": 2,
          "bed_type": "King",
          "size_sqm": 45,
          "price_per_night": "150.00",
          "discount_percentage": 10,
          "amenities": ["wifi", "tv", "minibar"],
          "images": ["https://res.cloudinary.com/..."],
          "total_rooms": 10,
          "is_active": true
        }
      ]
    }
  }
}
```

**Error Responses:**

- **401 Unauthorized:** No token or invalid token
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1001",
    "message": "No authentication token provided",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **403 Forbidden:** User is not an admin
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1004",
    "message": "Forbidden - Insufficient permissions",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **404 Not Found:** No hotel found for this admin
```json
{
  "success": false,
  "error": {
    "code": "HOTEL_NOT_FOUND",
    "message": "No hotel found for this admin account",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

### 2. Update Hotel Profile

Update hotel information. All fields are optional - only provided fields will be updated.

**Endpoint:** `PUT /api/hotel/profile`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Hotel Name",
  "description": "Updated hotel description with more details",
  "location": {
    "address": "456 New Street",
    "city": "Siem Reap",
    "province": "Siem Reap",
    "country": "Cambodia",
    "latitude": 13.3633,
    "longitude": 103.8564,
    "google_maps_url": "https://maps.google.com/..."
  },
  "contact": {
    "phone": "+855-63-123-456",
    "email": "contact@hotel.com",
    "website": "https://hotel.com"
  },
  "amenities": ["wifi", "parking", "pool", "gym", "restaurant", "spa"],
  "images": [
    "https://res.cloudinary.com/existing-image.jpg",
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ],
  "logo": "data:image/png;base64,iVBORw0KGgo...",
  "star_rating": 5
}
```

**Field Descriptions:**

- `name` (string, optional): Hotel name (2-255 characters)
- `description` (string, optional): Hotel description (required if provided)
- `location` (object, optional): Location details
  - `address` (string, required): Street address
  - `city` (string, required): City name
  - `province` (string, required): Province/state
  - `country` (string, required): Country name
  - `latitude` (number, required): Latitude (-90 to 90)
  - `longitude` (number, required): Longitude (-180 to 180)
  - `google_maps_url` (string, optional): Google Maps URL
- `contact` (object, optional): Contact information
  - `phone` (string, required): Phone number
  - `email` (string, required): Valid email address
  - `website` (string, optional): Website URL
- `amenities` (array, optional): Array of amenity codes
- `images` (array, optional): Array of image URLs or base64 strings
  - Existing URLs will be preserved
  - Base64 strings will be uploaded to Cloudinary
- `logo` (string/null, optional): Logo URL or base64 string
  - Base64 strings will be uploaded to Cloudinary
  - Set to `null` to remove logo
- `star_rating` (number, optional): Star rating (1-5)

**Image Upload:**

Images can be provided in two formats:
1. **Existing URL:** `"https://res.cloudinary.com/..."`
2. **Base64 String:** `"data:image/jpeg;base64,/9j/4AAQSkZJRg..."`

Base64 images will be automatically uploaded to Cloudinary and the URL will be stored.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Hotel profile updated successfully",
    "hotel": {
      "id": "uuid",
      "name": "Updated Hotel Name",
      "description": "Updated hotel description...",
      "location": { ... },
      "contact": { ... },
      "amenities": [...],
      "images": [
        "https://res.cloudinary.com/derlg/hotels/new-image.jpg"
      ],
      "logo": "https://res.cloudinary.com/derlg/hotels/logos/new-logo.jpg",
      "star_rating": 5,
      "updated_at": "2024-01-20T15:00:00.000Z",
      "rooms": [...]
    }
  }
}
```

**Validation Errors (400 Bad Request):**

- **Invalid Name:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Hotel name must be between 2 and 255 characters",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **Invalid Description:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Hotel description is required",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **Invalid Location:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Location.city is required",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **Invalid Coordinates:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Latitude must be between -90 and 90",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **Invalid Contact:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Contact email must be valid",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **Invalid Amenities:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Amenities must be an array",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

- **Invalid Star Rating:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Star rating must be between 1 and 5",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

**Image Upload Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "code": "IMAGE_UPLOAD_ERROR",
    "message": "Failed to upload image: Invalid image format",
    "timestamp": "2024-01-20T10:00:00.000Z"
  }
}
```

## Cloudinary Integration

The system integrates with Cloudinary for image storage and optimization:

- **Upload Folder:** `derlg/hotels/` for hotel images, `derlg/hotels/logos/` for logos
- **Automatic Optimization:** Images are automatically optimized for web delivery
- **Transformations:** 
  - Max dimensions: 1920x1080
  - Quality: Auto
  - Format: Auto (WebP when supported)
- **Thumbnails:** Automatically generated (300x200)

## Usage Examples

### Example 1: Update Hotel Name and Description

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luxury Grand Hotel",
    "description": "Experience luxury in the heart of Cambodia"
  }'
```

### Example 2: Update Contact Information

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "phone": "+855-23-999-888",
      "email": "info@luxuryhotel.com",
      "website": "https://luxuryhotel.com"
    }
  }'
```

### Example 3: Update Amenities

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amenities": ["wifi", "parking", "pool", "gym", "restaurant", "spa", "bar"]
  }'
```

### Example 4: Upload New Images

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ]
  }'
```

## Testing

Run the test script to verify the implementation:

```bash
npm run test:hotel-admin-profile
```

The test script will:
1. Login as hotel admin
2. Retrieve hotel profile
3. Update various hotel fields
4. Test validation rules
5. Test authorization

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **Requirement 6.1:** Hotel admin can view complete hotel profile with edit capabilities
- **Requirement 6.2:** Hotel admin can update hotel information (name, description, amenities, images)
- **Requirement 6.4:** Images are stored using Cloudinary with optimized thumbnails

## Security

- All endpoints require JWT authentication
- Only users with `admin` role can access these endpoints
- Admins can only access their own hotel profile
- Input validation prevents malicious data
- Image uploads are validated and sanitized

## Performance

- Images are optimized automatically by Cloudinary
- Thumbnails are generated for faster loading
- Database queries are optimized with proper indexes
- Response times typically under 500ms for profile retrieval
- Image uploads may take 1-3 seconds depending on size

## Notes

- Hotel admins can only manage their own hotel (linked by `admin_id`)
- Changes are reflected immediately in the database
- Images uploaded to Cloudinary are permanent (manual deletion required if needed)
- The system supports partial updates - only send fields you want to change
- Star rating is separate from average rating (which is calculated from reviews)
