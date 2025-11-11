/**
 * Test script for hotel detail and availability endpoints
 * Tests Requirements: 2.5, 29.1, 29.3
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Helper function to add test result
 */
function addResult(test: string, passed: boolean, message: string, data?: any) {
  results.push({ test, passed, message, data });
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${test}: ${message}`);
  if (data && !passed) {
    console.log('  Data:', JSON.stringify(data, null, 2));
  }
}

/**
 * Test 1: Get hotel by ID with full details
 * Requirement 2.5: Display comprehensive hotel information
 */
async function testGetHotelById(hotelId: string) {
  console.log('\n--- Test 1: Get Hotel by ID ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`);
    
    if (response.data.success && response.data.data.hotel) {
      const hotel = response.data.data.hotel;
      
      // Verify hotel has required fields
      const hasRequiredFields = 
        hotel.id &&
        hotel.name &&
        hotel.description &&
        hotel.location &&
        hotel.contact &&
        Array.isArray(hotel.amenities) &&
        Array.isArray(hotel.images);
      
      // Verify rooms are included
      const hasRooms = Array.isArray(hotel.rooms);
      
      // Verify reviews are included
      const hasReviews = Array.isArray(hotel.reviews);
      
      // Verify pricing information
      const hasPricing = hotel.rooms && hotel.rooms.length > 0 && 
        hotel.rooms[0].pricing &&
        typeof hotel.rooms[0].pricing.base_price === 'number' &&
        typeof hotel.rooms[0].pricing.final_price === 'number';
      
      // Verify starting price
      const hasStartingPrice = typeof hotel.starting_price === 'number';
      
      if (hasRequiredFields && hasRooms && hasReviews && hasPricing && hasStartingPrice) {
        addResult(
          'Get Hotel by ID',
          true,
          `Successfully retrieved hotel with ${hotel.rooms.length} rooms and ${hotel.reviews.length} reviews`,
          {
            hotelName: hotel.name,
            roomCount: hotel.rooms.length,
            reviewCount: hotel.reviews.length,
            startingPrice: hotel.starting_price,
          }
        );
        return hotel;
      } else {
        addResult(
          'Get Hotel by ID',
          false,
          'Hotel data missing required fields',
          {
            hasRequiredFields,
            hasRooms,
            hasReviews,
            hasPricing,
            hasStartingPrice,
          }
        );
      }
    } else {
      addResult('Get Hotel by ID', false, 'Invalid response structure', response.data);
    }
  } catch (error: any) {
    addResult(
      'Get Hotel by ID',
      false,
      `Error: ${error.response?.data?.error?.message || error.message}`,
      error.response?.data
    );
  }
  return null;
}

/**
 * Test 2: Check hotel availability for date range
 * Requirements 29.1, 29.3: Real-time availability calculation
 */
