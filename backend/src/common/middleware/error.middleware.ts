import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/api-error';
import { config } from '../../config';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const errorCode = isApiError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = isApiError ? err.message : 'An unexpected error occurred. Please try again.';

  // Structured logging for debugging
  console.error(`[${new Date().toISOString()}] ❌ ${req.method} ${req.url} - ${statusCode} [${errorCode}]: ${err.message}`);
  if (!isApiError && config.env !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      details: isApiError ? err.details : undefined,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || undefined,
    },
  });
};
