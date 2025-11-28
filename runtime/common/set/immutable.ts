import { normalizeForJson } from '../json/stringify.js';
import { ADD_UPDATE_LISTENER } from '../../symbols.js';
import { needsDetach, detachValue } from '../detach.js';

function isMessageLike(value: unknown): value is {
  equals: (other: unknown) => boolean;
  hashCode?: () => number;
  serialize?: () => string;
  [ADD_UPDATE_LISTENER]?: (listener: (val: unknown) => void) => unknown;
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return `obj:${hashString(Object.prototype.toString.call(value))}`;
}

type Listener<T> = (val: ImmutableSet<T>) => void;

export class ImmutableSet<T> implements ReadonlySet<T> {
  #buckets: Map<string, T[]>;
  #size: number;
  #hash?: number;
  protected readonly $listeners: Set<Listener<T>>;
  readonly [Symbol.toStringTag] = 'ImmutableSet';

  constructor(
    values?: Iterable<T> | ReadonlySet<T> | readonly T[],
    listeners?: Set<Listener<T>>
  ) {
    this.$listeners = listeners ?? new Set();
    this.#buckets = new Map();
    this.#size = 0;

    if (values) {
      const source: Iterable<T> =
        values instanceof Set || values instanceof ImmutableSet
          ? values.values()
          // eslint-disable-next-line unicorn/new-for-builtins
          : Symbol.iterator in Object(values)
            ? (values as Iterable<T>)
            : (() => {
              throw new TypeError(
                'ImmutableSet constructor expects an iterable of values.'
              );
            })();

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
    }

    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    
    Object.freeze(this);
  }

  [ADD_UPDATE_LISTENER](
    listener: (val: ImmutableSet<T>) => void
  ): ImmutableSet<T> {
    const l = listener as unknown as Listener<T>;
    const newListeners = new Set(this.$listeners);
    newListeners.add(l);

    return new ImmutableSet(
      [...this],
      newListeners
    );
  }

  protected $enableChildListeners(): void {
    for (const bucket of this.#buckets.values()) {
      for (let i = 0; i < bucket.length; i++) {
        const value = bucket[i];
        if (isMessageLike(value) && value[ADD_UPDATE_LISTENER]) {
          const listened = value[ADD_UPDATE_LISTENER]((updatedValue: T) => {
            // We must replace the item.
            const newValues: T[] = [];
            for (const v of this) {
              if (equalValues(v, listened)) continue;
              newValues.push(v);
            }
            newValues.push(updatedValue);
            const nextInstance = new ImmutableSet(
              newValues,
              new Set(this.$listeners)
            );
            this.$update(nextInstance as this);
          });
          bucket[i] = listened as T;
        }
      }
    }
  }

  protected $update(value: this): this {
    // eslint-disable-next-line unicorn/no-useless-spread
    for (const listener of [...this.$listeners]) {
      listener(value as unknown as ImmutableSet<T>);
    }
    return value;
  }

  /**
   * Create a copy of this set detached from the state tree.
   * Recursively detaches all child values.
   * Setters on the returned set won't trigger React state updates.
   */
  detach(): ImmutableSet<T> {
    if (this.$listeners.size === 0) {
      // Still need to detach children if they have listeners
      let childNeedsDetach = false;
      for (const v of this) {
        if (needsDetach(v)) {
          childNeedsDetach = true;
          break;
        }
      }
      if (!childNeedsDetach) {
        return this;
      }
    }
    const detachedValues: T[] = [];
    for (const v of this) {
      detachedValues.push(detachValue(v));
    }
    return new ImmutableSet(detachedValues);
  }

  add(value: T): ImmutableSet<T> {
    if (this.has(value)) return this;
    const next = new ImmutableSet(
      [...this, value],
      new Set(this.$listeners)
    );
    return this.$update(next as this);
  }

  delete(value: T): ImmutableSet<T> {
    if (!this.has(value)) return this;
    const newValues: T[] = [];
    for (const v of this) {
      if (!equalValues(v, value)) newValues.push(v);
    }
    const next = new ImmutableSet(
      newValues,
      new Set(this.$listeners)
    );
    return this.$update(next as this);
  }

  clear(): ImmutableSet<T> {
    if (this.size === 0) return this;
    const next = new ImmutableSet([], new Set(this.$listeners));
    return this.$update(next as this);
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
