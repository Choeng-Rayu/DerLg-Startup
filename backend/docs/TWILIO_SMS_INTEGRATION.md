# Twilio SMS Integration

## Overview

The DerLg Tourism Platform integrates Twilio for SMS notifications to keep users informed about their bookings, payments, and account activities. This document provides comprehensive information about the SMS integration.

## Features

The SMS service supports the following notification types:

1. **Password Reset SMS** - Secure password reset links sent via SMS
2. **Booking Reminder SMS** - 24-hour advance reminders before check-in
3. **Payment Reminder SMS** - Milestone payment due date reminders
4. **Verification Code SMS** - Account verification codes
5. **Generic SMS** - Flexible SMS sending for custom messages

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Getting Twilio Credentials

1. Sign up for a Twilio account at https://www.twilio.com/
2. Navigate to the Console Dashboard
3. Copy your **Account SID** and **Auth Token**
4. Purchase a phone number or use the trial number
5. Add credentials to your `.env` file

### Graceful Degradation

The SMS service is designed to gracefully handle missing configuration:

- If Twilio credentials are not configured, SMS sending will be skipped
- No errors will be thrown - the service logs a warning instead
- This allows the application to run without SMS functionality in development

## Usage

### Import the Service

```typescript
import smsService, {
  sendPasswordResetSMS,
  sendBookingReminderSMS,
  sendPaymentReminderSMS,
  sendSMS,
  isTwilioConfigured,
} from '../services/sms.service';
```

### Check Configuration

```typescript
if (isTwilioConfigured()) {
  console.log('Twilio is configured and ready');
} else {
  console.log('Twilio is not configured - SMS will be skipped');
}
```

### Send Password Reset SMS

```typescript
const result = await sendPasswordResetSMS(
  '+1234567890',           // Phone number
  'reset-token-12345',     // Reset token
  'John Doe'               // User name
);

if (result) {
  console.log('Password reset SMS sent successfully');
}
```

**SMS Format:**
```
Hello John Doe,

You requested to reset your password for DerLg Tourism.

Reset your password here: http://localhost:5000/reset-password?token=reset-token-12345

This link expires in 1 hour.

If you didn't request this, please ignore this message.
```

### Send Booking Reminder SMS

```typescript
const bookingDetails = `
Booking #BK123456
Hotel: Royal Palace Hotel
Check-in: Tomorrow, 2:00 PM
Check-out: Dec 30, 2024
Guests: 2 Adults
`;

const result = await sendBookingReminderSMS(
  '+1234567890',
  bookingDetails
);
```

**SMS Format:**
```
Reminder: Your booking with DerLg Tourism is coming up!

Booking #BK123456
Hotel: Royal Palace Hotel
Check-in: Tomorrow, 2:00 PM
Check-out: Dec 30, 2024
Guests: 2 Adults

Have a great trip!
```

### Send Payment Reminder SMS

```typescript
const result = await sendPaymentReminderSMS(
  '+1234567890',           // Phone number
  'BK123456',              // Booking number
  250.00,                  // Amount due
  new Date('2024-12-25'),  // Due date
  2                        // Milestone number (optional)
);
```

**SMS Format:**
```
DerLg Tourism Payment Reminder

Milestone 2 payment of $250.00 is due on Dec 25, 2024 for booking BK123456.

Please complete your payment to confirm your reservation.

Thank you!
```

### Send Generic SMS

```typescript
const result = await sendSMS(
  '+1234567890',
  'Your booking has been confirmed! Thank you for choosing DerLg Tourism.'
);
```

### Send Verification Code SMS

```typescript
const result = await sendVerificationCodeSMS(
  '+1234567890',
  '123456'
);
```

**SMS Format:**
```
Your DerLg Tourism verification code is: 123456

This code expires in 10 minutes.
```

## Automated SMS Notifications

### Booking Reminders (24 Hours Before Check-in)

The system automatically sends booking reminders 24 hours before check-in:

```typescript
// Scheduled job runs daily at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  await checkBookingReminders();
});
```

**Trigger:** Confirmed bookings with check-in date = tomorrow

**SMS Content:**
- Booking number
- Check-in and check-out dates
- Number of nights
- Welcome message

### Milestone Payment Reminders

The system automatically sends payment reminders for milestone payments:

```typescript
// Scheduled job runs daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  await checkMilestonePaymentReminders();
});
```

**Milestone 2 Reminder:**
- **Trigger:** 7 days before check-in
- **Amount:** 25% of total booking
- **SMS includes:** Booking number, amount, due date

**Milestone 3 Reminder:**
- **Trigger:** On check-in date
- **Amount:** 25% of total booking (final payment)
- **SMS includes:** Booking number, amount, due date

## Integration with Booking Flow

### Password Reset Flow

```typescript
// In auth.controller.ts
const resetToken = generateResetToken();
await user.save();

// Send SMS if phone is provided
if (phone) {
  await sendPasswordResetSMS(phone, resetToken, user.first_name);
}
```

### Booking Confirmation Flow

```typescript
// In booking.controller.ts
const booking = await Booking.create({...});

// Booking reminder will be sent automatically 24 hours before check-in
// by the scheduled job
```

### Payment Milestone Flow

```typescript
// In escrow-payment-scheduler.service.ts
const sendPaymentReminder = async (booking, milestoneNumber, amount, dueDate) => {
  // Send email reminder
  await sendEmail(...);
  
  // Send SMS reminder if phone is available
  if (booking.guest_details.phone) {
    await sendPaymentReminderSMS(
      booking.guest_details.phone,
      booking.booking_number,
      amount,
      dueDate,
      milestoneNumber
    );
  }
};
```

