# Writing Propane Files

## Basic Syntax

```typescript
export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;       // Optional field
};
```

## Field Numbers

**Recommended:** You can specify field numbers for more robust serialization.
This is helpful for large projects where requirements are fluid and migrations
are necessary. Serialization and deserialization will match against field
numbers instead of field names, allowing field names to be changed more easily
as the project develops. This also enables compact serialization for smaller
message sizes.

```typescript
export type User = {
  '1:id': number;
  '2:name': string;
  '3:email': string;
  '4:role'?: string;       // Optional field
};
```

## Supported Types

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

## Nested Messages

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

## Inline Objects

Inline object types are auto-generated as nested classes:

```typescript
export type Order = {
  '1:item': { name: string; price: number };
};
```

Generates class accessible as `Order.Item`.

## Collections

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
team = team.popMembers();
team = team.spliceMembers(0, 1, 'Dave');

// Map methods
team = team.setScoresEntry('Alice', 100);
team = team.deleteScoresEntry('Alice');
team = team.mergeScoresEntries([['Bob', 90]]);

// Set methods
team = team.addTags('important');
team = team.deleteTags('important');
```

## Complex Map Keys

Maps support complex keys with structural equality:

```typescript
export type Cache = {
  data: Map<Date, string>;                // Date keys
  coords: Map<[number, number], string>;  // Tuple keys
};
```
