import sequelize from '../config/database';
import User, { UserType, Language, Currency } from '../models/User';
import Hotel, { HotelStatus } from '../models/Hotel';

/**
 * Create a test admin user with known credentials
 */
async function createTestAdmin() {
  try {
    console.log('Creating test admin user...\n');

    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Check if admin already exists
    let admin = await User.findOne({
      where: { email: 'admin@hotel.com' },
    });

    if (admin) {
      console.log('✓ Admin user already exists\n');
      
      // Check if admin has a hotel
      const hotel = await Hotel.findOne({
        where: { admin_id: admin.id },
      });

      if (hotel) {
        console.log(`✓ Admin has hotel: ${hotel.name}\n`);
      } else {
        console.log('Creating hotel for admin...\n');
        
        const newHotel = await Hotel.create({
          admin_id: admin.id,
          name: 'Test Hotel',
          description: 'A test hotel for development and testing',
          location: {
            address: '123 Test Street',
            city: 'Phnom Penh',
            province: 'Phnom Penh',
            country: 'Cambodia',
            latitude: 11.5564,
            longitude: 104.9282,
            google_maps_url: 'https://maps.google.com/?q=11.5564,104.9282',
          },
          contact: {
            phone: '+855 12 345 678',
            email: 'test@hotel.com',
            website: 'https://testhotel.com',
          },
          amenities: ['wifi', 'parking', 'restaurant'],
          images: [],
          logo: null,
          star_rating: 3,
          average_rating: 0,
          total_reviews: 0,
          status: HotelStatus.ACTIVE,
          approval_date: new Date(),
        });

        console.log(`✓ Created hotel: ${newHotel.name}\n`);
      }
    } else {
      // Create new admin
      admin = await User.create({
        user_type: UserType.ADMIN,
        email: 'admin@hotel.com',
        password_hash: 'Admin123!', // Will be hashed by beforeCreate hook
        first_name: 'Test',
        last_name: 'Admin',
        phone: '+855987654321',
        language: Language.ENGLISH,
        currency: Currency.USD,
        is_student: false,
        email_verified: true,
        is_active: true,
      });

      console.log('✓ Created admin user\n');

      // Create hotel for admin
      const hotel = await Hotel.create({
        admin_id: admin.id,
        name: 'Test Hotel',
        description: 'A test hotel for development and testing',
        location: {
          address: '123 Test Street',
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          country: 'Cambodia',
          latitude: 11.5564,
          longitude: 104.9282,
          google_maps_url: 'https://maps.google.com/?q=11.5564,104.9282',
        },
        contact: {
          phone: '+855 12 345 678',
          email: 'test@hotel.com',
          website: 'https://testhotel.com',
        },
        amenities: ['wifi', 'parking', 'restaurant'],
        images: [],
        logo: null,
        star_rating: 3,
        average_rating: 0,
        total_reviews: 0,
        status: HotelStatus.ACTIVE,
        approval_date: new Date(),
      });

      console.log(`✓ Created hotel: ${hotel.name}\n`);
    }

    console.log('=== Test Admin Setup Complete ===\n');
    console.log('Email: admin@hotel.com');
    console.log('Password: Admin123!\n');

    process.exit(0);
  } catch (error: any) {
    console.error('Error creating test admin:', error);
    process.exit(1);
  }
}

createTestAdmin();
