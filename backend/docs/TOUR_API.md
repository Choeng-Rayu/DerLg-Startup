# Tour API Documentation

## Overview

The Tour API provides endpoints for browsing tours, viewing tour details, and creating tour bookings. Tours represent guided experiences and activities available in Cambodia.

## Base URL

```
/api/tours
```

## Endpoints

### 1. Get All Tours

Retrieve a list of all active tours with optional filtering and sorting.

**Endpoint:** `GET /api/tours`

**Access:** Public

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| destination | string | No | Filter by destination (partial match) |
| difficulty | string | No | Filter by difficulty: `easy`, `moderate`, `challenging` |
| category | string | No | Filter by category (e.g., "cultural", "adventure") |
| min_price | number | No | Minimum price per person |
| max_price | number | No | Maximum price per person |
| min_days | number | No | Minimum duration in days |
| max_days | number | No | Maximum duration in days |
| group_size | number | No | Filter tours that accommodate this group size |
| guide_required | boolean | No | Filter by guide requirement |
| transportation_required | boolean | No | Filter by transportation requirement |
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 20, max: 100) |
| sort_by | string | No | Sort order: `price_asc`, `price_desc`, `rating`, `popularity`, `duration` |

**Response:**

```json
{
  "success": true,
  "data": {
    "tours": [
      {
        "id": "uuid",
        "name": "Angkor Wat Sunrise Tour",
        "description": "Experience the breathtaking sunrise...",
        "destination": "Siem Reap",
        "duration": {
          "days": 1,
          "nights": 0
        },
        "difficulty": "easy",
        "category": ["cultural", "historical", "photography"],
        "price_per_person": 75.00,
        "group_size": {
          "min": 2,
          "max": 15
        },
        "inclusions": ["Professional guide", "Transportation", ...],
        "exclusions": ["Meals", "Personal expenses", ...],
        "itinerary": [...],
        "images": ["url1", "url2", ...],
        "meeting_point": {
          "address": "Hotel lobby in Siem Reap",
          "latitude": 13.3671,
          "longitude": 103.8448
        },
        "guide_required": true,
        "transportation_required": true,
        "is_active": true,
        "average_rating": 4.8,
        "total_bookings": 156,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "filters": {
      "destination": "Siem Reap",
      "difficulty": "easy",
      ...
    }
  },
  "message": "Tours retrieved successfully"
}
```

**Example Requests:**

```bash
# Get all tours
GET /api/tours

# Get tours in Siem Reap
GET /api/tours?destination=Siem%20Reap

# Get easy tours under $100
GET /api/tours?difficulty=easy&max_price=100

# Get cultural tours sorted by price
GET /api/tours?category=cultural&sort_by=price_asc

# Get tours for a group of 5
GET /api/tours?group_size=5
```

---

### 2. Get Tour by ID

Retrieve detailed information about a specific tour.

**Endpoint:** `GET /api/tours/:id`

