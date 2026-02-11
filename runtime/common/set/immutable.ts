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

const IMMUTABLE_SET_TAG = Symbol.for('propane:ImmutableSet');

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
    hash = hash * 31 + value.charCodeAt(i) | 0;
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

  // Hybrid approach: path tracking for equality comparisons
  readonly #fromRoot = new WeakMap<Message<DataObject>, string>();

  // Hybrid approach: parent chains for update propagation (keyed by listener symbol)
  readonly #parentChains = new Map<symbol, ParentChainEntry>();

  // Hybrid approach: callbacks for update propagation (keyed by listener symbol)
  readonly #callbacks = new Map<symbol, UpdateListenerCallback>();

  // Tracks the most recent listener registration token for each key.
  readonly #listenerTokens = new Map<symbol, symbol>();

  /**
   * Returns an ImmutableSet from the input.
   * If the input is already an ImmutableSet, returns it as-is.
   */
  static from<T>(
    input: ImmutableSet<T> | ReadonlySet<T> | Iterable<T>
  ): ImmutableSet<T> {
    return ImmutableSet.isInstance(input) ? input : new ImmutableSet(input);
  }

  static isInstance(value: unknown): value is ImmutableSet<unknown> {
    return Boolean(
      value
      && typeof value === 'object'
      && (value as { [IMMUTABLE_SET_TAG]?: boolean })[IMMUTABLE_SET_TAG]
        === true
    );
  }

  constructor(values?: Iterable<T> | ReadonlySet<T> | readonly T[]) {
    this.#buckets = new Map();
    this.#size = 0;
    Object.defineProperty(this, IMMUTABLE_SET_TAG, { value: true });

    if (values) {
      const source: Iterable<T> =
        values instanceof Set || ImmutableSet.isInstance(values)
          ? (values as ReadonlySet<T>).values()
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
        const exists = bucket.some(v => equalValues(v, value));
        if (!exists) {
          bucket.push(value);
          this.#size += 1;
        }
      }
    }

    Object.freeze(this);
  }

  /**
   * Check if this set has active listeners (parent chains or callbacks).
   */
  private hasActiveListeners(): boolean {
    return this.#parentChains.size > 0 || this.#callbacks.size > 0;
  }

  /**
   * Propagate updates through parent chains.
   */
  private $propagateUpdates(newSet: ImmutableSet<T>): void {
    for (const [key, entry] of this.#parentChains) {
      const parent = entry.parent.deref();
      if (!parent) {
        // Dead parent-chain entry: eagerly prune local metadata for this key.
        this.$retireListenerKeyLocal(key);
        continue;
      }
      const newParent = parent[WITH_CHILD](entry.key, newSet);
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
      this.$dispatchRootUpdate(key, newSet);
    }
  }

  /**
   * Update the set and propagate through parent chains.
   */
  protected $update(value: this): this {
    this.$propagateUpdates(value as unknown as ImmutableSet<T>);
    return value;
  }

  // ============================================
  // HYBRID APPROACH: Path Registration
  // ============================================

  public [REGISTER_PATH](root: Message<DataObject>, path: string): void {
    this.#fromRoot.set(root, path);
    let index = 0;
    for (const value of this) {
      if (isMessageLike(value) && REGISTER_PATH in value) {
        (value as { [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void })[REGISTER_PATH](root, `${path}[${index}]`);
      }
      index++;
    }
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

    let index = 0;
    for (const value of this) {
      if (!isListenable(value)) {
        index++;
        continue;
      }
      if (hasParentChainSetter(value)) {
        value.$setParentChain(key, this, index);
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
          collection[SET_UPDATE_LISTENER](key, callback, this, index)
        );
      }
      index++;
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

    for (const value of this) {
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
    replacement: ImmutableSet<T>
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

  public [WITH_CHILD](index: number, child: T): ImmutableSet<T> {
    const values: T[] = [];
    let i = 0;
    for (const value of this) {
      if (i === index) {
        values.push(child);
      } else {
        values.push(value);
      }
      i++;
    }
    return new ImmutableSet(values);
  }

  public [PROPAGATE_UPDATE](
    key: symbol,
    replacement: ImmutableSet<T>
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
   * Create a copy of this set detached from the state tree.
   * Recursively detaches all child values.
   * Setters on the returned set won't trigger React state updates.
   */
  detach(): ImmutableSet<T> {
    if (!this.hasActiveListeners()) {
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
    const next = new ImmutableSet([...this, value]);
    return this.$update(next as this);
  }

  delete(value: T): ImmutableSet<T> {
    if (!this.has(value)) return this;
    const newValues: T[] = [];
    for (const v of this) {
      if (!equalValues(v, value)) newValues.push(v);
    }
    const next = new ImmutableSet(newValues);
    return this.$update(next as this);
  }

  clear(): ImmutableSet<T> {
    if (this.size === 0) return this;
    const next = new ImmutableSet<T>([]);
    return this.$update(next as this);
  }

  get size(): number {
    return this.#size;
  }

  has(value: T): boolean {
    const bucket = this.#buckets.get(hashValue(value));
    if (!bucket) return false;
    return bucket.some(v => equalValues(v, value));
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
      hash = hash + h | 0;
    }
    this.#hash = hash;
    return hash;
  }

  toSet(): Set<T> {
    return new Set(this);
  }

  toJSON(): unknown {
    return [...this].map(v => normalizeForJson(v));
  }
}
