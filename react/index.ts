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
  REGISTER_PATH,
  EQUALS_FROM_ROOT,
} from '@/runtime/index.js';

// Tracks whether we're inside an update() callback
let updateDepth = 0;
let pendingStateUpdate: (() => void) | null = null;

function beginUpdate(): void {
  updateDepth++;
  if (updateDepth === 1) {
    pendingStateUpdate = null;
  }
}

function endUpdate(): void {
  updateDepth--;
  if (updateDepth === 0 && pendingStateUpdate) {
    const stateUpdate = pendingStateUpdate;
    pendingStateUpdate = null;
    stateUpdate();
  }
}

function scheduleStateUpdate(updateFn: () => void): void {
  if (updateDepth > 0) {
    // Inside update(): record the state change (last one wins)
    pendingStateUpdate = updateFn;
  }
  // Outside update(): ignore - React state only changes within update()
}

/**
 * Enable React state updates for Propane setter calls.
 *
 * Propane setters only trigger React re-renders when called inside an
 * update() callback. Setters called outside update() still return new
 * Propane instances but won't update React state.
 *
 * When multiple setters are called, only the final state is applied to React
 * (avoiding unnecessary intermediate renders).
 *
 * Supports both sync and async callbacks.
 *
 * @example
 * // Sync: updates React state after callback completes
 * update(() => {
 *   game.setCurrentMove(0);
 *   game.setHistory([initialBoard]);
 * });
 *
 * @example
 * // Async: updates React state after promise resolves
 * await update(async () => {
 *   const data = await fetchData();
 *   state.setData(data);
 * });
 *
 * @example
 * // Outside update(): no React re-render
 * game.setCurrentMove(0); // Returns new instance, but React state unchanged
 */
export function update<T>(callback: () => T): T {
  beginUpdate();

  let isAsync = false;

  try {
    const result = callback();

    if (result instanceof Promise) {
      isAsync = true;
      return result.then(
        (value: Awaited<T>) => {
          endUpdate();
          return value;
        },
        (error: unknown) => {
          updateDepth--;
          pendingStateUpdate = null;
          throw error;
        }
      ) as T;
    }

    return result;
  } finally {
    if (!isAsync) {
      endUpdate();
    }
  }
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
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Use ref to hold the current state setter for use in callbacks.
  type SetStateFn = React.Dispatch<React.SetStateAction<S>> | null;
  const setStateRef = useRef<SetStateFn>(null);

  const bindListener = useCallback((root: S): void => {
    if (!hasHybridListener(root)) {
      return;
    }

    registerPaths(root);
    const nextUnsubscribe = root[SET_UPDATE_LISTENER](
      listenerKeyRef.current,
      (next) => {
        scheduleStateUpdate(() => {
          const nextTyped = next as unknown as S;
          bindListener(nextTyped);
          setStateRef.current?.(nextTyped);
        });
      }
    );

    const previousUnsubscribe = unsubscribeRef.current;
    unsubscribeRef.current = nextUnsubscribe;
    previousUnsubscribe?.();
  }, []);

  const [state, setState] = useState<S>(() => {
    const initial = typeof initialState === 'function'
      ? (initialState as () => S)()
      : initialState;

    if (hasHybridListener(initial)) {
      bindListener(initial);
    } else {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    }

    return initial;
  });

  // Ensure listeners are retired when the hook unmounts.
  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, []);

  // Keep setStateRef up to date.
  setStateRef.current = setState;

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
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
      }

      return next;
    });
  }, [bindListener]);

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

  const selectedRef = useRef<R | undefined>(undefined);
  if (selectedRef.current === undefined) {
    selectedRef.current = selector(state);
  }

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!hasHybridListener(state)) {
        return () => undefined;
      }

      let active = true;
      let currentUnsubscribe: Unsubscribe | null = null;

      const bindListener = (root: S): void => {
        if (!active || !hasHybridListener(root)) {
          return;
        }

        registerPaths(root);
        const nextUnsubscribe = root[SET_UPDATE_LISTENER](
          listenerKeyRef.current,
          (next) => {
            if (!active) {
              return;
            }

            const nextTyped = next as unknown as S;
            stateRef.current = nextTyped;
            bindListener(nextTyped);

            const nextSelected = selectorRef.current(nextTyped);
            const prev = selectedRef.current;
            if (!equalsFromRoot(nextTyped, prev, nextSelected)) {
              selectedRef.current = nextSelected;
              onStoreChange();
            }
          }
        );

        const previousUnsubscribe = currentUnsubscribe;
        currentUnsubscribe = nextUnsubscribe;
        previousUnsubscribe?.();
      };

      bindListener(state);

      return () => {
        active = false;
        currentUnsubscribe?.();
        currentUnsubscribe = null;
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
