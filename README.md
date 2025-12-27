# SQLite Database Management App

A full-stack React Router application with SQLite database integration, demonstrating modern patterns for data loading, mutations, and persistence.

## Features

- 🚀 Server-side rendering with React Router v7
- 📊 SQLite database with file persistence (`database.db`)
- 📥 Server-side loaders for data fetching
- 📤 Server-side actions for mutations
- ⚡️ Automatic data revalidation after changes
- 🔄 Non-destructive form submissions with `useFetcher`
- 🔒 TypeScript by default

### Type checking

```bash
npm run typecheck
```

### Building for Production

Create a production build:

```bash
npm run build
```

## Architecture

### Database Layer (`app/db.ts`)

The application uses **sql.js** (SQLite in JavaScript) with persistent file storage.

The database persists to `database.db` in the project root. Data created during development will be saved and restored on server restart.

#### Tables

**Users Table:**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Tasks Table:**

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

#### Key Functions

- `getUsers()` - Fetch all users
- `createUser(name, email)` - Create a new user
- `updateUser(id, name, email)` - Update user details
- `deleteUser(id)` - Delete user and their tasks
- `getAllTasks()` - Fetch all tasks grouped by user
- `createTask(userId, title, description)` - Create a task
- `updateTask(id, title?, description?, completed?)` - Update task
- `deleteTask(id)` - Delete a task

All mutations automatically call `saveDatabase()` to persist changes to `database.db`.

## React Router Patterns

### Loaders

Server-side data fetching that runs before component renders. Use `useLoaderData()` in components to access data.

```typescript
export async function loader() {
  const users = await getUsers();
  return { users };
}

// In component:
const { users } = useLoaderData();
```

### Actions

Server-side mutations for create/update/delete. Automatically revalidates loaders on completion.

```typescript
export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "create") {
    return await createUser(...);
  }
}
```

### useFetcher

Non-destructive form submissions without navigation.

```typescript
const fetcher = useFetcher();
fetcher.submit({ action: "create", data }, { method: "post" });

// Check state: fetcher.state === "idle" | "submitting" | "loading"
```

## Database Persistence

The database persists to a `database.db` file in your project root.

**On startup:**

- If `database.db` exists, it's loaded into memory
- If not, a new database is created with tables

**On mutations:**

- Every create, update, delete operation calls `saveDatabase()`
- The in-memory database is exported and written to `database.db`
- Data survives server restarts

**To reset the database:**

```bash
rm database.db
npm run dev
```

## Project Structure

```
app/
├── db.ts           # Database CRUD operations
├── routes/
│   ├── home.tsx    # Main page with loader and action
│   ├── api.users.tsx
│   └── api.tasks.tsx
├── root.tsx        # Root layout
└── app.css         # Global styles

database.db        # Persistent SQLite database
```

---

Built with ❤️ using React Router and SQLite.
