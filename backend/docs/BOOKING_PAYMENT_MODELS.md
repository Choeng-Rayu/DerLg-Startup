# Booking and Payment Transaction Models Documentation

## Overview

This document describes the Booking and PaymentTransaction models that handle the core booking and payment functionality of the DerLg Tourism Platform.

## Booking Model

### Purpose
Manages hotel room bookings with comprehensive tracking of guest information, pricing, payment status, and cancellation details.

### Key Features
- Automatic booking number generation
- Automatic nights calculation
- Multiple payment options (deposit, milestone, full)
- Cancellation policy with refund calculation
- Google Calendar integration support
- Comprehensive validation

### Schema

```typescript
interface Booking {
  id: string;                          // UUID
  booking_number: string;              // Auto-generated: BK-{timestamp}-{random}
  user_id: string;                     // FK to users
  hotel_id: string;                    // FK to hotels
  room_id: string;                     // FK to rooms
  check_in: Date;                      // DATEONLY
  check_out: Date;                     // DATEONLY
  nights: number;                      // Auto-calculated
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
    method: 'paypal' | 'bakong' | 'stripe';
    type: 'deposit' | 'milestone' | 'full';
    status: 'pending' | 'partial' | 'completed' | 'refunded';
    transactions: PaymentTransactionInfo[];
    escrow_status: 'held' | 'released';
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  cancellation: {
    cancelled_at: Date;
    reason: string;
    refund_amount: number;
    refund_status: string;
  } | null;
  calendar_event_id: string | null;    // Google Calendar event ID
  created_at: Date;
  updated_at: Date;
}
```

### Indexes
- `idx_bookings_user_id` - For user's booking queries
- `idx_bookings_hotel_id` - For hotel's booking queries
- `idx_bookings_status` - For status-based filtering
- `idx_bookings_check_in` - For date-based queries
- `idx_bookings_booking_number` - For booking lookup
- `idx_bookings_room_id` - For room availability queries

### Instance Methods

#### `calculateNights(): number`
Calculates the number of nights between check-in and check-out dates.

#### `isUpcoming(): boolean`
Returns true if the booking is confirmed and check-in date is in the future.

#### `isActive(): boolean`
Returns true if the current date is between check-in and check-out dates and status is confirmed.

#### `isPast(): boolean`
Returns true if the check-out date has passed.

#### `calculateRefundAmount(): number`
Calculates refund amount based on cancellation policy:
- 30+ days before check-in: 100% refund
- 7-30 days before check-in: 50% refund
- Less than 7 days: Depends on payment type (0% for deposit, 50% for others)

#### `toSafeObject(): object`
Returns booking object with additional computed fields (nights, is_upcoming, is_active, is_past).

### Validation Rules
- Check-in date cannot be in the past
- Check-out date must be after check-in date
- At least 1 adult guest required
- Children count cannot be negative
- Guest details must include name, email, and phone
- Email must be valid format
- Pricing total cannot be negative
- Payment method must be paypal, bakong, or stripe
- Payment type must be deposit, milestone, or full
- Payment status must be pending, partial, completed, or refunded

### Hooks

#### beforeCreate
- Generates booking number if not provided (format: BK-{timestamp}-{random})
- Calculates nights if not provided
- Initializes payment transactions array

#### beforeUpdate
- Recalculates nights if dates changed

## PaymentTransaction Model

### Purpose
Tracks individual payment transactions for bookings with support for multiple payment gateways, escrow management, and refund processing.

### Key Features
- Multiple payment gateway support (PayPal, Bakong, Stripe)
- Multiple payment types (deposit, milestone payments, full payment)
- Escrow management with automatic release date tracking
- Refund processing with amount and reason tracking
- Multi-currency support (USD, KHR)
- Gateway response sanitization for security

### Schema

```typescript
interface PaymentTransaction {
  id: string;                          // UUID
  booking_id: string;                  // FK to bookings
  transaction_id: string;              // Unique gateway transaction ID
  gateway: 'paypal' | 'bakong' | 'stripe';
  amount: number;                      // Decimal(10,2)
  currency: 'USD' | 'KHR';
  payment_type: 'deposit' | 'milestone_1' | 'milestone_2' | 'milestone_3' | 'full';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway_response: any;               // JSON - raw gateway response
  escrow_status: 'held' | 'released' | 'refunded';
  escrow_release_date: Date | null;
  refund_amount: number | null;        // Decimal(10,2)
  refund_reason: string | null;
  created_at: Date;
  updated_at: Date;
}
```

