/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-bigint.propane
import { Message, MessagePropDescriptor, ImmutableMap, equals } from "@propanejs/runtime";
export class MapBigintKey extends Message<MapBigintKey.Data> {
  static TYPE_TAG = Symbol("MapBigintKey");
  static EMPTY: MapBigintKey;
  #values: ImmutableMap<bigint, string>;
  constructor(props?: MapBigintKey.Value) {
    if (!props && MapBigintKey.EMPTY) return MapBigintKey.EMPTY;
    super(MapBigintKey.TYPE_TAG);
    this.#values = props ? props.values === undefined || props.values === null ? props.values : props.values instanceof ImmutableMap || Object.prototype.toString.call(props.values) === "[object ImmutableMap]" ? props.values : new ImmutableMap(props.values) : new Map();
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
    const valuesMapValue = valuesValue === undefined || valuesValue === null ? valuesValue : valuesValue instanceof ImmutableMap || Object.prototype.toString.call(valuesValue) === "[object ImmutableMap]" ? valuesValue : new ImmutableMap(valuesValue);
    if (!((valuesMapValue instanceof ImmutableMap || Object.prototype.toString.call(valuesMapValue) === "[object ImmutableMap]" || valuesMapValue instanceof Map || Object.prototype.toString.call(valuesMapValue) === "[object Map]") && [...valuesMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "bigint" && typeof mapValue === "string"))) throw new Error("Invalid value for property \"values\".");
    props.values = valuesMapValue;
    return props as MapBigintKey.Data;
  }
  get values(): ImmutableMap<bigint, string> {
    return this.#values;
  }
  clearValues(): MapBigintKey {
    const valuesCurrent = this.values;
    if (valuesCurrent === undefined || valuesCurrent.size === 0) return this;
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.clear();
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  deleteValuesEntry(key: bigint): MapBigintKey {
    const valuesCurrent = this.values;
    if (valuesCurrent === undefined || !valuesCurrent.has(key)) return this;
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.delete(key);
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  filterValuesEntries(predicate: (value: string, key: bigint) => boolean): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [entryKey, entryValue] of valuesMapNext) {
      if (!predicate(entryValue, entryKey)) valuesMapNext.delete(entryKey);
    }
    if (this.values === valuesMapNext || this.values !== undefined && this.values.equals(valuesMapNext)) return this;
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  mapValuesEntries(mapper: (value: string, key: bigint) => [bigint, string]): MapBigintKey {
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
    if (this.values === valuesMapNext || this.values !== undefined && this.values.equals(valuesMapNext)) return this;
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  mergeValuesEntries(entries: Iterable<[bigint, string]> | ImmutableMap<bigint, string> | ReadonlyMap<bigint, string> | Iterable<[bigint, string]>): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      valuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.values === valuesMapNext || this.values !== undefined && this.values.equals(valuesMapNext)) return this;
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  setValues(value: Map<bigint, string> | Iterable<[bigint, string]>): MapBigintKey {
    return new MapBigintKey({
      values: value === undefined || value === null ? value : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : new ImmutableMap(value)
    });
  }
  setValuesEntry(key: bigint, value: string): MapBigintKey {
    const valuesCurrent = this.values;
    if (valuesCurrent && valuesCurrent.has(key)) {
      const existing = valuesCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.set(key, value);
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  updateValuesEntry(key: bigint, updater: (currentValue: string | undefined) => string): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = [...valuesMapSource.entries()];
    const valuesMapNext = new Map(valuesMapEntries);
    const currentValue = valuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    valuesMapNext.set(key, updatedValue);
    if (this.values === valuesMapNext || this.values !== undefined && this.values.equals(valuesMapNext)) return this;
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
}
export namespace MapBigintKey {
  export interface Data {
    values: Map<bigint, string> | Iterable<[bigint, string]>;
  }
  export type Value = MapBigintKey | MapBigintKey.Data;
}