import { IncludeOptions } from 'sequelize';
import logger from './logger';

/**
 * Query Optimization Utilities
 * Provides helpers for eager loading, pagination, and query optimization
 */

/**
 * Pagination helper
 * Calculates offset and limit for pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  offset: number;
  limit: number;
  page: number;
}

export const getPaginationParams = (
  page: number = 1,
  limit: number = 10,
  maxLimit: number = 100
): PaginationResult => {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), maxLimit);
  const offset = (validPage - 1) * validLimit;

  return {
    offset,
    limit: validLimit,
    page: validPage,
  };
};

/**
 * Calculate pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Eager loading configuration for Hotel queries
 * Prevents N+1 queries by including related data
 */
export const getHotelEagerLoadConfig = (
  includeReviews: boolean = false,
  includeRooms: boolean = true
): IncludeOptions[] => {
  const includes: IncludeOptions[] = [];

  if (includeRooms) {
    includes.push({
      association: 'rooms',
      attributes: [
        'id',
        'room_type',
        'price_per_night',
        'capacity',
        'discount_percentage',
        'amenities',
        'images',
      ],
      required: false,
    });
  }

  if (includeReviews) {
    includes.push({
      association: 'reviews',
      attributes: [
        'id',
        'ratings',
        'comment',
        'sentiment',
        'helpful_count',
        'is_verified',
        'created_at',
      ],
      required: false,
      order: [['created_at', 'DESC']],
      include: [
        {
          association: 'user',
          attributes: ['id', 'first_name', 'last_name', 'profile_image'],
          required: false,
        },
      ],
    } as any);
  }

  return includes;
};

/**
 * Eager loading configuration for Booking queries
 * Prevents N+1 queries by including related data
 */
export const getBookingEagerLoadConfig = (): IncludeOptions[] => {
  return [
    {
      association: 'user',
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
      required: false,
    },
    {
      association: 'hotel',
      attributes: ['id', 'name', 'location', 'contact'],
      required: false,
    },
    {
      association: 'room',
      attributes: ['id', 'room_type', 'price_per_night', 'capacity'],
      required: false,
    },
    {
      association: 'payment',
      attributes: [
        'id',
        'transaction_id',
        'gateway',
        'amount',
        'payment_type',
        'status',
      ],
      required: false,
    },
  ];
};

/**
 * Eager loading configuration for Review queries
 */
export const getReviewEagerLoadConfig = (): IncludeOptions[] => {
  return [
    {
      association: 'user',
      attributes: ['id', 'first_name', 'last_name', 'profile_image'],
      required: false,
    },
    {
      association: 'hotel',
      attributes: ['id', 'name'],
      required: false,
    },
    {
      association: 'booking',
      attributes: ['id', 'check_in', 'check_out'],
      required: false,
    },
  ];
};

/**
 * Build optimized query options
 */
export const buildOptimizedQuery = (
  options: any,
  eagerLoadIncludes: IncludeOptions[]
): any => {
  return {
    ...options,
    include: [...(options.include || []), ...eagerLoadIncludes],
    subQuery: false, // Prevent subqueries which can cause performance issues
  };
};

/**
 * Log slow queries
 */
export const logSlowQuery = (
  query: string,
  duration: number,
  threshold: number = 1000
): void => {
  if (duration > threshold) {
    logger.warn('Slow query detected', {
      query: query.substring(0, 200), // Log first 200 chars
      duration: `${duration}ms`,
      threshold: `${threshold}ms`,
    });
  }
};

/**
 * Batch load related data to prevent N+1 queries
 * Useful for loading data after initial query
 */
export const batchLoadRelated = async <T extends { id: string }>(
  items: T[],
  loader: (ids: string[]) => Promise<Map<string, any>>
): Promise<Map<string, any>> => {
  if (items.length === 0) {
    return new Map();
  }

  const ids = items.map((item) => item.id);
  return loader(ids);
};

/**
 * Select only needed attributes to reduce payload size
 */
export const selectAttributes = (
  baseAttributes: string[],
  excludeAttributes?: string[]
): { include?: string[]; exclude?: string[] } => {
  if (excludeAttributes && excludeAttributes.length > 0) {
    return { exclude: excludeAttributes };
  }
  return { include: baseAttributes };
};

/**
 * Build efficient where clause for common filters
 */
export const buildWhereClause = (filters: Record<string, any>): any => {
  const where: any = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  }

  return where;
};

/**
 * Optimize query for search operations
 * Uses indexes and efficient filtering
 */
export const optimizeSearchQuery = (
  searchTerm: string,
  searchFields: string[]
): any => {
  const { Op } = require('sequelize');

  if (!searchTerm || searchTerm.trim() === '') {
    return {};
  }

  const term = `%${searchTerm.trim()}%`;
  return {
    [Op.or]: searchFields.map((field) => ({
      [field]: { [Op.like]: term },
    })),
  };
};

