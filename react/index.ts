import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useSyncExternalStore,
  memo,
  createContext,
  useContext,
} from 'react';
import type { Dispatch, SetStateAction, ComponentType, ReactNode } from 'react';
import type { Message, DataObject } from '@/runtime/index.js';
import {
  equals,
  SET_UPDATE_LISTENER,
  RETIRE_UPDATE_LISTENER,
  REGISTER_PATH,
  EQUALS_FROM_ROOT,
} from '@/runtime/index.js';

interface UpdateTransaction {
  id: symbol;
  parent: UpdateTransaction | null;
  pendingStateUpdates: Map<symbol, () => void>;
  abortRecoveryByListenerKey: Map<symbol, () => void>;
  status: 'active' | 'committed' | 'aborted';
}

const updateTransactions: UpdateTransaction[] = [];
const activeAsyncTopLevelTransactions = new Set<UpdateTransaction>();
const transactionExecutionStack: UpdateTransaction[] = [];
const BOUND_VALUE_TO_RAW = new WeakMap<object, object>();

const OVERLAPPING_ASYNC_UPDATE_ERROR =
  'Cannot start a new async update() while another async update() is still in progress. '
  + 'Await the previous update() before starting another async update().';

interface TransactionBindingContext {
  transaction: UpdateTransaction;
  rawToBound: WeakMap<object, object>;
}

function getCurrentExecutionTransaction(): UpdateTransaction | null {
  if (transactionExecutionStack.length === 0) {
    return null;
  }
  return transactionExecutionStack[transactionExecutionStack.length - 1] ?? null;
}

function withTransaction<T>(
  transaction: UpdateTransaction,
  callback: () => T
): T {
  transactionExecutionStack.push(transaction);
  try {
    return callback();
  } finally {
    const popped = transactionExecutionStack.pop();
    if (popped !== transaction) {
      throw new Error('Transaction execution stack corruption detected.');
    }
  }
}

function beginUpdate(): UpdateTransaction {
  const parent = getCurrentExecutionTransaction();
  const transaction: UpdateTransaction = {
    id: Symbol('propane:react:update-transaction'),
    parent,
    pendingStateUpdates: new Map<symbol, () => void>(),
    abortRecoveryByListenerKey: new Map<symbol, () => void>(),
    status: 'active',
  };
  updateTransactions.push(transaction);
  return transaction;
}

function removeUpdateTransaction(transaction: UpdateTransaction): void {
  const index = updateTransactions.lastIndexOf(transaction);
  if (index >= 0) {
    updateTransactions.splice(index, 1);
  }
}

function flushPendingStateUpdates(transaction: UpdateTransaction): void {
  if (transaction.pendingStateUpdates.size === 0) {
    return;
  }

  const updates = [...transaction.pendingStateUpdates.values()];
  transaction.pendingStateUpdates.clear();
  for (const applyStateUpdate of updates) {
    applyStateUpdate();
  }
}

function endUpdate(transaction: UpdateTransaction): void {
  if (transaction.status !== 'active') {
    return;
  }
  removeUpdateTransaction(transaction);

  const parent = transaction.parent;
  if (
    parent
    && parent.status === 'active'
    && updateTransactions.includes(parent)
  ) {
    // Nested transaction: merge updates into parent (last one wins per root key).
    for (const [listenerKey, updateFn] of transaction.pendingStateUpdates) {
      parent.pendingStateUpdates.set(listenerKey, updateFn);
    }
    for (
      const [listenerKey, abortRecovery]
      of transaction.abortRecoveryByListenerKey
    ) {
      parent.abortRecoveryByListenerKey.set(listenerKey, abortRecovery);
    }
    transaction.pendingStateUpdates.clear();
    transaction.abortRecoveryByListenerKey.clear();
    transaction.status = 'committed';
    return;
  }

  // Top-level transaction (or detached nested edge-case): apply now.
  flushPendingStateUpdates(transaction);
  transaction.abortRecoveryByListenerKey.clear();
  transaction.status = 'committed';
}

