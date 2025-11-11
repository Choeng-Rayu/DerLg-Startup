import { Guide, Transportation } from '../models';
import { testConnection, syncDatabase } from '../config/database';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed script for creating test guides and drivers for Telegram bot testing
 * 
 * IMPORTANT: Replace the telegram_user_id values with your actual Telegram user ID
 * To get your Telegram ID, send /start to @userinfobot on Telegram
 */

async function seedTelegramProviders() {
  console.log('🌱 Seeding Telegram Providers (Guides & Drivers)...\n');

  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Sync database
    await syncDatabase(false);

    console.log('📝 IMPORTANT: Update the telegram_user_id values below with your actual Telegram ID');
    console.log('   To get your Telegram ID, send /start to @userinfobot on Telegram\n');

    // Create test guides
    console.log('1️⃣ Creating test guides...');
    
    const testGuides = [
      {
        id: uuidv4(),
        name: 'Sokha Chea',
        phone: '+855123456789',
        email: 'sokha.guide@derlg.com',
        telegram_user_id: 'YOUR_TELEGRAM_ID_HERE', // Replace with your Telegram ID
        telegram_username: 'sokha_guide',
        specializations: ['temples', 'history', 'culture'],
        languages: ['en', 'km', 'zh'],
        bio: 'Experienced tour guide specializing in Angkor Wat and Cambodian history',
        profile_image: 'https://via.placeholder.com/150',
        certifications: ['Licensed Tour Guide', 'First Aid Certified'],
        status: 'available',
        average_rating: 4.8,
        total_tours: 150,
        created_by: 'system',
        last_status_update: new Date()
      },
      {
        id: uuidv4(),
        name: 'Dara Pov',
        phone: '+855987654321',
        email: 'dara.guide@derlg.com',
        telegram_user_id: 'YOUR_TELEGRAM_ID_HERE', // Replace with your Telegram ID
        telegram_username: 'dara_guide',
        specializations: ['adventure', 'nature', 'wildlife'],
        languages: ['en', 'km'],
        bio: 'Adventure guide with expertise in jungle trekking and wildlife tours',
        profile_image: 'https://via.placeholder.com/150',
        certifications: ['Wilderness First Responder', 'Licensed Tour Guide'],
        status: 'available',
        average_rating: 4.9,
        total_tours: 200,
        created_by: 'system',
        last_status_update: new Date()
      }
    ];

    for (const guideData of testGuides) {
      try {
        const existingGuide = await Guide.findOne({
          where: { telegram_user_id: guideData.telegram_user_id }
        });

        if (existingGuide) {
          console.log(`   ⚠️  Guide with Telegram ID ${guideData.telegram_user_id} already exists`);
        } else {
          await Guide.create(guideData);
          console.log(`   ✅ Created guide: ${guideData.name}`);
        }
      } catch (error) {
        console.error(`   ❌ Error creating guide ${guideData.name}:`, error);
      }
    }

    // Create test drivers
    console.log('\n2️⃣ Creating test drivers...');
    
    const testDrivers = [
      {
        id: uuidv4(),
        driver_name: 'Virak Lim',
        phone: '+855111222333',
        telegram_user_id: 'YOUR_TELEGRAM_ID_HERE', // Replace with your Telegram ID
        telegram_username: 'virak_driver',
        vehicle_type: 'car',
        vehicle_model: 'Toyota Camry 2020',
        license_plate: 'PP-1234',
        capacity: 4,
        amenities: ['AC', 'WiFi', 'Water'],
        status: 'available',
        average_rating: 4.7,
        total_trips: 300,
        created_by: 'system',
        last_status_update: new Date()
      },
      {
        id: uuidv4(),
        driver_name: 'Sophea Mao',
        phone: '+855444555666',
        telegram_user_id: 'YOUR_TELEGRAM_ID_HERE', // Replace with your Telegram ID
        telegram_username: 'sophea_driver',
        vehicle_type: 'van',
        vehicle_model: 'Toyota Hiace 2021',
        license_plate: 'PP-5678',
        capacity: 12,
        amenities: ['AC', 'WiFi', 'USB Charging', 'Comfortable Seats'],
        status: 'available',
        average_rating: 4.9,
        total_trips: 250,
        created_by: 'system',
        last_status_update: new Date()
      },
      {
        id: uuidv4(),
        driver_name: 'Borey Tan',
        phone: '+855777888999',
        telegram_user_id: 'YOUR_TELEGRAM_ID_HERE', // Replace with your Telegram ID
        telegram_username: 'borey_driver',
        vehicle_type: 'tuk_tuk',
        vehicle_model: 'Traditional Tuk Tuk',
        license_plate: 'PP-9999',
        capacity: 3,
        amenities: ['Local Experience', 'Friendly Driver'],
        status: 'available',
        average_rating: 4.6,
        total_trips: 500,
        created_by: 'system',
        last_status_update: new Date()
      }
    ];

    for (const driverData of testDrivers) {
      try {
        const existingDriver = await Transportation.findOne({
          where: { telegram_user_id: driverData.telegram_user_id }
        });

        if (existingDriver) {
          console.log(`   ⚠️  Driver with Telegram ID ${driverData.telegram_user_id} already exists`);
        } else {
          await Transportation.create(driverData);
          console.log(`   ✅ Created driver: ${driverData.driver_name} (${driverData.vehicle_type})`);
        }
      } catch (error) {
        console.error(`   ❌ Error creating driver ${driverData.driver_name}:`, error);
      }
    }

    console.log('\n✅ Seeding completed!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Update the telegram_user_id values in this script with your actual Telegram ID');
    console.log('   2. Run this script again: npm run seed:telegram');
    console.log('   3. Start the backend server: npm run dev');
    console.log('   4. Open Telegram and send /start to your bot');
    console.log('   5. You should see a welcome message with your name and status\n');

  } catch (error) {
    console.error('❌ Error seeding providers:', error);
    logger.error('Seed telegram providers error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seed
seedTelegramProviders();
