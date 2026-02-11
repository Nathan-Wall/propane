import { ImmutableMap } from '../map/immutable.js';
import { ImmutableSet } from '../set/immutable.js';
import { ImmutableArray } from '../array/immutable.js';

type EqualsFn = (a: unknown, b: unknown) => boolean;

function supportsEquals(
  value: unknown
): value is { equals: (other: unknown) => boolean } {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as { equals?: unknown }).equals === 'function'
  );
}

function isMapLike(value: unknown): value is ReadonlyMap<unknown, unknown> {
  return value instanceof Map || ImmutableMap.isInstance(value);
}

function isSetLike(value: unknown): value is ReadonlySet<unknown> {
  return value instanceof Set || ImmutableSet.isInstance(value);
}

function isArrayLike(
  value: unknown
): value is readonly unknown[] | ImmutableArray<unknown> {
  return Array.isArray(value) || ImmutableArray.isInstance(value);
}

export const equals: EqualsFn = (a, b): boolean => {
  if (a === b || Object.is(a, b)) {
    return true;
  }

  if (supportsEquals(a)) {
    return a.equals(b);
  }

  if (supportsEquals(b)) {
    return b.equals(a);
  }

  if (isMapLike(a) && isMapLike(b)) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key)) return false;
      if (!equals(val, b.get(key))) return false;
    }
    return true;
  }

  if (isSetLike(a) && isSetLike(b)) {
    if (a.size !== b.size) return false;
    for (const val of a) {
      if (![...b].some(entry => equals(entry, val))) return false;
    }
    return true;
  }

  if (isArrayLike(a) && isArrayLike(b)) {
    const arrA = [...a];
    const arrB = [...b];
    if (arrA.length !== arrB.length) return false;
    for (const [i, val] of arrA.entries()) {
      if (!equals(val, arrB[i])) return false;
    }
    return true;
  }

  return false;
};
