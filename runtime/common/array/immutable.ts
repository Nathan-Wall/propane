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

function isMessageLike(
  value: unknown
): value is {
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

  return `obj:${hashString(Object.prototype.toString.call(value))}`;
}

// Type for update listener callback
type UpdateListenerCallback = (msg: Message<DataObject>) => void;

// Type for parent chain entry
interface ParentChainEntry {
  parent: WeakRef<Message<DataObject> | ImmutableArray<unknown>>;
  key: string | number;
}

export class ImmutableArray<T> implements ReadonlyArray<T> {
  #items: T[];
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableArray';

  // Hybrid approach: path tracking for equality comparisons
  readonly #fromRoot = new WeakMap<Message<DataObject>, string>();

  // Hybrid approach: parent chains for update propagation (keyed by listener symbol)
  readonly #parentChains = new Map<symbol, ParentChainEntry>();

  // Hybrid approach: callbacks for update propagation (keyed by listener symbol)
  readonly #callbacks = new Map<symbol, UpdateListenerCallback>();

  /**
   * Returns an ImmutableArray from the input.
   * If the input is already an ImmutableArray, returns it as-is.
   */
  static from<T>(input: ImmutableArray<T> | Iterable<T> | ArrayLike<T>): ImmutableArray<T> {
    return input instanceof ImmutableArray ? input : new ImmutableArray(input);
  }

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
        (_, i) => arrayLike[i]!
      );
    }

    this.#defineIndexProps();
    Object.freeze(this.#items);
    Object.freeze(this);
  }

  /**
   * Check if this array has active listeners (parent chains or callbacks).
   */
  private hasActiveListeners(): boolean {
    return this.#parentChains.size > 0 || this.#callbacks.size > 0;
  }

  /**
   * Propagate updates through parent chains.
   */
  private $propagateUpdates(newArray: ImmutableArray<T>): void {
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
        entry.key, newArray
      );
      (parent as PropagateFn)[PROPAGATE_UPDATE](key, newParent);
    }
    // Also call direct callbacks at the root level
    for (const [, callback] of this.#callbacks) {
      callback(newArray as unknown as Message<DataObject>);
    }
  }

  /**
   * Update the array and propagate through parent chains.
   */
  protected $update(value: this): this {
    this.$propagateUpdates(value as unknown as ImmutableArray<T>);
    return value;
  }

  // ============================================
  // HYBRID APPROACH: Path Registration
  // ============================================

  /**
   * Register the path from a root message to this array.
   */
  public [REGISTER_PATH](root: Message<DataObject>, path: string): void {
    this.#fromRoot.set(root, path);
    // Recursively register children
    for (let i = 0; i < this.#items.length; i++) {
      const item = this.#items[i];
      if (isMessageLike(item) && REGISTER_PATH in item) {
        (item as { [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void })[REGISTER_PATH](root, `${path}[${i}]`);
      }
    }
  }

  /**
   * Get the path from a root to this array.
   */
  public [FROM_ROOT](root: Message<DataObject>): string | undefined {
    return this.#fromRoot.get(root);
  }

  // ============================================
  // HYBRID APPROACH: Update Listener Management
  // ============================================

  /**
   * Set an update listener for a given symbol key.
   * Called by parent message to set up this collection's parent chain.
   * When used as a root-level state (no parent), only callback is needed.
   */
  public [SET_UPDATE_LISTENER](
    key: symbol,
    callback: UpdateListenerCallback,
    parent?: Message<DataObject>,
    parentKey?: string | number
  ): void {
    // Store the callback
    this.#callbacks.set(key, callback);

    // Set up parent chain if parent is provided
    if (parent !== undefined && parentKey !== undefined) {
      this.#parentChains.set(key, {
        parent: new WeakRef(parent),
        key: parentKey,
      });
    }

    // Propagate to children
    for (let i = 0; i < this.#items.length; i++) {
      const item = this.#items[i];
      if (isMessageLike(item) && SET_UPDATE_LISTENER in item) {
        // For Message children, set up parent chain to point to array
        type ListenableFn = {
          $setParentChain: (
            key: symbol, parent: unknown, parentKey: string | number
          ) => void;
          [SET_UPDATE_LISTENER]: (
            key: symbol, callback: UpdateListenerCallback
          ) => void;
        };
        const msgItem = item as unknown as ListenableFn;
        msgItem.$setParentChain(key, this, i);
        // Recursively set up listener
        msgItem[SET_UPDATE_LISTENER](key, callback);
      }
    }
  }

  // ============================================
  // HYBRID APPROACH: Update Propagation
  // ============================================

  /**
   * Create a new array with a child replaced at the given index.
   */
  public [WITH_CHILD](index: number, child: T): ImmutableArray<T> {
    const newItems = [...this.#items];
    newItems[index] = child;
    return new ImmutableArray(newItems);
  }

  /**
   * Propagate an update through the parent chain.
   */
  public [PROPAGATE_UPDATE](
    key: symbol,
    replacement: ImmutableArray<T>
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
      // Create new parent with replacement at this position
      const newParent = (parent as WithChildFn)[WITH_CHILD](
        chain.key, replacement
      );
      // Continue propagation
      (parent as PropagateFn)[PROPAGATE_UPDATE](key, newParent);
    } else {
      // Reached root - invoke callback
      const callback = this.#callbacks.get(key);
      if (callback) {
        callback(replacement as unknown as Message<DataObject>);
      }
    }
  }

  /**
   * Create a copy of this array detached from the state tree.
   * Recursively detaches all child elements.
   * Setters on the returned array won't trigger React state updates.
   */
  detach(): ImmutableArray<T> {
    if (!this.hasActiveListeners()) {
      // Still need to detach children if they have listeners
      let childNeedsDetach = false;
      for (const item of this.#items) {
        if (needsDetach(item)) {
          childNeedsDetach = true;
          break;
        }
      }
      if (!childNeedsDetach) {
        return this;
      }
    }
    return new ImmutableArray(this.#items.map(detachValue));
  }

  get length(): number {
    return this.#items.length;
  }

  [n: number]: T;

  at(index: number): T | undefined {
    return this.#items.at(index);
  }

  get(index: number): T | undefined {
    return this.#items[index];
  }

  set(index: number, value: T): ImmutableArray<T> {
    if (index < 0 || index >= this.#items.length) {
      return this;
    }
    if (equalValues(this.#items[index], value)) {
      return this;
    }
    const newItems = [...this.#items];
    newItems[index] = value;
    const next = new ImmutableArray(newItems);
    return this.$update(next as unknown as this);
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
      callbackfn.call(thisArg, v, i, this as unknown as readonly T[]);
    }
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  map<U>(
    fn: (value: T, index: number, array: readonly T[]) => U
  ): ImmutableArray<U> {
    return new ImmutableArray(this.#items.map(fn));
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  filter(
    fn: (value: T, index: number, array: readonly T[]) => boolean
  ): ImmutableArray<T> {
    return new ImmutableArray(this.#items.filter(fn));
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  concat(...items: (T | ConcatArray<T>)[]): ImmutableArray<T> {
    return new ImmutableArray(this.#items.concat(...items));
  }

  // @ts-expect-error Signature differs from ReadonlyArray (no type predicate)
  every(
    predicate: (value: T, index: number, array: readonly T[]) => boolean,
    thisArg?: unknown
  ): boolean {
    return this.#items.every(
      (v, i) => predicate.call(thisArg, v, i, this.#items)
    );
  }

  some(
    predicate: (value: T, index: number, array: readonly T[]) => boolean,
    thisArg?: unknown
  ): boolean {
    return this.#items.some(
      (v, i) => predicate.call(thisArg, v, i, this.#items)
    );
  }

  find(
    predicate: (value: T, index: number, obj: readonly T[]) => boolean,
    thisArg?: unknown
  ): T | undefined {
    return this.#items.find(
      (v, i) => predicate.call(thisArg, v, i, this.#items)
    );
  }

  findIndex(
    predicate: (value: T, index: number, obj: readonly T[]) => boolean,
    thisArg?: unknown
  ): number {
    return this.#items.findIndex(
      (v, i) => predicate.call(thisArg, v, i, this.#items)
    );
  }

  findLast(
    predicate: (value: T, index: number, obj: readonly T[]) => boolean,
    thisArg?: unknown
  ): T | undefined {
    return this.#items.findLast(
      (v, i) => predicate.call(thisArg, v, i, this.#items)
    );
  }

  findLastIndex(
    predicate: (value: T, index: number, obj: readonly T[]) => boolean,
    thisArg?: unknown
  ): number {
    return this.#items.findLastIndex(
      (v, i) => predicate.call(thisArg, v, i, this.#items)
    );
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  flat<D extends number = 1>(depth?: D): ImmutableArray<FlatArray<T[], D>> {
    return new ImmutableArray(this.#items.flat(depth));
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  flatMap<U>(
    callback: (value: T, index: number, array: T[]) => U | readonly U[],
    thisArg?: unknown
  ): ImmutableArray<U> {
    return new ImmutableArray(
      this.#items.flatMap(
         
        (v, i) => callback.call(thisArg, v, i, this.#items)
      )
    );
  }

  includes(searchElement: T, fromIndex?: number): boolean {
    return this.#items.includes(searchElement, fromIndex);
  }

  indexOf(searchElement: T, fromIndex?: number): number {
    return this.#items.indexOf(searchElement, fromIndex);
  }

  lastIndexOf(searchElement: T, fromIndex?: number): number {
    return this.#items.lastIndexOf(
      searchElement,
      fromIndex ?? this.#items.length - 1
    );
  }

  join(separator?: string): string {
    return this.#items.join(separator);
  }

  reduce(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => T
  ): T;
  reduce(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => T,
    initialValue: T
  ): T;
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => U,
    initialValue: U
  ): U;
  reduce<U>(
    callbackfn: (
      previousValue: U | T,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => U | T,
    initialValue?: U | T
  ): U | T {
    if (arguments.length >= 2) {
      return this.#items.reduce(
        (prev, curr, i) => callbackfn(prev, curr, i, this.#items) as T,
        initialValue as T
      );
    }

    return this.#items.reduce(
      (prev, curr, i) => callbackfn(prev, curr, i, this.#items) as unknown as T
    ) as unknown as U | T;
  }

  reduceRight(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => T
  ): T;
  reduceRight(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => T,
    initialValue: T
  ): T;
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => U,
    initialValue: U
  ): U;
  reduceRight<U>(
    callbackfn: (
      previousValue: U | T,
      currentValue: T,
      currentIndex: number,
      array: readonly T[]
    ) => U | T,
    initialValue?: U | T
  ): U | T {
    if (arguments.length >= 2) {
      return this.#items.reduceRight(
        (prev, curr, i) => callbackfn(prev, curr, i, this.#items) as T,
        initialValue as T
      );
    }

    return this.#items.reduceRight(
      (prev, curr, i) => callbackfn(prev, curr, i, this.#items) as unknown as T
    ) as unknown as U | T;
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  slice(start?: number, end?: number): ImmutableArray<T> {
    return new ImmutableArray(this.#items.slice(start, end));
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  toReversed(): ImmutableArray<T> {
    return new ImmutableArray(this.#items.toReversed());
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  toSorted(compareFn?: (a: T, b: T) => number): ImmutableArray<T> {
    return new ImmutableArray(this.#items.toSorted(compareFn));
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  toSpliced(
    start: number,
    deleteCount?: number,
    ...items: T[]
  ): ImmutableArray<T> {
    return new ImmutableArray(
      this.#items.toSpliced(start, deleteCount ?? 0, ...items)
    );
  }

  // @ts-expect-error Return type mismatch with ReadonlyArray
  with(index: number, value: T): ImmutableArray<T> {
    return new ImmutableArray(this.#items.with(index, value));
  }

  toString(): string {
    return this.#items.toString();
  }

  toLocaleString(): string {
    return this.#items.toLocaleString();
  }

  // Mutating methods - return new ImmutableArray instead of mutating

  /**
   * Returns a new ImmutableArray with a portion copied to another location.
   */
  copyWithin(target: number, start: number, end?: number): ImmutableArray<T> {
    const copy = [...this.#items];
    copy.copyWithin(target, start, end);
    const next = new ImmutableArray(copy);
    return this.$update(next as unknown as this);
  }

  /**
   * Returns a new ImmutableArray with all elements filled with a static value.
   */
  fill(value: T, start?: number, end?: number): ImmutableArray<T> {
    const copy = [...this.#items];
    copy.fill(value, start, end);
    const next = new ImmutableArray(copy);
    return this.$update(next as unknown as this);
  }

  /**
   * Returns a tuple of [poppedElement, newArray] where newArray has the last
   * element removed. Returns [undefined, this] if array is empty.
   */
  pop(): [T | undefined, ImmutableArray<T>] {
    if (this.#items.length === 0) {
      return [undefined, this];
    }
    const copy = [...this.#items];
    const popped = copy.pop();
    const next = new ImmutableArray(copy);
    this.$update(next as unknown as this);
    return [popped, next];
  }

  /**
   * Returns a new ImmutableArray with elements added to the end.
   */
  push(...items: T[]): ImmutableArray<T> {
    if (items.length === 0) {
      return this;
    }
    const next = new ImmutableArray([...this.#items, ...items]);
    return this.$update(next as unknown as this);
  }

  /**
   * Returns a new ImmutableArray with elements in reversed order.
   */
  reverse(): ImmutableArray<T> {
    const next = new ImmutableArray(this.#items.toReversed());
    return this.$update(next as unknown as this);
  }

  /**
   * Returns a tuple of [shiftedElement, newArray] where newArray has the first
   * element removed. Returns [undefined, this] if array is empty.
   */
  shift(): [T | undefined, ImmutableArray<T>] {
    if (this.#items.length === 0) {
      return [undefined, this];
    }
    const copy = [...this.#items];
    const shifted = copy.shift();
    const next = new ImmutableArray(copy);
    this.$update(next as unknown as this);
    return [shifted, next];
  }

  /**
   * Returns a new ImmutableArray with elements sorted.
   */
  sort(compareFn?: (a: T, b: T) => number): ImmutableArray<T> {
    const copy = [...this.#items];
    copy.sort(compareFn);
    const next = new ImmutableArray(copy);
    return this.$update(next as unknown as this);
  }

  /**
   * Returns a tuple of [removedElements, newArray] where elements have been
   * removed and/or inserted at the specified position.
   */
  splice(
    start: number,
    deleteCount?: number,
    ...items: T[]
  ): [T[], ImmutableArray<T>] {
    const copy = [...this.#items];
    const removed = copy.splice(start, deleteCount ?? 0, ...items);
    const next = new ImmutableArray(copy);
    this.$update(next as unknown as this);
    return [removed, next];
  }

  /**
   * Returns a new ImmutableArray with elements added to the beginning.
   */
  unshift(...items: T[]): ImmutableArray<T> {
    if (items.length === 0) {
      return this;
    }
    const next = new ImmutableArray([...items, ...this.#items]);
    return this.$update(next as unknown as this);
  }

  equals(other: ImmutableArray<T> | readonly T[] | null | undefined): boolean {
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
      hash = 31 * hash + hashString(hashValue(item)) | 0;
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
      (this as unknown as Record<number, T>)[i] = this.#items[i]!;
    }
  }
}
