# PayPal Payment Integration

This document describes the PayPal payment gateway integration for the DerLg Tourism Platform.

## Overview

The PayPal integration enables tourists to pay for hotel bookings using PayPal. The system supports:
- Full payment with 5% discount
- Deposit payment (50% upfront)
- Milestone payments (50%/25%/25%)
- Escrow protection for all payments
- Automatic booking confirmation on successful payment
- Webhook handling for payment events
- Refund processing for cancellations

## Architecture

### Components

1. **PayPal Service** (`src/services/paypal.service.ts`)
   - Handles PayPal SDK initialization
   - Creates PayPal orders
   - Captures payments
   - Processes refunds
   - Verifies webhooks

2. **Payment Controller** (`src/controllers/payment.controller.ts`)
   - Manages payment flow
   - Creates payment intents
   - Captures payments
   - Handles webhook events
   - Updates booking status

3. **Payment Routes** (`src/routes/payment.routes.ts`)
   - Defines API endpoints
   - Applies authentication middleware
   - Handles redirects

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or 'production' for live

# API URL (for redirects)
API_URL=http://localhost:5000

# Frontend URL (for redirects)
CORS_ORIGIN=http://localhost:3000
```

### Getting PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app or use an existing one
3. Copy the Client ID and Secret from the app credentials
4. For testing, use Sandbox mode
5. For production, switch to Live mode and use production credentials

## API Endpoints

### 1. Create PayPal Payment Intent

Creates a PayPal order for a booking.

**Endpoint:** `POST /api/payments/paypal/create`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "booking_id": "uuid-of-booking"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid-of-booking",
    "booking_number": "BK-ABC123",
    "paypal_order_id": "paypal-order-id",
    "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=...",
    "amount": 150.00,
    "currency": "USD",
    "payment_type": "full"
  },
  "message": "PayPal payment intent created successfully"
}
```

**Flow:**
1. Validates booking exists and belongs to user
2. Checks booking is in pending status
3. Calculates payment amount based on payment type
4. Creates PayPal order
5. Returns approval URL for user to complete payment

### 2. Capture PayPal Payment

Captures the payment after user approves it on PayPal.

**Endpoint:** `POST /api/payments/paypal/capture`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "booking_id": "uuid-of-booking",
  "paypal_order_id": "paypal-order-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid-of-booking",
    "booking_number": "BK-ABC123",
    "transaction_id": "uuid-of-transaction",
    "capture_id": "paypal-capture-id",
    "amount": 150.00,
    "currency": "USD",
    "payment_status": "completed",
    "booking_status": "confirmed",
    "payer_email": "buyer@example.com",
    "payer_name": "John Doe"
  },
  "message": "Payment captured successfully"
}
```

**Flow:**
1. Validates booking and PayPal order ID
2. Captures payment from PayPal
3. Creates payment transaction record
4. Updates booking payment status
5. Confirms booking if full payment or deposit
6. Sends confirmation email (TODO)
7. Creates Google Calendar event (TODO)

### 3. Get PayPal Payment Status

Retrieves the current status of a PayPal order.

**Endpoint:** `GET /api/payments/paypal/status/:orderId`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "paypal-order-id",
    "status": "APPROVED",
    "payer": {
      "email_address": "buyer@example.com",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      }
    },
    "purchase_units": [...]
  },
  "message": "PayPal order status retrieved successfully"
}
```

### 4. PayPal Webhook Handler

Receives and processes webhook events from PayPal.

**Endpoint:** `POST /api/payments/paypal/webhook`

**Authentication:** None (verified by PayPal signature)

**Supported Events:**
- `PAYMENT.CAPTURE.COMPLETED` - Payment successfully captured
- `PAYMENT.CAPTURE.DENIED` - Payment capture failed
- `PAYMENT.CAPTURE.REFUNDED` - Payment refunded

**Flow:**
1. Receives webhook event from PayPal
2. Verifies webhook signature (TODO: implement full verification)
3. Processes event based on type
4. Updates transaction and booking status
5. Sends notifications to users

