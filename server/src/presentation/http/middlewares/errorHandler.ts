import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { env } from '../../../config/env';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../../../shared/utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Log the error for internal debugging
  try {
    logger.error(`${req.method} ${req.path}`, {
      error: err.message,
      name: err.name,
      body: env.nodeEnv === 'development' ? req.body : undefined,
      stack: err.stack,
    });
  } catch (logError) {
    // Fallback if logger fails (e.g. missing winston)
    console.error('Logging failed:', logError, 'Original Error:', err);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = undefined;

  // 2. Handle specific error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    // Handle invalid JSON in request body
    statusCode = 400;
    message = 'Invalid JSON payload';
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.flatten().fieldErrors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma unique constraint or not found errors
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this value already exists';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided to database client';
  } else if (err.name === 'PrismaClientInitializationError' || err.name === 'PrismaClientConnectorError') {
    statusCode = 503;
    message = 'Database connection failed. Please try again later.';
  }

  // 3. Send response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(details && { details }),
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};