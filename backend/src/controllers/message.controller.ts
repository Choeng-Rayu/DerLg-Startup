import { Request, Response } from 'express';
import { Message, Booking, User } from '../models';
import logger from '../utils/logger';
import { sendSuccess, sendError } from '../utils/response';
import websocketService from '../services/websocket.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send a new message
 * POST /api/messages
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userType = (req as any).user?.user_type;
    const { booking_id, recipient_id, message, attachments } = req.body;

    // Validate required fields
    if (!booking_id || !recipient_id || !message) {
      return sendError(res, 'VAL_2002', 'Missing required fields: booking_id, recipient_id, message', 400);
    }

    // Validate message length
    if (message.trim().length === 0 || message.length > 5000) {
      return sendError(res, 'VAL_2001', 'Message must be between 1 and 5000 characters', 400);
    }

    // Verify booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Verify recipient exists
    const recipient = await User.findByPk(recipient_id);
    if (!recipient) {
      return sendError(res, 'RES_3001', 'Recipient not found', 404);
    }

    // Determine sender type
    const senderType = userType === 'admin' ? 'hotel_admin' : 'tourist';

    // Create message
    const newMessage = await Message.create({
      id: uuidv4(),
      booking_id,
      sender_id: userId,
      sender_type: senderType,
      recipient_id,
      message: message.trim(),
      attachments: attachments || [],
      is_read: false,
      read_at: null,
    });

    logger.info(`Message created: ${newMessage.id}`, {
      booking_id,
      sender_id: userId,
      recipient_id,
    });

    // Broadcast message via WebSocket
    websocketService.broadcastMessage({
      id: newMessage.id,
      booking_id: newMessage.booking_id,
      sender_id: newMessage.sender_id,
      sender_type: newMessage.sender_type,
      recipient_id: newMessage.recipient_id,
      message: newMessage.message,
      attachments: newMessage.attachments,
      created_at: newMessage.created_at,
      is_read: newMessage.is_read,
    });

    return sendSuccess(
      res,
      {
        id: newMessage.id,
        booking_id: newMessage.booking_id,
        sender_id: newMessage.sender_id,
        sender_type: newMessage.sender_type,
        recipient_id: newMessage.recipient_id,
        message: newMessage.message,
        attachments: newMessage.attachments,
        is_read: newMessage.is_read,
        created_at: newMessage.created_at,
      },
      'Message sent successfully',
      201
    );
  } catch (error: any) {
    logger.error('Error sending message:', error);
    return sendError(res, 'SYS_9001', 'Failed to send message', 500, error.message);
  }
};

/**
 * Get messages for a booking
 * GET /api/messages/:booking_id
 */
export const getBookingMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { booking_id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Verify booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return sendError(res, 'RES_3001', 'Booking not found', 404);
    }

    // Get messages
    const { count, rows } = await Message.findAndCountAll({
      where: { booking_id },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'recipient', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
      order: [['created_at', 'ASC']],
      limit,
      offset,
    });

    return sendSuccess(
      res,
      {
        messages: rows,
        pagination: {
          total: count,
          limit,
          offset,
        },
      },
      'Messages retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Error retrieving messages:', error);
    return sendError(res, 'SYS_9001', 'Failed to retrieve messages', 500, error.message);
  }
};

/**
 * Mark message as read
 * PUT /api/messages/:message_id/read
 */
export const markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message_id } = req.params;

    // Find message
    const message = await Message.findByPk(message_id);
    if (!message) {
      return sendError(res, 'RES_3001', 'Message not found', 404);
    }

    // Mark as read
    await message.markAsRead();

    logger.info(`Message marked as read: ${message_id}`);

    // Broadcast read status via WebSocket
    websocketService.broadcastMessageReadStatus({
      message_id: message.id,
      booking_id: message.booking_id,
      read_by: message.recipient_id,
      read_at: message.read_at!,
    });

    return sendSuccess(
      res,
      {
        id: message.id,
        is_read: message.is_read,
        read_at: message.read_at,
      },
      'Message marked as read'
    );
  } catch (error: any) {
    logger.error('Error marking message as read:', error);
    return sendError(res, 'SYS_9001', 'Failed to mark message as read', 500, error.message);
  }
};

/**
 * Get unread message count for a user
 * GET /api/messages/unread/count
 */
export const getUnreadMessageCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    // Count unread messages
    const unreadCount = await Message.count({
      where: {
        recipient_id: userId,
        is_read: false,
      },
    });

    return sendSuccess(
      res,
      {
        unread_count: unreadCount,
      },
      'Unread message count retrieved'
    );
  } catch (error: any) {
    logger.error('Error retrieving unread message count:', error);
    return sendError(res, 'SYS_9001', 'Failed to retrieve unread message count', 500, error.message);
  }
};

