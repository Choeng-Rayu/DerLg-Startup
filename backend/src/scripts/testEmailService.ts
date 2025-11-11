import emailService from '../services/email.service';
import logger from '../utils/logger';

/**
 * Test script for Email Service
 * Tests all email notification methods
 */

async function testEmailService() {
  logger.info('=== Testing Email Service ===\n');

  const testEmail = 'test@example.com';
  const testUserName = 'John Doe';

  try {
    // Test 1: Welcome Email
    logger.info('Test 1: Sending welcome email...');
    const welcomeResult = await emailService.sendWelcomeEmail(testEmail, testUserName);
    logger.info(`Welcome email result: ${welcomeResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 2: Booking Confirmation Email
    logger.info('Test 2: Sending booking confirmation email...');
    const confirmationResult = await emailService.sendBookingConfirmationEmail(testEmail, {
      bookingNumber: 'BK-2024-001',
      userName: testUserName,
      hotelName: 'Angkor Paradise Hotel',
      checkIn: '2024-12-25',
      checkOut: '2024-12-28',
      roomType: 'Deluxe Suite',
      guests: 2,
      totalAmount: 450.00,
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in. After that, a 50% cancellation fee applies.',
    });
    logger.info(`Booking confirmation email result: ${confirmationResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 3: Booking Reminder Email
    logger.info('Test 3: Sending booking reminder email...');
    const reminderResult = await emailService.sendBookingReminderEmail(testEmail, {
      userName: testUserName,
      hotelName: 'Angkor Paradise Hotel',
      checkIn: '2024-12-25',
      roomType: 'Deluxe Suite',
      bookingNumber: 'BK-2024-001',
      checkInInstructions: 'Check-in time is 2:00 PM. Please bring a valid ID and your booking confirmation.',
    });
    logger.info(`Booking reminder email result: ${reminderResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 4: Booking Status Update Email (Approved)
    logger.info('Test 4: Sending booking approved email...');
    const approvedResult = await emailService.sendBookingStatusUpdateEmail(testEmail, {
      userName: testUserName,
      bookingNumber: 'BK-2024-001',
      hotelName: 'Angkor Paradise Hotel',
      status: 'approved',
    });
    logger.info(`Booking approved email result: ${approvedResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 5: Booking Status Update Email (Rejected)
    logger.info('Test 5: Sending booking rejected email...');
    const rejectedResult = await emailService.sendBookingStatusUpdateEmail(testEmail, {
      userName: testUserName,
      bookingNumber: 'BK-2024-002',
      hotelName: 'Angkor Paradise Hotel',
      status: 'rejected',
      reason: 'Room not available for selected dates',
      refundAmount: 450.00,
    });
    logger.info(`Booking rejected email result: ${rejectedResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 6: Booking Status Update Email (Cancelled)
    logger.info('Test 6: Sending booking cancelled email...');
    const cancelledResult = await emailService.sendBookingStatusUpdateEmail(testEmail, {
      userName: testUserName,
      bookingNumber: 'BK-2024-003',
      hotelName: 'Angkor Paradise Hotel',
      status: 'cancelled',
      refundAmount: 225.00,
    });
    logger.info(`Booking cancelled email result: ${cancelledResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 7: Payment Receipt Email
    logger.info('Test 7: Sending payment receipt email...');
    const receiptResult = await emailService.sendPaymentReceiptEmail(testEmail, {
      userName: testUserName,
      bookingNumber: 'BK-2024-001',
      transactionId: 'TXN-2024-12345',
      amount: 450.00,
      currency: 'USD',
      paymentMethod: 'PayPal',
      paymentDate: '2024-12-20 10:30:00',
      hotelName: 'Angkor Paradise Hotel',
    });
    logger.info(`Payment receipt email result: ${receiptResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 8: Payment Reminder Email
    logger.info('Test 8: Sending payment reminder email...');
    const paymentReminderResult = await emailService.sendPaymentReminderEmail(testEmail, {
      userName: testUserName,
      bookingNumber: 'BK-2024-001',
      hotelName: 'Angkor Paradise Hotel',
      dueAmount: 112.50,
      dueDate: '2024-12-23',
      milestoneNumber: 2,
    });
    logger.info(`Payment reminder email result: ${paymentReminderResult ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 9: Password Reset Email
    logger.info('Test 9: Sending password reset email...');
    const resetResult = await emailService.sendPasswordResetEmail(
      testEmail,
      'test-reset-token-12345',
      testUserName
    );
    logger.info(`Password reset email result: ${resetResult ? 'SUCCESS' : 'FAILED'}\n`);

    logger.info('=== Email Service Test Complete ===');
    logger.info('\nNote: If SMTP is not configured, all tests will show as FAILED but this is expected.');
    logger.info('Configure SMTP settings in .env file to test actual email sending.');

  } catch (error) {
    logger.error('Error during email service test:', error);
  }
}

// Run the test
testEmailService();
