import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

// Create a test-specific database module
let testDb: Database | null = null;
let testSQL: SqlJsStatic | null = null;

async function getTestDatabase(): Promise<{ db: Database; SQL: SqlJsStatic }> {
  if (!testSQL) {
    testSQL = await initSqlJs();
  }
  if (!testDb) {
    testDb = new testSQL.Database();
    // Initialize tables
    testDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    testDb.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }
  return { db: testDb, SQL: testSQL };
}

function resetTestDatabase(): void {
  if (testDb) {
    testDb.run('DELETE FROM tasks');
    testDb.run('DELETE FROM users');
    testDb.run("DELETE FROM sqlite_sequence WHERE name='users'");
    testDb.run("DELETE FROM sqlite_sequence WHERE name='tasks'");
  }
}

describe('Database Operations', () => {
  beforeEach(async () => {
    await getTestDatabase();
    resetTestDatabase();
  });

  afterEach(() => {
    resetTestDatabase();
  });

  describe('User CRUD Operations', () => {
    it('should create a user', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['John Doe', 'john@example.com']);
      const result = db.exec("SELECT * FROM users WHERE email = 'john@example.com'");

      expect(result).toHaveLength(1);
      expect(result[0].values).toHaveLength(1);
      expect(result[0].values[0][1]).toBe('John Doe');
      expect(result[0].values[0][2]).toBe('john@example.com');
    });

    it('should get all users', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['User 1', 'user1@example.com']);
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['User 2', 'user2@example.com']);

      const result = db.exec("SELECT * FROM users ORDER BY id");

      expect(result[0].values).toHaveLength(2);
    });

    it('should get a single user by id', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['Test User', 'test@example.com']);

      const result = db.exec("SELECT * FROM users WHERE id = 1");

      expect(result[0].values[0][1]).toBe('Test User');
    });

    it('should update a user', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['Old Name', 'old@example.com']);
      db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", ['New Name', 'new@example.com', 1]);

      const result = db.exec("SELECT * FROM users WHERE id = 1");

      expect(result[0].values[0][1]).toBe('New Name');
      expect(result[0].values[0][2]).toBe('new@example.com');
    });

    it('should delete a user', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['To Delete', 'delete@example.com']);
      db.run("DELETE FROM users WHERE id = 1");

      const result = db.exec("SELECT * FROM users WHERE id = 1");

      expect(result).toHaveLength(0);
    });

    it('should not allow duplicate emails', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['User 1', 'same@example.com']);

      expect(() => {
        db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['User 2', 'same@example.com']);
      }).toThrow();
    });

    it('should return empty array when no users exist', async () => {
      const { db } = await getTestDatabase();
      const result = db.exec("SELECT * FROM users");

      expect(result).toHaveLength(0);
    });

    it('should return null for non-existent user', async () => {
      const { db } = await getTestDatabase();
      const result = db.exec("SELECT * FROM users WHERE id = 999");

      expect(result).toHaveLength(0);
    });
  });

  describe('Task CRUD Operations', () => {
    beforeEach(async () => {
      const { db } = await getTestDatabase();
      // Create a test user for task operations
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['Test User', 'test@example.com']);
    });

    it('should create a task', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Test Task', 'Description']);

      const result = db.exec("SELECT * FROM tasks WHERE user_id = 1");

      expect(result[0].values).toHaveLength(1);
      expect(result[0].values[0][2]).toBe('Test Task');
    });

    it('should get tasks for a user', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Task 1', 'Desc 1']);
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Task 2', 'Desc 2']);

      const result = db.exec("SELECT * FROM tasks WHERE user_id = 1");

      expect(result[0].values).toHaveLength(2);
    });

    it('should get a single task by id', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Single Task', 'Desc']);

      const result = db.exec("SELECT * FROM tasks WHERE id = 1");

      expect(result[0].values[0][2]).toBe('Single Task');
    });

    it('should update task completion status', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Task', 'Desc']);
      db.run("UPDATE tasks SET completed = ? WHERE id = ?", [1, 1]);

      const result = db.exec("SELECT * FROM tasks WHERE id = 1");

      expect(result[0].values[0][4]).toBe(1); // completed column
    });

    it('should update task title and description', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Old Title', 'Old Desc']);
      db.run("UPDATE tasks SET title = ?, description = ? WHERE id = ?", ['New Title', 'New Desc', 1]);

      const result = db.exec("SELECT * FROM tasks WHERE id = 1");

      expect(result[0].values[0][2]).toBe('New Title');
      expect(result[0].values[0][3]).toBe('New Desc');
    });

    it('should delete a task', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'To Delete', 'Desc']);
      db.run("DELETE FROM tasks WHERE id = 1");

      const result = db.exec("SELECT * FROM tasks WHERE id = 1");

      expect(result).toHaveLength(0);
    });

    it('should delete all tasks when user is deleted', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Task 1', 'Desc']);
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'Task 2', 'Desc']);

      db.run("DELETE FROM tasks WHERE user_id = 1");
      db.run("DELETE FROM users WHERE id = 1");

      const result = db.exec("SELECT * FROM tasks WHERE user_id = 1");

      expect(result).toHaveLength(0);
    });

    it('should return empty array when user has no tasks', async () => {
      const { db } = await getTestDatabase();
      const result = db.exec("SELECT * FROM tasks WHERE user_id = 1");

      expect(result).toHaveLength(0);
    });

    it('should group tasks by user_id', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO users (name, email) VALUES (?, ?)", ['User 2', 'user2@example.com']);
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'User 1 Task', 'Desc']);
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [2, 'User 2 Task', 'Desc']);

      const user1Tasks = db.exec("SELECT * FROM tasks WHERE user_id = 1");
      const user2Tasks = db.exec("SELECT * FROM tasks WHERE user_id = 2");

      expect(user1Tasks[0].values).toHaveLength(1);
      expect(user2Tasks[0].values).toHaveLength(1);
    });

    it('should create task with default completed status of 0', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [1, 'New Task', 'Desc']);

      const result = db.exec("SELECT completed FROM tasks WHERE id = 1");

      expect(result[0].values[0][0]).toBe(0);
    });
  });

  describe('Database Export', () => {
    it('should export database as Uint8Array', async () => {
      const { db } = await getTestDatabase();
      const exported = db.export();

      expect(exported).toBeInstanceOf(Uint8Array);
      expect(exported.length).toBeGreaterThan(0);
    });
  });
});
