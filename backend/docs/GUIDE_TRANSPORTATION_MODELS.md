# Guide and Transportation Models Documentation

## Overview

This document describes the Guide and Transportation models implemented for the DerLg Tourism Platform. These models represent service providers (tour guides and transportation drivers) who use Telegram for status management without requiring platform login.

## Models

### Guide Model

The Guide model represents tour guides who can be assigned to tours. Guides authenticate and manage their status through Telegram bot integration.

#### Schema

```typescript
{
  id: UUID (Primary Key)
  name: string
  phone: string
  email: string | null
  telegram_user_id: string (Unique)
  telegram_username: string
  specializations: string[] (JSON)
  languages: string[] (JSON)
  bio: string | null
  profile_image: string | null (Cloudinary URL)
  certifications: string[] (JSON)
  status: enum ('available', 'unavailable', 'on_tour')
  average_rating: decimal(3,2)
  total_tours: integer
  created_by: UUID (Foreign Key -> users.id)
  created_at: timestamp
  updated_at: timestamp
  last_status_update: timestamp | null
}
```

#### Enums

**GuideStatus:**
- `AVAILABLE` - Guide is available for tours
- `UNAVAILABLE` - Guide is not available
- `ON_TOUR` - Guide is currently on a tour

#### Validations

- **name**: Required, 2-255 characters
- **phone**: Required, E.164 format (e.g., +855123456789)
- **email**: Optional, valid email format
- **telegram_user_id**: Required, unique across all guides
- **telegram_username**: Required
- **specializations**: Array (e.g., ['temples', 'history', 'culture'])
- **languages**: Required array with at least one language (e.g., ['en', 'km', 'zh'])
- **certifications**: Array (e.g., ['Licensed Tour Guide', 'First Aid Certified'])
- **status**: Must be one of the GuideStatus enum values
- **average_rating**: 0.00 to 5.00
- **total_tours**: Non-negative integer
- **created_by**: Must reference a valid super admin user

#### Indexes

- `idx_guides_telegram_user_id` (unique) - For Telegram bot authentication
- `idx_guides_status` - For querying available guides
- `idx_guides_created_by` - For admin relationships
- `idx_guides_average_rating` - For sorting by rating

#### Instance Methods

```typescript
// Update guide status
await guide.updateStatus(GuideStatus.ON_TOUR);

// Check if guide is available
const isAvailable = guide.isAvailable(); // returns boolean

// Get safe object (for API responses)
const safeGuide = guide.toSafeObject();
```

#### Hooks

**beforeCreate:**
- Normalizes telegram_username (removes @ prefix if present)
- Normalizes email to lowercase

**beforeUpdate:**
- Normalizes telegram_username if changed
- Normalizes email if changed
- Updates last_status_update when status changes

### Transportation Model

The Transportation model represents transportation providers (drivers and vehicles). Drivers authenticate and manage their status through Telegram bot integration.

#### Schema

```typescript
{
  id: UUID (Primary Key)
  driver_name: string
  phone: string
  telegram_user_id: string (Unique)
  telegram_username: string
  vehicle_type: enum ('tuk_tuk', 'car', 'van', 'bus')
  vehicle_model: string
  license_plate: string
  capacity: integer
  amenities: string[] (JSON)
  status: enum ('available', 'unavailable', 'on_trip')
  average_rating: decimal(3,2)
  total_trips: integer
  created_by: UUID (Foreign Key -> users.id)
  created_at: timestamp
  updated_at: timestamp
  last_status_update: timestamp | null
}
```

#### Enums

**VehicleType:**
- `TUK_TUK` - Traditional tuk-tuk
- `CAR` - Standard car
- `VAN` - Van for larger groups
- `BUS` - Bus for large groups

**TransportationStatus:**
- `AVAILABLE` - Driver is available
- `UNAVAILABLE` - Driver is not available
- `ON_TRIP` - Driver is currently on a trip

#### Validations

- **driver_name**: Required, 2-255 characters
- **phone**: Required, E.164 format (e.g., +855123456789)
- **telegram_user_id**: Required, unique across all transportation providers
- **telegram_username**: Required
- **vehicle_type**: Must be one of the VehicleType enum values
- **vehicle_model**: Required (e.g., 'Toyota Hiace', 'Bajaj RE')
- **license_plate**: Required (automatically uppercased)
- **capacity**: Required, 1-100 passengers
- **amenities**: Array (e.g., ['AC', 'WiFi', 'USB Charging'])
- **status**: Must be one of the TransportationStatus enum values
- **average_rating**: 0.00 to 5.00
- **total_trips**: Non-negative integer
- **created_by**: Must reference a valid super admin user

