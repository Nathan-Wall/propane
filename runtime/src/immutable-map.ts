export class ImmutableMap<K, V> implements ReadonlyMap<K, V> {
  #map: Map<K, V>;

  constructor(
    entries?: Iterable<readonly [K, V]> | ReadonlyArray<readonly [K, V]> | ReadonlyMap<K, V>
  ) {
    if (!entries) {
      this.#map = new Map();
      return;
    }

    if (entries instanceof Map || entries instanceof ImmutableMap) {
      this.#map = new Map(entries as Iterable<readonly [K, V]>);
      return;
    }

    if (Symbol.iterator in Object(entries)) {
      this.#map = new Map(entries as Iterable<readonly [K, V]>);
      return;
    }

    throw new TypeError('ImmutableMap constructor expects an iterable of entries.');
  }

  get size(): number {
    return this.#map.size;
  }

  has(key: K): boolean {
    return this.#map.has(key);
  }

  get(key: K): V | undefined {
    return this.#map.get(key);
  }

  entries(): IterableIterator<[K, V]> {
    return this.#map.entries();
  }

  keys(): IterableIterator<K> {
    return this.#map.keys();
  }

  values(): IterableIterator<V> {
    return this.#map.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    thisArg?: unknown
  ): void {
    this.#map.forEach((value, key) => {
      callbackfn.call(thisArg, value, key, this);
    });
  }

  equals(other: ReadonlyMap<K, V> | null | undefined): boolean {
    if (!other) {
      return false;
    }

    if (this.size !== other.size) {
      return false;
    }

    for (const [key, value] of this.#map.entries()) {
      if (!other.has(key)) {
        return false;
      }

      const otherValue = other.get(key);
      if (!Object.is(otherValue, value)) {
        return false;
      }
    }

    return true;
  }

  toMap(): Map<K, V> {
    return new Map(this.#map);
  }

  get [Symbol.toStringTag](): string {
    return 'ImmutableMap';
  }
}
