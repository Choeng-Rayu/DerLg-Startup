# Promo Code API Documentation

## Overview

The Promo Code system allows users to apply discount codes to their bookings. Promo codes can be created by super admins and hotel admins, and can be configured with various discount types, validity periods, usage limits, and applicability rules.

## Endpoint

### Apply Promo Code to Booking

Apply a promo code to an existing pending booking.

**Endpoint:** `POST /api/bookings/:id/promo-code`

**Authentication:** Required (Tourist)

**Request Parameters:**

- `id` (path parameter): UUID of the booking

**Request Body:**

```json
{
  "promo_code": "SUMMER2025"
}
```

**Validation Rules:**

- `promo_code`: Required, string, 3-50 characters, uppercase letters and numbers only

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Promo code applied successfully! You saved 30.00.",
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-1234567890",
      "pricing": {
        "room_rate": 100,
        "subtotal": 300,
        "discount": 0,
        "promo_code": "SUMMER2025",
        "promo_discount": 30,
        "student_discount": 0,
        "tax": 27,
        "total": 297
      },
      // ... other booking fields
    },
    "promo_code_details": {
      "code": "SUMMER2025",
      "description": "10% off summer bookings",
      "discount_applied": 30,
      "savings": 30,
      "new_total": 297,
      "old_total": 327
    }
  }
}
```

**Error Responses:**

1. **Invalid Promo Code (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2004",
    "message": "Invalid promo code",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

2. **Promo Code Already Applied (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2001",
    "message": "A promo code (SUMMER2025) is already applied to this booking. Please remove it first.",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

3. **Promo Code Expired (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2004",
    "message": "Promo code has expired",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

4. **Minimum Booking Amount Not Met (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2004",
    "message": "Minimum booking amount of 200.00 is required to use this promo code",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

5. **Promo Code Not Applicable (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2004",
    "message": "This promo code is not applicable to the selected hotel",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

6. **New User Only Promo Code (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2004",
    "message": "This promo code is only available for new users",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

7. **Booking Not Found (404 Not Found)**
```json
{
  "success": false,
  "error": {
    "code": "RES_3001",
    "message": "Booking not found or you do not have permission to modify it",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

8. **Booking Not Pending (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "BOOK_4004",
    "message": "Promo codes can only be applied to pending bookings",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

## Promo Code Validation Rules

The system validates promo codes against the following criteria:

### 1. Active Status
- Promo code must be active (`is_active = true`)

### 2. Validity Period
- Current date must be between `valid_from` and `valid_until`

### 3. Usage Limit
- `usage_count` must be less than `usage_limit`

### 4. Minimum Booking Amount
- Booking subtotal (after room discount and student discount) must meet or exceed `min_booking_amount`

### 5. Applicability
- If `applicable_to` is "all", promo code can be applied to any booking
- If `applicable_to` is "hotels", promo code can only be applied to hotel bookings
- If `applicable_ids` is not empty, booking must be for one of the specified items

### 6. User Type Eligibility
- If `user_type` is "all", any user can use the promo code
- If `user_type` is "new", only users with no completed bookings can use it
- If `user_type` is "returning", only users with at least one completed booking can use it

## Discount Calculation

### Percentage Discount
- Discount = (Subtotal × Discount Percentage) / 100
- If `max_discount` is set, discount is capped at that amount
- Example: 10% off $300 = $30 discount

### Fixed Amount Discount
- Discount = Fixed discount value
- Example: $50 off = $50 discount

### Final Total Calculation
1. Calculate subtotal (room rate × nights)
2. Apply room discount (if any)
3. Apply student discount (if any)
4. Apply promo code discount
5. Calculate tax (10% of taxable amount)
6. Final total = Taxable amount + Tax

## Usage Count Increment

When a promo code is successfully applied:
1. The `usage_count` is incremented by 1
2. The promo code is stored in the booking's `pricing.promo_code` field
3. The discount amount is stored in `pricing.promo_discount`

## Example Usage Flow

### Step 1: Create a Booking
```bash
POST /api/bookings
{
  "hotel_id": "hotel-uuid",
  "room_id": "room-uuid",
  "check_in": "2025-07-01",
  "check_out": "2025-07-04",
  "guests": {
    "adults": 2,
    "children": 0
  },
  "guest_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+855123456789"
  },
  "payment_method": "paypal",
  "payment_type": "full"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-uuid",
      "booking_number": "BK-1234567890",
      "pricing": {
        "total": 327
      }
    }
  }
}
```

### Step 2: Apply Promo Code
```bash
POST /api/bookings/booking-uuid/promo-code
{
  "promo_code": "SUMMER2025"
}
```

Response:
```json
{
  "success": true,
  "message": "Promo code applied successfully! You saved 30.00.",
  "data": {
    "booking": {
      "pricing": {
        "total": 297,
        "promo_code": "SUMMER2025",
        "promo_discount": 30
      }
    },
    "promo_code_details": {
      "savings": 30,
      "new_total": 297,
      "old_total": 327
    }
  }
}
```

## Testing

To test the promo code functionality:

1. Ensure the backend server is running
2. Ensure hotels are seeded: `npm run seed:hotels`
3. Create a test promo code in the database (via super admin dashboard or direct SQL)
4. Register a test user
5. Create a booking
6. Apply the promo code to the booking

## Requirements Covered

This implementation satisfies the following requirements:

- **Requirement 22.1**: Promo code input field during booking process
- **Requirement 22.2**: Validate and apply discount to booking total
- **Requirement 22.3**: Validate expiration dates, usage limits, and applicable hotels

## Related Documentation

- [Booking API](./BOOKING_API.md)
- [Payment Options](./PAYMENT_OPTIONS.md)
- [Supporting Models](./SUPPORTING_MODELS.md)