function abortUpdate(transaction: UpdateTransaction): void {
  if (transaction.status !== 'active') {
    return;
  }
  const abortRecoveries = [...transaction.abortRecoveryByListenerKey.values()];
  removeUpdateTransaction(transaction);
  transaction.pendingStateUpdates.clear();
  transaction.abortRecoveryByListenerKey.clear();
  transaction.status = 'aborted';

  for (const recoverFromAbort of abortRecoveries) {
    try {
      recoverFromAbort();
    } catch {
      // Best-effort recovery path; preserve original abort error semantics.
    }
  }
}

function scheduleStateUpdate(
  listenerKey: symbol,
  updateFn: () => void,
  recoverFromAbort?: () => void
): void {
  const transaction = getCurrentExecutionTransaction();
  if (!transaction) {
    // Outside update(): ignore - React state only changes within update()
    return;
  }
  if (transaction.status !== 'active') {
    return;
  }
  // Inside update(): record the state change (last one wins per root key)
  transaction.pendingStateUpdates.set(listenerKey, updateFn);
  if (recoverFromAbort) {
    transaction.abortRecoveryByListenerKey.set(listenerKey, recoverFromAbort);
  }
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null
    && typeof value === 'object'
    && 'then' in value
    && typeof (value as { then?: unknown }).then === 'function'
  );
}

function unwrapBoundValue<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value !== 'object' && typeof value !== 'function') {
    return value;
  }
  const raw = BOUND_VALUE_TO_RAW.get(value as unknown as object);
  return (raw ?? value) as T;
}

function shouldBindValue(value: unknown): value is object {
  if (value === null || value === undefined) {
    return false;
  }
  if (isPromiseLike(value)) {
    return false;
  }
  const valueType = typeof value;
  return valueType === 'object' || valueType === 'function';
}

function createBoundProxy(
  target: object,
  bindingContext: TransactionBindingContext
): object {
  return new Proxy(target, {
    get(innerTarget, property) {
      const value = Reflect.get(innerTarget, property, innerTarget);
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          if (bindingContext.transaction.status !== 'active') {
            return undefined;
          }
          const unwrappedArgs = args.map((arg) => unwrapBoundValue(arg));
          return withTransaction(bindingContext.transaction, () => {
            const result = Reflect.apply(value, innerTarget, unwrappedArgs);
            return bindValueToTransaction(result, bindingContext);
          });
        };
      }
      return bindValueToTransaction(value, bindingContext);
    },
    set(innerTarget, property, value) {
      if (bindingContext.transaction.status !== 'active') {
        return true;
      }
      const unwrappedValue = unwrapBoundValue(value);
      return withTransaction(
        bindingContext.transaction,
        () => Reflect.set(innerTarget, property, unwrappedValue, innerTarget)
      );
    },
    apply(innerTarget, thisArg, args) {
      if (bindingContext.transaction.status !== 'active') {
        return undefined;
      }
      const unwrappedThis = unwrapBoundValue(thisArg);
      const unwrappedArgs = args.map((arg) => unwrapBoundValue(arg));
      return withTransaction(bindingContext.transaction, () => {
        const callable = innerTarget as (...callArgs: unknown[]) => unknown;
        const result = Reflect.apply(callable, unwrappedThis, unwrappedArgs);
        return bindValueToTransaction(result, bindingContext);
      });
    },
  });
}

function bindValueToTransaction<T>(
  value: T,
  bindingContext: TransactionBindingContext
): T {
  const unwrappedValue = unwrapBoundValue(value);
  if (!shouldBindValue(unwrappedValue)) {
    return unwrappedValue as T;
  }

  const existing = bindingContext.rawToBound.get(unwrappedValue);
  if (existing) {
    return existing as T;
  }

  const bound = createBoundProxy(unwrappedValue, bindingContext);
  bindingContext.rawToBound.set(unwrappedValue, bound);
  BOUND_VALUE_TO_RAW.set(bound, unwrappedValue);
  return bound as T;
}

