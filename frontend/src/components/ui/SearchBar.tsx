'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Hotel } from '@/types';
import { api } from '@/lib/api';
import Button from './Button';
import Loading from './Loading';

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
  showLiveResults?: boolean;
}

interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function SearchBar({ onSearch, showLiveResults = true }: SearchBarProps) {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Live search for destination
  const searchDestinations = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<{ hotels: Hotel[] }>(
        `/api/hotels/search?destination=${encodeURIComponent(query)}&limit=5`
      );

      if (response.success && response.data) {
        setSuggestions(response.data.hotels);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching destinations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (showLiveResults && destination) {
      debounceTimer.current = setTimeout(() => {
        searchDestinations(destination);
      }, 300);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [destination, showLiveResults, searchDestinations]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params: SearchParams = {
      destination,
      checkIn,
      checkOut,
      guests,
    };

    if (onSearch) {
      onSearch(params);
    } else {
      // Navigate to hotels page with search params
      const queryParams = new URLSearchParams();
      if (destination) queryParams.set('destination', destination);
      if (checkIn) queryParams.set('checkIn', checkIn);
      if (checkOut) queryParams.set('checkOut', checkOut);
      if (guests) queryParams.set('guests', guests.toString());

      router.push(`/hotels?${queryParams.toString()}`);
    }

    setShowSuggestions(false);
  };

  const handleSuggestionClick = (hotel: Hotel) => {
    setDestination(hotel.location.city);
    setShowSuggestions(false);
    
    // Optionally navigate to hotel detail
    // router.push(`/hotels/${hotel.id}`);
  };

  // Get unique cities from suggestions
  const uniqueCities = Array.from(
    new Set(suggestions.map(h => h.location.city))
  ).slice(0, 5);

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Destination Input with Live Search */}
          <div className="relative md:col-span-2">
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => destination && setShowSuggestions(true)}
              placeholder="Where are you going?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            
            {/* Live Search Suggestions */}
            {showLiveResults && showSuggestions && (destination.length >= 2) && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <Loading size="sm" />
                  </div>
                ) : uniqueCities.length > 0 ? (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                      Popular Cities
                    </div>
                    {uniqueCities.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setDestination(city);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">📍</span>
                          <div>
                            <div className="font-medium text-gray-900">{city}</div>
                            <div className="text-sm text-gray-500">
                              {suggestions.filter(h => h.location.city === city).length} hotels
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    {suggestions.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                          Hotels
                        </div>
                        {suggestions.slice(0, 3).map((hotel) => (
                          <button
                            key={hotel.id}
                            type="button"
                            onClick={() => handleSuggestionClick(hotel)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center">
                              {hotel.images && hotel.images[0] ? (
                                <img
                                  src={hotel.images[0]}
                                  alt={hotel.name}
                                  className="w-12 h-12 rounded object-cover mr-3"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded bg-gray-200 mr-3 flex items-center justify-center">
                                  <span className="text-2xl">🏨</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{hotel.name}</div>
                                <div className="text-sm text-gray-500">
                                  {hotel.location.city} • ⭐ {hotel.average_rating.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No destinations found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Check-in Date */}
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Check-out Date */}
          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
              Guests
            </label>
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4">
          <Button type="submit" size="lg" className="w-full md:w-auto">
            🔍 Search Hotels
          </Button>
        </div>
      </form>
    </div>
  );
}
