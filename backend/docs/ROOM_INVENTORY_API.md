# Room Inventory Management API Documentation

## Overview

The Room Inventory Management API allows hotel administrators to manage their room types, pricing, and availability. All endpoints require authentication and hotel admin role authorization.

## Authentication

All endpoints require:
- Valid JWT access token in Authorization header
- User must have `admin` role (UserType.ADMIN)
- User must be associated with a hotel

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Get All Rooms

Retrieve all room types for the authenticated hotel admin's hotel.

**Endpoint:** `GET /api/rooms`

**Authentication:** Required (Admin only)

**Request:**
```http
GET /api/rooms HTTP/1.1
Host: localhost:5000
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "uuid",
        "hotel_id": "uuid",
        "room_type": "Deluxe Suite",
        "description": "Spacious deluxe suite with ocean view",
        "capacity": 4,
        "bed_type": "king",
        "size_sqm": 45.5,
        "price_per_night": 150.00,
        "discount_percentage": 10,
        "amenities": ["wifi", "tv", "minibar", "balcony"],
        "images": ["https://cloudinary.com/room1.jpg"],
        "total_rooms": 5,
        "is_active": true,
        "created_at": "2025-10-23T10:00:00.000Z",
        "updated_at": "2025-10-23T10:00:00.000Z"
      }
    ]
  },
  "timestamp": "2025-10-23T10:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User is not a hotel admin
- `404 Not Found` - No hotel found for this admin account
- `500 Internal Server Error` - Server error

---

### 2. Create Room

Create a new room type for the authenticated hotel admin's hotel.

**Endpoint:** `POST /api/rooms`

**Authentication:** Required (Admin only)

**Request:**
```http
POST /api/rooms HTTP/1.1
Host: localhost:5000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "room_type": "Deluxe Suite",
  "description": "Spacious deluxe suite with ocean view and modern amenities",
  "capacity": 4,
  "bed_type": "king",
  "size_sqm": 45.5,
  "price_per_night": 150.00,
  "discount_percentage": 10,
  "amenities": ["wifi", "tv", "minibar", "balcony", "ocean_view"],
  "images": ["https://cloudinary.com/room1.jpg"],
  "total_rooms": 5
}
```

**Request Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| room_type | string | Yes | Name of the room type (e.g., "Deluxe Suite") |
| description | string | Yes | Detailed description of the room |
| capacity | number | Yes | Maximum number of guests (1-20) |
| bed_type | string | Yes | Type of bed: single, double, queen, king, twin, bunk |
| size_sqm | number | No | Room size in square meters (min: 1) |
| price_per_night | number | Yes | Base price per night (must be positive) |
| discount_percentage | number | No | Discount percentage (0-100), default: 0 |
| amenities | string[] | No | Array of amenity names, default: [] |
| images | string[] | No | Array of image URLs or base64 strings, default: [] |
| total_rooms | number | No | Number of rooms of this type (min: 1), default: 1 |

**Image Upload:**
- Images can be provided as URLs or base64-encoded strings
- Base64 format: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`
- Images are automatically uploaded to Cloudinary
- Supported formats: JPEG, PNG, WebP

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "hotel_id": "uuid",
      "room_type": "Deluxe Suite",
      "description": "Spacious deluxe suite with ocean view and modern amenities",
      "capacity": 4,
      "bed_type": "king",
      "size_sqm": 45.5,
      "price_per_night": 150.00,
      "discount_percentage": 10,
      "amenities": ["wifi", "tv", "minibar", "balcony", "ocean_view"],
      "images": ["https://res.cloudinary.com/..."],
      "total_rooms": 5,
      "is_active": true,
      "created_at": "2025-10-23T10:00:00.000Z",
      "updated_at": "2025-10-23T10:00:00.000Z"
    }
  },
  "message": "Room created successfully",
  "timestamp": "2025-10-23T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors:
  - Missing required fields
  - Invalid capacity (must be 1-20)
  - Invalid price (must be positive)
  - Invalid discount percentage (must be 0-100)
  - Invalid total rooms (must be at least 1)
  - Invalid amenities format (must be array)
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User is not a hotel admin
- `404 Not Found` - No hotel found for this admin account
- `500 Internal Server Error` - Server error or image upload failure

