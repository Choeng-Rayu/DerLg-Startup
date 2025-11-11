# Hotel and Room Models Documentation

## Overview

This document describes the Hotel and Room models implemented for the DerLg Tourism Platform. These models handle hotel property management and room inventory.

## Models

### Hotel Model

The Hotel model represents a hotel property in the system.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key (auto-generated) |
| admin_id | UUID | Yes | Foreign key to users table (hotel admin) |
| name | String(255) | Yes | Hotel name (2-255 characters) |
| description | Text | Yes | Hotel description |
| location | JSON | Yes | Location details (see Location structure) |
| contact | JSON | Yes | Contact information (see Contact structure) |
| amenities | JSON Array | Yes | List of amenity codes |
| images | JSON Array | Yes | Array of Cloudinary image URLs |
| logo | String(500) | No | Hotel logo URL |
| star_rating | Integer | Yes | Star rating (1-5, default: 3) |
| average_rating | Decimal(3,2) | Yes | Average customer rating (0-5, default: 0.0) |
| total_reviews | Integer | Yes | Total number of reviews (default: 0) |
| status | Enum | Yes | Hotel status (default: pending_approval) |
| approval_date | Date | No | Date when hotel was approved |
| created_at | Date | Yes | Creation timestamp |
| updated_at | Date | Yes | Last update timestamp |

#### Location Structure (JSON)

```json
{
  "address": "123 Sivatha Blvd",
  "city": "Siem Reap",
  "province": "Siem Reap",
  "country": "Cambodia",
  "latitude": 13.3671,
  "longitude": 103.8448,
  "google_maps_url": "https://maps.google.com/?q=13.3671,103.8448"
}
```

#### Contact Structure (JSON)

```json
{
  "phone": "+855123456789",
  "email": "info@hotel.com",
  "website": "https://hotel.com"
}
```

#### Hotel Status Enum

- `pending_approval` - Awaiting super admin approval
- `active` - Approved and visible to customers
- `inactive` - Temporarily disabled
- `rejected` - Rejected by super admin

#### Indexes

- `idx_hotels_status` - On status field
- `idx_hotels_admin_id` - On admin_id field
- `idx_hotels_average_rating` - On average_rating field

#### Associations

- **belongsTo User** (as 'admin') - Hotel belongs to an admin user
- **hasMany Room** (as 'rooms') - Hotel has multiple rooms

#### Instance Methods

- `toSafeObject()` - Returns hotel data without sensitive information

#### Hooks

- `beforeUpdate` - Automatically sets approval_date when status changes to 'active'

### Room Model

The Room model represents a room type within a hotel.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key (auto-generated) |
| hotel_id | UUID | Yes | Foreign key to hotels table |
| room_type | String(100) | Yes | Room type name (2-100 characters) |
| description | Text | Yes | Room description |
| capacity | Integer | Yes | Maximum guests (1-20) |
| bed_type | String(50) | Yes | Bed type (single, double, queen, king, twin, bunk) |
| size_sqm | Decimal(6,2) | No | Room size in square meters |
| price_per_night | Decimal(10,2) | Yes | Base price per night (must be > 0) |
| discount_percentage | Decimal(5,2) | Yes | Discount percentage (0-100, default: 0) |
| amenities | JSON Array | Yes | List of room amenities |
| images | JSON Array | Yes | Array of room image URLs |
| total_rooms | Integer | Yes | Total inventory count (default: 1) |
| is_active | Boolean | Yes | Active status (default: true) |
| created_at | Date | Yes | Creation timestamp |
| updated_at | Date | Yes | Last update timestamp |

#### Bed Types

- `single` - Single bed
- `double` - Double bed
- `queen` - Queen bed
- `king` - King bed
- `twin` - Twin beds
- `bunk` - Bunk beds

#### Indexes

- `idx_rooms_hotel_id` - On hotel_id field
- `idx_rooms_price` - On price_per_night field
- `idx_rooms_capacity` - On capacity field
- `idx_rooms_is_active` - On is_active field

#### Associations

- **belongsTo Hotel** (as 'hotel') - Room belongs to a hotel

#### Instance Methods

- `getDiscountedPrice()` - Calculates and returns the discounted price
- `toSafeObject()` - Returns room data including calculated discounted price

## Validations

### Hotel Validations

1. **Name**: 2-255 characters, not empty
2. **Description**: Not empty
3. **Location**: Must be valid JSON object with required fields:
   - address, city, province, country (strings)
   - latitude (-90 to 90)
   - longitude (-180 to 180)
