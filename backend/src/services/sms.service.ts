import twilio from 'twilio';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * SMSService class
 * Handles SMS sending via Twilio
 */
class SMSService {
  private client: twilio.Twilio | null = null;

  constructor() {
    // Only initialize Twilio if proper credentials are provided (must start with AC for SID)
    if (config.TWILIO_ACCOUNT_SID && 
        config.TWILIO_AUTH_TOKEN && 
        config.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      try {
        this.client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
        logger.info('Twilio SMS service initialized successfully');
      } catch (error) {
        logger.warn('Failed to initialize Twilio SMS service:', error);
      }
    } else {
      logger.info('Twilio SMS service not configured - SMS features will be disabled');
    }
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetSMS(
    to: string,
    resetToken: string,
    userName: string
  ): Promise<boolean> {
    try {
      if (!this.client || !config.TWILIO_PHONE_NUMBER) {
        logger.warn('Twilio not configured, skipping SMS send');
        return false;
      }

      const resetUrl = `${config.API_URL}/reset-password?token=${resetToken}`;

      const message = `Hello ${userName},\n\nYou requested to reset your password for DerLg Tourism.\n\nReset your password here: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this message.`;

      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to,
      });

      logger.info(`Password reset SMS sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset SMS:', error);
      return false;
    }
  }

  /**
   * Send booking reminder SMS
   */
  async sendBookingReminderSMS(
    to: string,
    bookingDetails: string
  ): Promise<boolean> {
    try {
      if (!this.client || !config.TWILIO_PHONE_NUMBER) {
        logger.warn('Twilio not configured, skipping SMS send');
        return false;
      }

      const message = `Reminder: Your booking with DerLg Tourism is coming up!\n\n${bookingDetails}\n\nHave a great trip!`;

      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to,
      });

      logger.info(`Booking reminder SMS sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending booking reminder SMS:', error);
      return false;
    }
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCodeSMS(to: string, code: string): Promise<boolean> {
    try {
      if (!this.client || !config.TWILIO_PHONE_NUMBER) {
        logger.warn('Twilio not configured, skipping SMS send');
        return false;
      }

      const message = `Your DerLg Tourism verification code is: ${code}\n\nThis code expires in 10 minutes.`;

      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to,
      });

      logger.info(`Verification code SMS sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending verification code SMS:', error);
      return false;
    }
  }

  /**
   * Send payment reminder SMS for milestone payments
   */
  async sendPaymentReminderSMS(
    to: string,
    bookingNumber: string,
    amount: number,
    dueDate: Date,
    milestoneNumber?: number
  ): Promise<boolean> {
    try {
      if (!this.client || !config.TWILIO_PHONE_NUMBER) {
        logger.warn('Twilio not configured, skipping SMS send');
        return false;
      }

      const dueDateStr = dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const milestoneText = milestoneNumber
        ? `Milestone ${milestoneNumber} payment`
        : 'Payment';

      const message = `DerLg Tourism Payment Reminder\n\n${milestoneText} of $${amount.toFixed(
        2
      )} is due on ${dueDateStr} for booking ${bookingNumber}.\n\nPlease complete your payment to confirm your reservation.\n\nThank you!`;

      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to,
      });

      logger.info(`Payment reminder SMS sent to: ${to} for booking: ${bookingNumber}`);
      return true;
    } catch (error) {
      logger.error('Error sending payment reminder SMS:', error);
      return false;
    }
  }

  /**
   * Send generic SMS message
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!this.client || !config.TWILIO_PHONE_NUMBER) {
        logger.warn('Twilio not configured, skipping SMS send');
        return false;
      }

      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to,
      });

      logger.info(`SMS sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Check if Twilio is configured
   */
  isConfigured(): boolean {
    return !!(this.client && config.TWILIO_PHONE_NUMBER);
  }
}

// Export singleton instance
const smsService = new SMSService();
export default smsService;

// Export individual functions for convenience
export const sendPasswordResetSMS = (to: string, resetToken: string, userName: string) =>
  smsService.sendPasswordResetSMS(to, resetToken, userName);

export const sendBookingReminderSMS = (to: string, bookingDetails: string) =>
  smsService.sendBookingReminderSMS(to, bookingDetails);

export const sendVerificationCodeSMS = (to: string, code: string) =>
  smsService.sendVerificationCodeSMS(to, code);

export const sendPaymentReminderSMS = (
  to: string,
  bookingNumber: string,
  amount: number,
  dueDate: Date,
  milestoneNumber?: number
) => smsService.sendPaymentReminderSMS(to, bookingNumber, amount, dueDate, milestoneNumber);

export const sendSMS = (to: string, message: string) => smsService.sendSMS(to, message);

export const isTwilioConfigured = () => smsService.isConfigured();