---

### 3. Update Room

Update an existing room type for the authenticated hotel admin's hotel.

**Endpoint:** `PUT /api/rooms/:id`

**Authentication:** Required (Admin only)

**Request:**
```http
PUT /api/rooms/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "room_type": "Premium Deluxe Suite",
  "price_per_night": 175.00,
  "discount_percentage": 15,
  "amenities": ["wifi", "tv", "minibar", "balcony", "ocean_view", "jacuzzi"],
  "is_active": true
}
```

**Request Body Parameters:**

All fields are optional. Only provided fields will be updated.

| Field | Type | Description |
|-------|------|-------------|
| room_type | string | Name of the room type (min: 2 characters) |
| description | string | Detailed description of the room |
| capacity | number | Maximum number of guests (1-20) |
| bed_type | string | Type of bed: single, double, queen, king, twin, bunk |
| size_sqm | number | Room size in square meters (min: 1) or null |
| price_per_night | number | Base price per night (must be positive) |
| discount_percentage | number | Discount percentage (0-100) |
| amenities | string[] | Array of amenity names |
| images | string[] | Array of image URLs or base64 strings |
| total_rooms | number | Number of rooms of this type (min: 1) |
| is_active | boolean | Whether the room is active/bookable |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Room updated successfully",
    "room": {
      "id": "uuid",
      "hotel_id": "uuid",
      "room_type": "Premium Deluxe Suite",
      "description": "Spacious deluxe suite with ocean view and modern amenities",
      "capacity": 4,
      "bed_type": "king",
      "size_sqm": 45.5,
      "price_per_night": 175.00,
      "discount_percentage": 15,
      "amenities": ["wifi", "tv", "minibar", "balcony", "ocean_view", "jacuzzi"],
      "images": ["https://res.cloudinary.com/..."],
      "total_rooms": 5,
      "is_active": true,
      "created_at": "2025-10-23T10:00:00.000Z",
      "updated_at": "2025-10-23T10:30:00.000Z"
    }
  },
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors (same as create)
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User is not a hotel admin
- `404 Not Found` - Room not found or doesn't belong to admin's hotel
- `500 Internal Server Error` - Server error or image upload failure

---

### 4. Delete Room

Delete a room type from the authenticated hotel admin's hotel.

**Endpoint:** `DELETE /api/rooms/:id`

**Authentication:** Required (Admin only)

**Request:**
```http
DELETE /api/rooms/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Room deleted successfully"
  },
  "timestamp": "2025-10-23T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Room has active bookings:
  ```json
  {
    "success": false,
    "error": {
      "code": "ROOM_HAS_ACTIVE_BOOKINGS",
      "message": "Cannot delete room with active bookings. Please cancel or complete all bookings first.",
      "timestamp": "2025-10-23T10:00:00.000Z"
    }
  }
  ```
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User is not a hotel admin
- `404 Not Found` - Room not found or doesn't belong to admin's hotel
- `500 Internal Server Error` - Server error

**Important Notes:**
- Rooms with active bookings (status: pending or confirmed) cannot be deleted
- Consider deactivating rooms instead of deleting them to preserve booking history
- Deleted rooms cannot be recovered

---

## Validation Rules

### Room Type
- Required for creation
- Minimum 2 characters
- Maximum 255 characters

### Description
- Required for creation
- Cannot be empty

### Capacity
- Required for creation
- Must be between 1 and 20 guests
- Integer value

### Bed Type
- Required for creation
- Must be one of: single, double, queen, king, twin, bunk

### Size (sqm)
- Optional
- If provided, must be at least 1 square meter
- Can be set to null

### Price Per Night
- Required for creation
- Must be a positive number
- Decimal with 2 decimal places

### Discount Percentage
- Optional, defaults to 0
- Must be between 0 and 100
- Decimal with 2 decimal places

### Amenities
- Optional, defaults to empty array
- Must be an array of strings
- Common amenities: wifi, tv, minibar, balcony, ocean_view, air_conditioning, safe, coffee_maker, etc.

### Images
- Optional, defaults to empty array
- Must be an array of strings (URLs or base64)
- Base64 images are automatically uploaded to Cloudinary
- Supported formats: JPEG, PNG, WebP

### Total Rooms
- Optional, defaults to 1
- Must be at least 1
- Integer value

### Is Active
- Optional, defaults to true
- Boolean value
- Inactive rooms are not shown to customers

---

## Common Use Cases

### 1. Create a Basic Room

```javascript
const response = await fetch('http://localhost:5000/api/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    room_type: 'Standard Room',
    description: 'Comfortable standard room with city view',
    capacity: 2,
    bed_type: 'queen',
    price_per_night: 80.00
  })
});
```

### 2. Update Room Price and Discount

```javascript
const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    price_per_night: 95.00,
    discount_percentage: 20
  })
});
```

### 3. Deactivate Room (Instead of Deleting)

```javascript
const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    is_active: false
  })
});
```

### 4. Upload Room Images

```javascript
// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const base64Image = await fileToBase64(imageFile);

