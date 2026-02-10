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
import { usePropaneState, usePropaneSelector, update } from '../react/index.js';
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

let latestAsyncState: TodoState | null = null;
let scheduleDelayedMutationFromCapturedRef: (() => void) | null = null;
let runDelayedMutationFromCapturedRef: (() => void) | null = null;
let removeFirstTodoFromAsyncState: (() => void) | null = null;

function resetAsyncClosureHarnessState() {
  latestAsyncState = null;
  scheduleDelayedMutationFromCapturedRef = null;
  runDelayedMutationFromCapturedRef = null;
  removeFirstTodoFromAsyncState = null;
}

function AsyncClosureRemovalApp() {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Captured', completed: false })],
      filter: 'all',
    })
  );

  latestAsyncState = state;

  scheduleDelayedMutationFromCapturedRef = () => {
    const staleRef = state.todos.get(0);
    runDelayedMutationFromCapturedRef = () => {
      if (!staleRef) {
        return;
      }
      update(() => {
        staleRef.setCompleted(true);
      });
    };
  };

  removeFirstTodoFromAsyncState = () => {
    update(() => {
      state.todos.pop();
    });
  };

  return React.createElement(
    'div',
    null,
    React.createElement('span', { 'data-testid': 'async-todo-count' }, String(state.todos.length)),
    React.createElement('span', { 'data-testid': 'async-first-text' }, state.todos.get(0)?.text ?? 'none')
  );
}

test('usePropaneState async stale closure after removal does not resurrect removed item', async () => {
  resetAsyncClosureHarnessState();
  const { unmount, getByTestId } = render(React.createElement(AsyncClosureRemovalApp));

  try {
    assert(latestAsyncState instanceof TodoState, 'Initial async state should be TodoState');
    assert(scheduleDelayedMutationFromCapturedRef !== null, 'Expected delayed mutation scheduler');
    assert(removeFirstTodoFromAsyncState !== null, 'Expected remove handler');

    act(() => {
      scheduleDelayedMutationFromCapturedRef!();
    });
    assert(runDelayedMutationFromCapturedRef !== null, 'Expected delayed mutation callback to be captured');

    act(() => {
      removeFirstTodoFromAsyncState!();
    });

    assert(latestAsyncState instanceof TodoState, 'State should remain TodoState after removal');
    assert(latestAsyncState.todos.length === 0, 'Removed todo should be absent before delayed callback executes');
    assert(getByTestId('async-todo-count').textContent === '0', 'Rendered count should reflect removal');

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        act(() => {
          runDelayedMutationFromCapturedRef!();
        });
        resolve();
      }, 0);
    });

    assert(latestAsyncState instanceof TodoState, 'State should remain TodoState after delayed stale mutation');
    assert(latestAsyncState.todos.length === 0, 'Delayed stale mutation must not resurrect removed todo');
    assert(getByTestId('async-todo-count').textContent === '0', 'Rendered count should remain at zero');
    assert(getByTestId('async-first-text').textContent === 'none', 'No todo should be rendered after delayed stale mutation');
  } finally {
    unmount();
    cleanup();
  }
});

let lifecycleToggleFirstTodo: (() => void) | null = null;
let selectorPrimaryRenders = 0;
let selectorSecondaryRenders = 0;
let selectorPrimaryValue = false;
let selectorSecondaryValue = false;

function resetSelectorLifecycleHarnessState() {
  lifecycleToggleFirstTodo = null;
  selectorPrimaryRenders = 0;
  selectorSecondaryRenders = 0;
  selectorPrimaryValue = false;
  selectorSecondaryValue = false;
}

function PrimarySelector({ state }: { state: TodoState }) {
  const completed = usePropaneSelector(
    state,
    s => s.todos.get(0)?.completed ?? false
  );
  selectorPrimaryRenders += 1;
  selectorPrimaryValue = completed;
  return React.createElement('span', { 'data-testid': 'selector-primary' }, String(completed));
}

function SecondarySelector({ state }: { state: TodoState }) {
  const completed = usePropaneSelector(
    state,
    s => s.todos.get(0)?.completed ?? false
  );
  selectorSecondaryRenders += 1;
  selectorSecondaryValue = completed;
  return React.createElement('span', { 'data-testid': 'selector-secondary' }, String(completed));
}

function SelectorLifecycleApp({ showPrimary }: { showPrimary: boolean }) {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Lifecycle', completed: false })],
      filter: 'all',
    })
  );

  lifecycleToggleFirstTodo = () => {
    update(() => {
      const first = state.todos.get(0);
      if (first) {
        first.setCompleted(!first.completed);
      }
    });
  };

  return React.createElement(
    'div',
    null,
    showPrimary
      ? React.createElement(PrimarySelector, { state })
      : null,
    React.createElement(SecondarySelector, { state })
  );
}

test('usePropaneSelector unmount retires listener while mounted selectors remain active', () => {
  resetSelectorLifecycleHarnessState();
  const { unmount, rerender } = render(
    React.createElement(SelectorLifecycleApp, { showPrimary: true })
  );

  try {
    assert(lifecycleToggleFirstTodo !== null, 'Expected lifecycle toggle handler');
    const primaryRendersAtMount = selectorPrimaryRenders;
    const secondaryRendersAtMount = selectorSecondaryRenders;
    assert(Number(primaryRendersAtMount) >= 1, `Expected primary selector to mount, got ${primaryRendersAtMount}`);
    assert(Number(secondaryRendersAtMount) >= 1, `Expected secondary selector to mount, got ${secondaryRendersAtMount}`);

    act(() => {
      lifecycleToggleFirstTodo!();
    });

    assert(
      Number(selectorPrimaryRenders) > Number(primaryRendersAtMount),
      `Expected primary selector to rerender on update, got ${selectorPrimaryRenders}`
    );
    assert(
      Number(selectorSecondaryRenders) > Number(secondaryRendersAtMount),
      `Expected secondary selector to rerender on update, got ${selectorSecondaryRenders}`
    );
    const primaryValueAfterFirstUpdate = selectorPrimaryValue;
    const secondaryValueAfterFirstUpdate = selectorSecondaryValue;
    assert(primaryValueAfterFirstUpdate === true, 'Primary selector value should reflect first update');
    assert(secondaryValueAfterFirstUpdate === true, 'Secondary selector value should reflect first update');

    rerender(React.createElement(SelectorLifecycleApp, { showPrimary: false }));
    const primaryRendersBeforeUnmountedUpdate = selectorPrimaryRenders;
    const secondaryRendersBeforeUnmountedUpdate = selectorSecondaryRenders;

    act(() => {
      lifecycleToggleFirstTodo!();
    });

    assert(
      Number(selectorPrimaryRenders) === Number(primaryRendersBeforeUnmountedUpdate),
      `Unmounted selector should not rerender, got ${selectorPrimaryRenders}`
    );
    assert(
      Number(selectorSecondaryRenders) > Number(secondaryRendersBeforeUnmountedUpdate),
      `Mounted selector should keep receiving updates, got ${selectorSecondaryRenders}`
    );
    assert(selectorSecondaryValue === false, 'Mounted selector should reflect post-unmount update');
  } finally {
    unmount();
    cleanup();
  }
});
