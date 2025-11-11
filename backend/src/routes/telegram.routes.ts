import { Router } from 'express';
import {
  updateProviderStatus,
  sendBookingNotification,
  getProviderStatus
} from '../controllers/telegram.controller';

const router = Router();

/**
 * @route   POST /api/webhook/telegram/status
 * @desc    Update provider (guide/driver) status via webhook
 * @access  Public (webhook)
 * @body    { telegram_user_id, telegram_username, status, timestamp }
 */
router.post('/status', updateProviderStatus);

/**
 * @route   POST /api/webhook/telegram/booking
 * @desc    Send booking notification to provider via webhook
 * @access  Public (webhook)
 * @body    { provider_id, booking_id, details }
 */
router.post('/booking', sendBookingNotification);

/**
 * @route   GET /api/webhook/telegram/status/:telegram_user_id
 * @desc    Get provider status by Telegram user ID
 * @access  Public (webhook)
 */
router.get('/status/:telegram_user_id', getProviderStatus);

export default router;
