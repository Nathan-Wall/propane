/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/default-collections.pmsg
import { ImmutableArray } from '../runtime/common/array/immutable';
import { ImmutableMap } from '../runtime/common/map/immutable';
import { ImmutableSet } from '../runtime/common/set/immutable';

// Test message with non-optional collection fields to verify defaults
// @message
import type { MessagePropDescriptor, DataObject } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, equals } from "../runtime/index.js";
export class DefaultCollections extends Message<DefaultCollections.Data> {
  static TYPE_TAG = Symbol("DefaultCollections");
  static readonly $typeName = "DefaultCollections";
  static EMPTY: DefaultCollections;
  #arr: ImmutableArray<number>;
  #map: ImmutableMap<string, number>;
  #set: ImmutableSet<string>;
  constructor(props?: DefaultCollections.Value) {
    if (!props && DefaultCollections.EMPTY) return DefaultCollections.EMPTY;
    super(DefaultCollections.TYPE_TAG, "DefaultCollections");
    this.#arr = props ? props.arr === undefined || props.arr === null ? new ImmutableArray() : props.arr instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr) : new ImmutableArray();
    this.#map = props ? props.map === undefined || props.map === null ? new ImmutableMap() : props.map instanceof ImmutableMap ? props.map : new ImmutableMap(props.map) : new ImmutableMap();
    this.#set = props ? props.set === undefined || props.set === null ? new ImmutableSet() : props.set instanceof ImmutableSet ? props.set : new ImmutableSet(props.set) : new ImmutableSet();
    if (!props) DefaultCollections.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<DefaultCollections.Data>[] {
    return [{
      name: "arr",
      fieldNumber: null,
      getValue: () => this.#arr
    }, {
      name: "map",
      fieldNumber: null,
      getValue: () => this.#map
    }, {
      name: "set",
      fieldNumber: null,
      getValue: () => this.#set
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): DefaultCollections.Data {
    const props = {} as Partial<DefaultCollections.Data>;
    const arrValue = entries["arr"];
    if (arrValue === undefined) throw new Error("Missing required property \"arr\".");
    const arrArrayValue = arrValue === undefined || arrValue === null ? new ImmutableArray() : arrValue as object instanceof ImmutableArray ? arrValue : new ImmutableArray(arrValue);
    if (!((arrArrayValue instanceof ImmutableArray || Array.isArray(arrArrayValue)) && [...(arrArrayValue as Iterable<unknown>)].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"arr\".");
    props.arr = arrArrayValue as ImmutableArray<number>;
    const mapValue = entries["map"];
    if (mapValue === undefined) throw new Error("Missing required property \"map\".");
    const mapMapValue = mapValue === undefined || mapValue === null ? new ImmutableMap() : mapValue as object instanceof ImmutableMap ? mapValue : new ImmutableMap(mapValue as Iterable<[unknown, unknown]>);
    if (!((mapMapValue instanceof ImmutableMap || mapMapValue instanceof Map) && [...(mapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue as ImmutableMap<string, number>;
    const setValue = entries["set"];
    if (setValue === undefined) throw new Error("Missing required property \"set\".");
    const setSetValue = setValue === undefined || setValue === null ? new ImmutableSet() : setValue as object instanceof ImmutableSet ? setValue : new ImmutableSet(setValue);
    if (!((setSetValue instanceof ImmutableSet || setSetValue instanceof Set) && [...(setSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"set\".");
    props.set = setSetValue as ImmutableSet<string>;
    return props as DefaultCollections.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): DefaultCollections {
    switch (key) {
      case "arr":
        return new (this.constructor as typeof DefaultCollections)({
          arr: child as ImmutableArray<number>,
          map: this.#map,
          set: this.#set
        });
      case "map":
        return new (this.constructor as typeof DefaultCollections)({
          arr: this.#arr,
          map: child as ImmutableMap<string, number>,
          set: this.#set
        });
      case "set":
        return new (this.constructor as typeof DefaultCollections)({
          arr: this.#arr,
          map: this.#map,
          set: child as ImmutableSet<string>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["arr", this.#arr] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["map", this.#map] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["set", this.#set] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get arr(): ImmutableArray<number> {
    return this.#arr;
  }
  get map(): ImmutableMap<string, number> {
    return this.#map;
  }
  get set(): ImmutableSet<string> {
    return this.#set;
  }
  addAllSet(values: Iterable<string>): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    for (const toAdd of values) {
      setSetNext.add(toAdd);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
  addSet(value: string): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.add(value);
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
  clearMap(): DefaultCollections {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      set: this.#set
    }));
  }
  clearSet(): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.clear();
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
  copyWithinArr(target: number, start: number, end?: number): DefaultCollections {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  deleteAllSet(values: Iterable<string>): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    for (const del of values) {
      setSetNext.delete(del);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
  deleteMapEntry(key: string): DefaultCollections {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      set: this.#set
    }));
  }
  deleteSet(value: string): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.delete(value);
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
  fillArr(value: number, start?: number, end?: number): DefaultCollections {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.fill(value, start, end);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  filterMapEntries(predicate: (value: number, key: string) => boolean): DefaultCollections {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [entryKey, entryValue] of mapMapNext) {
      if (!predicate(entryValue, entryKey)) mapMapNext.delete(entryKey);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      set: this.#set
    }));
  }
  filterSet(predicate: (value) => boolean): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    const setFiltered = [];
    for (const value of setSetNext) {
      if (predicate(value)) setFiltered.push(value);
    }
    setSetNext.clear();
    for (const value of setFiltered) {
      setSetNext.add(value);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
  mapMapEntries(mapper: (value: number, key: string) => [string, number]): DefaultCollections {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const mapMappedEntries = [];
    for (const [entryKey, entryValue] of mapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      mapMappedEntries.push(mappedEntry);
    }
    mapMapNext.clear();
    for (const [newKey, newValue] of mapMappedEntries) {
      mapMapNext.set(newKey, newValue);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      set: this.#set
    }));
  }
  mapSet(mapper: (value) => string): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    const setMapped = [];
    for (const value of setSetNext) {
      const mappedValue = mapper(value);
      setMapped.push(mappedValue);
    }
    setSetNext.clear();
    for (const value of setMapped) {
      setSetNext.add(value);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
  mergeMapEntries(entries: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>): DefaultCollections {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      mapMapNext.set(mergeKey, mergeValue);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      set: this.#set
    }));
  }
  popArr(): DefaultCollections {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  pushArr(...values): DefaultCollections {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  reverseArr(): DefaultCollections {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  setArr(value: number[] | Iterable<number>): DefaultCollections {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: value,
      map: this.#map,
      set: this.#set
    }));
  }
  setMap(value: Map<string, number> | Iterable<[string, number]>): DefaultCollections {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value),
      set: this.#set
    }));
  }
  setMapEntry(key: string, value: number): DefaultCollections {
    const mapCurrent = this.map;
    if (mapCurrent?.has(key)) {
      const existing = mapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      set: this.#set
    }));
  }
  setSet(value: Set<string> | Iterable<string>): DefaultCollections {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: value === undefined || value === null ? new ImmutableSet() : value instanceof ImmutableSet ? value : new ImmutableSet(value)
    }));
  }
  shiftArr(): DefaultCollections {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  sortArr(compareFn?: (a: number, b: number) => number): DefaultCollections {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.sort(compareFn);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  spliceArr(start: number, deleteCount?: number, ...items): DefaultCollections {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  unshiftArr(...values): DefaultCollections {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      set: this.#set
    }));
  }
  updateMapEntry(key: string, updater: (currentValue: number | undefined) => number): DefaultCollections {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const currentValue = mapMapNext.get(key);
    const updatedValue = updater(currentValue);
    mapMapNext.set(key, updatedValue);
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      set: this.#set
    }));
  }
  updateSet(updater: (current: ImmutableSet<string>) => Iterable<string>): DefaultCollections {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    const updated = updater(setSetNext);
    setSetNext.clear();
    for (const updatedItem of updated) {
      setSetNext.add(updatedItem);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      set: setSetNext
    }));
  }
}
export namespace DefaultCollections {
  export type Data = {
    arr: number[] | Iterable<number>;
    map: Map<string, number> | Iterable<[string, number]>;
    set: Set<string> | Iterable<string>;
  };
  export type Value = DefaultCollections | DefaultCollections.Data;
}
