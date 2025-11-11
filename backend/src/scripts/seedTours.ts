import dotenv from 'dotenv';
import { TourDifficulty } from '../models/Tour';
import sequelize from '../config/database';

// Load environment variables
dotenv.config({ path: './src/.env' });

const tours = [
  {
    name: 'Angkor Wat Sunrise Tour',
    description: 'Experience the breathtaking sunrise at Angkor Wat, one of the most iconic temples in Cambodia. This tour includes visits to Angkor Thom, Bayon Temple, and Ta Prohm.',
    destination: 'Siem Reap',
    duration: {
      days: 1,
      nights: 0,
    },
    difficulty: TourDifficulty.EASY,
    category: ['cultural', 'historical', 'photography'],
    price_per_person: 75.00,
    group_size: {
      min: 2,
      max: 15,
    },
    inclusions: [
      'Professional English-speaking guide',
      'Air-conditioned transportation',
      'Bottled water',
      'Temple entrance fees',
      'Hotel pickup and drop-off',
    ],
    exclusions: [
      'Meals',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Angkor Wat Sunrise and Temple Tour',
        description: 'Early morning pickup to witness the stunning sunrise at Angkor Wat, followed by temple exploration.',
        activities: [
          'Sunrise viewing at Angkor Wat (5:00 AM)',
          'Explore Angkor Wat temple complex',
          'Visit Angkor Thom and Bayon Temple',
          'Discover Ta Prohm (Tomb Raider temple)',
        ],
        meals: ['Breakfast (own expense)'],
        accommodation: null,
      },
    ],
    images: [
      'https://res.cloudinary.com/demo/image/upload/angkor-wat-sunrise.jpg',
      'https://res.cloudinary.com/demo/image/upload/bayon-temple.jpg',
      'https://res.cloudinary.com/demo/image/upload/ta-prohm.jpg',
    ],
    meeting_point: {
      address: 'Hotel lobby in Siem Reap city center',
      latitude: 13.3671,
      longitude: 103.8448,
    },
    guide_required: true,
    transportation_required: true,
    is_active: true,
  },
  {
    name: 'Phnom Penh City and Culture Tour',
    description: 'Discover the rich history and vibrant culture of Cambodia\'s capital city. Visit the Royal Palace, Silver Pagoda, and learn about the country\'s tragic past at the Genocide Museum.',
    destination: 'Phnom Penh',
    duration: {
      days: 1,
      nights: 0,
    },
    difficulty: TourDifficulty.EASY,
    category: ['cultural', 'historical', 'educational'],
    price_per_person: 65.00,
    group_size: {
      min: 2,
      max: 20,
    },
    inclusions: [
      'Professional guide',
      'Transportation',
      'Entrance fees',
      'Bottled water',
    ],
    exclusions: [
      'Lunch',
      'Personal expenses',
      'Tips',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Phnom Penh Historical Tour',
        description: 'Full day exploration of Phnom Penh\'s most significant historical and cultural sites.',
        activities: [
          'Royal Palace and Silver Pagoda visit',
          'National Museum tour',
          'Tuol Sleng Genocide Museum',
          'Central Market shopping',
        ],
        meals: ['Lunch (own expense)'],
        accommodation: null,
      },
    ],
    images: [
      'https://res.cloudinary.com/demo/image/upload/royal-palace.jpg',
      'https://res.cloudinary.com/demo/image/upload/silver-pagoda.jpg',
    ],
    meeting_point: {
      address: 'Independence Monument, Phnom Penh',
      latitude: 11.5564,
      longitude: 104.9282,
    },
    guide_required: true,
    transportation_required: true,
    is_active: true,
  },
  {
    name: 'Tonle Sap Lake Floating Village',
    description: 'Experience life on Southeast Asia\'s largest freshwater lake. Visit floating villages, see traditional fishing methods, and learn about the unique lifestyle of the lake communities.',
    destination: 'Siem Reap',
    duration: {
      days: 1,
      nights: 0,
    },
    difficulty: TourDifficulty.EASY,
    category: ['cultural', 'nature', 'adventure'],
    price_per_person: 55.00,
    group_size: {
      min: 2,
      max: 12,
    },
    inclusions: [
      'Boat ride on Tonle Sap Lake',
      'English-speaking guide',
      'Transportation',
      'Bottled water',
      'Life jackets',
    ],
    exclusions: [
      'Meals',
      'Donations to local schools (optional)',
      'Personal expenses',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Tonle Sap Floating Village Experience',
        description: 'Half-day tour exploring the floating villages and learning about lake life.',
        activities: [
          'Drive to Tonle Sap Lake',
          'Boat tour of floating village',
          'Visit floating school and church',
          'Observe traditional fishing methods',
          'Sunset viewing on the lake',
        ],
        meals: [],
        accommodation: null,
      },
    ],
    images: [
      'https://res.cloudinary.com/demo/image/upload/tonle-sap-village.jpg',
      'https://res.cloudinary.com/demo/image/upload/floating-houses.jpg',
    ],
    meeting_point: {
      address: 'Siem Reap Old Market area',
      latitude: 13.3622,
      longitude: 103.8597,
    },
    guide_required: true,
    transportation_required: true,
    is_active: true,
  },
  {
    name: 'Cardamom Mountains Trekking Adventure',
    description: 'Embark on a challenging multi-day trek through the pristine Cardamom Mountains. Experience Cambodia\'s wilderness, spot rare wildlife, and camp under the stars.',
    destination: 'Cardamom Mountains',
    duration: {
      days: 3,
      nights: 2,
    },
    difficulty: TourDifficulty.CHALLENGING,
    category: ['adventure', 'nature', 'trekking'],
    price_per_person: 350.00,
    group_size: {
      min: 4,
      max: 10,
    },
    inclusions: [
      'Experienced trekking guide',
      'All meals during trek',
      'Camping equipment',
      'Transportation to/from trailhead',
      'Park entrance fees',
      'First aid kit',
    ],
    exclusions: [
      'Personal trekking gear',
      'Travel insurance',
      'Tips for guides',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Journey to the Mountains',
        description: 'Travel to the Cardamom Mountains and begin the trek.',
        activities: [
          'Early morning departure from Phnom Penh',
          'Drive to trailhead (4 hours)',
          'Begin trekking through jungle',
          'Set up camp by river',
        ],
        meals: ['Lunch', 'Dinner'],
        accommodation: 'Camping',
      },
      {
        day: 2,
        title: 'Deep Jungle Exploration',
        description: 'Full day trekking through pristine rainforest.',
        activities: [
          'Morning wildlife spotting',
          'Trek to waterfall',
          'Swimming and relaxation',
          'Continue to second campsite',
        ],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Camping',
      },
      {
        day: 3,
        title: 'Return Journey',
        description: 'Final trek and return to civilization.',
        activities: [
          'Morning bird watching',
          'Trek back to trailhead',
          'Drive back to Phnom Penh',
        ],
        meals: ['Breakfast', 'Lunch'],
        accommodation: null,
      },
    ],
    images: [
      'https://res.cloudinary.com/demo/image/upload/cardamom-mountains.jpg',
      'https://res.cloudinary.com/demo/image/upload/jungle-trek.jpg',
      'https://res.cloudinary.com/demo/image/upload/waterfall.jpg',
    ],
    meeting_point: {
      address: 'Central Phnom Penh (specific location provided upon booking)',
      latitude: 11.5564,
      longitude: 104.9282,
    },
    guide_required: true,
    transportation_required: true,
    is_active: true,
  },
  {
    name: 'Battambang Countryside Cycling Tour',
    description: 'Cycle through the scenic Cambodian countryside, visit local villages, see the famous bamboo train, and explore ancient temples around Battambang.',
    destination: 'Battambang',
    duration: {
      days: 1,
      nights: 0,
    },
    difficulty: TourDifficulty.MODERATE,
    category: ['adventure', 'cultural', 'cycling'],
    price_per_person: 45.00,
    group_size: {
      min: 2,
      max: 8,
    },
    inclusions: [
      'Bicycle and helmet',
      'English-speaking guide',
      'Bamboo train ride',
      'Temple entrance fees',
      'Lunch at local restaurant',
      'Bottled water and snacks',
    ],
    exclusions: [
      'Personal expenses',
      'Tips',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Battambang Cycling Adventure',
        description: 'Full day cycling tour through countryside and cultural sites.',
        activities: [
          'Bike fitting and safety briefing',
          'Cycle through rice paddies and villages',
          'Visit local workshops (rice paper, fish paste)',
          'Ride the famous bamboo train',
          'Explore Phnom Sampeau temple',
          'Watch bat cave exodus at sunset',
        ],
        meals: ['Lunch'],
        accommodation: null,
      },
    ],
    images: [
      'https://res.cloudinary.com/demo/image/upload/battambang-cycling.jpg',
      'https://res.cloudinary.com/demo/image/upload/bamboo-train.jpg',
    ],
    meeting_point: {
      address: 'Battambang city center, near Psar Nat market',
      latitude: 13.0957,
      longitude: 103.2022,
    },
    guide_required: true,
    transportation_required: false,
    is_active: true,
  },
];

