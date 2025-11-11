# Stripe Payment Integration - Quick Start Guide

## Setup (5 minutes)

### 1. Get Stripe API Keys

1. Sign up at https://stripe.com
2. Go to Developers > API keys
3. Copy your test keys:
   - Secret key (sk_test_...)
   - Publishable key (pk_test_...)

### 2. Configure Environment

Add to `backend/src/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 3. Test the Integration

```bash
# Create a test booking first
npm run test:booking-creation test@example.com Test1234

# Test Stripe payment with the booking ID
npm run test:stripe test@example.com Test1234 <booking-id>
```

## API Usage

### Create Payment Intent

```bash
curl -X POST http://localhost:5000/api/payments/stripe/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "your-booking-id"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "payment_intent_id": "pi_...",
    "client_secret": "pi_..._secret_...",
    "amount": 100.00,
    "currency": "usd"
  }
}
```

### Verify Payment

```bash
curl -X POST http://localhost:5000/api/payments/stripe/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "your-booking-id",
    "payment_intent_id": "pi_..."
  }'
```

## Frontend Integration

### Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### Complete Payment

```javascript
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripe = await loadStripe('pk_test_...');

// Create payment intent
const response = await fetch('/api/payments/stripe/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ booking_id: bookingId }),
});

const { client_secret } = await response.json();

// Confirm payment
const { error, paymentIntent } = await stripe.confirmCardPayment(
  client_secret,
  {
    payment_method: {
      card: cardElement,
      billing_details: { name: 'Customer Name' },
    },
  }
);

if (paymentIntent.status === 'succeeded') {
  // Verify on backend
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

## Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0027 6000 3184 | 3D Secure |
| 4000 0000 0000 0002 | Declined |

Use any future expiration date and any 3-digit CVC.

## Webhook Setup

### Local Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:5000/api/payments/stripe/webhook

# Get webhook secret from output and add to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://api.derlg.com/api/payments/stripe/webhook`
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
4. Copy signing secret to production .env

## Troubleshooting

### Payment Intent Creation Fails

- Check STRIPE_SECRET_KEY is set correctly
- Verify booking exists and is in pending status
- Check booking payment method is set to 'stripe'

### Payment Verification Fails

- Ensure payment was completed in Stripe
- Check payment_intent_id matches
- Verify booking_id is correct

### Webhook Not Received

- Check webhook URL is accessible
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check Stripe Dashboard > Webhooks for delivery status

## Next Steps

1. Read full documentation: `backend/docs/STRIPE_PAYMENT_INTEGRATION.md`
2. Test with different card scenarios
3. Set up webhook endpoint
4. Test 3D Secure flow
5. Configure production keys when ready

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Test Mode: https://dashboard.stripe.com/test
