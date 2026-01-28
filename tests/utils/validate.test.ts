import { describe, it, expect } from 'vitest';
import { validate } from '~/utils/validate';
import { CreateUserSchema, CreateTaskSchema, UserSchema } from '~/schemas';

describe('validate utility', () => {
  describe('with CreateUserSchema', () => {
    it('should return ok for valid user data', () => {
      const data = { name: 'John Doe', email: 'john@example.com' };
      const result = validate(CreateUserSchema, data);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(data);
      }
    });

    it('should return err for missing name', () => {
      const data = { email: 'john@example.com' };
      const result = validate(CreateUserSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveLength(1);
        expect(result.error[0].type).toBe('VALIDATION_ERROR');
        expect(result.error[0].field).toBe('name');
      }
    });

    it('should return err for missing email', () => {
      const data = { name: 'John Doe' };
      const result = validate(CreateUserSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveLength(1);
        expect(result.error[0].type).toBe('VALIDATION_ERROR');
        expect(result.error[0].field).toBe('email');
      }
    });

    it('should return err for invalid email format', () => {
      const data = { name: 'John Doe', email: 'invalid-email' };
      const result = validate(CreateUserSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.some((e) => e.field === 'email')).toBe(true);
      }
    });

    it('should return err for empty name', () => {
      const data = { name: '', email: 'john@example.com' };
      const result = validate(CreateUserSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.some((e) => e.field === 'name')).toBe(true);
      }
    });

    it('should return err for name exceeding max length', () => {
      const data = { name: 'a'.repeat(101), email: 'john@example.com' };
      const result = validate(CreateUserSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.some((e) => e.field === 'name')).toBe(true);
      }
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const data = { name: '', email: 'invalid' };
      const result = validate(CreateUserSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('with CreateTaskSchema', () => {
    it('should return ok for valid task data', () => {
      const data = {
        user_id: 1,
        title: 'Test Task',
        description: 'Test description',
      };
      const result = validate(CreateTaskSchema, data);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.title).toBe('Test Task');
        expect(result.value.user_id).toBe(1);
      }
    });

    it('should return ok for task without description', () => {
      const data = { user_id: 1, title: 'Test Task' };
      const result = validate(CreateTaskSchema, data);

      expect(result.isOk()).toBe(true);
    });

    it('should return err for missing user_id', () => {
      const data = { title: 'Test Task' };
      const result = validate(CreateTaskSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.some((e) => e.field === 'user_id')).toBe(true);
      }
    });

    it('should return err for missing title', () => {
      const data = { user_id: 1 };
      const result = validate(CreateTaskSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.some((e) => e.field === 'title')).toBe(true);
      }
    });

    it('should return err for empty title', () => {
      const data = { user_id: 1, title: '' };
      const result = validate(CreateTaskSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.some((e) => e.field === 'title')).toBe(true);
      }
    });

    it('should return err for title exceeding max length', () => {
      const data = { user_id: 1, title: 'a'.repeat(201) };
      const result = validate(CreateTaskSchema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.some((e) => e.field === 'title')).toBe(true);
      }
    });
  });

  describe('with UserSchema', () => {
    it('should return ok for complete user data', () => {
      const data = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };
      const result = validate(UserSchema, data);

      expect(result.isOk()).toBe(true);
    });

    it('should return ok for user without optional fields', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      const result = validate(UserSchema, data);

      expect(result.isOk()).toBe(true);
    });
  });
});
