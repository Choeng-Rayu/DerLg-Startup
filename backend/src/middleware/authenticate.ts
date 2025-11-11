import { Request, Response, NextFunction } from 'express';
import authService, { JWTPayload } from '../services/auth.service';
import User, { UserType } from '../models/User';
import logger from '../utils/logger';

/**
 * Extend Express Request interface to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_1001',
          message: 'No authentication token provided',
          timestamp: new Date(),
        },
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = authService.verifyAccessToken(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid token';
      
      res.status(401).json({
        success: false,
        error: {
          code: errorMessage.includes('expired') ? 'AUTH_1002' : 'AUTH_1003',
          message: errorMessage,
          timestamp: new Date(),
        },
      });
      return;
    }

    // Get user from database
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_1003',
          message: 'User not found',
          timestamp: new Date(),
        },
      });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_1004',
          message: 'User account is inactive',
          timestamp: new Date(),
        },
      });
      return;
    }

    // Attach user and token payload to request
    req.user = user;
    req.token = decoded;

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SYS_9001',
        message: 'Internal server error during authentication',
        timestamp: new Date(),
      },
    });
  }
};

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required role(s)
 */
export const authorize = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_1003',
          message: 'Unauthorized - Authentication required',
          timestamp: new Date(),
        },
      });
      return;
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.user_type)) {
      logger.warn(
        `Authorization failed: User ${req.user.id} (${req.user.user_type}) attempted to access resource requiring roles: ${allowedRoles.join(', ')}`
      );

      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_1004',
          message: 'Forbidden - Insufficient permissions',
          timestamp: new Date(),
        },
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = authService.verifyAccessToken(token);
      const user = await User.findByPk(decoded.userId);

      if (user && user.is_active) {
        req.user = user;
        req.token = decoded;
      }
    } catch (error) {
      // Invalid token, but continue without user
      logger.debug('Optional authentication failed:', error);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};

/**
 * Middleware to check if email is verified
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_1003',
        message: 'Unauthorized',
        timestamp: new Date(),
      },
    });
    return;
  }

  if (!req.user.email_verified) {
    res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_1005',
        message: 'Email verification required',
        timestamp: new Date(),
      },
    });
    return;
  }

  next();
};