#### Indexes

- `idx_transportation_telegram_user_id` (unique) - For Telegram bot authentication
- `idx_transportation_status` - For querying available transportation
- `idx_transportation_vehicle_type` - For filtering by vehicle type
- `idx_transportation_created_by` - For admin relationships
- `idx_transportation_average_rating` - For sorting by rating

#### Instance Methods

```typescript
// Update transportation status
await transportation.updateStatus(TransportationStatus.ON_TRIP);

// Check if transportation is available
const isAvailable = transportation.isAvailable(); // returns boolean

// Get safe object (for API responses)
const safeTransportation = transportation.toSafeObject();
```

#### Hooks

**beforeCreate:**
- Normalizes telegram_username (removes @ prefix if present)
- Normalizes license_plate to uppercase

**beforeUpdate:**
- Normalizes telegram_username if changed
- Normalizes license_plate to uppercase if changed
- Updates last_status_update when status changes

## Relationships

### User Associations

```typescript
// Super Admin can create guides
User.hasMany(Guide, { foreignKey: 'created_by', as: 'created_guides' });
Guide.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Super Admin can create transportation
User.hasMany(Transportation, { foreignKey: 'created_by', as: 'created_transportation' });
Transportation.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
```

## Usage Examples

### Creating a Guide

```typescript
import { Guide, GuideStatus } from './models/Guide';

const guide = await Guide.create({
  name: 'Sokha Chea',
  phone: '+855123456789',
  email: 'sokha@example.com',
  telegram_user_id: '123456789',
  telegram_username: '@sokhaguide',
  specializations: ['temples', 'history', 'culture'],
  languages: ['en', 'km', 'zh'],
  bio: 'Experienced tour guide specializing in Angkor Wat',
  certifications: ['Licensed Tour Guide', 'First Aid Certified'],
  status: GuideStatus.AVAILABLE,
  created_by: superAdminId,
});
```

### Creating Transportation

```typescript
import { Transportation, VehicleType, TransportationStatus } from './models/Transportation';

const transport = await Transportation.create({
  driver_name: 'Virak Sok',
  phone: '+855111222333',
  telegram_user_id: '111222333',
  telegram_username: '@virakdriver',
  vehicle_type: VehicleType.TUK_TUK,
  vehicle_model: 'Bajaj RE',
  license_plate: 'PP-1234',
  capacity: 4,
  amenities: ['AC', 'WiFi'],
  status: TransportationStatus.AVAILABLE,
  created_by: superAdminId,
});
```

### Querying Available Guides

```typescript
// Find all available guides
const availableGuides = await Guide.findAll({
  where: { status: GuideStatus.AVAILABLE },
  order: [['average_rating', 'DESC']],
});

// Find guides by specialization
const templeGuides = await Guide.findAll({
  where: sequelize.literal("JSON_CONTAINS(specializations, '\"temples\"')"),
});

// Find guide by Telegram ID
const guide = await Guide.findOne({
  where: { telegram_user_id: '123456789' },
});
```

### Querying Available Transportation

```typescript
// Find all available transportation
const availableTransport = await Transportation.findAll({
  where: { status: TransportationStatus.AVAILABLE },
  order: [['capacity', 'DESC']],
});

// Find transportation by vehicle type
const tukTuks = await Transportation.findAll({
  where: { vehicle_type: VehicleType.TUK_TUK },
});

// Find transportation by Telegram ID
const transport = await Transportation.findOne({
  where: { telegram_user_id: '111222333' },
});
```

### Updating Status via Telegram Bot

```typescript
// When guide updates status via Telegram bot
const guide = await Guide.findOne({
  where: { telegram_user_id: telegramUserId },
});

if (guide) {
  await guide.updateStatus(GuideStatus.ON_TOUR);
  // Notify admin dashboard via WebSocket
  io.emit('guide_status_update', {
    guide_id: guide.id,
    status: guide.status,
    last_update: guide.last_status_update,
  });
}
```

