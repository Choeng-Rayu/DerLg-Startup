# DerLg Database - Schema Overview

## Database Created Successfully ✅

**Database Name:** `derlg_startup`
**Total Tables:** 14
**Engine:** InnoDB (MariaDB)

---

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS (Core)                              │
│  ID | user_type | email | phone | password_hash | oauth_ids     │
└─────────────────────────────────────────────────────────────────┘
                    ↓         ↓          ↓           ↓
        ┌───────────┼─────────┼──────────┼───────────┘
        │           │         │          │
        │           │         │          └──────────────────┐
        │           │         │                             │
    ┌───▼───────┐   │    ┌────▼──────────┐         ┌───────▼─────┐
    │  HOTELS   │   │    │   BOOKINGS    │         │  PROMO_CODES│
    │  (Admin)  │   │    │ (User/Hotel)  │         │   (Admin)   │
    └───┬───────┘   │    └────┬──────────┘         └─────────────┘
        │           │         │
        │       ┌───▼────┐    │
        │       │ MESSAGES│   │
        │       └────────┘    │
        │                     │
    ┌───▼─────────┐      ┌────▼────────────┐
    │   ROOMS     │      │PAYMENT_TRANS    │
    │(in Hotel)   │      │  (Escrow System)│
    └─────────────┘      └─────────────────┘

    ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
    │   TOURS      │     │   EVENTS     │     │   REVIEWS   │
    │  (Packages)  │     │  (Festivals) │     │(User Feedback)
    └──────────────┘     └──────────────┘     └─────────────┘
         ↓                    ↓                    ↓ ↓ ↓
    ┌─────────────────────────────────────────────────────────┐
    │ GUIDES          TRANSPORTATION       WISHLISTS           │
    │ (Tour Guides)   (Drivers/Vehicles)  (User Collections)  │
    └─────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐
    │   AI_CONVERSATIONS       │
    │   (Chat History)         │
    └──────────────────────────┘
