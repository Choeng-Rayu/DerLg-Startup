import {
  sendPasswordResetSMS,
  sendBookingReminderSMS,
  sendPaymentReminderSMS,
  sendSMS,
  isTwilioConfigured,
} from '../services/sms.service';

/**
 * Test script for Twilio SMS integration
 * Tests all SMS notification types
 */

const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890';

async function testTwilioConfiguration() {
  console.log('\n=== Testing Twilio Configuration ===\n');

  const isConfigured = isTwilioConfigured();
  console.log(`Twilio Configured: ${isConfigured ? 'YES ✓' : 'NO ✗'}`);

  if (!isConfigured) {
    console.log('\n⚠️  Twilio is not configured. Please set the following environment variables:');
    console.log('   - TWILIO_ACCOUNT_SID');
    console.log('   - TWILIO_AUTH_TOKEN');
    console.log('   - TWILIO_PHONE_NUMBER');
    console.log('\nSMS sending will be skipped but the service will not throw errors.\n');
    return false;
  }

  return true;
}

async function testPasswordResetSMS() {
  console.log('\n=== Testing Password Reset SMS ===\n');

  try {
    const resetToken = 'test-reset-token-12345';
    const userName = 'John Doe';

    console.log(`Sending password reset SMS to: ${TEST_PHONE_NUMBER}`);
    console.log(`User Name: ${userName}`);
    console.log(`Reset Token: ${resetToken}`);

    const result = await sendPasswordResetSMS(TEST_PHONE_NUMBER, resetToken, userName);

    if (result) {
      console.log('✓ Password reset SMS sent successfully');
    } else {
      console.log('✗ Password reset SMS failed (Twilio may not be configured)');
    }

    return result;
  } catch (error) {
    console.error('✗ Error testing password reset SMS:', error);
    return false;
  }
}

async function testBookingReminderSMS() {
  console.log('\n=== Testing Booking Reminder SMS ===\n');

  try {
    const bookingDetails = `
Booking #BK123456
Hotel: Royal Palace Hotel
Check-in: Tomorrow, 2:00 PM
Check-out: Dec 30, 2024
Guests: 2 Adults
    `.trim();

    console.log(`Sending booking reminder SMS to: ${TEST_PHONE_NUMBER}`);
    console.log('Booking Details:', bookingDetails);

    const result = await sendBookingReminderSMS(TEST_PHONE_NUMBER, bookingDetails);

    if (result) {
      console.log('✓ Booking reminder SMS sent successfully');
    } else {
      console.log('✗ Booking reminder SMS failed (Twilio may not be configured)');
    }

    return result;
  } catch (error) {
    console.error('✗ Error testing booking reminder SMS:', error);
    return false;
  }
}

async function testPaymentReminderSMS() {
  console.log('\n=== Testing Payment Reminder SMS ===\n');

  try {
    const bookingNumber = 'BK123456';
    const amount = 250.00;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
    const milestoneNumber = 2;

    console.log(`Sending payment reminder SMS to: ${TEST_PHONE_NUMBER}`);
    console.log(`Booking Number: ${bookingNumber}`);
    console.log(`Amount: $${amount.toFixed(2)}`);
    console.log(`Due Date: ${dueDate.toLocaleDateString()}`);
    console.log(`Milestone: ${milestoneNumber}`);

    const result = await sendPaymentReminderSMS(
      TEST_PHONE_NUMBER,
      bookingNumber,
      amount,
      dueDate,
      milestoneNumber
    );

    if (result) {
      console.log('✓ Payment reminder SMS sent successfully');
    } else {
      console.log('✗ Payment reminder SMS failed (Twilio may not be configured)');
    }

    return result;
  } catch (error) {
    console.error('✗ Error testing payment reminder SMS:', error);
    return false;
  }
}