4. **Contact**: Must be valid JSON object with:
   - phone (required)
   - email (required, valid format)
   - website (optional)
5. **Amenities**: Must be an array
6. **Images**: Must be an array
7. **Star Rating**: 1-5
8. **Average Rating**: 0-5
9. **Total Reviews**: >= 0

### Room Validations

1. **Room Type**: 2-100 characters, not empty
2. **Description**: Not empty
3. **Capacity**: 1-20 guests
4. **Bed Type**: Must be one of: single, double, queen, king, twin, bunk
5. **Size**: >= 1 square meter (if provided)
6. **Price Per Night**: > 0
7. **Discount Percentage**: 0-100
8. **Amenities**: Must be an array
9. **Images**: Must be an array
10. **Total Rooms**: >= 1

## Usage Examples

### Creating a Hotel

```typescript
import { Hotel, HotelStatus } from './models';

const hotel = await Hotel.create({
  admin_id: 'user-uuid',
  name: 'Angkor Paradise Hotel',
  description: 'A luxurious hotel near Angkor Wat',
  location: {
    address: '123 Sivatha Blvd',
    city: 'Siem Reap',
    province: 'Siem Reap',
    country: 'Cambodia',
    latitude: 13.3671,
    longitude: 103.8448,
    google_maps_url: 'https://maps.google.com/?q=13.3671,103.8448',
  },
  contact: {
    phone: '+855123456789',
    email: 'info@angkorparadise.com',
    website: 'https://angkorparadise.com',
  },
  amenities: ['wifi', 'pool', 'restaurant', 'spa'],
  images: ['https://cloudinary.com/image1.jpg'],
  star_rating: 5,
  status: HotelStatus.PENDING_APPROVAL,
});
```

### Creating a Room

```typescript
import { Room } from './models';

const room = await Room.create({
  hotel_id: 'hotel-uuid',
  room_type: 'Deluxe Suite',
  description: 'Spacious suite with city view',
  capacity: 2,
  bed_type: 'king',
  size_sqm: 45.5,
  price_per_night: 120.00,
  discount_percentage: 10,
  amenities: ['wifi', 'tv', 'minibar', 'safe'],
  images: ['https://cloudinary.com/room1.jpg'],
  total_rooms: 10,
  is_active: true,
});

// Get discounted price
const discountedPrice = room.getDiscountedPrice(); // Returns 108.00
```

### Fetching Hotel with Rooms

```typescript
const hotel = await Hotel.findByPk(hotelId, {
  include: [
    {
      model: Room,
      as: 'rooms',
      where: { is_active: true },
    },
    {
      model: User,
      as: 'admin',
      attributes: ['id', 'email', 'first_name', 'last_name'],
    },
  ],
});
```

### Updating Hotel Status

```typescript
await hotel.update({
  status: HotelStatus.ACTIVE,
});
// approval_date is automatically set by the beforeUpdate hook
```

## Testing

Run the Hotel and Room models test:

```bash
npm run test:hotel-room
```

This test verifies:
- Model creation and data integrity
- Associations between User, Hotel, and Room
- Validation rules
- Instance methods
- Database indexes

## Database Migrations

Migration files are located in `src/migrations/`:
- `002-create-hotels-table.ts` - Creates hotels table
- `003-create-rooms-table.ts` - Creates rooms table

Run migrations:

```bash
npm run db:sync
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 2.1**: Hotel search and discovery with location, amenities, and images
- **Requirement 2.5**: Hotel detail display with comprehensive information
- **Requirement 6.1**: Hotel admin property management with profile editing
- **Requirement 6.3**: Room inventory management with pricing and capacity

## Foreign Key Constraints

- Hotels table has CASCADE delete/update on admin_id (User)
- Rooms table has CASCADE delete/update on hotel_id (Hotel)

This ensures data integrity when users or hotels are deleted.

## Performance Considerations

1. **Indexes**: Created on frequently queried fields (status, admin_id, hotel_id, price, capacity)
2. **JSON Fields**: Used for flexible nested data (location, contact, amenities, images)
3. **Eager Loading**: Use `include` to prevent N+1 queries
4. **Pagination**: Implement pagination for large result sets

## Security Notes

1. Hotel status defaults to `pending_approval` to prevent unauthorized listings
2. Foreign key constraints ensure data integrity
3. Validation prevents invalid data entry
4. Use `toSafeObject()` methods to exclude sensitive data from API responses
