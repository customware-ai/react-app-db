import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import { createLoaderArgs, createActionArgs } from '../helpers';

// Mock the database module
vi.mock('~/db', () => ({
  getUsers: vi.fn(),
  getAllTasks: vi.fn(),
  createUserDirect: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  createTaskDirect: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import { loader, action } from '~/routes/home';
import * as db from '~/db';

function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return formData;
}

function createFormRequest(method: string, data: Record<string, string>): Request {
  const formData = createFormData(data);
  return new Request('http://localhost/', {
    method,
    body: formData,
  });
}

describe('Home Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return users and tasks on success', async () => {
      const mockUsers = [[1, 'John', 'john@example.com', '2024-01-01']];
      const mockTasks = { 1: [[1, 1, 'Task 1', 'Desc', 0, '2024-01-01']] };

      vi.mocked(db.getUsers).mockResolvedValue(ok(mockUsers));
      vi.mocked(db.getAllTasks).mockResolvedValue(ok(mockTasks));

      const request = new Request('http://localhost/');
      const result = await loader(createLoaderArgs(request));

      expect(result.users).toEqual(mockUsers);
      expect(result.tasks).toEqual(mockTasks);
      expect(result.error).toBeUndefined();
    });

    it('should return empty arrays and error when getUsers fails', async () => {
      vi.mocked(db.getUsers).mockResolvedValue(err({
        type: 'DATABASE_ERROR',
        message: 'Failed to get users',
      }));

      const request = new Request('http://localhost/');
      const result = await loader(createLoaderArgs(request));

      expect(result.users).toEqual([]);
      expect(result.tasks).toEqual({});
      expect(result.error).toBe('Failed to get users');
    });

    it('should return users and error when getAllTasks fails', async () => {
      const mockUsers = [[1, 'John', 'john@example.com', '2024-01-01']];

      vi.mocked(db.getUsers).mockResolvedValue(ok(mockUsers));
      vi.mocked(db.getAllTasks).mockResolvedValue(err({
        type: 'DATABASE_ERROR',
        message: 'Failed to get tasks',
      }));

      const request = new Request('http://localhost/');
      const result = await loader(createLoaderArgs(request));

      expect(result.users).toEqual(mockUsers);
      expect(result.tasks).toEqual({});
      expect(result.error).toBe('Failed to get tasks');
    });
  });

  describe('action', () => {
    describe('create user', () => {
      it('should create a user with valid data', async () => {
        const mockUser = [1, 'John', 'john@example.com', '2024-01-01'];
        vi.mocked(db.createUserDirect).mockResolvedValue(ok(mockUser));

        const request = createFormRequest('POST', {
          action: 'create',
          name: 'John',
          email: 'john@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body).toEqual(mockUser);
      });

      it('should return error for missing name', async () => {
        const request = createFormRequest('POST', {
          action: 'create',
          email: 'john@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('Missing required fields');
      });

      it('should return error for missing email', async () => {
        const request = createFormRequest('POST', {
          action: 'create',
          name: 'John',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });

      it('should handle database errors', async () => {
        vi.mocked(db.createUserDirect).mockResolvedValue(err({
          type: 'DATABASE_ERROR',
          message: 'Duplicate email',
        }));

        const request = createFormRequest('POST', {
          action: 'create',
          name: 'John',
          email: 'john@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(500);
      });
    });

    describe('update user', () => {
      it('should update a user with valid data', async () => {
        const mockUser = [1, 'Updated', 'updated@example.com', '2024-01-01'];
        vi.mocked(db.updateUser).mockResolvedValue(ok(mockUser));

        const request = createFormRequest('POST', {
          action: 'update',
          id: '1',
          name: 'Updated',
          email: 'updated@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
      });

      it('should return error for missing id', async () => {
        const request = createFormRequest('POST', {
          action: 'update',
          name: 'Updated',
          email: 'updated@example.com',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('delete user', () => {
      it('should delete a user', async () => {
        vi.mocked(db.deleteUser).mockResolvedValue(ok({ success: true }));

        const request = createFormRequest('POST', {
          action: 'delete',
          id: '1',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      it('should return error for missing id', async () => {
        const request = createFormRequest('POST', {
          action: 'delete',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('create task', () => {
      it('should create a task with valid data', async () => {
        const mockTask = [1, 1, 'New Task', 'Desc', 0, '2024-01-01'];
        vi.mocked(db.createTaskDirect).mockResolvedValue(ok(mockTask));

        const request = createFormRequest('POST', {
          action: 'create_task',
          userId: '1',
          title: 'New Task',
          description: 'Desc',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(201);
      });

      it('should create a task without description', async () => {
        const mockTask = [1, 1, 'New Task', '', 0, '2024-01-01'];
        vi.mocked(db.createTaskDirect).mockResolvedValue(ok(mockTask));

        const request = createFormRequest('POST', {
          action: 'create_task',
          userId: '1',
          title: 'New Task',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(201);
        expect(db.createTaskDirect).toHaveBeenCalledWith(1, 'New Task', '');
      });

      it('should return error for missing userId', async () => {
        const request = createFormRequest('POST', {
          action: 'create_task',
          title: 'New Task',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });

      it('should return error for missing title', async () => {
        const request = createFormRequest('POST', {
          action: 'create_task',
          userId: '1',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('toggle task', () => {
      it('should toggle task to completed', async () => {
        const mockTask = [1, 1, 'Task', 'Desc', 1, '2024-01-01'];
        vi.mocked(db.updateTask).mockResolvedValue(ok(mockTask));

        const request = createFormRequest('POST', {
          action: 'toggle_task',
          id: '1',
          completed: 'true',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        expect(db.updateTask).toHaveBeenCalledWith(1, undefined, undefined, true);
      });

      it('should toggle task to not completed', async () => {
        const mockTask = [1, 1, 'Task', 'Desc', 0, '2024-01-01'];
        vi.mocked(db.updateTask).mockResolvedValue(ok(mockTask));

        const request = createFormRequest('POST', {
          action: 'toggle_task',
          id: '1',
          completed: 'false',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
        expect(db.updateTask).toHaveBeenCalledWith(1, undefined, undefined, false);
      });

      it('should return error for missing id', async () => {
        const request = createFormRequest('POST', {
          action: 'toggle_task',
          completed: 'true',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('delete task', () => {
      it('should delete a task', async () => {
        vi.mocked(db.deleteTask).mockResolvedValue(ok({ success: true }));

        const request = createFormRequest('POST', {
          action: 'delete_task',
          id: '1',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(200);
      });

      it('should return error for missing id', async () => {
        const request = createFormRequest('POST', {
          action: 'delete_task',
        });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(400);
      });
    });

    describe('invalid action', () => {
      it('should return error for invalid action', async () => {
        const request = createFormRequest('POST', {
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
        const request = new Request('http://localhost/', { method: 'GET' });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(405);
      });

      it('should return 405 for PUT requests', async () => {
        const request = new Request('http://localhost/', { method: 'PUT' });
        const response = await action(createActionArgs(request));

        expect(response.status).toBe(405);
      });
    });
  });
});
