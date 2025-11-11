/**
 * Error Code System
 * Centralized error codes for consistent error handling across the application
 */

export const ErrorCodes = {
  // System Errors (SYS_XXXX)
  INTERNAL_SERVER_ERROR: 'SYS_9001',
  RATE_LIMIT_EXCEEDED: 'SYS_9002',
  PAYLOAD_TOO_LARGE: 'SYS_9003',
  SERVICE_UNAVAILABLE: 'SYS_9004',
  TIMEOUT: 'SYS_9005',

  // Validation Errors (VAL_XXXX)
  VALIDATION_FAILED: 'VAL_2001',
  INVALID_INPUT: 'VAL_2002',
  MISSING_REQUIRED_FIELD: 'VAL_2003',
  INVALID_EMAIL: 'VAL_2004',
  INVALID_PASSWORD: 'VAL_2005',
  PASSWORD_TOO_WEAK: 'VAL_2006',

  // Authentication Errors (AUTH_XXXX)
  INVALID_CREDENTIALS: 'AUTH_1001',
  TOKEN_EXPIRED: 'AUTH_1002',
  INVALID_TOKEN: 'AUTH_1003',
  USER_INACTIVE: 'AUTH_1004',
  UNAUTHORIZED: 'AUTH_1005',
  FORBIDDEN: 'AUTH_1006',

  // Security Errors (SEC_XXXX)
  CSRF_TOKEN_MISSING: 'SEC_2001',
  CSRF_TOKEN_INVALID: 'SEC_2002',
  CSRF_TOKEN_EXPIRED: 'SEC_2003',
  SQL_INJECTION_DETECTED: 'SEC_2004',
  XSS_DETECTED: 'SEC_2005',

  // Resource Errors (RES_XXXX)
  RESOURCE_NOT_FOUND: 'RES_3001',
  RESOURCE_ALREADY_EXISTS: 'RES_3002',
  RESOURCE_CONFLICT: 'RES_3003',
  RESOURCE_DELETED: 'RES_3004',

  // User Errors (USR_XXXX)
  USER_NOT_FOUND: 'USR_4001',
  USER_ALREADY_EXISTS: 'USR_4002',
  USER_ACCOUNT_INACTIVE: 'USR_4003',
  USER_BANNED: 'USR_4004',

  // Hotel Errors (HTL_XXXX)
  HOTEL_NOT_FOUND: 'HTL_5001',
  HOTEL_UNAVAILABLE: 'HTL_5002',
  INVALID_HOTEL_DATA: 'HTL_5003',

  // Room Errors (RMT_XXXX)
  ROOM_NOT_FOUND: 'RMT_6001',
  ROOM_UNAVAILABLE: 'RMT_6002',
  ROOM_FULLY_BOOKED: 'RMT_6003',
  INVALID_ROOM_DATA: 'RMT_6004',

  // Booking Errors (BKG_XXXX)
  BOOKING_NOT_FOUND: 'BKG_7001',
  BOOKING_ALREADY_CANCELLED: 'BKG_7002',
  BOOKING_CANNOT_BE_MODIFIED: 'BKG_7003',
  INVALID_BOOKING_DATES: 'BKG_7004',
  BOOKING_CONFLICT: 'BKG_7005',

  // Payment Errors (PAY_XXXX)
  PAYMENT_FAILED: 'PAY_8001',
  PAYMENT_PENDING: 'PAY_8002',
  PAYMENT_CANCELLED: 'PAY_8003',
  INVALID_PAYMENT_METHOD: 'PAY_8004',
  INSUFFICIENT_FUNDS: 'PAY_8005',
  PAYMENT_GATEWAY_ERROR: 'PAY_8006',

  // Database Errors (DB_XXXX)
  DATABASE_ERROR: 'DB_9001',
  DATABASE_CONNECTION_ERROR: 'DB_9002',
  TRANSACTION_FAILED: 'DB_9003',

  // External Service Errors (EXT_XXXX)
  EXTERNAL_SERVICE_ERROR: 'EXT_10001',
  EMAIL_SERVICE_ERROR: 'EXT_10002',
  SMS_SERVICE_ERROR: 'EXT_10003',
  PAYMENT_GATEWAY_UNAVAILABLE: 'EXT_10004',
};

