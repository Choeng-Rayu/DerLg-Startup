# Booking API Documentation

## Overview
The Booking API allows authenticated tourists to create and manage hotel room bookings. This document covers the booking creation endpoint.

## Base URL
```
http://localhost:5000/api/bookings
```

## Authentication
All booking endpoints require authentication using JWT Bearer token:
```
Authorization: Bearer <access_token>
```

---

## Create Booking

Creates a new hotel room booking with pending status.

### Endpoint
```http
POST /api/bookings
```

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| hotel_id | UUID | Yes | ID of the hotel |
| room_id | UUID | Yes | ID of the room to book |
| check_in | Date | Yes | Check-in date (YYYY-MM-DD) |
| check_out | Date | Yes | Check-out date (YYYY-MM-DD) |
| guests | Object | Yes | Guest count information |
| guests.adults | Integer | Yes | Number of adults (minimum 1) |
| guests.children | Integer | No | Number of children (default: 0) |
| guest_details | Object | Yes | Primary guest information |
| guest_details.name | String | Yes | Guest full name (2-100 chars) |
| guest_details.email | Email | Yes | Guest email address |
| guest_details.phone | String | Yes | Guest phone number |
| guest_details.special_requests | String | No | Special requests (max 500 chars) |
| payment_method | String | No | Payment method: paypal, bakong, stripe (default: paypal) |
| payment_type | String | No | Payment type: deposit, milestone, full (default: full) |

