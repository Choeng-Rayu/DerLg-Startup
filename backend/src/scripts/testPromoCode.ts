/**
 * Test script for promo code application
 * 
 * This script tests the promo code system by:
 * 1. Registering a test user
 * 2. Creating a booking
 * 3. Creating a test promo code directly in database
 * 4. Applying the promo code via API
 * 5. Verifying the discount is applied correctly
 * 
 * Run with: npx ts-node src/scripts/testPromoCode.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { PromoCode } from '../models';
import { DiscountType, ApplicableTo, PromoUserType } from '../models/PromoCode';

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
let bookingId: string;

async function testPromoCode() {
  console.log('🧪 Testing Promo Code Application\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Connect to database for direct promo code creation
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Step 1: Register a test user
    console.log('📝 Step 1: Register test user...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: `promo_test_${Date.now()}@test.com`,
        password: 'Test123!@#',
        first_name: 'Promo',
        last_name: 'Tester',
        phone: `+85512345${Math.floor(Math.random() * 10000)}`,
        user_type: 'tourist',
      });

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
          message: 'No hotels available. Please seed hotels first using: npm run seed:hotels',
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

    // Step 3: Get available rooms
    console.log('🛏️  Step 3: Get available rooms...');
    try {
      const roomsResponse = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`);
      const rooms = roomsResponse.data.data.hotel.rooms;

      if (!rooms || rooms.length === 0) {
        logResult({
          test: 'Get Rooms',
          status: 'FAIL',
          message: 'No rooms available for the selected hotel',
        });
        return;
      }

      roomId = rooms[0].id;
      logResult({
        test: 'Get Rooms',
        status: 'PASS',
        message: `Found ${rooms.length} rooms`,
        data: { roomId, roomType: rooms[0].room_type },
      });
    } catch (error: any) {
      logResult({
        test: 'Get Rooms',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      return;
    }

    // Step 4: Create a booking
    console.log('📅 Step 4: Create a booking...');
    try {
      const checkIn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const checkOut = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

      const bookingResponse = await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          hotel_id: hotelId,
          room_id: roomId,
          check_in: checkIn.toISOString().split('T')[0],
          check_out: checkOut.toISOString().split('T')[0],
          guests: {
            adults: 2,
            children: 0,
          },
          guest_details: {
            name: 'Promo Tester',
            email: 'promo.test@example.com',
            phone: '+855123456789',
            special_requests: 'Testing promo code',
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

      bookingId = bookingResponse.data.data.booking.id;
      const originalTotal = bookingResponse.data.data.booking.pricing.total;

      logResult({
        test: 'Create Booking',
        status: 'PASS',
        message: 'Booking created successfully',
        data: {
          bookingId,
          bookingNumber: bookingResponse.data.data.booking.booking_number,
          originalTotal: `$${originalTotal}`,
        },
      });
    } catch (error: any) {
      logResult({
        test: 'Create Booking',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      return;
    }

    // Step 5: Create promo codes directly in database
    console.log('🎟️  Step 5: Create test promo codes...');
    try {
      // Clean up existing test promo codes
      await PromoCode.destroy({ where: { code: 'TESTPROMO10' } });

      // Create a 10% discount promo code
      await PromoCode.create({
        code: 'TESTPROMO10',
        description: '10% discount on all bookings',
        discount_type: DiscountType.PERCENTAGE,
        discount_value: 10,
        min_booking_amount: 0,
        max_discount: null,
        valid_from: new Date(Date.now() - 24 * 60 * 60 * 1000),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage_limit: 100,
        usage_count: 0,
        applicable_to: ApplicableTo.ALL,
        applicable_ids: [],
        user_type: PromoUserType.ALL,
        is_active: true,
        created_by: userId,
      });

      logResult({
        test: 'Create Promo Code',
        status: 'PASS',
        message: 'Test promo code created: TESTPROMO10 (10% off)',
      });
    } catch (error: any) {
      logResult({
        test: 'Create Promo Code',
        status: 'FAIL',
        message: error.message,
      });
      return;
    }

    // Step 6: Apply promo code to booking
    console.log('💰 Step 6: Apply promo code to booking...');
    try {
      const applyPromoResponse = await axios.post(
        `${API_BASE_URL}/bookings/${bookingId}/promo-code`,
        {
          promo_code: 'TESTPROMO10',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const promoDetails = applyPromoResponse.data.data.promo_code_details;

      logResult({
        test: 'Apply Promo Code',
        status: 'PASS',
        message: applyPromoResponse.data.message,
        data: {
          code: promoDetails.code,
          discountApplied: `$${promoDetails.discount_applied}`,
          savings: `$${promoDetails.savings}`,
          oldTotal: `$${promoDetails.old_total}`,
          newTotal: `$${promoDetails.new_total}`,
        },
      });

      // Verify the discount was applied correctly
      const expectedDiscount = promoDetails.old_total * 0.1;
      const actualDiscount = promoDetails.discount_applied;
      
      if (Math.abs(expectedDiscount - actualDiscount) < 0.01) {
        logResult({
          test: 'Verify Discount Calculation',
          status: 'PASS',
          message: 'Discount calculated correctly (10% of subtotal)',
          data: {
            expected: `$${expectedDiscount.toFixed(2)}`,
            actual: `$${actualDiscount.toFixed(2)}`,
          },
        });
      } else {
        logResult({
          test: 'Verify Discount Calculation',
          status: 'FAIL',
          message: 'Discount calculation mismatch',
          data: {
            expected: `$${expectedDiscount.toFixed(2)}`,
            actual: `$${actualDiscount.toFixed(2)}`,
          },
        });
      }
    } catch (error: any) {
      logResult({
        test: 'Apply Promo Code',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
        data: error.response?.data,
      });
      return;
    }

    // Step 7: Test invalid promo code
    console.log('❌ Step 7: Test invalid promo code...');
    try {
      await axios.post(
        `${API_BASE_URL}/bookings/${bookingId}/promo-code`,
        {
          promo_code: 'INVALIDCODE',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      logResult({
        test: 'Invalid Promo Code',
        status: 'FAIL',
        message: 'Should have rejected invalid promo code',
      });
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error?.message === 'Invalid promo code') {
        logResult({
          test: 'Invalid Promo Code',
          status: 'PASS',
          message: 'Invalid promo code correctly rejected',
        });
      } else {
        logResult({
          test: 'Invalid Promo Code',
          status: 'FAIL',
          message: 'Unexpected error response',
          data: error.response?.data,
        });
      }
    }

    // Clean up test promo code
    await PromoCode.destroy({ where: { code: 'TESTPROMO10' } });

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary\n');
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('');

    if (failed === 0) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Unexpected error during testing:', error.message);
    process.exit(1);
  }
}

// Run the test
testPromoCode();
