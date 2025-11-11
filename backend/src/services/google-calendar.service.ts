import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * Google Calendar Service
 * Handles calendar event creation, updates, and deletion for bookings
 */

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  config.GOOGLE_CALENDAR_CLIENT_ID,
  config.GOOGLE_CALENDAR_CLIENT_SECRET
);

// Calendar API instance
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Create a calendar event for a booking
 * @param bookingData - Booking information
 * @returns Calendar event ID
 */
export const createCalendarEvent = async (bookingData: {
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
}): Promise<string | null> => {
  try {
    // Check if Google Calendar is configured
    if (!config.GOOGLE_CALENDAR_CLIENT_ID || !config.GOOGLE_CALENDAR_CLIENT_SECRET) {
      logger.warn('Google Calendar API not configured. Skipping calendar event creation.');
      return null;
    }

    const {
      booking_number,
      hotel_name,
      hotel_address,
      hotel_phone,
      room_type,
      check_in,
      check_out,
      guest_name,
      guest_email,
      guest_phone,
      special_requests,
      guide_contact,
    } = bookingData;

    // Format dates for calendar
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Create event description with all details
    let description = `Booking Number: ${booking_number}\n\n`;
    description += `Hotel: ${hotel_name}\n`;
    description += `Room Type: ${room_type}\n`;
    description += `Address: ${hotel_address}\n`;
    description += `Hotel Phone: ${hotel_phone}\n\n`;
    description += `Guest Information:\n`;
    description += `Name: ${guest_name}\n`;
    description += `Email: ${guest_email}\n`;
    description += `Phone: ${guest_phone}\n\n`;

    if (guide_contact) {
      description += `Guide Contact: ${guide_contact}\n\n`;
    }

    if (special_requests) {
      description += `Special Requests: ${special_requests}\n\n`;
    }

    description += `Preparation Instructions:\n`;
    description += `- Check-in time: 2:00 PM\n`;
    description += `- Check-out time: 12:00 PM\n`;
    description += `- Please bring a valid ID for check-in\n`;
    description += `- Contact the hotel if you'll arrive late\n`;

    // Create calendar event
    const event = {
      summary: `Hotel Booking: ${hotel_name}`,
      location: hotel_address,
      description: description,
      start: {
        date: checkInDate.toISOString().split('T')[0], // All-day event
        timeZone: 'Asia/Phnom_Penh',
      },
      end: {
        date: checkOutDate.toISOString().split('T')[0], // All-day event
        timeZone: 'Asia/Phnom_Penh',
      },
      attendees: [
        { email: guest_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 24 * 60 }, // 1 day before
        ],
      },
      colorId: '9', // Blue color for hotel bookings
    };

    // Insert event into calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    const eventId = response.data.id;
    logger.info(`Calendar event created: ${eventId} for booking ${booking_number}`);

    return eventId || null;
  } catch (error: any) {
    logger.error('Error creating calendar event:', error);
    
    // Don't throw error - calendar creation is not critical
    // Just log and return null
    if (error.code === 401) {
      logger.error('Google Calendar authentication failed. Please check credentials.');
    } else if (error.code === 403) {
      logger.error('Google Calendar API access forbidden. Please check API permissions.');
    }
    
    return null;
  }
};

/**
 * Update a calendar event
 * @param eventId - Calendar event ID
 * @param bookingData - Updated booking information
 * @returns Success status
 */
