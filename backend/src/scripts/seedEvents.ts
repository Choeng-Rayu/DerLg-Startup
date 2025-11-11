import { User, Event } from '../models';
import { UserType, Language, Currency } from '../models/User';
import { EventType } from '../models/Event';
import sequelize from '../config/database';

async function seedEvents() {
  try {
    console.log('Starting event seeding...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Find or create a super admin user for created_by field
    let superAdmin = await User.findOne({
      where: { user_type: UserType.SUPER_ADMIN },
    });

    if (!superAdmin) {
      console.log('Creating super admin user for event seeding...');
      superAdmin = await User.create({
        user_type: UserType.SUPER_ADMIN,
        email: 'superadmin@derlg.com',
        password_hash: 'SuperAdmin123!', // Will be hashed by beforeCreate hook
        first_name: 'Super',
        last_name: 'Admin',
        language: Language.ENGLISH,
        currency: Currency.USD,
        is_student: false,
        email_verified: true,
        is_active: true,
      });
      console.log('✓ Super admin created\n');
    } else {
      console.log('✓ Using existing super admin\n');
    }

    // Clear existing events
    await Event.destroy({ where: {} });
    console.log('✓ Cleared existing events\n');

    // Sample events data
    const eventsData = [
      {
        name: 'Khmer New Year Festival',
        description: 'Experience the most important traditional festival in Cambodia, celebrating the Khmer New Year with traditional games, ceremonies, and cultural performances. Join locals in water blessings, traditional dances, and festive celebrations across the country.',
        event_type: EventType.FESTIVAL,
        start_date: new Date('2025-04-14'),
        end_date: new Date('2025-04-16'),
        location: {
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          venue: 'Various locations across the city',
          latitude: 11.5564,
          longitude: 104.9282,
        },
        pricing: {
          base_price: 50,
          vip_price: 150,
        },
        capacity: 500,
        bookings_count: 0,
        images: [
          'https://res.cloudinary.com/demo/image/upload/khmer-new-year-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/khmer-new-year-2.jpg',
        ],
        cultural_significance: 'Khmer New Year, also known as Choul Chnam Thmey, marks the end of the harvest season and is the most important holiday in Cambodia. It is a time for family reunions, religious ceremonies, and traditional games that have been passed down through generations.',
        what_to_expect: 'Participate in traditional water blessings, watch cultural performances, enjoy traditional Khmer games like Chaol Chhoung (throwing a ball), and experience the vibrant atmosphere of street celebrations. Witness monks receiving offerings and join in the festive spirit with locals.',
        related_tours: [],
        is_active: true,
        created_by: superAdmin.id,
      },
      {
        name: 'Water Festival (Bon Om Touk)',
        description: 'Celebrate Cambodia\'s most spectacular festival with boat races on the Tonle Sap River, fireworks, and illuminated floats. This three-day festival marks the reversal of the Tonle Sap River\'s flow and the end of the rainy season.',
        event_type: EventType.FESTIVAL,
        start_date: new Date('2025-11-05'),
        end_date: new Date('2025-11-07'),
        location: {
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          venue: 'Sisowath Quay and Tonle Sap Riverfront',
          latitude: 11.5625,
          longitude: 104.9280,
        },
        pricing: {
          base_price: 75,
          vip_price: 200,
        },
        capacity: 1000,
        bookings_count: 0,
        images: [
          'https://res.cloudinary.com/demo/image/upload/water-festival-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/water-festival-2.jpg',
        ],
        cultural_significance: 'Bon Om Touk celebrates the unique natural phenomenon of the Tonle Sap River reversing its flow. It is also a time to thank the river for providing fish and fertile land. The festival dates back to the Angkorian era and showcases Cambodia\'s deep connection with water.',
        what_to_expect: 'Watch thrilling boat races with teams from across Cambodia, enjoy spectacular fireworks displays, see beautifully illuminated boats parade along the river, and experience the festive atmosphere with food stalls, concerts, and cultural performances along the riverfront.',
        related_tours: [],
        is_active: true,
        created_by: superAdmin.id,
      },
      {
        name: 'Angkor Wat Sunrise Experience',
        description: 'Witness the breathtaking sunrise over the iconic Angkor Wat temple, a UNESCO World Heritage site. This daily cultural experience offers the perfect opportunity to see one of the world\'s most magnificent temples in the golden morning light.',
        event_type: EventType.CULTURAL,
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        location: {
          city: 'Siem Reap',
          province: 'Siem Reap',
          venue: 'Angkor Wat Temple Complex',
          latitude: 13.4125,
          longitude: 103.8670,
        },
        pricing: {
          base_price: 40,
          vip_price: 100,
        },
        capacity: 200,
        bookings_count: 0,
        images: [
          'https://res.cloudinary.com/demo/image/upload/angkor-sunrise-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/angkor-sunrise-2.jpg',
        ],
        cultural_significance: 'Angkor Wat is the largest religious monument in the world and represents the pinnacle of Khmer architecture. Built in the 12th century, it was originally a Hindu temple dedicated to Vishnu before becoming a Buddhist temple. The sunrise view is considered one of the most spiritual and photogenic moments at the site.',
        what_to_expect: 'Early morning pickup (4:30 AM), prime viewing spot for sunrise, professional photography guidance, temple exploration after sunrise, breakfast included, and insights into the temple\'s history and architecture from expert guides.',
        related_tours: [],
        is_active: true,
        created_by: superAdmin.id,
      },
      {
        name: 'Pchum Ben Festival (Ancestors\' Day)',
        description: 'Experience one of Cambodia\'s most important religious festivals, where families honor their ancestors through offerings and prayers at pagodas. This 15-day festival culminates in a three-day public holiday with special ceremonies.',
        event_type: EventType.FESTIVAL,
        start_date: new Date('2025-09-24'),
        end_date: new Date('2025-10-08'),
        location: {
          city: 'Nationwide',
          province: 'All Provinces',
          venue: 'Buddhist Pagodas across Cambodia',
          latitude: 12.5657,
          longitude: 104.9910,
        },
        pricing: {
          base_price: 35,
          vip_price: 90,
        },
        capacity: 300,
        bookings_count: 0,
        images: [
          'https://res.cloudinary.com/demo/image/upload/pchum-ben-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/pchum-ben-2.jpg',
        ],
        cultural_significance: 'Pchum Ben is a time when Cambodians believe the gates of hell open and spirits of deceased relatives roam the earth seeking food. Families visit pagodas to make offerings of food to monks, who then transfer merit to the deceased. It is a deeply spiritual time that reflects Cambodia\'s Buddhist traditions.',
        what_to_expect: 'Visit multiple pagodas to observe traditional ceremonies, participate in offering food to monks, learn about Buddhist beliefs regarding ancestors and the afterlife, witness traditional prayers and chanting, and experience the solemn yet communal atmosphere of this important festival.',
        related_tours: [],
        is_active: true,
        created_by: superAdmin.id,
      },
      {
        name: 'Royal Ploughing Ceremony',
        description: 'Witness the ancient royal ceremony that marks the beginning of the rice-growing season. This elaborate ritual, presided over by the King or his representative, predicts the coming year\'s harvest and includes sacred oxen choosing food that foretells the future.',
        event_type: EventType.CULTURAL,
        start_date: new Date('2025-05-10'),
        end_date: new Date('2025-05-10'),
        location: {
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          venue: 'Veal Preah Meru (Royal Palace grounds)',
          latitude: 11.5636,
          longitude: 104.9282,
        },
        pricing: {
          base_price: 60,
          vip_price: 180,
        },
        capacity: 400,
        bookings_count: 0,
        images: [
          'https://res.cloudinary.com/demo/image/upload/royal-ploughing-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/royal-ploughing-2.jpg',
        ],
        cultural_significance: 'The Royal Ploughing Ceremony, or Preah Reach Pithi Chrot Preah Nongkoal, dates back to ancient times and symbolizes the importance of agriculture in Cambodian society. The ceremony is believed to bring good fortune and abundant harvests. It showcases the deep connection between the monarchy, Buddhism, and agriculture.',
        what_to_expect: 'Observe the elaborate royal ceremony with traditional costumes and rituals, watch sacred oxen plough the ceremonial ground, witness the prediction ritual where oxen choose from seven types of food and drink, experience traditional music and dance performances, and learn about Cambodia\'s agricultural heritage.',
        related_tours: [],
        is_active: true,
        created_by: superAdmin.id,
      },
      {
        name: 'Mekong River Sunset Cruise',
        description: 'Experience the beauty of the Mekong River at sunset with a relaxing cruise featuring traditional Khmer music, local cuisine, and stunning views of riverside life. This seasonal experience is available during the dry season when river conditions are optimal.',
        event_type: EventType.SEASONAL,
        start_date: new Date('2025-11-01'),
        end_date: new Date('2026-04-30'),
        location: {
          city: 'Phnom Penh',
          province: 'Phnom Penh',
          venue: 'Sisowath Quay Pier',
          latitude: 11.5625,
          longitude: 104.9280,
        },
        pricing: {
          base_price: 45,
          vip_price: 120,
        },
        capacity: 150,
        bookings_count: 0,
        images: [
          'https://res.cloudinary.com/demo/image/upload/mekong-cruise-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/mekong-cruise-2.jpg',
        ],
        cultural_significance: 'The Mekong River is the lifeblood of Cambodia, providing food, transportation, and livelihood to millions. A sunset cruise offers insight into riverside communities and the importance of the river in Cambodian daily life and culture.',
        what_to_expect: 'Two-hour sunset cruise on a traditional boat, welcome drinks and canapés, live traditional Khmer music performance, buffet dinner featuring local cuisine, panoramic views of Phnom Penh\'s skyline and riverside communities, and opportunities for photography.',
        related_tours: [],
        is_active: true,
        created_by: superAdmin.id,
      },
    ];

    // Create events
    const createdEvents = await Event.bulkCreate(eventsData);
    console.log(`✓ Successfully created ${createdEvents.length} events`);

    // Display created events
    console.log('\n=== Created Events ===\n');
    createdEvents.forEach((event: any, index: number) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   Type: ${event.event_type}`);
      console.log(`   Dates: ${event.start_date} to ${event.end_date}`);
      console.log(`   Location: ${event.location.city}, ${event.location.province}`);
      console.log(`   Price: $${event.pricing.base_price} (Base) / $${event.pricing.vip_price} (VIP)`);
      console.log(`   Capacity: ${event.capacity}`);
      console.log(`   ID: ${event.id}`);
      console.log('');
    });

    console.log('✓ Event seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding events:', error);
    process.exit(1);
  }
}

// Run the seed function
seedEvents();
