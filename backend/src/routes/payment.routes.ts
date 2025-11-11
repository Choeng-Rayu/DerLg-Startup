import { Router } from 'express';
import {
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
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

/**
 * PayPal Payment Routes
 */

// Create PayPal payment intent (requires authentication)
router.post('/paypal/create', authenticate, createPayPalPayment);

// Capture PayPal payment (requires authentication)
router.post('/paypal/capture', authenticate, capturePayPalPayment);

// PayPal webhook handler (no authentication required - verified by PayPal signature)
router.post('/paypal/webhook', handlePayPalWebhook);

// Get PayPal payment status (requires authentication)
router.get('/paypal/status/:orderId', authenticate, getPayPalPaymentStatus);

// Success redirect endpoint (for browser redirects from PayPal)
router.get('/paypal/success', (req, res) => {
  const { token } = req.query;
  // Redirect to frontend with order ID
  res.redirect(`${process.env.CORS_ORIGIN}/payment/success?token=${token}`);
});

// Cancel redirect endpoint (for browser redirects from PayPal)
router.get('/paypal/cancel', (req, res) => {
  const { token } = req.query;
  // Redirect to frontend with order ID
  res.redirect(`${process.env.CORS_ORIGIN}/payment/cancel?token=${token}`);
});

/**
 * Bakong (KHQR) Payment Routes
 * Note: Uses polling method instead of webhooks due to Bakong API requirements
 */

// Create Bakong payment (generate QR code) (requires authentication)
router.post('/bakong/create', authenticate, createBakongPayment);

// Verify Bakong payment (manual check) (requires authentication)
router.post('/bakong/verify', authenticate, verifyBakongPayment);

// Monitor Bakong payment (automatic polling) (requires authentication)
router.post('/bakong/monitor', authenticate, monitorBakongPayment);

// Get Bakong payment status (requires authentication)
router.get('/bakong/status/:md5Hash', authenticate, getBakongPaymentStatus);

/**
 * Stripe Payment Routes
 * Note: Uses webhook for real-time payment status updates
 */

// Create Stripe payment intent (requires authentication)
router.post('/stripe/create', authenticate, createStripePayment);

// Verify Stripe payment (requires authentication)
router.post('/stripe/verify', authenticate, verifyStripePayment);

// Stripe webhook handler (no authentication required - verified by Stripe signature)
// Note: This route needs raw body for signature verification
router.post('/stripe/webhook', handleStripeWebhook);

// Get Stripe payment status (requires authentication)
router.get('/stripe/status/:paymentIntentId', authenticate, getStripePaymentStatus);

export default router;
