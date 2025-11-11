import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = 'http://localhost:3000/api';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function logSuccess(message: string) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logSection(message: string) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log(`${message}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

async function testEventEndpoints() {
  try {
    logSection('EVENT ENDPOINTS TEST SUITE');

    // Test 1: Get all events
    logInfo('Test 1: GET /api/events - Get all events');
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      
      if (response.data.success && response.data.data.events) {
        logSuccess(`Retrieved ${response.data.data.events.length} events`);
        console.log(`   Total events: ${response.data.data.pagination.total}`);
        console.log(`   Page: ${response.data.data.pagination.page}/${response.data.data.pagination.totalPages}`);
        
        if (response.data.data.events.length > 0) {
          const firstEvent = response.data.data.events[0];
          console.log(`\n   Sample Event:`);
          console.log(`   - Name: ${firstEvent.name}`);
          console.log(`   - Type: ${firstEvent.event_type}`);
          console.log(`   - Dates: ${firstEvent.start_date} to ${firstEvent.end_date}`);
          console.log(`   - Location: ${firstEvent.location.city}, ${firstEvent.location.province}`);
          console.log(`   - Price: $${firstEvent.pricing.base_price} (Base) / $${firstEvent.pricing.vip_price} (VIP)`);
          console.log(`   - Available spots: ${firstEvent.available_spots}/${firstEvent.capacity}`);
          console.log(`   - Status: ${firstEvent.is_upcoming ? 'Upcoming' : firstEvent.is_ongoing ? 'Ongoing' : 'Past'}`);
        }
      } else {
        logError('Invalid response format');
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 2: Get events with filters
    logInfo('\nTest 2: GET /api/events?event_type=festival - Filter by event type');
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        params: {
          event_type: 'festival',
        },
      });
      
      if (response.data.success) {
        logSuccess(`Retrieved ${response.data.data.events.length} festival events`);
        response.data.data.events.forEach((event: any, index: number) => {
          console.log(`   ${index + 1}. ${event.name} (${event.event_type})`);
        });
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 3: Get events by city
    logInfo('\nTest 3: GET /api/events?city=Phnom Penh - Filter by city');
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        params: {
          city: 'Phnom Penh',
        },
      });
      
      if (response.data.success) {
        logSuccess(`Retrieved ${response.data.data.events.length} events in Phnom Penh`);
        response.data.data.events.forEach((event: any, index: number) => {
          console.log(`   ${index + 1}. ${event.name} - ${event.location.venue}`);
        });
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 4: Get events with price range
    logInfo('\nTest 4: GET /api/events?min_price=40&max_price=60 - Filter by price range');
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        params: {
          min_price: 40,
          max_price: 60,
        },
      });
      
      if (response.data.success) {
        logSuccess(`Retrieved ${response.data.data.events.length} events in price range $40-$60`);
        response.data.data.events.forEach((event: any, index: number) => {
          console.log(`   ${index + 1}. ${event.name} - $${event.pricing.base_price}`);
        });
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 5: Get events sorted by popularity
    logInfo('\nTest 5: GET /api/events?sort_by=popularity - Sort by popularity');
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        params: {
          sort_by: 'popularity',
        },
      });
      
      if (response.data.success) {
        logSuccess(`Retrieved events sorted by popularity`);
        response.data.data.events.slice(0, 3).forEach((event: any, index: number) => {
          console.log(`   ${index + 1}. ${event.name} - ${event.bookings_count} bookings`);
        });
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 6: Get specific event by ID
    logInfo('\nTest 6: GET /api/events/:id - Get event details');
    try {
      // First get an event ID
      const listResponse = await axios.get(`${API_BASE_URL}/events`);
      if (listResponse.data.data.events.length > 0) {
        const eventId = listResponse.data.data.events[0].id;
        
        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
        
        if (response.data.success && response.data.data.event) {
          const event = response.data.data.event;
          logSuccess(`Retrieved event details for: ${event.name}`);
          console.log(`\n   Event Details:`);
          console.log(`   - ID: ${event.id}`);
          console.log(`   - Name: ${event.name}`);
          console.log(`   - Type: ${event.event_type}`);
          console.log(`   - Description: ${event.description.substring(0, 100)}...`);
          console.log(`   - Dates: ${event.start_date} to ${event.end_date}`);
          console.log(`   - Duration: ${event.duration_days} days`);
          console.log(`   - Location: ${event.location.venue}, ${event.location.city}`);
          console.log(`   - Coordinates: ${event.location.latitude}, ${event.location.longitude}`);
          console.log(`   - Pricing: $${event.pricing.base_price} (Base) / $${event.pricing.vip_price} (VIP)`);
          console.log(`   - Capacity: ${event.capacity}`);
          console.log(`   - Available spots: ${event.available_spots}`);
          console.log(`   - Cultural significance: ${event.cultural_significance.substring(0, 100)}...`);
          console.log(`   - What to expect: ${event.what_to_expect.substring(0, 100)}...`);
          console.log(`   - Related tours: ${event.related_tours.length} tours`);
          console.log(`   - Images: ${event.images.length} images`);
          console.log(`   - Status: ${event.is_upcoming ? 'Upcoming' : event.is_ongoing ? 'Ongoing' : 'Past'}`);
        }
      } else {
        logError('No events available to test');
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 7: Get events by specific date
    logInfo('\nTest 7: GET /api/events/date/:date - Get events by date');
    try {
      const testDate = '2025-04-15'; // During Khmer New Year
      const response = await axios.get(`${API_BASE_URL}/events/date/${testDate}`);
      
      if (response.data.success) {
        logSuccess(`Retrieved ${response.data.data.count} events for ${testDate}`);
        response.data.data.events.forEach((event: any, index: number) => {
          console.log(`   ${index + 1}. ${event.name}`);
          console.log(`      Dates: ${event.start_date} to ${event.end_date}`);
          console.log(`      Location: ${event.location.city}`);
          console.log(`      Related tours: ${event.related_tours.length}`);
        });
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 8: Get events by date with no results
    logInfo('\nTest 8: GET /api/events/date/:date - Get events for date with no events');
    try {
      const testDate = '2025-01-15';
      const response = await axios.get(`${API_BASE_URL}/events/date/${testDate}`);
      
      if (response.data.success) {
        logSuccess(`Retrieved ${response.data.data.count} events for ${testDate}`);
        if (response.data.data.count === 0) {
          console.log(`   No events scheduled for this date`);
        }
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 9: Invalid date format
    logInfo('\nTest 9: GET /api/events/date/invalid - Test invalid date format');
    try {
      const response = await axios.get(`${API_BASE_URL}/events/date/invalid-date`);
      logError('Should have failed with invalid date format');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logSuccess('Correctly rejected invalid date format');
        console.log(`   Error: ${error.response.data.error.message}`);
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 10: Non-existent event ID
    logInfo('\nTest 10: GET /api/events/:id - Test non-existent event');
    try {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await axios.get(`${API_BASE_URL}/events/${fakeId}`);
      logError('Should have failed with event not found');
    } catch (error: any) {
      if (error.response?.status === 404) {
        logSuccess('Correctly returned 404 for non-existent event');
        console.log(`   Error: ${error.response.data.error.message}`);
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 11: Pagination
    logInfo('\nTest 11: GET /api/events?page=1&limit=2 - Test pagination');
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        params: {
          page: 1,
          limit: 2,
        },
      });
      
      if (response.data.success) {
        logSuccess(`Retrieved page 1 with limit 2`);
        console.log(`   Events on this page: ${response.data.data.events.length}`);
        console.log(`   Total events: ${response.data.data.pagination.total}`);
        console.log(`   Total pages: ${response.data.data.pagination.totalPages}`);
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 12: Available events only
    logInfo('\nTest 12: GET /api/events?available_only=true - Get only available events');
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        params: {
          available_only: true,
        },
      });
      
      if (response.data.success) {
        logSuccess(`Retrieved ${response.data.data.events.length} available events`);
        response.data.data.events.forEach((event: any, index: number) => {
          console.log(`   ${index + 1}. ${event.name} - ${event.available_spots} spots available`);
        });
      }
    } catch (error: any) {
      logError(`Failed: ${error.response?.data?.error?.message || error.message}`);
    }

    logSection('TEST SUITE COMPLETED');
    console.log(`${colors.green}All event endpoint tests completed!${colors.reset}\n`);

  } catch (error: any) {
    logger.error('Test suite error:', error);
    console.log(`\n${colors.red}Test suite failed with error: ${error.message}${colors.reset}\n`);
  }
}

// Run the tests
console.log(`${colors.yellow}Starting Event Endpoints Test Suite...${colors.reset}`);
console.log(`${colors.yellow}Make sure the server is running on ${API_BASE_URL}${colors.reset}\n`);

testEventEndpoints()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
