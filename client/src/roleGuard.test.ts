import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { Response, NextFunction } from 'express';
import { requireRoles, UserRole } from './roleGuard';
import { AuthenticatedRequest } from './authMiddleware';
import { AppError } from '../../../shared/errors/AppError';

describe('roleGuard Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockResponse = {};
    nextFunction = vi.fn();
  });

  it('should allow access if user has required role', () => {
    mockRequest = {
      user: { id: '1', role: 'ADMIN' } as any
    };
    const guard = requireRoles(['ADMIN']);

    guard(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should allow access if user has one of several allowed roles', () => {
    mockRequest = {
      user: { id: '1', role: 'VENDOR' } as any
    };
    const guard = requireRoles(['ADMIN', 'VENDOR']);

    guard(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should pass AppError(403) to next if user role is not allowed', () => {
    mockRequest = {
      user: { id: '1', role: 'CUSTOMER' } as any
    };
    const guard = requireRoles(['ADMIN']);

    guard(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    const error = (nextFunction as unknown as MockedFunction<NextFunction>).mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });
});