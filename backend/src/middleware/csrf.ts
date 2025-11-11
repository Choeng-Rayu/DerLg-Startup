import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * CSRF token storage (in production, use Redis or database)
 */
const csrfTokens = new Map<string, { token: string; createdAt: number }>();

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF token generation middleware
 * Generates and stores CSRF token for GET requests
 */
export const csrfTokenGenerator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only generate tokens for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const sessionId = req.sessionID || req.ip || 'unknown';
    const token = generateCSRFToken();

    // Store token
    csrfTokens.set(sessionId, {
      token,
      createdAt: Date.now(),
    });

    // Attach token to response locals
    res.locals.csrfToken = token;

    // Also set as header for API clients
    res.setHeader('X-CSRF-Token', token);
  }

  next();
};

/**
 * CSRF token validation middleware
 * Validates CSRF token for state-changing requests
 */
export const csrfTokenValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip validation for webhook endpoints
  if (req.path.includes('/webhook/')) {
    return next();
  }

  const sessionId = req.sessionID || req.ip || 'unknown';
  const token =
    req.headers['x-csrf-token'] ||
    req.body?.csrfToken ||
    req.query?.csrfToken;

  if (!token || typeof token !== 'string') {
    logger.warn('CSRF token missing', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(403).json({
      success: false,
      error: {
        code: 'SEC_2002',
        message: 'CSRF token missing or invalid',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken) {
    logger.warn('CSRF token not found in storage', {
      ip: req.ip,
      path: req.path,
      sessionId,
    });
    res.status(403).json({
      success: false,
      error: {
        code: 'SEC_2002',
        message: 'CSRF token missing or invalid',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Check token expiry
  if (Date.now() - storedToken.createdAt > TOKEN_EXPIRY) {
    csrfTokens.delete(sessionId);
    logger.warn('CSRF token expired', {
      ip: req.ip,
      path: req.path,
    });
    res.status(403).json({
      success: false,
      error: {
        code: 'SEC_2003',
        message: 'CSRF token expired',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Validate token
  if (token !== storedToken.token) {
    logger.warn('CSRF token mismatch', {
      ip: req.ip,
      path: req.path,
    });
    res.status(403).json({
      success: false,
      error: {
        code: 'SEC_2002',
        message: 'CSRF token missing or invalid',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Token is valid, regenerate for next request
  const newToken = generateCSRFToken();
  csrfTokens.set(sessionId, {
    token: newToken,
    createdAt: Date.now(),
  });
  res.setHeader('X-CSRF-Token', newToken);

  next();
};

/**
 * Clean up expired CSRF tokens periodically
 */
export const cleanupExpiredTokens = (): void => {
  setInterval(() => {
    const now = Date.now();
    for (const [sessionId, tokenData] of csrfTokens.entries()) {
      if (now - tokenData.createdAt > TOKEN_EXPIRY) {
        csrfTokens.delete(sessionId);
      }
    }
  }, 60 * 60 * 1000); // Run every hour
};

