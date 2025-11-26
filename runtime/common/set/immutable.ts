import { normalizeForJson } from '../json/stringify.js';

function isMessageLike(value: unknown): value is {
  equals: (other: unknown) => boolean;
  hashCode?: () => number;
  serialize?: () => string;
} {
  return Boolean(
    value
    && typeof value === 'object'
    && typeof (value as { equals?: unknown }).equals === 'function'
  );
}

function equalValues(a: unknown, b: unknown): boolean {
  if (a === b || Object.is(a, b)) {
    return true;
  }

  if (isMessageLike(a) && a.equals(b)) {
    return true;
  }

  if (isMessageLike(b) && b.equals(a)) {
    return true;
  }

  return false;
}

// Simple deterministic string hash (Java-style)
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function hashValue(value: unknown): string {
  if (isMessageLike(value)) {
    if (typeof value.hashCode === 'function') {
      return `msg-h:${value.hashCode()}`;
    }
    if (typeof value.serialize === 'function') {
      return `msg-s:${value.serialize()}`;
    }
  }

  const type = typeof value;
  if (value === null) return 'null';
  if (type === 'undefined') return 'undefined';
  if (type === 'string') return `str:${value as string}`;
  if (type === 'number') {
    const numVal = value as number;
    return `num:${Object.is(numVal, -0) ? '-0' : numVal.toString()}`;
  }
  if (type === 'boolean') return `bool:${value ? '1' : '0'}`;
  if (type === 'bigint') return `big:${(value as bigint).toString()}`;
  if (type === 'symbol') {
    const desc = (value as symbol).description ?? '';
    return `sym:${desc}`;
  }

  return `obj:${hashString(Object.prototype.toString.call(value))}`;
}

export class ImmutableSet<T> implements ReadonlySet<T> {
  #buckets: Map<string, T[]>;
  #size: number;
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableSet';

  constructor(values?: Iterable<T> | ReadonlySet<T> | readonly T[]) {
    const source: Iterable<T> =
      values
        ? values instanceof Set || values instanceof ImmutableSet
          ? values.values()
          // eslint-disable-next-line unicorn/new-for-builtins
          : Symbol.iterator in Object(values)
            ? (values as Iterable<T>)
            : (() => {
              throw new TypeError(
                'ImmutableSet constructor expects an iterable of values.'
              );
              })()
        : [];

    this.#buckets = new Map();
    this.#size = 0;

    for (const value of source) {
      const h = hashValue(value);
      const bucket = this.#buckets.get(h);
      if (!bucket) {
        this.#buckets.set(h, [value]);
        this.#size += 1;
        continue;
      }
      const exists = bucket.some((v) => equalValues(v, value));
      if (!exists) {
        bucket.push(value);
        this.#size += 1;
      }
    }

    Object.freeze(this);
  }

  get size(): number {
    return this.#size;
  }

  has(value: T): boolean {
    const bucket = this.#buckets.get(hashValue(value));
    if (!bucket) return false;
    return bucket.some((v) => equalValues(v, value));
  }

  entries(): IterableIterator<[T, T]> {
    const all: [T, T][] = [];
    for (const bucket of this.#buckets.values()) {
      for (const v of bucket) {
        all.push([v, v]);
      }
    }
    return all.values();
  }

  keys(): IterableIterator<T> {
    return this.values();
  }

  values(): IterableIterator<T> {
    const all: T[] = [];
    for (const bucket of this.#buckets.values()) {
      all.push(...bucket);
    }
    return all.values();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: unknown
  ): void {
    for (const bucket of this.#buckets.values()) {
      for (const v of bucket) {
        callbackfn.call(thisArg, v, v, this);
      }
    }
  }

  equals(other: ReadonlySet<T> | null | undefined): boolean {
    if (!other) return false;
    if (this.size !== other.size) return false;
    for (const val of this) {
      if (!other.has(val)) return false;
    }
    return true;
  }

  hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    const hashes: number[] = [];
    for (const v of this) {
      hashes.push(hashString(hashValue(v)));
    }
    hashes.sort((a, b) => a - b);
    let hash = 0;
    for (const h of hashes) {
      hash = (hash + h) | 0;
    }
    this.#hash = hash;
    return hash;
  }

  toSet(): Set<T> {
    return new Set(this);
  }

  toJSON(): unknown {
    return [...this].map((v) => normalizeForJson(v));
  }
}
