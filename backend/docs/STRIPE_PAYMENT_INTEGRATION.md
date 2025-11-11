# Stripe Payment Integration

This document describes the Stripe payment gateway integration for the DerLg Tourism Platform.

## Overview

Stripe is integrated as one of the payment options for booking payments, supporting:
- Credit and debit card payments
- 3D Secure authentication (automatic)
- Multiple currencies (USD, KHR, etc.)
- Webhook-based payment status updates
- Refund processing

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...              # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...         # Your Stripe publishable key (for frontend)
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook signing secret
```

### Getting Stripe Credentials

1. **Create a Stripe Account**
   - Go to https://stripe.com
   - Sign up for a free account
   - Verify your email

2. **Get API Keys**
   - Navigate to Developers > API keys
   - Copy the "Secret key" (starts with `sk_test_` for test mode)
   - Copy the "Publishable key" (starts with `pk_test_` for test mode)

3. **Set Up Webhooks**
   - Navigate to Developers > Webhooks
   - Click "Add endpoint"
   - Enter your webhook URL: `https://api.derlg.com/api/payments/stripe/webhook`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `payment_intent.requires_action`
   - Copy the "Signing secret" (starts with `whsec_`)

## API Endpoints

### 1. Create Payment Intent

Creates a Stripe payment intent for a booking.

**Endpoint:** `POST /api/payments/stripe/create`

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
    "booking_id": "uuid",
    "booking_number": "BK-20240101-001",
    "payment_intent_id": "pi_...",
    "client_secret": "pi_..._secret_...",
    "amount": 100.00,
    "currency": "usd",
    "payment_type": "full",
    "status": "requires_payment_method"
  },
  "message": "Stripe payment intent created successfully"
}
```

**Notes:**
- The `client_secret` should be used on the frontend with Stripe.js to complete the payment
- Payment amount is automatically calculated based on booking payment type (deposit/milestone/full)
- 3D Secure authentication is automatically enabled

### 2. Verify Payment

Verifies a Stripe payment and updates booking status.

**Endpoint:** `POST /api/payments/stripe/verify`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "booking_id": "uuid-of-booking",
  "payment_intent_id": "pi_..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "booking_number": "BK-20240101-001",
    "transaction_id": "uuid",
    "payment_intent_id": "pi_...",
    "charge_id": "ch_...",
    "amount": 100.00,
    "currency": "usd",
    "payment_status": "completed",
    "booking_status": "confirmed"
  },
  "message": "Stripe payment verified and processed successfully"
}
```

### 3. Get Payment Status

Retrieves the current status of a Stripe payment intent.

**Endpoint:** `GET /api/payments/stripe/status/:paymentIntentId`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_intent_id": "pi_...",
    "status": "succeeded",
    "amount": 100.00,
    "currency": "usd",
    "payment_method": "pm_...",
    "charges": [...],
    "metadata": {
      "booking_number": "BK-20240101-001"
    }
  },
  "message": "Stripe payment status retrieved successfully"
}
```

### 4. Webhook Handler

Handles webhook events from Stripe.

**Endpoint:** `POST /api/payments/stripe/webhook`

**Authentication:** Not required (verified by Stripe signature)

**Headers:**
```
stripe-signature: t=...,v1=...
```

**Supported Events:**
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `payment_intent.requires_action` - Additional action required (e.g., 3D Secure)

## Payment Flow

### Standard Payment Flow

```
1. User selects Stripe as payment method during booking
   ↓
2. Frontend calls POST /api/payments/stripe/create
   ↓
3. Backend creates payment intent and returns client_secret
   ↓
4. Frontend uses Stripe.js to collect payment details
   ↓
5. Stripe.js confirms payment (handles 3D Secure if needed)
   ↓
6. Frontend calls POST /api/payments/stripe/verify
   ↓
7. Backend verifies payment and updates booking status
   ↓
8. Stripe sends webhook to confirm payment
   ↓
9. Backend processes webhook and sends confirmation email
```

### 3D Secure Authentication Flow

```
1. User enters card details
   ↓
2. Stripe detects 3D Secure requirement
   ↓
3. Payment intent status: "requires_action"
   ↓
4. Stripe.js displays 3D Secure challenge
   ↓
5. User completes authentication
   ↓
6. Payment intent status: "succeeded"
   ↓
7. Webhook confirms payment
```

## Frontend Integration

### Using Stripe.js

```javascript
// 1. Load Stripe.js
const stripe = Stripe('pk_test_...');

