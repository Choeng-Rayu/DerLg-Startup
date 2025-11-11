'use client';

import { useEffect } from 'react';
import {
  getWebVitals,
  reportPerformanceMetrics,
  checkLighthouseTargets,
} from '@/lib/performance';

/**
 * Hook to monitor and report performance metrics
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Wait for page to fully load
    if (typeof window === 'undefined') return;

    const handlePageLoad = () => {
      // Get metrics after a short delay to ensure all data is available
      setTimeout(() => {
        const metrics = getWebVitals();
        const targets = checkLighthouseTargets(metrics);

        // Log metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Web Vitals:', metrics);
          console.log('Lighthouse Targets Met:', targets);
        }

        // Report metrics
        reportPerformanceMetrics(metrics);
      }, 1000);
    };

    // Listen for page load
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
      return () => window.removeEventListener('load', handlePageLoad);
    }
  }, []);
}

/**
 * Hook to monitor Core Web Vitals
 */
export function useCoreWebVitals(callback?: (metrics: any) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (callback) {
        callback({ type: 'LCP', value: lastEntry.startTime });
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // Monitor Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          if (callback) {
            callback({ type: 'CLS', value: clsValue });
          }
        }
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }

    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (callback) {
          callback({ type: 'FID', value: (entry as any).processingDuration });
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
    };
  }, [callback]);
}

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

