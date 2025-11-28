/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-map-key.propane
import { Message, MessagePropDescriptor, ImmutableMap, equals, ADD_UPDATE_LISTENER } from "@propanejs/runtime";
export class MapMapKey extends Message<MapMapKey.Data> {
  static TYPE_TAG = Symbol("MapMapKey");
  static EMPTY: MapMapKey;
  #nested: ImmutableMap<ImmutableMap<string, number>, string>;
  #optional: ImmutableMap<ImmutableMap<string, number>, number> | undefined;
  constructor(props?: MapMapKey.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && MapMapKey.EMPTY) return MapMapKey.EMPTY;
    super(MapMapKey.TYPE_TAG, "MapMapKey", listeners);
    this.#nested = props ? props.nested === undefined || props.nested === null ? props.nested : props.nested instanceof ImmutableMap || Object.prototype.toString.call(props.nested) === "[object ImmutableMap]" ? props.nested : new ImmutableMap(props.nested) : new Map();
    this.#optional = props ? props.optional === undefined || props.optional === null ? props.optional : props.optional instanceof ImmutableMap || Object.prototype.toString.call(props.optional) === "[object ImmutableMap]" ? props.optional : new ImmutableMap(props.optional) : undefined;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) MapMapKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapMapKey.Data>[] {
    return [{
      name: "nested",
      fieldNumber: null,
      getValue: () => this.#nested
    }, {
      name: "optional",
      fieldNumber: null,
      getValue: () => this.#optional
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapMapKey.Data {
    const props = {} as Partial<MapMapKey.Data>;
    const nestedValue = entries["nested"];
    if (nestedValue === undefined) throw new Error("Missing required property \"nested\".");
    const nestedMapValue = nestedValue === undefined || nestedValue === null ? nestedValue : nestedValue instanceof ImmutableMap || Object.prototype.toString.call(nestedValue) === "[object ImmutableMap]" ? nestedValue : new ImmutableMap(nestedValue);
    if (!((nestedMapValue instanceof ImmutableMap || Object.prototype.toString.call(nestedMapValue) === "[object ImmutableMap]" || nestedMapValue instanceof Map || Object.prototype.toString.call(nestedMapValue) === "[object Map]") && [...nestedMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof ImmutableMap || Object.prototype.toString.call(mapKey) === "[object ImmutableMap]" || mapKey instanceof Map || Object.prototype.toString.call(mapKey) === "[object Map]") && [...mapKey.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number") && typeof mapValue === "string"))) throw new Error("Invalid value for property \"nested\".");
    props.nested = nestedMapValue;
    const optionalValue = entries["optional"];
    const optionalNormalized = optionalValue === null ? undefined : optionalValue;
    const optionalMapValue = optionalNormalized === undefined || optionalNormalized === null ? optionalNormalized : optionalNormalized instanceof ImmutableMap || Object.prototype.toString.call(optionalNormalized) === "[object ImmutableMap]" ? optionalNormalized : new ImmutableMap(optionalNormalized);
    if (optionalMapValue !== undefined && !((optionalMapValue instanceof ImmutableMap || Object.prototype.toString.call(optionalMapValue) === "[object ImmutableMap]" || optionalMapValue instanceof Map || Object.prototype.toString.call(optionalMapValue) === "[object Map]") && [...optionalMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof ImmutableMap || Object.prototype.toString.call(mapKey) === "[object ImmutableMap]" || mapKey instanceof Map || Object.prototype.toString.call(mapKey) === "[object Map]") && [...mapKey.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"optional\".");
    props.optional = optionalMapValue;
    return props as MapMapKey.Data;
  }
  protected $enableChildListeners(): void {
    this.$addChildUnsubscribe(this.#nested[ADD_UPDATE_LISTENER](newValue => {
      this.setNested(newValue);
    }).unsubscribe);
    if (this.#optional) {
      this.$addChildUnsubscribe(this.#optional[ADD_UPDATE_LISTENER](newValue => {
        this.setOptional(newValue);
      }).unsubscribe);
    }
  }
  get nested(): ImmutableMap<ImmutableMap<string, number>, string> {
    return this.#nested;
  }
  get optional(): ImmutableMap<ImmutableMap<string, number>, number> | undefined {
    return this.#optional;
  }
  clearNested(): MapMapKey {
    const nestedCurrent = this.nested;
    if (nestedCurrent === undefined || nestedCurrent.size === 0) return this;
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.clear();
    return this.$update(new MapMapKey({
      nested: nestedMapNext,
      optional: this.#optional
    }, this.$listeners));
  }
  clearOptional(): MapMapKey {
    const optionalCurrent = this.optional;
    if (optionalCurrent === undefined || optionalCurrent.size === 0) return this;
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.clear();
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: optionalMapNext
    }, this.$listeners));
  }
  deleteNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>): MapMapKey {
    const nestedCurrent = this.nested;
    if (nestedCurrent === undefined || !nestedCurrent.has(key)) return this;
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.delete(key);
    return this.$update(new MapMapKey({
      nested: nestedMapNext,
      optional: this.#optional
    }, this.$listeners));
  }
  deleteOptional(): MapMapKey {
    return this.$update(new MapMapKey({
      nested: this.#nested
    }, this.$listeners));
  }
  deleteOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>): MapMapKey {
    const optionalCurrent = this.optional;
    if (optionalCurrent === undefined || !optionalCurrent.has(key)) return this;
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.delete(key);
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: optionalMapNext
    }, this.$listeners));
  }
  filterNestedEntries(predicate: (value: string, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => boolean): MapMapKey {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    for (const [entryKey, entryValue] of nestedMapNext) {
      if (!predicate(entryValue, entryKey)) nestedMapNext.delete(entryKey);
    }
    if (this.nested === nestedMapNext || this.nested !== undefined && this.nested.equals(nestedMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: nestedMapNext,
      optional: this.#optional
    }, this.$listeners));
  }
  filterOptionalEntries(predicate: (value: number, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => boolean): MapMapKey {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    for (const [entryKey, entryValue] of optionalMapNext) {
      if (!predicate(entryValue, entryKey)) optionalMapNext.delete(entryKey);
    }
    if (this.optional === optionalMapNext || this.optional !== undefined && this.optional.equals(optionalMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: optionalMapNext
    }, this.$listeners));
  }
  mapNestedEntries(mapper: (value: string, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string]): MapMapKey {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    const nestedMappedEntries = [];
    for (const [entryKey, entryValue] of nestedMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      nestedMappedEntries.push(mappedEntry);
    }
    nestedMapNext.clear();
    for (const [newKey, newValue] of nestedMappedEntries) {
      nestedMapNext.set(newKey, newValue);
    }
    if (this.nested === nestedMapNext || this.nested !== undefined && this.nested.equals(nestedMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: nestedMapNext,
      optional: this.#optional
    }, this.$listeners));
  }
  mapOptionalEntries(mapper: (value: number, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number]): MapMapKey {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    const optionalMappedEntries = [];
    for (const [entryKey, entryValue] of optionalMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalMappedEntries.push(mappedEntry);
    }
    optionalMapNext.clear();
    for (const [newKey, newValue] of optionalMappedEntries) {
      optionalMapNext.set(newKey, newValue);
    }
    if (this.optional === optionalMapNext || this.optional !== undefined && this.optional.equals(optionalMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: optionalMapNext
    }, this.$listeners));
  }
  mergeNestedEntries(entries: Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string]> | ImmutableMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string> | ReadonlyMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string> | Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string]>): MapMapKey {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      nestedMapNext.set(mergeKey, mergeValue);
    }
    if (this.nested === nestedMapNext || this.nested !== undefined && this.nested.equals(nestedMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: nestedMapNext,
      optional: this.#optional
    }, this.$listeners));
  }
  mergeOptionalEntries(entries: Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number]> | ImmutableMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number> | ReadonlyMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number> | Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number]>): MapMapKey {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalMapNext.set(mergeKey, mergeValue);
    }
    if (this.optional === optionalMapNext || this.optional !== undefined && this.optional.equals(optionalMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: optionalMapNext
    }, this.$listeners));
  }
  setNested(value: Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>): MapMapKey {
    return this.$update(new MapMapKey({
      nested: value === undefined || value === null ? value : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : new ImmutableMap(value),
      optional: this.#optional
    }, this.$listeners));
  }
  setNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, value: string): MapMapKey {
    const nestedCurrent = this.nested;
    if (nestedCurrent && nestedCurrent.has(key)) {
      const existing = nestedCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.set(key, value);
    return this.$update(new MapMapKey({
      nested: nestedMapNext,
      optional: this.#optional
    }, this.$listeners));
  }
  setOptional(value: Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>): MapMapKey {
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: value === undefined || value === null ? value : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : new ImmutableMap(value)
    }, this.$listeners));
  }
  setOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, value: number): MapMapKey {
    const optionalCurrent = this.optional;
    if (optionalCurrent && optionalCurrent.has(key)) {
      const existing = optionalCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.set(key, value);
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: optionalMapNext
    }, this.$listeners));
  }
  updateNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, updater: (currentValue: string | undefined) => string): MapMapKey {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    const currentValue = nestedMapNext.get(key);
    const updatedValue = updater(currentValue);
    nestedMapNext.set(key, updatedValue);
    if (this.nested === nestedMapNext || this.nested !== undefined && this.nested.equals(nestedMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: nestedMapNext,
      optional: this.#optional
    }, this.$listeners));
  }
  updateOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, updater: (currentValue: number | undefined) => number): MapMapKey {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    const currentValue = optionalMapNext.get(key);
    const updatedValue = updater(currentValue);
    optionalMapNext.set(key, updatedValue);
    if (this.optional === optionalMapNext || this.optional !== undefined && this.optional.equals(optionalMapNext)) return this;
    return this.$update(new MapMapKey({
      nested: this.#nested,
      optional: optionalMapNext
    }, this.$listeners));
  }
}
export namespace MapMapKey {
  export interface Data {
    nested: Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>;
    optional?: Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]> | undefined;
  }
  export type Value = MapMapKey | MapMapKey.Data;
}
