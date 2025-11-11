import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test1234',
};

let authToken = '';
let testBookingId = '';

/**
 * Login and get auth token
 */
async function login() {
  try {
    console.log('\n=== Testing User Login ===');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER);
    
    if (response.data.success) {
      authToken = response.data.data.access_token;
      console.log('✓ Login successful');
      console.log(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Create a test booking
 */
async function createTestBooking() {
  try {
    console.log('\n=== Creating Test Booking ===');
    
    // First, get a hotel and room
    const hotelsResponse = await axios.get(`${API_BASE_URL}/hotels?limit=1`);
    if (!hotelsResponse.data.success || hotelsResponse.data.data.hotels.length === 0) {
      console.error('✗ No hotels available for testing');
      return false;
    }
    
    const hotel = hotelsResponse.data.data.hotels[0];
    console.log(`Using hotel: ${hotel.name}`);
    
    // Get rooms for this hotel
    const roomsResponse = await axios.get(`${API_BASE_URL}/hotels/${hotel.id}/rooms`);
    if (!roomsResponse.data.success || roomsResponse.data.data.rooms.length === 0) {
      console.error('✗ No rooms available for testing');
      return false;
    }
    
    const room = roomsResponse.data.data.rooms[0];
    console.log(`Using room: ${room.room_type}`);
    
    // Create booking
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7); // 7 days from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2); // 2 nights
    
    const bookingData = {
      hotel_id: hotel.id,
      room_id: room.id,
      check_in: checkIn.toISOString().split('T')[0],
      check_out: checkOut.toISOString().split('T')[0],
      guests: {
        adults: 2,
        children: 0,
      },
      guest_details: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        special_requests: 'Late check-in please',
      },
      payment_method: 'paypal',
      payment_type: 'full',
    };
    
    const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.data.success) {
      testBookingId = response.data.data.booking.id;
      console.log('✓ Booking created successfully');
      console.log(`Booking ID: ${testBookingId}`);
      console.log(`Booking Number: ${response.data.data.booking.booking_number}`);
      console.log(`Total: $${response.data.data.booking.pricing.total}`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('✗ Create booking failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting all user bookings
 */
async function testGetUserBookings() {
  try {
    console.log('\n=== Testing Get User Bookings ===');
    
    const response = await axios.get(`${API_BASE_URL}/bookings`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.data.success) {
      console.log('✓ Retrieved user bookings successfully');
      console.log(`Total bookings: ${response.data.data.total}`);
      
      if (response.data.data.bookings.upcoming) {
        console.log(`Upcoming: ${response.data.data.bookings.upcoming.length}`);
      }
      if (response.data.data.bookings.active) {
        console.log(`Active: ${response.data.data.bookings.active.length}`);
      }
      if (response.data.data.bookings.past) {
        console.log(`Past: ${response.data.data.bookings.past.length}`);
      }
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('✗ Get user bookings failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting bookings by category
 */
async function testGetBookingsByCategory() {
  try {
    console.log('\n=== Testing Get Bookings by Category ===');
    
    const categories = ['upcoming', 'active', 'past'];
    
    for (const category of categories) {
      const response = await axios.get(`${API_BASE_URL}/bookings?category=${category}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (response.data.success) {
        console.log(`✓ Retrieved ${category} bookings: ${response.data.data.bookings.length} found`);
      } else {
        console.log(`✗ Failed to retrieve ${category} bookings`);
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('✗ Get bookings by category failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting a specific booking by ID
 */
async function testGetBookingById() {
  try {
    console.log('\n=== Testing Get Booking by ID ===');
    
    if (!testBookingId) {
      console.log('⚠ No test booking ID available, skipping test');
      return true;
    }
    
    const response = await axios.get(`${API_BASE_URL}/bookings/${testBookingId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.data.success) {
      console.log('✓ Retrieved booking successfully');
      console.log(`Booking Number: ${response.data.data.booking.booking_number}`);
      console.log(`Status: ${response.data.data.booking.status}`);
      console.log(`Hotel: ${response.data.data.booking.hotel.name}`);
      console.log(`Room: ${response.data.data.booking.room.room_type}`);
      console.log(`Check-in: ${response.data.data.booking.check_in}`);
      console.log(`Check-out: ${response.data.data.booking.check_out}`);
      console.log(`Total: $${response.data.data.booking.pricing.total}`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('✗ Get booking by ID failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test updating a booking
 */
async function testUpdateBooking() {
  try {
    console.log('\n=== Testing Update Booking ===');
    
    if (!testBookingId) {
      console.log('⚠ No test booking ID available, skipping test');
      return true;
    }
    
    // Update guest details and special requests
    const updateData = {
      guest_details: {
        name: 'Updated Test User',
        email: 'updated@example.com',
        phone: '+9876543210',
        special_requests: 'Early check-in requested',
      },
    };
    
    const response = await axios.put(
      `${API_BASE_URL}/bookings/${testBookingId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    
    if (response.data.success) {
      console.log('✓ Booking updated successfully');
      console.log(`Updated guest name: ${response.data.data.booking.guest_details.name}`);
      console.log(`Updated email: ${response.data.data.booking.guest_details.email}`);
      console.log(`Updated special requests: ${response.data.data.booking.guest_details.special_requests}`);
      
      if (response.data.data.price_change) {
        console.log(`Price change: ${response.data.data.price_change.action_required}`);
        console.log(`Amount: $${response.data.data.price_change.amount}`);
      }
      
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('✗ Update booking failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test updating booking dates
 */
async function testUpdateBookingDates() {
  try {
    console.log('\n=== Testing Update Booking Dates ===');
    
    if (!testBookingId) {
      console.log('⚠ No test booking ID available, skipping test');
      return true;
    }
    
    // Update dates (extend by 1 day)
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 8); // 8 days from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3); // 3 nights instead of 2
    
    const updateData = {
      check_in: checkIn.toISOString().split('T')[0],
      check_out: checkOut.toISOString().split('T')[0],
    };
    
    const response = await axios.put(
      `${API_BASE_URL}/bookings/${testBookingId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    
    if (response.data.success) {
      console.log('✓ Booking dates updated successfully');
      console.log(`New check-in: ${response.data.data.booking.check_in}`);
      console.log(`New check-out: ${response.data.data.booking.check_out}`);
      console.log(`New nights: ${response.data.data.booking.nights}`);
      console.log(`New total: $${response.data.data.booking.pricing.total}`);
      
      if (response.data.data.price_change) {
        console.log(`Price change: ${response.data.data.price_change.action_required}`);
        console.log(`Difference: $${response.data.data.price_change.difference.toFixed(2)}`);
      }
      
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('✗ Update booking dates failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test cancelling a booking
 */
async function testCancelBooking() {
  try {
    console.log('\n=== Testing Cancel Booking ===');
    
    if (!testBookingId) {
      console.log('⚠ No test booking ID available, skipping test');
      return true;
    }
    
    const cancelData = {
      reason: 'Testing cancellation functionality',
    };
    
    const response = await axios.delete(
      `${API_BASE_URL}/bookings/${testBookingId}/cancel`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: cancelData,
      }
    );
    
    if (response.data.success) {
      console.log('✓ Booking cancelled successfully');
      console.log(`Status: ${response.data.data.booking.status}`);
      console.log(`Refund amount: $${response.data.data.cancellation_details.refund_amount.toFixed(2)}`);
      console.log(`Refund status: ${response.data.data.cancellation_details.refund_status}`);
      console.log(`Policy applied: ${response.data.data.cancellation_details.policy_applied}`);
      console.log(`Days until check-in: ${response.data.data.cancellation_details.days_until_checkin}`);
      console.log(`Processing time: ${response.data.data.cancellation_details.processing_time}`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('✗ Cancel booking failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test error handling - invalid booking ID
 */
async function testInvalidBookingId() {
  try {
    console.log('\n=== Testing Error Handling - Invalid Booking ID ===');
    
    const invalidId = '00000000-0000-0000-0000-000000000000';
    
    try {
      await axios.get(`${API_BASE_URL}/bookings/${invalidId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log('✗ Should have returned 404 error');
      return false;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✓ Correctly returned 404 for invalid booking ID');
        return true;
      }
      console.log('✗ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  } catch (error: any) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
}

/**
 * Test error handling - unauthorized access
 */
async function testUnauthorizedAccess() {
  try {
    console.log('\n=== Testing Error Handling - Unauthorized Access ===');
    
    try {
      await axios.get(`${API_BASE_URL}/bookings`);
      console.log('✗ Should have returned 401 error');
      return false;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✓ Correctly returned 401 for unauthorized access');
        return true;
      }
      console.log('✗ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  } catch (error: any) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('BOOKING MANAGEMENT ENDPOINTS TEST SUITE');
  console.log('='.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };
  
  const tests = [
    { name: 'Login', fn: login },
    { name: 'Create Test Booking', fn: createTestBooking },
    { name: 'Get User Bookings', fn: testGetUserBookings },
    { name: 'Get Bookings by Category', fn: testGetBookingsByCategory },
    { name: 'Get Booking by ID', fn: testGetBookingById },
    { name: 'Update Booking', fn: testUpdateBooking },
    { name: 'Update Booking Dates', fn: testUpdateBookingDates },
    { name: 'Cancel Booking', fn: testCancelBooking },
    { name: 'Invalid Booking ID', fn: testInvalidBookingId },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
