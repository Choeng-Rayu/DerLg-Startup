// Hotel Comparison Utility Functions
import { Hotel } from '@/types';

const COMPARISON_STORAGE_KEY = 'hotel_comparison';
const MAX_COMPARISON_HOTELS = 4;

export interface ComparisonState {
  hotelIds: string[];
}

// Get comparison state from localStorage
export function getComparisonState(): ComparisonState {
  if (typeof window === 'undefined') return { hotelIds: [] };
  
  try {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading comparison state:', error);
  }
  
  return { hotelIds: [] };
}

// Save comparison state to localStorage
export function saveComparisonState(state: ComparisonState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving comparison state:', error);
  }
}

// Add hotel to comparison
export function addToComparison(hotelId: string): boolean {
  const state = getComparisonState();
  
  if (state.hotelIds.includes(hotelId)) {
    return false; // Already in comparison
  }
  
  if (state.hotelIds.length >= MAX_COMPARISON_HOTELS) {
    return false; // Max limit reached
  }
  
  state.hotelIds.push(hotelId);
  saveComparisonState(state);
  return true;
}

// Remove hotel from comparison
export function removeFromComparison(hotelId: string): void {
  const state = getComparisonState();
  state.hotelIds = state.hotelIds.filter(id => id !== hotelId);
  saveComparisonState(state);
}

// Check if hotel is in comparison
export function isInComparison(hotelId: string): boolean {
  const state = getComparisonState();
  return state.hotelIds.includes(hotelId);
}

// Clear all comparison
export function clearComparison(): void {
  saveComparisonState({ hotelIds: [] });
}

// Get comparison count
export function getComparisonCount(): number {
  const state = getComparisonState();
  return state.hotelIds.length;
}

// Check if can add more hotels
export function canAddMore(): boolean {
  return getComparisonCount() < MAX_COMPARISON_HOTELS;
}

// Get max comparison limit
export function getMaxLimit(): number {
  return MAX_COMPARISON_HOTELS;
}

// Calculate distance from city center (placeholder - would use actual coordinates)
export function calculateDistance(hotel: Hotel): string {
  // In a real implementation, this would calculate distance from a reference point
  // For now, return a placeholder based on hotel location
  const distances = ['0.5 km', '1.2 km', '2.5 km', '3.8 km', '5.0 km'];
  return distances[Math.floor(Math.random() * distances.length)];
}

// Get unique amenities (amenities that not all hotels have)
export function getUniqueAmenities(hotels: Hotel[]): Map<string, Set<string>> {
  const amenityMap = new Map<string, Set<string>>();
  
  // Count which hotels have each amenity
  const amenityCounts = new Map<string, number>();
  hotels.forEach(hotel => {
    hotel.amenities.forEach(amenity => {
      amenityCounts.set(amenity, (amenityCounts.get(amenity) || 0) + 1);
    });
  });
  
  // Mark amenities as unique if not all hotels have them
  hotels.forEach(hotel => {
    const uniqueAmenities = new Set<string>();
    hotel.amenities.forEach(amenity => {
      const count = amenityCounts.get(amenity) || 0;
      if (count < hotels.length) {
        uniqueAmenities.add(amenity);
      }
    });
    amenityMap.set(hotel.id, uniqueAmenities);
  });
  
  return amenityMap;
}

// Get all unique amenities across hotels
export function getAllAmenities(hotels: Hotel[]): string[] {
  const allAmenities = new Set<string>();
  hotels.forEach(hotel => {
    hotel.amenities.forEach(amenity => allAmenities.add(amenity));
  });
  return Array.from(allAmenities).sort();
}

// Format price for display
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Get price range for a hotel (based on rooms)
export function getPriceRange(hotel: Hotel, rooms?: any[]): string {
  if (!rooms || rooms.length === 0) {
    return 'Price on request';
  }
  
  const prices = rooms.map(room => room.price_per_night);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}
