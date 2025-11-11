# Hotel Detail and Availability API Documentation

## Overview
API endpoints for retrieving detailed hotel information and checking room availability.

## Endpoints

### 1. Get Hotel by ID

Retrieve comprehensive hotel information including rooms, reviews, and pricing.

**Endpoint:** `GET /api/hotels/:id`

**Authentication:** Not required (public endpoint)

**URL Parameters:**
- `id` (string, required): Hotel UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "3939d26d-6da9-4a59-973e-dc7b63761a96",
      "name": "Angkor Paradise Hotel",
      "description": "Luxury hotel near Angkor Wat...",
      "location": {
        "address": "123 Sivatha Blvd",
        "city": "Siem Reap",
        "province": "Siem Reap",
        "country": "Cambodia",
        "latitude": 13.3633,
        "longitude": 103.8564,
        "google_maps_url": "https://maps.google.com/..."
      },
      "contact": {
        "phone": "+855-12-345-678",
        "email": "info@angkorparadise.com",
        "website": "https://angkorparadise.com"
      },
      "amenities": ["wifi", "pool", "parking", "restaurant", "spa"],
      "images": [
        "https://res.cloudinary.com/.../hotel1.jpg",
        "https://res.cloudinary.com/.../hotel2.jpg"
      ],
      "logo": "https://res.cloudinary.com/.../logo.jpg",
      "star_rating": 5,
      "average_rating": 4.75,
      "total_reviews": 128,
      "status": "active",
      "starting_price": 85.50,
      "rooms": [
        {
          "id": "room-uuid-1",
          "room_type": "Deluxe Suite",
          "description": "Spacious suite with city view...",
          "capacity": 2,
          "bed_type": "king",
          "size_sqm": 45.00,
          "price_per_night": 120.00,
          "discount_percentage": 15.00,
          "amenities": ["ac", "tv", "minibar", "balcony"],
          "images": ["https://res.cloudinary.com/.../room1.jpg"],
          "total_rooms": 10,
          "pricing": {
            "base_price": 120.00,
            "discount_amount": 18.00,
            "final_price": 102.00
          }
        },
        {
          "id": "room-uuid-2",
          "room_type": "Standard Room",
          "description": "Comfortable room with garden view...",
          "capacity": 2,
          "bed_type": "queen",
          "size_sqm": 30.00,
          "price_per_night": 95.00,
          "discount_percentage": 10.00,
          "amenities": ["ac", "tv", "wifi"],
          "images": ["https://res.cloudinary.com/.../room2.jpg"],
          "total_rooms": 20,
          "pricing": {
            "base_price": 95.00,
            "discount_amount": 9.50,
            "final_price": 85.50
          }
        }
      ],
      "reviews": [
        {
          "id": "review-uuid-1",
          "ratings": {
            "overall": 5,
            "cleanliness": 5,
            "service": 5,
            "location": 4,
            "value": 5
          },
          "comment": "Absolutely wonderful stay! The staff was incredibly friendly...",
          "sentiment": {
            "score": 0.92,
            "classification": "positive",
            "topics": [
              { "topic": "staff", "sentiment": 0.95 },
              { "topic": "cleanliness", "sentiment": 0.90 }
            ]
          },
          "images": ["https://res.cloudinary.com/.../review1.jpg"],
          "helpful_count": 15,
          "is_verified": true,
          "admin_response": "Thank you for your wonderful review!",
          "user": {
            "id": "user-uuid",
            "first_name": "Sarah",
            "last_name": "Johnson",
            "profile_image": "https://res.cloudinary.com/.../user.jpg"
          },
          "created_at": "2025-10-15T08:30:00.000Z"
        }
      ],
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-10-20T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**

