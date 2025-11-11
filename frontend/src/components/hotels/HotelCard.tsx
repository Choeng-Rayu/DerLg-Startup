'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Hotel } from '@/types';
import Button from '@/components/ui/Button';
import WishlistButton from '@/components/ui/WishlistButton';
import { ComparisonButton } from '@/components/ui/ComparisonButton';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {

  // Get the main image or use placeholder
  const mainImage = hotel.images?.[0] || '/placeholder-hotel.jpg';
  
  // Calculate starting price (would come from rooms in real implementation)
  const startingPrice = 50; // Placeholder

  // Format rating
  const rating = hotel.average_rating || 0;
  const ratingText = rating > 0 ? rating.toFixed(1) : 'New';

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <Link href={`/hotels/${hotel.id}`} className="block cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={mainImage}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Wishlist Button */}
          <div className="absolute top-3 right-3">
            <WishlistButton itemType="hotel" itemId={hotel.id} />
          </div>

          {/* Star Rating Badge */}
          {hotel.star_rating > 0 && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
              {'⭐'.repeat(hotel.star_rating)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Hotel Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {hotel.name}
          </h3>

          {/* Location */}
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hotel.location.city}, {hotel.location.province}
          </p>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {hotel.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {rating > 0 ? (
                <>
                  <div className="bg-blue-600 text-white px-2 py-1 rounded font-semibold text-sm">
                    {ratingText}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    ({hotel.total_reviews} {hotel.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No reviews yet</span>
              )}
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-end justify-between pt-3 border-t">
            <div>
              <p className="text-sm text-gray-600">Starting from</p>
              <p className="text-2xl font-bold text-gray-900">
                ${startingPrice}
                <span className="text-sm font-normal text-gray-600">/night</span>
              </p>
            </div>
            <Button size="sm" className="whitespace-nowrap">
              View Details
            </Button>
          </div>
        </div>
      </Link>

      {/* Comparison Button - Outside Link */}
      <div className="px-4 pb-4">
        <ComparisonButton hotelId={hotel.id} variant="outline" size="sm" className="w-full" />
      </div>
    </div>
  );
}
