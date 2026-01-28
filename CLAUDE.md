# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **For project overview**: See [README.md](./README.md) for features, architecture details, and documentation.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run typecheck    # TypeScript checking + React Router typegen
npm run lint         # Type-aware linting with oxlint
npm test             # Run all tests with Vitest
npm run check        # Run typecheck + lint + build + test (full validation)
```

To run a single test file:

```bash
npx vitest run tests/db/db.test.ts
```

## Architecture

This is a full-stack React Router v7 application with SQLite (sql.js) persistence.

## Development Requirements

- **Strict types with schemas**: Always define and use Zod schemas for data validation. Derive TypeScript types from schemas using `z.infer<>`.
- **Write tests for changes**: Any code changes must include corresponding tests in the `tests/` directory.
- **Run checks after every task**: After completing any `task`, run `npm run check` to validate typecheck, lint, build, and tests all pass.

### Key Patterns

#### Error Handling with neverthrow

All database operations in `app/db.ts` return `Result<T, E>` types from neverthrow. Check results with `.isErr()` / `.isOk()` before accessing values. Error types are defined in `app/types/errors.ts`.

```typescript
import { Result, ok, err } from 'neverthrow';
import type { DatabaseError } from './types/errors';

export async function getRecords(): Promise<Result<SqlValue[][], DatabaseError>> {
  try {
    const { db } = await getDatabase();
    const result = db.exec("SELECT * FROM my_table");
    return ok(result[0]?.values || []);
  } catch (error) {
    return err({
      type: 'DATABASE_ERROR',
      message: 'Failed to fetch records',
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

// Usage in loaders
const result = await getRecords();
if (result.isErr()) {
  return { data: [], error: result.error.message };
}
return { data: result.value };
```

#### Schema Validation with Zod

Zod schemas in `app/schemas/index.ts` define data types. Use `z.infer<typeof Schema>` for type inference.

```typescript
import { z } from 'zod';

export const RecordSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  created_at: z.string().optional(),
});

export type Record = z.infer<typeof RecordSchema>;
```

#### Database

sql.js runs SQLite in JavaScript with file persistence to `database.db`. Every mutation calls `saveDatabase()` to persist changes. Define your tables in `app/db.ts`. If `database.db` is not present, treat this as a new project—tables are created on first run without migrations.

#### React Router

Routes in `app/routes/` use loaders for data fetching and actions for mutations.

**Loaders** - Server-side data fetching:

```typescript
export async function loader(_args: LoaderFunctionArgs): Promise<LoaderData> {
  const result = await getRecords();
  if (result.isErr()) {
    return { data: [], error: result.error.message };
  }
  return { data: result.value };
}
```

**Actions** - Server-side mutations:

```typescript
export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  const formData = await request.formData();
  const name = getFormString(formData, "name");

  if (!name) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await createRecord(name);
  if (result.isErr()) {
    return json({ error: result.error.message }, { status: 500 });
  }
  return json(result.value, { status: 201 });
}
```

**useFetcher** - Non-destructive form submissions:

```typescript
const fetcher = useFetcher();
void fetcher.submit(
  { action: "create", ...formData },
  { method: "post" }
);
```

### Directory Structure

- `app/components/ui/` - Reusable UI components (Button, Card, Input, Badge, Alert)
- `app/routes/` - Page components and API endpoints
- `app/db.ts` - Database operations with Result types
- `app/schemas/` - Zod validation schemas
- `app/types/` - TypeScript type definitions
- `app/utils/` - Helper functions (api, json, logger, validate)
- `tests/` - Vitest tests organized by category

### Linting Rules

oxlint enforces:

- `typescript/explicit-function-return-type`: Required on all functions
- `typescript/no-explicit-any`: No `any` types allowed
- `react/jsx-key`: Keys required in JSX lists

### Path Alias

Use `~/` to import from `app/` directory (e.g., `import { Button } from '~/components/ui/Button'`).
