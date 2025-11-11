import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

const API_URL = process.env.API_URL || 'http://localhost:5000';

/**
 * Test PayPal Payment Integration
 * 
 * This script tests the complete PayPal payment flow:
 * 1. Login as a tourist
 * 2. Create a booking
 * 3. Create PayPal payment intent
 * 4. Simulate payment capture
 * 5. Verify booking status update
 */

interface TestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
}

const results: TestResult[] = [];

const logResult = (step: string, success: boolean, data?: any, error?: string) => {
  results.push({ step, success, data, error });
  console.log(`\n${success ? '✓' : '✗'} ${step}`);
  if (data) {
    console.log('  Data:', JSON.stringify(data, null, 2));
  }
  if (error) {
    console.log('  Error:', error);
  }
};

const runTests = async () => {
  console.log('='.repeat(60));
  console.log('PayPal Payment Integration Test');
  console.log('='.repeat(60));

  let authToken = '';
  let bookingId = '';
  let bookingNumber = '';
  let paypalOrderId = '';

  try {
    // Step 1: Login as tourist
    console.log('\n--- Step 1: Login as Tourist ---');
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'tourist@test.com',
        password: 'Test1234',
      });

      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.access_token;
        logResult('Login as tourist', true, {
          email: 'tourist@test.com',
          token: authToken.substring(0, 20) + '...',
        });
      } else {
        logResult('Login as tourist', false, null, 'Login failed');
        return;
      }
    } catch (error: any) {
      logResult(
        'Login as tourist',
        false,
        null,
        error.response?.data?.error?.message || error.message
      );
      return;
    }

    // Step 2: Create a booking
    console.log('\n--- Step 2: Create Booking ---');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

      const bookingResponse = await axios.post(
        `${API_URL}/api/bookings`,
        {
          hotel_id: 'test-hotel-id', // Replace with actual hotel ID from your database
          room_id: 'test-room-id', // Replace with actual room ID from your database
          check_in: tomorrow.toISOString().split('T')[0],
          check_out: dayAfterTomorrow.toISOString().split('T')[0],
          guests: {
            adults: 2,
            children: 0,
          },
          guest_details: {
            name: 'Test Guest',
            email: 'guest@test.com',
            phone: '+1234567890',
            special_requests: 'Test booking for PayPal integration',
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

      if (bookingResponse.data.success) {
        bookingId = bookingResponse.data.data.booking.id;
        bookingNumber = bookingResponse.data.data.booking.booking_number;
        logResult('Create booking', true, {
          booking_id: bookingId,
          booking_number: bookingNumber,
          status: bookingResponse.data.data.booking.status,
          total: bookingResponse.data.data.booking.pricing.total,
        });
      } else {
        logResult('Create booking', false, null, 'Booking creation failed');
        return;
      }
    } catch (error: any) {
      logResult(
        'Create booking',
        false,
        null,
        error.response?.data?.error?.message || error.message
      );
      console.log('\nNote: Make sure you have a valid hotel and room in your database.');
      console.log('You can run: npm run seed:hotels');
      return;
    }

    // Step 3: Create PayPal payment intent
    console.log('\n--- Step 3: Create PayPal Payment Intent ---');
    try {
      const paymentResponse = await axios.post(
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

      if (paymentResponse.data.success) {
        paypalOrderId = paymentResponse.data.data.paypal_order_id;
        logResult('Create PayPal payment intent', true, {
          paypal_order_id: paypalOrderId,
          approval_url: paymentResponse.data.data.approval_url,
          amount: paymentResponse.data.data.amount,
          currency: paymentResponse.data.data.currency,
        });
      } else {
        logResult('Create PayPal payment intent', false, null, 'Payment intent creation failed');
        return;
      }
    } catch (error: any) {
      logResult(
        'Create PayPal payment intent',
        false,
        null,
        error.response?.data?.error?.message || error.message
      );
      console.log('\nNote: Make sure PayPal credentials are configured in .env file:');
      console.log('  PAYPAL_CLIENT_ID=your_client_id');
      console.log('  PAYPAL_CLIENT_SECRET=your_client_secret');
      console.log('  PAYPAL_MODE=sandbox');
      return;
    }

    // Step 4: Get PayPal order status
    console.log('\n--- Step 4: Get PayPal Order Status ---');
    try {
      const statusResponse = await axios.get(
        `${API_URL}/api/payments/paypal/status/${paypalOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (statusResponse.data.success) {
        logResult('Get PayPal order status', true, {
          order_id: statusResponse.data.data.order_id,
          status: statusResponse.data.data.status,
        });
      } else {
        logResult('Get PayPal order status', false, null, 'Failed to get order status');
      }
    } catch (error: any) {
      logResult(
        'Get PayPal order status',
        false,
        null,
        error.response?.data?.error?.message || error.message
      );
    }

    // Step 5: Manual capture instructions
    console.log('\n--- Step 5: Manual Payment Capture ---');
    console.log('\nTo complete the payment flow:');
    console.log('1. Open the approval URL in a browser');
    console.log('2. Login to PayPal sandbox account');
    console.log('3. Approve the payment');
    console.log('4. After approval, call the capture endpoint:');
    console.log(`\n   POST ${API_URL}/api/payments/paypal/capture`);
    console.log('   Headers: { Authorization: "Bearer <token>" }');
    console.log('   Body: {');
    console.log(`     "booking_id": "${bookingId}",`);
    console.log(`     "paypal_order_id": "${paypalOrderId}"`);
    console.log('   }');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    console.log(`\nTotal Tests: ${totalCount}`);
    console.log(`Passed: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);

    results.forEach((result) => {
      console.log(`  ${result.success ? '✓' : '✗'} ${result.step}`);
    });

    if (successCount === totalCount) {
      console.log('\n✓ All tests passed!');
      console.log('\nPayPal integration is working correctly.');
      console.log('Complete the manual payment approval to test the full flow.');
    } else {
      console.log('\n✗ Some tests failed. Please check the errors above.');
    }

    console.log('\n' + '='.repeat(60));
  } catch (error: any) {
    console.error('\nUnexpected error:', error.message);
  }
};

// Run tests
runTests().catch(console.error);
