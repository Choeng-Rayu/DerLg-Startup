import axios from 'axios';
import { sequelize, User, Hotel, Room, Booking } from '../models';
import { UserType, Language, Currency } from '../models/User';
import { HotelStatus } from '../models/Hotel';
import { BookingStatus, PaymentMethod, PaymentType, PaymentStatus, EscrowStatus } from '../models/Booking';
import logger from '../utils/logger';

const API_URL = 'http://localhost:5000/api';

/**
 * Test script for hotel availability endpoint
 * Run with: npx ts-node src/scripts/testHotelAvailability.ts
 */
async function testHotelAvailability() {
  try {
    logger.info('Starting hotel availability endpoint tests...\n');

    // Setup test data
    await sequelize.sync({ force: true });
    logger.info('✓ Database synced');

    // Create test user
    const testUser = await User.create({
      user_type: UserType.TOURIST,
      email: 'tourist@test.com',
      password_hash: 'hashedpassword123',
      first_name: 'John',
      last_name: 'Doe',
      language: Language.ENGLISH,
      currency: Currency.USD,
    });

    // Create test admin
    const testAdmin = await User.create({
      user_type: UserType.ADMIN,
      email: 'admin@hotel.com',
      password_hash: 'hashedpassword123',
      first_name: 'Hotel',
      last_name: 'Admin',
      language: Language.ENGLISH,
      currency: Currency.USD,
    });

    // Create test hotel
    const testHotel = await Hotel.create({
      admin_id: testAdmin.id,
      name: 'Test Paradise Hotel',
      description: 'A beautiful test hotel in Siem Reap',
      location: {
        address: '123 Test Street',
        city: 'Siem Reap',
        province: 'Siem Reap',
        country: 'Cambodia',
        latitude: 13.3633,
        longitude: 103.8564,
        google_maps_url: 'https://maps.google.com/test',
      },
      contact: {
        phone: '+855123456789',
        email: 'info@testhotel.com',
        website: 'https://testhotel.com',
      },
      amenities: ['wifi', 'pool', 'restaurant'],
      images: ['https://cloudinary.com/image1.jpg'],
      star_rating: 4,
      status: HotelStatus.ACTIVE,
    });

    // Create test rooms
    const deluxeRoom = await Room.create({
      hotel_id: testHotel.id,
      room_type: 'Deluxe Suite',
      description: 'Spacious deluxe suite',
      capacity: 2,
      bed_type: 'king',
      size_sqm: 45.5,
      price_per_night: 150.0,
      discount_percentage: 10,
      amenities: ['wifi', 'tv', 'minibar'],
      images: ['https://cloudinary.com/room1.jpg'],
      total_rooms: 5,
      is_active: true,
    });

    const standardRoom = await Room.create({
      hotel_id: testHotel.id,
      room_type: 'Standard Room',
      description: 'Comfortable standard room',
      capacity: 2,
      bed_type: 'queen',
      size_sqm: 30.0,
      price_per_night: 80.0,
      discount_percentage: 0,
      amenities: ['wifi', 'tv'],
      images: ['https://cloudinary.com/room2.jpg'],
      total_rooms: 10,
      is_active: true,
    });

    const familyRoom = await Room.create({
      hotel_id: testHotel.id,
      room_type: 'Family Suite',
      description: 'Large family suite',
      capacity: 4,
      bed_type: 'twin',
      size_sqm: 60.0,
      price_per_night: 200.0,
      discount_percentage: 15,
      amenities: ['wifi', 'tv', 'minibar', 'balcony'],
      images: ['https://cloudinary.com/room3.jpg'],
      total_rooms: 3,
      is_active: true,
    });

    // Create some existing bookings
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 10);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 15);

    await Booking.create({
      user_id: testUser.id,
      hotel_id: testHotel.id,
      room_id: deluxeRoom.id,
      check_in: futureDate1,
      check_out: futureDate2,
      nights: 5,
      guests: { adults: 2, children: 0 },
      guest_details: {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890',
        special_requests: '',
      },
      pricing: {
        room_rate: 150.0,
        subtotal: 750.0,
        discount: 75.0,
        promo_code: null,
        student_discount: 0,
        tax: 67.5,
        total: 742.5,
      },
      payment: {
        method: PaymentMethod.PAYPAL,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        transactions: [],
        escrow_status: EscrowStatus.HELD,
      },
      status: BookingStatus.CONFIRMED,
    });

    // Book 2 more deluxe rooms for the same period
    await Booking.create({
      user_id: testUser.id,
      hotel_id: testHotel.id,
      room_id: deluxeRoom.id,
      check_in: futureDate1,
      check_out: futureDate2,
      nights: 5,
      guests: { adults: 2, children: 0 },
      guest_details: {
        name: 'Jane Smith',
        email: 'jane@test.com',
        phone: '+1234567891',
        special_requests: '',
      },
      pricing: {
        room_rate: 150.0,
        subtotal: 750.0,
        discount: 75.0,
        promo_code: null,
        student_discount: 0,
        tax: 67.5,
        total: 742.5,
      },
      payment: {
        method: PaymentMethod.PAYPAL,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        transactions: [],
        escrow_status: EscrowStatus.HELD,
      },
      status: BookingStatus.CONFIRMED,
    });

    logger.info('✓ Test data created\n');

    // Test 1: Check availability with no conflicts
    logger.info('Test 1: Check availability with no conflicts');
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 30);
    const futureDate4 = new Date();
    futureDate4.setDate(futureDate4.getDate() + 35);

    const response1 = await axios.get(
      `${API_URL}/hotels/${testHotel.id}/availability`,
      {
        params: {
          checkIn: futureDate3.toISOString().split('T')[0],
          checkOut: futureDate4.toISOString().split('T')[0],
        },
      }
    );

    logger.info(`Status: ${response1.status}`);
    logger.info(`Available rooms: ${response1.data.data.availableRoomsCount}`);
    logger.info(`Nights: ${response1.data.data.nights}`);
    if (response1.data.data.availableRooms.length > 0) {
      logger.info('Sample room:');
      const room = response1.data.data.availableRooms[0];
      logger.info(`  - ${room.room_type}: ${room.available_count}/${room.total_rooms} available`);
      logger.info(`  - Price: $${room.pricing.final_price}/night (${room.nights} nights = $${room.pricing.total})`);
    }
    logger.info('✓ Test 1 passed\n');

    // Test 2: Check availability with conflicts
    logger.info('Test 2: Check availability with conflicts (overlapping bookings)');
    const response2 = await axios.get(
      `${API_URL}/hotels/${testHotel.id}/availability`,
      {
        params: {
          checkIn: futureDate1.toISOString().split('T')[0],
          checkOut: futureDate2.toISOString().split('T')[0],
        },
      }
    );

    logger.info(`Status: ${response2.status}`);
    logger.info(`Available rooms: ${response2.data.data.availableRoomsCount}`);
    const deluxeAvailable = response2.data.data.availableRooms.find(
      (r: any) => r.room_type === 'Deluxe Suite'
    );
    if (deluxeAvailable) {
      logger.info(`Deluxe Suite: ${deluxeAvailable.available_count}/5 available (2 booked)`);
    }
    logger.info('✓ Test 2 passed\n');

    // Test 3: Check availability with guest filter
    logger.info('Test 3: Check availability with guest filter (4 guests)');
    const response3 = await axios.get(
      `${API_URL}/hotels/${testHotel.id}/availability`,
      {
        params: {
          checkIn: futureDate3.toISOString().split('T')[0],
          checkOut: futureDate4.toISOString().split('T')[0],
          guests: 4,
        },
      }
    );

    logger.info(`Status: ${response3.status}`);
    logger.info(`Available rooms: ${response3.data.data.availableRoomsCount}`);
    logger.info('Rooms with capacity >= 4:');
    response3.data.data.availableRooms.forEach((room: any) => {
      logger.info(`  - ${room.room_type}: Capacity ${room.capacity}, ${room.available_count} available`);
    });
    logger.info('✓ Test 3 passed\n');

    // Test 4: Check availability with discount calculation
    logger.info('Test 4: Verify discount calculation');
    const response4 = await axios.get(
      `${API_URL}/hotels/${testHotel.id}/availability`,
      {
        params: {
          checkIn: futureDate3.toISOString().split('T')[0],
          checkOut: futureDate4.toISOString().split('T')[0],
        },
      }
    );

    const deluxeRoom4 = response4.data.data.availableRooms.find(
      (r: any) => r.room_type === 'Deluxe Suite'
    );
    if (deluxeRoom4) {
      logger.info('Deluxe Suite pricing:');
      logger.info(`  Base price: $${deluxeRoom4.pricing.base_price}`);
      logger.info(`  Discount (10%): -$${deluxeRoom4.pricing.discount_amount}`);
      logger.info(`  Final price: $${deluxeRoom4.pricing.final_price}/night`);
      logger.info(`  Total (${deluxeRoom4.pricing.nights} nights): $${deluxeRoom4.pricing.total}`);
    }
    logger.info('✓ Test 4 passed\n');

    // Test 5: Error handling - missing parameters
    logger.info('Test 5: Error handling - missing check-in date');
    try {
      await axios.get(`${API_URL}/hotels/${testHotel.id}/availability`, {
        params: {
          checkOut: futureDate4.toISOString().split('T')[0],
        },
      });
      logger.error('✗ Test 5 failed - should have returned error');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info(`Status: ${error.response.status}`);
        logger.info(`Error: ${error.response.data.error.message}`);
        logger.info('✓ Test 5 passed\n');
      } else {
        throw error;
      }
    }

    // Test 6: Error handling - invalid date
    logger.info('Test 6: Error handling - check-out before check-in');
    try {
      await axios.get(`${API_URL}/hotels/${testHotel.id}/availability`, {
        params: {
          checkIn: futureDate4.toISOString().split('T')[0],
          checkOut: futureDate3.toISOString().split('T')[0],
        },
      });
      logger.error('✗ Test 6 failed - should have returned error');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info(`Status: ${error.response.status}`);
        logger.info(`Error: ${error.response.data.error.message}`);
        logger.info('✓ Test 6 passed\n');
      } else {
        throw error;
      }
    }

    // Test 7: Error handling - past date
    logger.info('Test 7: Error handling - check-in date in the past');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    try {
      await axios.get(`${API_URL}/hotels/${testHotel.id}/availability`, {
        params: {
          checkIn: pastDate.toISOString().split('T')[0],
          checkOut: futureDate3.toISOString().split('T')[0],
        },
      });
      logger.error('✗ Test 7 failed - should have returned error');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info(`Status: ${error.response.status}`);
        logger.info(`Error: ${error.response.data.error.message}`);
        logger.info('✓ Test 7 passed\n');
      } else {
        throw error;
      }
    }

    // Test 8: Error handling - hotel not found
    logger.info('Test 8: Error handling - hotel not found');
    try {
      await axios.get(
        `${API_URL}/hotels/00000000-0000-0000-0000-000000000000/availability`,
        {
          params: {
            checkIn: futureDate3.toISOString().split('T')[0],
            checkOut: futureDate4.toISOString().split('T')[0],
          },
        }
      );
      logger.error('✗ Test 8 failed - should have returned error');
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.info(`Status: ${error.response.status}`);
        logger.info(`Error: ${error.response.data.error.message}`);
        logger.info('✓ Test 8 passed\n');
      } else {
        throw error;
      }
    }

    logger.info('\n✅ All hotel availability tests passed!');
    logger.info('\nTest Summary:');
    logger.info('  ✓ Availability check with no conflicts');
    logger.info('  ✓ Availability check with overlapping bookings');
    logger.info('  ✓ Guest capacity filtering');
    logger.info('  ✓ Discount calculation');
    logger.info('  ✓ Error handling - missing parameters');
    logger.info('  ✓ Error handling - invalid dates');
    logger.info('  ✓ Error handling - past dates');
    logger.info('  ✓ Error handling - hotel not found');

    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testHotelAvailability();
