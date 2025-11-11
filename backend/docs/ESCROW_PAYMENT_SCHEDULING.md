# Escrow and Payment Scheduling System

## Overview

The DerLg platform implements a comprehensive escrow and payment scheduling system to protect both customers and service providers. All payments are held in escrow until service delivery is confirmed, and automated reminders ensure timely milestone payments.

## Features

### 1. Escrow Management

All payments processed through the platform are automatically held in escrow:

- **Automatic Escrow Hold**: When a payment is completed, it's immediately placed in escrow
- **Service Delivery Protection**: Funds are only released after the booking is completed
- **Automatic Release**: System automatically releases escrow after check-out date
- **Manual Release**: Admins can manually release escrow for completed bookings

### 2. Payment Scheduling

The system supports three payment types with automated scheduling:

#### Full Payment
- 100% paid upfront
- 5% discount applied
- Bonus services included (free airport pickup, priority check-in)
- Immediate booking confirmation
- Escrow held until service delivery

#### Deposit Payment
- 50-70% paid upfront (default 60%)
- Remaining balance due at check-in
- Automated reminder sent 24 hours before check-in
- Booking confirmed after deposit payment

#### Milestone Payment
- **Milestone 1**: 50% paid upfront
- **Milestone 2**: 25% paid one week before check-in
- **Milestone 3**: 25% paid upon arrival
- Automated reminders for each milestone
- Booking confirmed after first milestone

### 3. Automated Notifications

The system sends automated notifications for:

- **Payment Reminders**: Sent 1 week before milestone due dates
- **Booking Reminders**: Sent 24 hours before check-in
- **Escrow Release**: Automatic release after check-out date

## Architecture

### Scheduled Jobs

The system uses `node-cron` to run scheduled jobs:

```typescript
// Milestone payment reminders - Daily at 9:00 AM
cron.schedule('0 9 * * *', checkMilestonePaymentReminders);

// Booking reminders - Daily at 10:00 AM
cron.schedule('0 10 * * *', checkBookingReminders);

// Escrow release check - Daily at 11:00 AM
cron.schedule('0 11 * * *', checkEscrowRelease);
```

### Database Schema

#### PaymentTransaction Table

```typescript
{
  id: UUID,
  booking_id: UUID,
  transaction_id: string,
  gateway: 'paypal' | 'bakong' | 'stripe',
  amount: decimal,
  currency: 'USD' | 'KHR',
  payment_type: 'deposit' | 'milestone_1' | 'milestone_2' | 'milestone_3' | 'full',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  escrow_status: 'held' | 'released' | 'refunded',
  escrow_release_date: Date,
  gateway_response: JSON,
  refund_amount: decimal,
  refund_reason: text
}
```

#### Booking Table

```typescript
{
  payment: {
    method: 'paypal' | 'bakong' | 'stripe',
    type: 'deposit' | 'milestone' | 'full',
    status: 'pending' | 'partial' | 'completed' | 'refunded',
    transactions: Array<TransactionInfo>,
    escrow_status: 'held' | 'released'
  }
}
```

## API Integration

### Hold Payment in Escrow

```typescript
import { holdPaymentInEscrow } from './services/escrow-payment-scheduler.service';

// After successful payment
await holdPaymentInEscrow(transactionId, bookingId);
```

### Release Escrow

```typescript
import { releaseEscrowPayment } from './services/escrow-payment-scheduler.service';

// After booking completion
await releaseEscrowPayment(bookingId);
```

### Process Milestone Payment

```typescript
import { processMilestonePayment } from './services/escrow-payment-scheduler.service';

// After milestone payment completion
await processMilestonePayment(bookingId, milestoneNumber, transactionId);
```

### Get Payment Schedule

```typescript
import { getPaymentSchedule } from './services/escrow-payment-scheduler.service';

const schedule = getPaymentSchedule(booking);
// Returns array of payment milestones with due dates
```

## Payment Flow

### Full Payment Flow

```
1. User selects full payment option
2. Payment processed through gateway
3. Transaction created with escrow_status = 'held'
4. holdPaymentInEscrow() called
5. Booking status = 'confirmed'
6. User checks in and completes stay
7. Booking status = 'completed'
8. checkEscrowRelease() runs daily
9. releaseEscrowPayment() called
10. Funds released to service provider
```

### Milestone Payment Flow

```
1. User selects milestone payment option
2. Milestone 1 (50%) processed
3. Transaction created with escrow_status = 'held'
4. processMilestonePayment(bookingId, 1, transactionId)
5. Booking status = 'pending' (awaiting remaining payments)

6. checkMilestonePaymentReminders() runs daily
7. 1 week before check-in: Reminder sent for Milestone 2
8. User pays Milestone 2 (25%)
9. processMilestonePayment(bookingId, 2, transactionId)

10. On check-in day: Reminder sent for Milestone 3
11. User pays Milestone 3 (25%)
12. processMilestonePayment(bookingId, 3, transactionId)
13. Booking status = 'confirmed'

14. After check-out: checkEscrowRelease() runs
15. All escrow payments released
```

