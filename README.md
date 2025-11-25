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

## Getting Started

### Installation

```bash
npm i --save-dev propanejs
```

### Compile Propane Files

```bash
npx propanec src/models
```

This compiles all `.propane` files to `.propane.ts` files.

You can also watch for changes:

```bash
npx propanec src/models --watch
```

### File Naming

- Source: `person.propane`
- Generated: `person.propane.ts` (or `.js` after TypeScript compilation)

## Writing Propane Files

### Basic Syntax

```typescript
export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;       // Optional field
};
```

**Recommended:** You can also specify field numbers for each field.
This can be helpful for large codebases where different pieces may be updated
at different rates.
Serialization and deserialization will match against field numbers instead of
field names, allowing field namse to be changed more easily as the project
develops.
This also enables compact serialization for smaller message sizes.

```typescript
export type User = {
  '1:id': number;
  '2:name': string;
  '3:email': string;
  '4:role'?: string;       // Optional field
};
```

### Supported Types

| Type | Example | Notes |
|------|---------|-------|
| **Primitives** | `string`, `number`, `boolean`, `bigint` | |
| **Nullable** | `string \| null` | Explicit null support |
| **Optional** | `field?: string` | Generates delete method |
| **Date** | `Date` | Wrapped as `ImmutableDate` |
| **URL** | `URL` | Wrapped as `ImmutableUrl` |
| **ArrayBuffer** | `ArrayBuffer` | Wrapped as `ImmutableArrayBuffer` |
| **Arrays** | `string[]` | Wrapped as `ImmutableArray` |
| **Maps** | `Map<string, number>` | Wrapped as `ImmutableMap` |
| **Sets** | `Set<string>` | Wrapped as `ImmutableSet` |
| **Nested Messages** | `Address` | Reference other propane types |
| **Inline Objects** | `{ street: string }` | Auto-generates nested type |
| **Unions** | `Cat \| Dog` | Tagged for message unions |
| **String Literals** | `'admin' \| 'user'` | Enum-like validation |

### Nested Messages

```typescript
export type Address = {
  '1:street': string;
  '2:city': string;
};

export type Person = {
  '1:name': string;
  '2:address': Address;
};
```

### Collections

```typescript
export type Team = {
  '1:members': string[];                    // Array
  '2:scores': Map<string, number>;          // Map
  '3:tags': Set<string>;                    // Set
};
```

Generated mutation methods:

```typescript
let team = new Team({
  members: ['Alice'],
  scores: new Map(),
  tags: new Set(),
});

// Array methods
team = team.pushMembers('Bob', 'Carol');
team = team.potpMembers();
team = team.spliceMembers(0, 1, 'Dave');

// Map methods
team = team.setScoresEntry('Alice', 100);
team = team.deleteScoresEntry('Alice');
team = team.mergeScoresEntries([['Bob', 90]]);

// Set methods
team = team.addTags('important');
team = team.deleteTags('important');
```

## Generated API

Every generated class provides:

### Constructor

```typescript
new Person({ id: 1, name: 'Alice' })  // With values
new Person()                          // Default values (0, '', false, etc.)
```

### Getters

```typescript
person.id      // number
person.name    // string
person.email   // string | undefined
```

### Setters

```typescript
person.setId(2)           // Returns new Person
person.setName('Bob')     // Original unchanged
```

### Delete Methods (Optional Fields)

```typescript
person.deleteEmail()      // Returns new Person without email
```

### Serialization

```typescript
const str = person.serialize();           // Compact string
const restored = Person.deserialize(str); // Reconstruct
```

### Equality & Hashing

```typescript
person1.equals(person2)   // Deep structural equality
person.hashCode()         // Stable hash (Immutable.js compatible)
```

### Inline Objects

Inline object types are auto-generated as nested classes:

```typescript
export type Order = {
  '1:item': { name: string; price: number };
};
```

Generates class accessible as `Order.Item`.

### Complex Map Keys

Maps support complex keys with structural equality:

```typescript
export type Cache = {
  data: Map<Date, string>;                // Date keys
  coords: Map<[number, number], string>;  // Tuple keys
};
```

## License

MIT
