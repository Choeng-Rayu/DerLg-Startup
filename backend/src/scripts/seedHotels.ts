import sequelize from '../config/database';
import User, { UserType, Language, Currency } from '../models/User';
import Hotel, { HotelStatus } from '../models/Hotel';
import Room from '../models/Room';

/**
 * Seed script to create test hotels and rooms
 */
async function seedHotels() {
  try {
    console.log('Starting hotel seeding...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Find or create an admin user
    let adminUser = await User.findOne({
      where: { user_type: UserType.ADMIN },
    });

    if (!adminUser) {
      adminUser = await User.create({
        user_type: UserType.ADMIN,
        email: 'admin@hotel.com',
        password_hash: 'Admin123!', // Will be hashed by beforeCreate hook
        first_name: 'Hotel',
        last_name: 'Admin',
        phone: '+855123456789',
        language: Language.ENGLISH,
        currency: Currency.USD,
        is_student: false,
        email_verified: true,
        is_active: true,
      });
      console.log('✓ Created admin user\n');
    } else {
      console.log('✓ Using existing admin user\n');
    }

    // Create hotels
    const hotelsData = [
      {
        name: 'Royal Palace Hotel',
        description: 'Luxury hotel in the heart of Phnom Penh with stunning views of the Royal Palace. Features world-class amenities and exceptional service.',
        location: {
          address: '123 Samdech Sothearos Blvd',
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          country: 'Cambodia',
          latitude: 11.5564,
          longitude: 104.9282,
          google_maps_url: 'https://maps.google.com/?q=11.5564,104.9282',
        },
        contact: {
          phone: '+855 23 123 456',
          email: 'info@royalpalacehotel.com',
          website: 'https://royalpalacehotel.com',
        },
        amenities: ['wifi', 'pool', 'spa', 'restaurant', 'gym', 'parking', 'bar'],
        images: [
          'https://res.cloudinary.com/demo/image/upload/hotel1.jpg',
          'https://res.cloudinary.com/demo/image/upload/hotel1-2.jpg',
        ],
        logo: 'https://res.cloudinary.com/demo/image/upload/logo1.jpg',
        star_rating: 5,
        average_rating: 4.8,
        total_reviews: 245,
        status: HotelStatus.ACTIVE,
        approval_date: new Date(),
      },
      {
        name: 'Angkor Paradise Resort',
        description: 'Beautiful resort near Angkor Wat temples. Perfect for exploring ancient wonders with modern comfort.',
        location: {
          address: '456 Charles de Gaulle Blvd',
          city: 'Siem Reap',
          province: 'Siem Reap',
          country: 'Cambodia',
          latitude: 13.3671,
          longitude: 103.8448,
          google_maps_url: 'https://maps.google.com/?q=13.3671,103.8448',
        },
        contact: {
          phone: '+855 63 789 012',
          email: 'info@angkorparadise.com',
          website: 'https://angkorparadise.com',
        },
        amenities: ['wifi', 'pool', 'restaurant', 'breakfast', 'shuttle', 'parking'],
        images: [
          'https://res.cloudinary.com/demo/image/upload/hotel2.jpg',
          'https://res.cloudinary.com/demo/image/upload/hotel2-2.jpg',
        ],
        logo: 'https://res.cloudinary.com/demo/image/upload/logo2.jpg',
        star_rating: 4,
        average_rating: 4.5,
        total_reviews: 189,
        status: HotelStatus.ACTIVE,
        approval_date: new Date(),
      },
      {
        name: 'Riverside Boutique Hotel',
        description: 'Charming boutique hotel along the Mekong River with personalized service and local charm.',
        location: {
          address: '789 Sisowath Quay',
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          country: 'Cambodia',
          latitude: 11.5753,
          longitude: 104.9301,
          google_maps_url: 'https://maps.google.com/?q=11.5753,104.9301',
        },
        contact: {
          phone: '+855 23 345 678',
          email: 'info@riversideboutique.com',
          website: 'https://riversideboutique.com',
        },
        amenities: ['wifi', 'restaurant', 'bar', 'breakfast', 'rooftop'],
        images: [
          'https://res.cloudinary.com/demo/image/upload/hotel3.jpg',
        ],
        logo: 'https://res.cloudinary.com/demo/image/upload/logo3.jpg',
        star_rating: 4,
        average_rating: 4.6,
        total_reviews: 132,
        status: HotelStatus.ACTIVE,
        approval_date: new Date(),
      },
      {
        name: 'Beach Haven Resort',
        description: 'Tropical beach resort in Sihanoukville with pristine beaches and water sports.',
        location: {
          address: '321 Serendipity Beach Road',
          city: 'Sihanoukville',
          province: 'Preah Sihanouk',
          country: 'Cambodia',
          latitude: 10.6297,
          longitude: 103.5098,
          google_maps_url: 'https://maps.google.com/?q=10.6297,103.5098',
        },
        contact: {
          phone: '+855 34 567 890',
          email: 'info@beachhaven.com',
          website: 'https://beachhaven.com',
        },
        amenities: ['wifi', 'pool', 'beach', 'restaurant', 'bar', 'spa', 'water-sports'],
        images: [
          'https://res.cloudinary.com/demo/image/upload/hotel4.jpg',
        ],
        logo: 'https://res.cloudinary.com/demo/image/upload/logo4.jpg',
        star_rating: 4,
        average_rating: 4.3,
        total_reviews: 98,
        status: HotelStatus.ACTIVE,
        approval_date: new Date(),
      },
      {
        name: 'Budget Inn Phnom Penh',
        description: 'Affordable accommodation with clean rooms and friendly service. Perfect for budget travelers.',
        location: {
          address: '555 Monivong Blvd',
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          country: 'Cambodia',
          latitude: 11.5449,
          longitude: 104.9214,
          google_maps_url: 'https://maps.google.com/?q=11.5449,104.9214',
        },
        contact: {
          phone: '+855 23 901 234',
          email: 'info@budgetinn.com',
          website: 'https://budgetinn.com',
        },
        amenities: ['wifi', 'breakfast', 'parking'],
        images: [
          'https://res.cloudinary.com/demo/image/upload/hotel5.jpg',
        ],
        logo: 'https://res.cloudinary.com/demo/image/upload/logo5.jpg',
        star_rating: 3,
        average_rating: 4.0,
        total_reviews: 67,
        status: HotelStatus.ACTIVE,
        approval_date: new Date(),
      },
    ];

    console.log('Creating hotels...\n');
    const hotels = [];
    for (const hotelData of hotelsData) {
      const hotel = await Hotel.create({
        ...hotelData,
        admin_id: adminUser.id,
      });
      hotels.push(hotel);
      console.log(`✓ Created hotel: ${hotel.name}`);
    }

    console.log('\nCreating rooms...\n');

    // Create rooms for each hotel
    const roomsData = [
      // Royal Palace Hotel rooms
      {
        hotel_id: hotels[0].id,
        room_type: 'Deluxe Suite',
        description: 'Spacious suite with king bed, living area, and city views',
        capacity: 2,
        bed_type: 'king',
        size_sqm: 45,
        price_per_night: 180,
        discount_percentage: 0,
        amenities: ['wifi', 'tv', 'minibar', 'safe', 'balcony'],
        images: ['https://res.cloudinary.com/demo/image/upload/room1.jpg'],
        total_rooms: 10,
      },
      {
        hotel_id: hotels[0].id,
        room_type: 'Executive Room',
        description: 'Elegant room with queen bed and work desk',
        capacity: 2,
        bed_type: 'queen',
        size_sqm: 35,
        price_per_night: 120,
        discount_percentage: 10,
        amenities: ['wifi', 'tv', 'minibar', 'safe'],
        images: ['https://res.cloudinary.com/demo/image/upload/room2.jpg'],
        total_rooms: 20,
      },
      // Angkor Paradise Resort rooms
      {
        hotel_id: hotels[1].id,
        room_type: 'Garden View Room',
        description: 'Comfortable room overlooking tropical gardens',
        capacity: 2,
        bed_type: 'double',
        size_sqm: 30,
        price_per_night: 85,
        discount_percentage: 0,
        amenities: ['wifi', 'tv', 'minibar'],
        images: ['https://res.cloudinary.com/demo/image/upload/room3.jpg'],
        total_rooms: 15,
      },
      {
        hotel_id: hotels[1].id,
        room_type: 'Family Suite',
        description: 'Large suite perfect for families with two bedrooms',
        capacity: 4,
        bed_type: 'twin',
        size_sqm: 55,
        price_per_night: 150,
        discount_percentage: 15,
        amenities: ['wifi', 'tv', 'minibar', 'kitchenette'],
        images: ['https://res.cloudinary.com/demo/image/upload/room4.jpg'],
        total_rooms: 8,
      },
      // Riverside Boutique Hotel rooms
      {
        hotel_id: hotels[2].id,
        room_type: 'River View Room',
        description: 'Boutique room with stunning river views',
        capacity: 2,
        bed_type: 'queen',
        size_sqm: 28,
        price_per_night: 95,
        discount_percentage: 0,
        amenities: ['wifi', 'tv', 'balcony'],
        images: ['https://res.cloudinary.com/demo/image/upload/room5.jpg'],
        total_rooms: 12,
      },
      // Beach Haven Resort rooms
      {
        hotel_id: hotels[3].id,
        room_type: 'Beach Bungalow',
        description: 'Private bungalow steps from the beach',
        capacity: 2,
        bed_type: 'king',
        size_sqm: 40,
        price_per_night: 110,
        discount_percentage: 0,
        amenities: ['wifi', 'tv', 'minibar', 'outdoor-shower'],
        images: ['https://res.cloudinary.com/demo/image/upload/room6.jpg'],
        total_rooms: 15,
      },
      {
        hotel_id: hotels[3].id,
        room_type: 'Ocean View Suite',
        description: 'Luxury suite with panoramic ocean views',
        capacity: 3,
        bed_type: 'king',
        size_sqm: 50,
        price_per_night: 160,
        discount_percentage: 0,
        amenities: ['wifi', 'tv', 'minibar', 'jacuzzi', 'balcony'],
        images: ['https://res.cloudinary.com/demo/image/upload/room7.jpg'],
        total_rooms: 6,
      },
      // Budget Inn rooms
      {
        hotel_id: hotels[4].id,
        room_type: 'Standard Room',
        description: 'Clean and comfortable budget room',
        capacity: 2,
        bed_type: 'double',
        size_sqm: 20,
        price_per_night: 35,
        discount_percentage: 0,
        amenities: ['wifi', 'tv'],
        images: ['https://res.cloudinary.com/demo/image/upload/room8.jpg'],
        total_rooms: 25,
      },
      {
        hotel_id: hotels[4].id,
        room_type: 'Twin Room',
        description: 'Budget room with two single beds',
        capacity: 2,
        bed_type: 'twin',
        size_sqm: 22,
        price_per_night: 40,
        discount_percentage: 0,
        amenities: ['wifi', 'tv'],
        images: ['https://res.cloudinary.com/demo/image/upload/room9.jpg'],
        total_rooms: 20,
      },
    ];

    for (const roomData of roomsData) {
      const room = await Room.create(roomData);
      console.log(`✓ Created room: ${room.room_type} at ${hotels.find(h => h.id === room.hotel_id)?.name}`);
    }

    console.log('\n=== Hotel Seeding Completed Successfully ===\n');
    console.log(`Total hotels created: ${hotels.length}`);
    console.log(`Total rooms created: ${roomsData.length}`);
    console.log('');

    process.exit(0);
  } catch (error: any) {
    console.error('✗ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run seeding
seedHotels();
