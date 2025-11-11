# Twilio SMS Quick Start Guide

## Setup (5 minutes)

### 1. Get Twilio Credentials

1. Sign up at https://www.twilio.com/try-twilio
2. Get your **Account SID** and **Auth Token** from the console
3. Get a phone number (trial or purchase)

### 2. Configure Environment

Add to `backend/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Test the Integration

```bash
cd backend
npm run test:twilio
```

## Quick Usage Examples

### Send Password Reset SMS

```typescript
import { sendPasswordResetSMS } from '../services/sms.service';

await sendPasswordResetSMS(
  '+1234567890',
  'reset-token-abc123',
  'John Doe'
);
```

### Send Booking Reminder

```typescript
import { sendBookingReminderSMS } from '../services/sms.service';

const details = `
Booking #BK123456
Check-in: Tomorrow, 2:00 PM
Hotel: Royal Palace Hotel
`;

await sendBookingReminderSMS('+1234567890', details);
```

### Send Payment Reminder

```typescript
import { sendPaymentReminderSMS } from '../services/sms.service';

await sendPaymentReminderSMS(
  '+1234567890',
  'BK123456',
  250.00,
  new Date('2024-12-25'),
  2  // milestone number
);
```

### Send Custom SMS

```typescript
import { sendSMS } from '../services/sms.service';

await sendSMS(
  '+1234567890',
  'Your booking is confirmed!'
);
```

## Automated Notifications

The system automatically sends:

1. **Booking Reminders** - 24 hours before check-in (10:00 AM daily)
2. **Payment Reminders** - For milestone payments (9:00 AM daily)

No additional code needed - these run via scheduled jobs.

## Testing Without Twilio

The service gracefully handles missing configuration:

```typescript
// SMS will be skipped if Twilio is not configured
// No errors thrown - just logged warnings
await sendSMS(phone, message);
```

## Phone Number Format

Always use international format:

```
+[country code][number]
```

Examples:
- US: `+12025551234`
- Cambodia: `+855969983479`

## Common Issues

### SMS Not Sending?

1. Check credentials in `.env`
2. Verify phone number format
3. Run: `npm run test:twilio`

### Trial Account?

- Can only send to verified numbers
- Verify numbers in Twilio console
- Messages include trial notice

## Next Steps

- Read [Full Documentation](./TWILIO_SMS_INTEGRATION.md)
- Configure production credentials
- Set up user SMS preferences
- Monitor SMS usage and costs

## Support

- Twilio Docs: https://www.twilio.com/docs
- Test Suite: `npm run test:twilio`
- Logs: Check `logs/app.log`
