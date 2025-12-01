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
  parent: WeakRef<Message<DataObject> | ImmutableSet<unknown>>;
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return `obj:${hashString(Object.prototype.toString.call(value))}`;
}

export class ImmutableSet<T> implements ReadonlySet<T> {
  #buckets: Map<string, T[]>;
  #size: number;
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableSet';

  // Hybrid approach: path tracking for equality comparisons
  readonly #fromRoot: WeakMap<Message<DataObject>, string> = new WeakMap();

  // Hybrid approach: parent chains for update propagation (keyed by listener symbol)
  readonly #parentChains: Map<symbol, ParentChainEntry> = new Map();

  // Hybrid approach: callbacks for update propagation (keyed by listener symbol)
  readonly #callbacks: Map<symbol, UpdateListenerCallback> = new Map();

  constructor(values?: Iterable<T> | ReadonlySet<T> | readonly T[]) {
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
      if (!parent) continue;
      const newParent = (parent as { [WITH_CHILD]: (key: string | number, child: unknown) => unknown })[WITH_CHILD](entry.key, newSet);
      (parent as { [PROPAGATE_UPDATE]: (key: symbol, replacement: unknown) => void })[PROPAGATE_UPDATE](key, newParent);
    }
    // Also call direct callbacks at the root level
    for (const [, callback] of this.#callbacks) {
      callback(newSet as unknown as Message<DataObject>);
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

    let index = 0;
    for (const value of this) {
      if (isMessageLike(value) && SET_UPDATE_LISTENER in value) {
        const msgValue = value as unknown as {
          $setParentChain: (key: symbol, parent: unknown, parentKey: string | number) => void;
          [SET_UPDATE_LISTENER]: (key: symbol, callback: UpdateListenerCallback) => void;
        };
        msgValue.$setParentChain(key, this, index);
        msgValue[SET_UPDATE_LISTENER](key, callback);
      }
      index++;
    }
  }

  // ============================================
  // HYBRID APPROACH: Update Propagation
  // ============================================

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

  public [PROPAGATE_UPDATE](key: symbol, replacement: ImmutableSet<T>): void {
    const chain = this.#parentChains.get(key);

    if (chain?.parent.deref()) {
      const parent = chain.parent.deref()!;
      const newParent = (parent as { [WITH_CHILD]: (key: string | number, child: unknown) => unknown })[WITH_CHILD](chain.key, replacement);
      (parent as { [PROPAGATE_UPDATE]: (key: symbol, replacement: unknown) => void })[PROPAGATE_UPDATE](key, newParent);
    } else {
      const callback = this.#callbacks.get(key);
      if (callback) {
        callback(replacement as unknown as Message<DataObject>);
      }
    }
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
      hash = hash + h | 0;
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
