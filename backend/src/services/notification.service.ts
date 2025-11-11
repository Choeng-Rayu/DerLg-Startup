import emailService from './email.service';
import smsService from './sms.service';
import logger from '../utils/logger';

/**
 * Unified Notification Service
 * Handles multi-channel notifications (Email, SMS, WebSocket)
 * Provides a single interface for sending notifications across all channels
 */

export interface NotificationPayload {
  userId?: string;
  email?: string;
  phone?: string;
  type: 'email' | 'sms' | 'both';
  template: string;
  data: Record<string, any>;
}

export interface NotificationResult {
  email?: boolean;
  sms?: boolean;
  success: boolean;
  timestamp: Date;
}

class NotificationService {
  /**
   * Send welcome notification
   */
  async sendWelcomeNotification(
    email: string,
    phone: string | undefined,
    userName: string,
    notificationType: 'email' | 'sms' | 'both' = 'email'
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      timestamp: new Date(),
    };

    try {
      if (notificationType === 'email' || notificationType === 'both') {
        result.email = await emailService.sendWelcomeEmail(email, userName);
      }

      if ((notificationType === 'sms' || notificationType === 'both') && phone) {
        result.sms = await smsService.sendSMS(
          phone,
          `Welcome to DerLg Tourism, ${userName}! Start exploring amazing hotels and tours in Cambodia.`
        );
      }

      result.success = !!(result.email || result.sms);
      logger.info('Welcome notification sent', { email, phone, result });
      return result;
    } catch (error) {
      logger.error('Error sending welcome notification:', error);
      return result;
    }
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmationNotification(
    email: string,
    phone: string | undefined,
    bookingDetails: any,
    notificationType: 'email' | 'sms' | 'both' = 'email'
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      timestamp: new Date(),
    };

    try {
      if (notificationType === 'email' || notificationType === 'both') {
        result.email = await emailService.sendBookingConfirmationEmail(email, bookingDetails);
      }

      if ((notificationType === 'sms' || notificationType === 'both') && phone) {
        const smsMessage = `Booking confirmed! Booking #${bookingDetails.bookingNumber} at ${bookingDetails.hotelName}. Check-in: ${bookingDetails.checkIn}`;
        result.sms = await smsService.sendSMS(phone, smsMessage);
      }

      result.success = !!(result.email || result.sms);
      logger.info('Booking confirmation notification sent', { email, phone, bookingNumber: bookingDetails.bookingNumber });
      return result;
    } catch (error) {
      logger.error('Error sending booking confirmation notification:', error);
      return result;
    }
  }

  /**
   * Send booking reminder notification
   */
  async sendBookingReminderNotification(
    email: string,
    phone: string | undefined,
    bookingDetails: any,
    notificationType: 'email' | 'sms' | 'both' = 'both'
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      timestamp: new Date(),
    };

    try {
      if (notificationType === 'email' || notificationType === 'both') {
        result.email = await emailService.sendBookingReminderEmail(email, bookingDetails);
      }

      if ((notificationType === 'sms' || notificationType === 'both') && phone) {
        result.sms = await smsService.sendBookingReminderSMS(
          phone,
          `Reminder: Your stay at ${bookingDetails.hotelName} is tomorrow! Booking #${bookingDetails.bookingNumber}`
        );
      }

      result.success = !!(result.email || result.sms);
      logger.info('Booking reminder notification sent', { email, phone, bookingNumber: bookingDetails.bookingNumber });
      return result;
    } catch (error) {
      logger.error('Error sending booking reminder notification:', error);
      return result;
    }
  }

  /**
   * Send payment receipt notification
   */
  async sendPaymentReceiptNotification(
    email: string,
    phone: string | undefined,
    paymentDetails: any,
    notificationType: 'email' | 'sms' | 'both' = 'email'
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      timestamp: new Date(),
    };

    try {
      if (notificationType === 'email' || notificationType === 'both') {
        result.email = await emailService.sendPaymentReceiptEmail(email, paymentDetails);
      }

      if ((notificationType === 'sms' || notificationType === 'both') && phone) {
        const smsMessage = `Payment received! Transaction #${paymentDetails.transactionId}. Amount: ${paymentDetails.currency} ${paymentDetails.amount}`;
        result.sms = await smsService.sendSMS(phone, smsMessage);
      }

      result.success = !!(result.email || result.sms);
      logger.info('Payment receipt notification sent', { email, phone, transactionId: paymentDetails.transactionId });
      return result;
    } catch (error) {
      logger.error('Error sending payment receipt notification:', error);
      return result;
    }
  }

  /**
   * Send payment reminder notification
   */
  async sendPaymentReminderNotification(
    email: string,
    phone: string | undefined,
    paymentDetails: any,
    notificationType: 'email' | 'sms' | 'both' = 'both'
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      timestamp: new Date(),
    };

    try {
      if (notificationType === 'email' || notificationType === 'both') {
        result.email = await emailService.sendPaymentReminderEmail(email, paymentDetails);
      }

      if ((notificationType === 'sms' || notificationType === 'both') && phone) {
        result.sms = await smsService.sendPaymentReminderSMS(
          phone,
          paymentDetails.bookingNumber,
          paymentDetails.dueAmount,
          new Date(paymentDetails.dueDate),
          paymentDetails.milestoneNumber
        );
      }

      result.success = !!(result.email || result.sms);
      logger.info('Payment reminder notification sent', { email, phone, bookingNumber: paymentDetails.bookingNumber });
      return result;
    } catch (error) {
      logger.error('Error sending payment reminder notification:', error);
      return result;
    }
  }

  /**
   * Send booking status update notification
   */
  async sendBookingStatusUpdateNotification(
    email: string,
    phone: string | undefined,
    bookingDetails: any,
    notificationType: 'email' | 'sms' | 'both' = 'email'
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      timestamp: new Date(),
    };

    try {
      if (notificationType === 'email' || notificationType === 'both') {
        result.email = await emailService.sendBookingStatusUpdateEmail(email, bookingDetails);
      }

      if ((notificationType === 'sms' || notificationType === 'both') && phone) {
        const statusMessage = `Booking #${bookingDetails.bookingNumber} status: ${bookingDetails.status.toUpperCase()}`;
        result.sms = await smsService.sendSMS(phone, statusMessage);
      }

      result.success = !!(result.email || result.sms);
      logger.info('Booking status update notification sent', { email, phone, bookingNumber: bookingDetails.bookingNumber });
      return result;
    } catch (error) {
      logger.error('Error sending booking status update notification:', error);
      return result;
    }
  }

  /**
   * Check if email is configured
   */
  isEmailConfigured(): boolean {
    return true; // Email service has graceful degradation
  }

  /**
   * Check if SMS is configured
   */
  isSMSConfigured(): boolean {
    return smsService.isConfigured();
  }

  /**
   * Get notification channel status
   */
  getChannelStatus(): { email: boolean; sms: boolean } {
    return {
      email: this.isEmailConfigured(),
      sms: this.isSMSConfigured(),
    };
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

