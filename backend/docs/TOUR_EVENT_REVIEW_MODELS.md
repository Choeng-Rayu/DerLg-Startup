# Tour, Event, and Review Models Documentation

This document describes the Tour, Event, and Review models implemented for the DerLg Tourism Platform.

## Overview

Three new models have been implemented to support tours, cultural events, and customer reviews:

1. **Tour Model** - Manages tour packages and activities
2. **Event Model** - Manages cultural events and festivals
3. **Review Model** - Manages customer reviews for hotels and tours

## Tour Model

### Purpose
The Tour model represents tour packages and activities available for booking in Cambodia.

### Schema

```typescript
interface Tour {
  id: UUID (Primary Key)
  name: string
  description: text
  destination: string
  duration: {
    days: number
    nights: number
  }
  difficulty: 'easy' | 'moderate' | 'challenging'
  category: string[] // e.g., ['cultural', 'adventure', 'historical']
  price_per_person: decimal(10,2)
  group_size: {
    min: number
    max: number
  }
  inclusions: string[]
  exclusions: string[]
  itinerary: DayItinerary[]
  images: string[] // Cloudinary URLs
  meeting_point: {
    address: string
    latitude: number
    longitude: number
  }
  guide_required: boolean
  transportation_required: boolean
  is_active: boolean
  average_rating: decimal(3,2)
  total_bookings: integer
  created_at: timestamp
  updated_at: timestamp
}

interface DayItinerary {
  day: number
  title: string
  description: string
  activities: string[]
  meals: string[]
  accommodation: string | null
}
```

### Indexes
- `idx_tours_destination` - For filtering by destination
- `idx_tours_difficulty` - For filtering by difficulty level
- `idx_tours_is_active` - For filtering active tours
- `idx_tours_average_rating` - For sorting by rating
- `idx_tours_price` - For filtering by price range

### Instance Methods

#### `isAvailableForGroupSize(groupSize: number): boolean`
Checks if the tour can accommodate the specified group size.

```typescript
const tour = await Tour.findByPk(tourId);
if (tour.isAvailableForGroupSize(5)) {
  console.log('Tour available for 5 people');
}
```

#### `calculateGroupPrice(numberOfPeople: number): number`
Calculates the total price for a group.

```typescript
const totalPrice = tour.calculateGroupPrice(4);
console.log(`Total for 4 people: $${totalPrice}`);
```

#### `toSafeObject()`
Returns a safe representation of the tour without sensitive data.

### Validations
- Name: 2-255 characters, required
- Description: Required, not empty
- Destination: Required, not empty
- Duration: Days must be at least 1, nights cannot be negative
- Difficulty: Must be 'easy', 'moderate', or 'challenging'
- Category: Must be an array with at least one category
- Price per person: Cannot be negative
- Group size: Min must be at least 1, max must be >= min
- Meeting point: Valid latitude (-90 to 90) and longitude (-180 to 180)

### Example Usage

```typescript
import { Tour, TourDifficulty } from './models';

// Create a tour
const tour = await Tour.create({
  name: 'Angkor Wat Temple Tour',
  description: 'Explore the magnificent Angkor Wat temple complex',
  destination: 'Siem Reap',
  duration: {
    days: 3,
    nights: 2,
  },
  difficulty: TourDifficulty.MODERATE,
  category: ['cultural', 'historical'],
  price_per_person: 150.00,
  group_size: {
    min: 2,
    max: 15,
  },
  inclusions: ['Professional guide', 'Transportation', 'Entrance fees'],
  exclusions: ['Personal expenses', 'Tips'],
  itinerary: [
    {
      day: 1,
      title: 'Angkor Wat Sunrise',
      description: 'Watch the sunrise over Angkor Wat',
      activities: ['Sunrise viewing', 'Temple exploration'],
      meals: ['Breakfast', 'Lunch'],
      accommodation: 'Hotel in Siem Reap',
    },
  ],
  images: ['https://cloudinary.com/tour1.jpg'],
  meeting_point: {
    address: 'Siem Reap City Center',
    latitude: 13.3633,
    longitude: 103.8564,
  },
  guide_required: true,
  transportation_required: true,
});

// Query tours
const tours = await Tour.findAll({
  where: {
    destination: 'Siem Reap',
    is_active: true,
  },
});
```

