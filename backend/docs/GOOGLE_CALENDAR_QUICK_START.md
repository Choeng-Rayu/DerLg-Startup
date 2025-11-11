# Google Calendar Integration - Quick Start Guide

## Overview

This guide will help you quickly set up and test the Google Calendar integration for automatic booking calendar events.

## Quick Setup (5 minutes)

### Step 1: Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Calendar API" and click **Enable**

### Step 2: Create Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: External (for testing)
   - App name: DerLg Tourism Platform
   - User support email: your email
   - Developer contact: your email
4. Select **Web application**
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Environment

Add to `backend/.env`:

```bash
GOOGLE_CALENDAR_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret-here
```

### Step 4: Test the Integration

```bash
cd backend
npm run test:google-calendar
```

## How It Works

### Automatic Calendar Events

1. **Booking Confirmed** → Calendar event created
2. **Booking Updated** → Calendar event updated
3. **Booking Cancelled** → Calendar event deleted

### Event Details Include:

- Hotel name and address
- Check-in/check-out dates
- Room type
- Guest information
- Special requests
- Preparation instructions
- 24-hour reminders

## Testing with Real Bookings

### 1. Create a Test Booking

```bash
# Create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_id": "hotel-uuid",
    "room_id": "room-uuid",
    "check_in": "2025-11-01",
    "check_out": "2025-11-05",
    "guests": { "adults": 2, "children": 0 },
    "guest_details": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1 555 123 4567"
    },
    "payment_method": "paypal",
    "payment_type": "full"
  }'
```

### 2. Complete Payment

Process payment through PayPal/Stripe/Bakong to confirm the booking.

### 3. Verify Calendar Event

Check the booking record:

```bash
curl http://localhost:5000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Look for `calendar_event_id` in the response.

### 4. Check Google Calendar

- Open Google Calendar
- Look for event: "Hotel Booking: [Hotel Name]"
- Verify dates and details

## Common Issues

### Issue: "Calendar event creation skipped"

**Cause:** Google Calendar credentials not configured

**Solution:**
1. Verify `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET` in `.env`
2. Ensure they're not empty strings
3. Restart the server

### Issue: "Authentication failed (401)"

**Cause:** Invalid or expired credentials

**Solution:**
1. Regenerate OAuth credentials in Google Cloud Console
2. Update `.env` with new credentials
3. Restart the server

### Issue: "API access forbidden (403)"

**Cause:** Google Calendar API not enabled

**Solution:**
1. Go to Google Cloud Console
2. Enable Google Calendar API
3. Wait a few minutes for propagation

### Issue: "Event not appearing in calendar"

**Cause:** OAuth2 authentication not completed

**Solution:**
- Current implementation requires OAuth2 flow for production
- For testing, use service account or implement OAuth2 flow
- See full documentation for OAuth2 setup

## Verification Checklist

- [ ] Google Calendar API enabled in Cloud Console
- [ ] OAuth credentials created
- [ ] Environment variables configured
- [ ] Test script runs without errors
- [ ] Booking creates calendar event
- [ ] Event appears in Google Calendar
- [ ] Booking update modifies event
- [ ] Booking cancellation deletes event

## Next Steps

1. **Implement OAuth2 Flow:** For production, implement full OAuth2 authentication
2. **User Preferences:** Add settings for users to enable/disable calendar sync
3. **Test with Multiple Bookings:** Verify itinerary view with multiple events
4. **Email Notifications:** Ensure calendar invites are sent to guests

## Production Considerations

### Before Going Live:

1. **OAuth2 Implementation:**
   ```typescript
   // Implement OAuth2 flow to get user tokens
   const authUrl = oauth2Client.generateAuthUrl({
     access_type: 'offline',
     scope: ['https://www.googleapis.com/auth/calendar'],
   });
   ```

2. **Token Storage:**
   - Store OAuth tokens securely in database
   - Implement token refresh logic
   - Handle token expiration gracefully

3. **User Consent:**
   - Add calendar sync option in user settings
   - Get explicit consent before accessing calendar
   - Provide clear privacy information

4. **Error Handling:**
   - Monitor calendar API errors
   - Implement retry logic for transient failures
   - Provide fallback (email with .ics file)

5. **Rate Limits:**
   - Monitor API quota usage
   - Implement request throttling if needed
   - Handle rate limit errors gracefully

## API Endpoints

### Calendar Integration Points

| Endpoint | Method | Trigger | Action |
|----------|--------|---------|--------|
| `/api/payments/paypal/capture` | POST | Payment confirmed | Create event |
| `/api/payments/stripe/confirm` | POST | Payment confirmed | Create event |
| `/api/payments/bakong/verify` | POST | Payment confirmed | Create event |
| `/api/bookings/:id` | PUT | Booking updated | Update event |
| `/api/bookings/:id/cancel` | DELETE | Booking cancelled | Delete event |

## Database

### Booking Model

```typescript
interface Booking {
  // ... other fields
  calendar_event_id: string | null; // Google Calendar event ID
}
```

## Resources

- [Full Documentation](./GOOGLE_CALENDAR_INTEGRATION.md)
- [Google Calendar API Docs](https://developers.google.com/calendar)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

## Support

Need help? Check:
1. Error logs: `backend/logs/`
2. Test script output: `npm run test:google-calendar`
3. Google Cloud Console: API quotas and errors
4. Documentation: `backend/docs/GOOGLE_CALENDAR_INTEGRATION.md`
