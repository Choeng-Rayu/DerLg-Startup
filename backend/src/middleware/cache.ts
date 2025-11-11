import { Request, Response, NextFunction } from 'express';
import cacheService from '../services/cache.service';
import logger from '../utils/logger';

/**
 * Cache middleware for GET requests
 * Caches responses based on URL and query parameters
 */
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests with user-specific data
    if (req.path.includes('/user') || req.path.includes('/bookings')) {
      return next();
    }

    const cacheKey = `${req.method}:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedResponse = await cacheService.get(cacheKey);
      if (cachedResponse) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return res.json(cachedResponse);
      }
    } catch (error) {
      logger.error('Cache retrieval error:', error);
      // Continue without cache if there's an error
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data: any) {
      // Cache successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.set(cacheKey, data, ttlSeconds).catch((error) => {
          logger.error('Cache set error:', error);
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Cache invalidation middleware
 * Clears cache for related endpoints when data is modified
 */
export const invalidateCache = (patterns: string[]) => {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    // Store patterns in response locals for use after response
    _res.on('finish', async () => {
      // Only invalidate on successful mutations (POST, PUT, DELETE)
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(_req.method)) {
        if (_res.statusCode >= 200 && _res.statusCode < 300) {
          for (const pattern of patterns) {
            try {
              await cacheService.deletePattern(pattern);
              logger.debug(`Cache invalidated: ${pattern}`);
            } catch (error) {
              logger.error(`Cache invalidation error for pattern ${pattern}:`, error);
            }
          }
        }
      }
    });

    next();
  };
};

/**
 * Hotel listing cache middleware
 * Caches hotel search results for 5 minutes
 */
export const hotelListingCache = cacheMiddleware(300); // 5 minutes

/**
 * Hotel detail cache middleware
 * Caches individual hotel details for 10 minutes
 */
export const hotelDetailCache = cacheMiddleware(600); // 10 minutes

/**
 * Search results cache middleware
 * Caches search results for 5 minutes
 */
export const searchResultsCache = cacheMiddleware(300); // 5 minutes

/**
 * Hotel cache invalidation
 * Invalidates hotel-related caches when hotel data is updated
 */
export const invalidateHotelCache = invalidateCache([
  'GET:*/api/hotels*',
  'GET:*/api/search*',
]);

/**
 * Room cache invalidation
 * Invalidates room-related caches when room data is updated
 */
export const invalidateRoomCache = invalidateCache([
  'GET:*/api/rooms*',
  'GET:*/api/hotels*',
]);

/**
 * Booking cache invalidation
 * Invalidates booking-related caches when booking data is updated
 */
export const invalidateBookingCache = invalidateCache([
  'GET:*/api/bookings*',
  'GET:*/api/hotels*',
  'GET:*/api/rooms*',
]);