```json
// Hotel not found
{
  "success": false,
  "error": {
    "code": "HOTEL_NOT_FOUND",
    "message": "Hotel not found",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}

// Server error
{
  "success": false,
  "error": {
    "code": "HOTEL_FETCH_ERROR",
    "message": "Failed to fetch hotel",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Hotel found and returned
- `404 Not Found`: Hotel doesn't exist or is not active
- `500 Internal Server Error`: Server error

---

### 2. Check Hotel Availability

Check room availability for a specific date range and calculate pricing.

**Endpoint:** `GET /api/hotels/:id/availability`

**Authentication:** Not required (public endpoint)

**URL Parameters:**
- `id` (string, required): Hotel UUID

**Query Parameters:**
- `checkIn` (string, required): Check-in date in YYYY-MM-DD format
- `checkOut` (string, required): Check-out date in YYYY-MM-DD format
- `guests` (number, optional): Number of guests (filters rooms by capacity)

**Example Request:**
```
GET /api/hotels/3939d26d-6da9-4a59-973e-dc7b63761a96/availability?checkIn=2025-11-01&checkOut=2025-11-04&guests=2
```

**Response:**

```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "3939d26d-6da9-4a59-973e-dc7b63761a96",
      "name": "Angkor Paradise Hotel"
    },
    "checkIn": "2025-11-01",
    "checkOut": "2025-11-04",
    "nights": 3,
    "guests": 2,
    "availableRooms": [
      {
        "id": "room-uuid-1",
        "room_type": "Deluxe Suite",
        "description": "Spacious suite with city view...",
        "capacity": 2,
        "bed_type": "king",
        "size_sqm": 45.00,
        "price_per_night": 120.00,
        "discount_percentage": 15.00,
        "amenities": ["ac", "tv", "minibar", "balcony"],
        "images": ["https://res.cloudinary.com/.../room1.jpg"],
        "total_rooms": 10,
        "available_count": 7,
        "is_available": true,
        "pricing": {
          "base_price": 120.00,
          "discount_amount": 18.00,
          "final_price": 102.00,
          "nights": 3,
          "total": 306.00
        }
      },
      {
        "id": "room-uuid-2",
        "room_type": "Standard Room",
        "description": "Comfortable room with garden view...",
        "capacity": 2,
        "bed_type": "queen",
        "size_sqm": 30.00,
        "price_per_night": 95.00,
        "discount_percentage": 10.00,
        "amenities": ["ac", "tv", "wifi"],
        "images": ["https://res.cloudinary.com/.../room2.jpg"],
        "total_rooms": 20,
        "available_count": 15,
        "is_available": true,
        "pricing": {
          "base_price": 95.00,
          "discount_amount": 9.50,
          "final_price": 85.50,
          "nights": 3,
          "total": 256.50
        }
      }
    ],
    "totalRoomsChecked": 2,
    "availableRoomsCount": 2
  }
}
```

**Error Responses:**

```json
// Missing parameters
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Check-in and check-out dates are required",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}

