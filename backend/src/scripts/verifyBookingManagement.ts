/**
 * Verification script for booking management endpoints
 * This script verifies that all required functions and routes are properly defined
 */

console.log('='.repeat(60));
console.log('BOOKING MANAGEMENT ENDPOINTS VERIFICATION');
console.log('='.repeat(60));

let allPassed = true;

// Verify controller functions exist
console.log('\n=== Verifying Controller Functions ===');
try {
  const controller = require('../controllers/booking.controller');

  const requiredFunctions = [
    'createBooking',
    'getPaymentOptions',
    'getUserBookings',
    'getBookingById',
    'updateBooking',
    'cancelBooking',
  ];

  for (const funcName of requiredFunctions) {
    if (typeof controller[funcName] === 'function') {
      console.log(`✓ ${funcName} exists`);
    } else {
      console.log(`✗ ${funcName} is missing or not a function`);
      allPassed = false;
    }
  }
} catch (error: any) {
  console.error('✗ Failed to load booking controller:', error.message);
  allPassed = false;
}

// Verify routes are defined
console.log('\n=== Verifying Routes ===');
try {
  const routes = require('../routes/booking.routes');

  if (routes.default && typeof routes.default === 'function') {
    console.log('✓ Booking routes module loaded successfully');

    // Check if it's a Router instance
    const router = routes.default;
    if (router.stack) {
      console.log(`✓ Router has ${router.stack.length} route handlers`);

      // List all routes
      console.log('\nRegistered routes:');
      router.stack.forEach((layer: any) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          console.log(`  ${methods} ${layer.route.path}`);
        }
      });
    }
  } else {
    console.log('✗ Booking routes module not properly exported');
    allPassed = false;
  }
} catch (error: any) {
  console.error('✗ Failed to load booking routes:', error.message);
  allPassed = false;
}

// Verify Booking model methods
console.log('\n=== Verifying Booking Model Methods ===');
try {
  const Booking = require('../models/Booking').default;

  // Check if model has required methods
  const requiredMethods = [
    'calculateNights',
    'isUpcoming',
    'isActive',
    'isPast',
    'calculateRefundAmount',
    'toSafeObject',
  ];

  // Create a mock instance to check methods
  const mockInstance = Object.create(Booking.prototype);

  for (const methodName of requiredMethods) {
    if (typeof mockInstance[methodName] === 'function') {
      console.log(`✓ ${methodName} method exists`);
    } else {
      console.log(`✗ ${methodName} method is missing`);
      allPassed = false;
    }
  }
} catch (error: any) {
  console.error('✗ Failed to verify Booking model:', error.message);
  allPassed = false;
}

// Verify enums
console.log('\n=== Verifying Booking Enums ===');
try {
  const BookingModule = require('../models/Booking');

  const requiredEnums = [
    'BookingStatus',
    'PaymentMethod',
    'PaymentType',
    'PaymentStatus',
    'EscrowStatus',
  ];

  for (const enumName of requiredEnums) {
    if (BookingModule[enumName]) {
      console.log(`✓ ${enumName} enum exists`);
    } else {
      console.log(`✗ ${enumName} enum is missing`);
      allPassed = false;
    }
  }
} catch (error: any) {
  console.error('✗ Failed to verify enums:', error.message);
  allPassed = false;
}

// Verify documentation exists
console.log('\n=== Verifying Documentation ===');
try {
  const fs = require('fs');
  const path = require('path');

  const docsPath = path.join(__dirname, '../../docs/BOOKING_MANAGEMENT_API.md');
  if (fs.existsSync(docsPath)) {
    console.log('✓ BOOKING_MANAGEMENT_API.md exists');
    const content = fs.readFileSync(docsPath, 'utf-8');
    if (content.includes('Get User Bookings') &&
      content.includes('Get Booking by ID') &&
      content.includes('Update Booking') &&
      content.includes('Cancel Booking')) {
      console.log('✓ Documentation contains all required sections');
    } else {
      console.log('✗ Documentation is missing some sections');
      allPassed = false;
    }
  } else {
    console.log('✗ BOOKING_MANAGEMENT_API.md not found');
    allPassed = false;
  }
} catch (error: any) {
  console.error('✗ Failed to verify documentation:', error.message);
  allPassed = false;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(60));

if (allPassed) {
  console.log('✓ All verifications passed!');
  console.log('\nBooking management endpoints are properly implemented.');
  console.log('\nTo test the endpoints:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Run the test suite: npm run test:booking-management');
  process.exit(0);
} else {
  console.log('✗ Some verifications failed!');
  console.log('\nPlease review the errors above and fix the issues.');
  process.exit(1);
}
