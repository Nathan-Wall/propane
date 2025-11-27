import { normalizeForJson } from '../json/stringify.js';
import { ADD_UPDATE_LISTENER } from '../../symbols.js';
import type { Message } from '../../message.js';

type Listener<K, V> = (val: ImmutableMap<K, V>) => void;

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

const MAP_OBJECT_TAG = '[object Map]';
const IMMUTABLE_MAP_OBJECT_TAG = '[object ImmutableMap]';

function isImmutableMapLike(
  value: unknown
): value is ImmutableMap<unknown, unknown> {
  return (
    value instanceof ImmutableMap
    || Object.prototype.toString.call(value) === IMMUTABLE_MAP_OBJECT_TAG
  );
}

function isMapLike(value: unknown): value is ReadonlyMap<unknown, unknown> {
  if (!value || typeof value !== 'object') return false;
  const tag = Object.prototype.toString.call(value);
  return tag === MAP_OBJECT_TAG || tag === IMMUTABLE_MAP_OBJECT_TAG;
}

function equalKeys(a: unknown, b: unknown): boolean {
  if (a === b || Object.is(a, b)) {
    return true;
  }

  // Structural compare for map keys.
  if (isMapLike(a) && isMapLike(b)) {
    const aMap = isImmutableMapLike(a) ? a : new ImmutableMap(a);
    const bMap = isImmutableMapLike(b) ? b : new ImmutableMap(b);
    return aMap.equals(bMap);
  }

  if (isMessageLike(a) && a.equals(b)) {
    return true;
  }

  if (isMessageLike(b) && b.equals(a)) {
    return true;
  }

  return false;
}