## Event Model

### Purpose
The Event model represents cultural events, festivals, and seasonal celebrations in Cambodia.

### Schema

```typescript
interface Event {
  id: UUID (Primary Key)
  name: string
  description: text
  event_type: 'festival' | 'cultural' | 'seasonal'
  start_date: date
  end_date: date
  location: {
    city: string
    province: string
    venue: string
    latitude: number
    longitude: number
  }
  pricing: {
    base_price: number
    vip_price: number
  }
  capacity: integer
  bookings_count: integer
  images: string[] // Cloudinary URLs
  cultural_significance: text
  what_to_expect: text
  related_tours: string[] // Tour IDs
  is_active: boolean
  created_by: UUID (Foreign Key -> users.id)
  created_at: timestamp
  updated_at: timestamp
}
```

### Indexes
- `idx_events_start_date` - For filtering by start date
- `idx_events_end_date` - For filtering by end date
- `idx_events_event_type` - For filtering by event type
- `idx_events_is_active` - For filtering active events
- `idx_events_created_by` - For querying events by creator

### Associations
- **belongsTo User** (as 'creator') - The super admin who created the event

### Instance Methods

#### `isUpcoming(): boolean`
Checks if the event is in the future.

#### `isOngoing(): boolean`
Checks if the event is currently happening.

#### `isPast(): boolean`
Checks if the event has ended.

#### `hasAvailableCapacity(): boolean`
Checks if there are available spots.

#### `getAvailableSpots(): number`
Returns the number of available spots.

#### `getDurationInDays(): number`
Calculates the event duration in days.

#### `toSafeObject()`
Returns event data with computed properties.

### Validations
- Name: 2-255 characters, required
- Description: Required, not empty
- Event type: Must be 'festival', 'cultural', or 'seasonal'
- End date: Must be after or equal to start date
- Location: All fields required, valid coordinates
- Pricing: Base and VIP prices must be non-negative, VIP >= base
- Capacity: Must be at least 1
- Bookings count: Cannot exceed capacity
- Cultural significance: Required, not empty
- What to expect: Required, not empty

### Example Usage

```typescript
import { Event, EventType } from './models';

// Create an event
const event = await Event.create({
  name: 'Khmer New Year Festival',
  description: 'Celebrate the traditional Khmer New Year',
  event_type: EventType.FESTIVAL,
  start_date: new Date('2025-04-14'),
  end_date: new Date('2025-04-16'),
  location: {
    city: 'Phnom Penh',
    province: 'Phnom Penh',
    venue: 'Royal Palace',
    latitude: 11.5564,
    longitude: 104.9282,
  },
  pricing: {
    base_price: 50.00,
    vip_price: 100.00,
  },
  capacity: 500,
  images: ['https://cloudinary.com/event1.jpg'],
  cultural_significance: 'Most important holiday in Cambodia',
  what_to_expect: 'Traditional games, water splashing, performances',
  related_tours: [tourId],
  created_by: superAdminId,
});

// Check event status
console.log(`Is upcoming: ${event.isUpcoming()}`);
console.log(`Available spots: ${event.getAvailableSpots()}`);
```

## Review Model

### Purpose
The Review model manages customer reviews and ratings for hotels and tours.

### Schema

```typescript
interface Review {
  id: UUID (Primary Key)
  user_id: UUID (Foreign Key -> users.id)
  booking_id: UUID (Foreign Key -> bookings.id)
  hotel_id: UUID | null (Foreign Key -> hotels.id)
  tour_id: UUID | null (Foreign Key -> tours.id)
  ratings: {
    overall: number (1-5)
    cleanliness: number (1-5)
    service: number (1-5)
    location: number (1-5)
    value: number (1-5)
  }
  comment: text
  sentiment: {
    score: number (0-1)
    classification: 'positive' | 'neutral' | 'negative'
    topics: Array<{
      topic: string
      sentiment: number
    }>
  } | null
  images: string[] // Cloudinary URLs
  helpful_count: integer
  is_verified: boolean
  admin_response: text | null
  created_at: timestamp
  updated_at: timestamp
}
```

