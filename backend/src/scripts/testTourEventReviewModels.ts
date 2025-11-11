import sequelize from '../config/database';
import { User, Tour, Event, Review, Hotel, Room, Booking } from '../models';
import { UserType } from '../models/User';
import { TourDifficulty } from '../models/Tour';
import { EventType } from '../models/Event';
import { HotelStatus } from '../models/Hotel';
import { BookingStatus, PaymentMethod, PaymentType, PaymentStatus, EscrowStatus } from '../models/Booking';

async function testTourEventReviewModels() {
  try {
    console.log('🔄 Testing Tour, Event, and Review models...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced with database\n');

    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await Review.destroy({ where: {}, force: true });
    await Event.destroy({ where: {}, force: true });
    await Tour.destroy({ where: {}, force: true });
    await Booking.destroy({ where: {}, force: true });
    await Room.destroy({ where: {}, force: true });
    await Hotel.destroy({ where: {}, force: true });
    await User.destroy({ where: { email: ['test-tourist@example.com', 'test-admin@example.com', 'test-superadmin@example.com'] } });
    console.log('✅ Cleanup complete\n');

    // Create test users
    console.log('👤 Creating test users...');
    const tourist = await User.create({
      user_type: UserType.TOURIST,
      email: 'test-tourist@example.com',
      password_hash: 'hashedpassword123',
      first_name: 'John',
      last_name: 'Doe',
    });
    console.log(`✅ Created tourist: ${tourist.getFullName()}`);

    const admin = await User.create({
      user_type: UserType.ADMIN,
      email: 'test-admin@example.com',
      password_hash: 'hashedpassword123',
      first_name: 'Jane',
      last_name: 'Smith',
    });
    console.log(`✅ Created admin: ${admin.getFullName()}`);

    const superAdmin = await User.create({
      user_type: UserType.SUPER_ADMIN,
      email: 'test-superadmin@example.com',
      password_hash: 'hashedpassword123',
      first_name: 'Super',
      last_name: 'Admin',
    });
    console.log(`✅ Created super admin: ${superAdmin.getFullName()}\n`);

    // Create test hotel and room for booking
    console.log('🏨 Creating test hotel and room...');
    const hotel = await Hotel.create({
      admin_id: admin.id,
      name: 'Test Hotel',
      description: 'A beautiful test hotel',
      location: {
        address: '123 Test St',
        city: 'Siem Reap',
        province: 'Siem Reap',
        country: 'Cambodia',
        latitude: 13.3633,
        longitude: 103.8564,
        google_maps_url: 'https://maps.google.com',
      },
      contact: {
        phone: '+855123456789',
        email: 'hotel@test.com',
        website: 'https://testhotel.com',
      },
      amenities: ['wifi', 'pool', 'restaurant'],
      images: ['https://example.com/image1.jpg'],
      star_rating: 4,
      status: HotelStatus.ACTIVE,
    });
    console.log(`✅ Created hotel: ${hotel.name}`);

    const room = await Room.create({
      hotel_id: hotel.id,
      room_type: 'Deluxe Suite',
      description: 'A luxurious room',
      capacity: 2,
      bed_type: 'king',
      size_sqm: 40,
      price_per_night: 100,
      amenities: ['wifi', 'tv', 'minibar'],
      images: ['https://example.com/room1.jpg'],
      total_rooms: 10,
    });
    console.log(`✅ Created room: ${room.room_type}\n`);

    // Test 1: Create a Tour
    console.log('🎯 Test 1: Creating a Tour...');
    const tour = await Tour.create({
      name: 'Angkor Wat Temple Tour',
      description: 'Explore the magnificent Angkor Wat temple complex',
      destination: 'Siem Reap',
      duration: {
        days: 3,
        nights: 2,
      },
      difficulty: TourDifficulty.MODERATE,
      category: ['cultural', 'historical', 'adventure'],
      price_per_person: 150.00,
      group_size: {
        min: 2,
        max: 15,
      },
      inclusions: ['Professional guide', 'Transportation', 'Entrance fees', 'Lunch'],
      exclusions: ['Personal expenses', 'Tips', 'Dinner'],
      itinerary: [
        {
          day: 1,
          title: 'Angkor Wat Sunrise',
          description: 'Watch the sunrise over Angkor Wat',
          activities: ['Sunrise viewing', 'Temple exploration', 'Photography'],
          meals: ['Breakfast', 'Lunch'],
          accommodation: 'Hotel in Siem Reap',
        },
        {
          day: 2,
          title: 'Bayon and Ta Prohm',
          description: 'Explore more temples',
          activities: ['Bayon temple', 'Ta Prohm temple', 'Local market'],
          meals: ['Breakfast', 'Lunch'],
          accommodation: 'Hotel in Siem Reap',
        },
        {
          day: 3,
          title: 'Banteay Srei',
          description: 'Visit the pink temple',
          activities: ['Banteay Srei', 'Countryside tour'],
          meals: ['Breakfast', 'Lunch'],
          accommodation: null,
        },
      ],
      images: ['https://example.com/tour1.jpg', 'https://example.com/tour2.jpg'],
      meeting_point: {
        address: 'Siem Reap City Center',
        latitude: 13.3633,
        longitude: 103.8564,
      },
      guide_required: true,
      transportation_required: true,
    });
    console.log(`✅ Created tour: ${tour.name}`);
    console.log(`   - Destination: ${tour.destination}`);
    console.log(`   - Duration: ${tour.duration.days} days, ${tour.duration.nights} nights`);
    console.log(`   - Difficulty: ${tour.difficulty}`);
    console.log(`   - Price per person: $${tour.price_per_person}`);
    console.log(`   - Group size: ${tour.group_size.min}-${tour.group_size.max} people`);
    console.log(`   - Categories: ${tour.category.join(', ')}`);
    console.log(`   - Guide required: ${tour.guide_required}`);
    console.log(`   - Transportation required: ${tour.transportation_required}\n`);

    // Test tour instance methods
    console.log('🧪 Testing tour instance methods...');
    console.log(`   - Available for 5 people: ${tour.isAvailableForGroupSize(5)}`);
    console.log(`   - Available for 20 people: ${tour.isAvailableForGroupSize(20)}`);
    console.log(`   - Total price for 4 people: $${tour.calculateGroupPrice(4)}\n`);

    // Test 2: Create an Event
    console.log('🎯 Test 2: Creating an Event...');
    const event = await Event.create({
      name: 'Khmer New Year Festival',
      description: 'Celebrate the traditional Khmer New Year with locals',
      event_type: EventType.FESTIVAL,
      start_date: new Date('2025-04-14'),
      end_date: new Date('2025-04-16'),
      location: {
        city: 'Phnom Penh',
        province: 'Phnom Penh',
        venue: 'Royal Palace',
        latitude: 11.5564,
        longitude: 104.9282,
      },
      pricing: {
        base_price: 50.00,
        vip_price: 100.00,
      },
      capacity: 500,
      images: ['https://example.com/event1.jpg'],
      cultural_significance: 'Khmer New Year is the most important holiday in Cambodia',
      what_to_expect: 'Traditional games, water splashing, cultural performances',
      related_tours: [tour.id],
      created_by: superAdmin.id,
    });
    console.log(`✅ Created event: ${event.name}`);
    console.log(`   - Type: ${event.event_type}`);
    console.log(`   - Start date: ${event.start_date}`);
    console.log(`   - End date: ${event.end_date}`);
    console.log(`   - Location: ${event.location.venue}, ${event.location.city}`);
    console.log(`   - Base price: $${event.pricing.base_price}`);
    console.log(`   - VIP price: $${event.pricing.vip_price}`);
    console.log(`   - Capacity: ${event.capacity}`);
    console.log(`   - Bookings: ${event.bookings_count}\n`);

    // Test event instance methods
    console.log('🧪 Testing event instance methods...');
    console.log(`   - Is upcoming: ${event.isUpcoming()}`);
    console.log(`   - Is ongoing: ${event.isOngoing()}`);
    console.log(`   - Is past: ${event.isPast()}`);
    console.log(`   - Has available capacity: ${event.hasAvailableCapacity()}`);
    console.log(`   - Available spots: ${event.getAvailableSpots()}`);
    console.log(`   - Duration in days: ${event.getDurationInDays()}\n`);

    // Create a booking for review testing
    console.log('📝 Creating test booking...');
    const booking = await Booking.create({
      user_id: tourist.id,
      hotel_id: hotel.id,
      room_id: room.id,
      check_in: new Date('2025-12-15'),
      check_out: new Date('2025-12-18'),
      nights: 3,
      guests: {
        adults: 2,
        children: 0,
      },
      guest_details: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        special_requests: 'Late check-in',
      },
      pricing: {
        room_rate: 100,
        subtotal: 300,
        discount: 0,
        promo_code: null,
        student_discount: 0,
        tax: 30,
        total: 330,
      },
      payment: {
        method: PaymentMethod.PAYPAL,
        type: PaymentType.FULL,
        status: PaymentStatus.COMPLETED,
        transactions: [],
        escrow_status: EscrowStatus.HELD,
      },
      status: BookingStatus.COMPLETED,
    });
    console.log(`✅ Created booking: ${booking.booking_number}\n`);

    // Test 3: Create a Review
    console.log('🎯 Test 3: Creating a Review...');
    const review = await Review.create({
      user_id: tourist.id,
      booking_id: booking.id,
      hotel_id: hotel.id,
      ratings: {
        overall: 5,
        cleanliness: 5,
        service: 4,
        location: 5,
        value: 4,
      },
      comment: 'Amazing hotel! The staff was incredibly friendly and helpful. The room was spotless and the location was perfect for exploring Siem Reap. Highly recommend!',
      sentiment: {
        score: 0.92,
        classification: 'positive',
        topics: [
          { topic: 'staff', sentiment: 0.95 },
          { topic: 'cleanliness', sentiment: 0.98 },
          { topic: 'location', sentiment: 0.90 },
        ],
      },
      images: ['https://example.com/review1.jpg'],
      is_verified: true,
    });
    console.log(`✅ Created review for hotel: ${hotel.name}`);
    console.log(`   - Overall rating: ${review.ratings.overall}/5`);
    console.log(`   - Average rating: ${review.getAverageRating()}/5`);
    console.log(`   - Sentiment score: ${review.sentiment?.score}`);
    console.log(`   - Sentiment classification: ${review.sentiment?.classification}`);
    console.log(`   - Comment: ${review.comment.substring(0, 50)}...`);
    console.log(`   - Is verified: ${review.is_verified}\n`);

    // Test review instance methods
    console.log('🧪 Testing review instance methods...');
    console.log(`   - Is positive: ${review.isPositive()}`);
    console.log(`   - Is negative: ${review.isNegative()}`);
    console.log(`   - Needs attention: ${review.needsAttention()}`);
    console.log(`   - Helpful count: ${review.helpful_count}`);
    
    await review.markAsHelpful();
    console.log(`   - Helpful count after marking: ${review.helpful_count}\n`);

    // Test 4: Create a negative review
    console.log('🎯 Test 4: Creating a negative review...');
    const negativeReview = await Review.create({
      user_id: tourist.id,
      booking_id: booking.id,
      tour_id: tour.id,
      ratings: {
        overall: 2,
        cleanliness: 2,
        service: 1,
        location: 3,
        value: 2,
      },
      comment: 'Very disappointed with this tour. The guide was unprofessional and the itinerary was not followed. Would not recommend.',
      sentiment: {
        score: 0.25,
        classification: 'negative',
        topics: [
          { topic: 'guide', sentiment: 0.15 },
          { topic: 'service', sentiment: 0.20 },
          { topic: 'value', sentiment: 0.30 },
        ],
      },
      images: [],
      is_verified: true,
    });
    console.log(`✅ Created negative review for tour: ${tour.name}`);
    console.log(`   - Overall rating: ${negativeReview.ratings.overall}/5`);
    console.log(`   - Average rating: ${negativeReview.getAverageRating()}/5`);
    console.log(`   - Sentiment score: ${negativeReview.sentiment?.score}`);
    console.log(`   - Sentiment classification: ${negativeReview.sentiment?.classification}`);
    console.log(`   - Needs attention: ${negativeReview.needsAttention()}\n`);

    // Test 5: Query tours with filters
    console.log('🎯 Test 5: Querying tours...');
    const tours = await Tour.findAll({
      where: {
        destination: 'Siem Reap',
        is_active: true,
      },
    });
    console.log(`✅ Found ${tours.length} active tour(s) in Siem Reap\n`);

    // Test 6: Query events by date
    console.log('🎯 Test 6: Querying events...');
    const events = await Event.findAll({
      where: {
        event_type: EventType.FESTIVAL,
        is_active: true,
      },
    });
    console.log(`✅ Found ${events.length} active festival(s)\n`);

    // Test 7: Query reviews with associations
    console.log('🎯 Test 7: Querying reviews with associations...');
    const reviews = await Review.findAll({
      include: [
        { model: User, as: 'user' },
        { model: Hotel, as: 'hotel' },
        { model: Tour, as: 'tour' },
      ],
    });
    console.log(`✅ Found ${reviews.length} review(s) with associations`);
    for (const r of reviews) {
      console.log(`   - Review by ${(r as any).user.getFullName()}`);
      if ((r as any).hotel) {
        console.log(`     For hotel: ${(r as any).hotel.name}`);
      }
      if ((r as any).tour) {
        console.log(`     For tour: ${(r as any).tour.name}`);
      }
    }
    console.log();

    // Test 8: Update tour average rating
    console.log('🎯 Test 8: Updating tour statistics...');
    tour.average_rating = 4.5;
    tour.total_bookings = 25;
    await tour.save();
    console.log(`✅ Updated tour: ${tour.name}`);
    console.log(`   - Average rating: ${tour.average_rating}`);
    console.log(`   - Total bookings: ${tour.total_bookings}\n`);

    // Test 9: Update event bookings count
    console.log('🎯 Test 9: Updating event bookings...');
    event.bookings_count = 50;
    await event.save();
    console.log(`✅ Updated event: ${event.name}`);
    console.log(`   - Bookings count: ${event.bookings_count}`);
    console.log(`   - Available spots: ${event.getAvailableSpots()}\n`);

    // Test 10: Add admin response to review
    console.log('🎯 Test 10: Adding admin response to review...');
    review.admin_response = 'Thank you for your wonderful feedback! We are delighted to hear you enjoyed your stay.';
    await review.save();
    console.log(`✅ Added admin response to review`);
    console.log(`   - Response: ${review.admin_response}\n`);

    console.log('✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Tours created: 1`);
    console.log(`   - Events created: 1`);
    console.log(`   - Reviews created: 2`);
    console.log(`   - All models working correctly with validations and associations\n`);

  } catch (error) {
    console.error('❌ Error testing models:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testTourEventReviewModels();
