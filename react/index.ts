import { useState, useCallback, useRef, useSyncExternalStore, memo } from 'react';
import type { Dispatch, SetStateAction, ComponentType } from 'react';
import { equals, ADD_UPDATE_LISTENER } from '@propanejs/runtime';

interface PropaneListenable<T> {
  [ADD_UPDATE_LISTENER](listener: (val: T) => void): T;
}

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

export function usePropaneState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => {
    const initial = typeof initialState === 'function'
      ? (initialState as () => S)()
      : initialState;

    // Subscribe immediately if it's a listenable
    if (
      initial
      && typeof initial === 'object'
      && ADD_UPDATE_LISTENER in initial
    ) {
      const listenable = initial as unknown as PropaneListenable<S>;
      return listenable[ADD_UPDATE_LISTENER]((next: S) => {
        scheduleStateUpdate(() => setState(next));
      });
    }

    return initial;
  });

  const setPropaneState: Dispatch<SetStateAction<S>> = useCallback((value) => {
    setState((prev) => {
      const next = typeof value === 'function'
        ? (value as (prev: S) => S)(prev)
        : value;
      if (equals(prev, next)) {
        return prev;
      }
      // Subscribe to the new value if it's a listenable
      if (
        next
        && typeof next === 'object'
        && ADD_UPDATE_LISTENER in next
      ) {
        const listenable = next as unknown as PropaneListenable<S>;
        return listenable[ADD_UPDATE_LISTENER]((updated: S) => {
          scheduleStateUpdate(() => setState(updated));
        });
      }
      return next;
    });
  }, []);

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
      if (
        state
        && typeof state === 'object'
        && ADD_UPDATE_LISTENER in state
      ) {
        const listenable = state as unknown as PropaneListenable<S>;
        const subscribed = listenable[ADD_UPDATE_LISTENER]((next: S) => {
          stateRef.current = next;
          const nextSelected = selectorRef.current(next);
          if (!equals(selectedRef.current, nextSelected)) {
            selectedRef.current = nextSelected;
            onStoreChange();
          }
        });
        stateRef.current = subscribed;
        return () => {
          // Cleanup handled by Propane internally via weak refs
        };
      }
      return () => {};
    },
    [state]
  );

  const getSnapshot = useCallback(() => {
    return selectedRef.current as R;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function shallowEqual(objA: unknown, objB: unknown) {
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
      || !equals(recordA[key], recordB[key])
    ) {
      return false;
    }
  }

  return true;
}

export function memoPropane<P extends object>(Component: ComponentType<P>) {
  return memo(Component, shallowEqual);
}