const response = await fetch('http://localhost:5000/api/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    room_type: 'Deluxe Suite',
    description: 'Luxury suite with panoramic views',
    capacity: 4,
    bed_type: 'king',
    price_per_night: 200.00,
    images: [base64Image] // Will be uploaded to Cloudinary
  })
});
```

---

## Error Codes

| Code | Description |
|------|-------------|
| HOTEL_NOT_FOUND | No hotel found for this admin account |
| ROOM_NOT_FOUND | Room not found or doesn't belong to admin's hotel |
| ROOM_FETCH_ERROR | Failed to fetch rooms |
| ROOM_CREATE_ERROR | Failed to create room |
| ROOM_UPDATE_ERROR | Failed to update room |
| ROOM_DELETE_ERROR | Failed to delete room |
| ROOM_HAS_ACTIVE_BOOKINGS | Cannot delete room with active bookings |
| MISSING_REQUIRED_FIELDS | Required fields are missing |
| INVALID_CAPACITY | Room capacity must be between 1 and 20 |
| INVALID_PRICE | Price must be a positive number |
| INVALID_DISCOUNT | Discount percentage must be between 0 and 100 |
| INVALID_TOTAL_ROOMS | Total rooms must be at least 1 |
| INVALID_ROOM_TYPE | Room type must be at least 2 characters |
| INVALID_DESCRIPTION | Description is required |
| INVALID_BED_TYPE | Invalid bed type |
| INVALID_SIZE | Room size must be at least 1 square meter |
| INVALID_AMENITIES | Amenities must be an array |
| INVALID_IMAGES | Images must be an array |
| IMAGE_UPLOAD_ERROR | Failed to upload image to Cloudinary |
| VALIDATION_ERROR | Sequelize validation error |
| AUTH_1002 | Invalid or expired token |
| AUTH_1003 | Insufficient permissions |

---

## Testing

Run the comprehensive test suite:

```bash
# Make sure the server is running
npm run dev

