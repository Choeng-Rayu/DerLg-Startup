import { Request, Response } from 'express';
import { Guide, Transportation } from '../models';
import logger from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response';
import websocketService from '../services/websocket.service';

/**
 * Webhook handler for Telegram status updates
 * POST /api/webhook/telegram/status
 */
export const updateProviderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telegram_user_id, telegram_username, status, timestamp } = req.body;

    // Validate required fields
    if (!telegram_user_id || !status) {
      res.status(400).json(errorResponse('Missing required fields: telegram_user_id and status'));
      return;
    }

    // Validate status value
    const validStatuses = ['available', 'unavailable', 'on_tour', 'on_trip'];
    if (!validStatuses.includes(status)) {
      res.status(400).json(errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`));
      return;
    }

    // Try to find guide
    const guide = await (Guide as any).findOne({
      where: { telegram_user_id }
    });

    if (guide) {
      const oldStatus = guide.status;
      const newStatus = status === 'on_tour' || status === 'unavailable' ? 'unavailable' : 'available';
      const updateTimestamp = timestamp ? new Date(timestamp) : new Date();

      // Update guide status
      await guide.update({
        status: newStatus,
        last_status_update: updateTimestamp
      });

      logger.info(`Guide ${guide.name} (${telegram_user_id}) status updated to ${status} via webhook`);

      // Broadcast status update via WebSocket
      websocketService.broadcastProviderStatusUpdate({
        provider_type: 'guide',
        provider_id: guide.id,
        provider_name: guide.name,
        telegram_user_id,
        telegram_username,
        old_status: oldStatus,
        new_status: newStatus,
        timestamp: updateTimestamp
      });

      // Broadcast booking availability update
      websocketService.broadcastBookingAvailabilityUpdate({
        provider_type: 'guide',
        provider_id: guide.id,
        available: newStatus === 'available',
        timestamp: updateTimestamp
      });

      res.json(successResponse({
        message: 'Guide status updated successfully',
        provider_type: 'guide',
        provider_id: guide.id,
        provider_name: guide.name,
        new_status: guide.status,
        telegram_user_id,
        telegram_username
      }));
      return;
    }

    // Try to find driver
    const driver = await (Transportation as any).findOne({
      where: { telegram_user_id }
    });

    if (driver) {
      const oldStatus = driver.status;
      const newStatus = status === 'on_trip' || status === 'unavailable' ? 'unavailable' : 'available';
      const updateTimestamp = timestamp ? new Date(timestamp) : new Date();

      // Update driver status
      await driver.update({
        status: newStatus,
        last_status_update: updateTimestamp
      });

      logger.info(`Driver ${driver.driver_name} (${telegram_user_id}) status updated to ${status} via webhook`);

      // Broadcast status update via WebSocket
      websocketService.broadcastProviderStatusUpdate({
        provider_type: 'driver',
        provider_id: driver.id,
        provider_name: driver.driver_name,
        telegram_user_id,
        telegram_username,
        old_status: oldStatus,
        new_status: newStatus,
        timestamp: updateTimestamp
      });

      // Broadcast booking availability update
      websocketService.broadcastBookingAvailabilityUpdate({
        provider_type: 'driver',
        provider_id: driver.id,
        available: newStatus === 'available',
        timestamp: updateTimestamp
      });

      res.json(successResponse({
        message: 'Driver status updated successfully',
        provider_type: 'driver',
        provider_id: driver.id,
        provider_name: driver.driver_name,
        new_status: driver.status,
        telegram_user_id,
        telegram_username
      }));
      return;
    }

    // Provider not found
    res.status(404).json(errorResponse('Provider not found with the given Telegram user ID'));
  } catch (error) {
    logger.error('Error updating provider status via webhook:', error);
    res.status(500).json(errorResponse('Failed to update provider status'));
  }
};

/**
 * Webhook handler for booking notifications
 * POST /api/webhook/telegram/booking
 */
export const sendBookingNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider_id, booking_id, details } = req.body;

    // Validate required fields
    if (!provider_id || !booking_id || !details) {
      res.status(400).json(errorResponse('Missing required fields: provider_id, booking_id, and details'));
      return;
    }

    // This endpoint would be called by the booking system to notify providers
    // The actual notification sending is handled by the TelegramBotService

    logger.info(`Booking notification webhook received for provider ${provider_id}, booking ${booking_id}`);

    res.json(successResponse({
      message: 'Booking notification webhook received',
      provider_id,
      booking_id
    }));
  } catch (error) {
    logger.error('Error processing booking notification webhook:', error);
    res.status(500).json(errorResponse('Failed to process booking notification'));
  }
};

/**
 * Get provider status by Telegram user ID
 * GET /api/webhook/telegram/status/:telegram_user_id
 */
export const getProviderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telegram_user_id } = req.params;

    if (!telegram_user_id) {
      res.status(400).json(errorResponse('Missing telegram_user_id parameter'));
      return;
    }

    // Try to find guide
    const guide = await (Guide as any).findOne({
      where: { telegram_user_id },
      attributes: ['id', 'name', 'status', 'last_status_update', 'telegram_username']
    });

    if (guide) {
      res.json(successResponse({
        provider_type: 'guide',
        provider_id: guide.id,
        provider_name: guide.name,
        status: guide.status,
        last_status_update: guide.last_status_update,
        telegram_user_id,
        telegram_username: guide.telegram_username
      }));
      return;
    }

    // Try to find driver
    const driver = await (Transportation as any).findOne({
      where: { telegram_user_id },
      attributes: ['id', 'driver_name', 'status', 'last_status_update', 'telegram_username']
    });

    if (driver) {
      res.json(successResponse({
        provider_type: 'driver',
        provider_id: driver.id,
        provider_name: driver.driver_name,
        status: driver.status,
        last_status_update: driver.last_status_update,
        telegram_user_id,
        telegram_username: driver.telegram_username
      }));
      return;
    }

    // Provider not found
    res.status(404).json(errorResponse('Provider not found with the given Telegram user ID'));
  } catch (error) {
    logger.error('Error fetching provider status:', error);
    res.status(500).json(errorResponse('Failed to fetch provider status'));
  }
};
