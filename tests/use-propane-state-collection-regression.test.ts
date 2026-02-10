// Set up DOM globals before importing React/testing-library.
import { Window } from 'happy-dom';
const happyDomWindow = new Window();

Object.defineProperty(globalThis, 'document', { value: happyDomWindow.document, configurable: true });
Object.defineProperty(globalThis, 'window', { value: happyDomWindow, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: happyDomWindow.navigator, configurable: true });
Object.defineProperty(globalThis, 'HTMLElement', { value: happyDomWindow.HTMLElement, configurable: true });
Object.defineProperty(globalThis, 'Element', { value: happyDomWindow.Element, configurable: true });
Object.defineProperty(globalThis, 'Node', { value: happyDomWindow.Node, configurable: true });
Object.defineProperty(globalThis, 'Text', { value: happyDomWindow.Text, configurable: true });
Object.defineProperty(globalThis, 'DocumentFragment', { value: happyDomWindow.DocumentFragment, configurable: true });

import React, { act } from 'react';
import { render, cleanup } from '@testing-library/react';
import { usePropaneState, update } from '../react/index.js';
import { Message } from '../runtime/message.js';
import type { DataObject } from '../runtime/message.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';
import {
  GET_MESSAGE_CHILDREN,
  WITH_CHILD,
} from '../runtime/symbols.js';
import type { ImmutableArray as ImmutableArrayType } from '../runtime/common/array/immutable.js';
import type { ImmutableMap as ImmutableMapType } from '../runtime/common/map/immutable.js';
import type { ImmutableSet as ImmutableSetType } from '../runtime/common/set/immutable.js';
import { assert } from './assert.js';
import { test } from 'node:test';

const TODO_ITEM_TAG = Symbol('UsePropaneStateRegressionTodoItem');
const TODO_STATE_TAG = Symbol('UsePropaneStateRegressionTodoState');

class TodoItem extends Message<{ text: string; completed: boolean }> {
  static readonly $typeId = 'tests/use-propane-state-collection-regression#TodoItem';
  static readonly $typeHash = 'tests/use-propane-state-collection-regression#TodoItem@v1';

  #text: string;
  #completed: boolean;

  constructor(props: { text: string; completed: boolean }) {
    super(TODO_ITEM_TAG, 'TodoItem');
    this.#text = props.text;
    this.#completed = props.completed;
  }

  protected $getPropDescriptors() {
    return [
      { name: 'text' as const, fieldNumber: 1, getValue: () => this.#text },
      { name: 'completed' as const, fieldNumber: 2, getValue: () => this.#completed },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return {
      text: entries['text'] as string,
      completed: entries['completed'] as boolean,
    };
  }

  get text() {
    return this.#text;
  }

  get completed() {
    return this.#completed;
  }

  setCompleted(completed: boolean) {
    return this.$update(new TodoItem({ text: this.#text, completed }) as this);
  }
}

class TodoState extends Message<{
  todos: TodoItem[] | Iterable<TodoItem>;
  filter: 'all' | 'active' | 'completed';
}> {
  static readonly $typeId = 'tests/use-propane-state-collection-regression#TodoState';
  static readonly $typeHash = 'tests/use-propane-state-collection-regression#TodoState@v1';

  #todos: ImmutableArrayType<TodoItem>;
  #filter: 'all' | 'active' | 'completed';

  constructor(props: {
    todos: TodoItem[] | Iterable<TodoItem>;
    filter: 'all' | 'active' | 'completed';
  }) {
    super(TODO_STATE_TAG, 'TodoState');
    this.#todos = new ImmutableArray(props.todos);
    this.#filter = props.filter;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'todos' as const,
        fieldNumber: 1,
        getValue: () => this.#todos as TodoItem[] | Iterable<TodoItem>,
      },
      {
        name: 'filter' as const,
        fieldNumber: 2,
        getValue: () => this.#filter,
      },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return {
      todos: entries['todos'] as TodoItem[] | Iterable<TodoItem>,
      filter: entries['filter'] as 'all' | 'active' | 'completed',
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'todos':
        return new TodoState({
          todos: child as TodoItem[] | Iterable<TodoItem>,
          filter: this.#filter,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['todos', this.#todos] as unknown as [
      string,
      Message<DataObject>
      | ImmutableArrayType<unknown>
      | ImmutableMapType<unknown, unknown>
      | ImmutableSetType<unknown>,
    ];
  }

  get todos() {
    return this.#todos;
  }

  get filter() {
    return this.#filter;
  }
}

let latestState: TodoState | null = null;
let addTodo: ((text: string) => void) | null = null;
let toggleFirstTodo: (() => void) | null = null;
let renderCount = 0;

function resetHarnessState() {
  latestState = null;
  addTodo = null;
  toggleFirstTodo = null;
  renderCount = 0;
}

function TestApp() {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Initial', completed: false })],
      filter: 'all',
    })
  );

  renderCount += 1;
  latestState = state;

  addTodo = (text: string) => {
    update(() => {
      state.todos.push(new TodoItem({ text, completed: false }));
    });
  };

  toggleFirstTodo = () => {
    update(() => {
      const first = state.todos.get(0);
      if (first) {
        first.setCompleted(!first.completed);
      }
    });
  };

  const activeCount = state.todos.filter(todo => !todo.completed).length;
  const firstCompleted = state.todos.get(0)?.completed ?? false;

  return React.createElement(
    'div',
    null,
    React.createElement('span', { 'data-testid': 'active-count' }, String(activeCount)),
    React.createElement('span', { 'data-testid': 'first-completed' }, String(firstCompleted))
  );
}

test('usePropaneState handles collection and nested message updates without corrupting root state', () => {
  resetHarnessState();
  const { unmount, getByTestId } = render(React.createElement(TestApp));

  try {
    assert(latestState instanceof TodoState, 'Initial state should be TodoState');
    assert(addTodo !== null, 'addTodo handler should be initialized');
    assert(toggleFirstTodo !== null, 'toggleFirstTodo handler should be initialized');

    act(() => {
      addTodo!('New Task');
    });

    assert(latestState instanceof TodoState, 'State should remain TodoState after array push update');
    assert(latestState.todos.length === 2, 'Array push should add a todo');
    assert(latestState.todos.get(1)?.text === 'New Task', 'Added todo should be present in state');
    assert(getByTestId('active-count').textContent === '2', 'Rendered active count should update after add');

    act(() => {
      toggleFirstTodo!();
    });

    assert(latestState instanceof TodoState, 'State should remain TodoState after nested child update');
    assert(latestState.todos.get(0)?.completed === true, 'Nested todo update should propagate to root state');
    assert(getByTestId('first-completed').textContent === 'true', 'Rendered completion state should update');
    assert(getByTestId('active-count').textContent === '1', 'Rendered active count should update after toggle');
    assert(renderCount >= 3, `Expected at least 3 renders, got ${renderCount}`);
  } finally {
    unmount();
    cleanup();
  }
});
