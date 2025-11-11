import Stripe from 'stripe';
import logger from '../utils/logger';

/**
 * Stripe Service
 * Handles Stripe payment processing including payment intent creation, confirmation, and 3D Secure authentication
 */

// Initialize Stripe client
let stripeClient: Stripe | null = null;

/**
 * Get Stripe client instance
 */
const getStripeClient = (): Stripe => {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Stripe secret key not configured');
  }

  // Create Stripe client
  stripeClient = new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
    typescript: true,
  });

  logger.info('Stripe client initialized');

  return stripeClient;
};

/**
 * Create Stripe payment intent
 * @param amount - Payment amount in cents (e.g., 1000 = $10.00)
 * @param currency - Currency code (default: USD)
 * @param bookingNumber - Booking reference number
 * @param description - Payment description
 * @param customerEmail - Customer email address
 * @returns Payment intent details including client secret
 */
export const createStripePaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  bookingNumber: string,
  description: string = 'Hotel Booking Payment',
  customerEmail?: string
): Promise<{
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}> => {
  try {
    const stripe = getStripeClient();

    // Convert amount to cents (Stripe expects smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      description: description,
      metadata: {
        booking_number: bookingNumber,
      },
      receipt_email: customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
      // Enable 3D Secure authentication
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });

    logger.info(`Stripe payment intent created: ${paymentIntent.id} for booking ${bookingNumber}`);

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency,
    };
  } catch (error: any) {
    logger.error('Error creating Stripe payment intent:', error);
    throw new Error(`Stripe payment intent creation failed: ${error.message}`);
  }
};

/**
 * Retrieve Stripe payment intent
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Payment intent details
 */
export const getStripePaymentIntent = async (
  paymentIntentId: string
): Promise<{
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  charges: any[];
  metadata: any;
}> => {
  try {
    const stripe = getStripeClient();

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    logger.info(`Stripe payment intent retrieved: ${paymentIntentId}`);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method as string | undefined,
      charges: (paymentIntent as any).charges?.data || [],
      metadata: paymentIntent.metadata,
    };
  } catch (error: any) {
    logger.error('Error retrieving Stripe payment intent:', error);
    throw new Error(`Failed to retrieve Stripe payment intent: ${error.message}`);
  }
};

/**
 * Confirm Stripe payment intent
 * @param paymentIntentId - Stripe payment intent ID
 * @param paymentMethodId - Stripe payment method ID
 * @returns Confirmation result
 */
export const confirmStripePaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{
  id: string;
  status: string;
  amount: number;
  currency: string;
  chargeId?: string;
  requiresAction: boolean;
  nextActionType?: string;
}> => {
  try {
    const stripe = getStripeClient();

    // Confirm payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    logger.info(`Stripe payment intent confirmed: ${paymentIntentId}, status: ${paymentIntent.status}`);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      chargeId: (paymentIntent as any).charges?.data[0]?.id,
      requiresAction: paymentIntent.status === 'requires_action',
      nextActionType: paymentIntent.next_action?.type,
    };
  } catch (error: any) {
    logger.error('Error confirming Stripe payment intent:', error);
    throw new Error(`Stripe payment intent confirmation failed: ${error.message}`);
  }
};

/**
 * Cancel Stripe payment intent
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Cancellation result
 */
export const cancelStripePaymentIntent = async (
  paymentIntentId: string
): Promise<{
  id: string;
  status: string;
}> => {
  try {
    const stripe = getStripeClient();

    // Cancel payment intent
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    logger.info(`Stripe payment intent cancelled: ${paymentIntentId}`);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
    };
  } catch (error: any) {
    logger.error('Error cancelling Stripe payment intent:', error);
    throw new Error(`Stripe payment intent cancellation failed: ${error.message}`);
  }
};

/**
 * Create Stripe refund
 * @param chargeId - Stripe charge ID or payment intent ID
 * @param amount - Refund amount in dollars (optional, full refund if not specified)
 * @param reason - Refund reason
 * @returns Refund details
 */
