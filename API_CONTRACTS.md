# DerLg Tourism Platform - API Contracts

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**Base URL:** `http://localhost:5000/api` (Development)  
**Production URL:** `https://api.derlg.com/api`

## Table of Contents

1. [Authentication](#authentication)
2. [Hotels](#hotels)
3. [Rooms](#rooms)
4. [Bookings](#bookings)
5. [Payments](#payments)
6. [Tours](#tours)
7. [Events](#events)
8. [Reviews](#reviews)
9. [Wishlist](#wishlist)
10. [Messages](#messages)
11. [Error Codes](#error-codes)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User

**Endpoint:** `POST /auth/register`  
**Authentication:** None  
**Description:** Create a new user account

**Request Body:**
```typescript
{
  email: string;           // Valid email format
  password: string;        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  first_name: string;      // 1-100 characters
  last_name: string;       // 1-100 characters
  phone?: string;          // E.164 format (e.g., +855123456789)
  language?: 'en' | 'km' | 'zh';  // Default: 'en'
  currency?: 'USD' | 'KHR';       // Default: 'USD'
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      user_type: 'tourist';
      language: string;
      currency: string;
      is_student: boolean;
      email_verified: boolean;
      created_at: string;
    };
    tokens: {
      access_token: string;   // 24h expiration
      refresh_token: string;  // 30d expiration
    };
  };
  timestamp: string;
}
```

### Login

**Endpoint:** `POST /auth/login`  
**Authentication:** None  
**Description:** Authenticate user with email and password

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      user_type: 'super_admin' | 'admin' | 'tourist';
      // ... other user fields
    };
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
  timestamp: string;
}
```

### Google OAuth

**Endpoint:** `POST /auth/social/google`  
**Authentication:** None  
**Description:** Authenticate with Google OAuth 2.0

**Request Body:**
```typescript
{
  code: string;  // Authorization code from Google
}
```

**Response:** `200 OK` (Same as login)

### Facebook OAuth

**Endpoint:** `POST /auth/social/facebook`  
**Authentication:** None  
**Description:** Authenticate with Facebook Login

**Request Body:**
```typescript
{
  access_token: string;  // Facebook access token
}
```

**Response:** `200 OK` (Same as login)

### Refresh Token

**Endpoint:** `POST /auth/refresh-token`  
**Authentication:** None  
**Description:** Get new access token using refresh token

**Request Body:**
```typescript
{
  refresh_token: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    access_token: string;
    refresh_token: string;
  };
  timestamp: string;
}
```

### Logout

**Endpoint:** `POST /auth/logout`  
**Authentication:** Required  
**Description:** Invalidate current refresh token

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    message: 'Logged out successfully';
  };
  timestamp: string;
}
```

### Get Current User

**Endpoint:** `GET /auth/me`  
**Authentication:** Required  
**Description:** Get authenticated user's profile

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
    profile_image: string | null;
    language: string;
    currency: string;
    is_student: boolean;
    student_discount_remaining: number;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
  };
  timestamp: string;
}
```

### Forgot Password

**Endpoint:** `POST /auth/forgot-password`  
**Authentication:** None  
**Description:** Request password reset link

**Request Body:**
```typescript
{
  email?: string;
  phone?: string;  // At least one required
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    message: 'Password reset link sent';
    method: 'email' | 'sms';
  };
  timestamp: string;
}
```

### Reset Password

**Endpoint:** `POST /auth/reset-password`  
**Authentication:** None  
**Description:** Reset password with token

**Request Body:**
```typescript
{
  token: string;
  new_password: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    message: 'Password reset successfully';
  };
  timestamp: string;
}
```

---

## Hotels

### Search Hotels

**Endpoint:** `GET /hotels/search`  
**Authentication:** None  
**Description:** Search hotels with filters

**Query Parameters:**
```typescript
{
  destination?: string;      // City or province name
  check_in?: string;         // YYYY-MM-DD format
  check_out?: string;        // YYYY-MM-DD format
  guests?: number;           // Number of guests
  min_price?: number;        // Minimum price per night
  max_price?: number;        // Maximum price per night
  amenities?: string[];      // Array of amenity names
  star_rating?: number;      // 1-5 stars
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;             // Default: 1
  limit?: number;            // Default: 20, Max: 100
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    hotels: Array<{
      id: string;
      name: string;
      description: string;
      location: {
        city: string;
        province: string;
        address: string;
        latitude: number;
        longitude: number;
      };
      images: string[];
      star_rating: number;
      average_rating: number;
      total_reviews: number;
      starting_price: number;
      amenities: string[];
      status: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
  timestamp: string;
}
```

### List All Hotels

**Endpoint:** `GET /hotels`  
**Authentication:** None  
**Description:** Get paginated list of all active hotels

**Query Parameters:**
```typescript
{
  page?: number;    // Default: 1
  limit?: number;   // Default: 20
}
```

**Response:** `200 OK` (Same structure as search)

### Get Hotel Details

**Endpoint:** `GET /hotels/:id`  
**Authentication:** None  
**Description:** Get detailed information about a specific hotel

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    id: string;
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
    amenities: string[];
    images: string[];
    star_rating: number;
    average_rating: number;
    total_reviews: number;
    total_bookings: number;
    status: string;
    rooms: Array<{
      id: string;
      room_type: string;
      description: string;
      capacity: number;
      bed_type: string;
      size_sqm: number;
      price_per_night: number;
      discount_percentage: number;
      final_price: number;
      amenities: string[];
      images: string[];
      total_rooms: number;
      available_rooms: number;
      is_active: boolean;
    }>;
    reviews: Array<{
      id: string;
      user: {
        id: string;
        first_name: string;
        last_name: string;
        profile_image: string | null;
      };
      ratings: {
        overall: number;
        cleanliness: number;
        service: number;
        location: number;
        value: number;
      };
      comment: string;
      sentiment: {
        classification: 'positive' | 'neutral' | 'negative';
        score: number;
      } | null;
      is_verified: boolean;
      created_at: string;
    }>;
    created_at: string;
    updated_at: string;
  };
  timestamp: string;
}
```

### Check Hotel Availability

**Endpoint:** `GET /hotels/:id/availability`  
**Authentication:** None  
**Description:** Check room availability for specific dates

**Query Parameters:**
```typescript
{
  check_in: string;   // YYYY-MM-DD format (required)
  check_out: string;  // YYYY-MM-DD format (required)
  guests: number;     // Number of guests (required)
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    hotel_id: string;
    check_in: string;
    check_out: string;
    nights: number;
    available_rooms: Array<{
      id: string;
      room_type: string;
      capacity: number;
      price_per_night: number;
      discount_percentage: number;
      final_price: number;
      total_price: number;  // final_price * nights
      available_count: number;
      images: string[];
      amenities: string[];
    }>;
  };
  timestamp: string;
}
```

---

## Rooms

### Get Hotel Rooms (Admin)

**Endpoint:** `GET /rooms`  
**Authentication:** Required (Hotel Admin)  
**Description:** Get all rooms for authenticated hotel admin

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    rooms: Array<{
      id: string;
      hotel_id: string;
      room_type: string;
      description: string;
      capacity: number;
      bed_type: string;
      size_sqm: number;
      price_per_night: number;
      discount_percentage: number;
      amenities: string[];
      images: string[];
      total_rooms: number;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
  };
  timestamp: string;
}
```

### Create Room (Admin)

**Endpoint:** `POST /rooms`  
**Authentication:** Required (Hotel Admin)  
**Description:** Create a new room type

**Request Body:**
```typescript
{
  room_type: string;
  description: string;
  capacity: number;          // 1-20
  bed_type: string;
  size_sqm: number;
  price_per_night: number;   // Must be positive
  discount_percentage?: number;  // 0-100
  amenities: string[];
  images: string[];          // Cloudinary URLs
  total_rooms: number;       // Must be positive
  is_active?: boolean;       // Default: true
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    room: {
      id: string;
      // ... all room fields
    };
  };
  timestamp: string;
}
```

### Update Room (Admin)

**Endpoint:** `PUT /rooms/:id`  
**Authentication:** Required (Hotel Admin)  
**Description:** Update room details

**Request Body:** (Same as Create Room, all fields optional)

**Response:** `200 OK`

### Delete Room (Admin)

**Endpoint:** `DELETE /rooms/:id`  
**Authentication:** Required (Hotel Admin)  
**Description:** Delete a room type

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    message: 'Room deleted successfully';
  };
  timestamp: string;
}
```

---

## Bookings

### Get Payment Options

**Endpoint:** `POST /bookings/payment-options`  
**Authentication:** None  
**Description:** Calculate available payment options for a booking before creating it

**Request Body:**
```typescript
{
  room_id: string;           // UUID of the room
  check_in: string;          // YYYY-MM-DD
  check_out: string;         // YYYY-MM-DD
  guests: {
    adults: number;          // Min: 1
    children: number;        // Min: 0, Default: 0
  };
  deposit_percentage?: number; // 50-70, Default: 60
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    pricing_breakdown: {
      room_rate: number;
      nights: number;
      subtotal: number;
      room_discount: number;
      student_discount: number;
      tax: number;
      total: number;
    };
    payment_options: {
      deposit: {
        payment_type: 'deposit';
        original_total: number;
        discount_amount: number;
        final_total: number;
        deposit_amount: number;
        remaining_balance: number;
        payment_schedule: [
          {
            milestone: 1;
            percentage: number;
            amount: number;
            due_date: string;
            description: string;
          },
          {
            milestone: 2;
            percentage: number;
            amount: number;
            due_date: string;
            description: string;
          }
        ];
      };
      milestone: {
        payment_type: 'milestone';
        original_total: number;
        discount_amount: number;
        final_total: number;
        payment_schedule: [
          {
            milestone: 1;
            percentage: 50;
            amount: number;
            due_date: string;
            description: '50% upfront payment';
          },
          {
            milestone: 2;
            percentage: 25;
            amount: number;
            due_date: string;
            description: '25% payment one week before check-in';
          },
          {
            milestone: 3;
            percentage: 25;
            amount: number;
            due_date: string;
            description: '25% payment upon arrival';
          }
        ];
      };
      full: {
        payment_type: 'full';
        original_total: number;
        discount_amount: number;  // 5% discount
        final_total: number;
        bonus_services: [
          'Free airport pickup',
          'Priority check-in',
          'Complimentary welcome drink'
        ];
      };
    };
  };
  message: 'Payment options calculated successfully';
  timestamp: string;
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input (deposit percentage out of range, invalid dates, etc.)
- `404 Not Found` - Room not found
- `500 Internal Server Error` - Server error

---

### Create Booking

**Endpoint:** `POST /bookings`  
**Authentication:** Required  
**Description:** Create a new booking

**Request Body:**
```typescript
{
  hotel_id: string;
  room_id: string;
  check_in: string;          // YYYY-MM-DD
  check_out: string;         // YYYY-MM-DD
  guests: {
    adults: number;          // Min: 1
    children: number;        // Min: 0
  };
  guest_details: {
    name: string;
    email: string;
    phone: string;
    special_requests?: string;
  };
  payment_method: 'paypal' | 'bakong' | 'stripe';
  payment_type: 'deposit' | 'milestone' | 'full';
  promo_code?: string;
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    booking: {
      id: string;
      booking_number: string;
      user_id: string;
      hotel_id: string;
      room_id: string;
      check_in: string;
      check_out: string;
      nights: number;
      guests: {
        adults: number;
        children: number;
      };
      guest_details: {
        name: string;
        email: string;
        phone: string;
        special_requests: string;
      };
      pricing: {
        room_rate: number;
        subtotal: number;
        discount: number;
        promo_code: string | null;
        student_discount: number;
        tax: number;
        total: number;
      };
      payment: {
        method: string;
        type: string;
        status: 'pending';
        transactions: [];
        escrow_status: 'held';
      };
      status: 'pending';
      created_at: string;
    };
    payment_intent: {
      // Payment gateway specific data
      // For PayPal: order_id, approval_url
      // For Stripe: payment_intent_id, client_secret
      // For Bakong: qr_code, md5_hash
    };
  };
  timestamp: string;
}
```

### ⚠️ Get User Bookings (NOT IMPLEMENTED)

**Endpoint:** `GET /bookings`  
**Authentication:** Required  
**Description:** Get all bookings for authenticated user

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
}
```

**Expected Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    bookings: Array<{
      id: string;
      booking_number: string;
      hotel: {
        id: string;
        name: string;
        images: string[];
        location: { city: string; province: string; };
      };
      room: {
        id: string;
        room_type: string;
        images: string[];
      };
      check_in: string;
      check_out: string;
      nights: number;
      guests: { adults: number; children: number; };
      pricing: { total: number; };
      payment: { status: string; };
      status: string;
      is_upcoming: boolean;
      is_active: boolean;
      is_past: boolean;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  timestamp: string;
}
```

### ⚠️ Get Booking Details (NOT IMPLEMENTED)

**Endpoint:** `GET /bookings/:id`  
**Authentication:** Required  
**Description:** Get detailed booking information

**Expected Response:** `200 OK` (Full booking object with hotel, room, and payment details)

### ⚠️ Cancel Booking (NOT IMPLEMENTED)

**Endpoint:** `DELETE /bookings/:id/cancel`  
**Authentication:** Required  
**Description:** Cancel a booking and process refund

**Request Body:**
```typescript
{
  reason: string;
}
```

**Expected Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    booking: {
      id: string;
      status: 'cancelled';
      cancellation: {
        cancelled_at: string;
        reason: string;
        refund_amount: number;
        refund_status: 'processing';
      };
    };
  };
  timestamp: string;
}
```

---

## Payments

### Create PayPal Payment

**Endpoint:** `POST /payments/paypal/create`  
**Authentication:** Required  
**Description:** Create PayPal payment intent

**Request Body:**
```typescript
{
  booking_id: string;
  amount: number;
  currency: 'USD';
  payment_type: 'deposit' | 'milestone_1' | 'milestone_2' | 'milestone_3' | 'full';
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    order_id: string;
    approval_url: string;
    status: 'CREATED';
  };
  timestamp: string;
}
```

### Capture PayPal Payment

**Endpoint:** `POST /payments/paypal/capture`  
**Authentication:** Required  
**Description:** Capture approved PayPal payment

**Request Body:**
```typescript
{
  order_id: string;
  booking_id: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    transaction: {
      id: string;
      transaction_id: string;
      gateway: 'paypal';
      amount: number;
      currency: string;
      payment_type: string;
      status: 'completed';
      escrow_status: 'held';
    };
    booking: {
      id: string;
      status: 'confirmed';
      payment: {
        status: 'completed' | 'partial';
      };
    };
  };
  timestamp: string;
}
```

### Create Bakong Payment

**Endpoint:** `POST /payments/bakong/create`  
**Authentication:** Required  
**Description:** Generate KHQR code for Bakong payment

**Request Body:**
```typescript
{
  booking_id: string;
  amount: number;
  currency: 'KHR';
  payment_type: 'deposit' | 'milestone_1' | 'milestone_2' | 'milestone_3' | 'full';
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    qr_code: string;        // Base64 encoded QR code image
    md5_hash: string;       // Transaction identifier
    amount: number;
    currency: 'KHR';
    merchant_id: string;
    expires_at: string;
  };
  timestamp: string;
}
```

### Verify Bakong Payment

**Endpoint:** `POST /payments/bakong/verify`  
**Authentication:** Required  
**Description:** Verify Bakong payment status

**Request Body:**
```typescript
{
  md5_hash: string;
  booking_id: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    status: 'completed' | 'pending' | 'failed';
    transaction?: {
      id: string;
      transaction_id: string;
      amount: number;
      currency: string;
      status: string;
    };
  };
  timestamp: string;
}
```

### Create Stripe Payment

**Endpoint:** `POST /payments/stripe/create`  
**Authentication:** Required  
**Description:** Create Stripe payment intent

**Request Body:**
```typescript
{
  booking_id: string;
  amount: number;
  currency: 'USD';
  payment_type: 'deposit' | 'milestone_1' | 'milestone_2' | 'milestone_3' | 'full';
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    payment_intent_id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method';
  };
  timestamp: string;
}
```

### Confirm Stripe Payment

**Endpoint:** `POST /payments/stripe/confirm`  
**Authentication:** Required  
**Description:** Confirm Stripe payment with payment method

**Request Body:**
```typescript
{
  payment_intent_id: string;
  payment_method_id: string;
  booking_id: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    transaction: {
      id: string;
      transaction_id: string;
      gateway: 'stripe';
      amount: number;
      currency: string;
      payment_type: string;
      status: 'completed';
      escrow_status: 'held';
    };
    booking: {
      id: string;
      status: 'confirmed';
      payment: {
        status: 'completed' | 'partial';
      };
    };
  };
  timestamp: string;
}
```

---

## Error Codes

### Authentication Errors (AUTH_XXXX)
- `AUTH_1001`: Invalid credentials
- `AUTH_1002`: Email already exists
- `AUTH_1003`: Invalid token
- `AUTH_1004`: Token expired
- `AUTH_1005`: Unauthorized access
- `AUTH_1006`: Invalid OAuth code/token
- `AUTH_1007`: Password reset token invalid/expired

### Validation Errors (VAL_XXXX)
- `VAL_2001`: Missing required field
- `VAL_2002`: Invalid email format
- `VAL_2003`: Invalid phone format
- `VAL_2004`: Password too weak
- `VAL_2005`: Invalid date format
- `VAL_2006`: Check-out before check-in
- `VAL_2007`: Invalid guest count

### Booking Errors (BOOK_XXXX)
- `BOOK_3001`: Room not available
- `BOOK_3002`: Booking not found
- `BOOK_3003`: Cannot modify confirmed booking
- `BOOK_3004`: Cannot cancel (too close to check-in)
- `BOOK_3005`: Invalid promo code

### Payment Errors (PAY_XXXX)
- `PAY_4001`: Payment failed
- `PAY_4002`: Invalid payment method
- `PAY_4003`: Payment already processed
- `PAY_4004`: Refund failed
- `PAY_4005`: Insufficient payment amount

### System Errors (SYS_XXXX)
- `SYS_9001`: Internal server error
- `SYS_9002`: Rate limit exceeded
- `SYS_9003`: Service unavailable

### Error Response Format

All errors follow this format:
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}
```

---

## Notes for Frontend/Mobile Developers

### Authentication Flow
1. User logs in → Receive access_token and refresh_token
2. Store tokens securely (HTTP-only cookies for web, secure storage for mobile)
3. Include access_token in Authorization header for all authenticated requests
4. When access_token expires (401 response), use refresh_token to get new tokens
5. If refresh fails, redirect to login

### Payment Flow
1. User creates booking → Receive booking_id and payment_intent
2. Redirect to payment gateway or display QR code
3. User completes payment on gateway
4. Gateway redirects back or user confirms payment
5. Call capture/verify endpoint to confirm payment
6. Display booking confirmation

### Real-Time Updates (Coming Soon)
- Connect to WebSocket server with JWT token
- Listen for booking status updates
- Listen for message notifications
- Listen for payment confirmations

### Pagination
- All list endpoints support `page` and `limit` query parameters
- Default: page=1, limit=20
- Maximum limit: 100

### Image Optimization
- All images are served from Cloudinary
- Append transformation parameters for optimization
- Example: `?w=800&h=600&c=fill&q=auto`

---

**For questions or issues, contact the backend team.**
