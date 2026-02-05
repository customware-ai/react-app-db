# Template for React Router App with Tailwind CSS and SQLite

**This is a code style and architecture template repository.** Use this as a reference for coding patterns, project structure, and development standards when building production applications. The template demonstrates best practices through an ERP-style application structure built with React Router v7, TypeScript, Tailwind CSS, and sql.js.

> **⚠️ Important**: This is a **template repository** showcasing code patterns and styles, not a functional application. Use it to understand the coding standards, architectural patterns, and file organization for your own projects.

> **Required reading**: Review [AGENTS.md](./AGENTS.md) before development for coding patterns, commands, and project conventions.

## 📋 What This Template Provides

### ✅ Use This Template For:

- **Code Style Reference** - See how to structure TypeScript, React, and Tailwind code
- **Architecture Patterns** - Learn proper separation of concerns (db → services → routes → components)
- **Type Safety Examples** - Understand neverthrow Result pattern and Zod validation
- **UI Component Library** - Reusable, tested components with consistent styling
- **Database Patterns** - Migration system, CRUD operations, proper abstraction
- **Project Organization** - File structure for scalable applications

### ❌ This Template Does NOT Provide:

- A working, feature-complete application
- Production-ready business logic (focus is on code patterns, not business features)
- A starter project to deploy as-is (adapt patterns to your own requirements)

### 💡 How to Use This Template:

1. **Study the code patterns** in components, services, and routes
2. **Copy the architectural structure** for your own project
3. **Adapt the UI components** to your design system
4. **Follow the coding standards** demonstrated throughout
5. **Reference AGENTS.md** for development commands and conventions

## 🔍 What's Working vs What's a Pattern

### ✅ Fully Functional (Study These):

- **Customer CRUD** - Complete create, read, update, delete operations
- **Database Layer** - Full migration system and persistence
- **Component Library** - All UI components are functional and tested
- **Type Safety** - Complete Zod schemas and Result patterns
- **Layout System** - Sidebar navigation, responsive design

### 📐 Pattern Examples Only (Non-Functional):

- **Most Action Buttons** - Demonstrate UI patterns, not actual features
- **Leads, Quotes, Orders** - Show data display patterns with demo data
- **Invoices, Payments** - Illustrate accounting UI patterns
- **Reports, Charts** - Template for report generation interfaces

> **Key Insight**: The working Customer module shows the **complete pattern** from database to UI. Other modules show **UI patterns** you can implement following the same architectural approach.

## Template Features & Patterns

This template demonstrates:

- **Modern Stack**: React Router v7.13 with SSR, Vite 8, TypeScript strict mode
- **Type Safety**: Zod v4 schemas + neverthrow Result pattern for error handling
- **Database Layer**: SQLite via sql.js with proper abstraction and migration system
- **UI Patterns**: Tailwind CSS v4 with professional custom theme and reusable components
- **Code Quality**: Type-aware linting (oxlint), comprehensive testing setup
- **Architecture**: Clean separation of concerns (db, services, schemas, routes, components)

## Tech Stack

| Package      | Version       | Purpose                    |
| ------------ | ------------- | -------------------------- |
| react-router | 7.13.0        | Full-stack React framework |
| vite         | 8.0.0-beta.12 | Build tool                 |
| tailwindcss  | 4.1.18        | Styling                    |
| zod          | 4.3.6         | Schema validation          |
| neverthrow   | 8.2.0         | Type-safe error handling   |
| vitest       | 4.0.x         | Testing framework          |
| oxlint       | 1.x           | Type-aware linting         |
| sql.js       | 1.13.0        | SQLite in JavaScript       |

## 🎨 Design

- **Color Palette**: Emerald green (primary) + Slate gray (surface)
- **Typography**: Work Sans (400, 500, 600, 700)
- **Style**: Industrial precision, professional enterprise-grade UI
- **NO generic AI aesthetics** - Distinctive, purposeful design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run database migrations (demonstrates migration pattern)
npm run migrate

