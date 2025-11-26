// @ts-nocheck
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

export class ImmutableArray<T> implements ReadonlyArray<T> {
  #items: T[];
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableArray';

  constructor(items?: Iterable<T> | ArrayLike<T>) {
    if (!items) {
      this.#items = [];
      this.#defineIndexProps();
      return;
    }
    // eslint-disable-next-line unicorn/new-for-builtins
    if (Symbol.iterator in Object(items)) {
      this.#items = [...(items as Iterable<T>)];
    } else {
      const arrayLike = items as ArrayLike<T>;
      this.#items = Array.from(
        { length: arrayLike.length },
        (_, i) => arrayLike[i]
      );
    }
    this.#defineIndexProps();
    Object.freeze(this.#items);
    Object.freeze(this);
  }

  get length(): number {
    return this.#items.length;
  }

  [n: number]: T;

  at(index: number): T | undefined {
    return this.#items[index];
  }

  get(index: number): T | undefined {
    return this.#items[index];
  }

  entries(): IterableIterator<[number, T]> {
    return this.#items.entries();
  }

  keys(): IterableIterator<number> {
    return this.#items.keys();
  }

  values(): IterableIterator<T> {
    return this.#items.values();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  forEach(
    callbackfn: (value: T, index: number, array: readonly T[]) => void,
    thisArg?: unknown
  ): void {
    for (const [i, v] of this.#items.entries()) {
      callbackfn.call(thisArg, v, i, this);
    }
  }

  map<U>(
    fn: (value: T, index: number, array: readonly T[]) => U
  ): ImmutableArray<U> {
    return new ImmutableArray(this.#items.map(fn));
  }

  filter(
    fn: (value: T, index: number, array: readonly T[]) => boolean
  ): ImmutableArray<T> {
    return new ImmutableArray(this.#items.filter(fn));
  }

  equals(other: readonly T[] | null | undefined): boolean {
    if (!other) return false;
    const otherItems = Array.isArray(other)
      ? other
      : typeof (other as Iterable<T>)[Symbol.iterator] === 'function'
        ? [...(other as Iterable<T>)]
        : null;
    if (!otherItems) return false;
    if (this.length !== otherItems.length) return false;
    for (let i = 0; i < this.length; i += 1) {
      if (!equalValues(this.#items[i], otherItems[i])) {
        return false;
      }
    }
    return true;
  }

  hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    let hash = 1;
    for (const item of this.#items) {
      hash = (31 * hash + hashString(hashValue(item))) | 0;
    }
    this.#hash = hash;
    return hash;
  }

  toArray(): T[] {
    return [...this.#items];
  }

  toJSON(): unknown {
    return this.#items.map((v) => normalizeForJson(v));
  }

  #defineIndexProps() {
    for (let i = 0; i < this.#items.length; i += 1) {
      (this as unknown as Record<number, T>)[i] = this.#items[i];
    }
  }
}
