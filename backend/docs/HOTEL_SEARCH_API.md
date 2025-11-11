# Hotel Search and Listing API Documentation

## Base URL
```
http://localhost:5000/api/hotels
```

## Endpoints

### 1. List All Hotels

**GET** `/api/hotels`

Returns a paginated list of all active hotels.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |

#### Example Request
```bash
curl "http://localhost:5000/api/hotels?page=1&limit=5"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "uuid",
        "name": "Royal Palace Hotel",
        "description": "Luxury hotel in the heart of Phnom Penh...",
        "location": {
          "address": "123 Samdech Sothearos Blvd",
          "city": "Phnom Penh",
          "province": "Phnom Penh",
          "country": "Cambodia",
          "latitude": 11.5564,
          "longitude": 104.9282,
          "google_maps_url": "https://maps.google.com/?q=11.5564,104.9282"
        },
        "contact": {
          "phone": "+855 23 123 456",
          "email": "info@royalpalacehotel.com",
          "website": "https://royalpalacehotel.com"
        },
        "amenities": ["wifi", "pool", "spa", "restaurant", "gym"],
        "images": ["url1", "url2"],
        "logo": "url",
        "star_rating": 5,
        "average_rating": 4.8,
        "total_reviews": 245,
        "status": "active",
        "approval_date": "2025-10-23T00:00:00.000Z",
        "created_at": "2025-10-23T00:00:00.000Z",
        "updated_at": "2025-10-23T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 10,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-10-23T02:53:37.151Z"
}
```

---

### 2. Search Hotels

**GET** `/api/hotels/search`

Search hotels with advanced filtering options.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| destination | string | No | Search by city or province name |
| checkIn | date | No | Check-in date (YYYY-MM-DD) |
| checkOut | date | No | Check-out date (YYYY-MM-DD) |
| guests | integer | No | Minimum guest capacity |
| minPrice | number | No | Minimum price per night |
| maxPrice | number | No | Maximum price per night |
| amenities | string[] | No | Required amenities (can be multiple) |
| starRating | integer | No | Exact star rating (1-5) |
| minRating | number | No | Minimum average rating (0-5) |
| sortBy | string | No | Sort order: `relevance`, `price_low`, `price_high`, `rating` |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10) |

#### Example Requests

**Search by destination:**
```bash
curl "http://localhost:5000/api/hotels/search?destination=Phnom%20Penh"
```

**Search with price range:**
```bash
curl "http://localhost:5000/api/hotels/search?minPrice=50&maxPrice=200"
```

**Search with amenities:**
```bash
curl "http://localhost:5000/api/hotels/search?amenities=wifi&amenities=pool"
```

**Combined search:**
```bash
curl "http://localhost:5000/api/hotels/search?destination=Siem%20Reap&guests=2&minPrice=30&maxPrice=150&starRating=4&sortBy=rating"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "uuid",
        "name": "Angkor Paradise Resort",
        "description": "Beautiful resort near Angkor Wat temples...",
        "location": {...},
        "contact": {...},
        "amenities": ["wifi", "pool", "restaurant"],
        "images": [...],
        "star_rating": 4,
        "average_rating": 4.5,
        "total_reviews": 189,
        "rooms": [
          {
            "id": "uuid",
            "room_type": "Garden View Room",
            "price_per_night": 85,
            "capacity": 2,
            "discount_percentage": 0
          }
        ],
        "starting_price": 85
      }
    ],
    "filters": {
      "destination": "Siem Reap",
      "guests": "2",
      "minPrice": "30",
      "maxPrice": "150",
      "starRating": "4",
      "sortBy": "rating"
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2025-10-23T02:53:37.151Z"
}
```

---

### 3. Get Hotel Details

**GET** `/api/hotels/:id`

Retrieve detailed information about a specific hotel.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Hotel ID |

#### Example Request
```bash
curl "http://localhost:5000/api/hotels/123e4567-e89b-12d3-a456-426614174000"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Royal Palace Hotel",
      "description": "Luxury hotel in the heart of Phnom Penh...",
      "location": {...},
      "contact": {...},
      "amenities": ["wifi", "pool", "spa", "restaurant", "gym"],
      "images": [...],
      "logo": "url",
      "star_rating": 5,
      "average_rating": 4.8,
      "total_reviews": 245,
      "status": "active",
      "rooms": [
        {
          "id": "uuid",
          "room_type": "Deluxe Suite",
          "description": "Spacious suite with king bed...",
          "capacity": 2,
          "bed_type": "king",
          "size_sqm": 45,
          "price_per_night": 180,
          "discount_percentage": 0,
          "amenities": ["wifi", "tv", "minibar", "safe", "balcony"],
          "images": [...],
          "total_rooms": 10,
          "is_active": true
        }
      ]
    }
  },
  "timestamp": "2025-10-23T02:53:37.151Z"
}
```