/**
 * Enable React state updates for Propane setter calls.
 *
 * Propane setters only trigger React re-renders when called inside an
 * update() callback. Setters called outside update() still return new
 * Propane instances but won't update React state.
 *
 * When multiple setters are called, only the final state per subscribed root
 * is applied to React (avoiding unnecessary intermediate renders).
 *
 * Supports both sync and async callbacks.
 *
 * @example
 * // Sync: updates React state after callback completes
 * update(game, g => {
 *   g.setCurrentMove(0);
 *   g.setHistory([initialBoard]);
 * });
 *
 * @example
 * // Async: updates React state after promise resolves
 * await update(state, async s => {
 *   const data = await fetchData();
 *   s.setData(data);
 * });
 *
 * @example
 * // Outside update(): no React re-render
 * game.setCurrentMove(0); // Returns new instance, but React state unchanged
 */
export function update<S, T>(root: S, callback: (state: S) => T): T;
export function update<S extends readonly unknown[], T>(
  roots: [...S],
  callback: (states: { [K in keyof S]: S[K] }) => T
): T;
export function update<T>(
  rootOrRoots: unknown,
  callback: (value: any) => T
): T {

  const transaction = beginUpdate();
  const isTopLevelTransaction = transaction.parent === null;
  const bindingContext: TransactionBindingContext = {
    transaction,
    rawToBound: new WeakMap<object, object>(),
  };

  let result: T;

  try {
    const boundInput = Array.isArray(rootOrRoots)
      ? rootOrRoots.map((root) => bindValueToTransaction(root, bindingContext))
      : bindValueToTransaction(rootOrRoots, bindingContext);
    result = withTransaction(transaction, () => callback(boundInput));
  } catch (error) {
    abortUpdate(transaction);
    throw error;
  }

  if (isPromiseLike(result)) {
    if (
      isTopLevelTransaction
      && activeAsyncTopLevelTransactions.size > 0
    ) {
      abortUpdate(transaction);
      throw new Error(OVERLAPPING_ASYNC_UPDATE_ERROR);
    }

    if (isTopLevelTransaction) {
      activeAsyncTopLevelTransactions.add(transaction);
    }

    return result.then(
      (value) => {
        if (isTopLevelTransaction) {
          activeAsyncTopLevelTransactions.delete(transaction);
        }
        endUpdate(transaction);
        return value as Awaited<T>;
      },
      (error: unknown) => {
        if (isTopLevelTransaction) {
          activeAsyncTopLevelTransactions.delete(transaction);
        }
        abortUpdate(transaction);
        throw error;
      }
    ) as T;
  }

  endUpdate(transaction);
  return result;
}

// Type for messages with hybrid approach support
type Unsubscribe = () => void;

interface HybridListenable {
  [SET_UPDATE_LISTENER]: (
    key: symbol,
    callback: (val: Message<DataObject>) => void
  ) => Unsubscribe;
  [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void;
}

interface RetirableListenable {
  [RETIRE_UPDATE_LISTENER]: (key: symbol) => void;
}

function hasHybridListener<S>(value: S): value is S & HybridListenable {
  return (
    value !== null
    && typeof value === 'object'
    && SET_UPDATE_LISTENER in value
  );
}

function canRegisterPath<S>(value: S): value is S & HybridListenable {
  return (
    value !== null
    && typeof value === 'object'
    && REGISTER_PATH in value
  );
}

function canRetireListener<S>(value: S): value is S & RetirableListenable {
  return (
    value !== null
    && typeof value === 'object'
    && RETIRE_UPDATE_LISTENER in value
  );
}

/**
 * Register paths on a state tree for path-aware equality.
 * This allows equalsFromRoot to distinguish siblings with identical content.
 */
function registerPaths<S>(root: S): void {
  if (canRegisterPath(root)) {
    // Register the root with itself at path '' (empty string for root)
    (root as HybridListenable)[REGISTER_PATH](root as unknown as Message<DataObject>, '');
  }
}

export function usePropaneState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const listenerKeyRef = useRef(Symbol('propane:react:state-listener'));
  const activeRootRef = useRef<S | null>(null);
  const committedRootRef = useRef<S | null>(null);
  const fallbackUnsubscribeRef = useRef<Unsubscribe | null>(null);

  // Use ref to hold the current state setter for use in callbacks.
  type SetStateFn = React.Dispatch<React.SetStateAction<S>> | null;
  const setStateRef = useRef<SetStateFn>(null);

