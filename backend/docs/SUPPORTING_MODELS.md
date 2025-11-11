# Supporting Models Documentation

This document describes the four supporting models implemented for the DerLg Tourism Platform: PromoCode, Message, Wishlist, and AIConversation.

## Overview

These models provide essential functionality for promotional campaigns, user communication, wishlist management, and AI-powered conversations.

## Models

### 1. PromoCode Model

**Purpose**: Manages promotional codes and discounts for the platform.

**Table**: `promo_codes`

**Key Features**:
- Supports percentage and fixed amount discounts
- Configurable validity periods
- Usage limits and tracking
- Can be applied to all items or specific hotels/tours/events
- User type targeting (all, new, returning)

**Fields**:
- `id` (UUID): Primary key
- `code` (String): Unique promo code (uppercase)
- `description` (Text): Description of the promo
- `discount_type` (Enum): 'percentage' or 'fixed'
- `discount_value` (Decimal): Discount amount or percentage
- `min_booking_amount` (Decimal): Minimum booking amount required
- `max_discount` (Decimal): Maximum discount cap (for percentage discounts)
- `valid_from` (Date): Start date of validity
- `valid_until` (Date): End date of validity
- `usage_limit` (Integer): Maximum number of uses
- `usage_count` (Integer): Current usage count
- `applicable_to` (Enum): 'all', 'hotels', 'tours', or 'events'
- `applicable_ids` (JSON Array): Specific item IDs (if not 'all')
- `user_type` (Enum): 'all', 'new', or 'returning'
- `is_active` (Boolean): Active status
- `created_by` (UUID): Foreign key to users table
- `created_at`, `updated_at` (Timestamps)

**Instance Methods**:
- `isValid()`: Check if promo code is currently valid
- `canApplyTo(itemType, itemId)`: Check if code can be applied to specific item
- `calculateDiscount(bookingAmount)`: Calculate discount amount
- `incrementUsage()`: Increment usage count
- `hasReachedLimit()`: Check if usage limit reached

**Indexes**:
- `idx_promo_codes_code`: On code field
- `idx_promo_codes_valid`: On valid_from and valid_until
- `idx_promo_codes_is_active`: On is_active field
- `idx_promo_codes_applicable_to`: On applicable_to field

**Associations**:
- Belongs to User (creator) via `created_by`

---

### 2. Message Model

**Purpose**: Enables communication between tourists and hotel admins regarding bookings.

**Table**: `messages`

**Key Features**:
- Booking-specific messaging
- Support for attachments (URLs)
- Read status tracking
- Sender type identification

**Fields**:
- `id` (UUID): Primary key
- `booking_id` (UUID): Foreign key to bookings table
- `sender_id` (UUID): Foreign key to users table
- `sender_type` (Enum): 'tourist' or 'hotel_admin'
- `recipient_id` (UUID): Foreign key to users table
- `message` (Text): Message content (1-5000 characters)
- `attachments` (JSON Array): Array of attachment URLs
- `is_read` (Boolean): Read status
- `read_at` (Date): Timestamp when message was read
- `created_at`, `updated_at` (Timestamps)

**Instance Methods**:
- `markAsRead()`: Mark message as read
- `hasAttachments()`: Check if message has attachments
- `getTimeSince()`: Get human-readable time since message was sent
- `getPreview(length)`: Get message preview (default 100 characters)

**Indexes**:
- `idx_messages_booking_id`: On booking_id field
- `idx_messages_sender_id`: On sender_id field
- `idx_messages_recipient`: On recipient_id and is_read fields
- `idx_messages_created_at`: On created_at field

**Associations**:
- Belongs to Booking via `booking_id`
- Belongs to User (sender) via `sender_id`
- Belongs to User (recipient) via `recipient_id`

---

### 3. Wishlist Model

**Purpose**: Allows users to save hotels, tours, and events for future reference.

**Table**: `wishlists`

**Key Features**:
- Support for multiple item types
- Optional notes for each item
- Unique constraint per user-item combination
- Time tracking

**Fields**:
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users table
- `item_type` (Enum): 'hotel', 'tour', or 'event'
- `item_id` (UUID): ID of the saved item
- `notes` (Text): Optional notes (up to 1000 characters)
- `created_at`, `updated_at` (Timestamps)

**Instance Methods**:
- `hasNotes()`: Check if wishlist item has notes
- `updateNotes(notes)`: Update notes for the item
- `getFormattedItemType()`: Get capitalized item type
- `getTimeSinceAdded()`: Get human-readable time since item was added

**Indexes**:
- `idx_wishlists_user_id`: On user_id field
- `idx_wishlists_item`: On item_type and item_id fields
- `idx_wishlists_unique`: Unique index on user_id, item_type, and item_id

**Associations**:
- Belongs to User via `user_id`

---

### 4. AIConversation Model

**Purpose**: Stores AI chat conversations with users for recommendations and assistance.

**Table**: `ai_conversations`

