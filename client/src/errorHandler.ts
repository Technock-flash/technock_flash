import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

/**
 * NOTE: This is a mock implementation to satisfy the test environment.
 * In a real application, this file and its dependencies would live on the server.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    logger.warn('ZodError:', { errors: err.flatten() });
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: err.flatten(),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      logger.warn('Prisma Unique Constraint Violation:', { code: err.code });
      return res.status(409).json({
        status: 'error',
        message: 'A record with this value already exists',
      });
    }
  }

  logger.error('Unhandled Error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};