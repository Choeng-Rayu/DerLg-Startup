'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Hotel } from '@/types';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import {
  getComparisonState,
  removeFromComparison,
  clearComparison,
  calculateDistance,
  getUniqueAmenities,
  getAllAmenities,
  formatPrice,
} from '@/lib/comparison';

export default function CompareHotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      const state = getComparisonState();
      
      if (state.hotelIds.length === 0) {
        router.push('/hotels');
        return;
      }

      // Fetch all hotels
      const hotelPromises = state.hotelIds.map(id =>
        api.get<Hotel>(`/hotels/${id}`)
      );

      const responses = await Promise.all(hotelPromises);
      const fetchedHotels = responses
        .filter(response => response.success && response.data)
        .map(response => response.data!);

      setHotels(fetchedHotels);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load hotels for comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (hotelId: string) => {
    removeFromComparison(hotelId);
    setHotels(hotels.filter(h => h.id !== hotelId));
    
    if (hotels.length <= 1) {
      router.push('/hotels');
    }
  };

  const handleClearAll = () => {
    clearComparison();
    router.push('/hotels');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || hotels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'No hotels to compare'}
          </h2>
          <Button onClick={() => router.push('/hotels')}>
            Back to Hotels
          </Button>
        </div>
      </div>
    );
  }

  const uniqueAmenities = getUniqueAmenities(hotels);
  const allAmenities = getAllAmenities(hotels);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Compare Hotels
              </h1>
              <p className="text-gray-600">
                Comparing {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClearAll}>
                Clear All
              </Button>
              <Button variant="outline" onClick={() => router.push('/hotels')}>
                Back to Search
              </Button>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-10 min-w-[200px]">
                    Feature
                  </th>
                  {hotels.map(hotel => (
                    <th key={hotel.id} className="p-4 bg-gray-50 min-w-[280px]">
                      <div className="text-center">
                        {/* Hotel Image */}
                        <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
                          <Image
                            src={hotel.images?.[0] || '/placeholder-hotel.jpg'}
                            alt={hotel.name}
                            fill
                            className="object-cover"
                            sizes="280px"
                          />
                        </div>
                        
                        {/* Hotel Name */}
                        <Link
                          href={`/hotels/${hotel.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 block mb-2"
                        >
                          {hotel.name}
                        </Link>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(hotel.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Location */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Location
                  </td>
                  {hotels.map(hotel => (
                    <td key={hotel.id} className="p-4 text-center">
                      <div className="text-sm text-gray-900">
                        {hotel.location.city}, {hotel.location.province}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {hotel.location.address}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Distance from City Center */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Distance from City Center
                  </td>
                  {hotels.map(hotel => (
                    <td key={hotel.id} className="p-4 text-center text-sm text-gray-900">
                      {calculateDistance(hotel)}
                    </td>
                  ))}
                </tr>

                {/* Star Rating */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Star Rating
                  </td>
                  {hotels.map(hotel => (
                    <td key={hotel.id} className="p-4 text-center">
                      <div className="text-2xl">
                        {'⭐'.repeat(hotel.star_rating || 0)}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Guest Rating */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Guest Rating
                  </td>
                  {hotels.map(hotel => (
                    <td key={hotel.id} className="p-4 text-center">
                      {hotel.average_rating > 0 ? (
                        <div>
                          <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded font-semibold">
                            {hotel.average_rating.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {hotel.total_reviews} reviews
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No reviews</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr className="border-b hover:bg-gray-50 bg-blue-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-blue-50">
                    Starting Price
                  </td>
                  {hotels.map((hotel, index) => {
                    const prices = [50, 75, 60, 85];
                    const price = prices[index % prices.length];
                    const isLowest = price === Math.min(...hotels.map((_, i) => prices[i % prices.length]));
                    
                    return (
                      <td key={hotel.id} className="p-4 text-center">
                        <div className={`text-2xl font-bold ${isLowest ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatPrice(price)}
                        </div>
                        <div className="text-sm text-gray-600">/night</div>
                        {isLowest && (
                          <div className="text-xs text-green-600 font-semibold mt-1">
                            Lowest Price
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Amenities Section Header */}
                <tr className="bg-gray-100">
                  <td colSpan={hotels.length + 1} className="p-4 font-semibold text-gray-900">
                    Amenities
                  </td>
                </tr>

                {/* Individual Amenities */}
                {allAmenities.map(amenity => (
                  <tr key={amenity} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-700 sticky left-0 bg-white">
                      {amenity}
                    </td>
                    {hotels.map(hotel => {
                      const hasAmenity = hotel.amenities.includes(amenity);
                      const isUnique = uniqueAmenities.get(hotel.id)?.has(amenity);
                      
                      return (
                        <td key={hotel.id} className="p-4 text-center">
                          {hasAmenity ? (
                            <div className="flex items-center justify-center">
                              <svg
                                className={`w-6 h-6 ${isUnique ? 'text-green-600' : 'text-gray-400'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <svg
                              className="w-6 h-6 text-gray-300 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Contact Information */}
                <tr className="bg-gray-100">
                  <td colSpan={hotels.length + 1} className="p-4 font-semibold text-gray-900">
                    Contact Information
                  </td>
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Phone
                  </td>
                  {hotels.map(hotel => (
                    <td key={hotel.id} className="p-4 text-center text-sm text-gray-900">
                      {hotel.contact.phone}
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Email
                  </td>
                  {hotels.map(hotel => (
                    <td key={hotel.id} className="p-4 text-center text-sm text-gray-900">
                      {hotel.contact.email}
                    </td>
                  ))}
                </tr>

                {/* Book Now Buttons */}
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-gray-50">
                    
                  </td>
                  {hotels.map(hotel => (
                    <td key={hotel.id} className="p-4 text-center">
                      <Link href={`/hotels/${hotel.id}`}>
                        <Button className="w-full">
                          Book Now
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">How to read this comparison:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="text-green-600 font-semibold">Green checkmarks</span> indicate unique amenities
                </li>
                <li>
                  <span className="text-green-600 font-semibold">Lowest Price</span> is highlighted in green
                </li>
                <li>Gray checkmarks indicate amenities available at multiple hotels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
