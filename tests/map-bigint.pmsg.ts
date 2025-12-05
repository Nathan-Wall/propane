/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-bigint.pmsg
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals } from "../runtime/index.js";
// @message
export class MapBigintKey extends Message<MapBigintKey.Data> {
  static TYPE_TAG = Symbol("MapBigintKey");
  static readonly $typeName = "MapBigintKey";
  static EMPTY: MapBigintKey;
  #values: ImmutableMap<bigint, string>;
  constructor(props?: MapBigintKey.Value) {
    if (!props && MapBigintKey.EMPTY) return MapBigintKey.EMPTY;
    super(MapBigintKey.TYPE_TAG, "MapBigintKey");
    this.#values = props ? props.values === undefined || props.values === null ? new ImmutableMap() : props.values instanceof ImmutableMap ? props.values : new ImmutableMap(props.values) : new ImmutableMap();
    if (!props) MapBigintKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapBigintKey.Data>[] {
    return [{
      name: "values",
      fieldNumber: null,
      getValue: () => this.#values
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapBigintKey.Data {
    const props = {} as Partial<MapBigintKey.Data>;
    const valuesValue = entries["values"];
    if (valuesValue === undefined) throw new Error("Missing required property \"values\".");
    const valuesMapValue = valuesValue === undefined || valuesValue === null ? new ImmutableMap() : valuesValue as object instanceof ImmutableMap ? valuesValue : new ImmutableMap(valuesValue as Iterable<[unknown, unknown]>);
    if (!((valuesMapValue instanceof ImmutableMap || valuesMapValue instanceof Map) && [...(valuesMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "bigint" && typeof mapValue === "string"))) throw new Error("Invalid value for property \"values\".");
    props.values = valuesMapValue as ImmutableMap<bigint, string>;
    return props as MapBigintKey.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): MapBigintKey {
    switch (key) {
      case "values":
        return new (this.constructor as typeof MapBigintKey)({
          values: child as ImmutableMap<bigint, string>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["values", this.#values] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
      values: valuesMapNext
    }));
  }
  deleteValuesEntry(key: bigint) {
    const valuesCurrent = this.values;
    if (!valuesCurrent?.has(key)) return this;
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext
    }));
  }
  filterValuesEntries(predicate: (value: string, key: bigint) => boolean) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [entryKey, entryValue] of valuesMapNext) {
      if (!predicate(entryValue, entryKey)) valuesMapNext.delete(entryKey);
    }
    if (this.values === valuesMapNext as unknown || this.values?.equals(valuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext
    }));
  }
  mapValuesEntries(mapper: (value: string, key: bigint) => [bigint, string]) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    const valuesMappedEntries = [];
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
      values: valuesMapNext
    }));
  }
  mergeValuesEntries(entries: ImmutableMap<bigint, string> | ReadonlyMap<bigint, string> | Iterable<[bigint, string]>) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      valuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.values === valuesMapNext as unknown || this.values?.equals(valuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext
    }));
  }
  setValues(value: Map<bigint, string> | Iterable<[bigint, string]>) {
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value)
    }));
  }
  setValuesEntry(key: bigint, value: string) {
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
      values: valuesMapNext
    }));
  }
  updateValuesEntry(key: bigint, updater: (currentValue: string | undefined) => string) {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    const currentValue = valuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    valuesMapNext.set(key, updatedValue);
    if (this.values === valuesMapNext as unknown || this.values?.equals(valuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapBigintKey)({
      values: valuesMapNext
    }));
  }
}
export namespace MapBigintKey {
  export type Data = {
    values: Map<bigint, string> | Iterable<[bigint, string]>;
  };
  export type Value = MapBigintKey | MapBigintKey.Data;
}
