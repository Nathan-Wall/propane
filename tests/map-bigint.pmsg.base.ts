/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-bigint.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_MapBigintKey = Symbol("MapBigintKey");
export class MapBigintKey extends Message<MapBigintKey.Data> {
  static $typeId = "tests/map-bigint.pmsg#MapBigintKey";
  static $typeHash = "sha256:0af4a691d0e1db5314d1a1bb51249dc9f17eb4b7de1f6074397b1e00811e416d";
  static $instanceTag = Symbol.for("propane:message:" + MapBigintKey.$typeId);
  static readonly $typeName = "MapBigintKey";
  static EMPTY: MapBigintKey;
  #values!: ImmutableMap<bigint, string>;
  constructor(props?: MapBigintKey.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && MapBigintKey.EMPTY) return MapBigintKey.EMPTY;
    super(TYPE_TAG_MapBigintKey, "MapBigintKey");
    this.#values = props ? (props.values === undefined || props.values === null ? new ImmutableMap() : ImmutableMap.isInstance(props.values) ? props.values : new ImmutableMap(props.values as Iterable<[unknown, unknown]>)) as ImmutableMap<bigint, string> : new ImmutableMap();
    if (!props) MapBigintKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapBigintKey.Data>[] {
    return [{
      name: "values",
      fieldNumber: null,
      getValue: () => this.#values as Map<bigint, string> | Iterable<[bigint, string]>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): MapBigintKey.Data {
    const props = {} as Partial<MapBigintKey.Data>;
    const valuesValue = entries["values"];
    if (valuesValue === undefined) throw new Error("Missing required property \"values\".");
    const valuesMapValue = valuesValue === undefined || valuesValue === null ? new ImmutableMap() : ImmutableMap.isInstance(valuesValue) ? valuesValue : new ImmutableMap(valuesValue as Iterable<[unknown, unknown]>);
    if (!((ImmutableMap.isInstance(valuesMapValue) || valuesMapValue as object instanceof Map) && [...(valuesMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "bigint" && typeof mapValue === "string"))) throw new Error("Invalid value for property \"values\".");
    props.values = valuesMapValue as Map<bigint, string> | Iterable<[bigint, string]>;
    return props as MapBigintKey.Data;
  }
  static from(value: MapBigintKey.Value): MapBigintKey {
    return MapBigintKey.isInstance(value) ? value : new MapBigintKey(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "values":
        return new (this.constructor as typeof MapBigintKey)({
          values: child as Map<bigint, string> | Iterable<[bigint, string]>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["values", this.#values] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof MapBigintKey>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for MapBigintKey.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected MapBigintKey.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get values(): ImmutableMap<bigint, string> {
    return this.#values;
  }
  clearValues() {
    const valuesCurrent = this.values;
    if (valuesCurrent === undefined || valuesCurrent.size === 0) return this;
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.clear();
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
  deleteValue(key: bigint) {
    const valuesCurrent = this.values;
    if (!valuesCurrent?.has(key)) return this;
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
  filterValues(predicate: (value: string, key: bigint) => boolean) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [entryKey, entryValue] of valuesMapNext) {
      if (!predicate(entryValue, entryKey)) valuesMapNext.delete(entryKey);
    }
    if (this.values === valuesMapNext as unknown || this.values?.equals(valuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
  mapValues(mapper: (value: string, key: bigint) => [bigint, string]) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    const valuesMappedEntries: [bigint, string][] = [];
    for (const [entryKey, entryValue] of valuesMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      valuesMappedEntries.push(mappedEntry);
    }
    valuesMapNext.clear();
    for (const [newKey, newValue] of valuesMappedEntries) {
      valuesMapNext.set(newKey, newValue);
    }
    if (this.values === valuesMapNext as unknown || this.values?.equals(valuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
  mergeValues(entries: ImmutableMap<bigint, string> | ReadonlyMap<bigint, string> | Iterable<[bigint, string]>) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      valuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.values === valuesMapNext as unknown || this.values?.equals(valuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
  set(updates: Partial<SetUpdates<MapBigintKey.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapBigintKey)(data) as this);
  }
  setValue(key: bigint, value: string) {
    const valuesCurrent = this.values;
    if (valuesCurrent?.has(key)) {
      const existing = valuesCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
  setValues(value: Map<bigint, string> | Iterable<[bigint, string]>) {
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: (value === undefined || value === null ? new ImmutableMap() : ImmutableMap.isInstance(value) ? value : new ImmutableMap(value)) as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
  updateValue(key: bigint, updater: (currentValue: string | undefined) => string) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    const currentValue = valuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    valuesMapNext.set(key, updatedValue);
    if (this.values === valuesMapNext as unknown || this.values?.equals(valuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext as Map<bigint, string> | Iterable<[bigint, string]>
    }) as this);
  }
}
export namespace MapBigintKey {
  export type Data = {
    values: Map<bigint, string> | Iterable<[bigint, string]>;
  };
  export type Value = MapBigintKey | MapBigintKey.Data;
}
