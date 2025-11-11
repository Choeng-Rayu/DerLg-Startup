'use client';

import { useEffect } from 'react';
import {
  setOpenGraphTags,
  setCanonicalUrl,
  setStructuredData,
  type OpenGraphData,
} from '@/lib/openGraph';

/**
 * Hook to set Open Graph meta tags and structured data
 */
export function useOpenGraph(data: OpenGraphData, structuredData?: Record<string, any>) {
  useEffect(() => {
    // Set Open Graph tags
    setOpenGraphTags(data);

    // Set canonical URL
    setCanonicalUrl(data.url);

    // Set structured data if provided
    if (structuredData) {
      setStructuredData(structuredData);
    }

    // Update page title
    document.title = data.title;
  }, [data, structuredData]);
}

/**
 * Hook to set Open Graph tags for hotels
 */
export function useHotelOpenGraph(hotel: {
  id: string;
  name: string;
  description: string;
  images?: string[];
  average_rating?: number;
  total_reviews?: number;
  location?: { city: string; province: string };
}) {
  const imageUrl = hotel.images?.[0] || '/placeholder-hotel.jpg';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const ogData: OpenGraphData = {
      title: `${hotel.name} - Book Now on DerLg.com`,
      description: hotel.description || `Discover ${hotel.name} in ${hotel.location?.city || 'Cambodia'}`,
      url: `${baseUrl}/hotels/${hotel.id}`,
      imageUrl,
      type: 'website',
      siteName: 'DerLg.com',
    };

    setOpenGraphTags(ogData);
    setCanonicalUrl(ogData.url);
  }, [hotel, imageUrl, baseUrl]);
}

/**
 * Hook to set Open Graph tags for tours
 */
export function useTourOpenGraph(tour: {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  images?: string[];
  duration?: string | { days?: number; nights?: number };
}) {
  const imageUrl = tour.image_url || tour.images?.[0] || '/placeholder-tour.jpg';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const ogData: OpenGraphData = {
      title: `${tour.name} - Book Your Adventure on DerLg.com`,
      description: tour.description || `Experience ${tour.name} in Cambodia`,
      url: `${baseUrl}/tours/${tour.id}`,
      imageUrl,
      type: 'website',
      siteName: 'DerLg.com',
    };

    setOpenGraphTags(ogData);
    setCanonicalUrl(ogData.url);
  }, [tour, imageUrl, baseUrl]);
}

