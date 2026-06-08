import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const isOperational = isAppError ? err.isOperational : false;

  if (!isOperational) {
    logger.error('Unexpected error:', { message: err.message, stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: config.app.env === 'production' && !isOperational
        ? 'Internal server error'
        : err.message,
      ...(config.app.env !== 'production' && { stack: err.stack }),
    },
  });
}
