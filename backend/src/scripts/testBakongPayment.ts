import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test script for Bakong (KHQR) payment integration
 * 
 * This script tests:
 * 1. Creating a Bakong payment (generating QR code)
 * 2. Checking payment status
 * 3. Monitoring payment with polling
 * 
 * Prerequisites:
 * - Server must be running (npm run dev)
 * - User must be authenticated (have a valid JWT token)
 * - A booking must exist with payment method set to 'bakong'
 */

const API_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  // You need to set these values based on your test data
  authToken: '', // JWT token from login
  bookingId: '', // Existing booking ID with bakong payment method
};

/**
 * Test 1: Create Bakong Payment (Generate QR Code)
 */
async function testCreateBakongPayment() {
  console.log('\n=== Test 1: Create Bakong Payment ===\n');

  try {
    const response = await axios.post(
      `${API_URL}/payments/bakong/create`,
      {
        booking_id: TEST_CONFIG.bookingId,
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_CONFIG.authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Bakong payment created successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    // Save QR code image if provided
    if (response.data.data.qr_image_base64) {
      const qrImagePath = path.join(__dirname, '../../temp/bakong_qr.png');
      const base64Data = response.data.data.qr_image_base64.replace(/^data:image\/png;base64,/, '');
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(qrImagePath, base64Data, 'base64');
      console.log(`\n📱 QR code image saved to: ${qrImagePath}`);
    }

    console.log('\n📋 Payment Details:');
    console.log(`   Booking Number: ${response.data.data.booking_number}`);
    console.log(`   MD5 Hash: ${response.data.data.md5_hash}`);
    console.log(`   Amount: ${response.data.data.amount} ${response.data.data.currency}`);
    console.log(`   Deep Link: ${response.data.data.deep_link}`);
    console.log('\n💡 Scan the QR code with Bakong app to make payment');
    console.log('💡 Or use the deep link on mobile device');

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error creating Bakong payment:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 2: Check Bakong Payment Status
 */
async function testCheckBakongPaymentStatus(md5Hash: string) {
  console.log('\n=== Test 2: Check Bakong Payment Status ===\n');

  try {
    const response = await axios.get(
      `${API_URL}/payments/bakong/status/${md5Hash}`,
      {
        headers: {
          Authorization: `Bearer ${TEST_CONFIG.authToken}`,
        },
      }
    );

    console.log('✅ Payment status retrieved successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    console.log('\n📊 Payment Status:');
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   MD5 Hash: ${response.data.data.md5_hash}`);
    
    if (response.data.data.transaction_id) {
      console.log(`   Transaction ID: ${response.data.data.transaction_id}`);
      console.log(`   Amount: ${response.data.data.amount} ${response.data.data.currency}`);
      console.log(`   Paid At: ${response.data.data.paid_at}`);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error checking payment status:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 3: Verify Bakong Payment (Manual Check)
 */
async function testVerifyBakongPayment(md5Hash: string) {
  console.log('\n=== Test 3: Verify Bakong Payment ===\n');

  try {
    const response = await axios.post(
      `${API_URL}/payments/bakong/verify`,
      {
        booking_id: TEST_CONFIG.bookingId,
        md5_hash: md5Hash,
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_CONFIG.authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Payment verified successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    console.log('\n✔️ Verification Result:');
    console.log(`   Payment Status: ${response.data.data.payment_status}`);
    console.log(`   Booking Status: ${response.data.data.booking_status}`);
    
    if (response.data.data.transaction_id) {
      console.log(`   Transaction ID: ${response.data.data.transaction_id}`);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error verifying payment:', error.response?.data || error.message);
    // Don't throw - payment might still be pending
    return null;
  }
}

/**
 * Test 4: Monitor Bakong Payment (Automatic Polling)
 */
async function testMonitorBakongPayment(md5Hash: string) {
  console.log('\n=== Test 4: Monitor Bakong Payment (Polling) ===\n');
  console.log('⏳ Starting payment monitoring...');
  console.log('💡 This will poll the Bakong API every 5 seconds for up to 5 minutes');
  console.log('💡 Please scan the QR code with Bakong app now\n');

  try {
    const response = await axios.post(
      `${API_URL}/payments/bakong/monitor`,
      {
        booking_id: TEST_CONFIG.bookingId,
        md5_hash: md5Hash,
        timeout: 300000, // 5 minutes
        interval: 5000,  // Check every 5 seconds
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_CONFIG.authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 310000, // Slightly longer than monitoring timeout
      }
    );

    console.log('✅ Payment monitoring completed');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    console.log('\n🎉 Payment Result:');
    console.log(`   Payment Status: ${response.data.data.payment_status}`);
    console.log(`   Booking Status: ${response.data.data.booking_status}`);
    console.log(`   Transaction ID: ${response.data.data.transaction_id}`);
    console.log(`   Attempts: ${response.data.data.attempts}`);

    return response.data.data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Monitoring timeout - payment not completed within 5 minutes');
    } else {
      console.error('❌ Error monitoring payment:', error.response?.data || error.message);
    }
    throw error;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Bakong (KHQR) Payment Integration Test Suite          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Validate configuration
  if (!TEST_CONFIG.authToken) {
    console.error('\n❌ Error: AUTH_TOKEN not set');
    console.log('Please set TEST_CONFIG.authToken in the script');
    console.log('You can get a token by logging in via POST /api/auth/login');
    process.exit(1);
  }

  if (!TEST_CONFIG.bookingId) {
    console.error('\n❌ Error: BOOKING_ID not set');
    console.log('Please set TEST_CONFIG.bookingId in the script');
    console.log('You need a booking with payment method set to "bakong"');
    process.exit(1);
  }

  try {
    // Test 1: Create Bakong payment
    const paymentData = await testCreateBakongPayment();
    const md5Hash = paymentData.md5_hash;

    console.log('\n' + '='.repeat(60));
    console.log('⏸️  PAUSE: Please scan the QR code with Bakong app');
    console.log('='.repeat(60));
    console.log('\nYou have 3 options to continue:');
    console.log('1. Scan QR code and wait for automatic monitoring (Test 4)');
    console.log('2. Manually check status (Test 2)');
    console.log('3. Manually verify payment (Test 3)');
    console.log('\nPress Ctrl+C to stop, or wait 10 seconds to continue...\n');

    // Wait 10 seconds before continuing
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Test 2: Check payment status
    await testCheckBakongPaymentStatus(md5Hash);

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Verify payment (manual check)
    await testVerifyBakongPayment(md5Hash);

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Monitor payment (automatic polling)
    // Note: This will wait up to 5 minutes for payment
    console.log('\n💡 Starting automatic payment monitoring...');
    console.log('💡 If you haven\'t paid yet, please scan the QR code now');
    await testMonitorBakongPayment(md5Hash);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ All Tests Completed Successfully           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ❌ Tests Failed                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    process.exit(1);
  }
}

// Run tests
runTests();