## Testing

### Run Test Suite

```bash
npm run test:twilio
```

### Test with Custom Phone Number

```bash
TEST_PHONE_NUMBER=+1234567890 npm run test:twilio
```

### Test Coverage

The test suite includes:

1. ✓ Twilio configuration check
2. ✓ Password reset SMS
3. ✓ Booking reminder SMS
4. ✓ Payment reminder SMS
5. ✓ Generic SMS
6. ✓ Milestone payment scenario (multiple reminders)

### Sample Test Output

```
╔════════════════════════════════════════════════════════════╗
║         Twilio SMS Integration Test Suite                 ║
╚════════════════════════════════════════════════════════════╝

=== Testing Twilio Configuration ===

Twilio Configured: YES ✓

📱 Test phone number: +1234567890

=== Testing Password Reset SMS ===

Sending password reset SMS to: +1234567890
User Name: John Doe
Reset Token: test-reset-token-12345
✓ Password reset SMS sent successfully

=== Testing Booking Reminder SMS ===

Sending booking reminder SMS to: +1234567890
✓ Booking reminder SMS sent successfully

=== Testing Payment Reminder SMS ===

Sending payment reminder SMS to: +1234567890
Booking Number: BK123456
Amount: $250.00
Due Date: 12/25/2024
Milestone: 2
✓ Payment reminder SMS sent successfully

╔════════════════════════════════════════════════════════════╗
║                    Test Summary                            ║
╚════════════════════════════════════════════════════════════╝

Password Reset SMS:        ✓ PASS
Booking Reminder SMS:      ✓ PASS
Payment Reminder SMS:      ✓ PASS
Generic SMS:               ✓ PASS
Milestone Payment Scenario: ✓ PASS

Total: 5/5 tests passed

🎉 All tests passed! Twilio SMS integration is working correctly.
```

## Phone Number Format

### International Format

Always use E.164 format for phone numbers:

```
+[country code][phone number]
```

**Examples:**
- US: `+12025551234`
- Cambodia: `+855969983479`
- UK: `+447911123456`

### Validation

The service does not validate phone numbers - ensure they are in correct format before calling SMS functions.

## Error Handling

### Graceful Failure

```typescript
const result = await sendSMS(phone, message);

if (!result) {
  // SMS failed or Twilio not configured
  // Log the issue but don't block the user flow
  logger.warn('SMS notification could not be sent');
}
```

### Error Logging

All SMS errors are logged with context:

```typescript
logger.error('Error sending password reset SMS:', error);
logger.info(`Password reset SMS sent to: ${to}`);
```

## Best Practices

### 1. Always Check Configuration

```typescript
if (isTwilioConfigured()) {
  await sendSMS(phone, message);
} else {
  logger.warn('Skipping SMS - Twilio not configured');
}
```

### 2. Don't Block User Flow

Never throw errors if SMS fails - log and continue:

```typescript
try {
  await sendSMS(phone, message);
} catch (error) {
  logger.error('SMS failed:', error);
  // Continue with the rest of the flow
}
```

### 3. Rate Limiting

Be mindful of Twilio rate limits and costs:
- Trial accounts have limited messages
- Production accounts are charged per message
- Implement rate limiting for user-triggered SMS

### 4. Message Length

Keep SMS messages concise:
- Standard SMS: 160 characters
- Longer messages are split and charged accordingly
- Include only essential information

### 5. Testing in Development

Use environment variables to control SMS in development:

```typescript
if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_SMS) {
  logger.info('SMS disabled in development');
  return false;
}
```

## Cost Considerations

### Twilio Pricing

- **SMS (US):** ~$0.0075 per message
- **SMS (International):** Varies by country
- **Trial Account:** Limited free messages

### Optimization Tips

1. **Batch notifications** - Send SMS only for critical events
2. **User preferences** - Allow users to opt-out of SMS notifications
3. **Email fallback** - Use email for non-urgent notifications
4. **Consolidate messages** - Combine multiple updates into one SMS

## Troubleshooting

### SMS Not Sending

1. **Check Configuration:**
   ```bash
   npm run test:twilio
   ```

2. **Verify Credentials:**
   - Account SID is correct
   - Auth Token is valid
   - Phone number is verified

3. **Check Phone Number Format:**
   - Must be in E.164 format
   - Include country code
   - No spaces or special characters

4. **Review Logs:**
   ```bash
   tail -f logs/app.log | grep SMS
   ```

### Trial Account Limitations

- Can only send to verified phone numbers
- Limited number of messages
- Messages include trial account notice
- Upgrade to production for full functionality

### Common Errors

**Error: "The 'To' number is not a valid phone number"**
- Solution: Use E.164 format (+1234567890)

**Error: "Authenticate"**
- Solution: Check Account SID and Auth Token

**Error: "The number is unverified"**
- Solution: Verify the number in Twilio console (trial accounts only)

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 33.2:** Password reset via SMS with secure token links
- **Requirement 51.3:** Booking reminders 24 hours before check-in
- **Requirement 57.3:** Payment reminders for milestone payments

## Related Documentation

- [Password Reset API](./PASSWORD_RESET.md)
- [Escrow Payment Scheduling](./ESCROW_PAYMENT_SCHEDULING.md)
- [Booking Management API](./BOOKING_MANAGEMENT_API.md)
- [Email Service Integration](./EMAIL_SERVICE.md)

## Support

For Twilio-specific issues:
- Twilio Documentation: https://www.twilio.com/docs
- Twilio Support: https://support.twilio.com
- Twilio Console: https://console.twilio.com

For platform-specific issues:
- Check application logs
- Run test suite
- Review error messages in console
