import './react-dom-test-setup.js';

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

let latestMultiRootLeftState: TodoState | null = null;
let latestMultiRootRightState: TodoState | null = null;
let runMultiRootTransaction: (() => void) | null = null;

function resetMultiRootHarnessState() {
  latestMultiRootLeftState = null;
  latestMultiRootRightState = null;
  runMultiRootTransaction = null;
}

function MultiRootTransactionApp() {
  const [left] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Left', completed: false })],
      filter: 'all',
    })
  );
  const [right] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Right', completed: false })],
      filter: 'all',
    })
  );

  latestMultiRootLeftState = left;
  latestMultiRootRightState = right;

  runMultiRootTransaction = () => {
    update(() => {
      left.todos.push(new TodoItem({ text: 'Left+1', completed: false }));
      right.todos.push(new TodoItem({ text: 'Right+1', completed: false }));
    });
  };

  return React.createElement(
    'div',
    null,
    React.createElement('span', { 'data-testid': 'multi-root-left-count' }, String(left.todos.length)),
    React.createElement('span', { 'data-testid': 'multi-root-right-count' }, String(right.todos.length))
  );
}

test('update applies pending state updates for every root in a multi-root transaction', () => {
  resetMultiRootHarnessState();
  const { unmount, getByTestId } = render(React.createElement(MultiRootTransactionApp));

  try {
    assert(runMultiRootTransaction !== null, 'Expected multi-root transaction handler');
    assert(latestMultiRootLeftState instanceof TodoState, 'Expected left state to initialize');
    assert(latestMultiRootRightState instanceof TodoState, 'Expected right state to initialize');

    assert(getByTestId('multi-root-left-count').textContent === '1', 'Left count should start at 1');
    assert(getByTestId('multi-root-right-count').textContent === '1', 'Right count should start at 1');

    act(() => {
      runMultiRootTransaction!();
    });

    assert(latestMultiRootLeftState instanceof TodoState, 'Expected left state after transaction');
    assert(latestMultiRootRightState instanceof TodoState, 'Expected right state after transaction');
    assert(latestMultiRootLeftState.todos.length === 2, 'Left root should apply the transaction update');
    assert(latestMultiRootRightState.todos.length === 2, 'Right root should apply the transaction update');
    assert(getByTestId('multi-root-left-count').textContent === '2', 'Rendered left count should update');
    assert(getByTestId('multi-root-right-count').textContent === '2', 'Rendered right count should update');
  } finally {
    unmount();
    cleanup();
  }
});

let latestSyncFailureState: TodoState | null = null;
let runSyncFailureTransaction: (() => void) | null = null;

function resetSyncFailureHarnessState() {
  latestSyncFailureState = null;
  runSyncFailureTransaction = null;
}

function SyncFailureRollbackApp() {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Initial', completed: false })],
      filter: 'all',
    })
  );

  latestSyncFailureState = state;
  runSyncFailureTransaction = () => {
    try {
      update(() => {
        state.todos.push(new TodoItem({ text: 'Should-Rollback-Sync', completed: false }));
        throw new Error('sync transaction failure');
      });
    } catch {
      // Expected in regression harness.
    }
  };

  return React.createElement(
    'span',
    { 'data-testid': 'sync-failure-count' },
    String(state.todos.length)
  );
}

test('update rolls back pending state updates on sync failure', () => {
  resetSyncFailureHarnessState();
  const { unmount, getByTestId } = render(React.createElement(SyncFailureRollbackApp));

  try {
    assert(runSyncFailureTransaction !== null, 'Expected sync failure transaction handler');
    assert(latestSyncFailureState instanceof TodoState, 'Expected sync failure state to initialize');
    assert(latestSyncFailureState.todos.length === 1, 'Initial sync failure state should have one todo');
    assert(getByTestId('sync-failure-count').textContent === '1', 'Rendered count should start at 1');

    act(() => {
      runSyncFailureTransaction!();
    });

    assert(latestSyncFailureState instanceof TodoState, 'Expected sync failure state after transaction');
    assert(latestSyncFailureState.todos.length === 1, 'Sync failure should not commit pending updates');
    assert(getByTestId('sync-failure-count').textContent === '1', 'Rendered count should remain unchanged after sync failure');
  } finally {
    unmount();
    cleanup();
  }
});