**Key Features**:
- Three AI types: streaming, quick, event-based
- Message history storage
- Context and preferences tracking
- Recommendation tracking
- Conversion tracking (booking made)

**Fields**:
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users table
- `session_id` (String): Unique session identifier
- `ai_type` (Enum): 'streaming', 'quick', or 'event-based'
- `messages` (JSON Array): Array of message objects with role, content, timestamp
- `context` (JSON Object): Conversation context (budget, destination, dates, preferences)
- `recommendations` (JSON Object): Recommended hotel_ids, tour_ids, event_ids
- `conversion` (JSON Object): Booking conversion data (booked, booking_id)
- `created_at`, `updated_at` (Timestamps)

**Message Structure**:
```typescript
{
  role: 'user' | 'assistant',
  content: string,
  timestamp: Date
}
```

**Context Structure**:
```typescript
{
  budget?: number,
  destination?: string,
  dates?: { start: Date, end: Date },
  preferences?: string[]
}
```

**Instance Methods**:
- `addMessage(role, content)`: Add a message to the conversation
- `getMessageCount()`: Get total message count
- `getUserMessageCount()`: Get user message count
- `getAssistantMessageCount()`: Get assistant message count
- `getLastMessage()`: Get the last message
- `getConversationDuration()`: Get duration in minutes
- `updateContext(context)`: Update conversation context
- `addRecommendations(recommendations)`: Add recommendations
- `markAsConverted(bookingId)`: Mark conversation as converted
- `hasConverted()`: Check if conversation resulted in booking
- `getTotalRecommendationsCount()`: Get total recommendations count
- `getSummary()`: Get conversation summary

**Indexes**:
- `idx_ai_conversations_user_id`: On user_id field
- `idx_ai_conversations_session`: On session_id field
- `idx_ai_conversations_ai_type`: On ai_type field
- `idx_ai_conversations_created_at`: On created_at field

**Associations**:
- Belongs to User via `user_id`

---

## Migrations

All four models have corresponding migration files:

1. `011-create-promo-codes-table.ts`
2. `012-create-messages-table.ts`
3. `013-create-wishlists-table.ts`
4. `014-create-ai-conversations-table.ts`

## Testing

Run the test script to verify all models:

```bash
npm run test:supporting
```

The test script (`testSupportingModels.ts`) covers:
- Model creation and validation
- Instance methods
- Associations
- Data integrity

## Usage Examples

### PromoCode

```typescript
// Create a promo code
const promo = await PromoCode.create({
  code: 'SUMMER2025',
  description: '20% off summer bookings',
  discount_type: DiscountType.PERCENTAGE,
  discount_value: 20,
  min_booking_amount: 100,
  max_discount: 50,
  valid_from: new Date('2025-06-01'),
  valid_until: new Date('2025-08-31'),
  usage_limit: 100,
  applicable_to: ApplicableTo.ALL,
  created_by: adminId,
});

// Check validity and calculate discount
if (promo.isValid() && promo.canApplyTo('hotels')) {
  const discount = promo.calculateDiscount(200); // Returns 40
  await promo.incrementUsage();
}
```

### Message

```typescript
// Create a message
const message = await Message.create({
  booking_id: bookingId,
  sender_id: userId,
  sender_type: SenderType.TOURIST,
  recipient_id: hotelAdminId,
  message: 'Hello, I would like to request a late check-in.',
  attachments: [],
});

// Mark as read
await message.markAsRead();
```

### Wishlist

```typescript
// Add to wishlist
const wishlist = await Wishlist.create({
  user_id: userId,
  item_type: ItemType.HOTEL,
  item_id: hotelId,
  notes: 'For anniversary trip in June',
});

// Update notes
await wishlist.updateNotes('Updated notes');
```

### AIConversation

```typescript
// Create conversation
const conversation = await AIConversation.create({
  user_id: userId,
  session_id: 'session-' + Date.now(),
  ai_type: AIType.STREAMING,
  context: {
    budget: 1000,
    destination: 'Siem Reap',
    dates: {
      start: new Date('2025-12-01'),
      end: new Date('2025-12-05'),
    },
    preferences: ['temples', 'culture'],
  },
});

// Add messages
await conversation.addMessage(MessageRole.USER, 'I want to visit Angkor Wat');
await conversation.addMessage(MessageRole.ASSISTANT, 'Great choice!');

// Add recommendations
await conversation.addRecommendations({
  hotel_ids: [hotelId],
  tour_ids: [tourId],
});

// Mark as converted
await conversation.markAsConverted(bookingId);
```

## Requirements Covered

These models fulfill the following requirements from the specification:

- **PromoCode**: Requirements 22.1, 22.3, 62.1
- **Message**: Requirement 9.1
- **Wishlist**: Requirement 20.1
- **AIConversation**: Requirements 36.1, 46.1

## Notes

- All models use UUID as primary keys
- Timestamps are automatically managed by Sequelize
- JSON fields are used for flexible data structures
- Proper indexes are created for query optimization
- Foreign key constraints ensure data integrity
- Hooks are used for data validation and normalization
