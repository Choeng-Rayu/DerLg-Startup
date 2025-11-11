import { Request, Response } from 'express';
import Booking, { BookingStatus, PaymentStatus } from '../models/Booking';
import PaymentTransaction, {
  PaymentGateway,
  PaymentType,
  TransactionStatus,
  EscrowStatus as TransactionEscrowStatus,
  Currency,
} from '../models/PaymentTransaction';
import Hotel from '../models/Hotel';
import Room from '../models/Room';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails,
} from '../services/paypal.service';
import {
  createBakongPayment as createBakongPaymentService,
  checkPaymentStatus as checkBakongPaymentStatus,
} from '../services/bakong.service';
import {
  createStripePaymentIntent,
  getStripePaymentIntent,
  verifyStripeWebhook,
  createStripeRefund,
} from '../services/stripe.service';
import {
  holdPaymentInEscrow,
  processMilestonePayment,
} from '../services/escrow-payment-scheduler.service';
import { createCalendarEvent } from '../services/google-calendar.service';

/**
 * Create PayPal payment intent
 * POST /api/payments/paypal/create
 */
export const createPayPalPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const { booking_id } = req.body;

    if (!booking_id) {
      return sendError(res, 'VAL_2002', 'Booking ID is required', 400);
    }

    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Check if booking is in pending status
    if (booking.status !== BookingStatus.PENDING) {
      return sendError(
        res,
        'BOOK_4004',
        'Booking is not in pending status',
        400
      );
    }

    // Check if payment method is PayPal
    if (booking.payment.method !== 'paypal') {
      return sendError(
        res,
        'PAY_5001',
        'Booking payment method is not PayPal',
        400
      );
    }

    // Calculate payment amount based on payment type
    let paymentAmount = booking.pricing.total;

    if (booking.payment.type === 'deposit') {
      // 50-70% deposit (we'll use 50% for simplicity)
      paymentAmount = booking.pricing.total * 0.5;
    } else if (booking.payment.type === 'milestone') {
      // First milestone: 50%
      paymentAmount = booking.pricing.total * 0.5;
    }

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(
      paymentAmount,
      'USD',
      booking.booking_number,
      `Hotel Booking - ${booking.booking_number}`
    );

    logger.info(
      `PayPal order created for booking ${booking.booking_number}: ${paypalOrder.orderId}`
    );

    return sendSuccess(
      res,
      {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        paypal_order_id: paypalOrder.orderId,
        approval_url: paypalOrder.approvalUrl,
        amount: paymentAmount,
        currency: 'USD',
        payment_type: booking.payment.type,
      },
      'PayPal payment intent created successfully'
    );
  } catch (error: any) {
    logger.error('Error creating PayPal payment:', error);
    return sendError(
      res,
      'PAY_5002',
      'Failed to create PayPal payment',
      500,
      error.message
    );
  }
};

/**
 * Capture PayPal payment
 * POST /api/payments/paypal/capture
 */
