import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validate } from './validate';
import { z } from 'zod';

describe('validate Middleware', () => {
  const schema = z.object({
    name: z.string().min(3),
    age: z.number().int(),
  });

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
  });

  it('should call next() when data is valid and update request object', () => {
    mockRequest = { body: { name: 'John Doe', age: 30 } };
    const middleware = validate(schema, 'body');
    
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({ name: 'John Doe', age: 30 });
  });

  it('should return 400 when validation fails', () => {
    mockRequest = { body: { name: 'Jo', age: 'not-a-number' } };
    const middleware = validate(schema, 'body');

    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should validate query parameters if source is set to query', () => {
    mockRequest = { query: { name: 'Valid Name', age: 25 } };
    const middleware = validate(schema, 'query');

    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});
