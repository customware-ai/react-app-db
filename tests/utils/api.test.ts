import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import { createApiResponse } from '~/utils/api';
import type { DatabaseError, ValidationError, NotFoundError } from '~/types/errors';

// Mock logger to avoid console output
vi.mock('~/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('createApiResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success responses', () => {
    it('should return 200 with success true for ok result', async () => {
      const data = { id: 1, name: 'Test' };
      const result = ok(data);
      const response = createApiResponse(result);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ success: true, data });
    });

    it('should handle null data', async () => {
      const result = ok(null);
      const response = createApiResponse(result);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ success: true, data: null });
    });

    it('should handle array data', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = ok(data);
      const response = createApiResponse(result);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ success: true, data });
    });
  });

  describe('error responses', () => {
    it('should return 500 for database error', async () => {
      const error: DatabaseError = {
        type: 'DATABASE_ERROR',
        message: 'Connection failed',
      };
      const result = err(error);
      const response = createApiResponse(result);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.errors[0].type).toBe('DATABASE_ERROR');
      expect(body.errors[0].message).toBe('Connection failed');
    });

    it('should return 400 for validation error', async () => {
      const error: ValidationError = {
        type: 'VALIDATION_ERROR',
        field: 'email',
        message: 'Invalid email',
      };
      const result = err(error);
      const response = createApiResponse(result);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.errors[0].type).toBe('VALIDATION_ERROR');
      expect(body.errors[0].field).toBe('email');
    });

    it('should return 404 for not found error', async () => {
      const error: NotFoundError = {
        type: 'NOT_FOUND',
        resource: 'User',
        id: 1,
        message: 'User not found',
      };
      const result = err(error);
      const response = createApiResponse(result);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.errors[0].type).toBe('NOT_FOUND');
    });

    it('should handle array of errors', async () => {
      const errors: ValidationError[] = [
        { type: 'VALIDATION_ERROR', field: 'name', message: 'Name required' },
        { type: 'VALIDATION_ERROR', field: 'email', message: 'Invalid email' },
      ];
      const result = err(errors);
      const response = createApiResponse(result);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.errors).toHaveLength(2);
    });

    it('should include field in formatted error when present', async () => {
      const error: ValidationError = {
        type: 'VALIDATION_ERROR',
        field: 'email',
        message: 'Invalid',
      };
      const result = err(error);
      const response = createApiResponse(result);

      const body = await response.json();
      expect(body.errors[0].field).toBe('email');
    });

    it('should not include field when not present in error', async () => {
      const error: DatabaseError = {
        type: 'DATABASE_ERROR',
        message: 'Error',
      };
      const result = err(error);
      const response = createApiResponse(result);

      const body = await response.json();
      expect(body.errors[0].field).toBeUndefined();
    });
  });
});