// 2. Create payment intent
const response = await fetch('/api/payments/stripe/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ booking_id: bookingId }),
});

const { client_secret } = await response.json();

// 3. Collect payment details
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// 4. Confirm payment
const { error, paymentIntent } = await stripe.confirmCardPayment(
  client_secret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'Customer Name',
        email: 'customer@example.com',
      },
    },
  }
);

if (error) {
  // Handle error
  console.error(error.message);
} else if (paymentIntent.status === 'succeeded') {
  // Payment successful - verify on backend
  await fetch('/api/payments/stripe/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      booking_id: bookingId,
      payment_intent_id: paymentIntent.id,
    }),
  });
}
```

## Testing

### Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0027 6000 3184 | 3D Secure authentication required |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0069 | Expired card |

**Test Card Details:**
- Any future expiration date (e.g., 12/34)
- Any 3-digit CVC
- Any postal code

### Running Tests

```bash
# Test Stripe payment integration
npm run test:stripe <email> <password> <booking_id>

# Example
npm run test:stripe test@example.com Test1234 booking-uuid
```

### Testing Webhooks Locally

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
   ```

4. **Trigger Test Events**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## Security Considerations

### 1. Webhook Signature Verification

All webhooks are verified using Stripe's signature verification:

```typescript
const event = verifyStripeWebhook(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### 2. PCI Compliance

- Never store card details on your server
- Use Stripe.js to collect payment information
- Card data goes directly to Stripe's servers
- Only store Stripe payment intent IDs and charge IDs

### 3. HTTPS Required

- All Stripe API calls must use HTTPS
- Webhook endpoints must be HTTPS in production
- Use valid SSL/TLS certificates

### 4. API Key Security

- Never expose secret keys in frontend code
- Use environment variables for all keys
- Rotate keys if compromised
- Use different keys for test and production

## Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| card_declined | Card was declined | Ask user to try another card |
| insufficient_funds | Insufficient funds | Ask user to try another card |
| expired_card | Card has expired | Ask user to update card details |
| incorrect_cvc | CVC is incorrect | Ask user to re-enter CVC |
| processing_error | Error processing payment | Retry or contact support |
| authentication_required | 3D Secure required | Stripe.js will handle automatically |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "PAY_5002",
    "message": "Failed to create Stripe payment",
    "details": "Card was declined"
  }
}
```

## Refunds

### Processing Refunds

Refunds are handled through the Stripe service:

```typescript
import { createStripeRefund } from '../services/stripe.service';

// Full refund
const refund = await createStripeRefund(chargeId);

// Partial refund
const refund = await createStripeRefund(chargeId, 50.00);
```

### Refund Timeline

- Refunds are processed immediately in Stripe
- Funds typically appear in customer's account within 5-10 business days
- Refund webhooks are sent automatically

## Monitoring and Logs

### Stripe Dashboard

Monitor payments in the Stripe Dashboard:
- https://dashboard.stripe.com/test/payments (test mode)
- https://dashboard.stripe.com/payments (live mode)

### Application Logs

All Stripe operations are logged:

```typescript
logger.info(`Stripe payment intent created: ${paymentIntentId}`);
logger.error('Error creating Stripe payment:', error);
```

### Webhook Logs

View webhook delivery status in Stripe Dashboard:
- Developers > Webhooks > [Your endpoint]
- Shows all webhook attempts and responses

## Production Checklist

Before going live with Stripe:

- [ ] Switch to live API keys (starts with `sk_live_` and `pk_live_`)
- [ ] Update webhook endpoint to production URL
- [ ] Configure webhook signing secret for production
- [ ] Test with real cards in test mode
- [ ] Verify webhook delivery in production
- [ ] Set up monitoring and alerts
- [ ] Review Stripe's terms of service
- [ ] Complete Stripe account verification
- [ ] Enable required payment methods
- [ ] Configure statement descriptor
- [ ] Set up email receipts
- [ ] Test refund process
- [ ] Document support procedures

## Support

### Stripe Documentation
- https://stripe.com/docs
- https://stripe.com/docs/payments/payment-intents
- https://stripe.com/docs/webhooks

### Stripe Support
- Email: support@stripe.com
- Dashboard: https://dashboard.stripe.com/support

### Internal Support
- Backend API: See `backend/src/services/stripe.service.ts`
- Controller: See `backend/src/controllers/payment.controller.ts`
- Routes: See `backend/src/routes/payment.routes.ts`
