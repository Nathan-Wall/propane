# @propanejs/postgres

PostgreSQL storage for Propane messages with analyst-friendly tables, type-safe queries, and declarative migrations.

## Features

- **Analyst-friendly tables**: Messages are stored in normalized tables, not blobs
- **Type-safe queries**: Where clause builder with full TypeScript support
- **Declarative migrations**: Prisma-style schema diffing with automatic SQL generation
- **Branch isolation**: Use PostgreSQL schemas for feature branch isolation
- **Partial field selection**: Only fetch the columns you need

## Installation

```bash
npm install @propanejs/postgres postgres
```

## Quick Start

### Define your schema

Use wrapper types in your `.pmsg` files to configure database storage:

```typescript
// user.pmsg
import { PK, Auto, Index, Unique } from '@propanejs/postgres';

// @message @table
export type User = {
  '1:id': PK<Auto<bigint>>;        // BIGSERIAL PRIMARY KEY
  '2:email': Unique<string>;        // TEXT UNIQUE
  '3:name': string;                 // TEXT NOT NULL
  '4:createdAt': Index<Date>;       // TIMESTAMPTZ with index
  '5:metadata'?: Json<UserMeta>;    // JSONB, nullable
};
```

### Connect to the database

```typescript
import { createPool } from '@propanejs/postgres';

const pool = createPool({
  host: 'localhost',
  database: 'myapp',
  user: 'postgres',
  password: 'secret',
});
```

### Use repositories

```typescript
import { BaseRepository } from '@propanejs/postgres';

const users = new BaseRepository<User>(pool, {
  tableName: 'users',
  primaryKey: 'id',
  columns: ['id', 'email', 'name', 'created_at', 'metadata'],
  columnTypes: {
    id: 'BIGINT',
    email: 'TEXT',
    name: 'TEXT',
    created_at: 'TIMESTAMPTZ',
    metadata: 'JSONB',
  },
});

// Create
const user = await users.create({
  email: 'alice@example.com',
  name: 'Alice',
  createdAt: new Date(),
});

// Find by ID
const found = await users.findById(1n);

// Query with conditions
const admins = await users.findMany({
  email: { endsWith: '@company.com' },
  createdAt: { gte: new Date('2024-01-01') },
});

// Partial field selection
const emails = await users.findMany(
  { name: { contains: 'alice' } },
  { select: ['id', 'email'] }
);
```

### Transactions

```typescript
import { withTransaction } from '@propanejs/postgres';

await withTransaction(pool, async (tx) => {
  const user = await users.create({ ... }, { connection: tx });
  await orders.create({ userId: user.id, ... }, { connection: tx });
});
```

## Wrapper Types

| Type | PostgreSQL | Description |
|------|------------|-------------|
| `PK<T>` | `PRIMARY KEY` | Marks field as primary key |
| `Auto<T>` | `SERIAL/BIGSERIAL` | Auto-increment (use inside `PK<>`) |
| `Index<T>` | Creates index | B-tree index on field |
| `Unique<T>` | `UNIQUE` | Unique constraint |
| `Table<T[]>` | Separate table | Store array in related table |
| `Json<T>` | `JSONB` | Force JSONB storage |

## Scalar Types

| Type | PostgreSQL | Description |
|------|------------|-------------|
| `int32` | `INTEGER` | 32-bit signed integer |
| `bigint` | `BIGINT` | 64-bit signed integer |
| `number` | `DOUBLE PRECISION` | 64-bit float |
| `decimal<P,S>` | `NUMERIC(P,S)` | Arbitrary precision |
| `string` | `TEXT` | Variable-length text |
| `boolean` | `BOOLEAN` | True/false |
| `Date` | `TIMESTAMPTZ` | Timestamp with timezone |
| `URL` | `TEXT` | Stored as string |
| `ArrayBuffer` | `BYTEA` | Binary data |

## Where Clause Operators

```typescript
// Equality
{ name: 'Alice' }              // name = 'Alice'
{ name: { eq: 'Alice' } }      // name = 'Alice'
{ name: { neq: 'Bob' } }       // name != 'Bob'

// Comparison
{ age: { gt: 18 } }            // age > 18
{ age: { gte: 21 } }           // age >= 21
{ age: { lt: 65 } }            // age < 65
{ age: { lte: 100 } }          // age <= 100
{ age: { between: [18, 65] } } // age BETWEEN 18 AND 65

// Lists
{ status: { in: ['active', 'pending'] } }
{ status: { notIn: ['deleted'] } }

// Pattern matching
{ name: { like: 'A%' } }       // LIKE (case-sensitive)
{ name: { ilike: '%alice%' } } // ILIKE (case-insensitive)
{ name: { contains: 'ali' } }  // ILIKE '%ali%'
{ name: { startsWith: 'A' } }  // ILIKE 'A%'
{ email: { endsWith: '.com' } }// ILIKE '%.com'

// Null checks
{ deletedAt: null }            // deleted_at IS NULL
{ deletedAt: { isNull: true } }// deleted_at IS NULL
{ deletedAt: { isNull: false }}// deleted_at IS NOT NULL

// Logical operators
{ AND: [{ age: { gte: 18 } }, { active: true }] }
{ OR: [{ status: 'active' }, { status: 'pending' }] }
{ NOT: { deleted: true } }
```

## CLI Commands

The `ppg` CLI helps manage your database schema:

```bash
# Generate schema from .pmsg files
npx ppg generate

# Show diff between database and schema
npx ppg diff

# Create a migration
npx ppg migrate:create "add user email index"

# Apply pending migrations
npx ppg migrate:up

# Rollback last migration
npx ppg migrate:down

# Branch management (for feature branch isolation)
npx ppg branch:create feature/new-auth
npx ppg branch:clone main feature/new-auth
npx ppg branch:drop feature/new-auth
npx ppg branch:list
```

## Configuration

Create `propane-pg.config.ts` in your project root:

```typescript
export default {
  connection: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432'),
    database: process.env.DB_NAME ?? 'myapp',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
  },
  schema: {
    defaultSchema: 'public',
  },
  migration: {
    directory: './migrations',
    tableName: '_propane_migrations',
  },
  codegen: {
    outputDir: './generated',
  },
  pmsgFiles: ['./src/**/*.pmsg'],
};
```

## Branch Isolation

Use PostgreSQL schemas for feature branch isolation:

```typescript
import { createSchemaManager } from '@propanejs/postgres';

const schemas = createSchemaManager(pool);

// Create schema for feature branch
await schemas.createBranch('feature/new-auth');
// Creates PostgreSQL schema: feature_new_auth

// Clone data from main
await schemas.cloneBranch('main', 'feature/new-auth');

// Use branch schema
const branchPool = pool.withSchema('feature_new_auth');

// Clean up when merged
await schemas.dropBranch('feature/new-auth');
```

## Migration System

The migration system uses field numbers for reliable rename detection:

```typescript
// Before: field number 2 is 'name'
export type User = {
  '1:id': PK<bigint>;
  '2:name': string;        // Field number 2
};

// After: field number 2 is renamed to 'fullName'
export type User = {
  '1:id': PK<bigint>;
  '2:fullName': string;    // Same field number = rename detected
};
```

Generated migration:

```sql
-- Up
ALTER TABLE users RENAME COLUMN name TO full_name;

-- Down
ALTER TABLE users RENAME COLUMN full_name TO name;
```

## License

ISC
