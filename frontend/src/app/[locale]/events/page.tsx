'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Event } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import WishlistButton from '@/components/ui/WishlistButton';

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [eventType, setEventType] = useState(searchParams.get('event_type') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [province, setProvince] = useState(searchParams.get('province') || '');
  const [startDate, setStartDate] = useState(searchParams.get('start_date') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end_date') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available_only') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'start_date');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, sortBy]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (eventType) params.append('event_type', eventType);
      if (city) params.append('city', city);
      if (province) params.append('province', province);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (availableOnly) params.append('available_only', 'true');
      params.append('sort_by', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await api.get(`/events?${params.toString()}`);

      if (response.success && response.data) {
        const data = response.data as { events: Event[]; pagination: { totalPages: number } };
        if (data.events) {
          setEvents(data.events);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setError('Failed to load events');
        }
      } else {
        setError('Failed to load events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEvents();
  };

  const handleReset = () => {
    setEventType('');
    setCity('');
    setProvince('');
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
    setAvailableOnly(false);
    setSortBy('start_date');
    setCurrentPage(1);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && events.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cultural Events & Festivals</h1>
          <p className="text-gray-600">Experience authentic Cambodian culture and traditions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              {/* Event Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="festival">Festival</option>
                  <option value="cultural">Cultural</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>

              {/* City */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Phnom Penh"
                  value={city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                />
              </div>

              {/* Province */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Siem Reap"
                  value={province}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProvince(e.target.value)}
                />
              </div>

              {/* Date Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                />
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (USD)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Available Only */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvailableOnly(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Show available only</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={handleSearch} className="w-full">
                  Apply Filters
                </Button>
                <Button onClick={handleReset} variant="outline" className="w-full">
                  Reset Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {events.length > 0 ? `Showing ${events.length} events` : 'No events found'}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="start_date">Start Date</option>
                  <option value="end_date">End Date</option>
                  <option value="name">Name</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Events Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No events found matching your criteria</p>
                <Button onClick={handleReset} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event.id)}
                  >
                    {/* Event Image */}
                    <div className="relative h-48 bg-gray-200">
                      {event.images && event.images.length > 0 ? (
                        <img
                          src={event.images[0]}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {/* Wishlist Button */}
                      <div className="absolute bottom-2 left-2" onClick={(e) => e.stopPropagation()}>
                        <WishlistButton itemType="event" itemId={event.id} />
                      </div>
                      {/* Event Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold capitalize">
                          {event.event_type}
                        </span>
                      </div>
                      {/* Availability Badge */}
                      {event.bookings_count >= event.capacity && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.start_date)} - {formatDate(event.end_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location.city}, {event.location.province}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event.capacity - event.bookings_count} spots left
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">From</p>
                          <p className="text-xl font-bold text-blue-600">
                            ${event.pricing.base_price}
                          </p>
                        </div>
                        {event.pricing.vip_price > event.pricing.base_price && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">VIP</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${event.pricing.vip_price}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
