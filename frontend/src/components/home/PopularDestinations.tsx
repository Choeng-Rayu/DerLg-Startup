'use client';

import Link from 'next/link';

interface Destination {
  name: string;
  image: string;
  description: string;
  hotelCount: number;
}

const destinations: Destination[] = [
  {
    name: 'Siem Reap',
    image: 'https://images.unsplash.com/photo-1563492065213-f0e8b6a096e0?w=800&q=80',
    description: 'Home to the magnificent Angkor Wat',
    hotelCount: 150,
  },
  {
    name: 'Phnom Penh',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    description: 'Cambodia\'s vibrant capital city',
    hotelCount: 200,
  },
  {
    name: 'Sihanoukville',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    description: 'Beautiful beaches and island getaways',
    hotelCount: 80,
  },
  {
    name: 'Battambang',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
    description: 'Charming colonial architecture',
    hotelCount: 45,
  },
  {
    name: 'Kampot',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Riverside town with pepper plantations',
    hotelCount: 35,
  },
  {
    name: 'Koh Rong',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    description: 'Pristine island paradise',
    hotelCount: 25,
  },
];

export default function PopularDestinations() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Popular Destinations
          </h2>
          <p className="text-gray-600">
            Explore Cambodia's most beloved travel destinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Link
              key={destination.name}
              href={`/hotels?destination=${encodeURIComponent(destination.name)}`}
              className="group relative h-72 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {destination.name}
                </h3>
                <p className="text-white/90 mb-2">
                  {destination.description}
                </p>
                <div className="flex items-center text-white/80 text-sm">
                  <span className="mr-1">🏨</span>
                  <span>{destination.hotelCount}+ hotels</span>
                </div>
                
                {/* Hover Arrow */}
                <div className="mt-4 flex items-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
