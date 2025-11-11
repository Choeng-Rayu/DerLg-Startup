import nodemailer from 'nodemailer';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * EmailService class
 * Handles email sending via Nodemailer
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter
   */
  private initializeTransporter() {
    if (!config.SMTP_HOST || !config.SMTP_PORT) {
      logger.warn('SMTP not configured, email sending will be disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE, // true for 465, false for other ports
        auth: config.SMTP_USER && config.SMTP_PASSWORD ? {
          user: config.SMTP_USER,
          pass: config.SMTP_PASSWORD,
        } : undefined,
      });

      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not configured, skipping email send');
        return false;
      }

      const resetUrl = `${config.API_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: config.SMTP_FROM_EMAIL || 'noreply@derlg.com',
        to,
        subject: 'Password Reset Request - DerLg Tourism',
        text: `Hello ${userName},\n\nYou requested to reset your password. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nDerLg Tourism Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>You requested to reset your password. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 1 hour.<br>
              If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              DerLg Tourism Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Send welcome email on user registration
   * Requirement 17.1: Send welcome email within 1 minute
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not configured, skipping email send');
        return false;
      }

      const mailOptions = {
        from: config.SMTP_FROM_EMAIL || 'noreply@derlg.com',
        to,
        subject: 'Welcome to DerLg Tourism!',
        text: `Hello ${userName},\n\nWelcome to DerLg Tourism! We're excited to have you on board.\n\nStart exploring amazing hotels, tours, and experiences in Cambodia.\n\nBest regards,\nDerLg Tourism Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to DerLg Tourism!</h2>
            <p>Hello ${userName},</p>
            <p>Welcome to DerLg Tourism! We're excited to have you on board.</p>
            <p>Start exploring amazing hotels, tours, and experiences in Cambodia.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              DerLg Tourism Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send booking confirmation email
   * Requirement 17.2: Send confirmation email within 30 seconds
   */
  async sendBookingConfirmationEmail(
    to: string,
    bookingDetails: {
      bookingNumber: string;
      userName: string;
      hotelName: string;
      checkIn: string;
      checkOut: string;
      roomType: string;
      guests: number;
      totalAmount: number;
      cancellationPolicy: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not configured, skipping email send');
        return false;
      }

      const mailOptions = {
        from: config.SMTP_FROM_EMAIL || 'noreply@derlg.com',
        to,
        subject: `Booking Confirmation - ${bookingDetails.bookingNumber}`,
        text: `Hello ${bookingDetails.userName},\n\nYour booking has been confirmed!\n\nBooking Number: ${bookingDetails.bookingNumber}\nHotel: ${bookingDetails.hotelName}\nRoom Type: ${bookingDetails.roomType}\nCheck-in: ${bookingDetails.checkIn}\nCheck-out: ${bookingDetails.checkOut}\nGuests: ${bookingDetails.guests}\nTotal Amount: $${bookingDetails.totalAmount}\n\nCancellation Policy:\n${bookingDetails.cancellationPolicy}\n\nBest regards,\nDerLg Tourism Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
            <p>Hello ${bookingDetails.userName},</p>
            <p>Your booking has been confirmed. Here are your booking details:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Booking Number:</strong> ${bookingDetails.bookingNumber}</p>
              <p style="margin: 5px 0;"><strong>Hotel:</strong> ${bookingDetails.hotelName}</p>
              <p style="margin: 5px 0;"><strong>Room Type:</strong> ${bookingDetails.roomType}</p>
              <p style="margin: 5px 0;"><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
              <p style="margin: 5px 0;"><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
              <p style="margin: 5px 0;"><strong>Guests:</strong> ${bookingDetails.guests}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Cancellation Policy:</strong></p>
              <p style="margin: 10px 0 0 0;">${bookingDetails.cancellationPolicy}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              DerLg Tourism Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Booking confirmation email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending booking confirmation email:', error);
      return false;
    }
  }

  /**
   * Send booking reminder email
   * Requirement 17.3: Send reminder 24 hours before check-in
   */
  async sendBookingReminderEmail(
    to: string,
    bookingDetails: {
      userName: string;
      hotelName: string;
      checkIn: string;
      roomType: string;
      bookingNumber: string;
      checkInInstructions: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not configured, skipping email send');
        return false;
      }

      const mailOptions = {
        from: config.SMTP_FROM_EMAIL || 'noreply@derlg.com',
        to,
        subject: `Reminder: Your stay at ${bookingDetails.hotelName} is tomorrow!`,
        text: `Hello ${bookingDetails.userName},\n\nThis is a friendly reminder that your stay at ${bookingDetails.hotelName} is tomorrow!\n\nBooking Number: ${bookingDetails.bookingNumber}\nCheck-in Date: ${bookingDetails.checkIn}\nRoom Type: ${bookingDetails.roomType}\n\nCheck-in Instructions:\n${bookingDetails.checkInInstructions}\n\nWe hope you have a wonderful stay!\n\nBest regards,\nDerLg Tourism Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Stay is Tomorrow!</h2>
            <p>Hello ${bookingDetails.userName},</p>
            <p>This is a friendly reminder that your stay at <strong>${bookingDetails.hotelName}</strong> is tomorrow!</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Booking Number:</strong> ${bookingDetails.bookingNumber}</p>
              <p style="margin: 5px 0;"><strong>Check-in Date:</strong> ${bookingDetails.checkIn}</p>
              <p style="margin: 5px 0;"><strong>Room Type:</strong> ${bookingDetails.roomType}</p>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Check-in Instructions:</strong></p>
              <p style="margin: 10px 0 0 0;">${bookingDetails.checkInInstructions}</p>
            </div>

            <p>We hope you have a wonderful stay!</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              DerLg Tourism Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Booking reminder email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending booking reminder email:', error);
      return false;
    }
  }

  /**
   * Send booking status update email
   * Requirement 17.4: Send status update within 30 seconds
   */
  async sendBookingStatusUpdateEmail(
    to: string,
    bookingDetails: {
      userName: string;
      bookingNumber: string;
      hotelName: string;
      status: 'approved' | 'rejected' | 'cancelled' | 'modified';
      reason?: string;
      refundAmount?: number;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not configured, skipping email send');
        return false;
      }

      let subject = '';
      let statusMessage = '';
      let statusColor = '#333';

      switch (bookingDetails.status) {
        case 'approved':
          subject = `Booking Approved - ${bookingDetails.bookingNumber}`;
          statusMessage = 'Your booking has been approved by the hotel!';
          statusColor = '#4CAF50';
          break;
        case 'rejected':
          subject = `Booking Rejected - ${bookingDetails.bookingNumber}`;
          statusMessage = 'Unfortunately, your booking has been rejected by the hotel.';
          statusColor = '#f44336';
          break;
        case 'cancelled':
          subject = `Booking Cancelled - ${bookingDetails.bookingNumber}`;
          statusMessage = 'Your booking has been cancelled.';
          statusColor = '#ff9800';
          break;
        case 'modified':
          subject = `Booking Modified - ${bookingDetails.bookingNumber}`;
          statusMessage = 'Your booking has been modified.';
          statusColor = '#2196F3';
          break;
      }

      const mailOptions = {
        from: config.SMTP_FROM_EMAIL || 'noreply@derlg.com',
        to,
        subject,
        text: `Hello ${bookingDetails.userName},\n\n${statusMessage}\n\nBooking Number: ${bookingDetails.bookingNumber}\nHotel: ${bookingDetails.hotelName}\n${bookingDetails.reason ? `\nReason: ${bookingDetails.reason}` : ''}${bookingDetails.refundAmount ? `\nRefund Amount: $${bookingDetails.refundAmount}` : ''}\n\nBest regards,\nDerLg Tourism Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${statusColor};">${statusMessage}</h2>
            <p>Hello ${bookingDetails.userName},</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Booking Number:</strong> ${bookingDetails.bookingNumber}</p>
              <p style="margin: 5px 0;"><strong>Hotel:</strong> ${bookingDetails.hotelName}</p>
              ${bookingDetails.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${bookingDetails.reason}</p>` : ''}
              ${bookingDetails.refundAmount ? `<p style="margin: 5px 0;"><strong>Refund Amount:</strong> $${bookingDetails.refundAmount}</p>` : ''}
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              DerLg Tourism Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Booking status update email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending booking status update email:', error);
      return false;
    }
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceiptEmail(
    to: string,
    paymentDetails: {
      userName: string;
      bookingNumber: string;
      transactionId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      paymentDate: string;
      hotelName: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not configured, skipping email send');
        return false;
      }

      const mailOptions = {
        from: config.SMTP_FROM_EMAIL || 'noreply@derlg.com',
        to,
        subject: `Payment Receipt - ${paymentDetails.transactionId}`,
        text: `Hello ${paymentDetails.userName},\n\nThank you for your payment!\n\nTransaction ID: ${paymentDetails.transactionId}\nBooking Number: ${paymentDetails.bookingNumber}\nHotel: ${paymentDetails.hotelName}\nAmount: ${paymentDetails.currency} ${paymentDetails.amount}\nPayment Method: ${paymentDetails.paymentMethod}\nPayment Date: ${paymentDetails.paymentDate}\n\nBest regards,\nDerLg Tourism Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Payment Received</h2>
            <p>Hello ${paymentDetails.userName},</p>
            <p>Thank you for your payment! Here is your receipt:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
              <p style="margin: 5px 0;"><strong>Booking Number:</strong> ${paymentDetails.bookingNumber}</p>
              <p style="margin: 5px 0;"><strong>Hotel:</strong> ${paymentDetails.hotelName}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${paymentDetails.currency} ${paymentDetails.amount}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
              <p style="margin: 5px 0;"><strong>Payment Date:</strong> ${paymentDetails.paymentDate}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              DerLg Tourism Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Payment receipt email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending payment receipt email:', error);
      return false;
    }
  }

  /**
   * Send payment reminder email for milestone payments
   */
  async sendPaymentReminderEmail(
    to: string,
    paymentDetails: {
      userName: string;
      bookingNumber: string;
      hotelName: string;
      dueAmount: number;
      dueDate: string;
      milestoneNumber: number;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not configured, skipping email send');
        return false;
      }

      const mailOptions = {
        from: config.SMTP_FROM_EMAIL || 'noreply@derlg.com',
        to,
        subject: `Payment Reminder - Milestone ${paymentDetails.milestoneNumber}`,
        text: `Hello ${paymentDetails.userName},\n\nThis is a reminder that your milestone payment is due soon.\n\nBooking Number: ${paymentDetails.bookingNumber}\nHotel: ${paymentDetails.hotelName}\nMilestone: ${paymentDetails.milestoneNumber}\nAmount Due: $${paymentDetails.dueAmount}\nDue Date: ${paymentDetails.dueDate}\n\nPlease complete your payment to ensure your booking remains confirmed.\n\nBest regards,\nDerLg Tourism Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff9800;">Payment Reminder</h2>
            <p>Hello ${paymentDetails.userName},</p>
            <p>This is a reminder that your milestone payment is due soon.</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Booking Number:</strong> ${paymentDetails.bookingNumber}</p>
              <p style="margin: 5px 0;"><strong>Hotel:</strong> ${paymentDetails.hotelName}</p>
              <p style="margin: 5px 0;"><strong>Milestone:</strong> ${paymentDetails.milestoneNumber}</p>
              <p style="margin: 5px 0;"><strong>Amount Due:</strong> $${paymentDetails.dueAmount}</p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${paymentDetails.dueDate}</p>
            </div>

            <p>Please complete your payment to ensure your booking remains confirmed.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              DerLg Tourism Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Payment reminder email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending payment reminder email:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new EmailService();
