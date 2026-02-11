// @ts-nocheck
import { ImmutableMap } from '../map/immutable.js';
import { ImmutableSet } from '../set/immutable.js';
import { ImmutableArray } from '../array/immutable.js';

export function normalizeForJson(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    return null;
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (
    value
    && typeof value === 'object'
    && typeof (value as { toJSON?: unknown }).toJSON === 'function'
  ) {
    const jsonValue = (value as { toJSON: () => unknown }).toJSON();

    // Avoid infinite recursion when toJSON returns the receiver.
    if (jsonValue === value) {
      return jsonValue;
    }

    return normalizeForJson(jsonValue);
  }

  if (isImmutableMapLike(value)) {
    return [...value.entries()].map(([k, v]) => [
      normalizeForJson(k),
      normalizeForJson(v)
    ]);
  }

  if (isImmutableSetLike(value)) {
    return [...value.values()].map(v => normalizeForJson(v));
  }

  if (isImmutableArrayLike(value)) {
    return [...value.values()].map(v => normalizeForJson(v));
  }

  if (value instanceof Map) {
    return [...value.entries()].map(([k, v]) => [
      normalizeForJson(k),
      normalizeForJson(v)
    ]);
  }

  if (value instanceof Set) {
    return [...value.values()].map(v => normalizeForJson(v));
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeForJson(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = normalizeForJson(v);
    }
    return result;
  }

  return value;
}

function isImmutableMapLike(
  value: unknown
): value is ImmutableMap<unknown, unknown> {
  return ImmutableMap.isInstance(value);
}

function isImmutableSetLike(
  value: unknown
): value is ImmutableSet<unknown> {
  return ImmutableSet.isInstance(value);
}

function isImmutableArrayLike(
  value: unknown
): value is ImmutableArray<unknown> {
  return ImmutableArray.isInstance(value);
}
