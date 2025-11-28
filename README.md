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

### Field Numbers

**Recommended:** You can also specify field numbers.
This can be helpful for large projects where requirements are fluid and
migrations are necessary.
Serialization and deserialization will match against field numbers instead of
field names, allowing field names to be changed more easily as the project
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

## React Integration

Propane provides first-class React support via `@propanejs/react`.

### Comparison: React vs Immer vs Propane

Here's how updating nested state compares across different approaches:

**State shape:**
```typescript
type State = {
  user: {
    profile: {
      name: string;
      settings: {
        theme: 'light' | 'dark';
        notifications: boolean;
      };
    };
    posts: { id: number; title: string; likes: number }[];
  };
};
```

#### Native React

Manual spreading at every level - verbose and error-prone:

```typescript
const [state, setState] = useState<State>(initialState);

// Update deeply nested field
const toggleTheme = () => {
  setState(prev => ({
    ...prev,
    user: {
      ...prev.user,
      profile: {
        ...prev.user.profile,
        settings: {
          ...prev.user.profile.settings,
          theme: prev.user.profile.settings.theme === 'light' ? 'dark' : 'light',
        },
      },
    },
  }));
};

// Update item in nested array
const likePost = (postId: number) => {
  setState(prev => ({
    ...prev,
    user: {
      ...prev.user,
      posts: prev.user.posts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ),
    },
  }));
};
```

#### Immer

Mutable syntax via proxy - cleaner but requires `produce` wrapper:

```typescript
import { useImmer } from 'use-immer';

const [state, setState] = useImmer<State>(initialState);

// Update deeply nested field
const toggleTheme = () => {
  setState(draft => {
    const theme = draft.user.profile.settings.theme;
    draft.user.profile.settings.theme = theme === 'light' ? 'dark' : 'light';
  });
};

// Update item in nested array
const likePost = (postId: number) => {
  setState(draft => {
    const post = draft.user.posts.find(p => p.id === postId);
    if (post) post.likes++;
  });
};
```

#### Propane

Fluent setters with automatic change propagation:

```typescript
import { usePropaneState, update } from '@propanejs/react';

const [state] = usePropaneState<State>(initialState);

// Update deeply nested field - changes propagate automatically
const toggleTheme = () => {
  const current = state.user.profile.settings.theme;
  update(() => state.user.profile.settings.setTheme(current === 'light' ? 'dark' : 'light'));
};

// Update item in nested array
const likePost = (postId: number) => {
  const post = state.user.posts.find(p => p.id === postId);
  if (post) update(() => post.setLikes(post.likes + 1));
};
```

#### Key Differences

| Aspect | Native React | Immer | Propane |
|--------|--------------|-------|---------|
| Syntax | Spread at every level | Mutable-style writes | Fluent setters |
| Boilerplate | High | Low | Low |
| Type safety | Manual | Good | Full |
| Structural equality | Manual | Reference only | Built-in `equals()` |
| Serialization | Manual | Manual | Built-in |
| Change propagation | Manual | Automatic | Automatic |

### Installation

```bash
npm i @propanejs/react
```

### Basic Usage

Use `usePropaneState` to manage Propane messages as React state:

```typescript
import { usePropaneState, update } from '@propanejs/react';
import { AppState } from './types.propane.ts';

function App() {
  const [state] = usePropaneState<AppState>(
    new AppState({
      count: 0,
      items: [],
    })
  );

  const increment = () => {
    update(() => state.setCount(state.count + 1));
  };

  return <button onClick={increment}>{state.count}</button>;
}
```

### The `update()` Function

Propane setters only trigger React re-renders when called inside `update()`:

```typescript
// Triggers React re-render
update(() => state.setName('Alice'));

// Multiple setters are batched into a single render
update(() => {
  state.setName('Alice');
  state.setEmail('alice@example.com');
});

// Chained setters work too
update(() => state.setName('Alice').setEmail('alice@example.com'));

// Outside update(): returns new instance but NO re-render
state.setName('Bob'); // React state unchanged
```

Async callbacks are also supported:

```typescript
await update(async () => {
  const data = await fetchData();
  state.setData(data);
});
```

### Deep Updates

Changes to nested objects automatically propagate through the state tree.
When you modify a nested message or collection, parent components re-render:

```typescript
// types.propane
export type GameState = {
  '1:history': BoardState[];
  '2:currentMove': number;
};

export type BoardState = {
  '1:cells': Cell[];
};
```

```typescript
// Updating nested array triggers re-render
update(() => {
  const newCells = currentBoard.cells.set(index, 'X');
  const newBoard = new BoardState({ cells: newCells });
  game.setHistory(game.history.push(newBoard));
});
```

### Memoization with `memoPropane`

Use `memoPropane` instead of `React.memo` for components receiving Propane props.
It uses structural equality via `equals()` to prevent unnecessary re-renders:

```typescript
import { memoPropane } from '@propanejs/react';

const TodoItem = memoPropane(({ todo }: { todo: Todo }) => {
  return <li>{todo.text}</li>;
});
```

### Detaching State

Use `detach()` when passing Propane data to contexts where you don't want
updates to propagate back to React state:

```typescript
// Pass detached copy to prevent accidental state updates
<ChildComponent data={state.detach()} />

// Useful when sending data to external systems
sendToAnalytics(state.detach());
```

### Complete Example

```typescript
import { usePropaneState, update, memoPropane } from '@propanejs/react';
import { GameState, BoardState } from './types.propane.ts';

const Square = memoPropane(({ value, onClick }: SquareProps) => (
  <button onClick={onClick}>{value}</button>
));

function Game() {
  const [game] = usePropaneState<GameState>(
    new GameState({
      history: [new BoardState({ cells: Array(9).fill(null) })],
      currentMove: 0,
    })
  );

  const currentBoard = game.history.get(game.currentMove)!;

  const handlePlay = (index: number) => {
    const newCells = currentBoard.cells.set(index, 'X');
    const newBoard = new BoardState({ cells: newCells });
    const newHistory = game.history.push(newBoard);

    update(() => {
      game.setHistory(newHistory).setCurrentMove(game.currentMove + 1);
    });
  };

  const jumpTo = (move: number) => {
    update(() => game.setCurrentMove(move));
  };

  return (
    <div>
      <Board cells={currentBoard.cells} onPlay={handlePlay} />
      <History moves={game.history} current={game.currentMove} onJump={jumpTo} />
    </div>
  );
}
```

## License

MIT
