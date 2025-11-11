import cron from 'node-cron';
import { Op } from 'sequelize';
import Booking, { BookingStatus, PaymentStatus, EscrowStatus } from '../models/Booking';
import PaymentTransaction, { 
  TransactionStatus, 
  EscrowStatus as TransactionEscrowStatus,
  PaymentType as TransactionPaymentType
} from '../models/PaymentTransaction';
import { sendEmail } from './email.service';
import { sendSMS, sendPaymentReminderSMS } from './sms.service';
import logger from '../utils/logger';

/**
 * Escrow hold logic for all payments
 * All payments are held in escrow until service delivery
 */
export const holdPaymentInEscrow = async (
  transactionId: string,
  bookingId: string
): Promise<void> => {
  try {
    const transaction = await PaymentTransaction.findByPk(transactionId);
    
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Set escrow status to held
    transaction.escrow_status = TransactionEscrowStatus.HELD;
    await transaction.save();

    logger.info(`Payment held in escrow: Transaction ${transactionId}, Booking ${bookingId}`);
  } catch (error) {
    logger.error('Error holding payment in escrow:', error);
    throw error;
  }
};

/**
 * Release escrow after service delivery
 * Called when booking status changes to 'completed'
 */
export const releaseEscrowPayment = async (bookingId: string): Promise<void> => {
  try {
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Only release escrow for completed bookings
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new Error(`Cannot release escrow for booking with status: ${booking.status}`);
    }

    // Find all transactions for this booking
    const transactions = await PaymentTransaction.findAll({
      where: {
        booking_id: bookingId,
        status: TransactionStatus.COMPLETED,
        escrow_status: TransactionEscrowStatus.HELD,
      },
    });

    // Release each transaction from escrow
    for (const transaction of transactions) {
      transaction.escrow_status = TransactionEscrowStatus.RELEASED;
      transaction.escrow_release_date = new Date();
      await transaction.save();

      logger.info(`Escrow released: Transaction ${transaction.id}, Booking ${bookingId}`);
    }

    // Update booking payment escrow status
    booking.payment.escrow_status = EscrowStatus.RELEASED;
    await booking.save();

    logger.info(`All escrow payments released for booking ${bookingId}`);
  } catch (error) {
    logger.error('Error releasing escrow payment:', error);
    throw error;
  }
};

/**
 * Send payment reminder notification
 */
const sendPaymentReminder = async (
  booking: Booking,
  milestoneNumber: number,
  amount: number,
  dueDate: Date
): Promise<void> => {
  try {
    const user = await booking.$get('user');
    
    if (!user) {
      logger.error(`User not found for booking ${booking.id}`);
      return;
    }

    const subject = `Payment Reminder - Booking ${booking.booking_number}`;
    const emailBody = `
      <h2>Payment Reminder</h2>
      <p>Dear ${booking.guest_details.name},</p>
      <p>This is a reminder that your milestone payment is due soon.</p>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.booking_number}</li>
        <li><strong>Milestone:</strong> ${milestoneNumber}</li>
        <li><strong>Amount Due:</strong> $${amount.toFixed(2)}</li>
        <li><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</li>
      </ul>
      <p>Please complete your payment to ensure your booking remains confirmed.</p>
      <p>Thank you for choosing DerLg!</p>
    `;

    // Send email reminder
    await sendEmail(
      booking.guest_details.email,
      subject,
      emailBody
    );

    // Send SMS reminder if phone is available
    if (booking.guest_details.phone) {
      const smsBody = `Payment reminder: $${amount.toFixed(2)} due on ${dueDate.toLocaleDateString()} for booking ${booking.booking_number}. Please complete payment to confirm your reservation.`;
      await sendSMS(booking.guest_details.phone, smsBody);
    }

    logger.info(`Payment reminder sent for booking ${booking.id}, milestone ${milestoneNumber}`);
  } catch (error) {
    logger.error('Error sending payment reminder:', error);
  }
};

/**
 * Check and send milestone payment reminders
 * Runs daily to check for upcoming milestone payments
 */