export const createStripeRefund = async (
  chargeId: string,
  amount?: number,
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer'
): Promise<{
  refundId: string;
  status: string;
  amount: number;
  currency: string;
  chargeId: string;
}> => {
  try {
    const stripe = getStripeClient();

    const refundParams: Stripe.RefundCreateParams = {
      charge: chargeId,
      reason: reason,
    };

    // Add amount if partial refund
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);

    logger.info(`Stripe refund created: ${refund.id} for charge ${chargeId}`);

    return {
      refundId: refund.id,
      status: refund.status || '',
      amount: (refund.amount || 0) / 100,
      currency: refund.currency || 'usd',
      chargeId: refund.charge as string,
    };
  } catch (error: any) {
    logger.error('Error creating Stripe refund:', error);
    throw new Error(`Stripe refund creation failed: ${error.message}`);
  }
};

/**
 * Verify Stripe webhook signature
 * @param payload - Request body as string
 * @param signature - Stripe signature header
 * @param webhookSecret - Stripe webhook secret
 * @returns Verified event object
 */
export const verifyStripeWebhook = (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event => {
  try {
    const stripe = getStripeClient();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    logger.info(`Stripe webhook verified: ${event.type}`);

    return event;
  } catch (error: any) {
    logger.error('Error verifying Stripe webhook:', error);
    throw new Error(`Stripe webhook verification failed: ${error.message}`);
  }
};

/**
 * Get Stripe charge details
 * @param chargeId - Stripe charge ID
 * @returns Charge details
 */
export const getStripeCharge = async (
  chargeId: string
): Promise<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
  refunded: boolean;
  paymentMethod: any;
  receiptUrl?: string;
}> => {
  try {
    const stripe = getStripeClient();

    // Retrieve charge
    const charge = await stripe.charges.retrieve(chargeId);

    logger.info(`Stripe charge retrieved: ${chargeId}`);

    return {
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      status: charge.status || '',
      paid: charge.paid,
      refunded: charge.refunded,
      paymentMethod: charge.payment_method_details,
      receiptUrl: charge.receipt_url || undefined,
    };
  } catch (error: any) {
    logger.error('Error retrieving Stripe charge:', error);
    throw new Error(`Failed to retrieve Stripe charge: ${error.message}`);
  }
};

/**
 * Create Stripe customer
 * @param email - Customer email
 * @param name - Customer name
 * @param metadata - Additional metadata
 * @returns Customer details
 */
export const createStripeCustomer = async (
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<{
  customerId: string;
  email: string;
  name?: string;
}> => {
  try {
    const stripe = getStripeClient();

    // Create customer
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: metadata,
    });

    logger.info(`Stripe customer created: ${customer.id}`);

    return {
      customerId: customer.id,
      email: customer.email || '',
      name: customer.name || undefined,
    };
  } catch (error: any) {
    logger.error('Error creating Stripe customer:', error);
    throw new Error(`Stripe customer creation failed: ${error.message}`);
  }
};

/**
 * Get Stripe customer
 * @param customerId - Stripe customer ID
 * @returns Customer details
 */
export const getStripeCustomer = async (
  customerId: string
): Promise<{
  id: string;
  email: string;
  name?: string;
  metadata: any;
}> => {
  try {
    const stripe = getStripeClient();

    // Retrieve customer
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    logger.info(`Stripe customer retrieved: ${customerId}`);

    return {
      id: customer.id,
      email: (customer as any).email || '',
      name: (customer as any).name || undefined,
      metadata: (customer as any).metadata,
    };
  } catch (error: any) {
    logger.error('Error retrieving Stripe customer:', error);
    throw new Error(`Failed to retrieve Stripe customer: ${error.message}`);
  }
};

export default {
  createStripePaymentIntent,
  getStripePaymentIntent,
  confirmStripePaymentIntent,
  cancelStripePaymentIntent,
  createStripeRefund,
  verifyStripeWebhook,
  getStripeCharge,
  createStripeCustomer,
  getStripeCustomer,
};