### 5. Success Redirect

Handles browser redirect after successful PayPal approval.

**Endpoint:** `GET /api/payments/paypal/success?token=order-id`

**Response:** Redirects to frontend success page

### 6. Cancel Redirect

Handles browser redirect when user cancels PayPal payment.

**Endpoint:** `GET /api/payments/paypal/cancel?token=order-id`

**Response:** Redirects to frontend cancel page

## Payment Flow

### Full Payment Flow

```
1. User creates booking
   ↓
2. Booking status: PENDING
   Payment status: PENDING
   ↓
3. User initiates PayPal payment
   POST /api/payments/paypal/create
   ↓
4. System creates PayPal order
   Returns approval URL
   ↓
5. User redirected to PayPal
   Logs in and approves payment
   ↓
6. PayPal redirects back to success URL
   ↓
7. Frontend calls capture endpoint
   POST /api/payments/paypal/capture
   ↓
8. System captures payment
   Creates transaction record
   ↓
9. Booking status: CONFIRMED
   Payment status: COMPLETED
   ↓
10. User receives confirmation email
    Calendar event created
```

### Deposit Payment Flow

```
1. User creates booking with deposit option
   ↓
2. System calculates 50% deposit amount
   ↓
3. User pays deposit via PayPal
   ↓
4. Booking status: PENDING
   Payment status: PARTIAL
   ↓
5. System schedules reminder for remaining balance
   ↓
6. User pays remaining balance before check-in
   ↓
7. Booking status: CONFIRMED
   Payment status: COMPLETED
```

### Milestone Payment Flow

```
1. User creates booking with milestone option
   ↓
2. First payment: 50% upfront
   ↓
3. Second payment: 25% one week before
   (Automated reminder sent)
   ↓
4. Third payment: 25% upon arrival
   (Automated reminder sent)
   ↓
5. All payments completed
   Booking status: CONFIRMED
```

## Database Schema

### PaymentTransaction Table

```typescript
{
  id: UUID,
  booking_id: UUID (FK to bookings),
  transaction_id: string (PayPal capture ID),
  gateway: 'paypal',
  amount: decimal,
  currency: 'USD' | 'KHR',
  payment_type: 'deposit' | 'milestone_1' | 'milestone_2' | 'milestone_3' | 'full',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  gateway_response: JSON (PayPal response),
  escrow_status: 'held' | 'released' | 'refunded',
  escrow_release_date: Date,
  refund_amount: decimal,
  refund_reason: string,
  created_at: Date,
  updated_at: Date
}
```

### Booking Payment Object

```typescript
{
  method: 'paypal',
  type: 'deposit' | 'milestone' | 'full',
  status: 'pending' | 'partial' | 'completed' | 'refunded',
  transactions: [
    {
      transaction_id: string,
      amount: number,
      payment_type: string,
      status: string,
      timestamp: Date
    }
  ],
  escrow_status: 'held' | 'released'
}
```

## Error Handling

### Error Codes

- `AUTH_1003` - User not authenticated
- `VAL_2002` - Missing required fields
- `RES_3001` - Booking not found
- `BOOK_4004` - Invalid booking status
- `PAY_5001` - Payment failed
- `PAY_5002` - Payment gateway error

### Common Errors

