import { normalizeForJson } from '../json/stringify.js';
import { ADD_UPDATE_LISTENER } from '../../symbols.js';

// Basic Listener type compatible with Message Listener
type Listener<T> = (val: ImmutableArray<T>) => void;
function isMessageLike(
  value: unknown
): value is {
  equals: (other: unknown) => boolean;
  hashCode?: () => number;
  serialize?: () => string;
  [ADD_UPDATE_LISTENER]?: (
    listener: (val: unknown) => void
  ) => { unsubscribe: () => void };
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

export class ImmutableArray<T> implements ReadonlyArray<T> {
  #items: T[];
  #hash?: number;
  protected readonly $listeners: Set<Listener<T>>; 
  #childUnsubscribes: (() => void)[] = [];
  readonly [Symbol.toStringTag] = 'ImmutableArray';

  constructor(
    items?: Iterable<T> | ArrayLike<T>,
    listeners?: Set<Listener<T>>
  ) {
    this.$listeners = listeners ?? new Set();
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

    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
  }

  [ADD_UPDATE_LISTENER](
    listener: (val: this) => void
  ): { unsubscribe: () => void } {
    const l = listener as unknown as Listener<T>;
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
    for (let i = 0; i < this.#items.length; i++) {
      const item = this.#items[i];
      if (isMessageLike(item) && item[ADD_UPDATE_LISTENER]) {
        const { unsubscribe } = item[ADD_UPDATE_LISTENER]((newItem) => {
          this.set(i, newItem as T);
        });
        this.#childUnsubscribes.push(unsubscribe);
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
    // eslint-disable-next-line unicorn/no-useless-spread
    for (const listener of [...this.$listeners]) {
      listener(value as unknown as ImmutableArray<T>);
    }
    return value;
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

  set(index: number, value: T): ImmutableArray<T> {
    if (index < 0 || index >= this.#items.length) {
      return this;
    }
    if (equalValues(this.#items[index], value)) {
      return this;
    }
    const newItems = [...this.#items];
    newItems[index] = value;
    const next = new ImmutableArray(newItems, new Set(this.$listeners));
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
      callbackfn.call(thisArg, v, i, this);
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
