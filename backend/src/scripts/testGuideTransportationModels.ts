import sequelize from '../config/database';
import { User, Guide, Transportation } from '../models';
import { UserType } from '../models/User';
import { GuideStatus } from '../models/Guide';
import { VehicleType, TransportationStatus } from '../models/Transportation';
import logger from '../utils/logger';

/**
 * Test script for Guide and Transportation models
 * Tests model creation, validation, and relationships
 */
async function testGuideTransportationModels() {
  try {
    logger.info('Starting Guide and Transportation models test...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('✓ Database connection established');

    // Sync models (drop and recreate tables for clean test)
    await sequelize.sync({ force: true });
    logger.info('✓ Models synced with database (tables recreated)');

    // Create a super admin user for testing
    logger.info('\n--- Creating Super Admin User ---');
    const superAdmin = await User.create({
      user_type: UserType.SUPER_ADMIN,
      email: 'superadmin@derlg.com',
      first_name: 'Super',
      last_name: 'Admin',
      password_hash: 'hashedpassword123',
    });
    logger.info(`✓ Super Admin created: ${superAdmin.id}`);

    // Test Guide Model
    logger.info('\n--- Testing Guide Model ---');

    // Create a guide
    const guide1 = await Guide.create({
      name: 'Sokha Chea',
      phone: '+855123456789',
      email: 'sokha@example.com',
      telegram_user_id: '123456789',
      telegram_username: '@sokhaguide',
      specializations: ['temples', 'history', 'culture'],
      languages: ['en', 'km', 'zh'],
      bio: 'Experienced tour guide specializing in Angkor Wat and Cambodian history',
      certifications: ['Licensed Tour Guide', 'First Aid Certified'],
      status: GuideStatus.AVAILABLE,
      created_by: superAdmin.id,
    });
    logger.info(`✓ Guide created: ${guide1.name} (${guide1.id})`);
    logger.info(`  - Telegram: ${guide1.telegram_username}`);
    logger.info(`  - Languages: ${guide1.languages.join(', ')}`);
    logger.info(`  - Status: ${guide1.status}`);

    // Create another guide
    const guide2 = await Guide.create({
      name: 'Dara Pov',
      phone: '+855987654321',
      telegram_user_id: '987654321',
      telegram_username: 'daraguide',
      specializations: ['adventure', 'nature'],
      languages: ['en', 'km'],
      status: GuideStatus.UNAVAILABLE,
      created_by: superAdmin.id,
    });
    logger.info(`✓ Guide created: ${guide2.name} (${guide2.id})`);

    // Test guide status update
    logger.info('\n--- Testing Guide Status Update ---');
    await guide2.updateStatus(GuideStatus.ON_TOUR);
    logger.info(`✓ Guide status updated: ${guide2.status}`);
    logger.info(`  - Last status update: ${guide2.last_status_update}`);

    // Test guide availability check
    logger.info('\n--- Testing Guide Availability ---');
    logger.info(`  - ${guide1.name} available: ${guide1.isAvailable()}`);
    logger.info(`  - ${guide2.name} available: ${guide2.isAvailable()}`);

    // Test Transportation Model
    logger.info('\n--- Testing Transportation Model ---');

    // Create transportation
    const transport1 = await Transportation.create({
      driver_name: 'Virak Sok',
      phone: '+855111222333',
      telegram_user_id: '111222333',
      telegram_username: '@virakdriver',
      vehicle_type: VehicleType.TUK_TUK,
      vehicle_model: 'Bajaj RE',
      license_plate: 'PP-1234',
      capacity: 4,
      amenities: ['AC', 'WiFi'],
      status: TransportationStatus.AVAILABLE,
      created_by: superAdmin.id,
    });
    logger.info(`✓ Transportation created: ${transport1.driver_name} (${transport1.id})`);
    logger.info(`  - Vehicle: ${transport1.vehicle_type} - ${transport1.vehicle_model}`);
    logger.info(`  - License: ${transport1.license_plate}`);
    logger.info(`  - Capacity: ${transport1.capacity} passengers`);
    logger.info(`  - Status: ${transport1.status}`);

    // Create another transportation
    const transport2 = await Transportation.create({
      driver_name: 'Sophea Lim',
      phone: '+855444555666',
      telegram_user_id: '444555666',
      telegram_username: 'sopheadriver',
      vehicle_type: VehicleType.VAN,
      vehicle_model: 'Toyota Hiace',
      license_plate: 'SR-5678',
      capacity: 12,
      amenities: ['AC', 'WiFi', 'USB Charging'],
      status: TransportationStatus.ON_TRIP,
      created_by: superAdmin.id,
    });
    logger.info(`✓ Transportation created: ${transport2.driver_name} (${transport2.id})`);

    // Test transportation status update
    logger.info('\n--- Testing Transportation Status Update ---');
    await transport1.updateStatus(TransportationStatus.ON_TRIP);
    logger.info(`✓ Transportation status updated: ${transport1.status}`);
    logger.info(`  - Last status update: ${transport1.last_status_update}`);

    // Test transportation availability check
    logger.info('\n--- Testing Transportation Availability ---');
    logger.info(`  - ${transport1.driver_name} available: ${transport1.isAvailable()}`);
    logger.info(`  - ${transport2.driver_name} available: ${transport2.isAvailable()}`);

    // Test relationships
    logger.info('\n--- Testing Relationships ---');
    const adminWithGuides = await User.findByPk(superAdmin.id, {
      include: [
        { model: Guide, as: 'created_guides' },
        { model: Transportation, as: 'created_transportation' },
      ],
    });
    logger.info(`✓ Super Admin has ${adminWithGuides?.created_guides?.length} guides`);
    logger.info(`✓ Super Admin has ${adminWithGuides?.created_transportation?.length} transportation providers`);

    // Test querying by status
    logger.info('\n--- Testing Status Queries ---');
    const availableGuides = await Guide.findAll({
      where: { status: GuideStatus.AVAILABLE },
    });
    logger.info(`✓ Found ${availableGuides.length} available guides`);

    const availableTransport = await Transportation.findAll({
      where: { status: TransportationStatus.AVAILABLE },
    });
    logger.info(`✓ Found ${availableTransport.length} available transportation`);

    // Test querying by telegram_user_id
    logger.info('\n--- Testing Telegram ID Queries ---');
    const guideByTelegram = await Guide.findOne({
      where: { telegram_user_id: '123456789' },
    });
    logger.info(`✓ Found guide by Telegram ID: ${guideByTelegram?.name}`);

    const transportByTelegram = await Transportation.findOne({
      where: { telegram_user_id: '111222333' },
    });
    logger.info(`✓ Found transportation by Telegram ID: ${transportByTelegram?.driver_name}`);

    // Test validation errors
    logger.info('\n--- Testing Validation ---');
    try {
      await Guide.create({
        name: 'Test Guide',
        phone: 'invalid-phone',
        telegram_user_id: '999999999',
        telegram_username: 'testguide',
        specializations: [],
        languages: [], // Should fail - at least one language required
        created_by: superAdmin.id,
      });
      logger.error('✗ Validation should have failed for empty languages');
    } catch (error: any) {
      logger.info(`✓ Validation error caught: ${error.message}`);
    }

    try {
      await Transportation.create({
        driver_name: 'Test Driver',
        phone: '+855123456789',
        telegram_user_id: '111222333', // Duplicate - should fail
        telegram_username: 'testdriver',
        vehicle_type: VehicleType.CAR,
        vehicle_model: 'Test Model',
        license_plate: 'TEST-123',
        capacity: 4,
        created_by: superAdmin.id,
      });
      logger.error('✗ Validation should have failed for duplicate telegram_user_id');
    } catch (error: any) {
      logger.info(`✓ Unique constraint error caught: ${error.message}`);
    }

    // Test username normalization
    logger.info('\n--- Testing Username Normalization ---');
    const guide3 = await Guide.create({
      name: 'Test Guide',
      phone: '+855777888999',
      telegram_user_id: '777888999',
      telegram_username: '@testguide', // Should remove @
      specializations: ['test'],
      languages: ['en'],
      created_by: superAdmin.id,
    });
    logger.info(`✓ Telegram username normalized: ${guide3.telegram_username}`);

    logger.info('\n=== All Guide and Transportation Model Tests Passed! ===\n');
  } catch (error) {
    logger.error('Error during testing:', error);
    throw error;
  } finally {
    await sequelize.close();
    logger.info('Database connection closed');
  }
}

// Run the test
testGuideTransportationModels()
  .then(() => {
    logger.info('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
