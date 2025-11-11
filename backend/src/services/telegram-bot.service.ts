import TelegramBot from 'node-telegram-bot-api';
import { Guide, Transportation } from '../models';
import logger from '../utils/logger';
import websocketService from './websocket.service';

class TelegramBotService {
  private bot!: TelegramBot;
  private isInitialized: boolean = false;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      logger.warn('TELEGRAM_BOT_TOKEN not found in environment variables. Telegram bot will not be initialized.');
      return;
    }

    try {
      // Initialize bot with polling
      this.bot = new TelegramBot(token, { polling: true });
      this.setupCommandHandlers();
      this.setupErrorHandlers();
      this.isInitialized = true;
      logger.info('Telegram Bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Telegram Bot:', error);
    }
  }

  /**
   * Set up command handlers for the bot
   */
  private setupCommandHandlers(): void {
    // /start command - Initialize bot and authenticate
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      const telegramUsername = msg.from?.username;

      logger.info(`/start command received from user ${telegramUserId} (${telegramUsername})`);

      try {
        // Check if user is a guide or driver
        const guide = await (Guide as any).findOne({
          where: { telegram_user_id: telegramUserId }
        });

        const driver = await (Transportation as any).findOne({
          where: { telegram_user_id: telegramUserId }
        });

        if (guide) {
          await this.bot.sendMessage(
            chatId,
            `🎯 Welcome, ${guide.name}!\n\n` +
            `You are registered as a Tour Guide.\n` +
            `Current Status: ${guide.status}\n\n` +
            `Use the commands below to manage your availability:`,
            {
              reply_markup: {
                keyboard: [
                  [{ text: '✅ Available' }, { text: '❌ Busy' }],
                  [{ text: '📊 Status' }, { text: '❓ Help' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: false
              }
            }
          );
        } else if (driver) {
          await this.bot.sendMessage(
            chatId,
            `🚗 Welcome, ${driver.driver_name}!\n\n` +
            `You are registered as a Transportation Provider.\n` +
            `Vehicle: ${driver.vehicle_type}\n` +
            `Current Status: ${driver.status}\n\n` +
            `Use the commands below to manage your availability:`,
            {
              reply_markup: {
                keyboard: [
                  [{ text: '✅ Available' }, { text: '❌ Busy' }],
                  [{ text: '📊 Status' }, { text: '❓ Help' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: false
              }
            }
          );
        } else {
          await this.bot.sendMessage(
            chatId,
            `👋 Welcome to DerLg Tourism Platform!\n\n` +
            `⚠️ Your Telegram account is not registered in our system.\n\n` +
            `If you are a tour guide or transportation provider, please contact the administrator to register your Telegram ID: ${telegramUserId}`
          );
        }
      } catch (error) {
        logger.error('Error handling /start command:', error);
        await this.bot.sendMessage(
          chatId,
          '❌ An error occurred. Please try again later.'
        );
      }
    });

    // /status command - Check current status
    this.bot.onText(/\/status/, async (msg) => {
      await this.handleStatusCommand(msg);
    });

    // /available command - Mark as available
    this.bot.onText(/\/available/, async (msg) => {
      await this.handleAvailableCommand(msg);
    });

    // /busy command - Mark as busy/unavailable
    this.bot.onText(/\/busy/, async (msg) => {
      await this.handleBusyCommand(msg);
    });

    // Handle button clicks (keyboard buttons)
    this.bot.on('message', async (msg) => {
      const text = msg.text;
      const chatId = msg.chat.id;

      if (!text) return;

      // Handle keyboard button presses
      if (text === '✅ Available') {
        await this.handleAvailableCommand(msg);
      } else if (text === '❌ Busy') {
        await this.handleBusyCommand(msg);
      } else if (text === '📊 Status') {
        await this.handleStatusCommand(msg);
      } else if (text === '❓ Help') {
        await this.bot.sendMessage(
          chatId,
          `📖 *Help - Available Commands*\n\n` +
          `✅ *Available* - Mark yourself as available for bookings\n` +
          `❌ *Busy* - Mark yourself as unavailable\n` +
          `📊 *Status* - Check your current status\n` +
          `❓ *Help* - Show this help message\n\n` +
          `You can also use these commands:\n` +
          `/start - Restart the bot\n` +
          `/status - Check your status\n` +
          `/available - Mark as available\n` +
          `/busy - Mark as busy`,
          { parse_mode: 'Markdown' }
        );
      }
    });
  }

  /**
   * Handle /status command
   */
  private async handleStatusCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from?.id.toString();

    try {
      const guide = await (Guide as any).findOne({
        where: { telegram_user_id: telegramUserId }
      });

      const driver = await (Transportation as any).findOne({
        where: { telegram_user_id: telegramUserId }
      });

      if (guide) {
        const statusEmoji = guide.status === 'available' ? '✅' : 
                           guide.status === 'on_tour' ? '🚶' : '❌';
        
        await this.bot.sendMessage(
          chatId,
          `📊 *Your Current Status*\n\n` +
          `Name: ${guide.name}\n` +
          `Role: Tour Guide\n` +
          `Status: ${statusEmoji} ${guide.status}\n` +
          `Specializations: ${guide.specializations.join(', ')}\n` +
          `Languages: ${guide.languages.join(', ')}\n` +
          `Total Tours: ${guide.total_tours}\n` +
          `Average Rating: ${guide.average_rating.toFixed(1)} ⭐\n\n` +
          `Last Updated: ${guide.last_status_update?.toLocaleString() || 'N/A'}`,
          { parse_mode: 'Markdown' }
        );
      } else if (driver) {
        const statusEmoji = driver.status === 'available' ? '✅' : 
                           driver.status === 'on_trip' ? '🚗' : '❌';
        
        await this.bot.sendMessage(
          chatId,
          `📊 *Your Current Status*\n\n` +
          `Name: ${driver.driver_name}\n` +
          `Role: Transportation Provider\n` +
          `Status: ${statusEmoji} ${driver.status}\n` +
          `Vehicle: ${driver.vehicle_type} (${driver.vehicle_model})\n` +
          `Capacity: ${driver.capacity} seats\n` +
          `Total Trips: ${driver.total_trips}\n` +
          `Average Rating: ${driver.average_rating.toFixed(1)} ⭐\n\n` +
          `Last Updated: ${driver.last_status_update?.toLocaleString() || 'N/A'}`,
          { parse_mode: 'Markdown' }
        );
      } else {
        await this.bot.sendMessage(
          chatId,
          '⚠️ You are not registered in our system. Please contact the administrator.'
        );
      }
    } catch (error) {
      logger.error('Error handling /status command:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ An error occurred while fetching your status.'
      );
    }
  }

  /**
   * Handle /available command
   */
  private async handleAvailableCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from?.id.toString();
    // const telegramUsername = msg.from?.username;

    try {
      const guide = await (Guide as any).findOne({
        where: { telegram_user_id: telegramUserId }
      });

      const driver = await (Transportation as any).findOne({
        where: { telegram_user_id: telegramUserId }
      });

      if (guide) {
        const oldStatus = guide.status;
        const newStatus = 'available';
        const timestamp = new Date();

        await guide.update({
          status: newStatus,
          last_status_update: timestamp
        });

        await this.bot.sendMessage(
          chatId,
          `✅ *Status Updated*\n\n` +
          `You are now marked as *Available* for tour bookings.\n` +
          `The admin dashboard has been notified.`,
          { parse_mode: 'Markdown' }
        );

        logger.info(`Guide ${guide.name} (${telegramUserId}) marked as available`);

        // Broadcast status update via WebSocket
        websocketService.broadcastProviderStatusUpdate({
          provider_type: 'guide',
          provider_id: guide.id,
          provider_name: guide.name,
          telegram_user_id: telegramUserId!,
          telegram_username: guide.telegram_username,
          old_status: oldStatus,
          new_status: newStatus,
          timestamp
        });

        // Broadcast booking availability update
        websocketService.broadcastBookingAvailabilityUpdate({
          provider_type: 'guide',
          provider_id: guide.id,
          available: true,
          timestamp
        });
      } else if (driver) {
        const oldStatus = driver.status;
        const newStatus = 'available';
        const timestamp = new Date();

        await driver.update({
          status: newStatus,
          last_status_update: timestamp
        });

        await this.bot.sendMessage(
          chatId,
          `✅ *Status Updated*\n\n` +
          `You are now marked as *Available* for transportation bookings.\n` +
          `The admin dashboard has been notified.`,
          { parse_mode: 'Markdown' }
        );

        logger.info(`Driver ${driver.driver_name} (${telegramUserId}) marked as available`);

        // Broadcast status update via WebSocket
        websocketService.broadcastProviderStatusUpdate({
          provider_type: 'driver',
          provider_id: driver.id,
          provider_name: driver.driver_name,
          telegram_user_id: telegramUserId!,
          telegram_username: driver.telegram_username,
          old_status: oldStatus,
          new_status: newStatus,
          timestamp
        });

        // Broadcast booking availability update
        websocketService.broadcastBookingAvailabilityUpdate({
          provider_type: 'driver',
          provider_id: driver.id,
          available: true,
          timestamp
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          '⚠️ You are not registered in our system. Please contact the administrator.'
        );
      }
    } catch (error) {
      logger.error('Error handling /available command:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ An error occurred while updating your status.'
      );
    }
  }

  /**
   * Handle /busy command
   */
  private async handleBusyCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from?.id.toString();

    try {
      const guide = await (Guide as any).findOne({
        where: { telegram_user_id: telegramUserId }
      });

      const driver = await (Transportation as any).findOne({
        where: { telegram_user_id: telegramUserId }
      });

      if (guide) {
        const oldStatus = guide.status;
        const newStatus = 'unavailable';
        const timestamp = new Date();

        await guide.update({
          status: newStatus,
          last_status_update: timestamp
        });

        await this.bot.sendMessage(
          chatId,
          `❌ *Status Updated*\n\n` +
          `You are now marked as *Unavailable*.\n` +
          `You will not receive new tour bookings until you mark yourself as available again.`,
          { parse_mode: 'Markdown' }
        );

        logger.info(`Guide ${guide.name} (${telegramUserId}) marked as unavailable`);

        // Broadcast status update via WebSocket
        websocketService.broadcastProviderStatusUpdate({
          provider_type: 'guide',
          provider_id: guide.id,
          provider_name: guide.name,
          telegram_user_id: telegramUserId!,
          telegram_username: guide.telegram_username,
          old_status: oldStatus,
          new_status: newStatus,
          timestamp
        });

        // Broadcast booking availability update
        websocketService.broadcastBookingAvailabilityUpdate({
          provider_type: 'guide',
          provider_id: guide.id,
          available: false,
          timestamp
        });
      } else if (driver) {
        const oldStatus = driver.status;
        const newStatus = 'unavailable';
        const timestamp = new Date();

        await driver.update({
          status: newStatus,
          last_status_update: timestamp
        });

        await this.bot.sendMessage(
          chatId,
          `❌ *Status Updated*\n\n` +
          `You are now marked as *Unavailable*.\n` +
          `You will not receive new transportation bookings until you mark yourself as available again.`,
          { parse_mode: 'Markdown' }
        );

        logger.info(`Driver ${driver.driver_name} (${telegramUserId}) marked as unavailable`);

        // Broadcast status update via WebSocket
        websocketService.broadcastProviderStatusUpdate({
          provider_type: 'driver',
          provider_id: driver.id,
          provider_name: driver.driver_name,
          telegram_user_id: telegramUserId!,
          telegram_username: driver.telegram_username,
          old_status: oldStatus,
          new_status: newStatus,
          timestamp
        });

        // Broadcast booking availability update
        websocketService.broadcastBookingAvailabilityUpdate({
          provider_type: 'driver',
          provider_id: driver.id,
          available: false,
          timestamp
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          '⚠️ You are not registered in our system. Please contact the administrator.'
        );
      }
    } catch (error) {
      logger.error('Error handling /busy command:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ An error occurred while updating your status.'
      );
    }
  }

  /**
   * Set up error handlers
   */
  private setupErrorHandlers(): void {
    this.bot.on('polling_error', (error) => {
      logger.error('Telegram Bot polling error:', error);
    });

    this.bot.on('error', (error) => {
      logger.error('Telegram Bot error:', error);
    });
  }

  /**
   * Send a notification to a specific user
   */
  public async sendNotification(
    telegramUserId: string,
    message: string,
    options?: TelegramBot.SendMessageOptions
  ): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Telegram Bot not initialized. Cannot send notification.');
      return;
    }

    try {
      await this.bot.sendMessage(telegramUserId, message, options);
      logger.info(`Notification sent to Telegram user ${telegramUserId}`);
    } catch (error) {
      logger.error(`Failed to send notification to ${telegramUserId}:`, error);
    }
  }

  /**
   * Send booking notification to guide or driver
   */
  public async sendBookingNotification(
    telegramUserId: string,
    bookingDetails: {
      bookingNumber: string;
      customerName: string;
      date: string;
      location: string;
      googleMapsLink?: string;
    }
  ): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Telegram Bot not initialized. Cannot send booking notification.');
      return;
    }

    try {
      let message = `🎉 *New Booking Assigned!*\n\n` +
        `Booking #: ${bookingDetails.bookingNumber}\n` +
        `Customer: ${bookingDetails.customerName}\n` +
        `Date: ${bookingDetails.date}\n` +
        `Location: ${bookingDetails.location}\n`;

      if (bookingDetails.googleMapsLink) {
        message += `\n📍 [Open in Google Maps](${bookingDetails.googleMapsLink})`;
      }

      await this.bot.sendMessage(telegramUserId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Accept', callback_data: `accept_${bookingDetails.bookingNumber}` },
              { text: '❌ Reject', callback_data: `reject_${bookingDetails.bookingNumber}` }
            ]
          ]
        }
      });

      logger.info(`Booking notification sent to Telegram user ${telegramUserId}`);
    } catch (error) {
      logger.error(`Failed to send booking notification to ${telegramUserId}:`, error);
    }
  }

  /**
   * Check if bot is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Stop the bot
   */
  public async stop(): Promise<void> {
    if (this.isInitialized && this.bot) {
      await this.bot.stopPolling();
      logger.info('Telegram Bot stopped');
    }
  }
}

// Export singleton instance
export default new TelegramBotService();
