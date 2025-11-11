# Escrow and Payment Scheduling - Quick Start Guide

## Overview

The DerLg platform automatically manages escrow and payment scheduling for all bookings. This guide provides quick reference for developers.

## Key Concepts

### Escrow
- All payments are held in escrow until service delivery
- Escrow is automatically released after check-out date
- Provides protection for both customers and service providers

### Payment Types
1. **Full Payment**: 100% upfront, 5% discount, immediate confirmation
2. **Deposit Payment**: 50-70% upfront, balance at check-in
3. **Milestone Payment**: 50% upfront, 25% one week before, 25% on arrival

## Quick Integration

### 1. Payment Processing

When processing a payment, the escrow is automatically handled:

```typescript
// After successful payment
const transaction = await PaymentTransaction.create({
  booking_id: booking.id,
  transaction_id: captureResult.captureId,
  gateway: PaymentGateway.PAYPAL,
  amount: captureResult.amount,
  currency: Currency.USD,
  payment_type: paymentType,
  status: TransactionStatus.COMPLETED,
  escrow_status: TransactionEscrowStatus.HELD, // Automatically held
});

// Hold in escrow
await holdPaymentInEscrow(transaction.id, booking.id);

// Process milestone if applicable
if (booking.payment.type === 'milestone') {
  await processMilestonePayment(booking.id, 1, transaction.id);
}
```

### 2. Scheduled Jobs

Jobs run automatically on server startup:

```typescript
// src/index.ts
import { initializeScheduledJobs } from './services/escrow-payment-scheduler.service';

initializeScheduledJobs(); // Called once on startup
```

### 3. Manual Operations

```typescript
import {
  holdPaymentInEscrow,
  releaseEscrowPayment,
  processMilestonePayment,
  getPaymentSchedule,
} from './services/escrow-payment-scheduler.service';

// Hold payment in escrow
await holdPaymentInEscrow(transactionId, bookingId);

// Release escrow (for completed bookings)
await releaseEscrowPayment(bookingId);

// Process milestone payment
await processMilestonePayment(bookingId, milestoneNumber, transactionId);

// Get payment schedule
const schedule = getPaymentSchedule(booking);
```

## Scheduled Jobs

### Daily Schedule

| Time | Job | Description |
|------|-----|-------------|
| 9:00 AM | Milestone Reminders | Check for upcoming milestone payments |
| 10:00 AM | Booking Reminders | Send 24-hour check-in reminders |
| 11:00 AM | Escrow Release | Release escrow for completed bookings |

### Customizing Schedule

Set environment variables:

```env
CRON_MILESTONE_REMINDERS=0 9 * * *
CRON_BOOKING_REMINDERS=0 10 * * *
CRON_ESCROW_RELEASE=0 11 * * *
```

## Payment Flow Examples

### Full Payment Flow

```
User pays 100% → Transaction created (escrow_status: held)
                ↓
         Booking confirmed
                ↓
         User checks out
                ↓
    Daily escrow check runs
                ↓
      Escrow released automatically
```

### Milestone Payment Flow

```
User pays 50% → Milestone 1 processed (escrow_status: held)
                ↓
         Booking pending
                ↓
    1 week before check-in
                ↓
    Reminder sent for Milestone 2
                ↓
    User pays 25% → Milestone 2 processed
                ↓
         On check-in day
                ↓
    Reminder sent for Milestone 3
                ↓
    User pays 25% → Milestone 3 processed
                ↓
         Booking confirmed
                ↓
         User checks out
                ↓
    All escrow payments released
```

## Notification Templates

### Payment Reminder

**Email Subject**: Payment Reminder - Booking [BOOKING_NUMBER]

**SMS**: Payment reminder: $[AMOUNT] due on [DUE_DATE] for booking [BOOKING_NUMBER].

### Booking Reminder

**Email Subject**: Booking Reminder - Check-in Tomorrow

**SMS**: Reminder: Your check-in is tomorrow for booking [BOOKING_NUMBER].

## Error Handling

All operations include error handling:

```typescript
try {
  await holdPaymentInEscrow(transactionId, bookingId);
} catch (error) {
  logger.error('Error holding payment in escrow:', error);
  // Handle error appropriately
}
```

## Monitoring

Check logs for escrow operations:

```bash
# View logs
tail -f logs/app.log | grep -i escrow

# Check scheduled jobs
ps aux | grep node
```

## Testing

```bash
# Test escrow scheduler
npm run test:escrow-scheduler

# Test payment processing (includes escrow)
npm run test:paypal:payment
npm run test:bakong
npm run test:stripe
```

## Common Issues

### Issue: Scheduled jobs not running

**Solution**: Verify server is running and check logs for initialization message:
```
Scheduled jobs initialized successfully
```

### Issue: Reminders not sent

**Solution**: Check email/SMS service configuration:
```env
EMAIL_API_KEY=your_key
TWILIO_AUTH_TOKEN=your_token
```

### Issue: Escrow not releasing

**Solution**: Verify booking status is 'completed' and check-out date has passed.

## API Endpoints

Escrow is integrated into existing payment endpoints:

```
POST /api/payments/paypal/capture
POST /api/payments/bakong/verify
POST /api/payments/stripe/verify
```

No separate escrow endpoints needed - it's automatic!

## Database Queries

### Check escrow status

```sql
SELECT 
  pt.id,
  pt.transaction_id,
  pt.amount,
  pt.escrow_status,
  pt.escrow_release_date,
  b.booking_number,
  b.status
FROM payment_transactions pt
JOIN bookings b ON pt.booking_id = b.id
WHERE pt.escrow_status = 'held';
```

### Check pending milestone payments

```sql
SELECT 
  b.id,
  b.booking_number,
  b.check_in,
  b.payment->>'type' as payment_type,
  b.payment->>'status' as payment_status
FROM bookings b
WHERE b.status = 'confirmed'
  AND b.payment->>'type' = 'milestone'
  AND b.payment->>'status' IN ('pending', 'partial');
```

## Best Practices

1. **Always use the service functions** - Don't manually update escrow status
2. **Check logs regularly** - Monitor for failed notifications
3. **Test in staging first** - Verify cron jobs before production
4. **Monitor escrow metrics** - Track average hold duration
5. **Handle errors gracefully** - Don't block payment processing on notification failures

## Support

For detailed documentation, see:
- `backend/docs/ESCROW_PAYMENT_SCHEDULING.md` - Full documentation
- `backend/TASK_24_SUMMARY.md` - Implementation summary

For issues:
1. Check logs for error messages
2. Verify environment variables
3. Test individual functions manually
4. Contact development team