export const capturePayPalPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const { booking_id, paypal_order_id } = req.body;

    if (!booking_id || !paypal_order_id) {
      return sendError(
        res,
        'VAL_2002',
        'Booking ID and PayPal order ID are required',
        400
      );
    }

    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Check if booking is in pending status
    if (booking.status !== BookingStatus.PENDING) {
      return sendError(
        res,
        'BOOK_4004',
        'Booking is not in pending status',
        400
      );
    }

    // Capture PayPal order
    const captureResult = await capturePayPalOrder(paypal_order_id);

    // Check capture status
    if (captureResult.status !== 'COMPLETED') {
      logger.error(
        `PayPal capture failed for booking ${booking.booking_number}: ${captureResult.status}`
      );
      return sendError(
        res,
        'PAY_5001',
        `Payment capture failed with status: ${captureResult.status}`,
        400
      );
    }

    // Determine payment type
    let paymentType = PaymentType.FULL;
    if (booking.payment.type === 'deposit') {
      paymentType = PaymentType.DEPOSIT;
    } else if (booking.payment.type === 'milestone') {
      paymentType = PaymentType.MILESTONE_1;
    }

    // Create payment transaction record
    const transaction = await PaymentTransaction.create({
      booking_id: booking.id,
      transaction_id: captureResult.captureId,
      gateway: PaymentGateway.PAYPAL,
      amount: captureResult.amount,
      currency: Currency.USD,
      payment_type: paymentType,
      status: TransactionStatus.COMPLETED,
      gateway_response: captureResult.gatewayResponse,
      escrow_status: TransactionEscrowStatus.HELD,
      escrow_release_date: null,
      refund_amount: null,
      refund_reason: null,
    });

    // Hold payment in escrow
    await holdPaymentInEscrow(transaction.id, booking.id);

    // Update booking payment status
    const updatedPayment = {
      ...booking.payment,
      status:
        booking.payment.type === 'full'
          ? PaymentStatus.COMPLETED
          : PaymentStatus.PARTIAL,
      transactions: [
        ...booking.payment.transactions,
        {
          transaction_id: captureResult.captureId,
          amount: captureResult.amount,
          payment_type: paymentType,
          status: 'completed',
          timestamp: new Date(),
        },
      ],
    };

    // Update booking status
    const newBookingStatus =
      booking.payment.type === 'full'
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING;

    await booking.update({
      payment: updatedPayment,
      status: newBookingStatus,
    });

    // Process milestone payment if applicable
    if (booking.payment.type === 'milestone') {
      await processMilestonePayment(booking.id, 1, transaction.id);
    }

    logger.info(
      `Payment captured for booking ${booking.booking_number}: ${captureResult.captureId}`
    );

    // TODO: Send confirmation email

    // Create Google Calendar event if booking is confirmed
    if (newBookingStatus === BookingStatus.CONFIRMED) {
      const bookingWithDetails = await Booking.findByPk(booking.id, {
        include: [
          {
            model: Hotel,
            as: 'hotel',
          },
          {
            model: Room,
            as: 'room',
          },
        ],
      });

      if (bookingWithDetails) {
        const hotel = (bookingWithDetails as any).hotel;
        const room = (bookingWithDetails as any).room;

        const calendarEventId = await createCalendarEvent({
          booking_number: bookingWithDetails.booking_number,
          hotel_name: hotel.name,
          hotel_address: hotel.location.address,
          hotel_phone: hotel.contact.phone,
          hotel_location: {
            latitude: hotel.location.latitude,
            longitude: hotel.location.longitude,
          },
          room_type: room.room_type,
          check_in: bookingWithDetails.check_in,
          check_out: bookingWithDetails.check_out,
          guest_name: bookingWithDetails.guest_details.name,
          guest_email: bookingWithDetails.guest_details.email,
          guest_phone: bookingWithDetails.guest_details.phone,
          special_requests: bookingWithDetails.guest_details.special_requests,
        });

        if (calendarEventId) {
          await bookingWithDetails.update({
            calendar_event_id: calendarEventId,
          });
          logger.info(`Calendar event created for booking ${booking.booking_number}: ${calendarEventId}`);
        }
      }
    }

    return sendSuccess(
      res,
      {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        transaction_id: transaction.id,
        capture_id: captureResult.captureId,
        amount: captureResult.amount,
        currency: captureResult.currency,
        payment_status: updatedPayment.status,
        booking_status: newBookingStatus,
        payer_email: captureResult.payerEmail,
        payer_name: captureResult.payerName,
      },
      'Payment captured successfully'
    );
  } catch (error: any) {
    logger.error('Error capturing PayPal payment:', error);
    return sendError(
      res,
      'PAY_5002',
      'Failed to capture PayPal payment',
      500,
      error.message
    );
  }
};

/**
 * Handle PayPal webhook events
 * POST /api/payments/paypal/webhook
 */
