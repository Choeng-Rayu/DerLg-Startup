# Booking Management API Documentation

This document describes the booking management endpoints that allow users to view, modify, and cancel their bookings.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Get User Bookings](#get-user-bookings)
  - [Get Booking by ID](#get-booking-by-id)
  - [Update Booking](#update-booking)
  - [Cancel Booking](#cancel-booking)
- [Cancellation Policy](#cancellation-policy)
- [Error Codes](#error-codes)
- [Testing](#testing)

## Overview

The Booking Management API provides endpoints for users to manage their bookings throughout the booking lifecycle. Users can:

- View all their bookings (categorized as upcoming, active, or past)
- View detailed information about a specific booking
- Modify booking details (dates, guest information) at least 48 hours before check-in
- Cancel bookings with automatic refund calculation based on cancellation policy

## Authentication

All booking management endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Users can only access and manage their own bookings. Attempting to access another user's booking will result in a 404 error.

## Endpoints

### Get User Bookings

Retrieve all bookings for the authenticated user.

**Endpoint:** `GET /api/bookings`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by booking status (pending, confirmed, completed, cancelled, rejected) |
| category | string | No | Filter by category (upcoming, active, past, all). Default: all |

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": {
      "upcoming": [
        {
          "id": "uuid",
          "booking_number": "BK-ABC123",
          "hotel": {
            "id": "uuid",
            "name": "Hotel Name",
            "location": {...},
            "images": [...]
          },
          "room": {
            "id": "uuid",
            "room_type": "Deluxe Suite",
            "capacity": 2
          },
          "check_in": "2024-02-01",
          "check_out": "2024-02-03",
          "nights": 2,
          "guests": {
            "adults": 2,
            "children": 0
          },
          "pricing": {
            "total": 250.00
          },
          "status": "confirmed",
          "is_upcoming": true,
          "is_active": false,
          "is_past": false
        }
      ],
      "active": [],
      "past": []
    },
    "total": 1
  },
  "message": "Bookings retrieved successfully"
}
```

**Example with Category Filter:**

```bash
# Get only upcoming bookings
curl -X GET "http://localhost:3000/api/bookings?category=upcoming" \
  -H "Authorization: Bearer <token>"

# Get only past bookings
curl -X GET "http://localhost:3000/api/bookings?category=past" \
  -H "Authorization: Bearer <token>"
```

### Get Booking by ID

Retrieve detailed information about a specific booking.

**Endpoint:** `GET /api/bookings/:id`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The booking ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-ABC123",
      "user_id": "uuid",
      "hotel_id": "uuid",
      "room_id": "uuid",
      "check_in": "2024-02-01",
      "check_out": "2024-02-03",
      "nights": 2,
      "guests": {
        "adults": 2,
        "children": 0
      },
      "guest_details": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "special_requests": "Late check-in"
      },
      "pricing": {
        "room_rate": 100.00,
        "subtotal": 200.00,
        "discount": 0,
        "student_discount": 0,
        "tax": 20.00,
        "total": 220.00
      },
      "payment": {
        "method": "paypal",
        "type": "full",
        "status": "completed",
        "transactions": [...],
        "escrow_status": "held"
      },
      "status": "confirmed",
      "hotel": {
        "id": "uuid",
        "name": "Hotel Name",
        "description": "...",
        "location": {...},
        "amenities": [...],
        "images": [...]
      },
      "room": {
        "id": "uuid",
        "room_type": "Deluxe Suite",
        "description": "...",
        "capacity": 2,
        "amenities": [...],
        "images": [...]
      },
      "is_upcoming": true,
      "is_active": false,
      "is_past": false
    }
  },
  "message": "Booking retrieved successfully"
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

### Update Booking

Modify booking details such as dates, guest count, or guest information. Bookings can only be modified at least 48 hours before check-in.

**Endpoint:** `PUT /api/bookings/:id`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The booking ID |

**Request Body:**

```json
{
  "check_in": "2024-02-02",
  "check_out": "2024-02-05",
  "guests": {
    "adults": 2,
    "children": 1
  },
  "guest_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "special_requests": "Early check-in requested"
  }
}
```

**Note:** All fields are optional. Only include the fields you want to update.

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-ABC123",
      "check_in": "2024-02-02",
      "check_out": "2024-02-05",
      "nights": 3,
      "guests": {
        "adults": 2,
        "children": 1
      },
      "guest_details": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "special_requests": "Early check-in requested"
      },
      "pricing": {
        "total": 330.00
      },
      "status": "confirmed"
    },
    "price_change": {
      "difference": 110.00,
      "action_required": "additional_payment",
      "amount": 110.00
    },
    "message": "Booking updated successfully"
  },
  "message": "Booking updated successfully"
}
```

**Price Change Actions:**

- `additional_payment`: User needs to pay the difference
- `refund`: User will receive a refund for the difference
- `none`: No price change

**Restrictions:**

- Only pending or confirmed bookings can be modified
- Modifications must be made at least 48 hours before check-in
- New dates must not conflict with existing bookings
- Guest count cannot exceed room capacity

**Example:**

```bash
# Update guest details only
curl -X PUT "http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_details": {
      "special_requests": "Need extra pillows"
    }
  }'

# Update dates
curl -X PUT "http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "check_in": "2024-02-02",
    "check_out": "2024-02-05"
  }'
```

### Cancel Booking

Cancel a booking with automatic refund calculation based on the cancellation policy.

**Endpoint:** `DELETE /api/bookings/:id/cancel`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The booking ID |

**Request Body:**

```json
{
  "reason": "Change of plans"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-ABC123",
      "status": "cancelled",
      "cancellation": {
        "cancelled_at": "2024-01-15T10:30:00Z",
        "reason": "Change of plans",
        "refund_amount": 220.00,
        "refund_status": "pending"
      }
    },
    "cancellation_details": {
      "refund_amount": 220.00,
      "refund_status": "pending",
      "policy_applied": "Full refund (minus processing fees)",
      "days_until_checkin": 45,
      "processing_time": "5-10 business days"
    },
    "message": "Booking cancelled successfully. Refund of $220.00 will be processed within 5-10 business days."
  },
  "message": "Booking cancelled successfully"
}
```

**Refund Status Values:**

- `pending`: Refund will be processed
- `no_refund`: No refund applicable based on policy
- `not_applicable`: No payment was made yet

**Restrictions:**

- Only pending or confirmed bookings can be cancelled
- Already cancelled bookings cannot be cancelled again

**Example:**

```bash
curl -X DELETE "http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000/cancel" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Travel plans changed"
  }'
```

## Cancellation Policy

The refund amount is automatically calculated based on the following policy:

### Full Refund (minus processing fees)
- **When:** Cancellation 30+ days before check-in
- **Refund:** 100% of total amount (minus payment processing fees)

### 50% Refund
- **When:** Cancellation 7-30 days before check-in
- **Refund:** 50% of total amount

### Within 7 Days of Check-in

**For Deposit Payments:**
- **Refund:** Deposit is retained, no refund

**For Milestone/Full Payments:**
- **Refund:** 50% of total amount

### Calculation Example

```javascript
// Booking total: $220.00
// Days until check-in: 45 days

// Policy applied: Full refund (minus processing fees)
// Refund amount: $220.00 (100%)

// Days until check-in: 15 days
// Policy applied: 50% refund
// Refund amount: $110.00 (50%)

// Days until check-in: 3 days, payment type: deposit
// Policy applied: Deposit retained, no refund
// Refund amount: $0.00
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| AUTH_1003 | User not authenticated | 401 |
| VAL_2001 | Invalid input (format, value) | 400 |
| VAL_2002 | Missing required fields | 400 |
| VAL_2003 | Invalid date range | 400 |
| RES_3001 | Booking not found | 404 |
| BOOK_4001 | Room not available | 400 |
| BOOK_4002 | Booking already cancelled | 400 |
| BOOK_4004 | Invalid booking status for operation | 400 |
| SYS_9001 | Internal server error | 500 |

## Testing

### Prerequisites

1. Server must be running on `http://localhost:3000`
2. Database must be set up with test data
3. Test user must exist with credentials:
   - Email: `test@example.com`
   - Password: `Test1234`

### Run Tests

```bash
# Run the test script
npm run test:booking-management

# Or using ts-node directly
npx ts-node src/scripts/testBookingManagement.ts
```

### Test Coverage

The test script covers:

1. ✓ User authentication
2. ✓ Create test booking
3. ✓ Get all user bookings
4. ✓ Get bookings by category (upcoming, active, past)
5. ✓ Get specific booking by ID
6. ✓ Update booking guest details
7. ✓ Update booking dates with price recalculation
8. ✓ Cancel booking with refund calculation
9. ✓ Error handling for invalid booking ID
10. ✓ Error handling for unauthorized access

### Manual Testing with cURL

```bash
# 1. Login
TOKEN=$(curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' \
  | jq -r '.data.access_token')

# 2. Get all bookings
curl -X GET "http://localhost:3000/api/bookings" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get upcoming bookings only
curl -X GET "http://localhost:3000/api/bookings?category=upcoming" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get specific booking
curl -X GET "http://localhost:3000/api/bookings/<booking-id>" \
  -H "Authorization: Bearer $TOKEN"

# 5. Update booking
curl -X PUT "http://localhost:3000/api/bookings/<booking-id>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_details": {
      "special_requests": "Need extra towels"
    }
  }'

# 6. Cancel booking
curl -X DELETE "http://localhost:3000/api/bookings/<booking-id>/cancel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Testing cancellation"
  }'
```

## Integration with Frontend

### React/Next.js Example

```typescript
// Get user bookings
const getBookings = async (category?: string) => {
  const url = category 
    ? `/api/bookings?category=${category}`
    : '/api/bookings';
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// Get specific booking
const getBooking = async (bookingId: string) => {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// Update booking
const updateBooking = async (bookingId: string, updates: any) => {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  return response.json();
};

// Cancel booking
const cancelBooking = async (bookingId: string, reason: string) => {
  const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });
  
  return response.json();
};
```

## Best Practices

1. **Always check booking status** before allowing modifications
2. **Display clear cancellation policy** to users before they cancel
3. **Show price changes** prominently when dates are modified
4. **Implement confirmation dialogs** for cancellations
5. **Handle price differences** appropriately (additional payment or refund)
6. **Display refund timeline** clearly to users
7. **Categorize bookings** (upcoming, active, past) for better UX
8. **Show booking details** including hotel, room, and guest information
9. **Validate date changes** to ensure room availability
10. **Log all booking modifications** for audit trail

## Related Documentation

- [Booking Creation API](./BOOKING_API.md)
- [Payment Options API](./PAYMENT_OPTIONS.md)
- [Authentication API](./AUTHENTICATION.md)
- [Hotel Search API](./HOTEL_SEARCH_API.md)
