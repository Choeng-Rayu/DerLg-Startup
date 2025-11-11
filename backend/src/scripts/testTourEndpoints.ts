import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './src/.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (message: string) => console.log(`${colors.green}✓ ${message}${colors.reset}`),
  error: (message: string) => console.log(`${colors.red}✗ ${message}${colors.reset}`),
  info: (message: string) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`),
  section: (message: string) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${message}\n${'='.repeat(60)}${colors.reset}\n`),
};

// Test data
let authToken: string = '';
let testTourId: string = '';

/**
 * Test 1: User Login (to get auth token)
 */
async function testLogin() {
  log.section('TEST 1: User Login');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'tourist@example.com',
      password: 'Password123',
    });

    if (response.data.success && response.data.data.accessToken) {
      authToken = response.data.data.accessToken;
      log.success('Login successful');
      log.info(`Auth token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      log.error('Login failed: No access token received');
      return false;
    }
  } catch (error: any) {
    log.error(`Login failed: ${error.response?.data?.error?.message || error.message}`);
    log.info('Note: Make sure you have a test user created. Run: npm run test:user');
    return false;
  }
}

/**
 * Test 2: Get All Tours (Public)
 */
async function testGetAllTours() {
  log.section('TEST 2: Get All Tours (Public)');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/tours`);

    if (response.data.success && response.data.data.tours) {
      const tours = response.data.data.tours;
      log.success(`Retrieved ${tours.length} tours`);
      
      if (tours.length > 0) {
        testTourId = tours[0].id;
        log.info(`First tour: ${tours[0].name}`);
        log.info(`Destination: ${tours[0].destination}`);
        log.info(`Price per person: $${tours[0].price_per_person}`);
        log.info(`Duration: ${tours[0].duration.days} days, ${tours[0].duration.nights} nights`);
        log.info(`Difficulty: ${tours[0].difficulty}`);
        log.info(`Test tour ID saved: ${testTourId}`);
      } else {
        log.info('No tours found. You may need to seed tour data.');
      }
      
      return true;
    } else {
      log.error('Failed to retrieve tours');
      return false;
    }
  } catch (error: any) {
    log.error(`Get tours failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 3: Get Tours with Filters
 */
async function testGetToursWithFilters() {
  log.section('TEST 3: Get Tours with Filters');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/tours`, {
      params: {
        destination: 'Siem Reap',
        difficulty: 'easy',
        min_price: 50,
        max_price: 200,
        sort_by: 'price_asc',
        limit: 10,
      },
    });

    if (response.data.success && response.data.data.tours) {
      const tours = response.data.data.tours;
      log.success(`Retrieved ${tours.length} filtered tours`);
      log.info(`Filters applied: destination=Siem Reap, difficulty=easy, price=$50-$200`);
      
      if (tours.length > 0) {
        log.info(`First filtered tour: ${tours[0].name} - $${tours[0].price_per_person}`);
      }
      
      return true;
    } else {
      log.error('Failed to retrieve filtered tours');
      return false;
    }
  } catch (error: any) {
    log.error(`Get filtered tours failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 4: Get Tour by ID (Public)
 */
async function testGetTourById() {
  log.section('TEST 4: Get Tour by ID (Public)');
  
  if (!testTourId) {
    log.error('No test tour ID available. Skipping test.');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/tours/${testTourId}`);

    if (response.data.success && response.data.data.tour) {
      const tour = response.data.data.tour;
      log.success('Tour details retrieved successfully');
      log.info(`Tour: ${tour.name}`);
      log.info(`Destination: ${tour.destination}`);
      log.info(`Duration: ${tour.duration.days} days, ${tour.duration.nights} nights`);
      log.info(`Price per person: $${tour.price_per_person}`);
      log.info(`Group size: ${tour.group_size.min}-${tour.group_size.max} people`);
      log.info(`Difficulty: ${tour.difficulty}`);
      log.info(`Categories: ${tour.category.join(', ')}`);
      log.info(`Guide required: ${tour.guide_required}`);
      log.info(`Transportation required: ${tour.transportation_required}`);
      log.info(`Meeting point: ${tour.meeting_point.address}`);
      log.info(`Inclusions: ${tour.inclusions.length} items`);
      log.info(`Exclusions: ${tour.exclusions.length} items`);
      log.info(`Itinerary: ${tour.itinerary.length} days`);
      
      return true;
    } else {
      log.error('Failed to retrieve tour details');
      return false;
    }
  } catch (error: any) {
    log.error(`Get tour by ID failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 5: Create Tour Booking (Authenticated)
 */
async function testCreateTourBooking() {
  log.section('TEST 5: Create Tour Booking (Authenticated)');
  
  if (!authToken) {
    log.error('No auth token available. Skipping test.');
    return false;
  }
  
  if (!testTourId) {
    log.error('No test tour ID available. Skipping test.');
    return false;
  }
  
  try {
    // Calculate tour date (7 days from now)
    const tourDate = new Date();
    tourDate.setDate(tourDate.getDate() + 7);
    const tourDateStr = tourDate.toISOString().split('T')[0];
    
    const response = await axios.post(
      `${API_BASE_URL}/tours/bookings`,
      {
        tour_id: testTourId,
        tour_date: tourDateStr,
        participants: 2,
        guest_details: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          special_requests: 'Vegetarian meals preferred',
        },
        payment_method: 'paypal',
        payment_type: 'deposit',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success && response.data.data.booking) {
      const booking = response.data.data.booking;
      log.success('Tour booking created successfully');
      log.info(`Booking number: ${booking.booking_number}`);
      log.info(`Tour: ${booking.tour.name}`);
      log.info(`Destination: ${booking.tour.destination}`);
      log.info(`Tour date: ${booking.tour_date}`);
      log.info(`Duration: ${booking.tour.duration.days} days`);
      log.info(`Participants: ${booking.participants}`);
      log.info(`Total price: $${booking.pricing.total}`);
      log.info(`Payment status: ${booking.payment.status}`);
      log.info(`Booking status: ${booking.status}`);
      log.info(`Meeting point: ${booking.tour.meeting_point.address}`);
      
      return true;
    } else {
      log.error('Failed to create tour booking');
      return false;
    }
  } catch (error: any) {
    log.error(`Create tour booking failed: ${error.response?.data?.error?.message || error.message}`);
    if (error.response?.data?.error?.details) {
      log.info(`Details: ${JSON.stringify(error.response.data.error.details, null, 2)}`);
    }
    return false;
  }
}

/**
 * Test 6: Create Tour Booking with Invalid Group Size
 */
async function testCreateTourBookingInvalidGroupSize() {
  log.section('TEST 6: Create Tour Booking with Invalid Group Size (Should Fail)');
  
  if (!authToken) {
    log.error('No auth token available. Skipping test.');
    return false;
  }
  
  if (!testTourId) {
    log.error('No test tour ID available. Skipping test.');
    return false;
  }
  
  try {
    const tourDate = new Date();
    tourDate.setDate(tourDate.getDate() + 7);
    const tourDateStr = tourDate.toISOString().split('T')[0];
    
    await axios.post(
      `${API_BASE_URL}/tours/bookings`,
      {
        tour_id: testTourId,
        tour_date: tourDateStr,
        participants: 100, // Invalid group size
        guest_details: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
        },
        payment_method: 'paypal',
        payment_type: 'deposit',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    log.error('Booking should have failed with invalid group size');
    return false;
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'INVALID_GROUP_SIZE') {
      log.success('Correctly rejected booking with invalid group size');
      log.info(`Error message: ${error.response.data.error.message}`);
      return true;
    } else {
      log.error(`Unexpected error: ${error.response?.data?.error?.message || error.message}`);
      return false;
    }
  }
}

/**
 * Test 7: Create Tour Booking with Past Date
 */
async function testCreateTourBookingPastDate() {
  log.section('TEST 7: Create Tour Booking with Past Date (Should Fail)');
  
  if (!authToken) {
    log.error('No auth token available. Skipping test.');
    return false;
  }
  
  if (!testTourId) {
    log.error('No test tour ID available. Skipping test.');
    return false;
  }
  
  try {
    await axios.post(
      `${API_BASE_URL}/tours/bookings`,
      {
        tour_id: testTourId,
        tour_date: '2020-01-01', // Past date
        participants: 2,
        guest_details: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
        },
        payment_method: 'paypal',
        payment_type: 'deposit',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    log.error('Booking should have failed with past date');
    return false;
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'INVALID_TOUR_DATE') {
      log.success('Correctly rejected booking with past date');
      log.info(`Error message: ${error.response.data.error.message}`);
      return true;
    } else {
      log.error(`Unexpected error: ${error.response?.data?.error?.message || error.message}`);
      return false;
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.yellow}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           DerLg Tourism Platform - Tour API Tests          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.info(`API Base URL: ${API_BASE_URL}`);
  log.info(`Starting tests at: ${new Date().toLocaleString()}\n`);

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  const tests = [
    { name: 'User Login', fn: testLogin },
    { name: 'Get All Tours', fn: testGetAllTours },
    { name: 'Get Tours with Filters', fn: testGetToursWithFilters },
    { name: 'Get Tour by ID', fn: testGetTourById },
    { name: 'Create Tour Booking', fn: testCreateTourBooking },
    { name: 'Invalid Group Size', fn: testCreateTourBookingInvalidGroupSize },
    { name: 'Past Date Booking', fn: testCreateTourBookingPastDate },
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Summary
  log.section('TEST SUMMARY');
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  if (results.failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.error(`${results.failed} test(s) failed. Please review the errors above.`);
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
