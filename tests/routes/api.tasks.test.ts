import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import { createLoaderArgs, createActionArgs } from '../helpers';

// Mock the database module
vi.mock('~/db', () => ({
  createTask: vi.fn(),
  getTasks: vi.fn(),
  getTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
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

import { loader, action } from '~/routes/api.tasks';
import * as db from '~/db';

function createRequest(method: string, url: string, body?: unknown): Request {
  const options: RequestInit = { method };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { 'Content-Type': 'application/json' };
  }
  return new Request(url, options);
}

describe('API Tasks Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return tasks for a user when userId is provided', async () => {
      const mockTasks = [[1, 1, 'Task 1', 'Desc', 0, '2024-01-01']];
      vi.mocked(db.getTasks).mockResolvedValue(ok(mockTasks));

      const request = createRequest('GET', 'http://localhost/api/tasks?userId=1');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockTasks);
    });

    it('should return a single task when id is provided', async () => {
      const mockTask = [1, 1, 'Task 1', 'Desc', 0, '2024-01-01'];
      vi.mocked(db.getTask).mockResolvedValue(ok(mockTask));

      const request = createRequest('GET', 'http://localhost/api/tasks?id=1');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockTask);
    });

    it('should return error when neither userId nor id is provided', async () => {
      const request = createRequest('GET', 'http://localhost/api/tasks');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Missing required parameter');
    });

    it('should return 405 for non-GET requests', async () => {
      const request = createRequest('POST', 'http://localhost/api/tasks');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(405);
      const body = await response.json();
      expect(body.error).toBe('Method not allowed');
    });

    it('should handle database errors', async () => {
      vi.mocked(db.getTasks).mockResolvedValue(err({
        type: 'DATABASE_ERROR',
        message: 'Connection failed',
      }));

      const request = createRequest('GET', 'http://localhost/api/tasks?userId=1');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(500);
    });

    it('should prefer taskId over userId when both provided', async () => {
      const mockTask = [1, 1, 'Task 1', 'Desc', 0, '2024-01-01'];
      vi.mocked(db.getTask).mockResolvedValue(ok(mockTask));

      const request = createRequest('GET', 'http://localhost/api/tasks?id=1&userId=2');
      await loader(createLoaderArgs(request));

      expect(db.getTask).toHaveBeenCalledWith(1);
      expect(db.getTasks).not.toHaveBeenCalled();
    });
  });

  describe('action', () => {
    describe('create action', () => {
      it('should create a task with valid data', async () => {
        const mockTask = [1, 1, 'New Task', 'Desc', 0, '2024-01-01'];
        vi.mocked(db.createTask).mockResolvedValue(ok(mockTask));

        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'create',
          userId: 1,
          title: 'New Task',
          description: 'Desc',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      it('should create a task without description', async () => {
        const mockTask = [1, 1, 'New Task', '', 0, '2024-01-01'];
        vi.mocked(db.createTask).mockResolvedValue(ok(mockTask));

        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'create',
          userId: 1,
          title: 'New Task',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
      });

      it('should return validation error for missing userId', async () => {
        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'create',
          title: 'New Task',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });

      it('should return validation error for missing title', async () => {
        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'create',
          userId: 1,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });

      it('should return validation error for empty title', async () => {
        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'create',
          userId: 1,
          title: '',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('toggle action', () => {
      it('should toggle task completion to true', async () => {
        const mockTask = [1, 1, 'Task', 'Desc', 1, '2024-01-01'];
        vi.mocked(db.updateTask).mockResolvedValue(ok(mockTask));

        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'toggle',
          id: 1,
          completed: true,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        expect(db.updateTask).toHaveBeenCalledWith(1, undefined, undefined, true);
      });

      it('should toggle task completion to false', async () => {
        const mockTask = [1, 1, 'Task', 'Desc', 0, '2024-01-01'];
        vi.mocked(db.updateTask).mockResolvedValue(ok(mockTask));

        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'toggle',
          id: 1,
          completed: false,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        expect(db.updateTask).toHaveBeenCalledWith(1, undefined, undefined, false);
      });

      it('should default to false when completed is not a boolean', async () => {
        const mockTask = [1, 1, 'Task', 'Desc', 0, '2024-01-01'];
        vi.mocked(db.updateTask).mockResolvedValue(ok(mockTask));

        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'toggle',
          id: 1,
          completed: 'true', // string instead of boolean
        });
        await action(createActionArgs(request));

        expect(db.updateTask).toHaveBeenCalledWith(1, undefined, undefined, false);
      });

      it('should return error for missing id', async () => {
        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'toggle',
          completed: true,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('Missing required field');
      });
    });

    describe('delete action', () => {
      it('should delete a task', async () => {
        vi.mocked(db.deleteTask).mockResolvedValue(ok({ success: true }));

        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'delete',
          id: 1,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      it('should return error for missing id', async () => {
        const request = createRequest('POST', 'http://localhost/api/tasks', {
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
        const request = createRequest('POST', 'http://localhost/api/tasks', {
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
        const request = createRequest('GET', 'http://localhost/api/tasks');
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(405);
      });
    });

    describe('error handling', () => {
      it('should handle JSON parse errors', async () => {
        const request = new Request('http://localhost/api/tasks', {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(500);
      });

      it('should handle database errors', async () => {
        vi.mocked(db.deleteTask).mockResolvedValue(err({
          type: 'DATABASE_ERROR',
          message: 'Database error',
        }));

        const request = createRequest('POST', 'http://localhost/api/tasks', {
          action: 'delete',
          id: 1,
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(500);
      });
    });
  });
});
