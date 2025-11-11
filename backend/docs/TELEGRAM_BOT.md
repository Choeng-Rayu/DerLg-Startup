# Telegram Bot Integration

## Overview

The DerLg Tourism Platform integrates with Telegram to allow tour guides and transportation providers (drivers) to manage their availability status in real-time. Service providers can use the Telegram bot to mark themselves as available or busy, check their current status, and receive booking notifications.

## Features

- ✅ Real-time status management for guides and drivers
- ✅ Interactive keyboard buttons for easy status updates
- ✅ Automatic authentication using Telegram user ID
- ✅ Booking notifications with Google Maps integration
- ✅ Webhook endpoints for external integrations
- ✅ Multi-language support (English, Khmer, Chinese)
- ✅ Status synchronization with admin dashboard

## Bot Token

The bot uses the following token (configured in `.env`):
```
TELEGRAM_BOT_TOKEN=7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM
```

## Bot Commands

### For Service Providers (Guides/Drivers)

| Command | Description |
|---------|-------------|
| `/start` | Initialize bot and authenticate with your Telegram ID |
| `/status` | Check your current availability status |
| `/available` | Mark yourself as available for bookings |
| `/busy` | Mark yourself as unavailable |

### Interactive Keyboard Buttons

The bot provides convenient keyboard buttons for quick actions:
- ✅ **Available** - Mark as available
- ❌ **Busy** - Mark as unavailable
- 📊 **Status** - Check current status
- ❓ **Help** - Show help message

## Setup Instructions

### 1. Environment Configuration

Ensure the Telegram bot token is set in your `.env` file:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM
```

### 2. Database Setup

The bot requires guides and drivers to be registered in the database with their Telegram user IDs.

**Get Your Telegram User ID:**
1. Open Telegram
2. Search for `@userinfobot`
3. Send `/start` to the bot
4. It will reply with your Telegram user ID

### 3. Create Test Data

Run the seed script to create test guides and drivers:

```bash
# Edit the script first to add your Telegram ID
nano backend/src/scripts/seedTelegramProviders.ts

# Then run the seed script
npm run seed:telegram
```

Or manually insert into the database:

```sql
-- Create a test guide
INSERT INTO guides (
  id, name, phone, email, telegram_user_id, telegram_username,
  specializations, languages, status, created_by, last_status_update
) VALUES (
  UUID(), 'Your Name', '+855123456789', 'your.email@example.com',
  'YOUR_TELEGRAM_ID', 'your_telegram_username',
  '["temples","history"]', '["en","km"]', 'available', 'admin', NOW()
);

-- Create a test driver
INSERT INTO transportation (
  id, driver_name, phone, telegram_user_id, telegram_username,
  vehicle_type, vehicle_model, license_plate, capacity,
  amenities, status, created_by, last_status_update
) VALUES (
  UUID(), 'Your Name', '+855123456789', 'YOUR_TELEGRAM_ID', 'your_telegram_username',
  'car', 'Toyota Camry', 'PP-1234', 4,
  '["AC","WiFi"]', 'available', 'admin', NOW()
);
```

### 4. Start the Backend Server

```bash
cd backend
npm run dev
```

The Telegram bot will automatically initialize when the server starts.

### 5. Test the Bot

1. Open Telegram
2. Search for your bot (use the bot username associated with the token)
3. Send `/start` command
4. You should see a welcome message with your name and status
5. Use the keyboard buttons or commands to test status updates

## Testing

### Run the Test Script

```bash
npm run test:telegram
```

This will:
- Check database connection
- Verify bot initialization
- List registered guides and drivers
- Show available commands and endpoints
- Provide testing instructions

### Manual Testing Checklist

- [ ] Send `/start` command - Should show welcome message
- [ ] Click "✅ Available" button - Should update status to available
- [ ] Click "❌ Busy" button - Should update status to unavailable
- [ ] Send `/status` command - Should show current status with details
- [ ] Click "❓ Help" button - Should show help message
- [ ] Check database - Status should be updated in real-time
- [ ] Check server logs - Should see bot activity logs

## API Endpoints

### Webhook Endpoints

#### Update Provider Status
```http
POST /api/webhook/telegram/status
Content-Type: application/json

{
  "telegram_user_id": "123456789",
  "telegram_username": "username",
  "status": "available",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Guide status updated successfully",
    "provider_type": "guide",
    "provider_id": "uuid",
    "provider_name": "Guide Name",
    "new_status": "available",
    "telegram_user_id": "123456789",
    "telegram_username": "username"
  }
}
```

#### Send Booking Notification
```http
POST /api/webhook/telegram/booking
Content-Type: application/json

