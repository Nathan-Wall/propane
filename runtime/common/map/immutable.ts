import { normalizeForJson } from '../json/stringify.js';
import {
  SET_UPDATE_LISTENER,
  REGISTER_PATH,
  PROPAGATE_UPDATE,
  WITH_CHILD,
  FROM_ROOT,
} from '../../symbols.js';
import { needsDetach, detachValue } from '../detach.js';
import type { Message, DataObject } from '../../message.js';

// Type for update listener callback
type UpdateListenerCallback = (msg: Message<DataObject>) => void;

// Type for parent chain entry
interface ParentChainEntry {
  parent: WeakRef<Message<DataObject> | ImmutableMap<unknown, unknown>>;
  key: string | number;
}

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

function isImmutableMapLike(
  value: unknown
): value is ImmutableMap<unknown, unknown> {
  return value instanceof ImmutableMap;
}

function isMapLike(value: unknown): value is ReadonlyMap<unknown, unknown> {
  return value instanceof Map || value instanceof ImmutableMap;
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
    hash = hash * 31 + value.charCodeAt(i) | 0;
  }
  return hash;
}

export class ImmutableMap<K, V> implements ReadonlyMap<K, V> {
  #buckets: Map<string, [K, V][]>;
  #size: number;
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableMap';

  // Hybrid approach: path tracking for equality comparisons
  readonly #fromRoot = new WeakMap<Message<DataObject>, string>();

  // Hybrid approach: parent chains for update propagation (keyed by listener symbol)
  readonly #parentChains = new Map<symbol, ParentChainEntry>();

  // Hybrid approach: callbacks for update propagation (keyed by listener symbol)
  readonly #callbacks = new Map<symbol, UpdateListenerCallback>();

  /**
   * Returns an ImmutableMap from the input.
   * If the input is already an ImmutableMap, returns it as-is.
   */
  static from<K, V>(
    input: ImmutableMap<K, V> | ReadonlyMap<K, V> | Iterable<readonly [K, V]>
  ): ImmutableMap<K, V> {
    return input instanceof ImmutableMap ? input : new ImmutableMap(input);
  }

  constructor(
    entries?:
      | Iterable<readonly [K, V]>
      | readonly (readonly [K, V])[]
      | ReadonlyMap<K, V>
      | null
  ) {
    this.#buckets = new Map();
    this.#size = 0;

    if (entries) {
      const source: Iterable<readonly [K, V]> =
        entries instanceof Map
        || entries instanceof ImmutableMap
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
  }

  /**
   * Check if this map has active listeners (parent chains or callbacks).
   */
  private hasActiveListeners(): boolean {
    return this.#parentChains.size > 0 || this.#callbacks.size > 0;
  }

  /**
   * Propagate updates through parent chains.
   */
  private $propagateUpdates(newMap: ImmutableMap<K, V>): void {
    type WithChildFn = {
      [WITH_CHILD]: (key: string | number, child: unknown) => unknown;
    };
    type PropagateFn = {
      [PROPAGATE_UPDATE]: (key: symbol, replacement: unknown) => void;
    };
    for (const [key, entry] of this.#parentChains) {
      const parent = entry.parent.deref();
      if (!parent) continue;
      const newParent = (parent as WithChildFn)[WITH_CHILD](
        entry.key, newMap
      );
      (parent as PropagateFn)[PROPAGATE_UPDATE](key, newParent);
    }
    // Also call direct callbacks at the root level
    for (const [, callback] of this.#callbacks) {
      callback(newMap as unknown as Message<DataObject>);
    }
  }

  /**
   * Update the map and propagate through parent chains.
   */
  protected $update(value: this): this {
    this.$propagateUpdates(value as unknown as ImmutableMap<K, V>);
    return value;
  }

  // ============================================
  // HYBRID APPROACH: Path Registration
  // ============================================

  public [REGISTER_PATH](root: Message<DataObject>, path: string): void {
    this.#fromRoot.set(root, path);
    for (const [key, value] of this) {
      const keyStr = this.#serializeKeyForPath(key);
      if (isMessageLike(value) && REGISTER_PATH in value) {
        (value as { [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void })[REGISTER_PATH](root, `${path}[${keyStr}]`);
      }
    }
  }

  #serializeKeyForPath(key: K): string {
    if (typeof key === 'string') return JSON.stringify(key);
    if (typeof key === 'number') return String(key);
    return hashKey(key);
  }

  public [FROM_ROOT](root: Message<DataObject>): string | undefined {
    return this.#fromRoot.get(root);
  }

  // ============================================
  // HYBRID APPROACH: Update Listener Management
  // ============================================

  public [SET_UPDATE_LISTENER](
    key: symbol,
    callback: UpdateListenerCallback,
    parent?: Message<DataObject>,
    parentKey?: string | number
  ): void {
    this.#callbacks.set(key, callback);
    if (parent !== undefined && parentKey !== undefined) {
      this.#parentChains.set(key, {
        parent: new WeakRef(parent),
        key: parentKey,
      });
    }