export const handlePayPalWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;

    logger.info(`PayPal webhook received: ${event.event_type}`);

    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(event);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentCaptureDenied(event);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentCaptureRefunded(event);
        break;

      default:
        logger.info(`Unhandled PayPal webhook event: ${event.event_type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Error handling PayPal webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle payment capture completed event
 */
const handlePaymentCaptureCompleted = async (event: any) => {
  try {
    const captureId = event.resource?.id;

    if (!captureId) {
      logger.error('No capture ID in webhook event');
      return;
    }

    // Find transaction by capture ID
    const transaction = await PaymentTransaction.findOne({
      where: {
        transaction_id: captureId,
      },
    });

    if (!transaction) {
      logger.warn(`Transaction not found for capture ID: ${captureId}`);
      return;
    }

    // Update transaction status if needed
    if (transaction.status !== TransactionStatus.COMPLETED) {
      await transaction.update({
        status: TransactionStatus.COMPLETED,
        gateway_response: event.resource,
      });

      logger.info(`Transaction ${transaction.id} marked as completed via webhook`);
    }

    // Find and update booking
    const booking = await Booking.findByPk(transaction.booking_id);

    if (booking && booking.status === BookingStatus.PENDING) {
      const shouldConfirm =
        booking.payment.type === 'full' ||
        (booking.payment.type === 'deposit' &&
          booking.payment.status === PaymentStatus.PARTIAL);

      if (shouldConfirm) {
        await booking.update({
          status: BookingStatus.CONFIRMED,
        });

        logger.info(`Booking ${booking.booking_number} confirmed via webhook`);

        // TODO: Send confirmation email

        // Create Google Calendar event
        const bookingWithDetails = await Booking.findByPk(booking.id, {
          include: [
            {
              model: Hotel,
              as: 'hotel',
            },
            {
              model: Room,
              as: 'room',
            },
          ],
        });

        if (bookingWithDetails) {
          const hotel = (bookingWithDetails as any).hotel;
          const room = (bookingWithDetails as any).room;

          const calendarEventId = await createCalendarEvent({
            booking_number: bookingWithDetails.booking_number,
            hotel_name: hotel.name,
            hotel_address: hotel.location.address,
            hotel_phone: hotel.contact.phone,
            hotel_location: {
              latitude: hotel.location.latitude,
              longitude: hotel.location.longitude,
            },
            room_type: room.room_type,
            check_in: bookingWithDetails.check_in,
            check_out: bookingWithDetails.check_out,
            guest_name: bookingWithDetails.guest_details.name,
            guest_email: bookingWithDetails.guest_details.email,
            guest_phone: bookingWithDetails.guest_details.phone,
            special_requests: bookingWithDetails.guest_details.special_requests,
          });

          if (calendarEventId) {
            await bookingWithDetails.update({
              calendar_event_id: calendarEventId,
            });
            logger.info(`Calendar event created for booking ${booking.booking_number}: ${calendarEventId}`);
          }
        }
      }
    }
  } catch (error: any) {
    logger.error('Error handling payment capture completed:', error);
  }
};

/**
 * Handle payment capture denied event
 */
const handlePaymentCaptureDenied = async (event: any) => {
  try {
    const captureId = event.resource?.id;

    if (!captureId) {
      logger.error('No capture ID in webhook event');
      return;
    }

    // Find transaction by capture ID
    const transaction = await PaymentTransaction.findOne({
      where: {
        transaction_id: captureId,
      },
    });

    if (!transaction) {
      logger.warn(`Transaction not found for capture ID: ${captureId}`);
      return;
    }

    // Update transaction status
    await transaction.update({
      status: TransactionStatus.FAILED,
      gateway_response: event.resource,
    });

    logger.info(`Transaction ${transaction.id} marked as failed via webhook`);

    // TODO: Send payment failed notification to user
  } catch (error: any) {
    logger.error('Error handling payment capture denied:', error);
  }
};

/**
 * Handle payment capture refunded event
 */
const handlePaymentCaptureRefunded = async (event: any) => {
  try {
    const refund = event.resource;
    const captureId = refund.links?.find((link: any) => link.rel === 'up')?.href?.split('/').pop();

    if (!captureId) {
      logger.error('No capture ID in refund webhook event');
      return;
    }

    // Find transaction by capture ID
    const transaction = await PaymentTransaction.findOne({
      where: {
        transaction_id: captureId,
      },
    });

    if (!transaction) {
      logger.warn(`Transaction not found for capture ID: ${captureId}`);
      return;
    }

    // Update transaction with refund information
    await transaction.update({
      status: TransactionStatus.REFUNDED,
      refund_amount: parseFloat(refund.amount?.value || '0'),
      refund_reason: refund.note_to_payer || 'Refund processed',
      gateway_response: event.resource,
    });

    logger.info(`Transaction ${transaction.id} marked as refunded via webhook`);

    // Update booking payment status
    const booking = await Booking.findByPk(transaction.booking_id);

    if (booking) {
      const updatedPayment = {
        ...booking.payment,
        status: PaymentStatus.REFUNDED,
      };

      await booking.update({
        payment: updatedPayment,
        status: BookingStatus.CANCELLED,
      });

      logger.info(`Booking ${booking.booking_number} marked as cancelled due to refund`);

      // TODO: Send refund confirmation email
    }
  } catch (error: any) {
    logger.error('Error handling payment capture refunded:', error);
  }
};

/**
 * Get PayPal payment status
 * GET /api/payments/paypal/status/:orderId
 */
export const getPayPalPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return sendError(res, 'VAL_2002', 'Order ID is required', 400);
    }

    // Get order details from PayPal
    const orderDetails = await getPayPalOrderDetails(orderId);

    return sendSuccess(
      res,
      {
        order_id: orderDetails.id,
        status: orderDetails.status,
        payer: orderDetails.payer,
        purchase_units: orderDetails.purchase_units,
      },
      'PayPal order status retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Error getting PayPal payment status:', error);
    return sendError(
      res,
      'PAY_5002',
      'Failed to get PayPal payment status',
      500,
      error.message
    );
  }
};

/**
 * Create Bakong (KHQR) payment
 * POST /api/payments/bakong/create
 */
export const createBakongPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const { booking_id } = req.body;

    if (!booking_id) {
      return sendError(res, 'VAL_2002', 'Booking ID is required', 400);
    }

    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Check if booking is in pending status
    if (booking.status !== BookingStatus.PENDING) {
      return sendError(
        res,
        'BOOK_4004',
        'Booking is not in pending status',
        400
      );
    }

    // Check if payment method is Bakong
    if (booking.payment.method !== 'bakong') {
      return sendError(
        res,
        'PAY_5001',
        'Booking payment method is not Bakong',
        400
      );
    }

    // Calculate payment amount based on payment type
    let paymentAmount = booking.pricing.total;
    let paymentCurrency: 'USD' | 'KHR' = 'USD';

    if (booking.payment.type === 'deposit') {
      // 50-70% deposit (we'll use 50% for simplicity)
      paymentAmount = booking.pricing.total * 0.5;
    } else if (booking.payment.type === 'milestone') {
      // First milestone: 50%
      paymentAmount = booking.pricing.total * 0.5;
    }

    // Create Bakong payment (QR code)
    const bakongPayment = await createBakongPaymentService(
      paymentAmount,
      paymentCurrency,
      booking.booking_number,
      'DerLg Tourism',
      'Phnom Penh'
    );

    // Convert QR image buffer to base64 for easy transmission
    const qrImageBase64 = bakongPayment.imageBuffer
      ? bakongPayment.imageBuffer.toString('base64')
      : null;

    logger.info(
      `Bakong payment created for booking ${booking.booking_number}: ${bakongPayment.md5Hash}`
    );

    return sendSuccess(
      res,
      {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        qr_code: bakongPayment.qrCode,
        qr_image: qrImageBase64 ? `data:image/png;base64,${qrImageBase64}` : null,
        md5_hash: bakongPayment.md5Hash,
        deep_link: bakongPayment.deepLink,
        amount: paymentAmount,
        currency: paymentCurrency,
        payment_type: booking.payment.type,
      },
      'Bakong payment QR code generated successfully'
    );
  } catch (error: any) {
    logger.error('Error creating Bakong payment:', error);
    return sendError(
      res,
      'PAY_5003',
      'Failed to create Bakong payment',
      500,
      error.message
    );
  }
};

/**
 * Verify Bakong payment
 * POST /api/payments/bakong/verify
 */
export const verifyBakongPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const { booking_id, md5_hash } = req.body;

    if (!booking_id || !md5_hash) {
      return sendError(
        res,
        'VAL_2002',
        'Booking ID and MD5 hash are required',
        400
      );
    }

    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Check payment status with Bakong API
    const paymentStatus = await checkBakongPaymentStatus(md5_hash);

    // If payment is completed, create transaction record
    if (paymentStatus.status === 'PAID') {
      // Check if transaction already exists
      const existingTransaction = await PaymentTransaction.findOne({
        where: {
          booking_id: booking.id,
          transaction_id: paymentStatus.transactionId || md5_hash,
        },
      });

      if (existingTransaction) {
        return sendSuccess(
          res,
          {
            booking_id: booking.id,
            booking_number: booking.booking_number,
            payment_status: 'already_processed',
            transaction_id: existingTransaction.id,
          },
          'Payment already processed'
        );
      }

      // Determine payment type
      let paymentType = PaymentType.FULL;
      if (booking.payment.type === 'deposit') {
        paymentType = PaymentType.DEPOSIT;
      } else if (booking.payment.type === 'milestone') {
        paymentType = PaymentType.MILESTONE_1;
      }

      // Create payment transaction record
      const transaction = await PaymentTransaction.create({
        booking_id: booking.id,
        transaction_id: paymentStatus.transactionId || md5_hash,
        gateway: PaymentGateway.BAKONG,
        amount: paymentStatus.amount || booking.pricing.total,
        currency: (paymentStatus.currency as Currency) || Currency.USD,
        payment_type: paymentType,
        status: TransactionStatus.COMPLETED,
        gateway_response: {
          status: paymentStatus.status,
          hash: paymentStatus.hash,
          fromAccountId: paymentStatus.fromAccountId,
          toAccountId: paymentStatus.toAccountId,
          paidAt: paymentStatus.paidAt,
        },
        escrow_status: TransactionEscrowStatus.HELD,
        escrow_release_date: null,
        refund_amount: null,
        refund_reason: null,
      });

      // Hold payment in escrow
      await holdPaymentInEscrow(transaction.id, booking.id);

      // Update booking payment status
      const updatedPayment = {
        ...booking.payment,
        status:
          booking.payment.type === 'full'
            ? PaymentStatus.COMPLETED
            : PaymentStatus.PARTIAL,
        transactions: [
          ...booking.payment.transactions,
          {
            transaction_id: paymentStatus.transactionId || md5_hash,
            amount: paymentStatus.amount || booking.pricing.total,
            payment_type: paymentType,
            status: 'completed',
            timestamp: new Date(),
          },
        ],
      };

      // Update booking status
      const newBookingStatus =
        booking.payment.type === 'full'
          ? BookingStatus.CONFIRMED
          : BookingStatus.PENDING;

      await booking.update({
        payment: updatedPayment,
        status: newBookingStatus,
      });

      // Process milestone payment if applicable
      if (booking.payment.type === 'milestone') {
        await processMilestonePayment(booking.id, 1, transaction.id);
      }

      logger.info(
        `Bakong payment verified for booking ${booking.booking_number}: ${transaction.id}`
      );

      // TODO: Send confirmation email
      // TODO: Create Google Calendar event

      return sendSuccess(
        res,
        {
          booking_id: booking.id,
          booking_number: booking.booking_number,
          transaction_id: transaction.id,
          payment_status: 'completed',
          booking_status: newBookingStatus,
          amount: paymentStatus.amount,
          currency: paymentStatus.currency,
          paid_at: paymentStatus.paidAt,
        },
        'Bakong payment verified and processed successfully'
      );
    } else if (paymentStatus.status === 'PENDING') {
      return sendSuccess(
        res,
        {
          booking_id: booking.id,
          booking_number: booking.booking_number,
          payment_status: 'pending',
        },
        'Payment is still pending'
      );
    } else {
      return sendError(
        res,
        'PAY_5004',
        `Payment verification failed with status: ${paymentStatus.status}`,
        400
      );
    }
  } catch (error: any) {
    logger.error('Error verifying Bakong payment:', error);
    return sendError(
      res,
      'PAY_5003',
      'Failed to verify Bakong payment',
      500,
      error.message
    );
  }
};

/**
 * Get Bakong payment status
 * GET /api/payments/bakong/status/:md5Hash
 */
export const getBakongPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { md5Hash } = req.params;

    if (!md5Hash) {
      return sendError(res, 'VAL_2002', 'MD5 hash is required', 400);
    }

    // Check payment status with Bakong API
    const paymentStatus = await checkBakongPaymentStatus(md5Hash);

    return sendSuccess(
      res,
      {
        md5_hash: md5Hash,
        status: paymentStatus.status,
        transaction_id: paymentStatus.transactionId,
        amount: paymentStatus.amount,
        currency: paymentStatus.currency,
        paid_at: paymentStatus.paidAt,
        from_account: paymentStatus.fromAccountId,
        to_account: paymentStatus.toAccountId,
      },
      'Bakong payment status retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Error getting Bakong payment status:', error);
    return sendError(
      res,
      'PAY_5003',
      'Failed to get Bakong payment status',
      500,
      error.message
    );
  }
};

/**
 * Monitor Bakong payment with polling
 * POST /api/payments/bakong/monitor
 */
export const monitorBakongPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const { booking_id, md5_hash, timeout = 300000, interval = 5000 } = req.body;

    if (!booking_id || !md5_hash) {
      return sendError(
        res,
        'VAL_2002',
        'Booking ID and MD5 hash are required',
        400
      );
    }

    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    logger.info(`Starting payment monitoring for booking ${booking.booking_number}`);

    // Set up polling with timeout
    const startTime = Date.now();
    const maxAttempts = Math.floor(timeout / interval);
    let attempts = 0;

    const pollPaymentStatus = async (): Promise<any> => {
      attempts++;

      try {
        // Check payment status with Bakong API
        const paymentStatus = await checkBakongPaymentStatus(md5_hash);

        if (paymentStatus.status === 'PAID') {
          // Payment completed - process it
          logger.info(`Payment completed for booking ${booking.booking_number} after ${attempts} attempts`);

          // Check if transaction already exists
          const existingTransaction = await PaymentTransaction.findOne({
            where: {
              booking_id: booking.id,
              transaction_id: paymentStatus.transactionId || md5_hash,
            },
          });

          if (!existingTransaction) {
            // Determine payment type
            let paymentType = PaymentType.FULL;
            if (booking.payment.type === 'deposit') {
              paymentType = PaymentType.DEPOSIT;
            } else if (booking.payment.type === 'milestone') {
              paymentType = PaymentType.MILESTONE_1;
            }

            // Create payment transaction record
            const transaction = await PaymentTransaction.create({
              booking_id: booking.id,
              transaction_id: paymentStatus.transactionId || md5_hash,
              gateway: PaymentGateway.BAKONG,
              amount: paymentStatus.amount || booking.pricing.total,
              currency: (paymentStatus.currency as Currency) || Currency.USD,
              payment_type: paymentType,
              status: TransactionStatus.COMPLETED,
              gateway_response: {
                status: paymentStatus.status,
                hash: paymentStatus.hash,
                fromAccountId: paymentStatus.fromAccountId,
                toAccountId: paymentStatus.toAccountId,
                paidAt: paymentStatus.paidAt,
              },
              escrow_status: TransactionEscrowStatus.HELD,
              escrow_release_date: null,
              refund_amount: null,
              refund_reason: null,
            });

            // Update booking payment status
            const updatedPayment = {
              ...booking.payment,
              status:
                booking.payment.type === 'full'
                  ? PaymentStatus.COMPLETED
                  : PaymentStatus.PARTIAL,
              transactions: [
                ...booking.payment.transactions,
                {
                  transaction_id: paymentStatus.transactionId || md5_hash,
                  amount: paymentStatus.amount || booking.pricing.total,
                  payment_type: paymentType,
                  status: 'completed',
                  timestamp: new Date(),
                },
              ],
            };

            // Update booking status
            const newBookingStatus =
              booking.payment.type === 'full'
                ? BookingStatus.CONFIRMED
                : BookingStatus.PENDING;

            await booking.update({
              payment: updatedPayment,
              status: newBookingStatus,
            });

            return {
              success: true,
              status: 'PAID',
              transaction_id: transaction.id,
              booking_status: newBookingStatus,
              attempts: attempts,
            };
          } else {
            return {
              success: true,
              status: 'ALREADY_PROCESSED',
              transaction_id: existingTransaction.id,
              attempts: attempts,
            };
          }
        } else if (paymentStatus.status === 'FAILED' || paymentStatus.status === 'EXPIRED') {
          logger.warn(`Payment ${paymentStatus.status} for booking ${booking.booking_number}`);
          return {
            success: false,
            status: paymentStatus.status,
            attempts: attempts,
          };
        }

        // Payment still pending
        const elapsed = Date.now() - startTime;
        if (attempts >= maxAttempts || elapsed >= timeout) {
          logger.warn(`Payment monitoring timeout for booking ${booking.booking_number}`);
          return {
            success: false,
            status: 'TIMEOUT',
            attempts: attempts,
            elapsed: elapsed,
          };
        }

        // Continue polling
        await new Promise(resolve => setTimeout(resolve, interval));
        return pollPaymentStatus();

      } catch (error: any) {
        logger.error(`Error polling payment status (attempt ${attempts}):`, error);

        // If we haven't exceeded max attempts, continue polling
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
          return pollPaymentStatus();
        }

        throw error;
      }
    };

    // Start polling
    const result = await pollPaymentStatus();

    if (result.success) {
      return sendSuccess(
        res,
        {
          booking_id: booking.id,
          booking_number: booking.booking_number,
          payment_status: result.status,
          transaction_id: result.transaction_id,
          booking_status: result.booking_status,
          attempts: result.attempts,
        },
        'Payment monitoring completed successfully'
      );
    } else {
      return sendError(
        res,
        'PAY_5005',
        `Payment monitoring failed: ${result.status}`,
        400,
        { attempts: result.attempts, elapsed: result.elapsed }
      );
    }
  } catch (error: any) {
    logger.error('Error monitoring Bakong payment:', error);
    return sendError(
      res,
      'PAY_5003',
      'Failed to monitor Bakong payment',
      500,
      error.message
    );
  }
};

export default {
  createPayPalPayment,
  capturePayPalPayment,
  handlePayPalWebhook,
  getPayPalPaymentStatus,
  createBakongPayment,
  verifyBakongPayment,
  getBakongPaymentStatus,
  monitorBakongPayment,
  createStripePayment,
  verifyStripePayment,
  handleStripeWebhook,
  getStripePaymentStatus,
};

/**
 * Create Stripe payment intent
 * POST /api/payments/stripe/create
 */
export const createStripePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const { booking_id } = req.body;

    if (!booking_id) {
      return sendError(res, 'VAL_2002', 'Booking ID is required', 400);
    }

    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Check if booking is in pending status
    if (booking.status !== BookingStatus.PENDING) {
      return sendError(
        res,
        'BOOK_4004',
        'Booking is not in pending status',
        400
      );
    }

    // Check if payment method is Stripe
    if (booking.payment.method !== 'stripe') {
      return sendError(
        res,
        'PAY_5001',
        'Booking payment method is not Stripe',
        400
      );
    }

    // Calculate payment amount based on payment type
    let paymentAmount = booking.pricing.total;

    if (booking.payment.type === 'deposit') {
      // 50-70% deposit (we'll use 50% for simplicity)
      paymentAmount = booking.pricing.total * 0.5;
    } else if (booking.payment.type === 'milestone') {
      // First milestone: 50%
      paymentAmount = booking.pricing.total * 0.5;
    }

    // Get customer email from booking
    const customerEmail = booking.guest_details.email;

    // Create Stripe payment intent
    const paymentIntent = await createStripePaymentIntent(
      paymentAmount,
      'usd',
      booking.booking_number,
      `Hotel Booking - ${booking.booking_number}`,
      customerEmail
    );

    logger.info(
      `Stripe payment intent created for booking ${booking.booking_number}: ${paymentIntent.paymentIntentId}`
    );

    return sendSuccess(
      res,
      {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        payment_intent_id: paymentIntent.paymentIntentId,
        client_secret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_type: booking.payment.type,
        status: paymentIntent.status,
      },
      'Stripe payment intent created successfully'
    );
  } catch (error: any) {
    logger.error('Error creating Stripe payment:', error);
    return sendError(
      res,
      'PAY_5002',
      'Failed to create Stripe payment',
      500,
      error.message
    );
  }
};

/**
 * Verify Stripe payment
 * POST /api/payments/stripe/verify
 */
export const verifyStripePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const { booking_id, payment_intent_id } = req.body;

    if (!booking_id || !payment_intent_id) {
      return sendError(
        res,
        'VAL_2002',
        'Booking ID and payment intent ID are required',
        400
      );
    }

    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Get payment intent details from Stripe
    const paymentIntent = await getStripePaymentIntent(payment_intent_id);

    // Check if payment is successful
    if (paymentIntent.status !== 'succeeded') {
      return sendSuccess(
        res,
        {
          booking_id: booking.id,
          booking_number: booking.booking_number,
          payment_status: paymentIntent.status,
          requires_action: paymentIntent.status === 'requires_action',
        },
        `Payment status: ${paymentIntent.status}`
      );
    }

    // Check if transaction already exists
    const existingTransaction = await PaymentTransaction.findOne({
      where: {
        booking_id: booking.id,
        transaction_id: payment_intent_id,
      },
    });

    if (existingTransaction) {
      return sendSuccess(
        res,
        {
          booking_id: booking.id,
          booking_number: booking.booking_number,
          payment_status: 'already_processed',
          transaction_id: existingTransaction.id,
        },
        'Payment already processed'
      );
    }

    // Determine payment type
    let paymentType = PaymentType.FULL;
    if (booking.payment.type === 'deposit') {
      paymentType = PaymentType.DEPOSIT;
    } else if (booking.payment.type === 'milestone') {
      paymentType = PaymentType.MILESTONE_1;
    }

    // Get charge ID from payment intent
    const chargeId = paymentIntent.charges[0]?.id || payment_intent_id;

    // Create payment transaction record
    const transaction = await PaymentTransaction.create({
      booking_id: booking.id,
      transaction_id: payment_intent_id,
      gateway: PaymentGateway.STRIPE,
      amount: paymentIntent.amount,
      currency: Currency.USD,
      payment_type: paymentType,
      status: TransactionStatus.COMPLETED,
      gateway_response: {
        payment_intent_id: paymentIntent.id,
        charge_id: chargeId,
        status: paymentIntent.status,
        payment_method: paymentIntent.paymentMethod,
        metadata: paymentIntent.metadata,
      },
      escrow_status: TransactionEscrowStatus.HELD,
      escrow_release_date: null,
      refund_amount: null,
      refund_reason: null,
    });

    // Hold payment in escrow
    await holdPaymentInEscrow(transaction.id, booking.id);

    // Update booking payment status
    const updatedPayment = {
      ...booking.payment,
      status:
        booking.payment.type === 'full'
          ? PaymentStatus.COMPLETED
          : PaymentStatus.PARTIAL,
      transactions: [
        ...booking.payment.transactions,
        {
          transaction_id: payment_intent_id,
          amount: paymentIntent.amount,
          payment_type: paymentType,
          status: 'completed',
          timestamp: new Date(),
        },
      ],
    };

    // Update booking status
    const newBookingStatus =
      booking.payment.type === 'full'
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING;

    await booking.update({
      payment: updatedPayment,
      status: newBookingStatus,
    });

    // Process milestone payment if applicable
    if (booking.payment.type === 'milestone') {
      await processMilestonePayment(booking.id, 1, transaction.id);
    }

    logger.info(
      `Stripe payment verified for booking ${booking.booking_number}: ${transaction.id}`
    );

    // TODO: Send confirmation email
    // TODO: Create Google Calendar event

    return sendSuccess(
      res,
      {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        transaction_id: transaction.id,
        payment_intent_id: payment_intent_id,
        charge_id: chargeId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_status: updatedPayment.status,
        booking_status: newBookingStatus,
      },
      'Stripe payment verified and processed successfully'
    );
  } catch (error: any) {
    logger.error('Error verifying Stripe payment:', error);
    return sendError(
      res,
      'PAY_5002',
      'Failed to verify Stripe payment',
      500,
      error.message
    );
  }
};

/**
 * Handle Stripe webhook events
 * POST /api/payments/stripe/webhook
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error('Stripe webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!signature) {
      logger.error('No Stripe signature in webhook request');
      return res.status(400).json({ error: 'No signature provided' });
    }

    // Verify webhook signature
    const event = verifyStripeWebhook(
      req.body,
      signature,
      webhookSecret
    );

    logger.info(`Stripe webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handleStripePaymentIntentFailed(event);
        break;

      case 'charge.refunded':
        await handleStripeChargeRefunded(event);
        break;

      case 'payment_intent.requires_action':
        await handleStripePaymentIntentRequiresAction(event);
        break;

      default:
        logger.info(`Unhandled Stripe webhook event: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Error handling Stripe webhook:', error);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle payment intent succeeded event
 */
const handleStripePaymentIntentSucceeded = async (event: any) => {
  try {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const bookingNumber = paymentIntent.metadata?.booking_number;

    if (!bookingNumber) {
      logger.warn('No booking number in payment intent metadata');
      return;
    }

    // Find booking by booking number
    const booking = await Booking.findOne({
      where: {
        booking_number: bookingNumber,
      },
    });

    if (!booking) {
      logger.warn(`Booking not found for number: ${bookingNumber}`);
      return;
    }

    // Check if transaction already exists
    const existingTransaction = await PaymentTransaction.findOne({
      where: {
        booking_id: booking.id,
        transaction_id: paymentIntentId,
      },
    });

    if (existingTransaction) {
      logger.info(`Transaction already exists for payment intent: ${paymentIntentId}`);
      return;
    }

    // Determine payment type
    let paymentType = PaymentType.FULL;
    if (booking.payment.type === 'deposit') {
      paymentType = PaymentType.DEPOSIT;
    } else if (booking.payment.type === 'milestone') {
      paymentType = PaymentType.MILESTONE_1;
    }

    // Get charge ID
    const chargeId = paymentIntent.charges?.data[0]?.id || paymentIntentId;

    // Create payment transaction record
    const transaction = await PaymentTransaction.create({
      booking_id: booking.id,
      transaction_id: paymentIntentId,
      gateway: PaymentGateway.STRIPE,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: Currency.USD,
      payment_type: paymentType,
      status: TransactionStatus.COMPLETED,
      gateway_response: {
        payment_intent_id: paymentIntent.id,
        charge_id: chargeId,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method,
      },
      escrow_status: TransactionEscrowStatus.HELD,
      escrow_release_date: null,
      refund_amount: null,
      refund_reason: null,
    });

    // Update booking payment status
    const updatedPayment = {
      ...booking.payment,
      status:
        booking.payment.type === 'full'
          ? PaymentStatus.COMPLETED
          : PaymentStatus.PARTIAL,
      transactions: [
        ...booking.payment.transactions,
        {
          transaction_id: paymentIntentId,
          amount: paymentIntent.amount / 100,
          payment_type: paymentType,
          status: 'completed',
          timestamp: new Date(),
        },
      ],
    };

    // Update booking status
    const newBookingStatus =
      booking.payment.type === 'full'
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING;

    await booking.update({
      payment: updatedPayment,
      status: newBookingStatus,
    });

    logger.info(`Booking ${booking.booking_number} confirmed via Stripe webhook`);

    // TODO: Send confirmation email

    // Create Google Calendar event if booking is confirmed
    if (newBookingStatus === BookingStatus.CONFIRMED) {
      const bookingWithDetails = await Booking.findByPk(booking.id, {
        include: [
          {
            model: Hotel,
            as: 'hotel',
          },
          {
            model: Room,
            as: 'room',
          },
        ],
      });

      if (bookingWithDetails) {
        const hotel = (bookingWithDetails as any).hotel;
        const room = (bookingWithDetails as any).room;

        const calendarEventId = await createCalendarEvent({
          booking_number: bookingWithDetails.booking_number,
          hotel_name: hotel.name,
          hotel_address: hotel.location.address,
          hotel_phone: hotel.contact.phone,
          hotel_location: {
            latitude: hotel.location.latitude,
            longitude: hotel.location.longitude,
          },
          room_type: room.room_type,
          check_in: bookingWithDetails.check_in,
          check_out: bookingWithDetails.check_out,
          guest_name: bookingWithDetails.guest_details.name,
          guest_email: bookingWithDetails.guest_details.email,
          guest_phone: bookingWithDetails.guest_details.phone,
          special_requests: bookingWithDetails.guest_details.special_requests,
        });

        if (calendarEventId) {
          await bookingWithDetails.update({
            calendar_event_id: calendarEventId,
          });
          logger.info(`Calendar event created for booking ${booking.booking_number}: ${calendarEventId}`);
        }
      }
    }
  } catch (error: any) {
    logger.error('Error handling Stripe payment intent succeeded:', error);
  }
};

/**
 * Handle payment intent failed event
 */
const handleStripePaymentIntentFailed = async (event: any) => {
  try {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const bookingNumber = paymentIntent.metadata?.booking_number;

    if (!bookingNumber) {
      logger.warn('No booking number in payment intent metadata');
      return;
    }

    // Find transaction by payment intent ID
    const transaction = await PaymentTransaction.findOne({
      where: {
        transaction_id: paymentIntentId,
      },
    });

    if (transaction) {
      // Update transaction status
      await transaction.update({
        status: TransactionStatus.FAILED,
        gateway_response: paymentIntent,
      });

      logger.info(`Transaction ${transaction.id} marked as failed via webhook`);
    }

    // TODO: Send payment failed notification to user
  } catch (error: any) {
    logger.error('Error handling Stripe payment intent failed:', error);
  }
};

/**
 * Handle charge refunded event
 */
const handleStripeChargeRefunded = async (event: any) => {
  try {
    const charge = event.data.object;
    const chargeId = charge.id;
    const refundAmount = charge.amount_refunded / 100; // Convert from cents

    // Find transaction by charge ID in gateway_response
    const transaction = await PaymentTransaction.findOne({
      where: {
        gateway: PaymentGateway.STRIPE,
      },
    });

    if (!transaction) {
      logger.warn(`Transaction not found for charge ID: ${chargeId}`);
      return;
    }

    // Update transaction with refund information
    await transaction.update({
      status: TransactionStatus.REFUNDED,
      refund_amount: refundAmount,
      refund_reason: 'Refund processed via Stripe',
      gateway_response: charge,
    });

    logger.info(`Transaction ${transaction.id} marked as refunded via webhook`);

    // Update booking payment status
    const booking = await Booking.findByPk(transaction.booking_id);

    if (booking) {
      const updatedPayment = {
        ...booking.payment,
        status: PaymentStatus.REFUNDED,
      };

      await booking.update({
        payment: updatedPayment,
        status: BookingStatus.CANCELLED,
      });

      logger.info(`Booking ${booking.booking_number} marked as cancelled due to refund`);

      // TODO: Send refund confirmation email
    }
  } catch (error: any) {
    logger.error('Error handling Stripe charge refunded:', error);
  }
};

/**
 * Handle payment intent requires action event
 */
const handleStripePaymentIntentRequiresAction = async (event: any) => {
  try {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;

    logger.info(`Payment intent ${paymentIntentId} requires action: ${paymentIntent.next_action?.type}`);

    // This event is informational - the client will handle the required action
    // (e.g., 3D Secure authentication)
  } catch (error: any) {
    logger.error('Error handling Stripe payment intent requires action:', error);
  }
};

/**
 * Get Stripe payment status
 * GET /api/payments/stripe/status/:paymentIntentId
 */
export const getStripePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return sendError(res, 'VAL_2002', 'Payment intent ID is required', 400);
    }

    // Get payment intent details from Stripe
    const paymentIntent = await getStripePaymentIntent(paymentIntentId);

    return sendSuccess(
      res,
      {
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_method: paymentIntent.paymentMethod,
        charges: paymentIntent.charges,
        metadata: paymentIntent.metadata,
      },
      'Stripe payment status retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Error getting Stripe payment status:', error);
    return sendError(
      res,
      'PAY_5002',
      'Failed to get Stripe payment status',
      500,
      error.message
    );
  }
};
