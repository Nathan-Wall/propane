/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-array-key.propane
import { Message, MessagePropDescriptor, ImmutableMap, ImmutableArray, ImmutableDate, equals } from "@propanejs/runtime";
export class MapArrayKey extends Message<MapArrayKey.Data> {
  static TYPE_TAG = Symbol("MapArrayKey");
  static EMPTY: MapArrayKey;
  #arrayValues: ImmutableMap<ImmutableArray<string>, number>;
  #numberArrayMap: ImmutableMap<ImmutableArray<number>, string>;
  #optionalArrayMap: ImmutableMap<ImmutableArray<boolean>, ImmutableDate> | undefined;
  constructor(props?: MapArrayKey.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && MapArrayKey.EMPTY) return MapArrayKey.EMPTY;
    super(MapArrayKey.TYPE_TAG, "MapArrayKey", listeners);
    this.#arrayValues = props ? props.arrayValues === undefined || props.arrayValues === null ? props.arrayValues : new ImmutableMap(Array.from(props.arrayValues).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v])) : new Map();
    this.#numberArrayMap = props ? props.numberArrayMap === undefined || props.numberArrayMap === null ? props.numberArrayMap : new ImmutableMap(Array.from(props.numberArrayMap).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v])) : new Map();
    this.#optionalArrayMap = props ? props.optionalArrayMap === undefined || props.optionalArrayMap === null ? props.optionalArrayMap : new ImmutableMap(Array.from(props.optionalArrayMap).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)])) : undefined;
    if (!props && !listeners) MapArrayKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapArrayKey.Data>[] {
    return [{
      name: "arrayValues",
      fieldNumber: null,
      getValue: () => this.#arrayValues
    }, {
      name: "numberArrayMap",
      fieldNumber: null,
      getValue: () => this.#numberArrayMap
    }, {
      name: "optionalArrayMap",
      fieldNumber: null,
      getValue: () => this.#optionalArrayMap
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapArrayKey.Data {
    const props = {} as Partial<MapArrayKey.Data>;
    const arrayValuesValue = entries["arrayValues"];
    if (arrayValuesValue === undefined) throw new Error("Missing required property \"arrayValues\".");
    const arrayValuesMapValue = arrayValuesValue === undefined || arrayValuesValue === null ? arrayValuesValue : new ImmutableMap(Array.from(arrayValuesValue).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v]));
    if (!((arrayValuesMapValue instanceof ImmutableMap || Object.prototype.toString.call(arrayValuesMapValue) === "[object ImmutableMap]" || arrayValuesMapValue instanceof Map || Object.prototype.toString.call(arrayValuesMapValue) === "[object Map]") && [...arrayValuesMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof ImmutableArray || Object.prototype.toString.call(mapKey) === "[object ImmutableArray]" || Array.isArray(mapKey)) && [...mapKey].every(element => typeof element === "string") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"arrayValues\".");
    props.arrayValues = arrayValuesMapValue;
    const numberArrayMapValue = entries["numberArrayMap"];
    if (numberArrayMapValue === undefined) throw new Error("Missing required property \"numberArrayMap\".");
    const numberArrayMapMapValue = numberArrayMapValue === undefined || numberArrayMapValue === null ? numberArrayMapValue : new ImmutableMap(Array.from(numberArrayMapValue).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v]));
    if (!((numberArrayMapMapValue instanceof ImmutableMap || Object.prototype.toString.call(numberArrayMapMapValue) === "[object ImmutableMap]" || numberArrayMapMapValue instanceof Map || Object.prototype.toString.call(numberArrayMapMapValue) === "[object Map]") && [...numberArrayMapMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof ImmutableArray || Object.prototype.toString.call(mapKey) === "[object ImmutableArray]" || Array.isArray(mapKey)) && [...mapKey].every(element => typeof element === "number") && typeof mapValue === "string"))) throw new Error("Invalid value for property \"numberArrayMap\".");
    props.numberArrayMap = numberArrayMapMapValue;
    const optionalArrayMapValue = entries["optionalArrayMap"];
    const optionalArrayMapNormalized = optionalArrayMapValue === null ? undefined : optionalArrayMapValue;
    const optionalArrayMapMapValue = optionalArrayMapNormalized === undefined || optionalArrayMapNormalized === null ? optionalArrayMapNormalized : new ImmutableMap(Array.from(optionalArrayMapNormalized).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)]));
    if (optionalArrayMapMapValue !== undefined && !((optionalArrayMapMapValue instanceof ImmutableMap || Object.prototype.toString.call(optionalArrayMapMapValue) === "[object ImmutableMap]" || optionalArrayMapMapValue instanceof Map || Object.prototype.toString.call(optionalArrayMapMapValue) === "[object Map]") && [...optionalArrayMapMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof ImmutableArray || Object.prototype.toString.call(mapKey) === "[object ImmutableArray]" || Array.isArray(mapKey)) && [...mapKey].every(element => typeof element === "boolean") && (mapValue instanceof Date || mapValue instanceof ImmutableDate || Object.prototype.toString.call(mapValue) === "[object Date]" || Object.prototype.toString.call(mapValue) === "[object ImmutableDate]")))) throw new Error("Invalid value for property \"optionalArrayMap\".");
    props.optionalArrayMap = optionalArrayMapMapValue;
    return props as MapArrayKey.Data;
  }
  get arrayValues(): ImmutableMap<ImmutableArray<string>, number> {
    return this.#arrayValues;
  }
  get numberArrayMap(): ImmutableMap<ImmutableArray<number>, string> {
    return this.#numberArrayMap;
  }
  get optionalArrayMap(): ImmutableMap<ImmutableArray<boolean>, ImmutableDate> | undefined {
    return this.#optionalArrayMap;
  }
  clearArrayValues(): MapArrayKey {
    const arrayValuesCurrent = this.arrayValues;
    if (arrayValuesCurrent === undefined || arrayValuesCurrent.size === 0) return this;
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    arrayValuesMapNext.clear();
    return this.$update(new MapArrayKey({
      arrayValues: arrayValuesMapNext,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  clearNumberArrayMap(): MapArrayKey {
    const numberArrayMapCurrent = this.numberArrayMap;
    if (numberArrayMapCurrent === undefined || numberArrayMapCurrent.size === 0) return this;
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    numberArrayMapMapNext.clear();
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: numberArrayMapMapNext,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  clearOptionalArrayMap(): MapArrayKey {
    const optionalArrayMapCurrent = this.optionalArrayMap;
    if (optionalArrayMapCurrent === undefined || optionalArrayMapCurrent.size === 0) return this;
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    optionalArrayMapMapNext.clear();
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: optionalArrayMapMapNext
    }, this.$listeners));
  }
  deleteArrayValuesEntry(key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>): MapArrayKey {
    const arrayValuesCurrent = this.arrayValues;
    if (arrayValuesCurrent === undefined || !arrayValuesCurrent.has(key)) return this;
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    arrayValuesMapNext.delete(key);
    return this.$update(new MapArrayKey({
      arrayValues: arrayValuesMapNext,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  deleteNumberArrayMapEntry(key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>): MapArrayKey {
    const numberArrayMapCurrent = this.numberArrayMap;
    if (numberArrayMapCurrent === undefined || !numberArrayMapCurrent.has(key)) return this;
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    numberArrayMapMapNext.delete(key);
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: numberArrayMapMapNext,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  deleteOptionalArrayMap(): MapArrayKey {
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap
    }, this.$listeners));
  }
  deleteOptionalArrayMapEntry(key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>): MapArrayKey {
    const optionalArrayMapCurrent = this.optionalArrayMap;
    if (optionalArrayMapCurrent === undefined || !optionalArrayMapCurrent.has(key)) return this;
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    optionalArrayMapMapNext.delete(key);
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: optionalArrayMapMapNext
    }, this.$listeners));
  }
  filterArrayValuesEntries(predicate: (value: number, key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>) => boolean): MapArrayKey {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    for (const [entryKey, entryValue] of arrayValuesMapNext) {
      if (!predicate(entryValue, entryKey)) arrayValuesMapNext.delete(entryKey);
    }
    if (this.arrayValues === arrayValuesMapNext || this.arrayValues !== undefined && this.arrayValues.equals(arrayValuesMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: arrayValuesMapNext,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  filterNumberArrayMapEntries(predicate: (value: string, key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>) => boolean): MapArrayKey {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    for (const [entryKey, entryValue] of numberArrayMapMapNext) {
      if (!predicate(entryValue, entryKey)) numberArrayMapMapNext.delete(entryKey);
    }
    if (this.numberArrayMap === numberArrayMapMapNext || this.numberArrayMap !== undefined && this.numberArrayMap.equals(numberArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: numberArrayMapMapNext,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  filterOptionalArrayMapEntries(predicate: (value: ImmutableDate | Date, key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>) => boolean): MapArrayKey {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    for (const [entryKey, entryValue] of optionalArrayMapMapNext) {
      if (!predicate(entryValue, entryKey)) optionalArrayMapMapNext.delete(entryKey);
    }
    if (this.optionalArrayMap === optionalArrayMapMapNext || this.optionalArrayMap !== undefined && this.optionalArrayMap.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: optionalArrayMapMapNext
    }, this.$listeners));
  }
  mapArrayValuesEntries(mapper: (value: number, key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>) => [ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number]): MapArrayKey {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    const arrayValuesMappedEntries = [];
    for (const [entryKey, entryValue] of arrayValuesMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      arrayValuesMappedEntries.push(mappedEntry);
    }
    arrayValuesMapNext.clear();
    for (const [newKey, newValue] of arrayValuesMappedEntries) {
      arrayValuesMapNext.set(newKey, newValue);
    }
    if (this.arrayValues === arrayValuesMapNext || this.arrayValues !== undefined && this.arrayValues.equals(arrayValuesMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: arrayValuesMapNext,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  mapNumberArrayMapEntries(mapper: (value: string, key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>) => [ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string]): MapArrayKey {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    const numberArrayMapMappedEntries = [];
    for (const [entryKey, entryValue] of numberArrayMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      numberArrayMapMappedEntries.push(mappedEntry);
    }
    numberArrayMapMapNext.clear();
    for (const [newKey, newValue] of numberArrayMapMappedEntries) {
      numberArrayMapMapNext.set(newKey, newValue);
    }
    if (this.numberArrayMap === numberArrayMapMapNext || this.numberArrayMap !== undefined && this.numberArrayMap.equals(numberArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: numberArrayMapMapNext,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  mapOptionalArrayMapEntries(mapper: (value: ImmutableDate | Date, key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>) => [ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date]): MapArrayKey {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    const optionalArrayMapMappedEntries = [];
    for (const [entryKey, entryValue] of optionalArrayMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalArrayMapMappedEntries.push(mappedEntry);
    }
    optionalArrayMapMapNext.clear();
    for (const [newKey, newValue] of optionalArrayMapMappedEntries) {
      optionalArrayMapMapNext.set(newKey, newValue);
    }
    if (this.optionalArrayMap === optionalArrayMapMapNext || this.optionalArrayMap !== undefined && this.optionalArrayMap.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: optionalArrayMapMapNext
    }, this.$listeners));
  }
  mergeArrayValuesEntries(entries: Iterable<[ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number]> | ImmutableMap<ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number> | ReadonlyMap<ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number> | Iterable<[ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number]>): MapArrayKey {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      arrayValuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.arrayValues === arrayValuesMapNext || this.arrayValues !== undefined && this.arrayValues.equals(arrayValuesMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: arrayValuesMapNext,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  mergeNumberArrayMapEntries(entries: Iterable<[ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string]> | ImmutableMap<ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string> | ReadonlyMap<ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string> | Iterable<[ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string]>): MapArrayKey {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      numberArrayMapMapNext.set(mergeKey, mergeValue);
    }
    if (this.numberArrayMap === numberArrayMapMapNext || this.numberArrayMap !== undefined && this.numberArrayMap.equals(numberArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: numberArrayMapMapNext,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  mergeOptionalArrayMapEntries(entries: Iterable<[ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date]> | ImmutableMap<ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date> | ReadonlyMap<ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date> | Iterable<[ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date]>): MapArrayKey {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalArrayMapMapNext.set(mergeKey, mergeValue);
    }
    if (this.optionalArrayMap === optionalArrayMapMapNext || this.optionalArrayMap !== undefined && this.optionalArrayMap.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: optionalArrayMapMapNext
    }, this.$listeners));
  }
  setArrayValues(value: Map<string[], number> | Iterable<[string[], number]>): MapArrayKey {
    return this.$update(new MapArrayKey({
      arrayValues: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v])),
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  setArrayValuesEntry(key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, value: number): MapArrayKey {
    const arrayValuesCurrent = this.arrayValues;
    if (arrayValuesCurrent && arrayValuesCurrent.has(key)) {
      const existing = arrayValuesCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    arrayValuesMapNext.set(key, value);
    return this.$update(new MapArrayKey({
      arrayValues: arrayValuesMapNext,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  setNumberArrayMap(value: Map<number[], string> | Iterable<[number[], string]>): MapArrayKey {
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v])),
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  setNumberArrayMapEntry(key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, value: string): MapArrayKey {
    const numberArrayMapCurrent = this.numberArrayMap;
    if (numberArrayMapCurrent && numberArrayMapCurrent.has(key)) {
      const existing = numberArrayMapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    numberArrayMapMapNext.set(key, value);
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: numberArrayMapMapNext,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  setOptionalArrayMap(value: Map<boolean[], Date> | Iterable<[boolean[], Date]>): MapArrayKey {
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableArray ? k : new ImmutableArray(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)]))
    }, this.$listeners));
  }
  setOptionalArrayMapEntry(key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, value: ImmutableDate | Date): MapArrayKey {
    const optionalArrayMapCurrent = this.optionalArrayMap;
    if (optionalArrayMapCurrent && optionalArrayMapCurrent.has(key)) {
      const existing = optionalArrayMapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    optionalArrayMapMapNext.set(key, value);
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: optionalArrayMapMapNext
    }, this.$listeners));
  }
  updateArrayValuesEntry(key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, updater: (currentValue: number | undefined) => number): MapArrayKey {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    const currentValue = arrayValuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    arrayValuesMapNext.set(key, updatedValue);
    if (this.arrayValues === arrayValuesMapNext || this.arrayValues !== undefined && this.arrayValues.equals(arrayValuesMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: arrayValuesMapNext,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  updateNumberArrayMapEntry(key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, updater: (currentValue: string | undefined) => string): MapArrayKey {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    const currentValue = numberArrayMapMapNext.get(key);
    const updatedValue = updater(currentValue);
    numberArrayMapMapNext.set(key, updatedValue);
    if (this.numberArrayMap === numberArrayMapMapNext || this.numberArrayMap !== undefined && this.numberArrayMap.equals(numberArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: numberArrayMapMapNext,
      optionalArrayMap: this.#optionalArrayMap
    }, this.$listeners));
  }
  updateOptionalArrayMapEntry(key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date): MapArrayKey {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    const currentValue = optionalArrayMapMapNext.get(key);
    const updatedValue = updater(currentValue);
    optionalArrayMapMapNext.set(key, updatedValue);
    if (this.optionalArrayMap === optionalArrayMapMapNext || this.optionalArrayMap !== undefined && this.optionalArrayMap.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new MapArrayKey({
      arrayValues: this.#arrayValues,
      numberArrayMap: this.#numberArrayMap,
      optionalArrayMap: optionalArrayMapMapNext
    }, this.$listeners));
  }
}
export namespace MapArrayKey {
  export interface Data {
    arrayValues: Map<string[], number> | Iterable<[string[], number]>;
    numberArrayMap: Map<number[], string> | Iterable<[number[], string]>;
    optionalArrayMap?: Map<boolean[], Date> | Iterable<[boolean[], Date]> | undefined;
  }
  export type Value = MapArrayKey | MapArrayKey.Data;
}