    for (const [mapKey, value] of this) {
      if (isMessageLike(value) && SET_UPDATE_LISTENER in value) {
        type ListenableFn = {
          $setParentChain: (
            key: symbol, parent: unknown, parentKey: string | number
          ) => void;
          [SET_UPDATE_LISTENER]: (
            key: symbol, callback: UpdateListenerCallback
          ) => void;
        };
        const msgValue = value as unknown as ListenableFn;
        const keyStr = this.#serializeKeyForPath(mapKey);
        msgValue.$setParentChain(key, this, keyStr);
        msgValue[SET_UPDATE_LISTENER](key, callback);
      }
    }
  }

  // ============================================
  // HYBRID APPROACH: Update Propagation
  // ============================================

  public [WITH_CHILD](mapKey: string, child: V): ImmutableMap<K, V> {
    // Find the original key that matches this serialized key
    for (const [key] of this) {
      if (this.#serializeKeyForPath(key) === mapKey) {
        return this.set(key, child);
      }
    }
    return this;
  }

  public [PROPAGATE_UPDATE](
    key: symbol,
    replacement: ImmutableMap<K, V>
  ): void {
    const chain = this.#parentChains.get(key);

    type WithChildFn = {
      [WITH_CHILD]: (key: string | number, child: unknown) => unknown;
    };
    type PropagateFn = {
      [PROPAGATE_UPDATE]: (key: symbol, replacement: unknown) => void;
    };
    if (chain?.parent.deref()) {
      const parent = chain.parent.deref();
      const newParent = (parent as WithChildFn)[WITH_CHILD](
        chain.key, replacement
      );
      (parent as PropagateFn)[PROPAGATE_UPDATE](key, newParent);
    } else {
      const callback = this.#callbacks.get(key);
      if (callback) {
        callback(replacement as unknown as Message<DataObject>);
      }
    }
  }

  /**
   * Create a copy of this map detached from the state tree.
   * Recursively detaches all child keys and values.
   * Setters on the returned map won't trigger React state updates.
   */
  detach(): ImmutableMap<K, V> {
    if (!this.hasActiveListeners()) {
      // Still need to detach children if they have listeners
      let childNeedsDetach = false;
      for (const [k, v] of this) {
        if (needsDetach(k) || needsDetach(v)) {
          childNeedsDetach = true;
          break;
        }
      }
      if (!childNeedsDetach) {
        return this;
      }
    }
    const detachedEntries: [K, V][] = [];
    for (const [k, v] of this) {
      detachedEntries.push([detachValue(k), detachValue(v)]);
    }
    return new ImmutableMap(detachedEntries);
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
    const next = new ImmutableMap([...this, [key, value]]);
    return this.$update(next as this);
  }

  delete(key: K): ImmutableMap<K, V> {
    if (!this.has(key)) return this;
    const newEntries = [...this].filter(([k]) => !equalKeys(k, key));
    const next = new ImmutableMap(newEntries);
    return this.$update(next as this);
  }

  clear(): ImmutableMap<K, V> {
    if (this.size === 0) return this;
    const next = new ImmutableMap<K, V>(null);
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
      hash = hash + h | 0;
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
