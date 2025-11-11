/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
  pageLoadTime?: number;
}

/**
 * Measure page load time
 */
export function measurePageLoadTime(): number {
  if (typeof window === 'undefined') return 0;

  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigationTiming) return 0;

  return navigationTiming.loadEventEnd - navigationTiming.fetchStart;
}

/**
 * Get Web Vitals metrics
 */
export function getWebVitals(): PerformanceMetrics {
  if (typeof window === 'undefined') return {};

  const metrics: PerformanceMetrics = {};

  // First Contentful Paint
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime;
  }

  // Largest Contentful Paint
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  if (lcpEntries.length > 0) {
    metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;
  }

  // Cumulative Layout Shift
  const clsEntries = performance.getEntriesByType('layout-shift');
  let cls = 0;
  clsEntries.forEach((entry: any) => {
    if (!entry.hadRecentInput) {
      cls += entry.value;
    }
  });
  metrics.cls = cls;

  // Time to First Byte
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationTiming) {
    metrics.ttfb = navigationTiming.responseStart - navigationTiming.fetchStart;
    metrics.pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
  }

  return metrics;
}

/**
 * Report performance metrics
 */
export async function reportPerformanceMetrics(
  metrics: PerformanceMetrics
): Promise<void> {
  try {
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metrics,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });
  } catch (error) {
    console.warn('Failed to report performance metrics:', error);
  }
}

/**
 * Measure function execution time
 */
export function measureExecutionTime(
  fn: () => void,
  label: string = 'Execution'
): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return duration;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  label: string = 'Async Execution'
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Check if page meets Lighthouse targets
 */
export function checkLighthouseTargets(metrics: PerformanceMetrics): {
  fcp: boolean;
  lcp: boolean;
  cls: boolean;
  ttfb: boolean;
} {
  return {
    fcp: (metrics.fcp ?? 0) < 1800, // < 1.8s
    lcp: (metrics.lcp ?? 0) < 2500, // < 2.5s
    cls: (metrics.cls ?? 0) < 0.1, // < 0.1
    ttfb: (metrics.ttfb ?? 0) < 600, // < 600ms
  };
}

/**
 * Get resource timing information
 */
export function getResourceTimings(): Array<{
  name: string;
  duration: number;
  size: number;
  type: string;
}> {
  if (typeof window === 'undefined') return [];

  return performance.getEntriesByType('resource').map((entry: any) => ({
    name: entry.name,
    duration: entry.duration,
    size: entry.transferSize || 0,
    type: entry.initiatorType,
  }));
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null {
  if (typeof window === 'undefined') return null;

  const memory = (performance as any).memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}

