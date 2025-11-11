# Email Notifications Integration

## Overview

The DerLg Tourism Platform uses Nodemailer to send transactional email notifications to users. This document describes the email service implementation, configuration, and usage.

## Features

The email service supports the following notification types:

1. **Welcome Email** - Sent when a user registers (Requirement 17.1)
2. **Booking Confirmation Email** - Sent when a booking is confirmed (Requirement 17.2)
3. **Booking Reminder Email** - Sent 24 hours before check-in (Requirement 17.3)
4. **Booking Status Update Email** - Sent when booking status changes (Requirement 17.4)
5. **Payment Receipt Email** - Sent after successful payment
6. **Payment Reminder Email** - Sent for milestone payment reminders
7. **Password Reset Email** - Sent when user requests password reset

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Email Configuration (SMTP via Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@derlg.com
```

### SMTP Provider Options

#### Gmail

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASSWORD`

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

#### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

#### Custom SMTP Server

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-password
```

## Usage

### Import the Service

```typescript
import emailService from '../services/email.service';
```

### Send Welcome Email

```typescript
await emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

### Send Booking Confirmation

```typescript
await emailService.sendBookingConfirmationEmail(
  'user@example.com',
  {
    bookingNumber: 'BK-2024-001',
    userName: 'John Doe',
    hotelName: 'Angkor Paradise Hotel',
    checkIn: '2024-12-25',
    checkOut: '2024-12-28',
    roomType: 'Deluxe Suite',
    guests: 2,
    totalAmount: 450.00,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
  }
);
```

### Send Booking Reminder

```typescript
await emailService.sendBookingReminderEmail(
  'user@example.com',
  {
    userName: 'John Doe',
    hotelName: 'Angkor Paradise Hotel',
    checkIn: '2024-12-25',
    roomType: 'Deluxe Suite',
    bookingNumber: 'BK-2024-001',
    checkInInstructions: 'Check-in time is 2:00 PM. Please bring a valid ID.',
  }
);
```

### Send Booking Status Update

```typescript
// Approved
await emailService.sendBookingStatusUpdateEmail(
  'user@example.com',
  {
    userName: 'John Doe',
    bookingNumber: 'BK-2024-001',
    hotelName: 'Angkor Paradise Hotel',
    status: 'approved',
  }
);

// Rejected
await emailService.sendBookingStatusUpdateEmail(
  'user@example.com',
  {
    userName: 'John Doe',
    bookingNumber: 'BK-2024-001',
    hotelName: 'Angkor Paradise Hotel',
    status: 'rejected',
    reason: 'Room not available',
    refundAmount: 450.00,
  }
);

// Cancelled
await emailService.sendBookingStatusUpdateEmail(
  'user@example.com',
  {
    userName: 'John Doe',
    bookingNumber: 'BK-2024-001',
    hotelName: 'Angkor Paradise Hotel',
    status: 'cancelled',
    refundAmount: 225.00,
  }
);
```

### Send Payment Receipt

```typescript
await emailService.sendPaymentReceiptEmail(
  'user@example.com',
  {
    userName: 'John Doe',
    bookingNumber: 'BK-2024-001',
    transactionId: 'TXN-2024-12345',
    amount: 450.00,
    currency: 'USD',
    paymentMethod: 'PayPal',
    paymentDate: '2024-12-20 10:30:00',
    hotelName: 'Angkor Paradise Hotel',
  }
);
```

### Send Payment Reminder

```typescript
await emailService.sendPaymentReminderEmail(
  'user@example.com',
  {
    userName: 'John Doe',
    bookingNumber: 'BK-2024-001',
    hotelName: 'Angkor Paradise Hotel',
    dueAmount: 112.50,
    dueDate: '2024-12-23',
    milestoneNumber: 2,
  }
);
```

### Send Password Reset

```typescript
await emailService.sendPasswordResetEmail(
  'user@example.com',
  'reset-token-12345',
  'John Doe'
);
```

## Testing

### Run Test Script

```bash
cd backend
npm run test:email
```

The test script will attempt to send all email types. If SMTP is not configured, all tests will fail gracefully with warnings.

### Manual Testing with Gmail

1. Create a Gmail account for testing
2. Enable 2-factor authentication
3. Generate an App Password
4. Update `.env` with Gmail SMTP settings
5. Run the test script

## Integration Points

### User Registration (AuthController)

```typescript
// After successful registration
await emailService.sendWelcomeEmail(user.email, user.first_name);
```

### Booking Confirmation (BookingController)

```typescript
// After payment confirmation
await emailService.sendBookingConfirmationEmail(user.email, {
  bookingNumber: booking.booking_number,
  userName: `${user.first_name} ${user.last_name}`,
  hotelName: hotel.name,
  checkIn: booking.check_in,
  checkOut: booking.check_out,
  roomType: room.room_type,
  guests: booking.guests.adults + booking.guests.children,
  totalAmount: booking.pricing.total,
  cancellationPolicy: hotel.cancellation_policy,
});
```

### Booking Reminders (Scheduled Job)

```typescript
// In cron job (24 hours before check-in)
const upcomingBookings = await getBookingsForTomorrow();

for (const booking of upcomingBookings) {
  await emailService.sendBookingReminderEmail(booking.user.email, {
    userName: `${booking.user.first_name} ${booking.user.last_name}`,
    hotelName: booking.hotel.name,
    checkIn: booking.check_in,
    roomType: booking.room.room_type,
    bookingNumber: booking.booking_number,
    checkInInstructions: booking.hotel.check_in_instructions,
  });
}
```

### Booking Status Updates (Hotel Admin Actions)

```typescript
// When hotel admin approves/rejects booking
await emailService.sendBookingStatusUpdateEmail(user.email, {
  userName: `${user.first_name} ${user.last_name}`,
  bookingNumber: booking.booking_number,
  hotelName: hotel.name,
  status: 'approved', // or 'rejected'
  reason: rejectionReason, // if rejected
  refundAmount: refundAmount, // if rejected
});
```

## Email Templates

All emails use responsive HTML templates with:
- Professional styling
- Mobile-friendly design
- Clear call-to-action buttons
- Consistent branding
- Plain text fallback

### Template Structure

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Email Title</h2>
  <p>Email content...</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
    <!-- Details section -->
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">
    Best regards,<br>
    DerLg Tourism Team
  </p>
</div>
```

## Error Handling

The email service handles errors gracefully:

1. **SMTP Not Configured**: Logs warning and returns `false`
2. **Send Failure**: Logs error details and returns `false`
3. **Success**: Logs success message and returns `true`

All email methods return a boolean indicating success/failure, allowing calling code to handle failures appropriately.

## Performance Considerations

- Email sending is asynchronous and non-blocking
- Failed emails don't crash the application
- Consider implementing a queue system (Bull/Redis) for high-volume scenarios
- Monitor email delivery rates and bounce rates

## Security Best Practices

1. **Never commit SMTP credentials** to version control
2. **Use App Passwords** instead of account passwords
3. **Enable TLS/SSL** for secure connections
4. **Validate email addresses** before sending
5. **Rate limit** email sending to prevent abuse
6. **Monitor** for suspicious activity

## Troubleshooting

### Emails Not Sending

1. Check SMTP configuration in `.env`
2. Verify SMTP credentials are correct
3. Check firewall/network settings
4. Review application logs for error messages
5. Test SMTP connection manually

### Gmail "Less Secure Apps" Error

Gmail no longer supports "less secure apps". You must:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASSWORD`

### Emails Going to Spam

1. Configure SPF records for your domain
2. Set up DKIM signing
3. Configure DMARC policy
4. Use a reputable SMTP provider
5. Avoid spam trigger words in subject/content

## Future Enhancements

- [ ] Email template system with customizable designs
- [ ] Multi-language email support
- [ ] Email queue with retry logic
- [ ] Email analytics and tracking
- [ ] Unsubscribe functionality
- [ ] Email preferences management
- [ ] Rich media attachments (PDFs, images)
- [ ] A/B testing for email content

## Requirements Mapping

- **Requirement 17.1**: Welcome email on registration ✓
- **Requirement 17.2**: Booking confirmation within 30 seconds ✓
- **Requirement 17.3**: Booking reminder 24 hours before ✓
- **Requirement 17.4**: Status update emails within 30 seconds ✓

## Related Documentation

- [Authentication API](./AUTHENTICATION.md)
- [Booking API](./BOOKING_API.md)
- [Twilio SMS Integration](./TWILIO_SMS_INTEGRATION.md)
