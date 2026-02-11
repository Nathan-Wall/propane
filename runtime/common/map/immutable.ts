import { normalizeForJson } from '../json/stringify.js';
import {
  SET_UPDATE_LISTENER,
  RETIRE_UPDATE_LISTENER,
  REGISTER_PATH,
  PROPAGATE_UPDATE,
  WITH_CHILD,
  FROM_ROOT,
} from '../../symbols.js';
import { needsDetach, detachValue } from '../detach.js';
import type { Message, DataObject } from '../../message.js';

const IMMUTABLE_MAP_TAG = Symbol.for('propane:ImmutableMap');

// Type for update listener callback
type UpdateListenerCallback = (msg: Message<DataObject>) => void;
type Unsubscribe = () => void;

type ParentType = {
  [WITH_CHILD](key: unknown, child: unknown): unknown;
  [PROPAGATE_UPDATE](key: symbol, replacement: unknown): void;
};

// Type for parent chain entry
interface ParentChainEntry {
  parent: WeakRef<ParentType>;
  key: unknown;
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

function isListenable(value: unknown): value is {
  [SET_UPDATE_LISTENER]: (...args: unknown[]) => Unsubscribe;
} {
  return Boolean(
    value
    && typeof value === 'object'
    && SET_UPDATE_LISTENER in value
    && typeof (value as { [SET_UPDATE_LISTENER]?: unknown })[SET_UPDATE_LISTENER] === 'function'
  );
}

function hasParentChainSetter(
  value: unknown
): value is {
  $setParentChain: (
    key: symbol,
    parent: ParentType,
    parentKey: unknown
  ) => void;
} {
  return Boolean(
    value
    && typeof value === 'object'
    && '$setParentChain' in value
    && typeof (value as { $setParentChain?: unknown }).$setParentChain === 'function'
  );
}

function isImmutableMapLike(
  value: unknown
): value is ImmutableMap<unknown, unknown> {
  return ImmutableMap.isInstance(value);
}

function isMapLike(value: unknown): value is ReadonlyMap<unknown, unknown> {
  return value instanceof Map || ImmutableMap.isInstance(value);
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

  // Tracks the most recent listener registration token for each key.
  readonly #listenerTokens = new Map<symbol, symbol>();

  /**
   * Returns an ImmutableMap from the input.
   * If the input is already an ImmutableMap, returns it as-is.
   */
  static from<K, V>(
    input: ImmutableMap<K, V> | ReadonlyMap<K, V> | Iterable<readonly [K, V]>
  ): ImmutableMap<K, V> {
    return ImmutableMap.isInstance(input) ? input : new ImmutableMap(input);
  }

  static isInstance(value: unknown): value is ImmutableMap<unknown, unknown> {
    return Boolean(
      value
      && typeof value === 'object'
      && (value as { [IMMUTABLE_MAP_TAG]?: boolean })[IMMUTABLE_MAP_TAG]
        === true
    );
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
    Object.defineProperty(this, IMMUTABLE_MAP_TAG, { value: true });

    if (entries) {
      const source: Iterable<readonly [K, V]> =
        entries instanceof Map
        || ImmutableMap.isInstance(entries)
          ? (entries as ReadonlyMap<K, V>).entries()
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
    for (const [key, entry] of this.#parentChains) {
      const parent = entry.parent.deref();
      if (!parent) {
        // Dead parent-chain entry: eagerly prune local metadata for this key.
        this.$retireListenerKeyLocal(key);
        continue;
      }
      const newParent = parent[WITH_CHILD](entry.key, newMap);
      parent[PROPAGATE_UPDATE](key, newParent);
    }
    // Dispatch root-owned listener keys (keys without parent chains).
    const rootKeys: symbol[] = [];
    for (const key of this.#callbacks.keys()) {
      if (!this.#parentChains.has(key)) {
        rootKeys.push(key);
      }
    }
    for (const key of rootKeys) {
      this.$dispatchRootUpdate(key, newMap);
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
    const usedSegments = new Set<string>();
    for (const [key, value] of this) {
      const baseSegment = this.#serializeKeyForPath(key);
      let keyStr = baseSegment;
      let suffix = 1;
      while (usedSegments.has(keyStr)) {
        keyStr = `${baseSegment}#${suffix}`;
        suffix += 1;
      }
      usedSegments.add(keyStr);
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
    parent?: ParentType,
    parentKey?: unknown
  ): Unsubscribe {
    const registrationToken = Symbol('listenerRegistration');
    this.#listenerTokens.set(key, registrationToken);

    this.#callbacks.set(key, callback);
    if (parent !== undefined && parentKey !== undefined) {
      this.#parentChains.set(key, {
        parent: new WeakRef(parent),
        key: parentKey,
      });
    }

    const childUnsubscribes: Unsubscribe[] = [];

    for (const [mapKey, value] of this) {
      if (!isListenable(value)) {
        continue;
      }
      if (hasParentChainSetter(value)) {
        value.$setParentChain(key, this, mapKey);
        childUnsubscribes.push(value[SET_UPDATE_LISTENER](key, callback));
      } else {
        type CollectionListener = {
          [SET_UPDATE_LISTENER]: (
            key: symbol,
            callback: UpdateListenerCallback,
            parent: ParentType,
            parentKey: unknown
          ) => Unsubscribe;
        };
        const collection = value as unknown as CollectionListener;
        childUnsubscribes.push(
          collection[SET_UPDATE_LISTENER](key, callback, this, mapKey)
        );
      }
    }

    return () => {
      if (this.#listenerTokens.get(key) !== registrationToken) {
        return;
      }

      this.#listenerTokens.delete(key);
      this.#callbacks.delete(key);
      this.#parentChains.delete(key);

      for (const unsubscribe of childUnsubscribes) {
        unsubscribe();
      }
    };
  }

  /**
   * Retire listener ownership for a key from this subtree.
   * Cleanup is key-scoped and idempotent.
   */
  public [RETIRE_UPDATE_LISTENER](key: symbol): void {
    this.$retireListenerKeyLocal(key);

    for (const [, value] of this) {
      if (
        value
        && typeof value === 'object'
        && RETIRE_UPDATE_LISTENER in value
        && typeof (value as { [RETIRE_UPDATE_LISTENER]?: unknown })[RETIRE_UPDATE_LISTENER] === 'function'
      ) {
        (
          value as {
            [RETIRE_UPDATE_LISTENER]: (listenerKey: symbol) => void;
          }
        )[RETIRE_UPDATE_LISTENER](key);
      }
    }
  }

  // ============================================
  // HYBRID APPROACH: Update Propagation
  // ============================================

  /**
   * Dispatch an update for a root-owned listener key.
   *
   * Ordering is intentional:
   * 1) Bind callback to replacement root.
   * 2) Retire callback ownership on current root.
   * 3) Invoke callback with replacement.
   */
  private $dispatchRootUpdate(
    key: symbol,
    replacement: ImmutableMap<K, V>
  ): void {
    if (replacement === this) {
      return;
    }

    const callback = this.#callbacks.get(key);
    if (!callback) {
      return;
    }

    // Transactional handoff: do not retire current root if bind fails.
    replacement[SET_UPDATE_LISTENER](key, callback);

    this.$retireListenerKeyLocal(key);

    callback(replacement as unknown as Message<DataObject>);
  }

  /**
   * Retire listener metadata for a key on this node only.
   * This does not recurse into descendants.
   */
  private $retireListenerKeyLocal(key: symbol): void {
    this.#listenerTokens.delete(key);
    this.#callbacks.delete(key);
    this.#parentChains.delete(key);
  }

  public [WITH_CHILD](mapKey: unknown, child: V): ImmutableMap<K, V> {
    const nextEntries: [K, V][] = [];
    let replaced = false;

    // Build the replacement map directly to avoid triggering propagation twice.
    for (const [key, value] of this) {
      if (!replaced && equalKeys(key, mapKey)) {
        nextEntries.push([key, child]);
        replaced = true;
      } else {
        nextEntries.push([key, value]);
      }
    }

    return replaced ? new ImmutableMap(nextEntries) : this;
  }

  public [PROPAGATE_UPDATE](
    key: symbol,
    replacement: ImmutableMap<K, V>
  ): void {
    const chain = this.#parentChains.get(key);
    if (chain) {
      const parent = chain.parent.deref();
      if (!parent) {
        // Dead parent-chain entry: eagerly prune local metadata for this key.
        this.$retireListenerKeyLocal(key);
        return;
      }
      const newParent = parent[WITH_CHILD](chain.key, replacement);
      parent[PROPAGATE_UPDATE](key, newParent);
      return;
    }

    // Reached root for this key.
    this.$dispatchRootUpdate(key, replacement);
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
