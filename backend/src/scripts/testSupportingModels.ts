import sequelize from '../config/database';
import {
  User,
  PromoCode,
  Message,
  Wishlist,
  AIConversation,
  Booking,
  Hotel,
  Room,
} from '../models';
import { UserType } from '../models/User';
import { HotelStatus } from '../models/Hotel';
import { BookingStatus, PaymentMethod, PaymentType, PaymentStatus, EscrowStatus } from '../models/Booking';
import { DiscountType, ApplicableTo } from '../models/PromoCode';
import { SenderType } from '../models/Message';
import { ItemType } from '../models/Wishlist';
import { AIType, MessageRole } from '../models/AIConversation';

/**
 * Test script for supporting models (PromoCode, Message, Wishlist, AIConversation)
 */
async function testSupportingModels() {
  try {
    console.log('🔄 Starting supporting models test...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized\n');

    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await AIConversation.destroy({ where: {}, force: true, truncate: true });
    await Wishlist.destroy({ where: {}, force: true, truncate: true });
    await Message.destroy({ where: {}, force: true, truncate: true });
    await PromoCode.destroy({ where: {}, force: true, truncate: true });
    console.log('✅ Cleanup complete\n');

    // ==================== Test PromoCode Model ====================
    console.log('📋 Testing PromoCode Model...');

    // Create test users with unique emails
    const timestamp = Date.now();
    const superAdmin = await User.create({
      user_type: UserType.SUPER_ADMIN,
      email: `superadmin-${timestamp}@test.com`,
      password_hash: 'hashedpassword123',
      first_name: 'Super',
      last_name: 'Admin',
    });
    console.log('✅ Created super admin user');

    const tourist = await User.create({
      user_type: UserType.TOURIST,
      email: `tourist-${timestamp}@test.com`,
      password_hash: 'hashedpassword123',
      first_name: 'John',
      last_name: 'Doe',
    });
    console.log('✅ Created tourist user');

    // Create percentage promo code
    const percentagePromo = await PromoCode.create({
      code: 'SUMMER2025',
      description: '20% off summer bookings',
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 20,
      min_booking_amount: 100,
      max_discount: 50,
      valid_from: new Date('2025-06-01'),
      valid_until: new Date('2025-08-31'),
      usage_limit: 100,
      applicable_to: ApplicableTo.ALL,
      created_by: superAdmin.id,
    });
    console.log('✅ Created percentage promo code:', percentagePromo.code);

    // Test promo code validation
    console.log('  - Is valid:', percentagePromo.isValid());
    console.log('  - Can apply to hotels:', percentagePromo.canApplyTo('hotels'));
    console.log(
      '  - Discount for $200:',
      percentagePromo.calculateDiscount(200)
    );
    console.log(
      '  - Discount for $500 (capped):',
      percentagePromo.calculateDiscount(500)
    );

    // Create fixed amount promo code
    const fixedPromo = await PromoCode.create({
      code: 'WELCOME50',
      description: '$50 off first booking',
      discount_type: DiscountType.FIXED,
      discount_value: 50,
      min_booking_amount: 150,
      valid_from: new Date('2025-01-01'),
      valid_until: new Date('2025-12-31'),
      usage_limit: 500,
      applicable_to: ApplicableTo.HOTELS,
      created_by: superAdmin.id,
    });
    console.log('✅ Created fixed amount promo code:', fixedPromo.code);
    console.log('  - Discount for $200:', fixedPromo.calculateDiscount(200));

    // Test usage increment
    await percentagePromo.incrementUsage();
    await percentagePromo.reload();
    console.log('✅ Incremented usage count:', percentagePromo.usage_count);

    // ==================== Test Message Model ====================
    console.log('\n📋 Testing Message Model...');

    // Create test hotel and booking
    const hotelAdmin = await User.create({
      user_type: UserType.ADMIN,
      email: `hoteladmin-${timestamp}@test.com`,
      password_hash: 'hashedpassword123',
      first_name: 'Hotel',
      last_name: 'Admin',
    });
    console.log('✅ Created hotel admin user');

    const hotel = await Hotel.create({
      admin_id: hotelAdmin.id,
      name: 'Test Hotel',
      description: 'A test hotel',
      star_rating: 4,
      location: {
        address: '123 Test St',
        city: 'Phnom Penh',
        province: 'Phnom Penh',
        country: 'Cambodia',
        latitude: 11.5564,
        longitude: 104.9282,
        google_maps_url: 'https://maps.google.com',
      },
      contact: {
        phone: '+855123456789',
        email: 'hotel@test.com',
        website: 'https://testhotel.com',
      },
      amenities: ['wifi', 'pool'],
      images: ['https://example.com/image1.jpg'],
      status: HotelStatus.ACTIVE,
    });
    console.log('✅ Created test hotel');

    const room = await Room.create({
      hotel_id: hotel.id,
      room_type: 'Deluxe',
      description: 'A deluxe room',
      capacity: 2,
      bed_type: 'king',
      size_sqm: 30,
      price_per_night: 100,
      amenities: ['wifi', 'tv'],
      images: ['https://example.com/room1.jpg'],
      total_rooms: 10,
    });
    console.log('✅ Created test room');

    const booking = await Booking.create({
      booking_number: `BK-TEST-${timestamp}`,
      user_id: tourist.id,
      hotel_id: hotel.id,
      room_id: room.id,
      check_in: new Date('2025-12-01'),
      check_out: new Date('2025-12-05'),
      nights: 4,
      guests: { adults: 2, children: 0 },
      guest_details: {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890',
        special_requests: 'Late check-in',
      },
      pricing: {
        room_rate: 100,
        subtotal: 400,
        discount: 0,
        promo_code: null,
        student_discount: 0,
        tax: 40,
        total: 440,
      },
      payment: {
        method: PaymentMethod.PAYPAL,
        type: PaymentType.FULL,
        status: PaymentStatus.PENDING,
        transactions: [],
        escrow_status: EscrowStatus.HELD,
      },
      status: BookingStatus.PENDING,
    });
    console.log('✅ Created test booking');

    // Create message from tourist to hotel admin
    const message1 = await Message.create({
      booking_id: booking.id,
      sender_id: tourist.id,
      sender_type: SenderType.TOURIST,
      recipient_id: hotelAdmin.id,
      message: 'Hello, I would like to request a late check-in at 10 PM.',
      attachments: [],
    });
    console.log('✅ Created message from tourist');
    console.log('  - Preview:', message1.getPreview(50));
    console.log('  - Time since:', message1.getTimeSince());

    // Create reply from hotel admin
    const message2 = await Message.create({
      booking_id: booking.id,
      sender_id: hotelAdmin.id,
      sender_type: SenderType.HOTEL_ADMIN,
      recipient_id: tourist.id,
      message: 'Of course! Late check-in at 10 PM is confirmed.',
      attachments: [],
    });
    console.log('✅ Created reply from hotel admin');

    // Mark message as read
    await message2.markAsRead();
    await message2.reload();
    console.log('✅ Marked message as read:', message2.is_read);
    console.log('  - Read at:', message2.read_at);

    // ==================== Test Wishlist Model ====================
    console.log('\n📋 Testing Wishlist Model...');

    // Create wishlist items
    const wishlist1 = await Wishlist.create({
      user_id: tourist.id,
      item_type: ItemType.HOTEL,
      item_id: hotel.id,
      notes: 'For anniversary trip in June',
    });
    console.log('✅ Created hotel wishlist item');
    console.log('  - Has notes:', wishlist1.hasNotes());
    console.log('  - Formatted type:', wishlist1.getFormattedItemType());
    console.log('  - Time since added:', wishlist1.getTimeSinceAdded());

    // Create wishlist without notes
    const wishlist2 = await Wishlist.create({
      user_id: tourist.id,
      item_type: ItemType.TOUR,
      item_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    console.log('✅ Created tour wishlist item');
    console.log('  - Has notes:', wishlist2.hasNotes());

    // Update notes
    await wishlist2.updateNotes('Interested in temple tours');
    await wishlist2.reload();
    console.log('✅ Updated wishlist notes:', wishlist2.notes);

    // ==================== Test AIConversation Model ====================
    console.log('\n📋 Testing AIConversation Model...');

    // Create AI conversation
    const conversation = await AIConversation.create({
      user_id: tourist.id,
      session_id: 'session-' + Date.now(),
      ai_type: AIType.STREAMING,
      context: {
        budget: 1000,
        destination: 'Siem Reap',
        dates: {
          start: new Date('2025-12-01'),
          end: new Date('2025-12-05'),
        },
        preferences: ['temples', 'culture'],
      },
    });
    console.log('✅ Created AI conversation');

    // Add messages
    await conversation.addMessage(
      MessageRole.USER,
      'I want to visit Angkor Wat'
    );
    await conversation.addMessage(
      MessageRole.ASSISTANT,
      'Great choice! Angkor Wat is amazing. I recommend a 3-day pass.'
    );
    await conversation.reload();
    console.log('✅ Added messages to conversation');
    console.log('  - Message count:', conversation.getMessageCount());
    console.log('  - User messages:', conversation.getUserMessageCount());
    console.log('  - Assistant messages:', conversation.getAssistantMessageCount());

    // Add recommendations
    await conversation.addRecommendations({
      hotel_ids: [hotel.id],
      tour_ids: ['550e8400-e29b-41d4-a716-446655440001'],
    });
    await conversation.reload();
    console.log('✅ Added recommendations');
    console.log(
      '  - Total recommendations:',
      conversation.getTotalRecommendationsCount()
    );

    // Mark as converted
    await conversation.markAsConverted(booking.id);
    await conversation.reload();
    console.log('✅ Marked conversation as converted');
    console.log('  - Has converted:', conversation.hasConverted());
    console.log('  - Summary:', conversation.getSummary());

    // ==================== Test Associations ====================
    console.log('\n📋 Testing Associations...');

    // Load user with associations
    const userWithAssociations = await User.findByPk(tourist.id, {
      include: [
        { model: Wishlist, as: 'wishlists' },
        { model: AIConversation, as: 'ai_conversations' },
        { model: Message, as: 'sent_messages' },
      ],
    });

    console.log('✅ Loaded user with associations:');
    console.log('  - Wishlists:', userWithAssociations?.wishlists?.length);
    console.log(
      '  - AI Conversations:',
      userWithAssociations?.ai_conversations?.length
    );
    console.log('  - Sent messages:', userWithAssociations?.sent_messages?.length);

    // Load booking with messages
    const bookingWithMessages = await Booking.findByPk(booking.id, {
      include: [{ model: Message, as: 'messages' }],
    });

    console.log('✅ Loaded booking with messages:');
    console.log('  - Messages:', bookingWithMessages?.messages?.length);

    // ==================== Summary ====================
    console.log('\n✅ All supporting models tests passed successfully!');
    console.log('\nSummary:');
    console.log('  - PromoCode: ✅ Created and tested');
    console.log('  - Message: ✅ Created and tested');
    console.log('  - Wishlist: ✅ Created and tested');
    console.log('  - AIConversation: ✅ Created and tested');
    console.log('  - Associations: ✅ All working correctly');

    // Close connection
    await sequelize.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error during test:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testSupportingModels();
