import { testConnection, closeConnection } from '../config/database';
import {
  checkMilestonePaymentReminders,
  checkBookingReminders,
  checkEscrowRelease,
} from '../services/escrow-payment-scheduler.service';
import logger from '../utils/logger';

/**
 * Test escrow and payment scheduling functionality
 */
const testEscrowScheduler = async () => {
  try {
    logger.info('=== Testing Escrow and Payment Scheduler ===\n');

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Test 1: Check milestone payment reminders
    logger.info('Test 1: Check milestone payment reminders');
    await checkMilestonePaymentReminders();
    logger.info('✓ Milestone payment reminders checked successfully\n');

    // Test 2: Check booking reminders
    logger.info('Test 2: Check booking reminders');
    await checkBookingReminders();
    logger.info('✓ Booking reminders checked successfully\n');

    // Test 3: Check automatic escrow release
    logger.info('Test 3: Check automatic escrow release');
    await checkEscrowRelease();
    logger.info('✓ Automatic escrow release checked successfully\n');

    logger.info('=== All Escrow and Payment Scheduler Tests Passed ===');
    logger.info('\nNote: The escrow and payment scheduling system is integrated into the payment flow.');
    logger.info('When payments are processed, they are automatically held in escrow.');
    logger.info('Scheduled jobs run daily to check for payment reminders and escrow releases.');

  } catch (error: any) {
    logger.error('Test failed:', error);
    throw error;
  } finally {
    await closeConnection();
  }
};

// Run tests
testEscrowScheduler()
  .then(() => {
    logger.info('Tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Tests failed:', error);
    process.exit(1);
  });
