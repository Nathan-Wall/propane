// @ts-nocheck
import { ImmutableArrayBuffer } from './immutable-array-buffer.js';
import { ImmutableMap } from '../map/immutable.js';
import { ImmutableSet } from '../set/immutable.js';
import { ImmutableArray } from '../array/immutable.js';


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
  return value instanceof Map || value instanceof ImmutableMap;
}

function isSetLike(value: unknown): value is ReadonlySet<unknown> {
  return value instanceof Set || value instanceof ImmutableSet;
}

function isArrayLike(value: unknown): value is ArrayLike<unknown> {
  return Array.isArray(value) || value instanceof ImmutableArray;
}

function isArrayBufferLike(value: unknown): value is ArrayBuffer {
  return value instanceof ArrayBuffer || value instanceof ImmutableArrayBuffer;
}

function arrayBufferEquals(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  const viewA = new Uint8Array(a);
  const viewB = new Uint8Array(b);


  for (let i = 0; i < viewA.length; i += 1) {
    if (viewA[i] !== viewB[i]) {
      return false;
    }
  }

  return true;
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

  if (isArrayBufferLike(a) && isArrayBufferLike(b)) {
    return arrayBufferEquals(a, b);
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
      if (![...b].some((entry) => equals(entry, val))) return false;
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