export const checkMilestonePaymentReminders = async (): Promise<void> => {
  try {
    logger.info('Checking milestone payment reminders...');

    // Find all confirmed bookings with milestone payment type
    const bookings = await Booking.findAll({
      where: {
        status: BookingStatus.CONFIRMED,
        'payment.type': 'milestone',
        'payment.status': {
          [Op.in]: [PaymentStatus.PENDING, PaymentStatus.PARTIAL],
        },
      },
    });

    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    for (const booking of bookings) {
      const checkInDate = new Date(booking.check_in);
      const oneWeekBeforeCheckIn = new Date(checkInDate);
      oneWeekBeforeCheckIn.setDate(oneWeekBeforeCheckIn.getDate() - 7);

      // Get completed transactions
      const completedTransactions = await PaymentTransaction.findAll({
        where: {
          booking_id: booking.id,
          status: TransactionStatus.COMPLETED,
        },
      });

      const completedMilestones = completedTransactions.map(t => t.payment_type);

      // Check milestone 2 (25% one week before check-in)
      if (
        !completedMilestones.includes(TransactionPaymentType.MILESTONE_2) &&
        oneWeekBeforeCheckIn >= now &&
        oneWeekBeforeCheckIn <= oneWeekFromNow
      ) {
        const milestone2Amount = booking.pricing.total * 0.25;
        await sendPaymentReminder(booking, 2, milestone2Amount, oneWeekBeforeCheckIn);
      }

      // Check milestone 3 (25% upon arrival)
      if (
        !completedMilestones.includes(TransactionPaymentType.MILESTONE_3) &&
        checkInDate >= now &&
        checkInDate <= oneWeekFromNow
      ) {
        const milestone3Amount = booking.pricing.total * 0.25;
        await sendPaymentReminder(booking, 3, milestone3Amount, checkInDate);
      }
    }

    logger.info('Milestone payment reminders check completed');
  } catch (error) {
    logger.error('Error checking milestone payment reminders:', error);
  }
};

/**
 * Send booking reminder (24 hours before check-in)
 */
const sendBookingReminder = async (booking: Booking): Promise<void> => {
  try {
    const subject = `Booking Reminder - Check-in Tomorrow`;
    const emailBody = `
      <h2>Booking Reminder</h2>
      <p>Dear ${booking.guest_details.name},</p>
      <p>This is a reminder that your check-in is scheduled for tomorrow.</p>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.booking_number}</li>
        <li><strong>Check-in Date:</strong> ${new Date(booking.check_in).toLocaleDateString()}</li>
        <li><strong>Check-out Date:</strong> ${new Date(booking.check_out).toLocaleDateString()}</li>
        <li><strong>Nights:</strong> ${booking.nights}</li>
      </ul>
      <p>We look forward to welcoming you!</p>
      <p>Safe travels,<br>DerLg Team</p>
    `;

    // Send email reminder
    await sendEmail(
      booking.guest_details.email,
      subject,
      emailBody
    );

    // Send SMS reminder if phone is available
    if (booking.guest_details.phone) {
      const smsBody = `Reminder: Your check-in is tomorrow for booking ${booking.booking_number}. We look forward to welcoming you!`;
      await sendSMS(booking.guest_details.phone, smsBody);
    }

    logger.info(`Booking reminder sent for booking ${booking.id}`);
  } catch (error) {
    logger.error('Error sending booking reminder:', error);
  }
};

/**
 * Check and send booking reminders (24 hours before check-in)
 */