### Indexes
- `idx_reviews_user_id` - For querying user's reviews
- `idx_reviews_booking_id` - For finding review by booking
- `idx_reviews_hotel_id` - For querying hotel reviews
- `idx_reviews_tour_id` - For querying tour reviews
- `idx_reviews_is_verified` - For filtering verified reviews
- `idx_reviews_created_at` - For sorting by date

### Associations
- **belongsTo User** (as 'user') - The user who wrote the review
- **belongsTo Booking** (as 'booking') - The associated booking
- **belongsTo Hotel** (as 'hotel') - The reviewed hotel (optional)
- **belongsTo Tour** (as 'tour') - The reviewed tour (optional)

### Instance Methods

#### `getAverageRating(): number`
Calculates the average of all rating categories.

```typescript
const avgRating = review.getAverageRating();
console.log(`Average rating: ${avgRating}/5`);
```

#### `isPositive(): boolean`
Checks if the review has positive sentiment.

#### `isNegative(): boolean`
Checks if the review has negative sentiment.

#### `needsAttention(): boolean`
Checks if the review is extremely negative (score < 0.3).

#### `markAsHelpful(): Promise<void>`
Increments the helpful count.

```typescript
await review.markAsHelpful();
```

#### `toSafeObject()`
Returns review data with computed properties.

### Validations
- Ratings: All categories must be numbers between 1 and 5
- Comment: 10-5000 characters, required
- Sentiment: Score must be 0-1, classification must be valid
- Admin response: Maximum 2000 characters
- At least one of hotel_id or tour_id must be provided

### Hooks
- **beforeSave**: Ensures at least one of hotel_id or tour_id is provided

### Example Usage

```typescript
import { Review } from './models';

// Create a review
const review = await Review.create({
  user_id: userId,
  booking_id: bookingId,
  hotel_id: hotelId,
  ratings: {
    overall: 5,
    cleanliness: 5,
    service: 4,
    location: 5,
    value: 4,
  },
  comment: 'Amazing hotel! Highly recommend!',
  sentiment: {
    score: 0.92,
    classification: 'positive',
    topics: [
      { topic: 'staff', sentiment: 0.95 },
      { topic: 'cleanliness', sentiment: 0.98 },
    ],
  },
  images: ['https://cloudinary.com/review1.jpg'],
  is_verified: true,
});

// Query reviews with associations
const reviews = await Review.findAll({
  where: { hotel_id: hotelId },
  include: [
    { model: User, as: 'user' },
    { model: Hotel, as: 'hotel' },
  ],
  order: [['created_at', 'DESC']],
});

// Add admin response
review.admin_response = 'Thank you for your feedback!';
await review.save();
```

## Database Migrations

Three migration files have been created:

1. **006-create-tours-table.ts** - Creates the tours table with indexes
2. **007-create-events-table.ts** - Creates the events table with indexes
3. **008-create-reviews-table.ts** - Creates the reviews table with indexes

To run migrations:

```bash
npm run db:sync
```

## Testing

A comprehensive test script has been created to verify all models:

```bash
npm run test:tour-event-review
```

The test script covers:
- Creating tours with all fields and validations
- Creating events with date validations
- Creating reviews for both hotels and tours
- Testing all instance methods
- Testing associations
- Testing sentiment analysis integration
- Querying with filters and associations

## Requirements Coverage

These models satisfy the following requirements from the specification:

### Tour Model
- **Requirement 30.1**: Tour listings with destination, duration, price
- **Requirement 30.3**: Tour details including itinerary, inclusions, exclusions

### Event Model
- **Requirement 47.1**: Event listings with cultural events and festivals
- **Requirement 47.2**: Event details with cultural significance

### Review Model
- **Requirement 5.1**: Review submission after completed bookings
- **Requirement 5.2**: Rating system with multiple categories
- **Requirement 15.1**: Sentiment analysis integration

## Next Steps

1. Implement tour booking functionality
2. Implement event booking functionality
3. Integrate AI sentiment analysis for reviews
4. Create API endpoints for tours, events, and reviews
5. Implement review moderation workflow
6. Add review response functionality for hotel admins
7. Implement review aggregation for hotel/tour ratings
