import { usePropaneState, update } from '@propane/react';
import { Todo, AppState } from './types.pmsg.ts';

const uuid = () => crypto.randomUUID();

const TodoItem = ({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) => {
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

    update(() => {
      state.todos.push(new Todo({
        id: uuid(),
        text,
        completed: false,
      }));
    });

    form.reset();
  };

  const handleToggle = (id: string) => {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
      update(() => todo.setCompleted(!todo.completed));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    update(() => state.setFilter(e.target.value as AppState['filter']));
  };

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed;
    if (state.filter === 'completed') return todo.completed;
    return true;
  });

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

      <ul>
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
          />
        ))}
      </ul>

      <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
        {state.todos.filter(t => !t.completed).length} items left
      </p>
    </div>
  );
}

export default App;
