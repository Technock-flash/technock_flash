import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from './errorHandler';
import { AppError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../../shared/utils/logger';

describe('errorHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = { method: 'GET', path: '/test', body: {} };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  it('should handle AppError and return specified status code', () => {
    const error = new AppError('Custom Error', 403);
    errorHandler(error as any, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      message: 'Custom Error',
    }));
  });

  it('should handle ZodError and return 400 with details', () => {
    const error = new ZodError([]);
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Validation failed',
      details: expect.any(Object),
    }));
  });

  it('should handle Prisma P2002 (Unique Constraint) as 409 Conflict', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'mock' });
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'A record with this value already exists',
    }));
  });

  it('should default to 500 for unknown errors', () => {
    const error = new Error('Generic failure');
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Internal Server Error',
    }));
  });
});