# In another terminal, run the test
npm run test:room-inventory
```

The test suite covers:
- ✓ Hotel admin authentication
- ✓ Getting hotel profile
- ✓ Listing all rooms
- ✓ Creating a new room
- ✓ Validation errors (invalid capacity, negative price)
- ✓ Updating room details
- ✓ Listing rooms after creation
- ✓ Deleting a room
- ✓ Verifying room deletion
- ✓ Unauthorized access protection

---

## Integration with Other Features

### Hotel Profile Management
- Rooms are automatically included when fetching hotel profile
- Use `GET /api/hotel/profile` to see all rooms with hotel details

### Room Availability
- Room inventory affects availability calculations
- Use `GET /api/hotels/:id/availability` to check room availability for specific dates

### Booking System
- Rooms with active bookings cannot be deleted
- Room capacity and pricing are used during booking creation
- Discount percentages are applied automatically

### Image Management
- Images are stored on Cloudinary
- Base64 images are automatically uploaded
- Image URLs are returned in responses

---

## Best Practices

1. **Room Naming**: Use clear, descriptive room type names (e.g., "Deluxe Ocean View Suite" instead of "Room 1")

2. **Pricing Strategy**: 
   - Set competitive base prices
   - Use discount percentages for promotions
   - Update prices seasonally

3. **Capacity Management**:
   - Set realistic capacity limits
   - Consider bed configuration when setting capacity

4. **Image Quality**:
   - Upload high-quality images (recommended: 1920x1080 or higher)
   - Include multiple angles of the room
   - Show key amenities in images

5. **Amenities**:
   - Be specific and accurate
   - Use consistent naming across rooms
   - Update amenities when facilities change

6. **Deactivation vs Deletion**:
   - Prefer deactivating rooms over deletion
   - Deactivation preserves booking history
   - Deleted rooms cannot be recovered

7. **Inventory Management**:
   - Keep `total_rooms` count accurate
   - Update when rooms are renovated or added
   - Monitor availability regularly

---

## Related Documentation

- [Hotel Admin Profile API](./HOTEL_ADMIN_PROFILE.md)
- [Hotel Search API](./HOTEL_SEARCH_API.md)
- [Hotel Detail API](./HOTEL_DETAIL_API.md)
- [Authorization Guide](./AUTHORIZATION.md)
- [Authentication Guide](./AUTHENTICATION.md)
# Room Inventory Management API

## Overview
API endpoints for hotel administrators to manage their room inventory. All endpoints require authentication and admin role authorization.

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Get All Rooms
Retrieve all rooms for the authenticated hotel admin's hotel.

**Endpoint**: `GET /api/rooms`

**Authorization**: Required (Admin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "uuid",
        "hotel_id": "uuid",
        "room_type": "Deluxe Suite",
        "description": "Spacious suite with ocean view",
        "capacity": 4,
        "bed_type": "king",
        "size_sqm": 45.5,
        "price_per_night": 150.00,
        "discount_percentage": 10,
        "amenities": ["wifi", "tv", "minibar"],
        "images": ["url1", "url2"],
        "total_rooms": 5,
        "is_active": true,
        "discounted_price": 135.00,
        "created_at": "2025-10-23T04:00:00.000Z",
        "updated_at": "2025-10-23T04:00:00.000Z"
      }
    ]
  }
}
```

### 2. Create Room
Create a new room for the hotel admin's hotel.

**Endpoint**: `POST /api/rooms`

**Authorization**: Required (Admin only)

**Request Body**:
```json
{
  "room_type": "Deluxe Suite",
  "description": "Spacious deluxe suite with ocean view and modern amenities",
  "capacity": 4,
  "bed_type": "king",
  "size_sqm": 45.5,
  "price_per_night": 150.00,
  "discount_percentage": 10,
  "amenities": ["wifi", "tv", "minibar", "balcony", "ocean_view"],
  "images": [],
  "total_rooms": 5
}
```

**Required Fields**:
- room_type (string, 2-100 characters)
- description (string, not empty)
- capacity (number, 1-20)
- bed_type (string: single, double, queen, king, twin, bunk)
- price_per_night (number, > 0)

**Optional Fields**:
- size_sqm (number, >= 1)
- discount_percentage (number, 0-100, default: 0)
- amenities (array of strings, default: [])
- images (array of strings or base64, default: [])
- total_rooms (number, >= 1, default: 1)

**Response**:
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "hotel_id": "uuid",
      "room_type": "Deluxe Suite",
      "description": "Spacious deluxe suite with ocean view",
      "capacity": 4,
      "bed_type": "king",
      "size_sqm": 45.5,
      "price_per_night": 150.00,
      "discount_percentage": 10,
      "amenities": ["wifi", "tv", "minibar"],
      "images": [],
      "total_rooms": 5,
      "is_active": true,
      "discounted_price": 135.00,
      "created_at": "2025-10-23T04:00:00.000Z",
      "updated_at": "2025-10-23T04:00:00.000Z"
    }
  },
  "message": "Room created successfully"
}
```

### 3. Update Room
Update room details for the authenticated hotel admin's hotel.

**Endpoint**: `PUT /api/rooms/:id`

**Authorization**: Required (Admin only)

**URL Parameters**:
- id (string, required): Room UUID

**Request Body** (all fields optional):
```json
{
  "room_type": "Premium Deluxe Suite",
  "description": "Updated description",
  "capacity": 4,
  "bed_type": "king",
  "size_sqm": 50.0,
  "price_per_night": 175.00,
  "discount_percentage": 15,
  "amenities": ["wifi", "tv", "minibar", "jacuzzi"],
  "images": ["url1", "url2"],
  "total_rooms": 5,
  "is_active": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "hotel_id": "uuid",
      "room_type": "Premium Deluxe Suite",
      "price_per_night": 175.00,
      "discount_percentage": 15,
      "discounted_price": 148.75,
      ...
    }
  },
  "message": "Room updated successfully"
}
```

### 4. Delete Room
Delete a room from the hotel admin's hotel.

**Endpoint**: `DELETE /api/rooms/:id`

**Authorization**: Required (Admin only)

**URL Parameters**:
- id (string, required): Room UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Room deleted successfully"
  }
}
```

