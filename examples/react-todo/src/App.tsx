import React, { useCallback } from 'react';
import { usePropaneState } from '@propanejs/react';
import { Todo, AppState } from './types.propane.ts';
import { ImmutableArray } from '@propanejs/runtime';

const TodoItem = ({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) => {
  console.log(`Rendering TodoItem: ${todo.text}`);
  return (
    <li
      style={{
        textDecoration: todo.completed ? 'line-through' : 'none',
        cursor: 'pointer',
      }}
      onClick={() => onToggle(todo.id)}
    >
      {todo.text}
    </li>
  );
};

function App() {
  // Initialize state with a Propane message
  // usePropaneState will use equals() to determine if a re-render is needed
  const [state] = usePropaneState<AppState>(
    new AppState({
      todos: [
        new Todo({ id: uuid(), text: 'Learn Propane', completed: true }),
        new Todo({ id: uuid(), text: 'Build React App', completed: false }),
      ],
      filter: 'all',
    })
  );

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('text') as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;

    /*state.todos.update(u => u.push(new Todo({
      id: uuid(),
      text: text,
      completed: false,
    })));*/

    form.reset();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    /*state.update(u => u.setFilter(e.target.value));
    update(state, draft => draft.filter = e.target.value);
    state.updateFilter(e.target.value);
    // Immer
    setState(draft => draft.filter = e.target.value);*/
  };

  // Demonstration of equality check skipping render
  const handleNoOp = () => {
    console.log("Triggering no-op update");
    //state.update(u => AppState.deserialize(u.serialize()));
  };

  const filteredTodos = state.todos.filter(todo => {
      if (state.filter === 'active') return !todo.completed;
      if (state.filter === 'completed') return todo.completed;
      return true;
  });

  console.log("Rendering App");

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Propane React Todo</h1>

      <form onSubmit={handleAdd} style={{ marginBottom: '1rem' }}>
        <input name="text" placeholder="What needs to be done?" />
        <button type="submit">Add</button>
      </form>

      <div style={{ marginBottom: '1rem' }}>
          Filter:
          <select value={state.filter} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
          </select>
      </div>

      <button onClick={handleNoOp}>Test No-Op Update (Check Console)</button>

      <ul>
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={null /*todo.update(u => u.setCompleted(false))*/}
          />
        ))}
      </ul>
    </div>
  );
}

const uuid = () = crypto.randomUUID();

export default App;
