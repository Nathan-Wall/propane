# Getting Started

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

## Quick Example

**Define a type** in `person.pmsg`:

```typescript
import { Message } from '@propanejs/runtime';

export type Person = Message<{
  id: number;
  name: string;
  email?: string;
}>;
```

**Compile propane files**:

```bash
npx propanec src/models
```

This compiles all `.pmsg` files to `.pmsg.ts` files.

You can also watch for changes:

```bash
npx propanec src/models --watch
```

## Configuration File (`propane.config.json`)

For projects with more complex compilation needs, or to avoid long command-line arguments, you can use a `propane.config.json` file in your project's root directory. This file allows you to define default values for `propanec` options.

**Example `propane.config.json`:**
```json
{
  "include": ["src/models", "shared/types"],
  "outputDir": "dist/generated",
  "watch": false
}
```

When `propanec` is run without arguments, it will automatically look for `propane.config.json` and use the settings defined there. Command-line arguments always take precedence over values in the configuration file.

### Configuration Options:

*   **`include`**: An array of file paths or directories to compile. Similar to providing positional arguments to `propanec`. (e.g., `["src/models"]`)
*   **`outputDir`**: A string specifying the root directory where generated `.pmsg.ts` files should be placed. The original directory structure of the source files will be preserved within this output directory. (e.g., `"dist/generated"`)
*   **`watch`**: A boolean. If `true`, `propanec` will run in watch mode, regenerating files when changes are detected. Equivalent to `--watch` CLI flag.

**Use the generated class**:

```typescript
import { Person } from './person.pmsg.js';

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

## File Naming

- Source: `person.pmsg`
- Generated: `person.pmsg.ts` (or `.js` after TypeScript compilation)

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

## Next Steps

- [Writing Propane Files](./propane-files.md) - Type syntax and supported types
- [Validators Guide](./validators-guide.md) - Data validation with built-in and custom validators
- [React Integration](./react-integration.md) - Using Propane with React
- [Propane Message System](./pms.md) - RPC framework for client-server communication
