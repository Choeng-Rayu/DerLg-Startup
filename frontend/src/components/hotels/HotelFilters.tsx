'use client';

import { useState, useEffect } from 'react';
import { SearchParams } from '@/types';
import Button from '@/components/ui/Button';

interface HotelFiltersProps {
  currentFilters: SearchParams;
  onFilterChange: (filters: Partial<SearchParams>) => void;
}

const AMENITIES = [
  { id: 'wifi', label: 'Free WiFi' },
  { id: 'parking', label: 'Free Parking' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'breakfast', label: 'Breakfast Included' },
  { id: 'gym', label: 'Fitness Center' },
  { id: 'spa', label: 'Spa' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'bar', label: 'Bar' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'pet_friendly', label: 'Pet Friendly' },
];

export default function HotelFilters({ currentFilters, onFilterChange }: HotelFiltersProps) {
  const [priceMin, setPriceMin] = useState(currentFilters.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState(currentFilters.priceMax?.toString() || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    currentFilters.amenities || []
  );
  const [selectedRating, setSelectedRating] = useState<number | undefined>(
    currentFilters.rating
  );

  // Update local state when filters change externally
  useEffect(() => {
    setPriceMin(currentFilters.priceMin?.toString() || '');
    setPriceMax(currentFilters.priceMax?.toString() || '');
    setSelectedAmenities(currentFilters.amenities || []);
    setSelectedRating(currentFilters.rating);
  }, [currentFilters]);

  const handlePriceChange = () => {
    const min = priceMin ? parseFloat(priceMin) : undefined;
    const max = priceMax ? parseFloat(priceMax) : undefined;
    
    onFilterChange({
      priceMin: min,
      priceMax: max,
    });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];
    
    setSelectedAmenities(newAmenities);
    onFilterChange({
      amenities: newAmenities.length > 0 ? newAmenities : undefined,
    });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = selectedRating === rating ? undefined : rating;
    setSelectedRating(newRating);
    onFilterChange({
      rating: newRating,
    });
  };

  const handleClearAll = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedAmenities([]);
    setSelectedRating(undefined);
    
    onFilterChange({
      priceMin: undefined,
      priceMax: undefined,
      amenities: undefined,
      rating: undefined,
    });
  };

  const hasActiveFilters = 
    priceMin || 
    priceMax || 
    selectedAmenities.length > 0 || 
    selectedRating !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Price per Night</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Min Price ($)</label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={handlePriceChange}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Max Price ($)</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={handlePriceChange}
              placeholder="1000"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Guest Rating */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Guest Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                selectedRating === rating
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span className="flex items-center">
                {'⭐'.repeat(rating)}
                <span className="ml-2 text-sm">& up</span>
              </span>
              {selectedRating === rating && (
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity.id}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity.id)}
                onChange={() => handleAmenityToggle(amenity.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {priceMin && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                Min: ${priceMin}
              </span>
            )}
            {priceMax && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                Max: ${priceMax}
              </span>
            )}
            {selectedRating && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {selectedRating}+ stars
              </span>
            )}
            {selectedAmenities.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {selectedAmenities.length} amenities
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
