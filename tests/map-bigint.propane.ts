// Generated from tests/map-bigint.propane
import { Message, MessagePropDescriptor, ImmutableMap } from "@propanejs/runtime";
export namespace MapBigintKey {
  export type Data = {
    values: ReadonlyMap<bigint, string>;
  };
  export type Value = MapBigintKey | MapBigintKey.Data;
}
export class MapBigintKey extends Message<MapBigintKey.Data> {
  static #typeTag = Symbol("MapBigintKey");
  #values: ReadonlyMap<bigint, string>;
  constructor(props: MapBigintKey.Value) {
    super(MapBigintKey.#typeTag);
    this.#values = Array.isArray(props.values) ? new ImmutableMap(props.values) : props.values instanceof ImmutableMap || Object.prototype.toString.call(props.values) === "[object ImmutableMap]" ? props.values : props.values instanceof Map || Object.prototype.toString.call(props.values) === "[object Map]" ? new ImmutableMap(props.values) : props.values;
  }
  get values(): ReadonlyMap<bigint, string> {
    return this.#values;
  }
  setValues(value: ReadonlyMap<bigint, string>): MapBigintKey {
    return new MapBigintKey({
      values: Array.isArray(value) ? new ImmutableMap(value) : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : value instanceof Map || Object.prototype.toString.call(value) === "[object Map]" ? new ImmutableMap(value) : value
    });
  }
  setValuesEntry(key: bigint, value: string): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = Array.from(valuesMapSource.entries());
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.set(key, value);
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  deleteValuesEntry(key: bigint): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = Array.from(valuesMapSource.entries());
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.delete(key);
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  clearValues(): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = Array.from(valuesMapSource.entries());
    const valuesMapNext = new Map(valuesMapEntries);
    valuesMapNext.clear();
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  mergeValuesEntries(entries: Iterable<[bigint, string]> | Map<bigint, string> | ReadonlyMap<bigint, string>): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = Array.from(valuesMapSource.entries());
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      valuesMapNext.set(mergeKey, mergeValue);
    }
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  updateValuesEntry(key: bigint, updater: (currentValue: string | undefined) => string): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = Array.from(valuesMapSource.entries());
    const valuesMapNext = new Map(valuesMapEntries);
    const currentValue = valuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    valuesMapNext.set(key, updatedValue);
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  mapValuesEntries(mapper: (value: string, key: bigint) => [bigint, string]): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = Array.from(valuesMapSource.entries());
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
    return new MapBigintKey({
      values: valuesMapNext
    });
  }
  filterValuesEntries(predicate: (value: string, key: bigint) => boolean): MapBigintKey {
    const valuesMapSource = this.#values;
    const valuesMapEntries = Array.from(valuesMapSource.entries());
    const valuesMapNext = new Map(valuesMapEntries);
    for (const [entryKey, entryValue] of valuesMapNext) {
      if (!predicate(entryValue, entryKey)) valuesMapNext.delete(entryKey);
    }
    return new MapBigintKey({
      values: valuesMapNext
    });
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
    const valuesMapValue = Array.isArray(valuesValue) ? new ImmutableMap(valuesValue) : valuesValue instanceof ImmutableMap || Object.prototype.toString.call(valuesValue) === "[object ImmutableMap]" ? valuesValue : valuesValue instanceof Map || Object.prototype.toString.call(valuesValue) === "[object Map]" ? new ImmutableMap(valuesValue) : valuesValue;
    if (!((valuesMapValue instanceof ImmutableMap || Object.prototype.toString.call(valuesMapValue) === "[object ImmutableMap]" || valuesMapValue instanceof Map || Object.prototype.toString.call(valuesMapValue) === "[object Map]") && [...valuesMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "bigint" && typeof mapValue === "string"))) throw new Error("Invalid value for property \"values\".");
    props.values = valuesMapValue;
    return props as MapBigintKey.Data;
  }
}