async function testCheckAvailability(hotelId: string) {
  console.log('\n--- Test 2: Check Hotel Availability ---');
  
  // Test with valid date range
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7); // 7 days from now
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3); // 3 nights
  
  const checkInStr = checkIn.toISOString().split('T')[0];
  const checkOutStr = checkOut.toISOString().split('T')[0];
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/hotels/${hotelId}/availability`,
      {
        params: {
          checkIn: checkInStr,
          checkOut: checkOutStr,
          guests: 2,
        },
      }
    );
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      
      // Verify response structure
      const hasRequiredFields =
        data.hotel &&
        data.checkIn &&
        data.checkOut &&
        typeof data.nights === 'number' &&
        Array.isArray(data.availableRooms);
      
      // Verify room availability data
      const hasAvailabilityData = data.availableRooms.length === 0 || (
        data.availableRooms[0].available_count !== undefined &&
        data.availableRooms[0].is_available !== undefined &&
        data.availableRooms[0].pricing &&
        typeof data.availableRooms[0].pricing.total === 'number'
      );
      
      if (hasRequiredFields && hasAvailabilityData) {
        addResult(
          'Check Availability',
          true,
          `Found ${data.availableRooms.length} available rooms for ${data.nights} nights`,
          {
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            nights: data.nights,
            availableRoomsCount: data.availableRooms.length,
            totalRoomsChecked: data.totalRoomsChecked,
          }
        );
      } else {
        addResult(
          'Check Availability',
          false,
          'Availability data missing required fields',
          { hasRequiredFields, hasAvailabilityData }
        );
      }
    } else {
      addResult('Check Availability', false, 'Invalid response structure', response.data);
    }
  } catch (error: any) {
    addResult(
      'Check Availability',
      false,
      `Error: ${error.response?.data?.error?.message || error.message}`,
      error.response?.data
    );
  }
}

/**
 * Test 3: Validate date range checking
 * Requirement 29.1: Date validation
 */
async function testDateValidation(hotelId: string) {
  console.log('\n--- Test 3: Date Validation ---');
  
  // Test 3a: Past check-in date
  try {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    await axios.get(`${API_BASE_URL}/hotels/${hotelId}/availability`, {
      params: {
        checkIn: pastDateStr,
        checkOut: futureDateStr,
      },
    });
    
    addResult('Date Validation - Past Date', false, 'Should reject past check-in date');
  } catch (error: any) {
    if (error.response?.data?.error?.code === 'INVALID_DATE') {
      addResult('Date Validation - Past Date', true, 'Correctly rejected past check-in date');
    } else {
      addResult('Date Validation - Past Date', false, 'Wrong error for past date', error.response?.data);
    }
  }
  
  // Test 3b: Check-out before check-in
  try {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() - 1); // Before check-in
    
    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];
    
    await axios.get(`${API_BASE_URL}/hotels/${hotelId}/availability`, {
      params: {
        checkIn: checkInStr,
        checkOut: checkOutStr,
      },
    });
    
    addResult('Date Validation - Invalid Range', false, 'Should reject check-out before check-in');
  } catch (error: any) {
    if (error.response?.data?.error?.code === 'INVALID_DATE') {
      addResult('Date Validation - Invalid Range', true, 'Correctly rejected invalid date range');
    } else {
      addResult('Date Validation - Invalid Range', false, 'Wrong error for invalid range', error.response?.data);
    }
  }
  
  // Test 3c: Missing required parameters
  try {
    await axios.get(`${API_BASE_URL}/hotels/${hotelId}/availability`);
    
    addResult('Date Validation - Missing Params', false, 'Should require check-in and check-out dates');
  } catch (error: any) {
    if (error.response?.data?.error?.code === 'MISSING_PARAMETERS') {
      addResult('Date Validation - Missing Params', true, 'Correctly rejected missing parameters');
    } else {
      addResult('Date Validation - Missing Params', false, 'Wrong error for missing params', error.response?.data);
    }
  }
}

/**
 * Test 4: Verify pricing calculations
 * Requirement 29.3: Accurate pricing with discounts
 */
async function testPricingCalculations(hotelId: string) {
  console.log('\n--- Test 4: Pricing Calculations ---');
  
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2); // 2 nights
  
  const checkInStr = checkIn.toISOString().split('T')[0];
  const checkOutStr = checkOut.toISOString().split('T')[0];
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/hotels/${hotelId}/availability`,
      {
        params: {
          checkIn: checkInStr,
          checkOut: checkOutStr,
        },
      }
    );
    
    if (response.data.success && response.data.data.availableRooms.length > 0) {
      const room = response.data.data.availableRooms[0];
      const pricing = room.pricing;
      
      // Verify pricing calculations
      const expectedDiscountAmount = (pricing.base_price * room.discount_percentage) / 100;
      const expectedFinalPrice = pricing.base_price - expectedDiscountAmount;
      const expectedTotal = expectedFinalPrice * pricing.nights;
      
      const discountCorrect = Math.abs(pricing.discount_amount - expectedDiscountAmount) < 0.01;
      const finalPriceCorrect = Math.abs(pricing.final_price - expectedFinalPrice) < 0.01;
      const totalCorrect = Math.abs(pricing.total - expectedTotal) < 0.01;
      
      if (discountCorrect && finalPriceCorrect && totalCorrect) {
        addResult(
          'Pricing Calculations',
          true,
          'All pricing calculations are correct',
          {
            basePrice: pricing.base_price,
            discountPercentage: room.discount_percentage,
            discountAmount: pricing.discount_amount,
            finalPrice: pricing.final_price,
            nights: pricing.nights,
            total: pricing.total,
          }
        );
      } else {
        addResult(
          'Pricing Calculations',
          false,
          'Pricing calculations are incorrect',
          {
            discountCorrect,
            finalPriceCorrect,
            totalCorrect,
            expected: { expectedDiscountAmount, expectedFinalPrice, expectedTotal },
            actual: pricing,
          }
        );
      }
    } else {
      addResult('Pricing Calculations', false, 'No available rooms to test pricing');
    }
  } catch (error: any) {
    addResult(
      'Pricing Calculations',
      false,
      `Error: ${error.response?.data?.error?.message || error.message}`,
      error.response?.data
    );
  }
}

