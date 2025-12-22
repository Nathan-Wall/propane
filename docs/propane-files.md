# Writing Propane Files

## The Message Wrapper

Types in `.pmsg` files must be wrapped with `Message<{...}>` to be transformed into
runtime classes. Import `Message` from `@propane/runtime`:

```typescript
import { Message } from '@propane/runtime';

export type User = Message<{
  id: number;
  name: string;
}>;
```

Types without `Message<{...}>` wrapper remain as plain TypeScript type aliases:

```typescript
// No wrapper - remains a type alias
export type UserId = number;

// Union types without wrapper are also left as-is
export type Status = 'active' | 'inactive';
```

## Basic Syntax

```typescript
import { Message } from '@propane/runtime';

export type User = Message<{
  id: number;
  name: string;
  email: string;
  role?: string;       // Optional field
}>;
```

## Field Numbers

**Recommended:** You can specify field numbers for more robust serialization.
This is helpful for large projects where requirements are fluid and migrations
are necessary. Serialization and deserialization will match against field
numbers instead of field names, allowing field names to be changed more easily
as the project develops. This also enables compact serialization for smaller
message sizes.

```typescript
import { Message } from '@propane/runtime';

export type User = Message<{
  '1:id': number;
  '2:name': string;
  '3:email': string;
  '4:role'?: string;       // Optional field
}>;
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
| **Validators** | `Positive<number>` | See [Validators Guide](./validators-guide.md) |

## Nested Messages

```typescript
import { Message } from '@propane/runtime';

export type Address = Message<{
  '1:street': string;
  '2:city': string;
}>;

export type Person = Message<{
  '1:name': string;
  '2:address': Address;
}>;
```

## Inline Objects

Inline object types are auto-generated as nested classes:

```typescript
import { Message } from '@propane/runtime';

export type Order = Message<{
  '1:item': { name: string; price: number };
}>;
```

Generates class accessible as `Order.Item`.

## Collections

```typescript
import { Message } from '@propane/runtime';

export type Team = Message<{
  '1:members': string[];                    // Array
  '2:scores': Map<string, number>;          // Map
  '3:tags': Set<string>;                    // Set
}>;
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
import { Message } from '@propane/runtime';

export type Cache = Message<{
  data: Map<Date, string>;                // Date keys
  coords: Map<[number, number], string>;  // Tuple keys
}>;
```

## Reserved Field Names

The following field names are reserved and cannot be used because they would
collide with methods on the generated `Message` base class:

- `detach` - Creates a listener-free copy of the message
- `hashCode` - Returns a stable hash for use in collections
- `equals` - Compares structural equality with another value
- `serialize` - Converts the message to a string
- `toJSON` - JSON serialization support

Using these names will result in a compilation error.

Additionally, `$` is not an allowed character in Propane field names.

## Extending Generated Classes

Use `@extend` to add custom methods and computed properties to generated classes.
This lets you keep business logic alongside your data definitions.

### Creating an Extension

1. Add `@extend` to your type definition pointing to an extension file:

```typescript
// person.pmsg
import { Message } from '@propane/runtime';

// @extend('./person.pmsg.ext.ts')
export type Person = Message<{
  '1:firstName': string;
  '2:lastName': string;
  '3:age': number;
}>;
```

2. Create the extension file that extends the generated base class:

```typescript
// person.pmsg.ext.ts
import { Person$Base } from './person.pmsg.ts';

export class Person extends Person$Base {
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdult(): boolean {
    return this.age >= 18;
  }

  greet(): string {
    return `Hello, ${this.fullName}!`;
  }
}
```

### How It Works

When `@extend` is used:
- The generated file exports `Person$Base` instead of `Person`
- Your extension file exports `Person`, extending `Person$Base`
- All base functionality (setters, serialization, equality) is inherited
- Your custom methods and getters are available on the final class

### Using Extended Classes

```typescript
import { Person } from './person.pmsg.ext.js';

const person = new Person({
  firstName: 'Alice',
  lastName: 'Smith',
  age: 25,
});

console.log(person.fullName);   // "Alice Smith"
console.log(person.isAdult);    // true
console.log(person.greet());    // "Hello, Alice Smith!"

// All base methods still work
const older = person.setAge(30);
console.log(older.serialize());
```

### Rules

- Only one `@extend` decorator is allowed per type
- The extension file must export a class with the same name as the type
- The extension class must extend the `$Base` class from the generated file
