# Propane

Materialized TypeScript types.
Compile your types to runtime classes providing structural equality,
immutability, and serialization.

## Features

- **Type-Safe Classes** - Full TypeScript support with generated types
- **Immutable Data Structures** - All updates return new instances
- **Structural Equality** - Compare objects by value with `equals()`
- **Fluent API** - Chainable setters and mutation methods for collections
- **Compact Serialization** - Efficient format for transportation
- **Ease of Use** - Define plain TypeScript types; use natural syntax for
working with immutable instances
- **Performance** - Optimized for efficient use in large web applications

## Quick Example

**Define a type** in `person.propane`:

```typescript
// @message
export type Person = {
  id: number;
  name: string;
  email?: string;
};
```

**Use the generated class**:

```typescript
import { Person } from './person.propane.js';

// Create
const alice = new Person({
  id: 1,
  name: 'Alice',
});

// Update (returns new instance)
const updated = alice.setName('Alice Smith').setEmail('alice@example.com');

// Serialize
const serialized = updated.serialize(); // outputs a string

// Deserialize
const restored = Person.deserialize(serialized);

// Compare
console.log(updated.equals(restored));  // true
```

## Installation

```bash
# Runtime dependencies
npm i @propanejs/runtime

# Development dependencies (CLI)
npm i -D @propanejs/cli

# Optional: React integration
npm i @propanejs/react

# Optional: RPC server/client
npm i @propanejs/pms-server @propanejs/pms-client
```

## Compile Propane Files

```bash
npx propanec src/models
```

This compiles all `.propane` files to `.propane.ts` files.

You can also watch for changes:

```bash
npx propanec src/models --watch
```

## Documentation

- [Getting Started](./docs/getting-started.md) - Installation, compilation, and basic usage
- [Writing Propane Files](./docs/propane-files.md) - Type syntax, field numbers, and supported types
- [React Integration](./docs/react-integration.md) - Using Propane with React state management
- [Propane Message System](./docs/pms.md) - RPC framework for client-server communication

## Packages

| Package | Description |
|---------|-------------|
| `@propanejs/runtime` | Core runtime classes (Message, ImmutableArray, etc.) |
| `@propanejs/cli` | CLI for compiling `.propane` files |
| `@propanejs/react` | React hooks and utilities |
| `@propanejs/pms-core` | PMS shared types and errors |
| `@propanejs/pms-server` | PMS RPC server |
| `@propanejs/pms-client` | PMS RPC client |

## License

MIT
