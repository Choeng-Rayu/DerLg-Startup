import { Client, Environment, LogLevel, OrdersController, PaymentsController } from '@paypal/paypal-server-sdk';
import logger from '../utils/logger';

/**
 * PayPal Service
 * Handles PayPal payment processing including order creation and capture
 */

// Initialize PayPal client
let paypalClient: Client | null = null;
let ordersController: OrdersController | null = null;
let paymentsController: PaymentsController | null = null;

/**
 * Get PayPal client instance
 */
const getPayPalClient = (): Client => {
  if (paypalClient) {
    return paypalClient;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  // Create client
  paypalClient = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    timeout: 0,
    environment: mode === 'production' ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });

  // Initialize controllers
  ordersController = new OrdersController(paypalClient);
  paymentsController = new PaymentsController(paypalClient);

  logger.info(`PayPal client initialized in ${mode} mode`);

  return paypalClient;
};

/**
 * Get Orders Controller
 */
const getOrdersController = (): OrdersController => {
  if (!ordersController) {
    getPayPalClient();
  }
  return ordersController!;
};

/**
 * Get Payments Controller
 */
const getPaymentsController = (): PaymentsController => {
  if (!paymentsController) {
    getPayPalClient();
  }
  return paymentsController!;
};

/**
 * Create PayPal order
 * @param amount - Order amount in USD
 * @param currency - Currency code (default: USD)
 * @param bookingNumber - Booking reference number
 * @param description - Order description
 * @returns PayPal order ID and approval URL
 */
export const createPayPalOrder = async (
  amount: number,
  currency: string = 'USD',
  bookingNumber: string,
  description: string = 'Hotel Booking Payment'
): Promise<{
  orderId: string;
  approvalUrl: string;
  status: string;
}> => {
  try {
    const controller = getOrdersController();

    // Create order
    const { result } = await controller.createOrder({
      body: {
        intent: 'CAPTURE' as any,
        purchaseUnits: [
          {
            referenceId: bookingNumber,
            description: description,
            amount: {
              currencyCode: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        applicationContext: {
          brandName: 'DerLg Tourism',
          landingPage: 'BILLING' as any,
          userAction: 'PAY_NOW' as any,
          returnUrl: `${process.env.API_URL}/api/payments/paypal/success`,
          cancelUrl: `${process.env.API_URL}/api/payments/paypal/cancel`,
        },
      },
      prefer: 'return=representation',
    });

    // Extract approval URL
    const approvalUrl =
      result.links?.find((link: any) => link.rel === 'approve')?.href || '';

    logger.info(`PayPal order created: ${result.id} for booking ${bookingNumber}`);

    return {
      orderId: result.id || '',
      approvalUrl: approvalUrl,
      status: result.status || '',
    };
  } catch (error: any) {
    logger.error('Error creating PayPal order:', error);
    throw new Error(`PayPal order creation failed: ${error.message}`);
  }
};

/**
 * Capture PayPal order payment
 * @param orderId - PayPal order ID
 * @returns Capture details including transaction ID and status
 */
export const capturePayPalOrder = async (
  orderId: string
): Promise<{
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  payerEmail: string;
  payerName: string;
  captureId: string;
  gatewayResponse: any;
}> => {
  try {
    const controller = getOrdersController();

    // Capture order
    const { result } = await controller.captureOrder({
      id: orderId,
      prefer: 'return=representation',
    });

    // Extract capture details
    const capture = result.purchaseUnits?.[0]?.payments?.captures?.[0];

    if (!capture) {
      throw new Error('No capture information found in PayPal response');
    }

    const payer = result.payer;

    logger.info(`PayPal order captured: ${orderId}, capture ID: ${capture.id}`);

    return {
      transactionId: orderId,
      status: capture.status || '',
      amount: parseFloat(capture.amount?.value || '0'),
      currency: capture.amount?.currencyCode || 'USD',
      payerEmail: payer?.emailAddress || '',
      payerName: `${payer?.name?.givenName || ''} ${payer?.name?.surname || ''}`.trim(),
      captureId: capture.id || '',
      gatewayResponse: result,
    };
  } catch (error: any) {
    logger.error('Error capturing PayPal order:', error);
    throw new Error(`PayPal order capture failed: ${error.message}`);
  }
};

/**
 * Get PayPal order details
 * @param orderId - PayPal order ID
 * @returns Order details
 */
export const getPayPalOrderDetails = async (orderId: string): Promise<any> => {
  try {
    const controller = getOrdersController();

    // Get order details
    const { result } = await controller.getOrder({
      id: orderId,
    });

    logger.info(`PayPal order details retrieved: ${orderId}`);

    return result;
  } catch (error: any) {
    logger.error('Error getting PayPal order details:', error);
    throw new Error(`Failed to get PayPal order details: ${error.message}`);
  }
};

/**
 * Refund PayPal capture
 * @param captureId - PayPal capture ID
 * @param amount - Refund amount (optional, full refund if not specified)
 * @param currency - Currency code
 * @param note - Refund note
 * @returns Refund details
 */
export const refundPayPalCapture = async (
  captureId: string,
  amount?: number,
  currency: string = 'USD',
  note: string = 'Booking cancellation refund'
): Promise<{
  refundId: string;
  status: string;
  amount: number;
  currency: string;
}> => {
  try {
    const controller = getPaymentsController();

    const collect: any = {
      captureId: captureId,
      body: {
        noteToPayer: note,
      },
      prefer: 'return=representation',
    };

    // Add amount if partial refund
    if (amount) {
      collect.body.amount = {
        currencyCode: currency,
        value: amount.toFixed(2),
      };
    }

    const { result } = await controller.refundCapturedPayment(collect);

    logger.info(`PayPal capture refunded: ${captureId}, refund ID: ${result.id}`);

    return {
      refundId: result.id || '',
      status: result.status || '',
      amount: parseFloat(result.amount?.value || '0'),
      currency: result.amount?.currencyCode || 'USD',
    };
  } catch (error: any) {
    logger.error('Error refunding PayPal capture:', error);
    throw new Error(`PayPal refund failed: ${error.message}`);
  }
};

/**
 * Verify PayPal webhook signature
 * @param body - Request body
 * @returns True if signature is valid
 */
export const verifyPayPalWebhook = async (
  body: any
): Promise<boolean> => {
  try {
    // TODO: Implement webhook signature verification
    // This requires webhook ID from PayPal dashboard
    // For now, we'll validate the basic structure

    if (!body.event_type || !body.resource) {
      return false;
    }

    logger.info(`PayPal webhook received: ${body.event_type}`);

    return true;
  } catch (error: any) {
    logger.error('Error verifying PayPal webhook:', error);
    return false;
  }
};

export default {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails,
  refundPayPalCapture,
  verifyPayPalWebhook,
};
