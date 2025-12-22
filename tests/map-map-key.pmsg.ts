/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-map-key.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, SetUpdates } from "../runtime/index.js";
export class MapMapKey extends Message<MapMapKey.Data> {
  static TYPE_TAG = Symbol("MapMapKey");
  static readonly $typeName = "MapMapKey";
  static EMPTY: MapMapKey;
  #nested!: ImmutableMap<ImmutableMap<string, number>, string>;
  #optional!: ImmutableMap<ImmutableMap<string, number>, number> | undefined;
  constructor(props?: MapMapKey.Value) {
    if (!props && MapMapKey.EMPTY) return MapMapKey.EMPTY;
    super(MapMapKey.TYPE_TAG, "MapMapKey");
    this.#nested = props ? props.nested === undefined || props.nested === null ? new ImmutableMap() : props.nested instanceof ImmutableMap ? props.nested : new ImmutableMap(props.nested) : new ImmutableMap();
    this.#optional = props ? props.optional === undefined || props.optional === null ? props.optional : props.optional instanceof ImmutableMap ? props.optional : new ImmutableMap(props.optional) : undefined;
    if (!props) MapMapKey.EMPTY = this;
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
    const nestedMapValue = nestedValue === undefined || nestedValue === null ? new ImmutableMap() : nestedValue as object instanceof ImmutableMap ? nestedValue : new ImmutableMap(nestedValue as Iterable<[unknown, unknown]>);
    if (!((nestedMapValue instanceof ImmutableMap || nestedMapValue instanceof Map) && [...(nestedMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey instanceof ImmutableMap || mapKey instanceof Map) && [...(mapKey as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number") && typeof mapValue === "string"))) throw new Error("Invalid value for property \"nested\".");
    props.nested = nestedMapValue as ImmutableMap<ImmutableMap<string, number>, string>;
    const optionalValue = entries["optional"];
    const optionalNormalized = optionalValue === null ? undefined : optionalValue;
    const optionalMapValue = optionalNormalized === undefined || optionalNormalized === null ? optionalNormalized : optionalNormalized as object instanceof ImmutableMap ? optionalNormalized : new ImmutableMap(optionalNormalized as Iterable<[unknown, unknown]>);
    if (optionalMapValue !== undefined && !((optionalMapValue instanceof ImmutableMap || optionalMapValue instanceof Map) && [...(optionalMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey instanceof ImmutableMap || mapKey instanceof Map) && [...(mapKey as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"optional\".");
    props.optional = optionalMapValue as ImmutableMap<ImmutableMap<string, number>, number>;
    return props as MapMapKey.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): MapMapKey {
    switch (key) {
      case "nested":
        return new (this.constructor as typeof MapMapKey)({
          nested: child as ImmutableMap<ImmutableMap<string, number>, string>,
          optional: this.#optional
        });
      case "optional":
        return new (this.constructor as typeof MapMapKey)({
          nested: this.#nested,
          optional: child as ImmutableMap<ImmutableMap<string, number>, number>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["nested", this.#nested] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["optional", this.#optional] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get nested(): ImmutableMap<ImmutableMap<string, number>, string> {
    return this.#nested;
  }
  get optional(): ImmutableMap<ImmutableMap<string, number>, number> | undefined {
    return this.#optional;
  }
  clearNested() {
    const nestedCurrent = this.nested;
    if (nestedCurrent === undefined || nestedCurrent.size === 0) return this;
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.clear();
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext,
      optional: this.#optional
    }));
  }
  clearOptional() {
    const optionalCurrent = this.optional;
    if (optionalCurrent === undefined || optionalCurrent.size === 0) return this;
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.clear();
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: optionalMapNext
    }));
  }
  deleteNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) {
    const nestedCurrent = this.nested;
    if (!nestedCurrent?.has(key)) return this;
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext,
      optional: this.#optional
    }));
  }
  deleteOptional() {
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested
    }));
  }
  deleteOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) {
    const optionalCurrent = this.optional;
    if (!optionalCurrent?.has(key)) return this;
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: optionalMapNext
    }));
  }
  filterNestedEntries(predicate: (value: string, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => boolean) {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    for (const [entryKey, entryValue] of nestedMapNext) {
      if (!predicate(entryValue, entryKey)) nestedMapNext.delete(entryKey);
    }
    if (this.nested === nestedMapNext as unknown || this.nested?.equals(nestedMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext,
      optional: this.#optional
    }));
  }
  filterOptionalEntries(predicate: (value: number, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => boolean) {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    for (const [entryKey, entryValue] of optionalMapNext) {
      if (!predicate(entryValue, entryKey)) optionalMapNext.delete(entryKey);
    }
    if (this.optional === optionalMapNext as unknown || this.optional?.equals(optionalMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: optionalMapNext
    }));
  }
  mapNestedEntries(mapper: (value: string, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string]) {
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
    if (this.nested === nestedMapNext as unknown || this.nested?.equals(nestedMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext,
      optional: this.#optional
    }));
  }
  mapOptionalEntries(mapper: (value: number, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number]) {
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
    if (this.optional === optionalMapNext as unknown || this.optional?.equals(optionalMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: optionalMapNext
    }));
  }
  mergeNestedEntries(entries: ImmutableMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string> | ReadonlyMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string> | Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string]>) {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      nestedMapNext.set(mergeKey, mergeValue);
    }
    if (this.nested === nestedMapNext as unknown || this.nested?.equals(nestedMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext,
      optional: this.#optional
    }));
  }
  mergeOptionalEntries(entries: ImmutableMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number> | ReadonlyMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number> | Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number]>) {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalMapNext.set(mergeKey, mergeValue);
    }
    if (this.optional === optionalMapNext as unknown || this.optional?.equals(optionalMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: optionalMapNext
    }));
  }
  set(updates: Partial<SetUpdates<MapMapKey.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapMapKey)(data));
  }
  setNested(value: Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>) {
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value),
      optional: this.#optional
    }));
  }
  setNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, value: string) {
    const nestedCurrent = this.nested;
    if (nestedCurrent?.has(key)) {
      const existing = nestedCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext,
      optional: this.#optional
    }));
  }
  setOptional(value: Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>) {
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: value === undefined || value === null ? value : value instanceof ImmutableMap ? value : new ImmutableMap(value)
    }));
  }
  setOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, value: number) {
    const optionalCurrent = this.optional;
    if (optionalCurrent?.has(key)) {
      const existing = optionalCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: optionalMapNext
    }));
  }
  updateNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, updater: (currentValue: string | undefined) => string) {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    const currentValue = nestedMapNext.get(key);
    const updatedValue = updater(currentValue);
    nestedMapNext.set(key, updatedValue);
    if (this.nested === nestedMapNext as unknown || this.nested?.equals(nestedMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext,
      optional: this.#optional
    }));
  }
  updateOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, updater: (currentValue: number | undefined) => number) {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    const currentValue = optionalMapNext.get(key);
    const updatedValue = updater(currentValue);
    optionalMapNext.set(key, updatedValue);
    if (this.optional === optionalMapNext as unknown || this.optional?.equals(optionalMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested,
      optional: optionalMapNext
    }));
  }
}
export namespace MapMapKey {
  export type Data = {
    nested: Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>;
    optional?: Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]> | undefined;
  };
  export type Value = MapMapKey | MapMapKey.Data;
}
