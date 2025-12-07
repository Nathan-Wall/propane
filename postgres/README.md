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

Use the `Table<{...}>` wrapper in your `.pmsg` files to mark types as database tables:

```typescript
// user.pmsg
import { Table, PK, Auto, Index, Unique, Json } from '@propanejs/postgres';

export type User = Table<{
  '1:id': PK<Auto<bigint>>;        // BIGSERIAL PRIMARY KEY
  '2:email': Unique<string>;        // TEXT UNIQUE
  '3:name': string;                 // TEXT NOT NULL
  '4:createdAt': Index<Date>;       // TIMESTAMPTZ with index
  '5:metadata'?: Json<UserMeta>;    // JSONB, nullable
}>;
```

Types wrapped with `Table<{...}>` are transformed into runtime classes (like `Message<T>`) and also generate PostgreSQL schema.

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

**Option 1: Generated repositories** (recommended)

Generate repository classes from your `.pmsg` files:

```bash
npx ppg generate --repositories --output-dir ./src/generated
```

Then use the generated repository:

```typescript
import { UserRepository } from './generated/user-repository';

const users = new UserRepository(pool);
```

**Option 2: Manual configuration**

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
```

**Repository operations:**

```typescript
// Create
const user = await users.create({
  email: 'alice@example.com',
  name: 'Alice',
  createdAt: new Date(),
});

// Create many
const newUsers = await users.createMany([
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
]);

// Find by ID
const found = await users.findById(1n);

// Find by multiple IDs
const batch = await users.findByIds([1n, 2n, 3n]);

// Find one matching condition
const admin = await users.findOne({ email: 'admin@example.com' });

// Find many with conditions
const admins = await users.findMany({
  email: { endsWith: '@company.com' },
  createdAt: { gte: new Date('2024-01-01') },
});

// Find all records
const allUsers = await users.findAll();

// Partial field selection
const emails = await users.findMany(
  { name: { contains: 'alice' } },
  { select: ['id', 'email'] }
);

// Update by ID
const updated = await users.update(1n, { name: 'Alice Smith' });

// Update many
const count = await users.updateMany(
  { active: false },  // where
  { deletedAt: new Date() }  // data
);

// Delete by ID
const deleted = await users.delete(1n);

// Delete many
const deletedCount = await users.deleteMany({ active: false });

// Count records
const total = await users.count();
const activeCount = await users.count({ active: true });

// Check existence
const exists = await users.exists({ email: 'alice@example.com' });

// Upsert (insert or update on conflict)
const upserted = await users.upsert(
  { email: 'alice@example.com', name: 'Alice' },
  ['email']  // conflict keys
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

### Type-Level Wrappers
| Type | Description |
|------|-------------|
| `Table<{...}>` | Marks a type as a database table (transforms like `Message<T>`) |

### Field-Level Wrappers
| Type | PostgreSQL | Description |
|------|------------|-------------|
| `PK<T>` | `PRIMARY KEY` | Marks field as primary key |
| `Auto<T>` | `SERIAL/BIGSERIAL` | Auto-increment (use inside `PK<>`) |
| `Index<T>` | Creates index | B-tree index on field |
| `Unique<T>` | `UNIQUE` | Unique constraint |
| `Normalize<T[]>` | Separate table | Normalize array into related table |
| `Json<T>` | `JSONB` | Force JSONB storage |
| `FK<T>` | `REFERENCES` | Foreign key to another table |

### Foreign Keys

Use `FK<T>` to create foreign key relationships:

```typescript
import { Table, PK, Auto, FK } from '@propanejs/postgres';

export type Post = Table<{
  '1:id': PK<Auto<bigint>>;
  '2:title': string;
  '3:authorId': FK<User>;              // References users(id)
  '4:categoryId': FK<Category, 'code'>; // References categories(code)
}>;
```

The column type is automatically inferred from the referenced table's primary key.

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

### Decimal Type

Use `decimal<Precision, Scale>` for exact numeric values (e.g., money):

```typescript
import { Table, PK, Auto } from '@propanejs/postgres';
import { decimal } from '@propanejs/postgres';

export type Product = Table<{
  '1:id': PK<Auto<bigint>>;
  '2:name': string;
  '3:price': decimal<10, 2>;    // NUMERIC(10,2) - up to $99,999,999.99
  '4:weight': decimal<8, 4>;    // NUMERIC(8,4) - e.g., 1234.5678 kg
}>;
```

Decimal values are serialized as strings to preserve precision.

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

# Generate schema and repository classes
npx ppg generate --repositories --output-dir ./src/generated

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

### Repository Generation

The `--repositories` flag generates typed repository classes:

```bash
npx ppg generate --repositories --output-dir ./src/generated
```

This creates repository files like:

```typescript
// generated/user-repository.ts
import { BaseRepository } from '@propanejs/postgres';
import type { User } from '../models/user.pmsg';

export class UserRepository extends BaseRepository<User & Record<string, unknown>> {
  constructor(connection: Connection | Pool, schemaName = 'public') {
    super(connection, {
      tableName: 'users',
      schemaName,
      primaryKey: 'id',
      columns: ['id', 'email', 'name', 'created_at'],
      columnTypes: { id: 'BIGINT', email: 'TEXT', name: 'TEXT', created_at: 'TIMESTAMPTZ' },
    });
  }
}
```

Usage:

```typescript
import { UserRepository } from './generated/user-repository';

const users = new UserRepository(pool);
const user = await users.findById(1n);
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

## Schema Introspection

The package can introspect an existing PostgreSQL database to compare against your `.pmsg` schema:

```typescript
import { createPool, introspectDatabase, compareSchemas } from '@propanejs/postgres';

const pool = createPool({ ... });

// Read current database schema
const currentSchema = await introspectDatabase(pool, 'public');

// Compare with desired schema (from .pmsg files)
const diff = compareSchemas(currentSchema, desiredSchema);

if (diff.hasChanges) {
  console.log('Tables to create:', diff.tablesToCreate);
  console.log('Tables to drop:', diff.tablesToDrop);
  console.log('Tables to alter:', diff.tablesToAlter);
}
```

The `ppg diff` command does this automatically:

```bash
npx ppg diff
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
