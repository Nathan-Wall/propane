import { useState, useEffect, useCallback, memo } from 'react';
import type { Dispatch, SetStateAction, ComponentType } from 'react';
import { equals, ADD_UPDATE_LISTENER } from '@propanejs/runtime';

interface PropaneListenable<T> {
  [ADD_UPDATE_LISTENER](
    listener: (val: T) => void
  ): { unsubscribe: () => void };
}

export function usePropaneState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (
      state
      && typeof state === 'object'
      && ADD_UPDATE_LISTENER in state
    ) {
      const listenableState = state as unknown as PropaneListenable<S>;
      const { unsubscribe } = listenableState[ADD_UPDATE_LISTENER](
        (next: S) => {
          setState(next);
        }
      );
      return unsubscribe;
    }
  }, [state]);

  const setPropaneState: Dispatch<SetStateAction<S>> = useCallback((value) => {
    setState((prev) => {
      const next = typeof value === 'function'
        ? (value as (prev: S) => S)(prev)
        : value;
      if (equals(prev, next)) {
        return prev;
      }
      return next;
    });
  }, []);

  return [state, setPropaneState];
}

function shallowEqual(objA: any, objB: any) {
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

  const keysA = Object.keys(objA as object);
  const keysB = Object.keys(objB as object);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      || !equals(objA[key], objB[key])
    ) {
      return false;
    }
  }

  return true;
}

export function memoPropane<P extends object>(Component: ComponentType<P>) {
  return memo(Component, shallowEqual);
}