## Notification Templates

### Payment Reminder Email

```
Subject: Payment Reminder - Booking [BOOKING_NUMBER]

Dear [GUEST_NAME],

This is a reminder that your milestone payment is due soon.

Booking Number: [BOOKING_NUMBER]
Milestone: [MILESTONE_NUMBER]
Amount Due: $[AMOUNT]
Due Date: [DUE_DATE]

Please complete your payment to ensure your booking remains confirmed.

Thank you for choosing DerLg!
```

### Payment Reminder SMS

```
Payment reminder: $[AMOUNT] due on [DUE_DATE] for booking [BOOKING_NUMBER]. 
Please complete payment to confirm your reservation.
```

### Booking Reminder Email

```
Subject: Booking Reminder - Check-in Tomorrow

Dear [GUEST_NAME],

This is a reminder that your check-in is scheduled for tomorrow.

Booking Number: [BOOKING_NUMBER]
Check-in Date: [CHECK_IN_DATE]
Check-out Date: [CHECK_OUT_DATE]
Nights: [NIGHTS]

We look forward to welcoming you!

Safe travels,
DerLg Team
```

## Configuration

### Environment Variables

```env
# Email Service (SendGrid/Mailgun)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_api_key
EMAIL_FROM=noreply@derlg.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cron Schedule (optional - defaults shown)
CRON_MILESTONE_REMINDERS=0 9 * * *
CRON_BOOKING_REMINDERS=0 10 * * *
CRON_ESCROW_RELEASE=0 11 * * *
```

### Initialization

The scheduled jobs are automatically initialized when the server starts:

```typescript
// src/index.ts
import { initializeScheduledJobs } from './services/escrow-payment-scheduler.service';

// Initialize scheduled jobs
initializeScheduledJobs();
```

## Testing

### Run Tests

```bash
npm run test:escrow-scheduler
```

### Manual Testing

```typescript
// Test escrow hold
await holdPaymentInEscrow(transactionId, bookingId);

// Test escrow release
await releaseEscrowPayment(bookingId);

// Test milestone payment processing
await processMilestonePayment(bookingId, 1, transactionId);

// Test payment reminders
await checkMilestonePaymentReminders();

// Test booking reminders
await checkBookingReminders();

// Test escrow release check
await checkEscrowRelease();
```

## Error Handling

The system includes comprehensive error handling:

- **Transaction Not Found**: Logs error and throws exception
- **Booking Not Found**: Logs error and throws exception
- **Invalid Status**: Prevents escrow release for non-completed bookings
- **Email/SMS Failures**: Logs error but doesn't block payment processing
- **Cron Job Failures**: Logs error and continues with next scheduled run

## Monitoring

### Logs

All escrow and scheduling operations are logged:

```typescript
logger.info('Payment held in escrow: Transaction ${transactionId}');
logger.info('Escrow released: Transaction ${transactionId}');
logger.info('Payment reminder sent for booking ${bookingId}');
logger.error('Error releasing escrow payment:', error);
```

### Metrics to Monitor

- Number of payments in escrow
- Average escrow hold duration
- Payment reminder delivery rate
- Escrow release success rate
- Failed notification attempts

## Security Considerations

1. **Escrow Protection**: All payments held until service delivery
2. **Automated Release**: Prevents manual intervention errors
3. **Transaction Logging**: Complete audit trail of all operations
4. **Status Validation**: Strict validation before escrow release
5. **Error Recovery**: Graceful handling of notification failures

## Future Enhancements

1. **Dispute Resolution**: Handle payment disputes and chargebacks
2. **Partial Refunds**: Support partial escrow releases
3. **Custom Schedules**: Allow hotels to customize payment schedules
4. **Real-time Notifications**: WebSocket notifications for payment events
5. **Analytics Dashboard**: Visualize escrow and payment metrics

## Requirements Coverage

This implementation covers the following requirements:

- **Requirement 44.5**: Escrow protection through Payment Gateway
- **Requirement 57.1**: Automated milestone payment scheduling
- **Requirement 57.2**: Escrow release after service delivery confirmation
- **Requirement 57.3**: Automated reminders for remaining balance payments

## Support

For issues or questions about the escrow and payment scheduling system:

1. Check logs for error messages
2. Verify cron jobs are running: `ps aux | grep node`
3. Test individual functions manually
4. Contact development team for assistance
