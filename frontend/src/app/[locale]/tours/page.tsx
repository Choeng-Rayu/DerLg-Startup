'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Tour } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import WishlistButton from '@/components/ui/WishlistButton';

export default function ToursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [minDays, setMinDays] = useState(searchParams.get('min_days') || '');
  const [maxDays, setMaxDays] = useState(searchParams.get('max_days') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'popularity');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTours();
  }, [currentPage, sortBy]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (destination) params.append('destination', destination);
      if (difficulty) params.append('difficulty', difficulty);
      if (category) params.append('category', category);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (minDays) params.append('min_days', minDays);
      if (maxDays) params.append('max_days', maxDays);
      params.append('sort_by', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await api.get(`/tours?${params.toString()}`);

      if (response.success && response.data) {
        const data = response.data as { tours: Tour[]; pagination: { totalPages: number } };
        if (data.tours) {
          setTours(data.tours);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setError('Failed to load tours');
        }
      } else {
        setError('Failed to load tours');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTours();
  };

  const handleReset = () => {
    setDestination('');
    setDifficulty('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinDays('');
    setMaxDays('');
    setSortBy('popularity');
    setCurrentPage(1);
  };

  const handleTourClick = (tourId: string) => {
    router.push(`/tours/${tourId}`);
  };

  if (loading && tours.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Tours in Cambodia</h1>
          <p className="text-gray-600">Discover amazing experiences and adventures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              {/* Destination */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Siem Reap"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="cultural">Cultural</option>
                  <option value="adventure">Adventure</option>
                  <option value="nature">Nature</option>
                  <option value="historical">Historical</option>
                  <option value="food">Food & Culinary</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (USD per person)
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

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Days)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minDays}
                    onChange={(e) => setMinDays(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxDays}
                    onChange={(e) => setMaxDays(e.target.value)}
                  />
                </div>
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

          {/* Tours Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {tours.length > 0 ? `Showing ${tours.length} tours` : 'No tours found'}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Tours Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No tours found matching your criteria</p>
                <Button onClick={handleReset} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <Card
                    key={tour.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleTourClick(tour.id)}
                  >
                    {/* Tour Image */}
                    <div className="relative h-48 bg-gray-200">
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
                      {/* Wishlist Button */}
                      <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                        <WishlistButton itemType="tour" itemId={tour.id} />
                      </div>
                      {/* Difficulty Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            tour.difficulty === 'easy'
                              ? 'bg-green-100 text-green-800'
                              : tour.difficulty === 'moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Tour Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {tour.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {tour.description}
                      </p>

                      {/* Tour Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {tour.destination}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {tour.duration.days} {tour.duration.days === 1 ? 'Day' : 'Days'} / {tour.duration.nights} {tour.duration.nights === 1 ? 'Night' : 'Nights'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {tour.group_size.min}-{tour.group_size.max} people
                        </div>
                      </div>

                      {/* Rating and Price */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">
                            {tour.average_rating > 0 ? tour.average_rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">From</p>
                          <p className="text-xl font-bold text-blue-600">
                            ${tour.price_per_person}
                          </p>
                          <p className="text-xs text-gray-500">per person</p>
                        </div>
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
