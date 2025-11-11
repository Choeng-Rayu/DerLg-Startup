# Security and Performance Implementation Guide

## Phase 13: Security and Performance

This document covers the implementation of security measures and performance optimizations for the DerLg Tourism Platform backend.

### Task 81: Security Measures

#### Implemented Features

1. **Rate Limiting with express-rate-limit**
   - Global rate limiting: 100 requests per 15 minutes
   - IP-based rate limiting: 1000 requests per minute
   - Configurable via environment variables
   - Returns standardized error responses

2. **CORS Configuration**
   - Configured for specific origins
   - Supports credentials
   - Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   - Exposed headers: X-CSRF-Token

3. **Helmet.js Security Headers**
   - Content Security Policy (CSP)
   - HSTS (HTTP Strict Transport Security)
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - X-Frame-Options: DENY
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: Restricts geolocation, microphone, camera

4. **CSRF Protection**
   - Token generation for GET requests
   - Token validation for state-changing requests
   - 24-hour token expiry
   - Automatic token regeneration after validation
   - Periodic cleanup of expired tokens

5. **Input Sanitization**
   - Sanitizes request body, query parameters, and URL params
   - Removes HTML tags and dangerous content
   - Recursive sanitization for nested objects
   - Prevents XSS attacks

6. **SQL Injection Prevention**
   - Detects SQL keywords in input
   - Blocks suspicious patterns
   - Logs potential injection attempts

#### Usage

All security middleware is automatically applied in `src/app.ts`:

```typescript
// Security middleware is applied in this order:
1. Helmet.js
2. CORS
3. Rate limiting
4. Input sanitization
5. SQL injection prevention
6. CSRF token generation
```

#### Configuration

Environment variables in `.env`:

```env
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Task 82: Caching with Redis

#### Implemented Features

1. **Redis Cache Service** (`src/services/cache.service.ts`)
   - Connection management with retry logic
   - Get/Set operations with TTL
   - Pattern-based deletion
   - Cache statistics

2. **Cache Middleware** (`src/middleware/cache.ts`)
   - Automatic response caching for GET requests
   - Cache invalidation on mutations
   - Configurable TTL per endpoint
   - Skips caching for authenticated user-specific data

3. **Predefined Cache Configurations**
   - Hotel listings: 5-minute TTL
   - Hotel details: 10-minute TTL
   - Search results: 5-minute TTL

#### Usage

Apply cache middleware to routes:

```typescript
import { hotelListingCache, invalidateHotelCache } from '../middleware/cache';

// Cache hotel listings
router.get('/', hotelListingCache, hotelController.getHotels);

// Invalidate cache on updates
router.put('/:id', invalidateHotelCache, hotelController.updateHotel);
```

#### Configuration

Environment variables in `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional
```

### Task 83: Error Handling and Logging

#### Implemented Features

1. **Winston Logger** (`src/utils/logger.ts`)
   - Console output with colors
   - Daily rotating file logs
   - Separate error log files
   - Exception and rejection handlers
   - Configurable log levels

2. **Error Code System** (`src/utils/errorCodes.ts`)
   - Standardized error codes (SYS_XXXX, VAL_XXXX, AUTH_XXXX, etc.)
   - Consistent error messages
   - Appropriate HTTP status codes
   - 50+ predefined error codes

3. **Centralized Error Handler** (`src/middleware/errorHandler.ts`)
   - Logs errors with full context
   - Returns consistent error responses
   - Hides stack traces in production
   - Includes request metadata (IP, user agent, user ID)

#### Log Files

Logs are stored in `backend/logs/`:

- `application-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only
- `exceptions-YYYY-MM-DD.log` - Uncaught exceptions
- `rejections-YYYY-MM-DD.log` - Unhandled promise rejections

#### Usage

```typescript
import logger from '../utils/logger';
import { ErrorCodes, ErrorMessages } from '../utils/errorCodes';

// Log messages
logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err.message });

// Throw errors with codes
const error = new Error(ErrorMessages[ErrorCodes.USER_NOT_FOUND]);
error.code = ErrorCodes.USER_NOT_FOUND;
error.statusCode = 404;
throw error;
```

### Task 84: Database Query Optimization

#### Implemented Features

1. **Query Optimization Utilities** (`src/utils/queryOptimization.ts`)
   - Pagination helpers
   - Eager loading configurations
   - Attribute selection
   - Search query optimization
   - Batch loading utilities

2. **Database Indexes** (`src/migrations/add-database-indexes.ts`)
   - Indexes on frequently queried columns
   - Composite indexes for common filter combinations
   - Covers: hotels, rooms, bookings, reviews, users, payments, tours, events, messages, wishlists

3. **Eager Loading**
   - Prevents N+1 queries
   - Configurable includes for different scenarios
   - Optimized attribute selection

#### Indexes Created

**Hotels:**
- status, admin_id, average_rating, star_rating, created_at

**Rooms:**
- hotel_id, is_active, capacity, price_per_night

**Bookings:**
- user_id, hotel_id, room_id, status, check_in, check_out, created_at
- Composite: (user_id, status), (hotel_id, check_in, check_out)

**Reviews:**
- hotel_id, user_id, booking_id, created_at

**Users:**
- email (unique), user_type, is_active

**Payments:**
- booking_id, status, gateway

**Tours & Events:**
- destination, guide_id, start_date, end_date

**Messages & Wishlists:**
- booking_id, sender_id, is_read, user_id, item_type

#### Usage

```typescript
import { getPaginationParams, getHotelEagerLoadConfig } from '../utils/queryOptimization';

// Pagination
const { offset, limit } = getPaginationParams(page, limit);

// Eager loading
const includes = getHotelEagerLoadConfig(true, true);
const hotels = await Hotel.findAll({
  include: includes,
  offset,
  limit,
});
```

#### Running Migrations

```bash
# Create indexes
npm run db:migrate

# Rollback indexes
npm run db:migrate:undo
```

## Performance Metrics

### Expected Improvements

- **Query Performance**: 50-70% faster with proper indexes
- **Cache Hit Rate**: 60-80% for frequently accessed data
- **Response Time**: 200-500ms for cached endpoints
- **Memory Usage**: Reduced with pagination and attribute selection

### Monitoring

Monitor performance using:

```typescript
import logger from '../utils/logger';

// Log slow queries
logger.warn('Slow query detected', {
  query: 'SELECT ...',
  duration: '1500ms',
});
```

## Security Best Practices

1. **Always validate and sanitize input**
2. **Use CSRF tokens for state-changing requests**
3. **Keep dependencies updated**
4. **Monitor logs for suspicious activity**
5. **Use HTTPS in production**
6. **Rotate secrets regularly**
7. **Implement rate limiting per user**
8. **Use prepared statements (Sequelize handles this)**

## Troubleshooting

### Redis Connection Issues

```bash
# Check Redis status
redis-cli ping

# View Redis logs
redis-cli monitor
```

### Slow Queries

1. Check indexes are created
2. Review query execution plan
3. Enable query logging in development
4. Use EXPLAIN to analyze queries

### Cache Issues

1. Clear cache: `cacheService.clear()`
2. Check Redis connection
3. Verify TTL settings
4. Monitor cache hit rate

## References

- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Redis Documentation](https://redis.io/documentation)
- [Sequelize Query Optimization](https://sequelize.org/docs/v6/other-topics/query-performance/)

