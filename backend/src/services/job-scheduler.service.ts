import cron from 'node-cron';
import { Op } from 'sequelize';
import Booking, { BookingStatus } from '../models/Booking';
import PaymentTransaction from '../models/PaymentTransaction';
import notificationService from './notification.service';
import logger from '../utils/logger';

/**
 * Job Scheduler Service
 * Manages all scheduled jobs for notifications and payment processing
 * Uses node-cron for scheduling
 */

interface ScheduledJob {
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

class JobSchedulerService {
  private jobs: Map<string, ScheduledJob> = new Map();
  private isInitialized = false;

  /**
   * Initialize all scheduled jobs
   */
  initializeJobs(): void {
    if (this.isInitialized) {
      logger.warn('Job scheduler already initialized');
      return;
    }

    logger.info('Initializing job scheduler...');

    // Booking reminders - 24 hours before check-in (daily at 9:00 AM)
    this.scheduleBookingReminders();

    // Payment reminders - milestone payments (daily at 10:00 AM)
    this.schedulePaymentReminders();

    // Escrow release check - after check-out (daily at 11:00 AM)
    this.scheduleEscrowRelease();

    // Cleanup expired notifications (daily at 2:00 AM)
    this.scheduleCleanupJobs();

    this.isInitialized = true;
    logger.info('Job scheduler initialized successfully');
  }

  /**
   * Schedule booking reminder notifications (24 hours before check-in)
   */
  private scheduleBookingReminders(): void {
    const jobName = 'booking-reminders';
    const schedule = '0 9 * * *'; // Daily at 9:00 AM

    cron.schedule(schedule, async () => {
      try {
        logger.info('Running scheduled job: Booking reminders');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Find all confirmed bookings with check-in tomorrow
        const bookings = await (Booking as any).findAll({
          where: {
            status: BookingStatus.CONFIRMED,
            check_in: {
              [Op.gte]: tomorrow,
              [Op.lt]: dayAfterTomorrow,
            },
          },
          include: [
            { association: 'user', attributes: ['id', 'email', 'phone', 'first_name', 'last_name'] },
            { association: 'hotel', attributes: ['id', 'name'] },
            { association: 'room', attributes: ['id', 'room_type'] },
          ],
        });

        for (const booking of bookings) {
          const user = (booking as any).user;
          if (user && user.email) {
            const bookingDetails = {
              bookingNumber: booking.booking_number,
              userName: `${user.first_name} ${user.last_name}`,
              hotelName: (booking as any).hotel?.name || 'Hotel',
              checkIn: booking.check_in.toLocaleDateString(),
              roomType: (booking as any).room?.room_type || 'Room',
              checkInInstructions: 'Please arrive between 2:00 PM and 11:00 PM',
            };

            await notificationService.sendBookingReminderNotification(
              user.email,
              user.phone,
              bookingDetails,
              'both'
            );
          }
        }

        logger.info(`Booking reminders sent for ${bookings.length} bookings`);
        this.updateJobStatus(jobName, new Date());
      } catch (error) {
        logger.error('Error in booking reminders job:', error);
      }
    });

    this.jobs.set(jobName, {
      name: jobName,
      schedule,
      enabled: true,
    });
  }

  /**
   * Schedule payment reminder notifications
   */
  private schedulePaymentReminders(): void {
    const jobName = 'payment-reminders';
    const schedule = '0 10 * * *'; // Daily at 10:00 AM

    cron.schedule(schedule, async () => {
      try {
        logger.info('Running scheduled job: Payment reminders');

        const now = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

        // Find pending milestone payments due within 7 days
        const pendingPayments = await (PaymentTransaction as any).findAll({
          where: {
            status: 'pending',
            due_date: {
              [Op.lte]: oneWeekFromNow,
              [Op.gte]: now,
            },
          },
          include: [
            { association: 'booking', attributes: ['id', 'booking_number'] },
            { association: 'user', attributes: ['id', 'email', 'phone', 'first_name', 'last_name'] },
          ],
        });

        for (const payment of pendingPayments) {
          const user = (payment as any).user;
          const booking = (payment as any).booking;

          if (user && user.email && booking) {
            const paymentDetails = {
              userName: `${user.first_name} ${user.last_name}`,
              bookingNumber: booking.booking_number,
              hotelName: 'Hotel',
              dueAmount: payment.amount,
              dueDate: payment.due_date.toLocaleDateString(),
              milestoneNumber: payment.payment_type?.includes('MILESTONE') ? parseInt(payment.payment_type.split('_')[1]) : 1,
            };

            await notificationService.sendPaymentReminderNotification(
              user.email,
              user.phone,
              paymentDetails,
              'both'
            );
          }
        }

        logger.info(`Payment reminders sent for ${pendingPayments.length} payments`);
        this.updateJobStatus(jobName, new Date());
      } catch (error) {
        logger.error('Error in payment reminders job:', error);
      }
    });

    this.jobs.set(jobName, {
      name: jobName,
      schedule,
      enabled: true,
    });
  }

  /**
   * Schedule escrow release check
   */
  private scheduleEscrowRelease(): void {
    const jobName = 'escrow-release';
    const schedule = '0 11 * * *'; // Daily at 11:00 AM

    cron.schedule(schedule, async () => {
      try {
        logger.info('Running scheduled job: Escrow release check');

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Find all confirmed bookings that have passed check-out date
        const completedBookings = await (Booking as any).findAll({
          where: {
            status: BookingStatus.CONFIRMED,
            check_out: {
              [Op.lt]: now,
            },
          },
        });

        logger.info(`Found ${completedBookings.length} completed bookings for escrow release`);
        this.updateJobStatus(jobName, new Date());
      } catch (error) {
        logger.error('Error in escrow release job:', error);
      }
    });

    this.jobs.set(jobName, {
      name: jobName,
      schedule,
      enabled: true,
    });
  }

  /**
   * Schedule cleanup jobs
   */
  private scheduleCleanupJobs(): void {
    const jobName = 'cleanup';
    const schedule = '0 2 * * *'; // Daily at 2:00 AM

    cron.schedule(schedule, async () => {
      try {
        logger.info('Running scheduled job: Cleanup');
        // Add cleanup logic here (e.g., delete old logs, expired tokens, etc.)
        this.updateJobStatus(jobName, new Date());
      } catch (error) {
        logger.error('Error in cleanup job:', error);
      }
    });

    this.jobs.set(jobName, {
      name: jobName,
      schedule,
      enabled: true,
    });
  }

  /**
   * Update job status
   */
  private updateJobStatus(jobName: string, lastRun: Date): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.lastRun = lastRun;
      logger.debug(`Job ${jobName} completed at ${lastRun.toISOString()}`);
    }
  }

  /**
   * Get all scheduled jobs
   */
  getJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get job status
   */
  getJobStatus(jobName: string): ScheduledJob | undefined {
    return this.jobs.get(jobName);
  }

  /**
   * Check if scheduler is initialized
   */
  isInitialized_(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
const jobSchedulerService = new JobSchedulerService();
export default jobSchedulerService;

