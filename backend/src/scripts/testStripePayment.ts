import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = process.env.API_URL || 'http://localhost:5000';

/**
 * Test Stripe Payment Integration
 * 
 * This script tests the complete Stripe payment flow:
 * 1. Create a payment intent
 * 2. Verify payment status
 * 3. Test webhook handling (manual simulation)
 */

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Helper function to log test results
 */
const logResult = (test: string, status: 'PASS' | 'FAIL', message: string, data?: any) => {
  results.push({ test, status, message, data });
  const icon = status === 'PASS' ? '✓' : '✗';
  console.log(`${icon} ${test}: ${message}`);
  if (data) {
    console.log('  Data:', JSON.stringify(data, null, 2));
  }
};

/**
 * Test 1: Create Stripe payment intent
 */
const testCreateStripePayment = async (token: string, bookingId: string): Promise<string | null> => {
  try {
    console.log('\n--- Test 1: Create Stripe Payment Intent ---');

    const response = await axios.post(
      `${API_URL}/api/payments/stripe/create`,
      {
        booking_id: bookingId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      logResult(
        'Create Stripe Payment Intent',
        'PASS',
        'Payment intent created successfully',
        {
          payment_intent_id: response.data.data.payment_intent_id,
          amount: response.data.data.amount,
          currency: response.data.data.currency,
          status: response.data.data.status,
        }
      );
      return response.data.data.payment_intent_id;
    } else {
      logResult('Create Stripe Payment Intent', 'FAIL', response.data.error?.message || 'Unknown error');
      return null;
    }
  } catch (error: any) {
    logResult(
      'Create Stripe Payment Intent',
      'FAIL',
      error.response?.data?.error?.message || error.message
    );
    return null;
  }
};

/**
 * Test 2: Get Stripe payment status
 */
const testGetStripePaymentStatus = async (token: string, paymentIntentId: string): Promise<boolean> => {
  try {
    console.log('\n--- Test 2: Get Stripe Payment Status ---');

    const response = await axios.get(
      `${API_URL}/api/payments/stripe/status/${paymentIntentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      logResult(
        'Get Stripe Payment Status',
        'PASS',
        'Payment status retrieved successfully',
        {
          payment_intent_id: response.data.data.payment_intent_id,
          status: response.data.data.status,
          amount: response.data.data.amount,
        }
      );
      return true;
    } else {
      logResult('Get Stripe Payment Status', 'FAIL', response.data.error?.message || 'Unknown error');
      return false;
    }
  } catch (error: any) {
    logResult(
      'Get Stripe Payment Status',
      'FAIL',
      error.response?.data?.error?.message || error.message
    );
    return false;
  }
};

/**
 * Test 3: Verify Stripe payment (simulated)
 */
const testVerifyStripePayment = async (token: string, bookingId: string, paymentIntentId: string): Promise<boolean> => {
  try {
    console.log('\n--- Test 3: Verify Stripe Payment ---');
    console.log('Note: This test requires actual payment to be completed in Stripe');

    const response = await axios.post(
      `${API_URL}/api/payments/stripe/verify`,
      {
        booking_id: bookingId,
        payment_intent_id: paymentIntentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      logResult(
        'Verify Stripe Payment',
        'PASS',
        'Payment verification completed',
        {
          payment_status: response.data.data.payment_status,
          booking_status: response.data.data.booking_status,
        }
      );
      return true;
    } else {
      logResult('Verify Stripe Payment', 'FAIL', response.data.error?.message || 'Unknown error');
      return false;
    }
  } catch (error: any) {
    // Payment not completed is expected in test environment
    if (error.response?.data?.data?.payment_status === 'requires_payment_method') {
      logResult(
        'Verify Stripe Payment',
        'PASS',
        'Payment intent created but not completed (expected in test)',
        { status: 'requires_payment_method' }
      );
      return true;
    }

    logResult(
      'Verify Stripe Payment',
      'FAIL',
      error.response?.data?.error?.message || error.message
    );
    return false;
  }
};

/**
 * Main test runner
 */
const runTests = async () => {
  console.log('='.repeat(60));
  console.log('Stripe Payment Integration Test');
  console.log('='.repeat(60));

  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('\n❌ Error: STRIPE_SECRET_KEY not configured in .env file');
    console.log('\nPlease add the following to your .env file:');
    console.log('STRIPE_SECRET_KEY=sk_test_...');
    console.log('STRIPE_PUBLISHABLE_KEY=pk_test_...');
    console.log('STRIPE_WEBHOOK_SECRET=whsec_...');
    process.exit(1);
  }

  // Get test credentials from command line or use defaults
  const email = process.argv[2] || 'test@example.com';
  const password = process.argv[3] || 'Test1234';
  const bookingId = process.argv[4];

  if (!bookingId) {
    console.error('\n❌ Error: Booking ID is required');
    console.log('\nUsage: npm run test:stripe <email> <password> <booking_id>');
    console.log('Example: npm run test:stripe test@example.com Test1234 booking-123');
    process.exit(1);
  }

  try {
    // Step 1: Login to get authentication token
    console.log('\n--- Authentication ---');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.error?.message);
      process.exit(1);
    }

    const token = loginResponse.data.data.access_token;
    console.log('✓ Login successful');

    // Step 2: Create Stripe payment intent
    const paymentIntentId = await testCreateStripePayment(token, bookingId);

    if (!paymentIntentId) {
      console.error('\n❌ Failed to create payment intent. Stopping tests.');
      printSummary();
      process.exit(1);
    }

    // Step 3: Get payment status
    await testGetStripePaymentStatus(token, paymentIntentId);

    // Step 4: Verify payment (will show pending status)
    await testVerifyStripePayment(token, bookingId, paymentIntentId);

    // Print summary
    printSummary();

    // Print next steps
    console.log('\n' + '='.repeat(60));
    console.log('Next Steps:');
    console.log('='.repeat(60));
    console.log('\n1. Complete the payment using Stripe test cards:');
    console.log('   - Success: 4242 4242 4242 4242');
    console.log('   - 3D Secure: 4000 0027 6000 3184');
    console.log('   - Declined: 4000 0000 0000 0002');
    console.log('\n2. Use the Stripe Dashboard to test webhooks:');
    console.log('   https://dashboard.stripe.com/test/webhooks');
    console.log('\n3. Payment Intent ID:', paymentIntentId);
    console.log('\n4. To complete payment, use the client_secret from the response');
    console.log('   with Stripe.js or Stripe mobile SDKs');

  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
};

/**
 * Print test summary
 */
const printSummary = () => {
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n✓ All tests passed!');
  } else {
    console.log('\n✗ Some tests failed. Please review the output above.');
  }
};

// Run tests
runTests();
