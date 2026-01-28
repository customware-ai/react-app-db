import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import { createLoaderArgs, createActionArgs } from '../helpers';

// Mock the database module
vi.mock('~/db', () => ({
  createUser: vi.fn(),
  getUsers: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock the logger
vi.mock('~/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { loader, action } from '~/routes/api.users';
import * as db from '~/db';

function createRequest(method: string, url: string, body?: unknown): Request {
  const options: RequestInit = { method };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { 'Content-Type': 'application/json' };
  }
  return new Request(url, options);
}

describe('API Users Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return all users when no id is provided', async () => {
      const mockUsers = [[1, 'John', 'john@example.com', '2024-01-01']];
      vi.mocked(db.getUsers).mockResolvedValue(ok(mockUsers));

      const request = createRequest('GET', 'http://localhost/api/users');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockUsers);
    });

    it('should return a single user when id is provided', async () => {
      const mockUser = [1, 'John', 'john@example.com', '2024-01-01'];
      vi.mocked(db.getUser).mockResolvedValue(ok(mockUser));

      const request = createRequest('GET', 'http://localhost/api/users?id=1');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockUser);
    });

    it('should return 405 for non-GET requests', async () => {
      const request = createRequest('POST', 'http://localhost/api/users');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(405);
      const body = await response.json();
      expect(body.error).toBe('Method not allowed');
    });

    it('should handle database errors', async () => {
      vi.mocked(db.getUsers).mockResolvedValue(err({
        type: 'DATABASE_ERROR',
        message: 'Connection failed',
      }));

      const request = createRequest('GET', 'http://localhost/api/users');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });

  describe('action', () => {
    describe('create action', () => {
      it('should create a user with valid data', async () => {
        const mockUser = [1, 'John', 'john@example.com', '2024-01-01'];
        vi.mocked(db.createUser).mockResolvedValue(ok(mockUser));

        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'create',
          name: 'John',
          email: 'john@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      it('should return validation error for invalid data', async () => {
        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'create',
          name: '',
          email: 'invalid-email',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
      });

      it('should return validation error for missing fields', async () => {
        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'create',
          name: 'John',
          // missing email
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('update action', () => {
      it('should update a user with valid data', async () => {
        const mockUser = [1, 'Updated', 'updated@example.com', '2024-01-01'];
        vi.mocked(db.updateUser).mockResolvedValue(ok(mockUser));

        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'update',
          id: 1,
          name: 'Updated',
          email: 'updated@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      it('should return error for missing id', async () => {
        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'update',
          name: 'Updated',
          email: 'updated@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('Missing required fields');
      });

      it('should return error for missing name', async () => {
        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'update',
          id: 1,
          email: 'updated@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });

      it('should return error for missing email', async () => {
        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'update',
          id: 1,
          name: 'Updated',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('delete action', () => {
      it('should delete a user', async () => {
        vi.mocked(db.deleteUser).mockResolvedValue(ok({ success: true }));

        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'delete',
          id: 1,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      it('should return error for missing id', async () => {
        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'delete',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('Missing required field');
      });
    });

    describe('invalid action', () => {
      it('should return error for invalid action', async () => {
        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'invalid',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Invalid action');
      });
    });

    describe('method validation', () => {
      it('should return 405 for non-POST requests', async () => {
        const request = createRequest('GET', 'http://localhost/api/users');
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(405);
      });

      it('should return 405 for PUT requests', async () => {
        const request = createRequest('PUT', 'http://localhost/api/users');
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(405);
      });
    });

    describe('error handling', () => {
      it('should handle JSON parse errors', async () => {
        const request = new Request('http://localhost/api/users', {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(500);
      });

      it('should handle database errors', async () => {
        vi.mocked(db.deleteUser).mockResolvedValue(err({
          type: 'DATABASE_ERROR',
          message: 'Database error',
        }));

        const request = createRequest('POST', 'http://localhost/api/users', {
          action: 'delete',
          id: 1,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(500);
      });
    });
  });
});
