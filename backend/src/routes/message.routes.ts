import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  sendMessage,
  getBookingMessages,
  markMessageAsRead,
  getUnreadMessageCount,
} from '../controllers/message.controller';

const router = Router();

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @access  Private (authenticated users)
 * @body    { booking_id, recipient_id, message, attachments? }
 */
router.post('/', authenticate, sendMessage);

/**
 * @route   GET /api/messages/:booking_id
 * @desc    Get all messages for a booking
 * @access  Private (authenticated users)
 * @query   { limit?, offset? }
 */
router.get('/:booking_id', authenticate, getBookingMessages);

/**
 * @route   PUT /api/messages/:message_id/read
 * @desc    Mark a message as read
 * @access  Private (authenticated users)
 */
router.put('/:message_id/read', authenticate, markMessageAsRead);

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get unread message count for current user
 * @access  Private (authenticated users)
 */
router.get('/unread/count', authenticate, getUnreadMessageCount);

export default router;