  const retireActiveListener = useCallback((): void => {
    const activeRoot = activeRootRef.current;
    if (activeRoot && canRetireListener(activeRoot)) {
      activeRoot[RETIRE_UPDATE_LISTENER](listenerKeyRef.current);
    } else {
      fallbackUnsubscribeRef.current?.();
    }
    activeRootRef.current = null;
    fallbackUnsubscribeRef.current = null;
  }, []);

  const bindListener = useCallback((root: S): void => {
    if (!hasHybridListener(root)) {
      retireActiveListener();
      return;
    }

    if (activeRootRef.current === root) {
      return;
    }

    retireActiveListener();
    registerPaths(root);
    const nextUnsubscribe = root[SET_UPDATE_LISTENER](
      listenerKeyRef.current,
      (next) => {
        const nextTyped = next as unknown as S;
        activeRootRef.current = nextTyped;
        registerPaths(nextTyped);
        scheduleStateUpdate(
          listenerKeyRef.current,
          () => {
            setStateRef.current?.(nextTyped);
          },
          () => {
            const committedRoot = committedRootRef.current;
            if (committedRoot && hasHybridListener(committedRoot)) {
              bindListener(committedRoot);
              return;
            }
            retireActiveListener();
          }
        );
      }
    );

    activeRootRef.current = root;
    fallbackUnsubscribeRef.current = nextUnsubscribe;
  }, [retireActiveListener]);

  const [state, setState] = useState<S>(() => {
    const initial = typeof initialState === 'function'
      ? (initialState as () => S)()
      : initialState;

    if (hasHybridListener(initial)) {
      bindListener(initial);
    } else {
      retireActiveListener();
    }

    return initial;
  });

  // Ensure listeners are retired when the hook unmounts.
  useEffect(() => {
    return () => retireActiveListener();
  }, [retireActiveListener]);

  // Keep setStateRef up to date.
  setStateRef.current = setState;
  committedRootRef.current = state;

  const setPropaneState: Dispatch<SetStateAction<S>> = useCallback((value) => {
    setState((prev) => {
      const next = typeof value === 'function'
        ? (value as (prev: S) => S)(prev)
        : value;
      if (equals(prev, next)) {
        return prev;
      }

      if (hasHybridListener(next)) {
        bindListener(next);
      } else {
        retireActiveListener();
      }

      return next;
    });
  }, [bindListener, retireActiveListener]);

  return [state, setPropaneState];
}

/**
 * Select a derived value from Propane state with automatic memoization.
 *
 * Similar to Redux's useSelector, this hook runs a selector function against
 * the state and only triggers a re-render when the selected value changes
 * (using Propane's structural equality via `equals()`).
 *
 * @example
 * // Only re-render when user.name changes, not on other state changes
 * const userName = usePropaneSelector(state, s => s.user.name);
 *
 * @example
 * // Derive computed values - re-renders only when result changes
 * const completedCount = usePropaneSelector(state, s =>
 *   s.todos.filter(t => t.completed).length
 * );
 *
 * @example
 * // Select nested objects - uses structural equality
 * const settings = usePropaneSelector(state, s => s.user.settings);
 */
