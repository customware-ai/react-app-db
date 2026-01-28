# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**Error Handling**: All database operations in `app/db.ts` return `Result<T, E>` types from neverthrow. Check results with `.isErr()` / `.isOk()` before accessing values. Error types are defined in `app/types/errors.ts`.

**Schema Validation**: Zod schemas in `app/schemas/index.ts` define User and Task types. Use `z.infer<typeof Schema>` for type inference.

**Database**: sql.js runs SQLite in JavaScript with file persistence to `database.db`. Every mutation calls `saveDatabase()` to persist changes. Tables: `users` (id, name, email, created_at), `tasks` (id, user_id, title, description, completed, created_at).

**React Router**: Routes in `app/routes/` use loaders for data fetching and actions for mutations. The `useFetcher` hook handles form submissions.

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