1. **PayPal credentials not configured**
   - Ensure `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
   - Check `PAYPAL_MODE` is set to 'sandbox' or 'production'

2. **Order capture failed**
   - User may have cancelled payment
   - Insufficient funds in PayPal account
   - PayPal account restrictions

3. **Webhook verification failed**
   - Webhook signature mismatch
   - Webhook ID not configured
   - Invalid webhook payload

## Testing

### Test Script

Run the PayPal integration test:

```bash
npm run test:paypal
```

This script:
1. Logs in as a tourist
2. Creates a test booking
3. Creates PayPal payment intent
4. Gets order status
5. Provides instructions for manual payment approval

### Manual Testing

1. **Create a booking:**
   ```bash
   POST /api/bookings
   {
     "hotel_id": "...",
     "room_id": "...",
     "check_in": "2025-01-15",
     "check_out": "2025-01-17",
     "guests": { "adults": 2, "children": 0 },
     "guest_details": {
       "name": "Test User",
       "email": "test@example.com",
       "phone": "+1234567890"
     },
     "payment_method": "paypal",
     "payment_type": "full"
   }
   ```

2. **Create payment intent:**
   ```bash
   POST /api/payments/paypal/create
   {
     "booking_id": "booking-uuid"
   }
   ```

3. **Open approval URL in browser**
   - Login to PayPal sandbox account
   - Approve the payment

4. **Capture payment:**
   ```bash
   POST /api/payments/paypal/capture
   {
     "booking_id": "booking-uuid",
     "paypal_order_id": "paypal-order-id"
   }
   ```

### PayPal Sandbox Testing

1. Create sandbox accounts at [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Use sandbox buyer account to test payments
3. Use sandbox business account to receive payments
4. Test different scenarios:
   - Successful payment
   - Cancelled payment
   - Insufficient funds
   - Refunds

## Webhook Configuration

### Setting Up Webhooks

1. Go to PayPal Developer Dashboard
2. Select your app
3. Go to Webhooks section
4. Add webhook URL: `https://api.derlg.com/api/payments/paypal/webhook`
5. Select events to subscribe:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
6. Save webhook ID for signature verification

### Webhook Security

The webhook handler should verify PayPal signatures to ensure authenticity. This requires:
- Webhook ID from PayPal dashboard
- PayPal SDK verification methods
- Proper error handling for invalid signatures

## Refund Processing

### Automatic Refunds

Refunds are processed automatically for:
- Booking cancellations (based on cancellation policy)
- Hotel rejections
- System errors

### Refund Policy

- **30+ days before check-in:** Full refund minus processing fees
- **7-30 days before check-in:** 50% refund
- **Less than 7 days:** Deposit retained, additional payments refunded

### Manual Refunds

Super admins can process manual refunds through the admin dashboard (to be implemented).

## Security Considerations

1. **API Authentication**
   - All payment endpoints require JWT authentication
   - Webhooks verified by PayPal signature

2. **Data Protection**
   - Sensitive payment data stored in gateway_response (encrypted at rest)
   - PCI compliance maintained by using PayPal
   - No credit card data stored on our servers

3. **Escrow Protection**
   - All payments held in escrow until service delivery
   - Automatic release after check-out
   - Protects both tourists and hotels

4. **Rate Limiting**
   - Payment endpoints rate-limited to prevent abuse
   - Webhook endpoints monitored for suspicious activity

## Future Enhancements

1. **Webhook Signature Verification**
   - Implement full PayPal webhook signature verification
   - Add webhook ID to environment configuration

2. **Automated Milestone Payments**
   - Schedule automatic payment reminders
   - Process milestone payments automatically
   - Send SMS/email notifications

3. **Refund Automation**
   - Automatic refund processing based on cancellation policy
   - Partial refund calculations
   - Refund status tracking

4. **Payment Analytics**
   - Track payment success rates
   - Monitor failed payments
   - Generate revenue reports

5. **Multi-Currency Support**
   - Support KHR (Cambodian Riel) payments
   - Automatic currency conversion
   - Display prices in user's preferred currency

## Support

For PayPal integration issues:
1. Check PayPal Developer Dashboard for API status
2. Review PayPal SDK documentation
3. Contact PayPal support for payment issues
4. Check application logs for detailed error messages

## References

- [PayPal Server SDK Documentation](https://www.npmjs.com/package/@paypal/paypal-server-sdk)
- [PayPal REST API Reference](https://developer.paypal.com/api/rest/)
- [PayPal Webhooks Guide](https://developer.paypal.com/api/rest/webhooks/)
- [PayPal Sandbox Testing](https://developer.paypal.com/tools/sandbox/)
