import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './src/.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

// Helper function to log results
function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${result.test}`);
  console.log(`   ${result.message}`);
  if (result.data) {
    console.log(`   Data:`, JSON.stringify(result.data, null, 2));
  }
  console.log('');
}

// Test data
let authToken: string;
let userId: string;
let hotelId: string;
let roomId: string;

async function testBookingCreation() {
  console.log('🧪 Testing Booking Creation Endpoint\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Register a test user
    console.log('📝 Step 1: Register test user...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: `booking_test_${Date.now()}@test.com`,
        password: 'Test123!@#',
        first_name: 'Booking',
        last_name: 'Tester',
        phone: `+85512345${Math.floor(Math.random() * 10000)}`,
        user_type: 'tourist',
      });

      // Check response structure
      if (!registerResponse.data || !registerResponse.data.data) {
        logResult({
          test: 'User Registration',
          status: 'FAIL',
          message: 'Invalid response structure',
          data: registerResponse.data,
        });
        return;
      }

      authToken = registerResponse.data.data.accessToken;
      userId = registerResponse.data.data.user.id;

      logResult({
        test: 'User Registration',
        status: 'PASS',
        message: 'Test user registered successfully',
        data: { userId, hasToken: !!authToken },
      });
    } catch (error: any) {
      logResult({
        test: 'User Registration',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
        data: error.response?.data,
      });
      return;
    }

    // Step 2: Get available hotels
    console.log('🏨 Step 2: Get available hotels...');
    try {
      const hotelsResponse = await axios.get(`${API_BASE_URL}/hotels`);
      const hotels = hotelsResponse.data.data.hotels;

      if (hotels.length === 0) {
        logResult({
          test: 'Get Hotels',
          status: 'FAIL',
          message: 'No hotels available. Please seed hotels first.',
        });
        return;
      }

      hotelId = hotels[0].id;

      logResult({
        test: 'Get Hotels',
        status: 'PASS',
        message: `Found ${hotels.length} hotels`,
        data: { hotelId, hotelName: hotels[0].name },
      });
    } catch (error: any) {
      logResult({
        test: 'Get Hotels',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      return;
    }

    // Step 3: Get hotel rooms
    console.log('🛏️  Step 3: Get hotel rooms...');
    try {
      const hotelDetailResponse = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`);
      const rooms = hotelDetailResponse.data.data.hotel.rooms;

      if (!rooms || rooms.length === 0) {
        logResult({
          test: 'Get Hotel Rooms',
          status: 'FAIL',
          message: 'No rooms available for this hotel',
        });
        return;
      }

      roomId = rooms[0].id;

      logResult({
        test: 'Get Hotel Rooms',
        status: 'PASS',
        message: `Found ${rooms.length} rooms`,
        data: { roomId, roomType: rooms[0].room_type, price: rooms[0].price_per_night },
      });
    } catch (error: any) {
      logResult({
        test: 'Get Hotel Rooms',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      return;
    }

    // Step 4: Create booking with valid data
    console.log('📅 Step 4: Create booking with valid data...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkIn = tomorrow.toISOString().split('T')[0];

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
      const checkOut = dayAfterTomorrow.toISOString().split('T')[0];

      const bookingResponse = await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          hotel_id: hotelId,
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
          guests: {
            adults: 2,
            children: 0,
          },
          guest_details: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+855123456789',
            special_requests: 'Late check-in please',
          },
          payment_method: 'paypal',
          payment_type: 'full',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const booking = bookingResponse.data.data.booking;

      logResult({
        test: 'Create Booking - Valid Data',
        status: 'PASS',
        message: 'Booking created successfully',
        data: {
          bookingNumber: booking.booking_number,
          status: booking.status,
          nights: booking.nights,
          total: booking.pricing.total,
        },
      });
    } catch (error: any) {
      logResult({
        test: 'Create Booking - Valid Data',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
        data: error.response?.data,
      });
    }

    // Step 5: Test validation - missing required fields
    console.log('🔍 Step 5: Test validation - missing required fields...');
    try {
      await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          hotel_id: hotelId,
          // Missing room_id, check_in, check_out, guests, guest_details
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      logResult({
        test: 'Validation - Missing Fields',
        status: 'FAIL',
        message: 'Should have returned validation error',
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        logResult({
          test: 'Validation - Missing Fields',
          status: 'PASS',
          message: 'Correctly rejected request with missing fields',
          data: { error: error.response.data.error.message },
        });
      } else {
        logResult({
          test: 'Validation - Missing Fields',
          status: 'FAIL',
          message: 'Unexpected error response',
          data: error.response?.data,
        });
      }
    }

    // Step 6: Test validation - invalid dates
    console.log('📆 Step 6: Test validation - invalid dates...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];

      await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          hotel_id: hotelId,
          room_id: roomId,
          check_in: pastDate,
          check_out: pastDate,
          guests: {
            adults: 2,
            children: 0,
          },
          guest_details: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+855123456789',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      logResult({
        test: 'Validation - Past Dates',
        status: 'FAIL',
        message: 'Should have rejected past check-in date',
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        logResult({
          test: 'Validation - Past Dates',
          status: 'PASS',
          message: 'Correctly rejected past check-in date',
          data: { error: error.response.data.error.message },
        });
      } else {
        logResult({
          test: 'Validation - Past Dates',
          status: 'FAIL',
          message: 'Unexpected error response',
          data: error.response?.data,
        });
      }
    }

    // Step 7: Test validation - invalid guest count
    console.log('👥 Step 7: Test validation - invalid guest count...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkIn = tomorrow.toISOString().split('T')[0];

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
      const checkOut = dayAfterTomorrow.toISOString().split('T')[0];

      await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          hotel_id: hotelId,
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
          guests: {
            adults: 0, // Invalid: at least 1 adult required
            children: 2,
          },
          guest_details: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+855123456789',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      logResult({
        test: 'Validation - Invalid Guest Count',
        status: 'FAIL',
        message: 'Should have rejected 0 adults',
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        logResult({
          test: 'Validation - Invalid Guest Count',
          status: 'PASS',
          message: 'Correctly rejected invalid guest count',
          data: { error: error.response.data.error.message },
        });
      } else {
        logResult({
          test: 'Validation - Invalid Guest Count',
          status: 'FAIL',
          message: 'Unexpected error response',
          data: error.response?.data,
        });
      }
    }

    // Step 8: Test authentication requirement
    console.log('🔐 Step 8: Test authentication requirement...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkIn = tomorrow.toISOString().split('T')[0];

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
      const checkOut = dayAfterTomorrow.toISOString().split('T')[0];

      await axios.post(`${API_BASE_URL}/bookings`, {
        hotel_id: hotelId,
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        guests: {
          adults: 2,
          children: 0,
        },
        guest_details: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+855123456789',
        },
      });
      // No Authorization header

      logResult({
        test: 'Authentication Required',
        status: 'FAIL',
        message: 'Should have required authentication',
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        logResult({
          test: 'Authentication Required',
          status: 'PASS',
          message: 'Correctly required authentication',
          data: { error: error.response.data.error.message },
        });
      } else {
        logResult({
          test: 'Authentication Required',
          status: 'FAIL',
          message: 'Unexpected error response',
          data: error.response?.data,
        });
      }
    }

    // Summary
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary\n');
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
    console.log('');

    if (failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
    }
  } catch (error: any) {
    console.error('❌ Unexpected error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
testBookingCreation();