let latestAsyncFailureState: TodoState | null = null;
let runAsyncFailureTransaction: (() => Promise<void>) | null = null;

function resetAsyncFailureHarnessState() {
  latestAsyncFailureState = null;
  runAsyncFailureTransaction = null;
}

function AsyncFailureRollbackApp() {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Initial', completed: false })],
      filter: 'all',
    })
  );

  latestAsyncFailureState = state;
  runAsyncFailureTransaction = async () => {
    try {
      await update(async () => {
        state.todos.push(new TodoItem({ text: 'Should-Rollback-Async', completed: false }));
        throw new Error('async transaction failure');
      });
    } catch {
      // Expected in regression harness.
    }
  };

  return React.createElement(
    'span',
    { 'data-testid': 'async-failure-count' },
    String(state.todos.length)
  );
}

test('update rolls back pending state updates on async failure', async () => {
  resetAsyncFailureHarnessState();
  const { unmount, getByTestId } = render(React.createElement(AsyncFailureRollbackApp));

  try {
    assert(runAsyncFailureTransaction !== null, 'Expected async failure transaction handler');
    assert(latestAsyncFailureState instanceof TodoState, 'Expected async failure state to initialize');
    assert(latestAsyncFailureState.todos.length === 1, 'Initial async failure state should have one todo');
    assert(getByTestId('async-failure-count').textContent === '1', 'Rendered count should start at 1');

    await act(async () => {
      await runAsyncFailureTransaction!();
    });

    assert(latestAsyncFailureState instanceof TodoState, 'Expected async failure state after transaction');
    assert(latestAsyncFailureState.todos.length === 1, 'Async failure should not commit pending updates');
    assert(getByTestId('async-failure-count').textContent === '1', 'Rendered count should remain unchanged after async failure');
  } finally {
    unmount();
    cleanup();
  }
});

let latestOverlapState: TodoState | null = null;
let runOverlappingAsyncAndSyncTransactions: (() => Promise<void>) | null = null;

function resetOverlapHarnessState() {
  latestOverlapState = null;
  runOverlappingAsyncAndSyncTransactions = null;
}

function OverlapIsolationApp() {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Initial', completed: false })],
      filter: 'all',
    })
  );

  latestOverlapState = state;
  runOverlappingAsyncAndSyncTransactions = async () => {
    const pendingAsyncFailure = update(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });
      throw new Error('outer async failure');
    }).catch(() => undefined);

    update(() => {
      state.todos.push(new TodoItem({ text: 'Sync-Commit', completed: false }));
    });

    await pendingAsyncFailure;
  };

  return React.createElement(
    'span',
    { 'data-testid': 'overlap-count' },
    String(state.todos.length)
  );
}

test('overlapping top-level transactions isolate rollback from async failure', async () => {
  resetOverlapHarnessState();
  const { unmount, getByTestId } = render(React.createElement(OverlapIsolationApp));

  try {
    assert(runOverlappingAsyncAndSyncTransactions !== null, 'Expected overlap transaction runner');
    assert(latestOverlapState instanceof TodoState, 'Expected overlap state to initialize');
    assert(latestOverlapState.todos.length === 1, 'Initial overlap state should have one todo');
    assert(getByTestId('overlap-count').textContent === '1', 'Rendered overlap count should start at 1');

    await act(async () => {
      await runOverlappingAsyncAndSyncTransactions!();
    });

    assert(latestOverlapState instanceof TodoState, 'Expected overlap state after transactions');
    assert(Number(latestOverlapState.todos.length) === 2, 'Sync transaction should commit even if overlapping async transaction fails');
    assert(getByTestId('overlap-count').textContent === '2', 'Rendered overlap count should reflect committed sync transaction');
  } finally {
    unmount();
    cleanup();
  }
});

let latestNestedRollbackState: TodoState | null = null;
let runNestedFailureWithCatch: (() => void) | null = null;

function resetNestedRollbackHarnessState() {
  latestNestedRollbackState = null;
  runNestedFailureWithCatch = null;
}

function NestedRollbackIsolationApp() {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Initial', completed: false })],
      filter: 'all',
    })
  );

  latestNestedRollbackState = state;
  runNestedFailureWithCatch = () => {
    update(() => {
      try {
        update(() => {
          state.todos.push(new TodoItem({ text: 'Nested-Should-Rollback', completed: false }));
          throw new Error('nested sync failure');
        });
      } catch {
        // Expected in regression harness.
      }
    });
  };

  return React.createElement(
    'span',
    { 'data-testid': 'nested-rollback-count' },
    String(state.todos.length)
  );
}

