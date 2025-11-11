import axios from 'axios';
import logger from '../utils/logger';

const API_URL = 'http://localhost:5000/api';

/**
 * Test script for Hotel Admin Profile Management
 * Tests GET and PUT /api/hotel/profile endpoints
 */

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

// Test credentials
let adminToken: string;

/**
 * Helper function to log test results
 */
function logResult(result: TestResult) {
  results.push(result);
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  logger.info(`${status}: ${result.test}`);
  if (result.message) {
    logger.info(`  Message: ${result.message}`);
  }
  if (result.data) {
    logger.info(`  Data: ${JSON.stringify(result.data, null, 2)}`);
  }
}

/**
 * Test 1: Login as hotel admin
 */
async function testAdminLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@hotel.com',
      password: 'Admin123!',
    });

    if (response.data.success && response.data.data.accessToken) {
      adminToken = response.data.data.accessToken;
      logResult({
        test: 'Admin Login',
        passed: true,
        message: 'Successfully logged in as hotel admin',
        data: { userId: response.data.data.user.id },
      });
      return true;
    } else {
      logResult({
        test: 'Admin Login',
        passed: false,
        message: 'Login response missing token',
      });
      return false;
    }
  } catch (error: any) {
    logResult({
      test: 'Admin Login',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Test 2: Get hotel profile (GET /api/hotel/profile)
 */
async function testGetHotelProfile() {
  try {
    const response = await axios.get(`${API_URL}/hotel/profile`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success && response.data.data.hotel) {
      logResult({
        test: 'Get Hotel Profile',
        passed: true,
        message: 'Successfully retrieved hotel profile',
        data: {
          hotelId: response.data.data.hotel.id,
          name: response.data.data.hotel.name,
          status: response.data.data.hotel.status,
        },
      });
      return true;
    } else {
      logResult({
        test: 'Get Hotel Profile',
        passed: false,
        message: 'Response missing hotel data',
      });
      return false;
    }
  } catch (error: any) {
    logResult({
      test: 'Get Hotel Profile',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Test 3: Update hotel profile - name and description
 */
async function testUpdateHotelBasicInfo() {
  try {
    const updateData = {
      name: 'Updated Hotel Name',
      description: 'This is an updated description for the hotel with more details.',
    };

    const response = await axios.put(`${API_URL}/hotel/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success && response.data.data.hotel) {
      const hotel = response.data.data.hotel;
      const nameMatches = hotel.name === updateData.name;
      const descMatches = hotel.description === updateData.description;

      logResult({
        test: 'Update Hotel Basic Info',
        passed: nameMatches && descMatches,
        message: nameMatches && descMatches
          ? 'Successfully updated hotel name and description'
          : 'Updated data does not match',
        data: {
          name: hotel.name,
          description: hotel.description.substring(0, 50) + '...',
        },
      });
      return nameMatches && descMatches;
    } else {
      logResult({
        test: 'Update Hotel Basic Info',
        passed: false,
        message: 'Response missing hotel data',
      });
      return false;
    }
  } catch (error: any) {
    logResult({
      test: 'Update Hotel Basic Info',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Test 4: Update hotel contact information
 */
async function testUpdateHotelContact() {
  try {
    const updateData = {
      contact: {
        phone: '+855-12-345-678',
        email: 'updated@hotel.com',
        website: 'https://updatedhotel.com',
      },
    };

    const response = await axios.put(`${API_URL}/hotel/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success && response.data.data.hotel) {
      const hotel = response.data.data.hotel;
      const contactMatches =
        hotel.contact.phone === updateData.contact.phone &&
        hotel.contact.email === updateData.contact.email;

      logResult({
        test: 'Update Hotel Contact',
        passed: contactMatches,
        message: contactMatches
          ? 'Successfully updated hotel contact information'
          : 'Updated contact does not match',
        data: hotel.contact,
      });
      return contactMatches;
    } else {
      logResult({
        test: 'Update Hotel Contact',
        passed: false,
        message: 'Response missing hotel data',
      });
      return false;
    }
  } catch (error: any) {
    logResult({
      test: 'Update Hotel Contact',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Test 5: Update hotel amenities
 */
async function testUpdateHotelAmenities() {
  try {
    const updateData = {
      amenities: ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'spa'],
    };

    const response = await axios.put(`${API_URL}/hotel/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success && response.data.data.hotel) {
      const hotel = response.data.data.hotel;
      const amenitiesMatch =
        JSON.stringify(hotel.amenities.sort()) ===
        JSON.stringify(updateData.amenities.sort());

      logResult({
        test: 'Update Hotel Amenities',
        passed: amenitiesMatch,
        message: amenitiesMatch
          ? 'Successfully updated hotel amenities'
          : 'Updated amenities do not match',
        data: { amenities: hotel.amenities },
      });
      return amenitiesMatch;
    } else {
      logResult({
        test: 'Update Hotel Amenities',
        passed: false,
        message: 'Response missing hotel data',
      });
      return false;
    }
  } catch (error: any) {
    logResult({
      test: 'Update Hotel Amenities',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Test 6: Update hotel star rating
 */
async function testUpdateHotelStarRating() {
  try {
    const updateData = {
      star_rating: 5,
    };

    const response = await axios.put(`${API_URL}/hotel/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success && response.data.data.hotel) {
      const hotel = response.data.data.hotel;
      const ratingMatches = hotel.star_rating === updateData.star_rating;

      logResult({
        test: 'Update Hotel Star Rating',
        passed: ratingMatches,
        message: ratingMatches
          ? 'Successfully updated hotel star rating'
          : 'Updated star rating does not match',
        data: { star_rating: hotel.star_rating },
      });
      return ratingMatches;
    } else {
      logResult({
        test: 'Update Hotel Star Rating',
        passed: false,
        message: 'Response missing hotel data',
      });
      return false;
    }
  } catch (error: any) {
    logResult({
      test: 'Update Hotel Star Rating',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Test 7: Validation - Invalid name (too short)
 */
async function testValidationInvalidName() {
  try {
    const updateData = {
      name: 'A', // Too short
    };

    const response = await axios.put(`${API_URL}/hotel/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    // Should not reach here
    logResult({
      test: 'Validation - Invalid Name',
      passed: false,
      message: 'Expected validation error but request succeeded',
    });
    return false;
  } catch (error: any) {
    const isValidationError =
      error.response?.status === 400 &&
      error.response?.data?.error?.message?.includes('name');

    logResult({
      test: 'Validation - Invalid Name',
      passed: isValidationError,
      message: isValidationError
        ? 'Correctly rejected invalid name'
        : 'Did not return expected validation error',
      data: { error: error.response?.data?.error?.message },
    });
    return isValidationError;
  }
}

/**
 * Test 8: Validation - Invalid email in contact
 */
async function testValidationInvalidEmail() {
  try {
    const updateData = {
      contact: {
        phone: '+855-12-345-678',
        email: 'invalid-email', // Invalid email format
      },
    };

    const response = await axios.put(`${API_URL}/hotel/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    // Should not reach here
    logResult({
      test: 'Validation - Invalid Email',
      passed: false,
      message: 'Expected validation error but request succeeded',
    });
    return false;
  } catch (error: any) {
    const isValidationError =
      error.response?.status === 400 &&
      error.response?.data?.error?.message?.includes('email');

    logResult({
      test: 'Validation - Invalid Email',
      passed: isValidationError,
      message: isValidationError
        ? 'Correctly rejected invalid email'
        : 'Did not return expected validation error',
      data: { error: error.response?.data?.error?.message },
    });
    return isValidationError;
  }
}

/**
 * Test 9: Authorization - Access without token
 */
async function testAuthorizationNoToken() {
  try {
    const response = await axios.get(`${API_URL}/hotel/profile`);

    // Should not reach here
    logResult({
      test: 'Authorization - No Token',
      passed: false,
      message: 'Expected authorization error but request succeeded',
    });
    return false;
  } catch (error: any) {
    const isAuthError = error.response?.status === 401;

    logResult({
      test: 'Authorization - No Token',
      passed: isAuthError,
      message: isAuthError
        ? 'Correctly rejected request without token'
        : 'Did not return expected authorization error',
      data: { status: error.response?.status },
    });
    return isAuthError;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  logger.info('='.repeat(60));
  logger.info('Starting Hotel Admin Profile Management Tests');
  logger.info('='.repeat(60));

  // Test 1: Login
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    logger.error('Cannot proceed without admin login. Please ensure:');
    logger.error('1. Server is running on http://localhost:5000');
    logger.error('2. Database is set up with hotel admin user');
    logger.error('3. Admin credentials: admin@hotel.com / Admin123!');
    return;
  }

  // Test 2-6: Profile operations
  await testGetHotelProfile();
  await testUpdateHotelBasicInfo();
  await testUpdateHotelContact();
  await testUpdateHotelAmenities();
  await testUpdateHotelStarRating();

  // Test 7-8: Validation
  await testValidationInvalidName();
  await testValidationInvalidEmail();

  // Test 9: Authorization
  await testAuthorizationNoToken();

  // Summary
  logger.info('='.repeat(60));
  logger.info('Test Summary');
  logger.info('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  logger.info(`Total Tests: ${total}`);
  logger.info(`Passed: ${passed} ✅`);
  logger.info(`Failed: ${failed} ❌`);
  logger.info(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);

  if (failed > 0) {
    logger.info('\nFailed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        logger.info(`  - ${r.test}: ${r.message}`);
      });
  }

  logger.info('='.repeat(60));
}

// Run tests
runTests().catch((error) => {
  logger.error('Test execution failed:', error);
  process.exit(1);
});
