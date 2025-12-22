# React Integration

Propane provides first-class React support via `@propane/react`.

## Installation

```bash
npm i @propane/react
```

## Basic Usage

Use `usePropaneState` to manage Propane messages as React state:

```typescript
import { usePropaneState, update } from '@propane/react';
import { AppState } from './types.pmsg.ts';

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

## The `update()` Function

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

## Deep Updates

Changes to nested objects automatically propagate through the state tree.
When you modify a nested message or collection, parent components re-render:

```typescript
// types.pmsg
import { Message } from '@propane/runtime';

export type GameState = Message<{
  '1:history': BoardState[];
  '2:currentMove': number;
}>;

export type BoardState = Message<{
  '1:cells': Cell[];
}>;
```

```typescript
// Updating nested array triggers re-render
update(() => {
  // Modifying a deeply nested array works directly
  // currentBoard.cells is an ImmutableArray
  currentBoard.cells.set(index, 'X');

  // Pushing to an array also works directly
  game.history.push(newBoard);
});
```

## Selectors with `usePropaneSelector`

Use `usePropaneSelector` to derive values from state with automatic memoization.
The component only re-renders when the selected value changes (using structural equality):

```typescript
import { usePropaneState, usePropaneSelector, update } from '@propane/react';
import { AppState } from './types.pmsg.ts';

function UserName() {
  const [state] = usePropaneState<AppState>(initialState);

  // Only re-renders when user.name changes, not on other state changes
  const userName = usePropaneSelector(state, s => s.user.name);

  return <h1>{userName}</h1>;
}
```

### Computed Values

Selectors can compute derived values. Re-renders only happen when the result changes:

```typescript
function TodoStats() {
  const [state] = usePropaneState<AppState>(initialState);

  const completedCount = usePropaneSelector(state, s =>
    s.todos.filter(t => t.completed).length
  );

  const totalCount = usePropaneSelector(state, s => s.todos.length);

  return <p>{completedCount} of {totalCount} completed</p>;
}
```

### Selecting Objects

When selecting objects, Propane's structural equality prevents unnecessary re-renders:

```typescript
function SettingsPanel() {
  const [state] = usePropaneState<AppState>(initialState);

  // Re-renders only when settings content changes, not on reference changes
  const settings = usePropaneSelector(state, s => s.user.settings);

  return (
    <div>
      <p>Theme: {settings.theme}</p>
      <p>Notifications: {settings.notifications ? 'On' : 'Off'}</p>
    </div>
  );
}
```

## Memoization with `memoPropane`

Use `memoPropane` instead of `React.memo` for components receiving Propane props.
It uses structural equality via `equals()` to prevent unnecessary re-renders:

```typescript
import { memoPropane } from '@propane/react';

const TodoItem = memoPropane(({ todo }: { todo: Todo }) => {
  return <li>{todo.text}</li>;
});
```

## Detaching State

Propane's automatic update propagation is powerful, but sometimes you want to
pass data without allowing modifications to affect React state. Use `detach()`
to create a copy with all listeners removed:

```typescript
// Child can read but not update React state
<ReadOnlyView data={state.detach()} />

// Safe to pass to external systems
sendToAnalytics(state.detach());
saveToLocalStorage(state.detach());
```

### When to Use `detach()`

**Passing to read-only components:**

When a child component should display data but not modify it, pass a detached
copy. This prevents accidental state updates and makes the data flow explicit:

```typescript
function App() {
  const [state] = usePropaneState<AppState>(initialState);

  return (
    <div>
      {/* This component can modify state */}
      <Editor document={state.document} />

      {/* This component can only read - detached copy */}
      <Preview document={state.document.detach()} />
    </div>
  );
}
```

**Sending to external systems:**

When passing data to analytics, logging, or storage systems, detach first to
ensure those systems can't accidentally trigger React updates:

```typescript
const handleSave = () => {
  // Detach before sending to external API
  api.saveDocument(state.document.detach());
};

const handleExport = () => {
  // Detach before serializing for download
  const json = JSON.stringify(state.detach());
  downloadFile(json, 'backup.json');
};
```

**Extracting data for local computation:**

When you need to process data without affecting state:

```typescript
const handleAnalyze = () => {
  // Work with a detached copy for expensive computation
  const data = state.detach();
  const results = expensiveAnalysis(data);
  console.log(results);
};
```

### How `detach()` Works

- Returns a new instance with all listeners removed
- Recursively detaches all nested messages, arrays, maps, and sets
- The detached copy is structurally equal to the original (`original.equals(detached)` is true)
- Setters on detached objects return new instances but don't trigger React updates
- Results are cached for efficiency - calling `detach()` twice returns the same object

## Comparison: React vs Immer vs Propane

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

### Native React

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

### Immer

Mutable syntax via proxy - but updates must go through root state:

```typescript
import { useImmer } from 'use-immer';

const [state, setState] = useImmer<State>(initialState);