test('nested update failure rolls back inner transaction even when caught by outer transaction', () => {
  resetNestedRollbackHarnessState();
  const { unmount, getByTestId } = render(React.createElement(NestedRollbackIsolationApp));

  try {
    assert(runNestedFailureWithCatch !== null, 'Expected nested rollback runner');
    assert(latestNestedRollbackState instanceof TodoState, 'Expected nested rollback state to initialize');
    assert(latestNestedRollbackState.todos.length === 1, 'Initial nested rollback state should have one todo');
    assert(getByTestId('nested-rollback-count').textContent === '1', 'Rendered nested rollback count should start at 1');

    act(() => {
      runNestedFailureWithCatch!();
    });

    assert(latestNestedRollbackState instanceof TodoState, 'Expected nested rollback state after nested transaction');
    assert(latestNestedRollbackState.todos.length === 1, 'Caught nested failure should not commit inner pending updates');
    assert(getByTestId('nested-rollback-count').textContent === '1', 'Rendered nested rollback count should remain unchanged');
  } finally {
    unmount();
    cleanup();
  }
});

let latestAsyncOverlapGuardState: TodoState | null = null;
let runAsyncOverlapGuardFlow: (() => Promise<void>) | null = null;
let caughtAsyncOverlapErrorMessage: string | null = null;

function resetAsyncOverlapGuardHarnessState() {
  latestAsyncOverlapGuardState = null;
  runAsyncOverlapGuardFlow = null;
  caughtAsyncOverlapErrorMessage = null;
}

function createDeferred() {
  let resolve: (() => void) | null = null;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return {
    promise,
    resolve: () => resolve?.(),
  };
}

function AsyncOverlapGuardApp() {
  const [state] = usePropaneState<TodoState>(() =>
    new TodoState({
      todos: [new TodoItem({ text: 'Initial', completed: false })],
      filter: 'all',
    })
  );

  latestAsyncOverlapGuardState = state;
  runAsyncOverlapGuardFlow = async () => {
    const gate = createDeferred();

    const firstAsync = update(async () => {
      await gate.promise;
      state.todos.push(new TodoItem({ text: 'From-First-Async', completed: false }));
    });

    try {
      await update(async () => {
        state.todos.push(new TodoItem({ text: 'From-Second-Async', completed: false }));
      });
    } catch (error) {
      caughtAsyncOverlapErrorMessage = error instanceof Error
        ? error.message
        : String(error);
    }

    gate.resolve();
    await firstAsync;
  };

  return React.createElement(
    'span',
    { 'data-testid': 'async-overlap-guard-count' },
    String(state.todos.length)
  );
}

test('overlapping top-level async update calls are rejected and do not drop first transaction updates', async () => {
  resetAsyncOverlapGuardHarnessState();
  const { unmount, getByTestId } = render(React.createElement(AsyncOverlapGuardApp));

  try {
    assert(runAsyncOverlapGuardFlow !== null, 'Expected async overlap guard runner');
    assert(latestAsyncOverlapGuardState instanceof TodoState, 'Expected async overlap guard state to initialize');
    assert(latestAsyncOverlapGuardState.todos.length === 1, 'Initial async overlap guard state should have one todo');
    assert(getByTestId('async-overlap-guard-count').textContent === '1', 'Rendered async overlap guard count should start at 1');

    await act(async () => {
      await runAsyncOverlapGuardFlow!();
    });

    assert(
      caughtAsyncOverlapErrorMessage === 'Cannot start a new async update() while another async update() is still in progress. Await the previous update() before starting another async update().',
      `Expected overlapping async update guard error, got: ${String(caughtAsyncOverlapErrorMessage)}`
    );
    assert(latestAsyncOverlapGuardState instanceof TodoState, 'Expected async overlap guard state after flow');
    assert(Number(latestAsyncOverlapGuardState.todos.length) === 2, 'First async transaction update should still commit');
    assert(getByTestId('async-overlap-guard-count').textContent === '2', 'Rendered count should reflect first async transaction commit');
  } finally {
    unmount();
    cleanup();
  }
});
