'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Hotel, Room, Review } from '@/types';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ComparisonButton } from '@/components/ui/ComparisonButton';
import { ComparisonBar } from '@/components/ui/ComparisonBar';
import SocialShareButtons from '@/components/ui/SocialShareButtons';
import { useHotelOpenGraph } from '@/hooks/useOpenGraph';

interface HotelDetailData {
  hotel: Hotel & {
    starting_price: number;
    rooms: (Room & {
      pricing: {
        base_price: number;
        discount_amount: number;
        final_price: number;
      };
    })[];
    reviews: (Review & {
      user: {
        id: string;
        first_name: string;
        last_name: string;
        profile_image: string | null;
      };
    })[];
  };
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<HotelDetailData['hotel'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewSort, setReviewSort] = useState<'recent' | 'helpful'>('recent');

  // Get search params for booking
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<HotelDetailData>(`/api/hotels/${hotelId}`);

      if (response.success && response.data) {
        setHotel(response.data.hotel);
      } else {
        setError(response.error?.message || 'Failed to fetch hotel details');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (roomId: string) => {
    const params = new URLSearchParams();
    params.append('hotelId', hotelId);
    params.append('roomId', roomId);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);
    
    router.push(`/booking?${params.toString()}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const sortedReviews = hotel?.reviews ? [...hotel.reviews].sort((a, b) => {
    if (reviewSort === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return b.helpful_count - a.helpful_count;
  }) : [];

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  // Set Open Graph tags for social sharing
  useHotelOpenGraph(hotel || {
    id: hotelId,
    name: 'Hotel',
    description: '',
    images: [],
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-2xl font-bold mb-2">Hotel Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The hotel you are looking for does not exist'}</p>
          <Button onClick={() => router.push('/hotels')}>
            Back to Hotels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={hotel.images[selectedImageIndex] || '/placeholder-hotel.jpg'}
                alt={hotel.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 gap-4 h-96 lg:h-[500px]">
              {hotel.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImageIndex(index + 1)}
                >
                  <Image
                    src={image}
                    alt={`${hotel.name} - ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {hotel.images.length > 5 && (
                <div className="relative rounded-lg overflow-hidden bg-gray-900 bg-opacity-70 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition-all">
                  <span className="text-white text-xl font-semibold">
                    +{hotel.images.length - 5} more
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Image Thumbnails */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {hotel.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {renderStars(hotel.star_rating)}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">{hotel.average_rating.toFixed(1)}</span>
                      <span>({hotel.total_reviews} reviews)</span>
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    📍 {hotel.location.address}, {hotel.location.city}, {hotel.location.province}
                  </p>
                </div>
                <div className="ml-4">
                  <ComparisonButton hotelId={hotelId} variant="outline" size="md" />
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>

              {/* Social Sharing */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Share this hotel</h3>
                <SocialShareButtons
                  data={{
                    title: hotel.name,
                    description: hotel.description,
                    url: typeof window !== 'undefined' ? window.location.href : '',
                    imageUrl: hotel.images[0] || '/placeholder-hotel.jpg',
                    hotelId: hotel.id,
                  }}
                  variant="horizontal"
                  showLabel={true}
                />
              </div>
            </div>

            {/* Amenities */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span className="capitalize">{amenity.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Available Rooms */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {hotel.rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedRoom === room.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Room Image */}
                      {room.images[0] && (
                        <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={room.images[0]}
                            alt={room.room_type}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Room Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{room.room_type}</h3>
                        <p className="text-gray-600 text-sm mb-3">{room.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>👥 Up to {room.capacity} guests</div>
                          <div>🛏️ {room.bed_type} bed</div>
                          {room.size_sqm && <div>📐 {room.size_sqm} m²</div>}
                          <div>🏠 {room.total_rooms} rooms available</div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {room.amenities.slice(0, 4).map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{room.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex flex-col justify-between items-end">
                        <div className="text-right">
                          {room.discount_percentage > 0 && (
                            <div className="text-sm text-gray-500 line-through">
                              ${room.pricing.base_price.toFixed(2)}
                            </div>
                          )}
                          <div className="text-2xl font-bold text-blue-600">
                            ${room.pricing.final_price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">per night</div>
                          {room.discount_percentage > 0 && (
                            <div className="text-sm text-green-600 font-semibold mt-1">
                              Save {room.discount_percentage}%
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleBookRoom(room.id)}
                          className="mt-4"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Guest Reviews</h2>
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as 'recent' | 'helpful')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>

              {hotel.reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No reviews yet</p>
              ) : (
                <>
                  <div className="space-y-6">
                    {displayedReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          {/* User Avatar */}
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {review.user.profile_image ? (
                              <Image
                                src={review.user.profile_image}
                                alt={review.user.first_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                                {review.user.first_name[0]}{review.user.last_name[0]}
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold">
                                  {review.user.first_name} {review.user.last_name}
                                  {review.is_verified && (
                                    <span className="ml-2 text-xs text-green-600">✓ Verified Stay</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {new Date(review.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderStars(review.ratings.overall)}
                                <span className="font-semibold">{review.ratings.overall.toFixed(1)}</span>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">{review.comment}</p>

                            {/* Rating Breakdown */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">Cleanliness:</span>
                                <span className="ml-1 font-semibold">{review.ratings.cleanliness}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Service:</span>
                                <span className="ml-1 font-semibold">{review.ratings.service}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Location:</span>
                                <span className="ml-1 font-semibold">{review.ratings.location}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Value:</span>
                                <span className="ml-1 font-semibold">{review.ratings.value}</span>
                              </div>
                            </div>

                            {/* Review Images */}
                            {review.images.length > 0 && (
                              <div className="flex gap-2 mb-3">
                                {review.images.map((image, idx) => (
                                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                    <Image
                                      src={image}
                                      alt={`Review image ${idx + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Admin Response */}
                            {review.admin_response && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                <div className="text-sm font-semibold text-gray-700 mb-1">
                                  Response from {hotel.name}
                                </div>
                                <p className="text-sm text-gray-600">{review.admin_response}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                              <button className="hover:text-blue-600">
                                👍 Helpful ({review.helpful_count})
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hotel.reviews.length > 3 && !showAllReviews && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(true)}
                      className="w-full mt-4"
                    >
                      Show All {hotel.reviews.length} Reviews
                    </Button>
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Booking Card */}
              <Card>
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600">Starting from</div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${hotel.starting_price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
                <Button
                  onClick={() => {
                    const firstRoom = hotel.rooms[0];
                    if (firstRoom) handleBookRoom(firstRoom.id);
                  }}
                  className="w-full"
                  disabled={hotel.rooms.length === 0}
                >
                  Check Availability
                </Button>
              </Card>

              {/* Contact Card */}
              <Card>
                <h3 className="font-bold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <a href={`tel:${hotel.contact.phone}`} className="text-blue-600 hover:underline">
                      {hotel.contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✉️</span>
                    <a href={`mailto:${hotel.contact.email}`} className="text-blue-600 hover:underline">
                      {hotel.contact.email}
                    </a>
                  </div>
                  {hotel.contact.website && (
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <a
                        href={hotel.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Location Card */}
              <Card>
                <h3 className="font-bold mb-3">Location</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {hotel.location.address}<br />
                  {hotel.location.city}, {hotel.location.province}<br />
                  {hotel.location.country}
                </p>
                {hotel.location.google_maps_url && (
                  <a
                    href={hotel.location.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on Google Maps →
                  </a>
                )}
                {/* Google Maps Embed */}
                {hotel.location.latitude && hotel.location.longitude && (
                  <div className="mt-3 rounded-lg overflow-hidden h-48">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${hotel.location.latitude},${hotel.location.longitude}`}
                      allowFullScreen
                    />
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Bar */}
      <ComparisonBar />
    </div>
  );
}