### Example Request
```json
{
  "hotel_id": "c53ed7a6-cfe9-46a7-aafe-38cd2324f6e1",
  "room_id": "60782e94-2164-43c6-bd90-9dd336d16a7e",
  "check_in": "2025-10-24",
  "check_out": "2025-10-26",
  "guests": {
    "adults": 2,
    "children": 0
  },
  "guest_details": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+855123456789",
    "special_requests": "Late check-in please"
  },
  "payment_method": "paypal",
  "payment_type": "full"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "b54f3a52-3d69-48b8-aceb-4c267eda583e",
      "booking_number": "BK-MH30XL3J-8NWQ",
      "user_id": "3c774425-29ff-4049-8c87-baf9a56413ed",
      "hotel_id": "c53ed7a6-cfe9-46a7-aafe-38cd2324f6e1",
      "room_id": "60782e94-2164-43c6-bd90-9dd336d16a7e",
      "check_in": "2025-10-24",
      "check_out": "2025-10-26",
      "nights": 2,
      "guests": {
        "adults": 2,
        "children": 0
      },
      "guest_details": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+855123456789",
        "special_requests": "Late check-in please"
      },
      "pricing": {
        "room_rate": 180,
        "subtotal": 360,
        "discount": 0,
        "promo_code": null,
        "student_discount": 0,
        "tax": 36,
        "total": 376.2
      },
      "payment": {
        "method": "paypal",
        "type": "full",
        "status": "pending",
        "transactions": [],
        "escrow_status": "held"
      },
      "status": "pending",
      "cancellation": null,
      "calendar_event_id": null,
      "created_at": "2025-10-23T06:10:51.380Z",
      "updated_at": "2025-10-23T06:10:51.380Z",
      "hotel": {
        "id": "c53ed7a6-cfe9-46a7-aafe-38cd2324f6e1",
        "name": "Royal Palace Hotel",
        "location": { ... },
        "contact": { ... },
        "images": [ ... ]
      },
      "room": {
        "id": "60782e94-2164-43c6-bd90-9dd336d16a7e",
        "room_type": "Deluxe Suite",
        "capacity": 2,
        "price_per_night": "180.00",
        "images": [ ... ]
      }
    },
    "message": "Booking created successfully. Please complete payment within 15 minutes."
  },
  "message": "Booking created successfully",
  "timestamp": "2025-10-23T06:10:51.380Z"
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "error": {
    "code": "VAL_2002",
    "message": "Missing required fields: hotel_id, room_id, check_in, check_out, guests, guest_details",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 400 Bad Request - Validation Failed
```json
{
  "success": false,
  "error": {
    "code": "VAL_2001",
    "message": "Validation failed",
    "details": [
      {
        "field": "guests.adults",
        "message": "At least 1 adult is required"
      }
    ],
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 400 Bad Request - Invalid Dates
```json
{
  "success": false,
  "error": {
    "code": "VAL_2003",
    "message": "Check-in date cannot be in the past",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 400 Bad Request - Room Capacity Exceeded
```json
{
  "success": false,
  "error": {
    "code": "VAL_2001",
    "message": "Room capacity exceeded. Maximum capacity is 2 guests",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 400 Bad Request - Room Not Available
```json
{
  "success": false,
  "error": {
    "code": "BOOK_4001",
    "message": "Room is not available for the selected dates",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1003",
    "message": "User not authenticated",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 404 Not Found - Hotel Not Found
```json
{
  "success": false,
  "error": {
    "code": "RES_3001",
    "message": "Hotel not found",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 404 Not Found - Room Not Found
```json
{
  "success": false,
  "error": {
    "code": "RES_3001",
    "message": "Room not found or does not belong to the specified hotel",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "SYS_9001",
    "message": "Failed to create booking",
    "details": "Error details...",
    "timestamp": "2025-10-23T06:10:51.380Z"
  }
}
```

---

## Business Logic

### Pricing Calculation

The booking total is calculated as follows:

1. **Base Price**: `room_rate × nights`
2. **Room Discount**: Applied if room has discount_percentage > 0
3. **Student Discount**: 10% discount if user is verified student (max 3 uses)
4. **Tax**: 10% VAT on subtotal after discounts
5. **Full Payment Discount**: 5% discount if payment_type is "full"

**Formula:**
```
subtotal = room_rate × nights
discount = subtotal × (room.discount_percentage / 100)
student_discount = subtotal × 0.10 (if eligible)
taxable_amount = subtotal - discount - student_discount
tax = taxable_amount × 0.10
total = taxable_amount + tax
final_total = total × 0.95 (if payment_type === "full")
```

### Booking Number Format

Unique booking numbers are generated in the format:
```
BK-{TIMESTAMP}-{RANDOM}
```

Example: `BK-MH30XL3J-8NWQ`

### Booking Status

New bookings are created with status `"pending"` and must be confirmed through payment within 15 minutes.

Status values:
- `pending` - Awaiting payment
- `confirmed` - Payment completed
- `completed` - Guest checked out
- `cancelled` - Booking cancelled
- `rejected` - Booking rejected by hotel

### Room Availability

The system prevents double-booking by checking for conflicting reservations:
- Checks if any existing bookings overlap with the requested dates
- Only allows booking if available rooms > existing bookings for those dates
- Considers bookings with status `pending` or `confirmed`

### Guest Validation

- Minimum 1 adult required
- Children count must be 0 or greater
- Total guests (adults + children) cannot exceed room capacity

### Date Validation

- Check-in date cannot be in the past
- Check-out date must be after check-in date
- Dates must be in YYYY-MM-DD format

---

## Testing

### Test Script
```bash
npm run test:booking-creation
```

### Manual Testing with cURL

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+855123456789",
    "user_type": "tourist"
  }'

# 2. Create a booking (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "hotel_id": "c53ed7a6-cfe9-46a7-aafe-38cd2324f6e1",
    "room_id": "60782e94-2164-43c6-bd90-9dd336d16a7e",
    "check_in": "2025-10-24",
    "check_out": "2025-10-26",
    "guests": {
      "adults": 2,
      "children": 0
    },
    "guest_details": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+855123456789"
    },
    "payment_method": "paypal",
    "payment_type": "full"
  }'
```

---

## Related Documentation

- [Authentication API](./AUTHENTICATION.md)
- [Hotel Search API](./HOTEL_SEARCH_API.md)
- [Hotel Detail API](./HOTEL_DETAIL_API.md)
- [Booking Payment Models](./BOOKING_PAYMENT_MODELS.md)

---

## Notes

- Bookings are created with a 15-minute payment window (to be enforced in payment tasks)
- Email/SMS notifications will be sent upon booking confirmation (future task)
- Google Calendar integration will be added in subsequent tasks
- Payment processing endpoints will be implemented in tasks 20-24
