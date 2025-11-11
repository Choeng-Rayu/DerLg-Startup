import telegramBotService from '../services/telegram-bot.service';
import { Guide, Transportation } from '../models';
import logger from '../utils/logger';
import { testConnection } from '../config/database';

/**
 * Test script for Telegram Bot Service
 * 
 * This script tests:
 * 1. Bot initialization
 * 2. Database connection for guides and drivers
 * 3. Notification sending capabilities
 */

async function testTelegramBot() {
  console.log('🤖 Testing Telegram Bot Service...\n');

  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    console.log('✅ Database connected\n');

    // Test 2: Check bot initialization
    console.log('2️⃣ Checking bot initialization...');
    if (telegramBotService.isReady()) {
      console.log('✅ Telegram Bot is initialized and ready\n');
    } else {
      console.log('⚠️  Telegram Bot is not initialized');
      console.log('   Make sure TELEGRAM_BOT_TOKEN is set in .env file\n');
    }

    // Test 3: Check for existing guides
    console.log('3️⃣ Checking for registered guides...');
    const guides = await (Guide as any).findAll({
      attributes: ['id', 'name', 'telegram_user_id', 'telegram_username', 'status'],
      limit: 5
    });
    
    if (guides.length > 0) {
      console.log(`✅ Found ${guides.length} guide(s):`);
      guides.forEach((guide: any) => {
        console.log(`   - ${guide.name} (Telegram ID: ${guide.telegram_user_id}, Status: ${guide.status})`);
      });
      console.log('');
    } else {
      console.log('⚠️  No guides found in database');
      console.log('   You can create test guides using the super admin dashboard\n');
    }

    // Test 4: Check for existing drivers
    console.log('4️⃣ Checking for registered drivers...');
    const drivers = await (Transportation as any).findAll({
      attributes: ['id', 'driver_name', 'telegram_user_id', 'telegram_username', 'status'],
      limit: 5
    });
    
    if (drivers.length > 0) {
      console.log(`✅ Found ${drivers.length} driver(s):`);
      drivers.forEach((driver: any) => {
        console.log(`   - ${driver.driver_name} (Telegram ID: ${driver.telegram_user_id}, Status: ${driver.status})`);
      });
      console.log('');
    } else {
      console.log('⚠️  No drivers found in database');
      console.log('   You can create test drivers using the super admin dashboard\n');
    }

    // Test 5: Bot commands information
    console.log('5️⃣ Available Bot Commands:');
    console.log('   For Service Providers (Guides/Drivers):');
    console.log('   - /start - Initialize bot and authenticate');
    console.log('   - /status - Check current status');
    console.log('   - /available - Mark as available');
    console.log('   - /busy - Mark as unavailable');
    console.log('   - Or use keyboard buttons: ✅ Available, ❌ Busy, 📊 Status, ❓ Help\n');

    // Test 6: Webhook endpoints
    console.log('6️⃣ Webhook Endpoints:');
    console.log('   - POST /api/webhook/telegram/status');
    console.log('     Update provider status via webhook');
    console.log('   - POST /api/webhook/telegram/booking');
    console.log('     Send booking notification to provider');
    console.log('   - GET /api/webhook/telegram/status/:telegram_user_id');
    console.log('     Get provider status by Telegram user ID\n');

    // Test 7: How to test the bot
    console.log('7️⃣ How to Test the Bot:');
    console.log('   1. Open Telegram and search for your bot');
    console.log('   2. Send /start command to the bot');
    console.log('   3. If you have a registered Telegram ID in the database,');
    console.log('      you will see a welcome message with keyboard buttons');
    console.log('   4. Use the buttons or commands to test status updates\n');

    // Test 8: Creating test data
    console.log('8️⃣ Creating Test Data:');
    console.log('   To test the bot, you need to:');
    console.log('   1. Get your Telegram user ID (send /start to @userinfobot)');
    console.log('   2. Create a guide or driver in the database with your Telegram ID');
    console.log('   3. Example SQL:');
    console.log('      INSERT INTO guides (id, name, telegram_user_id, telegram_username,');
    console.log('      specializations, languages, status, created_by)');
    console.log('      VALUES (UUID(), "Test Guide", "YOUR_TELEGRAM_ID", "your_username",');
    console.log('      \'["temples","history"]\', \'["en","km"]\', "available", "admin");\n');

    console.log('✅ Telegram Bot Service test completed!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Make sure the backend server is running (npm run dev)');
    console.log('   2. Create test guides/drivers with your Telegram ID');
    console.log('   3. Open Telegram and interact with the bot');
    console.log('   4. Check the server logs for bot activity\n');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    logger.error('Telegram bot test error:', error);
  } finally {
    // Stop the bot to allow the script to exit
    await telegramBotService.stop();
    process.exit(0);
  }
}

// Run the test
testTelegramBot();
