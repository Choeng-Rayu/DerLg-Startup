import { sequelize, User, Hotel, Room } from '../models';
import { UserType, Language, Currency } from '../models/User';
import { HotelStatus } from '../models/Hotel';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

async function testHotelRoomModels() {
  try {
    logger.info('Starting Hotel and Room models test...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('✓ Database connection established');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    logger.info('✓ Models synced with database');

    // Create a test admin user
    logger.info('\n--- Creating test admin user ---');
    const adminUser = await User.create({
      user_type: UserType.ADMIN,
      email: 'hotelowner@test.com',
      phone: '+855123456789',
      password_hash: await bcrypt.hash('TestPassword123!', 10),
      first_name: 'Hotel',
      last_name: 'Owner',
      language: Language.ENGLISH,
      currency: Currency.USD,
    });
    logger.info(`✓ Admin user created: ${adminUser.email} (ID: ${adminUser.id})`);

    // Create a test hotel
    logger.info('\n--- Creating test hotel ---');
    const hotel = await Hotel.create({
      admin_id: adminUser.id,
      name: 'Angkor Paradise Hotel',
      description: 'A luxurious hotel near Angkor Wat with stunning views and world-class amenities.',
      location: {
        address: '123 Sivatha Blvd',
        city: 'Siem Reap',
        province: 'Siem Reap',
        country: 'Cambodia',
        latitude: 13.3671,
        longitude: 103.8448,
        google_maps_url: 'https://maps.google.com/?q=13.3671,103.8448',
      },
      contact: {
        phone: '+855123456789',
        email: 'info@angkorparadise.com',
        website: 'https://angkorparadise.com',
      },
      amenities: ['wifi', 'pool', 'restaurant', 'spa', 'gym', 'parking'],
      images: [
        'https://res.cloudinary.com/demo/image/upload/hotel1.jpg',
        'https://res.cloudinary.com/demo/image/upload/hotel2.jpg',
      ],
      logo: 'https://res.cloudinary.com/demo/image/upload/logo.jpg',
      star_rating: 5,
      status: HotelStatus.ACTIVE,
    });
    logger.info(`✓ Hotel created: ${hotel.name} (ID: ${hotel.id})`);
    logger.info(`  Status: ${hotel.status}`);
    logger.info(`  Location: ${hotel.location.city}, ${hotel.location.province}`);
    logger.info(`  Amenities: ${hotel.amenities.join(', ')}`);

    // Create test rooms
    logger.info('\n--- Creating test rooms ---');
    
    const deluxeRoom = await Room.create({
      hotel_id: hotel.id,
      room_type: 'Deluxe Suite',
      description: 'Spacious deluxe suite with king bed, city view, and modern amenities.',
      capacity: 2,
      bed_type: 'king',
      size_sqm: 45.5,
      price_per_night: 120.00,
      discount_percentage: 10,
      amenities: ['wifi', 'tv', 'minibar', 'safe', 'balcony'],
      images: [
        'https://res.cloudinary.com/demo/image/upload/deluxe1.jpg',
        'https://res.cloudinary.com/demo/image/upload/deluxe2.jpg',
      ],
      total_rooms: 10,
      is_active: true,
    });
    logger.info(`✓ Room created: ${deluxeRoom.room_type} (ID: ${deluxeRoom.id})`);
    logger.info(`  Capacity: ${deluxeRoom.capacity} guests`);
    logger.info(`  Price: $${deluxeRoom.price_per_night}/night`);
    logger.info(`  Discounted Price: $${deluxeRoom.getDiscountedPrice()}/night`);

    const familyRoom = await Room.create({
      hotel_id: hotel.id,
      room_type: 'Family Room',
      description: 'Large family room with two queen beds, perfect for families.',
      capacity: 4,
      bed_type: 'queen',
      size_sqm: 60.0,
      price_per_night: 180.00,
      amenities: ['wifi', 'tv', 'minibar', 'safe', 'kitchenette'],
      images: [
        'https://res.cloudinary.com/demo/image/upload/family1.jpg',
      ],
      total_rooms: 5,
      is_active: true,
    });
    logger.info(`✓ Room created: ${familyRoom.room_type} (ID: ${familyRoom.id})`);
    logger.info(`  Capacity: ${familyRoom.capacity} guests`);
    logger.info(`  Price: $${familyRoom.price_per_night}/night`);

    // Test associations - fetch hotel with rooms
    logger.info('\n--- Testing associations ---');
    const hotelWithRooms = await Hotel.findByPk(hotel.id, {
      include: [
        {
          model: Room,
          as: 'rooms',
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'email', 'first_name', 'last_name'],
        },
      ],
    });

    if (hotelWithRooms) {
      logger.info(`✓ Hotel fetched with associations: ${hotelWithRooms.name}`);
      logger.info(`  Admin: ${(hotelWithRooms as any).admin.email}`);
      logger.info(`  Total rooms: ${(hotelWithRooms as any).rooms.length}`);
      (hotelWithRooms as any).rooms.forEach((room: any) => {
        logger.info(`    - ${room.room_type}: $${room.price_per_night}/night (${room.total_rooms} available)`);
      });
    }

    // Test room fetched with hotel
    const roomWithHotel = await Room.findByPk(deluxeRoom.id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'name', 'location', 'star_rating'],
        },
      ],
    });

    if (roomWithHotel) {
      logger.info(`✓ Room fetched with hotel: ${roomWithHotel.room_type}`);
      logger.info(`  Hotel: ${(roomWithHotel as any).hotel.name} (${(roomWithHotel as any).hotel.star_rating} stars)`);
    }

    // Test validation - try to create invalid hotel
    logger.info('\n--- Testing validations ---');
    try {
      await Hotel.create({
        admin_id: adminUser.id,
        name: 'Test Hotel',
        description: 'Test description',
        location: {
          address: '123 Test St',
          city: 'Test City',
          // Missing required fields
        } as any,
        contact: {
          phone: '+855123456789',
          email: 'test@test.com',
          website: 'https://test.com',
        },
        amenities: [],
        images: [],
        star_rating: 3,
      });
      logger.error('✗ Validation should have failed for invalid location');
    } catch (error: any) {
      logger.info(`✓ Validation correctly rejected invalid location: ${error.message}`);
    }

    // Test room capacity validation
    try {
      await Room.create({
        hotel_id: hotel.id,
        room_type: 'Invalid Room',
        description: 'Test',
        capacity: 25, // Exceeds max of 20
        bed_type: 'king',
        price_per_night: 100,
        amenities: [],
        images: [],
        total_rooms: 1,
      });
      logger.error('✗ Validation should have failed for capacity > 20');
    } catch (error: any) {
      logger.info(`✓ Validation correctly rejected capacity > 20: ${error.message}`);
    }

    // Test price validation
    try {
      await Room.create({
        hotel_id: hotel.id,
        room_type: 'Invalid Room',
        description: 'Test',
        capacity: 2,
        bed_type: 'king',
        price_per_night: -10, // Negative price
        amenities: [],
        images: [],
        total_rooms: 1,
      });
      logger.error('✗ Validation should have failed for negative price');
    } catch (error: any) {
      logger.info(`✓ Validation correctly rejected negative price: ${error.message}`);
    }

    logger.info('\n✓ All Hotel and Room model tests completed successfully!');

    // Clean up test data
    logger.info('\n--- Cleaning up test data ---');
    await Room.destroy({ where: { hotel_id: hotel.id } });
    await Hotel.destroy({ where: { id: hotel.id } });
    await User.destroy({ where: { id: adminUser.id } });
    logger.info('✓ Test data cleaned up');

  } catch (error) {
    logger.error('Error during Hotel and Room models test:', error);
    throw error;
  } finally {
    await sequelize.close();
    logger.info('Database connection closed');
  }
}

// Run the test
testHotelRoomModels()
  .then(() => {
    logger.info('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