async function seedTours() {
  try {
    console.log('🌱 Starting tour seeding...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');

    // Sync Tour model
    await sequelize.sync({ alter: true });
    console.log('✓ Tour model synced\n');

    // Clear existing tours (optional - comment out if you want to keep existing data)
    // await sequelize.query('DELETE FROM tours');
    // console.log('✓ Existing tours cleared\n');

    // Create tours
    console.log('Creating tours...\n');
    for (const tourData of tours) {
      const tour = await sequelize.models.Tour.create(tourData as any);
      const tourInstance = tour as any;
      console.log(`✓ Created: ${tourInstance.name}`);
      console.log(`  - Destination: ${tourInstance.destination}`);
      console.log(`  - Price: $${tourInstance.price_per_person}/person`);
      console.log(`  - Duration: ${tourInstance.duration.days} days`);
      console.log(`  - Difficulty: ${tourInstance.difficulty}`);
      console.log(`  - ID: ${tourInstance.id}\n`);
    }

    console.log(`\n✅ Successfully seeded ${tours.length} tours!\n`);

    // Display summary
    const allTours = await sequelize.models.Tour.findAll();
    console.log('📊 Tour Summary:');
    console.log(`Total tours in database: ${allTours.length}`);
    console.log(`Active tours: ${allTours.filter((t: any) => t.is_active).length}`);
    console.log(`\nTours by destination:`);
    const byDestination = allTours.reduce((acc: any, tour: any) => {
      acc[tour.destination] = (acc[tour.destination] || 0) + 1;
      return acc;
    }, {});
    Object.entries(byDestination).forEach(([dest, count]) => {
      console.log(`  - ${dest}: ${count}`);
    });

    console.log(`\nTours by difficulty:`);
    const byDifficulty = allTours.reduce((acc: any, tour: any) => {
      acc[tour.difficulty] = (acc[tour.difficulty] || 0) + 1;
      return acc;
    }, {});
    Object.entries(byDifficulty).forEach(([diff, count]) => {
      console.log(`  - ${diff}: ${count}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding tours:', error.message);
    if (error.errors) {
      error.errors.forEach((err: any) => {
        console.error(`  - ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Run seeding
seedTours();
