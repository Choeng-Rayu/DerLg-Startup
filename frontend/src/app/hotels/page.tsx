'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Hotel, SearchParams } from '@/types';
import { HotelCard, HotelFilters } from '@/components/hotels';
import SearchBar from '@/components/ui/SearchBar';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { ComparisonBar } from '@/components/ui/ComparisonBar';
import { fetchWithCache } from '@/lib/cache';

export default function HotelsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 12;

  // Parse search params
  const searchQuery: SearchParams = {
    destination: searchParams.get('destination') || undefined,
    checkIn: searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined,
    checkOut: searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined,
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
    priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
    priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || undefined,
    rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    sortBy: (searchParams.get('sortBy') as SearchParams['sortBy']) || 'relevance',
  };

  // Fetch hotels
  useEffect(() => {
    fetchHotels();
  }, [searchParams, currentPage]);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string
      const queryParams = new URLSearchParams();

      if (searchQuery.destination) queryParams.append('destination', searchQuery.destination);
      if (searchQuery.checkIn) queryParams.append('checkIn', searchQuery.checkIn.toISOString());
      if (searchQuery.checkOut) queryParams.append('checkOut', searchQuery.checkOut.toISOString());
      if (searchQuery.guests) queryParams.append('guests', searchQuery.guests.toString());
      if (searchQuery.priceMin) queryParams.append('priceMin', searchQuery.priceMin.toString());
      if (searchQuery.priceMax) queryParams.append('priceMax', searchQuery.priceMax.toString());
      if (searchQuery.amenities?.length) queryParams.append('amenities', searchQuery.amenities.join(','));
      if (searchQuery.rating) queryParams.append('rating', searchQuery.rating.toString());
      if (searchQuery.sortBy) queryParams.append('sortBy', searchQuery.sortBy);

      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());

      const url = `/api/hotels/search?${queryParams.toString()}`;

      // Use cache for hotel searches (5 minute TTL)
      const response = await fetchWithCache<{ hotels: Hotel[]; total: number; page: number; totalPages: number }>(
        url,
        { ttl: 300 }
      );

      if (response) {
        setHotels(response.hotels);
        setTotalResults(response.total);
      } else {
        setError('Failed to fetch hotels');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: Partial<SearchParams>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params with new filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else if (value instanceof Date) {
          params.set(key, value.toISOString());
        } else {
          params.set(key, value.toString());
        }
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    setCurrentPage(1);
    router.push(`/hotels?${params.toString()}`);
  };

  const handleSortChange = (sortBy: SearchParams['sortBy']) => {
    handleFilterChange({ sortBy });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar showLiveResults={false} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery.destination ? `Hotels in ${searchQuery.destination}` : 'All Hotels'}
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Searching...' : `${totalResults} properties found`}
            </p>
          </div>

          <div className="flex gap-3">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {/* Sort Dropdown */}
            <select
              value={searchQuery.sortBy}
              onChange={(e) => handleSortChange(e.target.value as SearchParams['sortBy'])}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <HotelFilters
                currentFilters={searchQuery}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Hotel Results */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loading size="lg" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchHotels} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : hotels.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold mb-2">No hotels found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={() => router.push('/hotels')}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Hotel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          
                          return (
                            <div key={page} className="flex gap-2">
                              {showEllipsis && (
                                <span className="px-3 py-2 text-gray-500">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? 'primary' : 'outline'}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}

                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Comparison Bar */}
      <ComparisonBar />
    </div>
  );
}