# Build production bundle
npm run build
```

> **Note**: Many UI buttons are intentionally non-functional - they exist to demonstrate component patterns and design system. Focus on the **code structure, patterns, and styling** rather than feature completeness.

## 📁 Project Structure

```
app/
├── components/
│   ├── layout/          # Sidebar, TopBar, PageLayout, PageHeader
│   ├── ui/              # Table, Modal, Tabs, Select, StatusBadge, etc.
│   └── sales/           # Sales-specific components
├── routes/
│   ├── dashboard.tsx    # Main dashboard
│   ├── sales/           # Sales & CRM routes (customers, leads, quotes)
│   └── accounting/      # Accounting routes (invoices, payments, reports)
├── services/
│   └── erp.ts           # ERP business logic & CRUD operations
├── schemas/
│   ├── sales.ts         # Sales entity validation (Zod)
│   └── accounting.ts    # Accounting entity validation (Zod)
├── db-migrations/
│   ├── migrate.ts       # Migration system (uses db.ts)
│   ├── 001-erp-schema.ts # ERP database schema
│   └── run-migrations.ts # Migration runner
├── utils/
│   ├── calculations.ts  # Financial calculations
│   └── json.ts          # JSON response helper
└── db.ts                # Database layer (sql.js) - ONLY file for filesystem
```

## 🗄️ Database Architecture

### ✅ Using sql.js

- **In-memory SQLite with file persistence**
- All database operations go through `db.ts`
- **db.ts is the ONLY file that writes to filesystem**
- Never use better-sqlite3 or direct filesystem access

### Tables Implemented

**Sales & CRM:**

- `customers` - Customer records with contact info
- `contacts` - Multiple contacts per customer
- `leads` - Sales pipeline and prospect tracking
- `opportunities` - Deal tracking with probability
- `quotes` & `quote_items` - Quotations with line items
- `sales_orders` & `sales_order_items` - Confirmed orders
- `activities` - CRM activity log (calls, meetings, tasks)

**Accounting & Finance:**

- `chart_of_accounts` - Account hierarchy (assets, liabilities, equity, revenue, expenses)
- `invoices` & `invoice_items` - Customer invoices with line items
- `payments` - Payment records linked to invoices
- `journal_entries` & `journal_entry_lines` - Manual accounting entries
- `ledger` - General ledger (transaction history per account)
- `bank_accounts` - Bank account details

### Database Persistence

The database persists to `database.db` in the project root.

**On startup:**

- If `database.db` exists, it's loaded into memory
- If not, migrations create a new database with tables

**On mutations:**

- Every create/update/delete calls `saveDatabase()`
- Data survives server restarts

**To reset:**

```bash
rm database.db
npm run migrate
npm run dev
```

## 📝 Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start development server             |
| `npm run build`     | Production build                     |
| `npm run start`     | Start production server              |
| `npm run migrate`   | Run database migrations              |
| `npm run typecheck` | TypeScript type checking             |
| `npm run lint`      | Type-aware linting with oxlint       |
| `npm test`          | Run all tests                        |
| `npm run check`     | Run typecheck, lint, build, and test |

## 🔧 Development Guidelines

### Database Operations

```typescript
// ✅ CORRECT - Use db.ts
import { getDatabase } from "./db";
const { db } = await getDatabase();
```

**NEVER:**

- Import better-sqlite3
- Write to filesystem directly
- Bypass db.ts

### Service Layer

```typescript
// All business logic goes in services/
import { getCustomers, createCustomer } from "./services/erp";

// Uses Result<T, Error> pattern (neverthrow)
const result = await getCustomers();
if (result.isOk()) {
  const customers = result.value;
} else {
  const error = result.error;
}
```

### Result Pattern

Always use neverthrow's Result pattern for error handling:

```typescript
const result = await createCustomer(data);
if (result.isOk()) {
  const customer = result.value;
  // Success path
} else {
  console.error(result.error.message);
  // Error path
}
```

### Schema Validation

Validate all input with Zod before database operations:

```typescript
import { CreateCustomerSchema } from "./schemas/sales";

const validation = CreateCustomerSchema.safeParse(data);
if (!validation.success) {
  return err(new Error("Validation failed"));
}

// Now safe to use validated data
const result = await createCustomer(validation.data);
```

### Single Responsibility

- **db.ts**: Database & filesystem only
- **services/erp.ts**: Business logic & CRUD
- **schemas/**: Validation rules (Zod)
- **utils/**: Pure utilities
- **components/**: UI only
- **routes/**: Page components with loaders/actions

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run check        # Full check (includes tests)
```

### Test Coverage

Tests cover:

- UI components (Button, Card, Input, Badge, Alert, Table, Modal, Select)
- Database CRUD operations (customers, invoices)
- API routes (loaders and actions)
- ERP service layer (business logic)
- Validation with Zod schemas

All tests use Vitest and React Testing Library.

## 🏗️ Template Structure Examples

The template uses an ERP-style structure to demonstrate patterns for complex applications:

### Sales & CRM Module (Pattern Examples)

- **Customers** - Demonstrates full CRUD with form validation, table views, detail pages
- **Leads** - Shows Kanban board pattern, state management, view toggles
- **Quotes** - Illustrates list/filter patterns, status badges, empty states
- **Orders** - Template for order/transaction workflows

### Accounting & Finance Module (Pattern Examples)

- **Chart of Accounts** - Hierarchical data display, tree navigation patterns
- **Invoices** - List views with filtering, sorting, search patterns
- **Payments** - Table patterns with data transformations
- **Journal Entries** - Double-entry pattern example
- **Ledger** - Transaction history display pattern
- **Reports** - Report generation UI patterns

### Dashboard (Layout Pattern)

- Metric card patterns with trends
- Chart placeholder patterns
- Summary table displays
- Quick action card patterns

## 🔒 Important Rules

These rules are demonstrated throughout the codebase. Follow them in your own projects:

1. **Single Responsibility** - db.ts is the ONLY file that writes to filesystem
2. **Error Handling** - Use Result pattern, no throwing exceptions in business logic
3. **Input Validation** - Validate with Zod before database operations
4. **Type Safety** - Full TypeScript with strict mode, explicit return types
5. **Code Documentation** - Comment the "why", not the "what"
6. **Test Coverage** - Write tests for business logic and components
7. **Component Patterns** - Reusable, composable UI components
8. **Consistent Styling** - Follow the Tailwind patterns demonstrated

## 📖 Documentation

- **README.md** - This file (project overview)
- **AGENTS.md** - Agent coordination and development patterns
- Code comments throughout codebase

## 🚦 Type Safety

This project enforces strict TypeScript and linting:

- **Explicit return types** on all functions
- **No `any` types** - use `unknown` or specific types
- **Type-aware linting** with oxlint
- **Schema validation** with Zod at runtime

Run `npm run check` to verify all checks pass before committing.

---

**A template for building with industrial precision** 🏭

> Remember: This is a **code pattern reference**, not a working application. Study the patterns, adapt the architecture, and build your own production-ready features following these standards.