export const updateCalendarEvent = async (
  eventId: string,
  bookingData: {
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
): Promise<boolean> => {
  try {
    // Check if Google Calendar is configured
    if (!config.GOOGLE_CALENDAR_CLIENT_ID || !config.GOOGLE_CALENDAR_CLIENT_SECRET) {
      logger.warn('Google Calendar API not configured. Skipping calendar event update.');
      return false;
    }

    if (!eventId) {
      logger.warn('No calendar event ID provided for update.');
      return false;
    }

    const {
      booking_number,
      hotel_name,
      hotel_address,
      hotel_phone,
      room_type,
      check_in,
      check_out,
      guest_name,
      guest_email,
      guest_phone,
      special_requests,
      guide_contact,
    } = bookingData;

    // Format dates for calendar
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Create updated event description
    let description = `Booking Number: ${booking_number}\n\n`;
    description += `Hotel: ${hotel_name}\n`;
    description += `Room Type: ${room_type}\n`;
    description += `Address: ${hotel_address}\n`;
    description += `Hotel Phone: ${hotel_phone}\n\n`;
    description += `Guest Information:\n`;
    description += `Name: ${guest_name}\n`;
    description += `Email: ${guest_email}\n`;
    description += `Phone: ${guest_phone}\n\n`;

    if (guide_contact) {
      description += `Guide Contact: ${guide_contact}\n\n`;
    }

    if (special_requests) {
      description += `Special Requests: ${special_requests}\n\n`;
    }

    description += `Preparation Instructions:\n`;
    description += `- Check-in time: 2:00 PM\n`;
    description += `- Check-out time: 12:00 PM\n`;
    description += `- Please bring a valid ID for check-in\n`;
    description += `- Contact the hotel if you'll arrive late\n`;
    description += `\n[UPDATED]`;

    // Update calendar event
    const event = {
      summary: `Hotel Booking: ${hotel_name}`,
      location: hotel_address,
      description: description,
      start: {
        date: checkInDate.toISOString().split('T')[0],
        timeZone: 'Asia/Phnom_Penh',
      },
      end: {
        date: checkOutDate.toISOString().split('T')[0],
        timeZone: 'Asia/Phnom_Penh',
      },
      attendees: [
        { email: guest_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 24 * 60 },
        ],
      },
      colorId: '9',
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
      sendUpdates: 'all', // Send email notifications about the update
    });

    logger.info(`Calendar event updated: ${eventId} for booking ${booking_number}`);
    return true;
  } catch (error: any) {
    logger.error('Error updating calendar event:', error);
    
    if (error.code === 404) {
      logger.error(`Calendar event ${eventId} not found.`);
    } else if (error.code === 401) {
      logger.error('Google Calendar authentication failed. Please check credentials.');
    } else if (error.code === 403) {
      logger.error('Google Calendar API access forbidden. Please check API permissions.');
    }
    
    return false;
  }
};

/**
 * Delete a calendar event
 * @param eventId - Calendar event ID
 * @returns Success status
 */
export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  try {
    // Check if Google Calendar is configured
    if (!config.GOOGLE_CALENDAR_CLIENT_ID || !config.GOOGLE_CALENDAR_CLIENT_SECRET) {
      logger.warn('Google Calendar API not configured. Skipping calendar event deletion.');
      return false;
    }

    if (!eventId) {
      logger.warn('No calendar event ID provided for deletion.');
      return false;
    }

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all', // Send cancellation notifications
    });

    logger.info(`Calendar event deleted: ${eventId}`);
    return true;
  } catch (error: any) {
    logger.error('Error deleting calendar event:', error);
    
    if (error.code === 404) {
      logger.warn(`Calendar event ${eventId} not found. May have been already deleted.`);
      return true; // Consider it successful if already deleted
    } else if (error.code === 401) {
      logger.error('Google Calendar authentication failed. Please check credentials.');
    } else if (error.code === 403) {
      logger.error('Google Calendar API access forbidden. Please check API permissions.');
    }
    
    return false;
  }
};

/**
 * Get calendar event details
 * @param eventId - Calendar event ID
 * @returns Event details or null
 */
export const getCalendarEvent = async (eventId: string): Promise<any | null> => {
  try {
    if (!config.GOOGLE_CALENDAR_CLIENT_ID || !config.GOOGLE_CALENDAR_CLIENT_SECRET) {
      return null;
    }

    if (!eventId) {
      return null;
    }

    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    return response.data;
  } catch (error: any) {
    logger.error('Error getting calendar event:', error);
    return null;
  }
};

export default {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent,
};