export const checkBookingReminders = async (): Promise<void> => {
  try {
    logger.info('Checking booking reminders...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all confirmed bookings with check-in tomorrow
    const bookings = await Booking.findAll({
      where: {
        status: BookingStatus.CONFIRMED,
        check_in: {
          [Op.gte]: tomorrow,
          [Op.lt]: dayAfterTomorrow,
        },
      },
    });

    for (const booking of bookings) {
      await sendBookingReminder(booking);
    }

    logger.info(`Booking reminders sent for ${bookings.length} bookings`);
  } catch (error) {
    logger.error('Error checking booking reminders:', error);
  }
};

/**
 * Check and release escrow for completed bookings
 * Runs daily to check for bookings that have passed check-out date
 */
export const checkEscrowRelease = async (): Promise<void> => {
  try {
    logger.info('Checking escrow release for completed bookings...');

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Find all confirmed bookings that have passed check-out date
    const bookings = await Booking.findAll({
      where: {
        status: BookingStatus.CONFIRMED,
        check_out: {
          [Op.lt]: now,
        },
        'payment.escrow_status': EscrowStatus.HELD,
      },
    });

    for (const booking of bookings) {
      // Update booking status to completed
      booking.status = BookingStatus.COMPLETED;
      await booking.save();

      // Release escrow
      await releaseEscrowPayment(booking.id);

      logger.info(`Booking ${booking.id} marked as completed and escrow released`);
    }

    logger.info(`Escrow released for ${bookings.length} completed bookings`);
  } catch (error) {
    logger.error('Error checking escrow release:', error);
  }
};

/**
 * Initialize scheduled jobs
 */
export const initializeScheduledJobs = (): void => {
  logger.info('Initializing scheduled jobs...');

  // Run milestone payment reminders daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running scheduled job: Milestone payment reminders');
    await checkMilestonePaymentReminders();
  });

  // Run booking reminders daily at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    logger.info('Running scheduled job: Booking reminders');
    await checkBookingReminders();
  });

  // Run escrow release check daily at 11:00 AM
  cron.schedule('0 11 * * *', async () => {
    logger.info('Running scheduled job: Escrow release check');
    await checkEscrowRelease();
  });

  logger.info('Scheduled jobs initialized successfully');
};

/**
 * Process milestone payment
 * Called when a milestone payment is completed
 */
export const processMilestonePayment = async (
  bookingId: string,
  milestoneNumber: number,
  transactionId: string
): Promise<void> => {
  try {
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Hold payment in escrow
    await holdPaymentInEscrow(transactionId, bookingId);

    // Get all completed transactions
    const completedTransactions = await PaymentTransaction.findAll({
      where: {
        booking_id: bookingId,
        status: TransactionStatus.COMPLETED,
      },
    });

    // Check if all milestone payments are completed
    const milestoneTypes = [
      TransactionPaymentType.MILESTONE_1,
      TransactionPaymentType.MILESTONE_2,
      TransactionPaymentType.MILESTONE_3,
    ];

    const completedMilestones = completedTransactions.map(t => t.payment_type);
    const allMilestonesCompleted = milestoneTypes.every(type => 
      completedMilestones.includes(type)
    );

    // Update booking payment status
    if (allMilestonesCompleted) {
      booking.payment.status = PaymentStatus.COMPLETED;
    } else {
      booking.payment.status = PaymentStatus.PARTIAL;
    }

    await booking.save();

    logger.info(`Milestone ${milestoneNumber} payment processed for booking ${bookingId}`);
  } catch (error) {
    logger.error('Error processing milestone payment:', error);
    throw error;
  }
};

/**
 * Get payment schedule for a booking
 */
export const getPaymentSchedule = (booking: Booking): any[] => {
  const schedule = [];
  const total = booking.pricing.total;
  const checkIn = new Date(booking.check_in);

  if (booking.payment.type === 'milestone') {
    const oneWeekBefore = new Date(checkIn);
    oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

    schedule.push({
      milestone: 1,
      type: TransactionPaymentType.MILESTONE_1,
      percentage: 50,
      amount: total * 0.50,
      due_date: new Date(),
      description: '50% upfront payment',
      status: 'due_now',
    });

    schedule.push({
      milestone: 2,
      type: TransactionPaymentType.MILESTONE_2,
      percentage: 25,
      amount: total * 0.25,
      due_date: oneWeekBefore,
      description: '25% payment one week before check-in',
      status: 'scheduled',
    });

    schedule.push({
      milestone: 3,
      type: TransactionPaymentType.MILESTONE_3,
      percentage: 25,
      amount: total * 0.25,
      due_date: checkIn,
      description: '25% payment upon arrival',
      status: 'scheduled',
    });
  } else if (booking.payment.type === 'deposit') {
    const depositPercentage = 60; // Default 60%
    
    schedule.push({
      milestone: 1,
      type: TransactionPaymentType.DEPOSIT,
      percentage: depositPercentage,
      amount: total * (depositPercentage / 100),
      due_date: new Date(),
      description: 'Initial deposit payment',
      status: 'due_now',
    });

    schedule.push({
      milestone: 2,
      type: 'remaining_balance',
      percentage: 100 - depositPercentage,
      amount: total * ((100 - depositPercentage) / 100),
      due_date: checkIn,
      description: 'Remaining balance due at check-in',
      status: 'scheduled',
    });
  }

  return schedule;
};
