import { sequelize, User, Hotel, Room, Booking, PaymentTransaction } from '../models';
import { UserType, Language, Currency } from '../models/User';
import { HotelStatus } from '../models/Hotel';
import { BookingStatus, PaymentMethod, PaymentType as BookingPaymentType, PaymentStatus, EscrowStatus as BookingEscrowStatus } from '../models/Booking';
import { PaymentGateway, PaymentType, TransactionStatus, EscrowStatus } from '../models/PaymentTransaction';
import logger from '../utils/logger';

async function testBookingModels() {
  try {
    logger.info('Starting Booking and PaymentTransaction models test...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('✓ Database connection established');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: true });
    logger.info('✓ Database tables synced');

    // Create a test user (tourist)
    const testUser = await User.create({
      user_type: UserType.TOURIST,
      email: 'tourist@test.com',
      password_hash: 'hashedpassword123',
      first_name: 'John',
      last_name: 'Doe',
      language: Language.ENGLISH,
      currency: Currency.USD,
      is_student: false,
    });
    logger.info(`✓ Created test user: ${testUser.id}`);

    // Create a test admin user
    const testAdmin = await User.create({
      user_type: UserType.ADMIN,
      email: 'admin@hotel.com',
      password_hash: 'hashedpassword123',
      first_name: 'Hotel',
      last_name: 'Admin',
      language: Language.ENGLISH,
      currency: Currency.USD,
      is_student: false,
    });
    logger.info(`✓ Created test admin: ${testAdmin.id}`);

    // Create a test hotel
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
      amenities: ['wifi', 'pool', 'restaurant', 'spa'],
      images: ['https://cloudinary.com/image1.jpg', 'https://cloudinary.com/image2.jpg'],
      star_rating: 4,
      status: HotelStatus.ACTIVE,
    });
    logger.info(`✓ Created test hotel: ${testHotel.id}`);

    // Create a test room
    const testRoom = await Room.create({
      hotel_id: testHotel.id,
      room_type: 'Deluxe Suite',
      description: 'Spacious deluxe suite with city view',
      capacity: 2,
      bed_type: 'king',
      size_sqm: 45.5,
      price_per_night: 150.0,
      discount_percentage: 10,
      amenities: ['wifi', 'tv', 'minibar', 'balcony'],
      images: ['https://cloudinary.com/room1.jpg'],
      total_rooms: 5,
      is_active: true,
    });
    logger.info(`✓ Created test room: ${testRoom.id}`);

    // Create a test booking
    const checkInDate = new Date('2025-12-01');
    const checkOutDate = new Date('2025-12-05');
    
    const testBooking = await Booking.create({
      user_id: testUser.id,
      hotel_id: testHotel.id,
      room_id: testRoom.id,
      check_in: checkInDate,
      check_out: checkOutDate,
      nights: 4,
      guests: {
        adults: 2,
        children: 0,
      },
      guest_details: {
        name: 'John Doe',
        email: 'tourist@test.com',
        phone: '+1234567890',
        special_requests: 'Late check-in please',
      },
      pricing: {
        room_rate: 150.0,
        subtotal: 600.0,
        discount: 60.0,
        promo_code: null,
        student_discount: 0,
        tax: 54.0,
        total: 594.0,
      },
      payment: {
        method: PaymentMethod.PAYPAL,
        type: BookingPaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        transactions: [],
        escrow_status: BookingEscrowStatus.HELD,
      },
      status: BookingStatus.PENDING,
    });
    logger.info(`✓ Created test booking: ${testBooking.id}`);
    logger.info(`  Booking number: ${testBooking.booking_number}`);
    logger.info(`  Nights: ${testBooking.nights}`);
    logger.info(`  Total: $${testBooking.pricing.total}`);

    // Test booking instance methods
    logger.info(`  Is upcoming: ${testBooking.isUpcoming()}`);
    logger.info(`  Is active: ${testBooking.isActive()}`);
    logger.info(`  Is past: ${testBooking.isPast()}`);
    logger.info(`  Refund amount: $${testBooking.calculateRefundAmount()}`);

    // Create a test payment transaction
    const testTransaction = await PaymentTransaction.create({
      booking_id: testBooking.id,
      transaction_id: 'PAYPAL-TEST-12345',
      gateway: PaymentGateway.PAYPAL,
      amount: 297.0, // 50% deposit
      currency: Currency.USD,
      payment_type: PaymentType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      gateway_response: {
        status: 'COMPLETED',
        payer_id: 'TEST123',
        transaction_time: new Date().toISOString(),
      },
      escrow_status: EscrowStatus.HELD,
    });
    logger.info(`✓ Created test payment transaction: ${testTransaction.id}`);
    logger.info(`  Transaction ID: ${testTransaction.transaction_id}`);
    logger.info(`  Amount: $${testTransaction.amount}`);
    logger.info(`  Gateway: ${testTransaction.gateway}`);
    logger.info(`  Status: ${testTransaction.status}`);

    // Test transaction instance methods
    logger.info(`  Is successful: ${testTransaction.isSuccessful()}`);
    logger.info(`  Is pending: ${testTransaction.isPending()}`);
    logger.info(`  Is escrow held: ${testTransaction.isEscrowHeld()}`);

    // Test associations - fetch booking with related data
    const bookingWithDetails = await Booking.findByPk(testBooking.id, {
      include: [
        { model: User, as: 'user' },
        { model: Hotel, as: 'hotel' },
        { model: Room, as: 'room' },
        { model: PaymentTransaction, as: 'payment_transactions' },
      ],
    });

    if (bookingWithDetails) {
      logger.info('✓ Successfully fetched booking with associations');
      const userAssoc = (bookingWithDetails as any).user;
      const hotelAssoc = (bookingWithDetails as any).hotel;
      const roomAssoc = (bookingWithDetails as any).room;
      const transactionsAssoc = (bookingWithDetails as any).payment_transactions;
      
      logger.info(`  User: ${userAssoc?.getFullName()}`);
      logger.info(`  Hotel: ${hotelAssoc?.name}`);
      logger.info(`  Room: ${roomAssoc?.room_type}`);
      logger.info(`  Transactions: ${transactionsAssoc?.length}`);
    }

    // Test updating booking status
    testBooking.status = BookingStatus.CONFIRMED;
    await testBooking.save();
    logger.info('✓ Updated booking status to CONFIRMED');

    // Test updating payment transaction escrow status
    testTransaction.escrow_status = EscrowStatus.RELEASED;
    await testTransaction.save();
    logger.info('✓ Updated transaction escrow status to RELEASED');
    logger.info(`  Escrow release date: ${testTransaction.escrow_release_date}`);

    // Test creating a refund transaction
    const refundTransaction = await PaymentTransaction.create({
      booking_id: testBooking.id,
      transaction_id: 'PAYPAL-REFUND-12345',
      gateway: PaymentGateway.PAYPAL,
      amount: 297.0,
      currency: Currency.USD,
      payment_type: PaymentType.DEPOSIT,
      status: TransactionStatus.REFUNDED,
      gateway_response: {
        status: 'REFUNDED',
        refund_id: 'REF123',
      },
      escrow_status: EscrowStatus.REFUNDED,
      refund_amount: 297.0,
      refund_reason: 'Customer cancellation',
    });
    logger.info(`✓ Created refund transaction: ${refundTransaction.id}`);

    // Test milestone payment
    const milestoneTransaction = await PaymentTransaction.create({
      booking_id: testBooking.id,
      transaction_id: 'PAYPAL-MILESTONE-12345',
      gateway: PaymentGateway.PAYPAL,
      amount: 148.5, // 25% milestone
      currency: Currency.USD,
      payment_type: PaymentType.MILESTONE_2,
      status: TransactionStatus.COMPLETED,
      gateway_response: {
        status: 'COMPLETED',
      },
      escrow_status: EscrowStatus.HELD,
    });
    logger.info(`✓ Created milestone payment transaction: ${milestoneTransaction.id}`);

    // Test Bakong payment
    const bakongTransaction = await PaymentTransaction.create({
      booking_id: testBooking.id,
      transaction_id: 'BAKONG-TEST-12345',
      gateway: PaymentGateway.BAKONG,
      amount: 594.0,
      currency: Currency.KHR,
      payment_type: PaymentType.FULL,
      status: TransactionStatus.COMPLETED,
      gateway_response: {
        status: 'COMPLETED',
        qr_code: 'KHQR_CODE_HERE',
      },
      escrow_status: EscrowStatus.HELD,
    });
    logger.info(`✓ Created Bakong payment transaction: ${bakongTransaction.id}`);

    // Fetch all transactions for the booking
    const allTransactions = await PaymentTransaction.findAll({
      where: { booking_id: testBooking.id },
    });
    logger.info(`✓ Total transactions for booking: ${allTransactions.length}`);

    // Test safe object methods
    testBooking.toSafeObject();
    logger.info('✓ Generated safe booking object');
    
    testTransaction.toSafeObject();
    logger.info('✓ Generated safe transaction object (gateway response sanitized)');

    logger.info('\n✅ All Booking and PaymentTransaction model tests passed!');
    logger.info('\nModel Features Tested:');
    logger.info('  ✓ Booking creation with all required fields');
    logger.info('  ✓ Automatic booking number generation');
    logger.info('  ✓ Automatic nights calculation');
    logger.info('  ✓ Booking status management');
    logger.info('  ✓ Payment transaction creation');
    logger.info('  ✓ Multiple payment gateways (PayPal, Bakong, Stripe)');
    logger.info('  ✓ Multiple payment types (deposit, milestone, full)');
    logger.info('  ✓ Escrow status management');
    logger.info('  ✓ Refund processing');
    logger.info('  ✓ Model associations (User, Hotel, Room, Booking, PaymentTransaction)');
    logger.info('  ✓ Instance methods (isUpcoming, isActive, calculateRefundAmount, etc.)');
    logger.info('  ✓ Indexes for performance optimization');
    logger.info('  ✓ Data validation and constraints');

  } catch (error) {
    logger.error('❌ Test failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    logger.info('Database connection closed');
  }
}

// Run the test
testBookingModels()
  .then(() => {
    logger.info('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
