/**
 * API Response Caching Utility
 * Implements client-side caching with TTL for API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Set cache entry with TTL (in seconds)
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store data with timestamp
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });

    // Set timer to clear cache after TTL
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache has expired
    if (age > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

/**
 * Fetch with caching
 */
export async function fetchWithCache<T>(
  url: string,
  options?: {
    ttl?: number;
    forceRefresh?: boolean;
  }
): Promise<T> {
  const ttl = options?.ttl ?? 300; // Default 5 minutes
  const forceRefresh = options?.forceRefresh ?? false;

  // Check cache first
  if (!forceRefresh) {
    const cached = cacheManager.get<T>(url);
    if (cached) {
      return cached;
    }
  }

  // Fetch from API
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const data = (await response.json()) as T;

  // Store in cache
  cacheManager.set(url, data, ttl);

  return data;
}

/**
 * Clear cache for specific pattern
 */
export function clearCachePattern(pattern: string | RegExp): void {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

  Array.from(cacheManager['cache'].keys()).forEach((key) => {
    if (regex.test(key)) {
      cacheManager.delete(key);
    }
  });
}

/**
 * Prefetch data into cache
 */
export async function prefetchData<T>(
  url: string,
  ttl: number = 300
): Promise<void> {
  try {
    await fetchWithCache<T>(url, { ttl });
  } catch (error) {
    console.warn(`Failed to prefetch ${url}:`, error);
  }
}

