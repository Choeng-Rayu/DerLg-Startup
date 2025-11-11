import axios from 'axios';
import logger from '../utils/logger';

/**
 * Test PayPal Payment Integration
 * 
 * This script tests the complete PayPal payment flow:
 * 1. Create a booking
 * 2. Create PayPal payment intent
 * 3. Simulate payment approval (manual step)
 * 4. Capture payment
 * 5. Verify booking status update
 * 6. Verify transaction record
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_USER_EMAIL = 'tourist@test.com';
const TEST_USER_PASSWORD = 'Test123!@#';

let authToken: string = '';
let bookingId: string = '';
let bookingNumber: string = '';
let paypalOrderId: string = '';
let approvalUrl: string = '';

/**
 * Login as tourist user
 */
async function loginUser() {
  try {
    logger.info('Logging in as tourist user...');

    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (response.data.success) {
      authToken = response.data.data.access_token;
      logger.info('✓ Login successful');
      return true;
    } else {
      logger.error('✗ Login failed:', response.data.error);
      return false;
    }
  } catch (error: any) {
    logger.error('✗ Login error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Create a test booking
 */
async function createBooking() {
  try {
    logger.info('\nCreating test booking...');

    // Get a hotel and room first
    const hotelsResponse = await axios.get(`${API_URL}/api/hotels`);
    const hotel = hotelsResponse.data.data.hotels[0];

    if (!hotel) {
      logger.error('✗ No hotels found');
      return false;
    }

    const roomsResponse = await axios.get(`${API_URL}/api/hotels/${hotel.id}/rooms`);
    const room = roomsResponse.data.data.rooms[0];

    if (!room) {
      logger.error('✗ No rooms found');
      return false;
    }

    // Create booking
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 10);

    const response = await axios.post(
      `${API_URL}/api/bookings`,
      {
        hotel_id: hotel.id,
        room_id: room.id,
        check_in: checkIn.toISOString().split('T')[0],
        check_out: checkOut.toISOString().split('T')[0],
        guests: {
          adults: 2,
          children: 0,
        },
        guest_details: {
          name: 'Test Tourist',
          email: TEST_USER_EMAIL,
          phone: '+1234567890',
          special_requests: 'Test booking for PayPal payment',
        },
        payment: {
          method: 'paypal',
          type: 'full',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      bookingId = response.data.data.booking.id;
      bookingNumber = response.data.data.booking.booking_number;
      logger.info('✓ Booking created successfully');
      logger.info(`  Booking ID: ${bookingId}`);
      logger.info(`  Booking Number: ${bookingNumber}`);
      logger.info(`  Total Amount: $${response.data.data.booking.pricing.total}`);
      return true;
    } else {
      logger.error('✗ Booking creation failed:', response.data.error);
      return false;
    }
  } catch (error: any) {
    logger.error('✗ Booking creation error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Create PayPal payment intent
 */
async function createPayPalPayment() {
  try {
    logger.info('\nCreating PayPal payment intent...');

    const response = await axios.post(
      `${API_URL}/api/payments/paypal/create`,
      {
        booking_id: bookingId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      paypalOrderId = response.data.data.paypal_order_id;
      approvalUrl = response.data.data.approval_url;
      logger.info('✓ PayPal payment intent created successfully');
      logger.info(`  PayPal Order ID: ${paypalOrderId}`);
      logger.info(`  Amount: $${response.data.data.amount}`);
      logger.info(`  Payment Type: ${response.data.data.payment_type}`);
      logger.info(`\n  Approval URL: ${approvalUrl}`);
      logger.info('\n  ⚠️  MANUAL STEP REQUIRED:');
      logger.info('  1. Open the approval URL in a browser');
      logger.info('  2. Login to PayPal sandbox account');
      logger.info('  3. Approve the payment');
      logger.info('  4. After approval, run the capture step\n');
      return true;
    } else {
      logger.error('✗ PayPal payment creation failed:', response.data.error);
      return false;
    }
  } catch (error: any) {
    logger.error('✗ PayPal payment creation error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Capture PayPal payment (after manual approval)
 */
async function capturePayPalPayment() {
  try {
    logger.info('\nCapturing PayPal payment...');
    logger.info('⚠️  Make sure you have approved the payment in PayPal before running this step!');

    const response = await axios.post(
      `${API_URL}/api/payments/paypal/capture`,
      {
        booking_id: bookingId,
        paypal_order_id: paypalOrderId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      logger.info('✓ PayPal payment captured successfully');
      logger.info(`  Transaction ID: ${response.data.data.transaction_id}`);
      logger.info(`  Capture ID: ${response.data.data.capture_id}`);
      logger.info(`  Amount: $${response.data.data.amount}`);
      logger.info(`  Payment Status: ${response.data.data.payment_status}`);
      logger.info(`  Booking Status: ${response.data.data.booking_status}`);
      logger.info(`  Payer Email: ${response.data.data.payer_email}`);
      logger.info(`  Payer Name: ${response.data.data.payer_name}`);
      return true;
    } else {
      logger.error('✗ PayPal payment capture failed:', response.data.error);
      return false;
    }
  } catch (error: any) {
    logger.error('✗ PayPal payment capture error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Verify booking status
 */
async function verifyBookingStatus() {
  try {
    logger.info('\nVerifying booking status...');

    const response = await axios.get(`${API_URL}/api/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      const booking = response.data.data.booking;
      logger.info('✓ Booking status verified');
      logger.info(`  Status: ${booking.status}`);
      logger.info(`  Payment Status: ${booking.payment.status}`);
      logger.info(`  Transactions: ${booking.payment.transactions.length}`);

      if (booking.status === 'confirmed' && booking.payment.status === 'completed') {
        logger.info('✓ Booking confirmed and payment completed!');
        return true;
      } else {
        logger.warn('⚠️  Booking or payment status not as expected');
        return false;
      }
    } else {
      logger.error('✗ Booking verification failed:', response.data.error);
      return false;
    }
  } catch (error: any) {
    logger.error('✗ Booking verification error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Get PayPal order status
 */
async function getPayPalOrderStatus() {
  try {
    logger.info('\nGetting PayPal order status...');

    const response = await axios.get(
      `${API_URL}/api/payments/paypal/status/${paypalOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      logger.info('✓ PayPal order status retrieved');
      logger.info(`  Order ID: ${response.data.data.order_id}`);
      logger.info(`  Status: ${response.data.data.status}`);
      return true;
    } else {
      logger.error('✗ PayPal order status retrieval failed:', response.data.error);
      return false;
    }
  } catch (error: any) {
    logger.error('✗ PayPal order status error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  logger.info('='.repeat(60));
  logger.info('PayPal Payment Integration Test');
  logger.info('='.repeat(60));

  // Check if we should run full flow or just capture
  const args = process.argv.slice(2);
  const captureOnly = args.includes('--capture-only');

  if (captureOnly) {
    // For capture-only mode, we need booking and order IDs
    if (args.length < 5) {
      logger.error('Usage for capture-only: npm run test:paypal:payment -- --capture-only <bookingId> <paypalOrderId>');
      process.exit(1);
    }
    bookingId = args[1];
    paypalOrderId = args[2];

    logger.info('\nRunning in CAPTURE-ONLY mode');
    logger.info(`Booking ID: ${bookingId}`);
    logger.info(`PayPal Order ID: ${paypalOrderId}`);

    if (!(await loginUser())) {
      process.exit(1);
    }

    if (!(await capturePayPalPayment())) {
      process.exit(1);
    }

    if (!(await verifyBookingStatus())) {
      process.exit(1);
    }
  } else {
    // Full flow
    if (!(await loginUser())) {
      process.exit(1);
    }

    if (!(await createBooking())) {
      process.exit(1);
    }

    if (!(await createPayPalPayment())) {
      logger.info('\n' + '='.repeat(60));
      logger.info('NEXT STEPS:');
      logger.info('='.repeat(60));
      logger.info('1. Open the approval URL above in your browser');
      logger.info('2. Login to PayPal sandbox and approve the payment');
      logger.info('3. Run the capture command:');
      logger.info(`   npm run test:paypal:payment -- --capture-only ${bookingId} ${paypalOrderId}`);
      logger.info('='.repeat(60));
      process.exit(0);
    }
  }

  logger.info('\n' + '='.repeat(60));
  logger.info('✓ All PayPal payment tests completed successfully!');
  logger.info('='.repeat(60));
}

// Run tests
runTests().catch((error) => {
  logger.error('Test execution failed:', error);
  process.exit(1);
});
