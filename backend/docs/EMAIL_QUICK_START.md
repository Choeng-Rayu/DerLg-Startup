# Email Notifications - Quick Start Guide

## 5-Minute Setup

### Step 1: Configure SMTP (Choose One)

#### Option A: Gmail (Recommended for Development)

1. Go to https://myaccount.google.com/apppasswords
2. Generate an App Password
3. Add to `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=noreply@derlg.com
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Add to `.env`:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@derlg.com
```

### Step 2: Test Email Service

```bash
cd backend
npm run test:email
```

### Step 3: Use in Your Code

```typescript
import emailService from '../services/email.service';

// Send welcome email
await emailService.sendWelcomeEmail('user@example.com', 'John Doe');

// Send booking confirmation
await emailService.sendBookingConfirmationEmail('user@example.com', {
  bookingNumber: 'BK-2024-001',
  userName: 'John Doe',
  hotelName: 'Angkor Paradise Hotel',
  checkIn: '2024-12-25',
  checkOut: '2024-12-28',
  roomType: 'Deluxe Suite',
  guests: 2,
  totalAmount: 450.00,
  cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
});
```

## Common Use Cases

### After User Registration

```typescript
// In AuthController.register()
await emailService.sendWelcomeEmail(user.email, user.first_name);
```

### After Booking Confirmation

```typescript
// In BookingController after payment
await emailService.sendBookingConfirmationEmail(user.email, bookingDetails);
```

### When Hotel Admin Approves Booking

```typescript
// In Hotel Admin Dashboard
await emailService.sendBookingStatusUpdateEmail(user.email, {
  userName: user.name,
  bookingNumber: booking.booking_number,
  hotelName: hotel.name,
  status: 'approved',
});
```

### After Payment

```typescript
// In PaymentController
await emailService.sendPaymentReceiptEmail(user.email, paymentDetails);
```

## Troubleshooting

### Emails Not Sending?

1. Check `.env` file has SMTP settings
2. Verify SMTP credentials are correct
3. Check logs: `tail -f logs/app.log`
4. For Gmail: Use App Password, not account password

### Still Having Issues?

See full documentation: [EMAIL_NOTIFICATIONS.md](./EMAIL_NOTIFICATIONS.md)

## Available Email Types

1. ✉️ Welcome Email
2. ✉️ Booking Confirmation
3. ✉️ Booking Reminder (24h before)
4. ✉️ Booking Status Update (approved/rejected/cancelled)
5. ✉️ Payment Receipt
6. ✉️ Payment Reminder (milestone)
7. ✉️ Password Reset

## Next Steps

- Set up scheduled jobs for booking reminders
- Integrate with booking confirmation flow
- Add email notifications to hotel admin actions
- Configure production SMTP provider (SendGrid/Mailgun)