{
  "provider_id": "uuid",
  "booking_id": "uuid",
  "details": {
    "bookingNumber": "BK-12345",
    "customerName": "John Doe",
    "date": "2024-01-15",
    "location": "Angkor Wat",
    "googleMapsLink": "https://maps.google.com/..."
  }
}
```

#### Get Provider Status
```http
GET /api/webhook/telegram/status/:telegram_user_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider_type": "guide",
    "provider_id": "uuid",
    "provider_name": "Guide Name",
    "status": "available",
    "last_status_update": "2024-01-01T00:00:00Z",
    "telegram_user_id": "123456789",
    "telegram_username": "username"
  }
}
```

## Service Architecture

### TelegramBotService

Located at: `backend/src/services/telegram-bot.service.ts`

**Key Methods:**
- `setupCommandHandlers()` - Registers bot commands and button handlers
- `handleStatusCommand()` - Handles /status command
- `handleAvailableCommand()` - Handles /available command
- `handleBusyCommand()` - Handles /busy command
- `sendNotification()` - Sends custom notifications to users
- `sendBookingNotification()` - Sends booking notifications with action buttons
- `isReady()` - Checks if bot is initialized
- `stop()` - Gracefully stops the bot

### Controller

Located at: `backend/src/controllers/telegram.controller.ts`

**Endpoints:**
- `updateProviderStatus` - Webhook for status updates
- `sendBookingNotification` - Webhook for booking notifications
- `getProviderStatus` - Get provider status by Telegram ID

### Routes

Located at: `backend/src/routes/telegram.routes.ts`

All routes are under `/api/webhook/telegram/` prefix.

## Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Provider                          │
│                  (Guide or Driver)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Sends command or clicks button
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Telegram Bot                                │
│              (telegram-bot.service.ts)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Updates database
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                MySQL Database                                │
│           (guides or transportation table)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Status change reflected
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Admin Dashboard                                 │
│         (Real-time status updates)                           │
└─────────────────────────────────────────────────────────────┘
```

## Booking Notification Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Booking System                                  │
│         (New booking created)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Calls sendBookingNotification()
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Telegram Bot Service                            │
│         (Sends notification to provider)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Telegram message with buttons
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Service Provider                                │
│         (Receives notification on Telegram)                  │
│         [✅ Accept] [❌ Reject]                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

The bot includes comprehensive error handling:

1. **Initialization Errors**: If the bot token is missing or invalid, the service logs a warning and continues without the bot
2. **Database Errors**: All database operations are wrapped in try-catch blocks
3. **Telegram API Errors**: Polling errors and API errors are logged but don't crash the server
4. **User Not Found**: If a Telegram user is not registered, they receive a helpful message with their Telegram ID

## Logging

All bot activities are logged using Winston:

```typescript
logger.info('Guide marked as available', { guideId, telegramUserId });
logger.error('Failed to send notification', { error, telegramUserId });
```

Check logs in the console or log files for bot activity.

## Security Considerations

1. **Authentication**: Users are authenticated by their Telegram user ID, which is unique and provided by Telegram
2. **Webhook Security**: Webhook endpoints should be protected in production (consider adding API keys or IP whitelisting)
3. **Rate Limiting**: The bot respects Telegram's rate limits automatically
4. **Data Privacy**: Only necessary user data is stored (Telegram ID, username)

## Troubleshooting

### Bot Not Responding

1. Check if the bot token is correct in `.env`
2. Verify the backend server is running
3. Check server logs for errors
4. Ensure your Telegram ID is registered in the database

### Status Not Updating

1. Check database connection
2. Verify the Telegram user ID matches the database record
3. Check server logs for database errors
4. Ensure the guides/transportation table has the correct schema

### Cannot Find Bot on Telegram

1. Verify the bot token is valid
2. Check if the bot is active (contact @BotFather on Telegram)
3. Search using the exact bot username

## Future Enhancements

- [ ] Callback query handlers for Accept/Reject booking buttons
- [ ] Daily summary notifications for guides/drivers
- [ ] Location sharing for real-time tracking
- [ ] Multi-language bot responses
- [ ] Rich media support (images, documents)
- [ ] Inline keyboard for quick actions
- [ ] Bot analytics and usage statistics

## Support

For issues or questions:
- Check the server logs for detailed error messages
- Review the test script output: `npm run test:telegram`
- Verify database records for guides/drivers
- Contact the development team

## References

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [node-telegram-bot-api Library](https://github.com/yagop/node-telegram-bot-api)
- DerLg Platform Requirements: See `.kiro/specs/derlg-tourism-platform/requirements.md`