// Update deeply nested field - must use setState callback
const toggleTheme = () => {
  setState(draft => {
    const theme = draft.user.profile.settings.theme;
    draft.user.profile.settings.theme = theme === 'light' ? 'dark' : 'light';
  });
};

// Update item in nested array - must go through setState
const likePost = (postId: number) => {
  setState(draft => {
    const post = draft.user.posts.find(p => p.id === postId);
    if (post) post.likes++;
  });
};
```

### Propane

Update any object directly - changes propagate up automatically:

```typescript
import { usePropaneState, update } from '@propane/react';

const [state] = usePropaneState<State>(initialState);

// Update deeply nested field - just call the setter
const toggleTheme = () => {
  const current = state.user.profile.settings.theme;
  update(() => state.user.profile.settings.setTheme(current === 'light' ? 'dark' : 'light'));
};

// Update item in nested array - update the item directly
const likePost = (postId: number) => {
  const post = state.user.posts.find(p => p.id === postId);
  if (post) update(() => post.setLikes(post.likes + 1));
};
```

### Working Deep in the Tree

The key advantage of Propane over Immer becomes clear when you're already working
with nested objects. With Immer, you must always go back through `setState` and
navigate from the root. With Propane, you can update whatever object you have in
scope:

```typescript
// Immer: Even with the post in hand, must navigate from root
function PostEditor({ postId }: { postId: number }) {
  const [state, setState] = useImmer<State>(initialState);
  const post = state.user.posts.find(p => p.id === postId);

  const handleLike = () => {
    // Can't use `post` directly - must go through setState and find it again
    setState(draft => {
      const p = draft.user.posts.find(p => p.id === postId);
      if (p) p.likes++;
    });
  };
}

// Propane: Update the object you already have
function PostEditor({ postId }: { postId: number }) {
  const [state] = usePropaneState<State>(initialState);
  const post = state.user.posts.find(p => p.id === postId);

  const handleLike = () => {
    // Update post directly - changes propagate to root automatically
    if (post) update(() => post.setLikes(post.likes + 1));
  };
}
```

This makes Propane especially ergonomic when:
- Iterating over collections and updating individual items
- Passing nested objects to child components that need to modify them
- Working with deeply nested state in event handlers

### Passing State to Child Components

With Immer, child components can't modify state directly - they must receive
callbacks from the parent that knows how to navigate to the right location:

```typescript
// Immer: Parent must provide callbacks for every possible mutation
function App() {
  const [state, setState] = useImmer<State>(initialState);

  // Parent must define every mutation the child might need
  const handleUpdatePost = (postId: number, updates: Partial<Post>) => {
    setState(draft => {
      const post = draft.user.posts.find(p => p.id === postId);
      if (post) Object.assign(post, updates);
    });
  };

  const handleDeletePost = (postId: number) => {
    setState(draft => {
      const index = draft.user.posts.findIndex(p => p.id === postId);
      if (index !== -1) draft.user.posts.splice(index, 1);
    });
  };

  return (
    <>
      {state.user.posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onUpdate={(updates) => handleUpdatePost(post.id, updates)}
          onDelete={() => handleDeletePost(post.id)}
          onLike={() => handleUpdatePost(post.id, { likes: post.likes + 1 })}
        />
      ))}
    </>
  );
}

// Child receives data + callbacks
function PostCard({ post, onUpdate, onDelete, onLike }) {
  return (
    <div>
      <h2>{post.title}</h2>
      <button onClick={onLike}>Like ({post.likes})</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}
```

```typescript
// Propane: Just pass the object - child can update it directly
function App() {
  const [state] = usePropaneState<State>(initialState);

  return (
    <>
      {state.user.posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}

// Child receives the object and updates it directly
function PostCard({ post }: { post: Post }) {
  return (
    <div>
      <h2>{post.title}</h2>
      <button onClick={() => update(() => post.setLikes(post.likes + 1))}>
        Like ({post.likes})
      </button>
      <button onClick={() => update(() => post.delete())}>
        Delete
      </button>
    </div>
  );
}
```

The Propane version has less boilerplate, fewer props to pass, and the child
component is self-contained - it can modify what it receives without the parent
needing to anticipate every possible mutation.

### Key Differences

| Aspect | Native React | Immer | Propane |
|--------|--------------|-------|---------|
| Syntax | Spread at every level | Mutable-style writes | Fluent setters |
| Boilerplate | High | Low | Low |
| Update scope | Root only | Root only | Any nested object |
| Type safety | Manual | Good | Full |
| Structural equality | Manual | Reference only | Built-in `equals()` |
| Serialization | Manual | Manual | Built-in |

## Complete Example

```typescript
import { usePropaneState, usePropaneSelector, update, memoPropane } from '@propane/react';
import { GameState, BoardState } from './types.pmsg.ts';

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

    update(() => {
      game.history.push(newBoard);
      game.setCurrentMove(game.currentMove + 1);
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
