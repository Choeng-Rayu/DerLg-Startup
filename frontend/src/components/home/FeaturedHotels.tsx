'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hotel } from '@/types';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function FeaturedHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      try {
        const response = await api.get<{ hotels: Hotel[] }>('/api/hotels?limit=6');
        
        if (response.success && response.data) {
          setHotels(response.data.hotels);
        }
      } catch (error) {
        console.error('Error fetching featured hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedHotels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (hotels.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Featured Hotels
          </h2>
          <p className="text-gray-600">
            Handpicked accommodations for your perfect stay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel) => (
            <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
              <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                {/* Hotel Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {hotel.images && hotel.images[0] ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-6xl">🏨</span>
                    </div>
                  )}
                  
                  {/* Star Rating Badge */}
                  {hotel.star_rating > 0 && (
                    <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full shadow-md">
                      <span className="text-sm font-semibold text-gray-900">
                        {'⭐'.repeat(hotel.star_rating)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hotel Info */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {hotel.name}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="mr-1">📍</span>
                    <span className="line-clamp-1">
                      {hotel.location.city}, {hotel.location.province}
                    </span>
                  </div>

                  {/* Rating */}
                  {hotel.average_rating > 0 && (
                    <div className="flex items-center mb-3">
                      <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded">
                        <span className="font-semibold">{hotel.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({hotel.total_reviews} {hotel.total_reviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-blue-600 font-semibold hover:text-blue-700">
                      View Details →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/hotels"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View All Hotels
          </Link>
        </div>
      </div>
    </section>
  );
}