/**
 * Test 5: Verify review data in hotel details
 * Requirement 2.5: Include reviews in hotel details
 */
async function testReviewData(hotelId: string) {
  console.log('\n--- Test 5: Review Data ---');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`);
    
    if (response.data.success && response.data.data.hotel) {
      const hotel = response.data.data.hotel;
      
      if (Array.isArray(hotel.reviews)) {
        if (hotel.reviews.length > 0) {
          const review = hotel.reviews[0];
          
          // Verify review structure
          const hasRequiredFields =
            review.id &&
            review.ratings &&
            review.comment &&
            review.created_at;
          
          // Verify user data is included
          const hasUserData = review.user && review.user.first_name;
          
          // Verify ratings structure
          const hasRatings =
            review.ratings.overall &&
            review.ratings.cleanliness &&
            review.ratings.service &&
            review.ratings.location &&
            review.ratings.value;
          
          if (hasRequiredFields && hasUserData && hasRatings) {
            addResult(
              'Review Data',
              true,
              `Hotel has ${hotel.reviews.length} reviews with complete data`,
              {
                reviewCount: hotel.reviews.length,
                sampleReview: {
                  userName: `${review.user.first_name} ${review.user.last_name}`,
                  overallRating: review.ratings.overall,
                  isVerified: review.is_verified,
                },
              }
            );
          } else {
            addResult(
              'Review Data',
              false,
              'Review data missing required fields',
              { hasRequiredFields, hasUserData, hasRatings }
            );
          }
        } else {
          addResult('Review Data', true, 'Hotel has no reviews yet (valid state)');
        }
      } else {
        addResult('Review Data', false, 'Reviews field is not an array');
      }
    } else {
      addResult('Review Data', false, 'Invalid response structure', response.data);
    }
  } catch (error: any) {
    addResult(
      'Review Data',
      false,
      `Error: ${error.response?.data?.error?.message || error.message}`,
      error.response?.data
    );
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('Hotel Detail and Availability Endpoints Test');
  console.log('Testing Requirements: 2.5, 29.1, 29.3');
  console.log('='.repeat(60));
  
  // First, get a list of hotels to test with
  try {
    const hotelsResponse = await axios.get(`${API_BASE_URL}/hotels`);
    
    if (!hotelsResponse.data.success || !hotelsResponse.data.data.hotels.length) {
      console.error('\n❌ No hotels found in database. Please run seedHotels script first.');
      process.exit(1);
    }
    
    const hotelId = hotelsResponse.data.data.hotels[0].id;
    console.log(`\nUsing hotel ID: ${hotelId}`);
    
    // Run all tests
    await testGetHotelById(hotelId);
    await testCheckAvailability(hotelId);
    await testDateValidation(hotelId);
    await testPricingCalculations(hotelId);
    await testReviewData(hotelId);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✓`);
    console.log(`Failed: ${failed} ✗`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  - ${r.test}: ${r.message}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('\n❌ Failed to connect to API:', error.message);
    console.error('Make sure the backend server is running on http://localhost:3000');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