### Indexes
- `idx_payment_transactions_booking_id` - For booking's transactions
- `idx_payment_transactions_status` - For status-based queries
- `idx_payment_transactions_gateway` - For gateway-specific queries
- `idx_payment_transactions_transaction_id` - For transaction lookup
- `idx_payment_transactions_escrow_status` - For escrow management
- `idx_payment_transactions_payment_type` - For payment type filtering

### Instance Methods

#### `isSuccessful(): boolean`
Returns true if transaction status is completed.

#### `isPending(): boolean`
Returns true if transaction status is pending.

#### `isRefunded(): boolean`
Returns true if transaction status is refunded.

#### `isEscrowHeld(): boolean`
Returns true if escrow status is held.

#### `isEscrowReleased(): boolean`
Returns true if escrow status is released.

#### `toSafeObject(): object`
Returns transaction object with sanitized gateway response (only includes status field).

### Validation Rules
- Transaction ID must be unique
- Amount must be greater than 0
- Gateway must be paypal, bakong, or stripe
- Payment type must be deposit, milestone_1, milestone_2, milestone_3, or full
- Status must be pending, completed, failed, or refunded
- Escrow status must be held, released, or refunded
- Currency must be USD or KHR
- Refund amount cannot be negative
- Refund amount cannot exceed transaction amount
- Refund amount and reason required when status is refunded

### Hooks

#### beforeUpdate
- Sets escrow_release_date when escrow_status changes to released
- Validates refund_amount and refund_reason when status changes to refunded

## Payment Flow Examples

### Deposit Payment (50-70%)
```typescript
// 1. Create booking with deposit payment type
const booking = await Booking.create({
  // ... booking details
  payment: {
    method: 'paypal',
    type: 'deposit',
    status: 'pending',
    transactions: [],
    escrow_status: 'held'
  }
});

// 2. Process deposit payment (50% of total)
const depositTransaction = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: 'PAYPAL-DEP-12345',
  gateway: 'paypal',
  amount: booking.pricing.total * 0.5,
  currency: 'USD',
  payment_type: 'deposit',
  status: 'completed',
  escrow_status: 'held'
});

// 3. Update booking status
booking.status = 'confirmed';
booking.payment.status = 'partial';
await booking.save();

// 4. Process remaining payment before check-in
const remainingTransaction = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: 'PAYPAL-REM-12345',
  gateway: 'paypal',
  amount: booking.pricing.total * 0.5,
  currency: 'USD',
  payment_type: 'deposit',
  status: 'completed',
  escrow_status: 'held'
});

// 5. Update booking payment status
booking.payment.status = 'completed';
await booking.save();
```

### Milestone Payment (50%/25%/25%)
```typescript
// 1. Create booking with milestone payment type
const booking = await Booking.create({
  // ... booking details
  payment: {
    method: 'stripe',
    type: 'milestone',
    status: 'pending',
    transactions: [],
    escrow_status: 'held'
  }
});

// 2. Process first milestone (50% upfront)
const milestone1 = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: 'STRIPE-M1-12345',
  gateway: 'stripe',
  amount: booking.pricing.total * 0.5,
  currency: 'USD',
  payment_type: 'milestone_1',
  status: 'completed',
  escrow_status: 'held'
});

// 3. Process second milestone (25% one week before)
const milestone2 = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: 'STRIPE-M2-12345',
  gateway: 'stripe',
  amount: booking.pricing.total * 0.25,
  currency: 'USD',
  payment_type: 'milestone_2',
  status: 'completed',
  escrow_status: 'held'
});

// 4. Process third milestone (25% upon arrival)
const milestone3 = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: 'STRIPE-M3-12345',
  gateway: 'stripe',
  amount: booking.pricing.total * 0.25,
  currency: 'USD',
  payment_type: 'milestone_3',
  status: 'completed',
  escrow_status: 'held'
});
```

