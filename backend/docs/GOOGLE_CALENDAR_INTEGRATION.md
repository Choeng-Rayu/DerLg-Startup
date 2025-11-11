# Google Calendar Integration

## Overview

The DerLg Tourism Platform integrates with Google Calendar API to automatically create, update, and delete calendar events for confirmed bookings. This ensures tourists receive calendar reminders and have easy access to their trip details.

## Features

- **Automatic Event Creation**: Calendar events are created when bookings are confirmed (payment completed)
- **Event Updates**: Calendar events are updated when booking details change (dates, guest info)
- **Event Deletion**: Calendar events are deleted when bookings are cancelled
- **Rich Event Details**: Events include hotel information, location, guest details, and preparation instructions
- **Email Notifications**: Attendees receive email notifications for event creation, updates, and cancellations
- **Reminders**: Automatic reminders 24 hours before check-in

## Requirements

### Requirement 51: Google Calendar Integration and Reminders

**User Story:** As a tourist with confirmed bookings, I want automatic calendar reminders for my trips, so that I don't miss my scheduled activities and can prepare accordingly.

**Acceptance Criteria:**

1. ✅ WHEN a booking is confirmed, THE Customer System SHALL automatically create Google Calendar events with trip details
2. ✅ WHEN adding to calendar, THE Customer System SHALL include location, guide contact information, and preparation instructions
3. ⚠️ IF the user prefers, THE Customer System SHALL send additional SMS and email reminders 24 hours before the trip (SMS/Email reminders handled separately)
4. ✅ WHEN trips are cancelled or rescheduled, THE Customer System SHALL automatically update or remove calendar events
5. ⚠️ WHEN multiple bookings exist, THE Customer System SHALL show a complete itinerary with travel time between activities (Frontend feature)

## Setup

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs (e.g., `http://localhost:5000/auth/google/callback`)
   - Save the Client ID and Client Secret

### 2. Environment Configuration

Add the following to your `.env` file:

```bash
# Google Calendar API
GOOGLE_CALENDAR_CLIENT_ID=your-client-id-here
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret-here
```

### 3. OAuth2 Authentication

The current implementation uses service account authentication. For production, you'll need to implement OAuth2 flow to access user calendars:

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  'http://localhost:5000/auth/google/callback'
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
});

