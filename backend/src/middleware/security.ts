import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import logger from '../utils/logger';

/**
 * Input sanitization middleware
 * Sanitizes all request body, query, and params to prevent XSS attacks
 */
export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    next();
  }
};

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}

/**
 * Security headers middleware
 * Additional security headers beyond Helmet
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
};

/**
 * Request size limit middleware
 * Prevents large payload attacks
 */
export const requestSizeLimit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  let size = 0;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxSize) {
      res.status(413).json({
        success: false,
        error: {
          code: 'SYS_9003',
          message: 'Payload too large',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  next();
};

/**
 * SQL injection prevention middleware
 * Validates input patterns to prevent SQL injection
 */
export const preventSQLInjection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const sqlKeywords = [
    'DROP',
    'DELETE',
    'INSERT',
    'UPDATE',
    'UNION',
    'SELECT',
    'EXEC',
    'EXECUTE',
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const upperValue = value.toUpperCase();
    return sqlKeywords.some((keyword) => upperValue.includes(keyword));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj !== 'object' || obj === null) return false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (checkValue(obj[key]) || checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    logger.warn('Potential SQL injection attempt detected', {
      ip: req.ip,
      path: req.path,
    });
    res.status(400).json({
      success: false,
      error: {
        code: 'SEC_2001',
        message: 'Invalid input detected',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};

/**
 * Rate limiting by IP address
 * Tracks requests per IP to prevent brute force attacks
 */
const ipRequestMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimitByIP = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 1000; // Per minute

  let record = ipRequestMap.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
    ipRequestMap.set(ip, record);
  }

  record.count++;

  if (record.count > maxRequests) {
    logger.warn('Rate limit exceeded for IP', { ip, count: record.count });
    res.status(429).json({
      success: false,
      error: {
        code: 'SYS_9002',
        message: 'Too many requests, please try again later',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};