async function testGenericSMS() {
  console.log('\n=== Testing Generic SMS ===\n');

  try {
    const message = 'This is a test message from DerLg Tourism Platform. Your booking has been confirmed!';

    console.log(`Sending generic SMS to: ${TEST_PHONE_NUMBER}`);
    console.log(`Message: ${message}`);

    const result = await sendSMS(TEST_PHONE_NUMBER, message);

    if (result) {
      console.log('✓ Generic SMS sent successfully');
    } else {
      console.log('✗ Generic SMS failed (Twilio may not be configured)');
    }

    return result;
  } catch (error) {
    console.error('✗ Error testing generic SMS:', error);
    return false;
  }
}

async function testMilestonePaymentScenario() {
  console.log('\n=== Testing Milestone Payment Scenario ===\n');

  try {
    const bookingNumber = 'BK789012';
    const totalAmount = 1000.00;

    // Milestone 1: 50% upfront (already paid)
    console.log('Milestone 1 (50% upfront): Already paid - $500.00');

    // Milestone 2: 25% one week before
    const milestone2Date = new Date();
    milestone2Date.setDate(milestone2Date.getDate() + 7);
    console.log(`\nSending Milestone 2 reminder (25% - $${(totalAmount * 0.25).toFixed(2)})`);
    
    const result2 = await sendPaymentReminderSMS(
      TEST_PHONE_NUMBER,
      bookingNumber,
      totalAmount * 0.25,
      milestone2Date,
      2
    );

    if (result2) {
      console.log('✓ Milestone 2 reminder sent successfully');
    } else {
      console.log('✗ Milestone 2 reminder failed');
    }

    // Milestone 3: 25% upon arrival
    const milestone3Date = new Date();
    milestone3Date.setDate(milestone3Date.getDate() + 14);
    console.log(`\nSending Milestone 3 reminder (25% - $${(totalAmount * 0.25).toFixed(2)})`);
    
    const result3 = await sendPaymentReminderSMS(
      TEST_PHONE_NUMBER,
      bookingNumber,
      totalAmount * 0.25,
      milestone3Date,
      3
    );

    if (result3) {
      console.log('✓ Milestone 3 reminder sent successfully');
    } else {
      console.log('✗ Milestone 3 reminder failed');
    }

    return result2 && result3;
  } catch (error) {
    console.error('✗ Error testing milestone payment scenario:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Twilio SMS Integration Test Suite                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Check configuration first
  const isConfigured = await testTwilioConfiguration();

  if (!isConfigured) {
    console.log('\n⚠️  Skipping SMS tests - Twilio not configured');
    console.log('The SMS service will gracefully handle missing configuration.');
    console.log('To test SMS functionality, configure Twilio credentials in .env file.\n');
    return;
  }

  console.log(`\n📱 Test phone number: ${TEST_PHONE_NUMBER}`);
  console.log('(Set TEST_PHONE_NUMBER environment variable to use a different number)\n');

  const results = {
    passwordReset: false,
    bookingReminder: false,
    paymentReminder: false,
    genericSMS: false,
    milestoneScenario: false,
  };

  // Run individual tests
  results.passwordReset = await testPasswordResetSMS();
  await delay(2000); // Wait 2 seconds between tests

  results.bookingReminder = await testBookingReminderSMS();
  await delay(2000);

  results.paymentReminder = await testPaymentReminderSMS();
  await delay(2000);

  results.genericSMS = await testGenericSMS();
  await delay(2000);

  results.milestoneScenario = await testMilestonePaymentScenario();

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`Password Reset SMS:        ${results.passwordReset ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Booking Reminder SMS:      ${results.bookingReminder ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Payment Reminder SMS:      ${results.paymentReminder ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Generic SMS:               ${results.genericSMS ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Milestone Payment Scenario: ${results.milestoneScenario ? '✓ PASS' : '✗ FAIL'}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;

  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Twilio SMS integration is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.\n');
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
runAllTests()
  .then(() => {
    console.log('Test suite completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