**Access:** Public

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Tour ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "tour": {
      "id": "uuid",
      "name": "Angkor Wat Sunrise Tour",
      "description": "Experience the breathtaking sunrise at Angkor Wat...",
      "destination": "Siem Reap",
      "duration": {
        "days": 1,
        "nights": 0
      },
      "difficulty": "easy",
      "category": ["cultural", "historical", "photography"],
      "price_per_person": 75.00,
      "group_size": {
        "min": 2,
        "max": 15
      },
      "inclusions": [
        "Professional English-speaking guide",
        "Air-conditioned transportation",
        "Bottled water",
        "Temple entrance fees",
        "Hotel pickup and drop-off"
      ],
      "exclusions": [
        "Meals",
        "Personal expenses",
        "Tips and gratuities"
      ],
      "itinerary": [
        {
          "day": 1,
          "title": "Angkor Wat Sunrise and Temple Tour",
          "description": "Early morning pickup to witness the stunning sunrise...",
          "activities": [
            "Sunrise viewing at Angkor Wat (5:00 AM)",
            "Explore Angkor Wat temple complex",
            "Visit Angkor Thom and Bayon Temple",
            "Discover Ta Prohm (Tomb Raider temple)"
          ],
          "meals": ["Breakfast (own expense)"],
          "accommodation": null
        }
      ],
      "images": [
        "https://res.cloudinary.com/demo/image/upload/angkor-wat-sunrise.jpg",
        "https://res.cloudinary.com/demo/image/upload/bayon-temple.jpg"
      ],
      "meeting_point": {
        "address": "Hotel lobby in Siem Reap city center",
        "latitude": 13.3671,
        "longitude": 103.8448
      },
      "guide_required": true,
      "transportation_required": true,
      "is_active": true,
      "average_rating": 4.8,
      "total_bookings": 156,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Tour details retrieved successfully"
}
```

**Error Responses:**

```json
// Tour not found
{
  "success": false,
  "error": {
    "code": "TOUR_NOT_FOUND",
    "message": "Tour not found",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}

// Tour not available
{
  "success": false,
  "error": {
    "code": "TOUR_NOT_AVAILABLE",
    "message": "Tour is not available",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Create Tour Booking

Create a new booking for a tour.

**Endpoint:** `POST /api/tours/bookings`

**Access:** Private (Authenticated tourists only)

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "tour_id": "uuid",
  "tour_date": "2025-12-01",
  "participants": 2,
  "guest_details": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "special_requests": "Vegetarian meals preferred"
  },
  "payment_method": "paypal",
  "payment_type": "deposit"
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tour_id | UUID | Yes | ID of the tour to book |
| tour_date | string | Yes | Date of the tour (YYYY-MM-DD format) |
| participants | number | Yes | Number of participants (must be within tour's group size limits) |
| guest_details | object | Yes | Guest contact information |
| guest_details.name | string | Yes | Guest name (2-100 characters) |
| guest_details.email | string | Yes | Valid email address |
| guest_details.phone | string | Yes | Valid phone number |
| guest_details.special_requests | string | No | Special requests (max 500 characters) |
| payment_method | string | No | Payment method: `paypal`, `bakong`, `stripe` (default: `paypal`) |
| payment_type | string | No | Payment type: `deposit`, `milestone`, `full` (default: `deposit`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "TB-1234567890-ABC123",
      "tour": {
        "id": "uuid",
        "name": "Angkor Wat Sunrise Tour",
        "destination": "Siem Reap",
        "duration": {
          "days": 1,
          "nights": 0
        },
        "meeting_point": {
          "address": "Hotel lobby in Siem Reap city center",
          "latitude": 13.3671,
          "longitude": 103.8448
        },
        "itinerary": [...],
        "inclusions": [...],
        "exclusions": [...]
      },
      "tour_date": "2025-12-01T00:00:00.000Z",
      "participants": 2,
      "guest_details": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "special_requests": "Vegetarian meals preferred"
      },
      "pricing": {
        "room_rate": 75.00,
        "subtotal": 150.00,
        "discount": 0,
        "promo_code": null,
        "student_discount": 0,
        "tax": 15.00,
        "total": 165.00
      },
      "payment": {
        "method": "paypal",
        "type": "deposit",
        "status": "pending"
      },
      "status": "pending",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Tour booking created successfully. Please complete payment to confirm your booking.",
  "statusCode": 201
}
```

**Error Responses:**

```json
// Tour not found
{
  "success": false,
  "error": {
    "code": "TOUR_NOT_FOUND",
    "message": "Tour not found",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}

// Tour not available
{
  "success": false,
  "error": {
    "code": "TOUR_NOT_AVAILABLE",
    "message": "Tour is not available for booking",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}

// Invalid group size
{
  "success": false,
  "error": {
    "code": "INVALID_GROUP_SIZE",
    "message": "Group size must be between 2 and 15 participants",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}

// Invalid tour date
{
  "success": false,
  "error": {
    "code": "INVALID_TOUR_DATE",
    "message": "Tour date cannot be in the past",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}

// Validation errors
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "tour_date",
        "message": "Tour date must be a valid date (YYYY-MM-DD)"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Data Models

### Tour Object

```typescript
{
  id: string;                    // UUID
  name: string;                  // Tour name
  description: string;           // Detailed description
  destination: string;           // Primary destination
  duration: {
    days: number;                // Number of days
    nights: number;              // Number of nights
  };
  difficulty: 'easy' | 'moderate' | 'challenging';
  category: string[];            // Array of categories
  price_per_person: number;      // Price in USD
  group_size: {
    min: number;                 // Minimum group size
    max: number;                 // Maximum group size
  };
  inclusions: string[];          // What's included
  exclusions: string[];          // What's not included
  itinerary: DayItinerary[];     // Day-by-day plan
  images: string[];              // Image URLs
  meeting_point: {
    address: string;
    latitude: number;
    longitude: number;
  };
  guide_required: boolean;
  transportation_required: boolean;
  is_active: boolean;
  average_rating: number;        // 0-5
  total_bookings: number;
  created_at: Date;
  updated_at: Date;
}
```

### Day Itinerary Object

```typescript
{
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation: string | null;
}
```

---

## Testing

### Seed Tour Data

```bash
npm run seed:tours
```

### Run Tour API Tests

```bash
npm run test:tours
```

The test suite includes:
1. User login (to get auth token)
2. Get all tours (public)
3. Get tours with filters
4. Get tour by ID (public)
5. Create tour booking (authenticated)
6. Invalid group size validation
7. Past date validation

---

## Integration with Booking System

Tour bookings are stored in the same `bookings` table as hotel bookings, with the following differences:

- `hotel_id` and `room_id` are set to `null`
- `check_in` represents the tour start date
- `check_out` is calculated based on tour duration
- `nights` equals the tour duration in days
- `pricing.room_rate` stores the price per person
- `guests.adults` stores the number of participants

This unified approach allows:
- Consistent booking management across hotels and tours
- Shared payment processing logic
- Unified booking history for users
- Common cancellation and refund policies

---

## Requirements Covered

This implementation addresses the following requirements from the specification:

- **Requirement 30.1**: Tours section with searchable listings including destination, duration, price, and difficulty
- **Requirement 30.2**: Tour booking with date selection, participant count, and optional add-ons
- **Requirement 30.3**: Tour details including itinerary, inclusions, exclusions, meeting point, and cancellation policy

---

## Next Steps

Future enhancements may include:

1. Tour availability calendar
2. Guide assignment for tours
3. Transportation booking integration
4. Group discount calculations
5. Tour reviews and ratings
6. Real-time availability updates
7. Multi-day tour accommodation management
8. Tour package combinations
