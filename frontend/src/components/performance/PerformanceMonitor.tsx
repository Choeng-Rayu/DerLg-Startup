'use client';

import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

/**
 * Performance monitoring component
 * Tracks and reports performance metrics
 * Only visible in development mode
 */
export default function PerformanceMonitor() {
  // Enable performance monitoring
  usePerformanceMonitoring();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return null; // Component is invisible, only for monitoring
}