// Invalid date format
{
  "success": false,
  "error": {
    "code": "INVALID_DATE",
    "message": "Invalid date format",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}

// Past check-in date
{
  "success": false,
  "error": {
    "code": "INVALID_DATE",
    "message": "Check-in date cannot be in the past",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}

// Check-out before check-in
{
  "success": false,
  "error": {
    "code": "INVALID_DATE",
    "message": "Check-out date must be after check-in date",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}

// Hotel not found
{
  "success": false,
  "error": {
    "code": "HOTEL_NOT_FOUND",
    "message": "Hotel not found",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}

// Server error
{
  "success": false,
  "error": {
    "code": "AVAILABILITY_CHECK_ERROR",
    "message": "Failed to check availability",
    "timestamp": "2025-10-23T03:30:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Availability checked successfully
- `400 Bad Request`: Invalid parameters or dates
- `404 Not Found`: Hotel doesn't exist or is not active
- `500 Internal Server Error`: Server error

---

## Data Models

### Hotel Object
```typescript
{
  id: string;                    // UUID
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    latitude: number;
    longitude: number;
    google_maps_url: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  amenities: string[];           // Array of amenity codes
  images: string[];              // Cloudinary URLs
  logo: string | null;           // Cloudinary URL
  star_rating: number;           // 1-5
  average_rating: number;        // 0-5 (decimal)
  total_reviews: number;
  status: 'active';              // Only active hotels returned
  starting_price: number;        // Lowest room price
  rooms: Room[];
  reviews: Review[];
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
}
```

### Room Object
```typescript
{
  id: string;                    // UUID
  room_type: string;
  description: string;
  capacity: number;              // Max guests
  bed_type: string;              // 'single' | 'double' | 'queen' | 'king' | 'twin' | 'bunk'
  size_sqm: number | null;
  price_per_night: number;
  discount_percentage: number;   // 0-100
  amenities: string[];
  images: string[];              // Cloudinary URLs
  total_rooms: number;           // Total inventory
  available_count?: number;      // Only in availability response
  is_available?: boolean;        // Only in availability response
  pricing: {
    base_price: number;
    discount_amount: number;
    final_price: number;
    nights?: number;             // Only in availability response
    total?: number;              // Only in availability response
  };
}
```

### Review Object
```typescript
{
  id: string;                    // UUID
  ratings: {
    overall: number;             // 1-5
    cleanliness: number;         // 1-5
    service: number;             // 1-5
    location: number;            // 1-5
    value: number;               // 1-5
  };
  comment: string;
  sentiment: {
    score: number;               // 0-1
    classification: 'positive' | 'neutral' | 'negative';
    topics: Array<{
      topic: string;
      sentiment: number;         // 0-1
    }>;
  } | null;
  images: string[];              // Cloudinary URLs
  helpful_count: number;
  is_verified: boolean;
  admin_response: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
  created_at: string;            // ISO 8601
}
```

## Business Logic

### Availability Calculation

The availability check considers:
1. **Overlapping Bookings**: Counts bookings that overlap with the requested date range
2. **Booking Status**: Only considers 'pending' and 'confirmed' bookings
3. **Room Inventory**: Calculates available rooms as `total_rooms - overlapping_bookings`
4. **Guest Capacity**: Filters rooms that can accommodate the requested number of guests

### Pricing Calculation

Pricing is calculated as:
1. **Base Price**: Original `price_per_night` from room
2. **Discount Amount**: `base_price * (discount_percentage / 100)`
3. **Final Price**: `base_price - discount_amount`
4. **Total**: `final_price * nights` (only in availability response)

### Review Inclusion

- Maximum 10 most recent reviews per hotel
- Reviews ordered by `created_at` descending
- Includes user information (name, profile image)
- Includes sentiment analysis if available

## Usage Examples

### Example 1: Get Hotel Details

```bash
curl -X GET http://localhost:5000/api/hotels/3939d26d-6da9-4a59-973e-dc7b63761a96
```

### Example 2: Check Availability

```bash
curl -X GET "http://localhost:5000/api/hotels/3939d26d-6da9-4a59-973e-dc7b63761a96/availability?checkIn=2025-11-01&checkOut=2025-11-04&guests=2"
```

### Example 3: Check Availability Without Guest Filter

```bash
curl -X GET "http://localhost:5000/api/hotels/3939d26d-6da9-4a59-973e-dc7b63761a96/availability?checkIn=2025-11-01&checkOut=2025-11-04"
```

## Testing

Run the test suite:
```bash
npm run test:hotel-detail
```

## Related Endpoints

- `GET /api/hotels` - List all hotels with pagination
- `GET /api/hotels/search` - Search hotels with filters
- `POST /api/bookings` - Create a booking (requires authentication)

## Notes

- All dates should be in YYYY-MM-DD format
- Prices are in USD
- Only active hotels and rooms are returned
- Reviews are limited to 10 most recent
- Availability is calculated in real-time based on existing bookings