**Note**: Cannot delete rooms with active bookings (pending or confirmed status).

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CAPACITY",
    "message": "Room capacity must be between 1 and 20 guests",
    "timestamp": "2025-10-23T04:00:00.000Z"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1002",
    "message": "Token expired or invalid",
    "timestamp": "2025-10-23T04:00:00.000Z"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1004",
    "message": "Insufficient permissions",
    "timestamp": "2025-10-23T04:00:00.000Z"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "Room not found or does not belong to your hotel",
    "timestamp": "2025-10-23T04:00:00.000Z"
  }
}
```

## Error Codes

- `HOTEL_NOT_FOUND` - No hotel found for admin account
- `MISSING_REQUIRED_FIELDS` - Required fields missing
- `INVALID_CAPACITY` - Capacity out of range (1-20)
- `INVALID_PRICE` - Non-positive price
- `INVALID_DISCOUNT` - Discount out of range (0-100)
- `INVALID_TOTAL_ROOMS` - Total rooms less than 1
- `INVALID_AMENITIES` - Amenities not an array
- `INVALID_IMAGES` - Images not an array
- `IMAGE_UPLOAD_ERROR` - Image upload failed
- `VALIDATION_ERROR` - Sequelize validation errors
- `ROOM_NOT_FOUND` - Room not found or unauthorized
- `ROOM_HAS_ACTIVE_BOOKINGS` - Cannot delete room with active bookings
- `ROOM_FETCH_ERROR` - Failed to fetch rooms
- `ROOM_CREATE_ERROR` - Failed to create room
- `ROOM_UPDATE_ERROR` - Failed to update room
- `ROOM_DELETE_ERROR` - Failed to delete room

## Image Upload

Images can be provided in two formats:

1. **Base64 String** (will be uploaded to Cloudinary):
```json
{
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ]
}
```

2. **Direct URL** (will be stored as-is):
```json
{
  "images": [
    "https://res.cloudinary.com/demo/image/upload/room1.jpg"
  ]
}
```

## Validation Rules

### Capacity
- Minimum: 1 guest
- Maximum: 20 guests
- Type: Integer

### Price Per Night
- Minimum: 0.01
- Type: Decimal (10,2)

### Discount Percentage
- Minimum: 0
- Maximum: 100
- Type: Decimal (5,2)

### Room Type
- Minimum length: 2 characters
- Maximum length: 100 characters
- Type: String

### Bed Type
- Allowed values: single, double, queen, king, twin, bunk
- Type: Enum

### Size (sqm)
- Minimum: 1
- Type: Decimal (6,2)
- Optional

### Total Rooms
- Minimum: 1
- Type: Integer

## Usage Examples

### cURL Examples

#### Get All Rooms
```bash
curl -X GET http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Room
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_type": "Deluxe Suite",
    "description": "Spacious suite with ocean view",
    "capacity": 4,
    "bed_type": "king",
    "price_per_night": 150.00,
    "discount_percentage": 10,
    "amenities": ["wifi", "tv", "minibar"],
    "total_rooms": 5
  }'
```

#### Update Room
```bash
curl -X PUT http://localhost:5000/api/rooms/ROOM_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_per_night": 175.00,
    "discount_percentage": 15
  }'
```

#### Delete Room
```bash
curl -X DELETE http://localhost:5000/api/rooms/ROOM_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Notes

- All endpoints require hotel admin authentication
- Admins can only manage rooms for their own hotel
- Rooms with active bookings cannot be deleted
- Images are automatically optimized when uploaded to Cloudinary
- Discounted price is calculated automatically based on price_per_night and discount_percentage
- All timestamps are in ISO 8601 format (UTC)