### Getting Super Admin's Created Resources

```typescript
const admin = await User.findByPk(adminId, {
  include: [
    { model: Guide, as: 'created_guides' },
    { model: Transportation, as: 'created_transportation' },
  ],
});

console.log(`Admin has ${admin.created_guides.length} guides`);
console.log(`Admin has ${admin.created_transportation.length} transportation providers`);
```

## Telegram Bot Integration

### Authentication Flow

1. Super admin creates guide/driver profile with Telegram username
2. Guide/driver starts Telegram bot with `/start` command
3. Bot authenticates using Telegram user ID
4. Guide/driver can update status using bot commands

### Status Update Commands

**For Guides:**
- `/available` - Set status to available
- `/unavailable` - Set status to unavailable
- `/on_tour` - Set status to on_tour
- `/status` - Check current status

**For Drivers:**
- `/available` - Set status to available
- `/unavailable` - Set status to unavailable
- `/on_trip` - Set status to on_trip
- `/status` - Check current status

### Webhook Integration

```typescript
// Webhook endpoint for status updates
app.post('/webhook/telegram/guide-status', async (req, res) => {
  const { telegram_user_id, status } = req.body;
  
  const guide = await Guide.findOne({
    where: { telegram_user_id },
  });
  
  if (guide) {
    await guide.updateStatus(status);
    
    // Notify admin dashboard
    io.emit('guide_status_update', {
      guide_id: guide.id,
      name: guide.name,
      status: guide.status,
      timestamp: guide.last_status_update,
    });
    
    res.json({ success: true, message: 'Status updated' });
  } else {
    res.status(404).json({ success: false, message: 'Guide not found' });
  }
});
```

## Database Migrations

### Running Migrations

```bash
# Sync all models (development)
npm run db:sync

# Or run specific migrations
npx sequelize-cli db:migrate
```

### Migration Files

- `009-create-guides-table.ts` - Creates guides table with indexes
- `010-create-transportation-table.ts` - Creates transportation table with indexes

## Testing

### Running Tests

```bash
# Test Guide and Transportation models
npm run test:guide-transportation
```

### Test Coverage

The test script covers:
- Model creation with valid data
- Validation errors for invalid data
- Unique constraint enforcement
- Status updates and tracking
- Availability checks
- Telegram username normalization
- Relationships with User model
- Querying by status and Telegram ID

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 34.4**: Super Admin creates guides with Telegram integration
- **Requirement 34.5**: Super Admin creates transportation providers with Telegram bot access
- **Requirement 49.1**: Transportation management with vehicle details and capacity
- **Requirement 49.2**: Guide management with specializations and languages
- **Requirement 49.3**: Automatic status changes when resources are working
- **Requirement 49.4**: Real-time status display in dashboard
- **Requirement 50.1**: Telegram bot authentication using Telegram user ID
- **Requirement 50.2**: Status update buttons in Telegram bot
- **Requirement 50.3**: Status updates without platform login
- **Requirement 50.4**: Real-time notifications to Super Admin Dashboard
- **Requirement 58.3**: Guides table with telegram_user_id and status
- **Requirement 58.4**: Transportation table with telegram_user_id and status
- **Requirement 60.1**: Super Admin creates guides with Telegram integration
- **Requirement 60.2**: Super Admin creates drivers with Telegram bot access
- **Requirement 60.4**: Real-time status display in admin dashboard

## Best Practices

1. **Always use Telegram user ID for authentication** - Never rely on username alone as it can change
2. **Update last_status_update** - Automatically tracked when status changes
3. **Normalize usernames** - Remove @ prefix for consistency
4. **Validate phone numbers** - Use E.164 format for international compatibility
5. **Use indexes** - Queries by telegram_user_id and status are optimized
6. **Handle status transitions** - Implement business logic for valid status changes
7. **Real-time updates** - Use WebSocket to notify admin dashboard of status changes
8. **Soft deletes** - Consider implementing soft deletes for historical data

## Future Enhancements

1. Add booking assignments to guides and transportation
2. Implement availability calendar
3. Add performance metrics and analytics
4. Implement rating and review system
5. Add location tracking for real-time positioning
6. Implement automated scheduling and assignment
7. Add multi-language support for guide profiles
8. Implement commission and payment tracking
