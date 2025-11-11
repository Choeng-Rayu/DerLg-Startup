import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ErrorCodes, ErrorMessages, ErrorStatusCodes } from '../utils/errorCodes';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Centralized error handler middleware
 * Logs errors and returns consistent error responses
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const code = err.code || ErrorCodes.INTERNAL_SERVER_ERROR;
  const statusCode = err.statusCode || ErrorStatusCodes[code] || 500;
  const message = err.message || ErrorMessages[code] || 'Internal Server Error';

  // Log error with context
  logger.error('Request error', {
    code,
    message,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    stack: err.stack,
    details: err.details,
  });

  // Don't expose stack trace in production
  const responseDetails =
    process.env.NODE_ENV === 'production' ? undefined : err.details;

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(responseDetails && { details: responseDetails }),
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.warn('Resource not found', {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: {
      code: ErrorCodes.RESOURCE_NOT_FOUND,
      message: ErrorMessages[ErrorCodes.RESOURCE_NOT_FOUND],
      timestamp: new Date().toISOString(),
    },
  });
};