```

---

## 📋 Complete Table Specifications

### 1. USERS (23 columns)
```sql
Core user management with authentication and profile data
- Roles: super_admin, admin, tourist
- Auth Methods: email/password, Google OAuth, Facebook OAuth
- Features: Email verification, phone verification, student discounts
- Audit: created_at, updated_at, last_login
- Password Reset: token and expiration fields
```

### 2. HOTELS (15 columns)
```sql
Hotel profile and management
- Linked to: users (admin_id)
- Data: name, description, location (JSON), contact (JSON)
- Details: amenities, images, logo, star_rating, average_rating
- Status: pending_approval, active, inactive, rejected
- Indexes: status, admin_id, average_rating, star_rating
```

### 3. ROOMS (13 columns)
```sql
Room types within hotels
- Linked to: hotels (hotel_id)
- Details: room_type, capacity, bed_type, size_sqm
- Pricing: price_per_night, discount_percentage
- Content: amenities (JSON), images (JSON)
- Status: is_active, total_rooms inventory
```

### 4. BOOKINGS (17 columns)
```sql
Hotel room bookings with full transaction details
- Links to: users, hotels, rooms
- Dates: check_in, check_out, nights
- Complex JSON: guests, guest_details, pricing, payment, cancellation
- Calendar: google_calendar_event_id
- Status: pending, confirmed, completed, cancelled, rejected
- Indexes: user_id, hotel_id, room_id, dates, status
```

### 5. PAYMENT_TRANSACTIONS (16 columns)
```sql
Multi-gateway payment processing
- Linked to: bookings (booking_id)
- Gateways: paypal, bakong, stripe
- Payment Types: deposit, milestone_1, milestone_2, milestone_3, full
- Escrow: held, released, refunded (with release dates)
- Tracking: transaction_id, gateway_response (JSON)
- Status: pending, completed, failed, refunded
```

### 6. TOURS (17 columns)
```sql
Tourism tour packages
- Content: name, description, destination, itinerary (JSON)
- Pricing: price_per_person, group_size (JSON)
- Details: inclusions, exclusions, images, meeting_point (JSON)
- Attributes: difficulty (easy/moderate/challenging), category (JSON)
- Resources: guide_required, transportation_required
- Ratings: average_rating, total_bookings
```

### 7. EVENTS (16 columns)
```sql
Cultural events and festivals
- Date Range: start_date, end_date
- Types: festival, cultural, seasonal
- Location: JSON with venue details
- Pricing: base_price, vip_price (JSON)
- Details: capacity, cultural_significance, what_to_expect
- Related: related_tours (JSON), created_by (user_id)
```

### 8. REVIEWS (15 columns)
```sql
User reviews for hotels and tours
- Links to: users, bookings, hotels (optional), tours (optional)
- Ratings: JSON with overall/cleanliness/service/location/value (1-5)
- Content: comment, images (JSON)
- Sentiment: score (0-1), classification, topics (JSON)
- Status: is_verified, helpful_count, admin_response
```

### 9. GUIDES (17 columns)
```sql
Tour guide management
- Contact: name, phone, email, telegram_user_id, telegram_username
- Profile: specializations (JSON), languages (JSON), bio, profile_image
- Credentials: certifications (JSON)
- Status: available, unavailable, on_tour
- Performance: average_rating, total_tours
- Created by: admin user
```

### 10. TRANSPORTATION (17 columns)
```sql
Driver and vehicle management
- Driver: driver_name, phone, telegram (user_id, username)
- Vehicle: vehicle_type (tuk_tuk/car/van/bus), model, license_plate
- Capacity: capacity, amenities (JSON)
- Status: available, unavailable, on_trip
- Performance: average_rating, total_trips
- Created by: admin user
```

### 11. PROMO_CODES (17 columns)
```sql
Discount code management system
- Code Details: code (unique), description
- Discount: type (percentage/fixed), value, max_discount
- Validity: valid_from, valid_until
- Limits: usage_limit, usage_count
- Application: applicable_to (all/hotels/tours/events)
- Targeting: user_type (all/new/returning), applicable_ids (JSON)
- Status: is_active
```

### 12. MESSAGES (13 columns)
```sql
Booking-related messaging
- Links to: bookings, users (sender, recipient)
- Content: message (TEXT), attachments (JSON)
- Direction: sender_type (tourist/hotel_admin)
- Status: is_read, read_at timestamp
- Timeline: created_at, updated_at
```

### 13. WISHLISTS (7 columns)
```sql
User collections/favorites
- User: user_id
- Item: item_type (hotel/tour/event), item_id
- Notes: personal notes (optional)
- Unique: user_id + item_type + item_id constraint
```

### 14. AI_CONVERSATIONS (9 columns)
```sql
AI chat session history
- User: user_id
- Session: session_id (unique)
- Type: ai_type (streaming/quick/event-based)
- Data: messages (JSON), context (JSON)
- Results: recommendations (JSON), conversion (JSON)
- Timeline: created_at, updated_at
```

---

## 🔐 Database Features

### Security
- ✅ UUID Primary Keys (not sequential auto-increment)
- ✅ Password hashing fields with reset tokens
- ✅ OAuth integration support
- ✅ Role-based access control (RBAC)

### Scalability
- ✅ JSON fields for flexible data
- ✅ Proper indexing strategy
- ✅ Composite indexes for common queries
- ✅ Audit timestamps

### Data Integrity
- ✅ Foreign key constraints with CASCADE
- ✅ UNIQUE constraints
- ✅ NOT NULL constraints
- ✅ ENUM for restricted values

### Performance
- ✅ 40+ optimized indexes
- ✅ Index on foreign keys
- ✅ Index on frequently searched fields
- ✅ Composite indexes for joins

---

## 🌍 Localization Support

- **Languages:** English (en), Khmer (km), Chinese (zh)
- **Currencies:** USD, KHR
- **Character Encoding:** UTF8MB4 (supports emojis)
- **Timezone:** DATETIME fields for global timestamps

---

## 📊 Index Summary

```
USERS: 6 indexes
HOTELS: 5 indexes
ROOMS: 4 indexes
BOOKINGS: 9 indexes (including composite)
PAYMENT_TRANSACTIONS: 5 indexes
TOURS: 3 indexes
EVENTS: 3 indexes
REVIEWS: 4 indexes
GUIDES: 3 indexes
TRANSPORTATION: 4 indexes
PROMO_CODES: 5 indexes
MESSAGES: 4 indexes
WISHLISTS: 3 indexes (1 unique)
AI_CONVERSATIONS: 4 indexes
────────────────
TOTAL: 63 indexes
```

---

## ✅ Verification Checklist

- [x] Database created: `derlg_startup`
- [x] All 14 tables created successfully
- [x] Primary keys: UUID type
- [x] Foreign key relationships: Configured
- [x] Indexes: Applied
- [x] ENUM types: Configured
- [x] JSON fields: Configured
- [x] Default values: Set
- [x] Timestamps: Auto-populated
- [x] Character encoding: UTF8MB4

---

## 🚀 Ready to Use

Your database is ready for your DerLg backend application. No changes were made to your source code. The database structure exactly matches your Sequelize migrations.

**Connection Details:**
- Host: `localhost`
- Port: `3306`
- Database: `derlg_startup`
- User: `root`
- Password: `12345`

---

*Generated: November 12, 2025*
*MariaDB Version: 10.4.32*
