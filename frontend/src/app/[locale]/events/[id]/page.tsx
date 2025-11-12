'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Event, Tour } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

interface RelatedTour {
  id: string;
  name: string;
  description: string;
  destination: string;
  duration: { days: number; nights: number };
  difficulty: string;
  price_per_person: number;
  average_rating: number;
  images: string[];
}

interface EventWithTours extends Omit<Event, 'related_tours'> {
  related_tours?: RelatedTour[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventWithTours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/events/${eventId}`);

      if (response.success && response.data) {
        const data = response.data as { event: EventWithTours };
        if (data.event) {
          setEvent(data.event);
        } else {
          setError('Failed to load event details');
        }
      } else {
        setError('Failed to load event details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/events/${eventId}/book`);
      return;
    }

    // Navigate to booking page
    router.push(`/booking?type=event&id=${eventId}`);
  };

  const handleTourClick = (tourId: string) => {
    router.push(`/tours/${tourId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isEventActive = () => {
    if (!event) return false;
    const now = new Date();
    const endDate = new Date(event.end_date);
    return endDate >= now;
  };

  const isSoldOut = () => {
    if (!event) return false;
    return event.bookings_count >= event.capacity;
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <Button onClick={() => router.push('/events')}>Back to Events</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/events')}
          className="mb-6"
        >
          ← Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="overflow-hidden mb-6">
              {event.images && event.images.length > 0 ? (
                <>
                  <div className="relative h-96 bg-gray-200">
                    <img
                      src={event.images[selectedImage]}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Event Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold capitalize">
                        {event.event_type}
                      </span>
                    </div>
                  </div>
                  {event.images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {event.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            selectedImage === index
                              ? 'border-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${event.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center text-gray-400">
                  No Images Available
                </div>
              )}
            </Card>

            {/* Event Details */}
            <Card className="p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location.city}, {event.location.province}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{event.location.venue}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h2>
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
              </div>

              {/* Cultural Significance */}
              {event.cultural_significance && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cultural Significance</h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-gray-700">{event.cultural_significance}</p>
                  </div>
                </div>
              )}

              {/* What to Expect */}
              {event.what_to_expect && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What to Expect</h3>
                  <p className="text-gray-700 whitespace-pre-line">{event.what_to_expect}</p>
                </div>
              )}

              {/* Event Duration */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Duration</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Starts</p>
                      <p className="text-gray-900 font-medium">{formatDate(event.start_date)}</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Ends</p>
                      <p className="text-gray-900 font-medium">{formatDate(event.end_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 font-medium mb-1">{event.location.venue}</p>
                  <p className="text-gray-700 mb-2">
                    {event.location.city}, {event.location.province}
                  </p>
                  {event.location.latitude && event.location.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${event.location.latitude},${event.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-block"
                    >
                      View on Google Maps →
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {/* Related Tours */}
            {event.related_tours && event.related_tours.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Tours</h3>
                <p className="text-gray-600 mb-4">
                  Enhance your experience with these curated tours
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.related_tours.map((tour) => (
                    <Card
                      key={tour.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleTourClick(tour.id)}
                    >
                      <div className="relative h-32 bg-gray-200">
                        {tour.images && tour.images.length > 0 ? (
                          <img
                            src={tour.images[0]}
                            alt={tour.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {tour.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {tour.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {tour.duration.days}D/{tour.duration.nights}N
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            ${tour.price_per_person}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Ticket Price</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">General Admission</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${event.pricing.base_price}
                    </span>
                  </div>
                  {event.pricing.vip_price > event.pricing.base_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">VIP Access</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ${event.pricing.vip_price}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Availability</span>
                  <span className={`font-semibold ${
                    isSoldOut() ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {isSoldOut() 
                      ? 'Sold Out' 
                      : `${event.capacity - event.bookings_count} spots left`
                    }
                  </span>
                </div>
              </div>

              {/* Book Button */}
              {isEventActive() && !isSoldOut() ? (
                <Button onClick={handleBookNow} className="w-full mb-4">
                  Book Tickets
                </Button>
              ) : (
                <Button disabled className="w-full mb-4">
                  {isSoldOut() ? 'Sold Out' : 'Event Ended'}
                </Button>
              )}

              {/* Quick Facts */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mobile ticket accepted</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Free cancellation up to 7 days</span>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
