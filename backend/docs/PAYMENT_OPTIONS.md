# Payment Options API Documentation

## Overview

The Payment Options feature provides flexible payment methods for bookings, allowing customers to choose between deposit, milestone, or full payment options. This implementation follows Requirement 44 from the platform specifications.

## Payment Types

### 1. Deposit Payment (50-70%)
- Customer pays 50-70% upfront as a deposit
- Remaining balance due at check-in
- Default deposit percentage: 60%
- Customizable within the 50-70% range

### 2. Milestone Payment (50%/25%/25%)
- Payment split into three milestones:
  - **Milestone 1**: 50% upfront payment (immediately)
  - **Milestone 2**: 25% payment one week before check-in
  - **Milestone 3**: 25% payment upon arrival
- Automatic payment scheduling

### 3. Full Payment (with 5% discount)
- Pay 100% upfront
- Receive 5% discount on total amount
- Bonus services included:
  - Free airport pickup
  - Priority check-in
  - Complimentary welcome drink

## API Endpoints

### Get Payment Options

Calculate available payment options for a booking before creating it.

**Endpoint:** `POST /api/bookings/payment-options`

**Access:** Public (no authentication required)

**Request Body:**
```json
{
  "room_id": "uuid",
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "guests": {
    "adults": 2,
    "children": 1
  },
  "deposit_percentage": 60
}
```

**Parameters:**
- `room_id` (required): UUID of the room
- `check_in` (required): Check-in date (YYYY-MM-DD)
- `check_out` (required): Check-out date (YYYY-MM-DD)
- `guests` (required): Guest information
  - `adults` (required): Number of adults (minimum 1)
  - `children` (optional): Number of children (default 0)
- `deposit_percentage` (optional): Deposit percentage (50-70, default 60)

**Response:**
```json
{
  "success": true,
  "data": {
    "pricing_breakdown": {
      "room_rate": 100.00,
      "nights": 4,
      "subtotal": 400.00,
      "room_discount": 0.00,
      "student_discount": 0.00,
      "tax": 40.00,
      "total": 440.00
    },
    "payment_options": {
      "deposit": {
        "payment_type": "deposit",
        "original_total": 440.00,
        "discount_amount": 0.00,
        "final_total": 440.00,
        "deposit_amount": 264.00,
        "remaining_balance": 176.00,
        "payment_schedule": [
          {
            "milestone": 1,
            "percentage": 60,
            "amount": 264.00,
            "due_date": "2025-10-23T00:00:00.000Z",
            "description": "Initial deposit payment"
          },
          {
            "milestone": 2,
            "percentage": 40,
            "amount": 176.00,
            "due_date": "2025-12-01",
            "description": "Remaining balance due at check-in"
          }
        ]
      },
      "milestone": {
        "payment_type": "milestone",
        "original_total": 440.00,
        "discount_amount": 0.00,
        "final_total": 440.00,
        "payment_schedule": [
          {
            "milestone": 1,
            "percentage": 50,
            "amount": 220.00,
            "due_date": "2025-10-23T00:00:00.000Z",
            "description": "50% upfront payment"
          },
          {
            "milestone": 2,
            "percentage": 25,
            "amount": 110.00,
            "due_date": "2025-11-24T00:00:00.000Z",
            "description": "25% payment one week before check-in"
          },
          {
            "milestone": 3,
            "percentage": 25,
            "amount": 110.00,
            "due_date": "2025-12-01",
            "description": "25% payment upon arrival"
          }
        ]
      },
      "full": {
        "payment_type": "full",
        "original_total": 440.00,
        "discount_amount": 22.00,
        "final_total": 418.00,
        "bonus_services": [
          "Free airport pickup",
          "Priority check-in",
          "Complimentary welcome drink"
        ]
      }
    }
  },
  "message": "Payment options calculated successfully"
}
```

### Create Booking with Payment Option

When creating a booking, specify the desired payment type.

**Endpoint:** `POST /api/bookings`

**Access:** Private (requires authentication)

**Request Body:**
```json
{
  "hotel_id": "uuid",
  "room_id": "uuid",
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "guests": {
    "adults": 2,
    "children": 1
  },
  "guest_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "special_requests": "Late check-in"
  },
  "payment_method": "stripe",
  "payment_type": "full"
}
```

