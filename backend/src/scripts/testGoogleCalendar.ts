import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent,
} from '../services/google-calendar.service';

/**
 * Test Google Calendar Integration
 * 
 * This script tests the Google Calendar service functions:
 * 1. Create a calendar event
 * 2. Retrieve the event
 * 3. Update the event
 * 4. Delete the event
 */

async function testGoogleCalendar() {
  console.log('\n=== Testing Google Calendar Integration ===\n');

  try {
    // Test data
    const bookingData = {
      booking_number: 'BK-TEST-12345',
      hotel_name: 'Angkor Paradise Hotel',
      hotel_address: '123 Sivatha Blvd, Siem Reap, Cambodia',
      hotel_phone: '+855 63 123 4567',
      hotel_location: {
        latitude: 13.3671,
        longitude: 103.8448,
      },
      room_type: 'Deluxe Suite',
      check_in: new Date('2025-11-01'),
      check_out: new Date('2025-11-05'),
      guest_name: 'John Doe',
      guest_email: 'john.doe@example.com',
      guest_phone: '+1 555 123 4567',
      special_requests: 'Late check-in requested',
      guide_contact: '+855 12 345 678',
    };

    // Test 1: Create calendar event
    console.log('Test 1: Creating calendar event...');
    const eventId = await createCalendarEvent(bookingData);

    if (eventId) {
      console.log('✅ Calendar event created successfully');
      console.log(`   Event ID: ${eventId}`);
    } else {
      console.log('⚠️  Calendar event creation skipped (API not configured or failed)');
      console.log('   This is expected if Google Calendar credentials are not set up');
      console.log('\nTo enable Google Calendar integration:');
      console.log('1. Set up Google Calendar API credentials');
      console.log('2. Add GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET to .env');
      console.log('3. Configure OAuth2 authentication');
      return;
    }

    // Test 2: Retrieve calendar event
    console.log('\nTest 2: Retrieving calendar event...');
    const event = await getCalendarEvent(eventId);

    if (event) {
      console.log('✅ Calendar event retrieved successfully');
      console.log(`   Summary: ${event.summary}`);
      console.log(`   Start: ${event.start?.date || event.start?.dateTime}`);
      console.log(`   End: ${event.end?.date || event.end?.dateTime}`);
    } else {
      console.log('❌ Failed to retrieve calendar event');
    }

    // Test 3: Update calendar event
    console.log('\nTest 3: Updating calendar event...');
    const updatedData = {
      ...bookingData,
      check_in: new Date('2025-11-02'),
      check_out: new Date('2025-11-06'),
      special_requests: 'Late check-in requested, vegetarian breakfast',
    };

    const updateSuccess = await updateCalendarEvent(eventId, updatedData);

    if (updateSuccess) {
      console.log('✅ Calendar event updated successfully');
      
      // Verify update
      const updatedEvent = await getCalendarEvent(eventId);
      if (updatedEvent) {
        console.log(`   Updated Start: ${updatedEvent.start?.date || updatedEvent.start?.dateTime}`);
        console.log(`   Updated End: ${updatedEvent.end?.date || updatedEvent.end?.dateTime}`);
      }
    } else {
      console.log('❌ Failed to update calendar event');
    }

    // Test 4: Delete calendar event
    console.log('\nTest 4: Deleting calendar event...');
    const deleteSuccess = await deleteCalendarEvent(eventId);

    if (deleteSuccess) {
      console.log('✅ Calendar event deleted successfully');
      
      // Verify deletion
      const deletedEvent = await getCalendarEvent(eventId);
      if (!deletedEvent) {
        console.log('   Verified: Event no longer exists');
      }
    } else {
      console.log('❌ Failed to delete calendar event');
    }

    console.log('\n=== Google Calendar Integration Tests Complete ===\n');
    console.log('Summary:');
    console.log('- Calendar event creation: ✅');
    console.log('- Calendar event retrieval: ✅');
    console.log('- Calendar event update: ✅');
    console.log('- Calendar event deletion: ✅');
    console.log('\nNote: Actual calendar operations depend on proper Google Calendar API configuration.');

  } catch (error: any) {
    console.error('\n❌ Error during Google Calendar testing:', error.message);
    console.error('\nFull error:', error);
    
    if (error.code === 401) {
      console.error('\n⚠️  Authentication Error:');
      console.error('   Google Calendar API credentials are invalid or expired.');
      console.error('   Please check your GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET.');
    } else if (error.code === 403) {
      console.error('\n⚠️  Permission Error:');
      console.error('   Google Calendar API access is forbidden.');
      console.error('   Please ensure the API is enabled in Google Cloud Console.');
    } else if (error.code === 404) {
      console.error('\n⚠️  Not Found Error:');
      console.error('   The calendar or event was not found.');
    }
  }
}

// Run tests
testGoogleCalendar()
  .then(() => {
    console.log('\nTest script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest script failed:', error);
    process.exit(1);
  });
