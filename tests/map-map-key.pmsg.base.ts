/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-map-key.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_MapMapKey = Symbol("MapMapKey");
export class MapMapKey extends Message<MapMapKey.Data> {
  static $typeId = "tests/map-map-key.pmsg#MapMapKey";
  static $typeHash = "sha256:a1e35717e7c3d2e463046273def6548e06f0321b3ead72ae0aef9787f89d9a4e";
  static $instanceTag = Symbol.for("propane:message:" + MapMapKey.$typeId);
  static readonly $typeName = "MapMapKey";
  static EMPTY: MapMapKey;
  #nested!: ImmutableMap<ImmutableMap<string, number>, string>;
  #optional!: ImmutableMap<ImmutableMap<string, number>, number> | undefined;
  constructor(props?: MapMapKey.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && MapMapKey.EMPTY) return MapMapKey.EMPTY;
    super(TYPE_TAG_MapMapKey, "MapMapKey");
    this.#nested = props ? (props.nested === undefined || props.nested === null ? new ImmutableMap() : props.nested as object instanceof ImmutableMap ? props.nested : new ImmutableMap(props.nested as Iterable<[unknown, unknown]>)) as ImmutableMap<ImmutableMap<string, number>, string> : new ImmutableMap();
    this.#optional = props ? (props.optional === undefined || props.optional === null ? props.optional : props.optional as object instanceof ImmutableMap ? props.optional : new ImmutableMap(props.optional as Iterable<[unknown, unknown]>)) as ImmutableMap<ImmutableMap<string, number>, number> : undefined;
    if (!props) MapMapKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapMapKey.Data>[] {
    return [{
      name: "nested",
      fieldNumber: null,
      getValue: () => this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>
    }, {
      name: "optional",
      fieldNumber: null,
      getValue: () => this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): MapMapKey.Data {
    const props = {} as Partial<MapMapKey.Data>;
    const nestedValue = entries["nested"];
    if (nestedValue === undefined) throw new Error("Missing required property \"nested\".");
    const nestedMapValue = nestedValue === undefined || nestedValue === null ? new ImmutableMap() : nestedValue as object instanceof ImmutableMap ? nestedValue : new ImmutableMap(nestedValue as Iterable<[unknown, unknown]>);
    if (!((nestedMapValue as object instanceof ImmutableMap || nestedMapValue as object instanceof Map) && [...(nestedMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey as object instanceof ImmutableMap || mapKey as object instanceof Map) && [...(mapKey as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number") && typeof mapValue === "string"))) throw new Error("Invalid value for property \"nested\".");
    props.nested = nestedMapValue as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>;
    const optionalValue = entries["optional"];
    const optionalNormalized = optionalValue === null ? undefined : optionalValue;
    const optionalMapValue = optionalNormalized === undefined || optionalNormalized === null ? optionalNormalized : optionalNormalized as object instanceof ImmutableMap ? optionalNormalized : new ImmutableMap(optionalNormalized as Iterable<[unknown, unknown]>);
    if (optionalMapValue !== undefined && !((optionalMapValue as object instanceof ImmutableMap || optionalMapValue as object instanceof Map) && [...(optionalMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey as object instanceof ImmutableMap || mapKey as object instanceof Map) && [...(mapKey as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"optional\".");
    props.optional = optionalMapValue as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>;
    return props as MapMapKey.Data;
  }
  static from(value: MapMapKey.Value): MapMapKey {
    return value instanceof MapMapKey ? value : new MapMapKey(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "nested":
        return new (this.constructor as typeof MapMapKey)({
          nested: child as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
          optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
        }) as this;
      case "optional":
        return new (this.constructor as typeof MapMapKey)({
          nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
          optional: child as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["nested", this.#nested] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["optional", this.#optional] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof MapMapKey>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for MapMapKey.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected MapMapKey.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
      nested: nestedMapNext as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  clearOptional() {
    const optionalCurrent = this.optional;
    if (optionalCurrent === undefined || optionalCurrent.size === 0) return this;
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.clear();
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: optionalMapNext as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  deleteNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) {
    const nestedCurrent = this.nested;
    const k = ImmutableMap.from(key);
    if (!nestedCurrent?.has(k)) return this;
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  deleteOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) {
    const optionalCurrent = this.optional;
    const k = ImmutableMap.from(key);
    if (!optionalCurrent?.has(k)) return this;
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: optionalMapNext as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
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
      nested: nestedMapNext as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
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
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: optionalMapNext as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  mapNestedEntries(mapper: (value: string, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string]) {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    const nestedMappedEntries: [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string][] = [];
    for (const [entryKey, entryValue] of nestedMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      nestedMappedEntries.push(mappedEntry);
    }
    nestedMapNext.clear();
    for (const [newKey, newValue] of nestedMappedEntries) {
      nestedMapNext.set(ImmutableMap.from(newKey), newValue);
    }
    if (this.nested === nestedMapNext as unknown || this.nested?.equals(nestedMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  mapOptionalEntries(mapper: (value: number, key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) => [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number]) {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    const optionalMappedEntries: [ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number][] = [];
    for (const [entryKey, entryValue] of optionalMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalMappedEntries.push(mappedEntry);
    }
    optionalMapNext.clear();
    for (const [newKey, newValue] of optionalMappedEntries) {
      optionalMapNext.set(ImmutableMap.from(newKey), newValue);
    }
    if (this.optional === optionalMapNext as unknown || this.optional?.equals(optionalMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: optionalMapNext as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  mergeNestedEntries(entries: ImmutableMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string> | ReadonlyMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string> | Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, string]>) {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      nestedMapNext.set(ImmutableMap.from(mergeKey), mergeValue);
    }
    if (this.nested === nestedMapNext as unknown || this.nested?.equals(nestedMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  mergeOptionalEntries(entries: ImmutableMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number> | ReadonlyMap<ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number> | Iterable<[ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, number]>) {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalMapNext.set(ImmutableMap.from(mergeKey), mergeValue);
    }
    if (this.optional === optionalMapNext as unknown || this.optional?.equals(optionalMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: optionalMapNext as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  set(updates: Partial<SetUpdates<MapMapKey.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapMapKey)(data) as this);
  }
  setNested(value: Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>) {
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: (value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value)) as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  setNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, value: string) {
    const nestedCurrent = this.nested;
    const k = ImmutableMap.from(key);
    if (nestedCurrent?.has(k)) {
      const existing = nestedCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    nestedMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  setOptional(value: Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]> | undefined) {
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: (value === undefined || value === null ? value : value instanceof ImmutableMap ? value : new ImmutableMap(value)) as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  setOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, value: number) {
    const optionalCurrent = this.optional;
    const k = ImmutableMap.from(key);
    if (optionalCurrent?.has(k)) {
      const existing = optionalCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    optionalMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: optionalMapNext as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  unsetOptional() {
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>
    }) as this);
  }
  updateNestedEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, updater: (currentValue: string | undefined) => string) {
    const nestedMapSource = this.#nested;
    const nestedMapEntries = [...nestedMapSource.entries()];
    const nestedMapNext = new Map(nestedMapEntries);
    const k = ImmutableMap.from(key);
    const currentValue = nestedMapNext.get(k);
    const updatedValue = updater(currentValue);
    nestedMapNext.set(k, updatedValue);
    if (this.nested === nestedMapNext as unknown || this.nested?.equals(nestedMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: nestedMapNext as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: this.#optional as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
  updateOptionalEntry(key: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>, updater: (currentValue: number | undefined) => number) {
    const optionalMapSource = this.#optional;
    const optionalMapEntries = optionalMapSource === undefined ? [] : [...optionalMapSource.entries()];
    const optionalMapNext = new Map(optionalMapEntries);
    const k = ImmutableMap.from(key);
    const currentValue = optionalMapNext.get(k);
    const updatedValue = updater(currentValue);
    optionalMapNext.set(k, updatedValue);
    if (this.optional === optionalMapNext as unknown || this.optional?.equals(optionalMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMapKey)({
      nested: this.#nested as Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>,
      optional: optionalMapNext as Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]>
    }) as this);
  }
}
export namespace MapMapKey {
  export type Data = {
    nested: Map<Map<string, number>, string> | Iterable<[Map<string, number>, string]>;
    optional?: Map<ReadonlyMap<string, number>, number> | Iterable<[ReadonlyMap<string, number>, number]> | undefined;
  };
  export type Value = MapMapKey | MapMapKey.Data;
}