### Full Payment with Discount
```typescript
// 1. Create booking with full payment type
const booking = await Booking.create({
  // ... booking details
  pricing: {
    room_rate: 150.0,
    subtotal: 600.0,
    discount: 90.0, // 60 (room discount) + 30 (5% full payment discount)
    promo_code: null,
    student_discount: 0,
    tax: 51.0,
    total: 561.0 // 5% discount applied
  },
  payment: {
    method: 'bakong',
    type: 'full',
    status: 'pending',
    transactions: [],
    escrow_status: 'held'
  }
});

// 2. Process full payment
const fullTransaction = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: 'BAKONG-FULL-12345',
  gateway: 'bakong',
  amount: booking.pricing.total,
  currency: 'KHR',
  payment_type: 'full',
  status: 'completed',
  escrow_status: 'held'
});

// 3. Update booking status
booking.status = 'confirmed';
booking.payment.status = 'completed';
await booking.save();
```

### Refund Processing
```typescript
// 1. Calculate refund amount
const refundAmount = booking.calculateRefundAmount();

// 2. Create refund transaction
const refundTransaction = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: 'PAYPAL-REFUND-12345',
  gateway: 'paypal',
  amount: refundAmount,
  currency: 'USD',
  payment_type: 'deposit',
  status: 'refunded',
  escrow_status: 'refunded',
  refund_amount: refundAmount,
  refund_reason: 'Customer cancellation'
});

// 3. Update booking
booking.status = 'cancelled';
booking.payment.status = 'refunded';
booking.cancellation = {
  cancelled_at: new Date(),
  reason: 'Customer request',
  refund_amount: refundAmount,
  refund_status: 'processed'
};
await booking.save();
```

## Associations

### Booking Associations
- `belongsTo` User (as 'user')
- `belongsTo` Hotel (as 'hotel')
- `belongsTo` Room (as 'room')
- `hasMany` PaymentTransaction (as 'payment_transactions')

### PaymentTransaction Associations
- `belongsTo` Booking (as 'booking')

## Query Examples

### Get user's bookings with details
```typescript
const bookings = await Booking.findAll({
  where: { user_id: userId },
  include: [
    { model: Hotel, as: 'hotel' },
    { model: Room, as: 'room' },
    { model: PaymentTransaction, as: 'payment_transactions' }
  ],
  order: [['check_in', 'DESC']]
});
```

### Get hotel's upcoming bookings
```typescript
const upcomingBookings = await Booking.findAll({
  where: {
    hotel_id: hotelId,
    status: 'confirmed',
    check_in: {
      [Op.gte]: new Date()
    }
  },
  include: [
    { model: User, as: 'user' },
    { model: Room, as: 'room' }
  ],
  order: [['check_in', 'ASC']]
});
```

### Get booking's payment history
```typescript
const transactions = await PaymentTransaction.findAll({
  where: { booking_id: bookingId },
  order: [['created_at', 'ASC']]
});
```

### Get pending payments
```typescript
const pendingPayments = await PaymentTransaction.findAll({
  where: {
    status: 'pending',
    escrow_status: 'held'
  },
  include: [
    {
      model: Booking,
      as: 'booking',
      include: [
        { model: User, as: 'user' },
        { model: Hotel, as: 'hotel' }
      ]
    }
  ]
});
```

## Testing

Run the comprehensive test suite:
```bash
npm run test:booking
```

The test covers:
- Model creation and validation
- Automatic field generation (booking_number, nights)
- Instance methods
- Associations
- Multiple payment scenarios
- Refund processing
- Data integrity constraints

## Security Considerations

1. **Gateway Response Sanitization**: The `toSafeObject()` method sanitizes gateway responses to prevent sensitive data exposure
2. **Escrow Protection**: All payments are held in escrow until service delivery
3. **Refund Validation**: Refund amounts are validated against transaction amounts
4. **Transaction Uniqueness**: Transaction IDs must be unique to prevent duplicate processing
5. **Status Validation**: Payment and booking statuses are validated through enums

## Performance Optimization

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **JSON Fields**: Complex data structures use JSON for efficient storage
3. **Eager Loading**: Use `include` to prevent N+1 queries
4. **Pagination**: Implement pagination for large result sets

## Future Enhancements

1. Add support for partial refunds
2. Implement automatic milestone payment reminders
3. Add support for payment plan customization
4. Implement automatic escrow release after service delivery
5. Add support for split payments (multiple payment methods)
6. Implement payment retry logic for failed transactions