**Payment Type Options:**
- `deposit`: Pay 50-70% deposit (default 60%)
- `milestone`: Pay in three installments (50%/25%/25%)
- `full`: Pay 100% upfront with 5% discount

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-ABC123-XYZ",
      "status": "pending",
      "pricing": {
        "total": 418.00
      },
      "payment": {
        "method": "stripe",
        "type": "full",
        "status": "pending"
      }
    },
    "payment_info": {
      "amount_due": 418.00,
      "payment_type": "full",
      "discount_applied": 22.00,
      "bonus_services": [
        "Free airport pickup",
        "Priority check-in",
        "Complimentary welcome drink"
      ],
      "payment_options": {
        // All available payment options
      }
    },
    "message": "Booking created successfully. Please complete payment within 15 minutes."
  }
}
```

## Payment Calculations

### Deposit Payment Calculation

```typescript
// For 60% deposit on $440 total
deposit_amount = $440 × 0.60 = $264.00
remaining_balance = $440 - $264 = $176.00
```

### Milestone Payment Calculation

```typescript
// For $440 total
milestone_1 = $440 × 0.50 = $220.00  // Immediate
milestone_2 = $440 × 0.25 = $110.00  // One week before
milestone_3 = $440 × 0.25 = $110.00  // Upon arrival
```

### Full Payment Calculation

```typescript
// For $440 total with 5% discount
discount = $440 × 0.05 = $22.00
final_total = $440 - $22 = $418.00
```

## Payment Schedule

### Deposit Payment Schedule
1. **Immediate**: Deposit amount (50-70%)
2. **Check-in**: Remaining balance

### Milestone Payment Schedule
1. **Immediate**: 50% of total
2. **7 days before check-in**: 25% of total
3. **Check-in day**: 25% of total

### Full Payment Schedule
1. **Immediate**: 100% of total (with 5% discount applied)

## Bonus Services for Full Payment

When customers choose full payment, they receive:
- **Free airport pickup**: Complimentary transportation from airport to hotel
- **Priority check-in**: Skip the queue and check in faster
- **Complimentary welcome drink**: Free drink upon arrival

## Validation Rules

### Deposit Percentage
- Minimum: 50%
- Maximum: 70%
- Default: 60%

### Date Validation
- Check-in date must not be in the past
- Check-out date must be after check-in date
- Milestone 2 payment scheduled 7 days before check-in

### Payment Type Validation
- Must be one of: `deposit`, `milestone`, `full`
- Invalid payment types will return error code `VAL_2001`

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| VAL_2001 | Invalid payment type | Payment type must be deposit, milestone, or full |
| VAL_2001 | Deposit percentage must be between 50% and 70% | Invalid deposit percentage |
| VAL_2002 | Missing required fields | Required fields not provided |
| VAL_2003 | Check-in date cannot be in the past | Invalid check-in date |
| VAL_2003 | Check-out date must be after check-in date | Invalid date range |
| RES_3001 | Room not found | Room ID does not exist |
| SYS_9001 | Failed to calculate payment options | Server error |

## Usage Examples

### Example 1: Get Payment Options

```bash
curl -X POST http://localhost:3000/api/bookings/payment-options \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "123e4567-e89b-12d3-a456-426614174000",
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "guests": {
      "adults": 2,
      "children": 1
    },
    "deposit_percentage": 60
  }'
```

### Example 2: Create Booking with Full Payment

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "hotel_id": "123e4567-e89b-12d3-a456-426614174000",
    "room_id": "123e4567-e89b-12d3-a456-426614174001",
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "guests": {
      "adults": 2,
      "children": 1
    },
    "guest_details": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "payment_method": "stripe",
    "payment_type": "full"
  }'
```

### Example 3: Create Booking with Milestone Payment

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "hotel_id": "123e4567-e89b-12d3-a456-426614174000",
    "room_id": "123e4567-e89b-12d3-a456-426614174001",
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "guests": {
      "adults": 2,
      "children": 0
    },
    "guest_details": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890"
    },
    "payment_method": "paypal",
    "payment_type": "milestone"
  }'
```

## Integration Notes

### Frontend Integration

1. **Display Payment Options**: Call `/api/bookings/payment-options` to show available options
2. **User Selection**: Allow user to choose preferred payment type
3. **Create Booking**: Submit booking with selected payment type
4. **Process Payment**: Redirect to payment gateway with calculated amount

### Payment Gateway Integration

- **Deposit**: Process initial deposit amount
- **Milestone**: Process first milestone (50%), schedule remaining payments
- **Full**: Process full amount with discount applied

### Escrow Protection

All payments are held in escrow until service delivery:
- Funds released to service provider after successful check-in
- Automatic refund processing for cancellations
- Dispute resolution support

## Testing

Run the payment options test suite:

```bash
npm run test:payment-options
```

Or using ts-node:

```bash
npx ts-node src/scripts/testPaymentOptions.ts
```

## Requirements Mapping

This implementation satisfies the following requirements:

- **44.1**: Multiple payment options (deposit, milestone, full)
- **44.2**: Clear display of remaining balance and payment schedule
- **44.3**: Automatic milestone payment scheduling
- **44.4**: 5% discount and bonus services for full payment
- **44.5**: Escrow protection through payment gateway

## Related Documentation

- [Booking API](./BOOKING_API.md)
- [PayPal Integration](./PAYPAL_PAYMENT_INTEGRATION.md)
- [Stripe Integration](./STRIPE_PAYMENT_INTEGRATION.md)
- [Bakong Integration](./BAKONG_PAYMENT_INTEGRATION.md)