export function usePropaneSelector<S extends object, R>(
  state: S,
  selector: (state: S) => R
): R {
  const listenerKeyRef = useRef(Symbol('propane:react:selector-listener'));
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const stateRef = useRef(state);
  stateRef.current = state;

  const selectedFromState = selector(state);
  const selectedRef = useRef<R | undefined>(undefined);
  if (
    selectedRef.current === undefined
    || !equalsFromRoot(state, selectedRef.current, selectedFromState)
  ) {
    selectedRef.current = selectedFromState;
  }

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!hasHybridListener(state)) {
        return () => undefined;
      }

      let active = true;
      let activeRoot: S | null = state;
      registerPaths(state);
      const fallbackUnsubscribe = state[SET_UPDATE_LISTENER](
        listenerKeyRef.current,
        (next) => {
          if (!active) {
            return;
          }

          const nextTyped = next as unknown as S;
          activeRoot = nextTyped;
          stateRef.current = nextTyped;
          registerPaths(nextTyped);

          const nextSelected = selectorRef.current(nextTyped);
          const prev = selectedRef.current;
          if (!equalsFromRoot(nextTyped, prev, nextSelected)) {
            selectedRef.current = nextSelected;
            onStoreChange();
          }
        }
      );

      return () => {
        active = false;
        if (activeRoot && canRetireListener(activeRoot)) {
          activeRoot[RETIRE_UPDATE_LISTENER](listenerKeyRef.current);
        } else {
          fallbackUnsubscribe();
        }
        activeRoot = null;
      };
    },
    [state]
  );

  const getSnapshot = useCallback(() => {
    return selectedRef.current!;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ============================================
// HYBRID APPROACH: Propane Root Context
// ============================================

/**
 * Context for tracking the current Propane state root.
 * Used by memoPropane to perform path-aware equality comparisons.
 */
const PropaneRootContext = createContext<unknown>(null);

/**
 * Props for PropaneRoot component.
 */
interface PropaneRootProps<T> {
  state: T;
  children: ReactNode;
}

/**
 * Provides the current Propane state root to descendant components.
 * Used by memoPropane to perform path-aware equality comparisons.
 *
 * @example
 * function App() {
 *   const [state] = usePropaneState(() => new AppState({ ... }));
 *   return (
 *     <PropaneRoot state={state}>
 *       <TodoList todos={state.todos} />
 *     </PropaneRoot>
 *   );
 * }
 */
export function PropaneRoot<T>({ state, children }: PropaneRootProps<T>) {
  return React.createElement(
    PropaneRootContext.Provider,
    { value: state },
    children
  );
}

// ============================================
// HYBRID APPROACH: Path-Aware Equality
// ============================================

/**
 * Check if a value is a Propane message with path-aware equality.
 */
function isEqualsFromRootCapable(value: unknown): value is {
  [EQUALS_FROM_ROOT]: (root: unknown, other: unknown) => boolean;
} {
  return (
    value !== null
    && typeof value === 'object'
    && EQUALS_FROM_ROOT in value
    && typeof (value as Record<symbol, unknown>)[EQUALS_FROM_ROOT] === 'function'
  );
}

/**
 * Compare two values with path-awareness when possible.
 */
function equalsFromRoot(root: unknown, a: unknown, b: unknown): boolean {
  // If both support path-aware equality, use it
  if (isEqualsFromRootCapable(a) && isEqualsFromRootCapable(b)) {
    return a[EQUALS_FROM_ROOT](root, b);
  }
  // Fall back to standard equality
  return equals(a, b);
}

/**
 * Shallow equal with path-awareness for Propane messages.
 */
function shallowEqualWithRoot(root: unknown, objA: unknown, objB: unknown) {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object'
    || objA === null
    || typeof objB !== 'object'
    || objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  const recordA = objA as Record<string, unknown>;
  const recordB = objB as Record<string, unknown>;
  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key)
      || !equalsFromRoot(root, recordA[key], recordB[key])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Memoize a component with Propane-aware equality checking.
 *
 * Uses path-aware equality when inside a PropaneRoot context,
 * which correctly distinguishes between structurally identical
 * messages at different positions in the state tree.
 *
 * @example
 * // This correctly handles arrays of identical items
 * const state = new AppState({
 *   todos: [new Todo('hello'), new Todo('hello')]
 * });
 *
 * // Without path awareness: todos[0].equals(todos[1]) === true
 * // With path awareness: equalsFromRoot(root, todos[0], todos[1]) === false
 *
 * const TodoItem = memoPropane(({ todo }: { todo: Todo }) => {
 *   return <div>{todo.text}</div>;
 * });
 */
export function memoPropane<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  // Store current root for comparison function
  let currentRoot: unknown = null;

  const MemoizedInner = memo(Component, (oldProps: P, newProps: P) => {
    return shallowEqualWithRoot(currentRoot, oldProps, newProps);
  });

  // Wrapper that captures current root before memo comparison runs
  function MemoWrapper(props: P) {
    currentRoot = useContext(PropaneRootContext);
    // Type assertion needed due to memo's complex return type
    return React.createElement(
      MemoizedInner as unknown as ComponentType<P>,
      props
    );
  }

  return MemoWrapper;
}