/**
 * Error messages for each error code
 */
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'An internal server error occurred',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests, please try again later',
  [ErrorCodes.PAYLOAD_TOO_LARGE]: 'Request payload is too large',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
  [ErrorCodes.TIMEOUT]: 'Request timeout',

  [ErrorCodes.VALIDATION_FAILED]: 'Validation failed',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Missing required field',
  [ErrorCodes.INVALID_EMAIL]: 'Invalid email address',
  [ErrorCodes.INVALID_PASSWORD]: 'Invalid password',
  [ErrorCodes.PASSWORD_TOO_WEAK]: 'Password is too weak',

  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCodes.TOKEN_EXPIRED]: 'Token has expired',
  [ErrorCodes.INVALID_TOKEN]: 'Invalid token',
  [ErrorCodes.USER_INACTIVE]: 'User account is inactive',
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCodes.FORBIDDEN]: 'Access forbidden',

  [ErrorCodes.CSRF_TOKEN_MISSING]: 'CSRF token is missing',
  [ErrorCodes.CSRF_TOKEN_INVALID]: 'CSRF token is invalid',
  [ErrorCodes.CSRF_TOKEN_EXPIRED]: 'CSRF token has expired',
  [ErrorCodes.SQL_INJECTION_DETECTED]: 'Invalid input detected',
  [ErrorCodes.XSS_DETECTED]: 'Invalid input detected',

  [ErrorCodes.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ErrorCodes.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCodes.RESOURCE_CONFLICT]: 'Resource conflict',
  [ErrorCodes.RESOURCE_DELETED]: 'Resource has been deleted',

  [ErrorCodes.USER_NOT_FOUND]: 'User not found',
  [ErrorCodes.USER_ALREADY_EXISTS]: 'User already exists',
  [ErrorCodes.USER_INACTIVE]: 'User account is inactive',
  [ErrorCodes.USER_BANNED]: 'User account has been banned',

  [ErrorCodes.HOTEL_NOT_FOUND]: 'Hotel not found',
  [ErrorCodes.HOTEL_UNAVAILABLE]: 'Hotel is unavailable',
  [ErrorCodes.INVALID_HOTEL_DATA]: 'Invalid hotel data',

  [ErrorCodes.ROOM_NOT_FOUND]: 'Room not found',
  [ErrorCodes.ROOM_UNAVAILABLE]: 'Room is unavailable',
  [ErrorCodes.ROOM_FULLY_BOOKED]: 'Room is fully booked',
  [ErrorCodes.INVALID_ROOM_DATA]: 'Invalid room data',

  [ErrorCodes.BOOKING_NOT_FOUND]: 'Booking not found',
  [ErrorCodes.BOOKING_ALREADY_CANCELLED]: 'Booking has already been cancelled',
  [ErrorCodes.BOOKING_CANNOT_BE_MODIFIED]: 'Booking cannot be modified',
  [ErrorCodes.INVALID_BOOKING_DATES]: 'Invalid booking dates',
  [ErrorCodes.BOOKING_CONFLICT]: 'Booking conflict detected',

  [ErrorCodes.PAYMENT_FAILED]: 'Payment failed',
  [ErrorCodes.PAYMENT_PENDING]: 'Payment is pending',
  [ErrorCodes.PAYMENT_CANCELLED]: 'Payment has been cancelled',
  [ErrorCodes.INVALID_PAYMENT_METHOD]: 'Invalid payment method',
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds',
  [ErrorCodes.PAYMENT_GATEWAY_ERROR]: 'Payment gateway error',

  [ErrorCodes.DATABASE_ERROR]: 'Database error occurred',
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: 'Database connection error',
  [ErrorCodes.TRANSACTION_FAILED]: 'Transaction failed',

  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ErrorCodes.EMAIL_SERVICE_ERROR]: 'Email service error',
  [ErrorCodes.SMS_SERVICE_ERROR]: 'SMS service error',
  [ErrorCodes.PAYMENT_GATEWAY_UNAVAILABLE]: 'Payment gateway is unavailable',
};

/**
 * HTTP status codes for each error code
 */
export const ErrorStatusCodes: Record<string, number> = {
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.PAYLOAD_TOO_LARGE]: 413,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.TIMEOUT]: 504,

  [ErrorCodes.VALIDATION_FAILED]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_EMAIL]: 400,
  [ErrorCodes.INVALID_PASSWORD]: 400,
  [ErrorCodes.PASSWORD_TOO_WEAK]: 400,

  [ErrorCodes.INVALID_CREDENTIALS]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.INVALID_TOKEN]: 401,
  [ErrorCodes.USER_INACTIVE]: 403,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,

  [ErrorCodes.CSRF_TOKEN_MISSING]: 403,
  [ErrorCodes.CSRF_TOKEN_INVALID]: 403,
  [ErrorCodes.CSRF_TOKEN_EXPIRED]: 403,
  [ErrorCodes.SQL_INJECTION_DETECTED]: 400,
  [ErrorCodes.XSS_DETECTED]: 400,

  [ErrorCodes.RESOURCE_NOT_FOUND]: 404,
  [ErrorCodes.RESOURCE_ALREADY_EXISTS]: 409,
  [ErrorCodes.RESOURCE_CONFLICT]: 409,
  [ErrorCodes.RESOURCE_DELETED]: 410,

  [ErrorCodes.USER_NOT_FOUND]: 404,
  [ErrorCodes.USER_ALREADY_EXISTS]: 409,
  [ErrorCodes.USER_INACTIVE]: 403,
  [ErrorCodes.USER_BANNED]: 403,

  [ErrorCodes.HOTEL_NOT_FOUND]: 404,
  [ErrorCodes.HOTEL_UNAVAILABLE]: 503,
  [ErrorCodes.INVALID_HOTEL_DATA]: 400,

  [ErrorCodes.ROOM_NOT_FOUND]: 404,
  [ErrorCodes.ROOM_UNAVAILABLE]: 503,
  [ErrorCodes.ROOM_FULLY_BOOKED]: 409,
  [ErrorCodes.INVALID_ROOM_DATA]: 400,

  [ErrorCodes.BOOKING_NOT_FOUND]: 404,
  [ErrorCodes.BOOKING_ALREADY_CANCELLED]: 409,
  [ErrorCodes.BOOKING_CANNOT_BE_MODIFIED]: 409,
  [ErrorCodes.INVALID_BOOKING_DATES]: 400,
  [ErrorCodes.BOOKING_CONFLICT]: 409,

  [ErrorCodes.PAYMENT_FAILED]: 402,
  [ErrorCodes.PAYMENT_PENDING]: 202,
  [ErrorCodes.PAYMENT_CANCELLED]: 409,
  [ErrorCodes.INVALID_PAYMENT_METHOD]: 400,
  [ErrorCodes.INSUFFICIENT_FUNDS]: 402,
  [ErrorCodes.PAYMENT_GATEWAY_ERROR]: 502,

  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: 503,
  [ErrorCodes.TRANSACTION_FAILED]: 500,

  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCodes.EMAIL_SERVICE_ERROR]: 502,
  [ErrorCodes.SMS_SERVICE_ERROR]: 502,
  [ErrorCodes.PAYMENT_GATEWAY_UNAVAILABLE]: 503,
};