#### Error Response (404)
```json
{
  "success": false,
  "error": {
    "code": "HOTEL_NOT_FOUND",
    "message": "Hotel not found",
    "timestamp": "2025-10-23T02:53:37.151Z"
  }
}
```

---

### 4. Check Room Availability

**GET** `/api/hotels/:id/availability`

Check real-time room availability for a specific hotel and date range.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Hotel ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| checkIn | date | Yes | Check-in date (YYYY-MM-DD) |
| checkOut | date | Yes | Check-out date (YYYY-MM-DD) |
| guests | integer | No | Minimum guest capacity |

#### Example Request
```bash
curl "http://localhost:5000/api/hotels/123e4567-e89b-12d3-a456-426614174000/availability?checkIn=2025-12-01&checkOut=2025-12-05&guests=2"
```

#### Example Response (Available Rooms)
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Royal Palace Hotel"
    },
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-05",
    "guests": 2,
    "nights": 4,
    "availableRooms": [
      {
        "id": "uuid",
        "room_type": "Deluxe Suite",
        "description": "Spacious suite with king bed...",
        "capacity": 2,
        "bed_type": "king",
        "size_sqm": 45.5,
        "price_per_night": "150.00",
        "discount_percentage": 10,
        "amenities": ["wifi", "tv", "minibar", "safe", "balcony"],
        "images": ["url1", "url2"],
        "total_rooms": 10,
        "available_count": 7,
        "is_available": true,
        "pricing": {
          "base_price": 150,
          "discount_amount": 15,
          "final_price": 135,
          "nights": 4,
          "total": 540
        }
      }
    ],
    "totalRoomsChecked": 3,
    "availableRoomsCount": 1
  },
  "timestamp": "2025-10-23T03:15:42.123Z"
}
```

#### Example Response (No Availability)
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Royal Palace Hotel"
    },
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-05",
    "guests": 6,
    "availableRooms": [],
    "message": "No rooms available for the specified guest count"
  },
  "timestamp": "2025-10-23T03:15:42.123Z"
}
```

#### Error Response (400 - Missing Parameters)
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Check-in and check-out dates are required",
    "timestamp": "2025-10-23T03:15:42.123Z"
  }
}
```

#### Error Response (400 - Invalid Date)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE",
    "message": "Check-out date must be after check-in date",
    "timestamp": "2025-10-23T03:15:42.123Z"
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| HOTEL_FETCH_ERROR | 500 | Failed to fetch hotels |
| HOTEL_SEARCH_ERROR | 500 | Failed to search hotels |
| HOTEL_NOT_FOUND | 404 | Hotel not found or inactive |
| MISSING_PARAMETERS | 400 | Required parameters missing |
| INVALID_DATE | 400 | Invalid date format or logic |
| AVAILABILITY_CHECK_ERROR | 500 | Failed to check availability |

---

## Sorting Options

### `relevance` (default)
Sorts by average rating (DESC) and total reviews (DESC). Best for showing most popular hotels first.

### `price_low`
Sorts by lowest room price (ASC). Best for budget-conscious travelers.

### `price_high`
Sorts by highest room price (DESC). Best for luxury seekers.

### `rating`
Sorts by average rating (DESC). Best for quality-focused travelers.

---

## Amenities List

Common amenities that can be filtered:
- `wifi` - WiFi
- `pool` - Swimming Pool
- `spa` - Spa
- `restaurant` - Restaurant
- `gym` - Fitness Center
- `parking` - Parking
- `bar` - Bar
- `breakfast` - Breakfast Included
- `shuttle` - Airport Shuttle
- `beach` - Beach Access
- `water-sports` - Water Sports
- `rooftop` - Rooftop Terrace

---

## Performance Notes

- All queries are optimized with database indexes
- Response time target: < 2 seconds
- Pagination recommended for large result sets
- Consider implementing caching for frequently searched destinations

---

## Testing

Run the test suites:
```bash
# Test hotel search and listing
npm run test:hotel-search

# Test hotel availability checking
npm run test:hotel-availability
```

Seed test data:
```bash
npm run seed:hotels
```