export function equalValues(a: unknown, b: unknown): boolean {
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

const OBJECT_IDS = new WeakMap<object, number>();
let NEXT_OBJECT_ID = 1;

function getObjectId(obj: object): number {
  let id = OBJECT_IDS.get(obj);
  if (id === undefined) {
    id = NEXT_OBJECT_ID;
    NEXT_OBJECT_ID += 1;
    OBJECT_IDS.set(obj, id);
  }
  return id;
}

function hashKey(key: unknown): string {
  if (key === null) return 'null';
  const type = typeof key;
  if (type === 'undefined') return 'undefined';
  if (type === 'string') return `str:${key as string}`;
  if (type === 'number') {
    const numKey = key as number;
    return `num:${Object.is(numKey, -0) ? '-0' : numKey.toString()}`;
  }
  if (type === 'boolean') return `bool:${key ? '1' : '0'}`;
  if (type === 'bigint') return `big:${(key as bigint).toString()}`;
  if (type === 'symbol') {
    const desc = (key as symbol).description ?? '';
    return `sym:${desc}`;
  }

  if (isImmutableMapLike(key)) {
    return `map-h:${key.hashCode()}`;
  }

  if (isMapLike(key)) {
    const wrapped = new ImmutableMap(key);
    return `map-h:${wrapped.hashCode()}`;
  }

  if (isMessageLike(key)) {
    if (typeof key.hashCode === 'function') {
      return `msg-h:${key.hashCode()}`;
    }
    if (typeof key.serialize === 'function') {
      // serialize already returns the canonical string used in equals
      return `msg-s:${key.serialize()}`;
    }
  }

  // Fallback: use stable object identity via WeakMap surrogate; create once.
  const obj = key as object;
  const id = getObjectId(obj);
  return `obj:${id}`;
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

  return `obj:${getObjectId(value as object)}`;
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

export class ImmutableMap<K, V> implements ReadonlyMap<K, V> {
  #buckets: Map<string, [K, V][]>;
  #size: number;
  #hash?: number;
  protected readonly $listeners: Set<Listener<K, V>>;
  #childUnsubscribes: (() => void)[] = [];
  readonly [Symbol.toStringTag] = 'ImmutableMap';

  constructor(
    entries?:
      | Iterable<readonly [K, V]>
      | readonly (readonly [K, V])[]
      | ReadonlyMap<K, V>
      | null,
    listeners?: Set<Listener<K, V>>
  ) {
    this.$listeners = listeners ?? new Set();
    this.#buckets = new Map();
    this.#size = 0;

    if (entries) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const source: Iterable<readonly [K, V]> =
        entries instanceof Map || entries instanceof ImmutableMap
          ? entries.entries()
          // eslint-disable-next-line unicorn/new-for-builtins
          : Symbol.iterator in Object(entries)
            ? (entries as Iterable<readonly [K, V]>)
            : (() => {
              throw new TypeError(
                'ImmutableMap constructor expects an iterable of entries.'
              );
            })();

      for (const [key, value] of source) {
        this.#set(key, value);
      }
    }

    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
  }

  [ADD_UPDATE_LISTENER](listener: (val: this) => void): { unsubscribe: () => void } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const l = listener as unknown as Listener<K, V>;
    if (this.$listeners.size === 0) {
      this.$enableChildListeners();
    }
    this.$listeners.add(l);
    return {
      unsubscribe: () => {
        this.$listeners.delete(l);
        if (this.$listeners.size === 0) {
          this.$disableChildListeners();
        }
      },
    };
  }

  protected $enableChildListeners(): void {
    for (const bucket of this.#buckets.values()) {
      for (const [key, value] of bucket) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (isMessageLike(value) && (value as any)[ADD_UPDATE_LISTENER]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { unsubscribe } = (value as any)[ADD_UPDATE_LISTENER]((newValue: V) => {
            this.set(key, newValue);
          });
          this.#childUnsubscribes.push(unsubscribe);
        }
      }
    }
  }

  protected $disableChildListeners(): void {
    for (const unsubscribe of this.#childUnsubscribes) {
      unsubscribe();
    }
    this.#childUnsubscribes = [];
  }

  protected $update(value: this): this {
    for (const listener of [...this.$listeners]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listener(value as unknown as ImmutableMap<K, V>);
    }
    return value;
  }

  #set(key: K, value: V): void {
    const hash = hashKey(key);
    const bucket = this.#buckets.get(hash);
    if (!bucket) {
      this.#buckets.set(hash, [[key, value]]);
      this.#size += 1;
      return;
    }
    const match = bucket.findIndex(([k]) => equalKeys(k, key));
    if (match === -1) {
      bucket.push([key, value]);
      this.#size += 1;
    } else {
      bucket[match] = [key, value];
    }
  }

  set(key: K, value: V): ImmutableMap<K, V> {
    const hash = hashKey(key);
    const bucket = this.#buckets.get(hash);
    if (bucket) {
      const entry = bucket.find(([k]) => equalKeys(k, key));
      if (entry && equalValues(entry[1], value)) {
        return this;
      }
    }
    const next = new ImmutableMap([...this, [key, value]], new Set(this.$listeners));
    return this.$update(next as this);
  }

  delete(key: K): ImmutableMap<K, V> {
    if (!this.has(key)) return this;
    const newEntries = [...this].filter(([k]) => !equalKeys(k, key));
    const next = new ImmutableMap(newEntries, new Set(this.$listeners));
    return this.$update(next as this);
  }

  clear(): ImmutableMap<K, V> {
    if (this.size === 0) return this;
    const next = new ImmutableMap(null, new Set(this.$listeners));
    return this.$update(next as this);
  }

  get size(): number {
    return this.#size;
  }

  has(key: K): boolean {
    const bucket = this.#buckets.get(hashKey(key));
    if (!bucket) return false;
    return bucket.some(([k]) => equalKeys(k, key));
  }

  get(key: K): V | undefined {
    const bucket = this.#buckets.get(hashKey(key));
    if (!bucket) return undefined;
    const entry = bucket.find(([k]) => equalKeys(k, key));
    return entry?.[1];
  }

  entries(): IterableIterator<[K, V]> {
    const all: [K, V][] = [];
    for (const bucket of this.#buckets.values()) {
      all.push(...bucket);
    }
    return all.values();
  }

  keys(): IterableIterator<K> {
    function* keyGen(buckets: Map<string, [K, V][]>) {
      for (const bucket of buckets.values()) {
        for (const [k] of bucket) {
          yield k;
        }
      }
    }
    return keyGen(this.#buckets);
  }

  values(): IterableIterator<V> {
    function* valueGen(buckets: Map<string, [K, V][]>) {
      for (const bucket of buckets.values()) {
        for (const [, v] of bucket) {
          yield v;
        }
      }
    }
    return valueGen(this.#buckets);
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    thisArg?: unknown
  ): void {
    for (const bucket of this.#buckets.values()) {
      for (const [key, value] of bucket) {
        callbackfn.call(thisArg, value, key, this);
      }
    }
  }

  equals(other: ReadonlyMap<K, V> | null | undefined): boolean {
    if (!other) {
      return false;
    }

    if (this.size !== other.size) {
      return false;
    }

    for (const [key, value] of this) {
      const otherValue = other.get(key);
      if (otherValue === undefined && !other.has(key)) {
        return false;
      }
      if (!equalValues(otherValue, value)) {
        return false;
      }
    }

    return true;
  }

  hashCode(): number {
    if (this.#hash !== undefined) {
      return this.#hash;
    }

    // Order-independent hash: hash each entry, sort hashes for determinism,
    // then sum.
    const entryHashes: number[] = [];
    for (const [key, value] of this) {
      const entryKey = hashKey(key);
      const entryVal = hashValue(value);
      entryHashes.push(hashString(`k:${entryKey}|v:${entryVal}`));
    }
    entryHashes.sort((a, b) => a - b);
    let hash = 0;
    for (const h of entryHashes) {
      hash = (hash + h) | 0;
    }
    this.#hash = hash;
    return hash;
  }

  toMap(): Map<K, V> {
    const m = new Map<K, V>();
    for (const [k, v] of this) {
      m.set(k, v);
    }
    return m;
  }

  toJSON(): unknown {
    return [...this].map(([k, v]) => [
      normalizeForJson(k),
      normalizeForJson(v)
    ]);
  }
}