// After user authorizes, exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);
```

## API Reference

### Service Functions

#### `createCalendarEvent(bookingData)`

Creates a new calendar event for a confirmed booking.

**Parameters:**
```typescript
{
  booking_number: string;
  hotel_name: string;
  hotel_address: string;
  hotel_phone: string;
  hotel_location: { latitude: number; longitude: number };
  room_type: string;
  check_in: Date;
  check_out: Date;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  guide_contact?: string;
}
```

**Returns:** `Promise<string | null>` - Calendar event ID or null if creation failed

**Example:**
```typescript
const eventId = await createCalendarEvent({
  booking_number: 'BK-123456',
  hotel_name: 'Angkor Paradise Hotel',
  hotel_address: '123 Sivatha Blvd, Siem Reap',
  hotel_phone: '+855 63 123 4567',
  hotel_location: { latitude: 13.3671, longitude: 103.8448 },
  room_type: 'Deluxe Suite',
  check_in: new Date('2025-11-01'),
  check_out: new Date('2025-11-05'),
  guest_name: 'John Doe',
  guest_email: 'john@example.com',
  guest_phone: '+1 555 123 4567',
  special_requests: 'Late check-in',
});
```

#### `updateCalendarEvent(eventId, bookingData)`

Updates an existing calendar event with new booking details.

**Parameters:**
- `eventId: string` - The calendar event ID
- `bookingData: object` - Same structure as createCalendarEvent

**Returns:** `Promise<boolean>` - Success status

**Example:**
```typescript
const success = await updateCalendarEvent(eventId, {
  // Updated booking data
  check_in: new Date('2025-11-02'),
  check_out: new Date('2025-11-06'),
  // ... other fields
});
```

#### `deleteCalendarEvent(eventId)`

Deletes a calendar event (used when booking is cancelled).

**Parameters:**
- `eventId: string` - The calendar event ID

**Returns:** `Promise<boolean>` - Success status

**Example:**
```typescript
const success = await deleteCalendarEvent(eventId);
```

#### `getCalendarEvent(eventId)`

Retrieves calendar event details.

**Parameters:**
- `eventId: string` - The calendar event ID

**Returns:** `Promise<any | null>` - Event details or null

## Integration Points

### 1. Payment Confirmation

Calendar events are created when payment is completed and booking status changes to "confirmed":

**Location:** `backend/src/controllers/payment.controller.ts`

```typescript
// After payment capture
if (newBookingStatus === BookingStatus.CONFIRMED) {
  const calendarEventId = await createCalendarEvent({
    // booking data
  });
  
  if (calendarEventId) {
    await booking.update({ calendar_event_id: calendarEventId });
  }
}
```

### 2. Booking Updates

Calendar events are updated when booking details change:

**Location:** `backend/src/controllers/booking.controller.ts`

```typescript
// After booking update
if (booking.status === BookingStatus.CONFIRMED && booking.calendar_event_id) {
  await updateCalendarEvent(booking.calendar_event_id, {
    // updated booking data
  });
}
```

### 3. Booking Cancellation

Calendar events are deleted when bookings are cancelled:

**Location:** `backend/src/controllers/booking.controller.ts`

```typescript
// After booking cancellation
if (booking.calendar_event_id) {
  await deleteCalendarEvent(booking.calendar_event_id);
}
```

## Event Details

### Event Structure

Calendar events include:

- **Summary:** "Hotel Booking: [Hotel Name]"
- **Location:** Hotel address
- **Description:** Comprehensive booking details including:
  - Booking number
  - Hotel information (name, address, phone)
  - Room type
  - Guest information
  - Guide contact (if applicable)
  - Special requests
  - Preparation instructions
- **Start Date:** Check-in date (all-day event)
- **End Date:** Check-out date (all-day event)
- **Attendees:** Guest email
- **Reminders:** 
  - Email reminder 24 hours before
  - Popup reminder 24 hours before
- **Color:** Blue (colorId: 9)

### Preparation Instructions

Each event includes standard preparation instructions:
- Check-in time: 2:00 PM
- Check-out time: 12:00 PM
- Bring valid ID for check-in
- Contact hotel if arriving late

## Testing

### Run Tests

```bash
npm run test:google-calendar
```

### Test Script

The test script (`src/scripts/testGoogleCalendar.ts`) performs:

1. ✅ Create a test calendar event
2. ✅ Retrieve the event details
3. ✅ Update the event with new dates
4. ✅ Delete the event

### Manual Testing

1. Create a booking and complete payment
2. Check that `calendar_event_id` is populated in the booking record
3. Verify the event appears in Google Calendar
4. Update booking dates and verify calendar event is updated
5. Cancel booking and verify calendar event is deleted

## Error Handling

The service handles errors gracefully:

- **401 Unauthorized:** Invalid or expired credentials
- **403 Forbidden:** API access denied or not enabled
- **404 Not Found:** Event or calendar not found
- **Network Errors:** Logged but don't block booking operations

Calendar operations are non-critical - if they fail, bookings still proceed normally.

## Database Schema

### Bookings Table

```sql
calendar_event_id VARCHAR(255) NULL
```

Stores the Google Calendar event ID for confirmed bookings.

## Limitations

1. **OAuth2 Required:** Current implementation requires OAuth2 setup for production
2. **User Calendar Access:** Needs user permission to access their calendar
3. **Rate Limits:** Google Calendar API has rate limits (check quotas in Cloud Console)
4. **Timezone:** Events use 'Asia/Phnom_Penh' timezone
5. **All-Day Events:** Events are created as all-day events (no specific times)

## Future Enhancements

1. **User Preferences:** Allow users to opt-in/opt-out of calendar integration
2. **Multiple Calendars:** Support adding events to specific calendars
3. **Custom Reminders:** Let users configure reminder timing
4. **iCal Export:** Provide downloadable .ics files as alternative
5. **Calendar Sync:** Sync with other calendar services (Outlook, Apple Calendar)
6. **Itinerary View:** Show complete trip itinerary with travel times
7. **Real-time Updates:** Use webhooks to sync changes bidirectionally

## Security Considerations

1. **Credentials:** Never commit Google Calendar credentials to version control
2. **Token Storage:** Store OAuth tokens securely (encrypted in database)
3. **Scope Limitation:** Request only necessary calendar permissions
4. **User Consent:** Always get explicit user consent before accessing calendar
5. **Data Privacy:** Handle calendar data according to privacy policy

## Support

For issues or questions:
- Check Google Calendar API documentation: https://developers.google.com/calendar
- Review error logs in `backend/logs/`
- Contact development team

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
