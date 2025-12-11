/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/default-collections.pmsg
import { ImmutableArray } from '../runtime/common/array/immutable';
import { ImmutableMap } from '../runtime/common/map/immutable';
import { ImmutableSet } from '../runtime/common/set/immutable';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, equals } from "../runtime/index.js";

// Test message with non-optional collection fields to verify defaults
import type { MessagePropDescriptor, DataObject } from "../runtime/index.js";
export class DefaultCollections extends Message<DefaultCollections.Data> {
  static TYPE_TAG = Symbol("DefaultCollections");
  static readonly $typeName = "DefaultCollections";
  static EMPTY: DefaultCollections;
  #arr: ImmutableArray<number>;
  #map: ImmutableMap<string, number>;
  #tags: ImmutableSet<string>;
  constructor(props?: DefaultCollections.Value) {
    if (!props && DefaultCollections.EMPTY) return DefaultCollections.EMPTY;
    super(DefaultCollections.TYPE_TAG, "DefaultCollections");
    this.#arr = props ? props.arr === undefined || props.arr === null ? new ImmutableArray() : props.arr instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr) : new ImmutableArray();
    this.#map = props ? props.map === undefined || props.map === null ? new ImmutableMap() : props.map instanceof ImmutableMap ? props.map : new ImmutableMap(props.map) : new ImmutableMap();
    this.#tags = props ? props.tags === undefined || props.tags === null ? new ImmutableSet() : props.tags instanceof ImmutableSet ? props.tags : new ImmutableSet(props.tags) : new ImmutableSet();
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
      name: "tags",
      fieldNumber: null,
      getValue: () => this.#tags
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
    const tagsValue = entries["tags"];
    if (tagsValue === undefined) throw new Error("Missing required property \"tags\".");
    const tagsSetValue = tagsValue === undefined || tagsValue === null ? new ImmutableSet() : tagsValue as object instanceof ImmutableSet ? tagsValue : new ImmutableSet(tagsValue);
    if (!((tagsSetValue instanceof ImmutableSet || tagsSetValue instanceof Set) && [...(tagsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"tags\".");
    props.tags = tagsSetValue as ImmutableSet<string>;
    return props as DefaultCollections.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): DefaultCollections {
    switch (key) {
      case "arr":
        return new (this.constructor as typeof DefaultCollections)({
          arr: child as ImmutableArray<number>,
          map: this.#map,
          tags: this.#tags
        });
      case "map":
        return new (this.constructor as typeof DefaultCollections)({
          arr: this.#arr,
          map: child as ImmutableMap<string, number>,
          tags: this.#tags
        });
      case "tags":
        return new (this.constructor as typeof DefaultCollections)({
          arr: this.#arr,
          map: this.#map,
          tags: child as ImmutableSet<string>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["arr", this.#arr] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["map", this.#map] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["tags", this.#tags] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get arr(): ImmutableArray<number> {
    return this.#arr;
  }
  get map(): ImmutableMap<string, number> {
    return this.#map;
  }
  get tags(): ImmutableSet<string> {
    return this.#tags;
  }
  addAllTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const toAdd of values) {
      tagsSetNext.add(toAdd);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
  addTags(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.add(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
  clearMap() {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      tags: this.#tags
    }));
  }
  clearTags() {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.clear();
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
  copyWithinArr(target: number, start: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  deleteAllTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const del of values) {
      tagsSetNext.delete(del);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
  deleteMapEntry(key: string) {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: mapMapNext,
      tags: this.#tags
    }));
  }
  deleteTags(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.delete(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
  fillArr(value: number, start?: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.fill(value, start, end);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  filterMapEntries(predicate: (value: number, key: string) => boolean) {
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
      tags: this.#tags
    }));
  }
  filterTags(predicate: (value) => boolean) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    const tagsFiltered = [];
    for (const value of tagsSetNext) {
      if (predicate(value)) tagsFiltered.push(value);
    }
    tagsSetNext.clear();
    for (const value of tagsFiltered) {
      tagsSetNext.add(value);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
  mapMapEntries(mapper: (value: number, key: string) => [string, number]) {
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
      tags: this.#tags
    }));
  }
  mapTags(mapper: (value) => string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    const tagsMapped = [];
    for (const value of tagsSetNext) {
      const mappedValue = mapper(value);
      tagsMapped.push(mappedValue);
    }
    tagsSetNext.clear();
    for (const value of tagsMapped) {
      tagsSetNext.add(value);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
  mergeMapEntries(entries: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) {
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
      tags: this.#tags
    }));
  }
  popArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  pushArr(...values) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  reverseArr() {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  setArr(value: number[] | Iterable<number>) {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: value,
      map: this.#map,
      tags: this.#tags
    }));
  }
  setMap(value: Map<string, number> | Iterable<[string, number]>) {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value),
      tags: this.#tags
    }));
  }
  setMapEntry(key: string, value: number) {
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
      tags: this.#tags
    }));
  }
  setTags(value: Set<string> | Iterable<string>) {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: value === undefined || value === null ? new ImmutableSet() : value instanceof ImmutableSet ? value : new ImmutableSet(value)
    }));
  }
  shiftArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  sortArr(compareFn?: (a: number, b: number) => number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.sort(compareFn);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  spliceArr(start: number, deleteCount?: number, ...items) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  unshiftArr(...values) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext,
      map: this.#map,
      tags: this.#tags
    }));
  }
  updateMapEntry(key: string, updater: (currentValue: number | undefined) => number) {
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
      tags: this.#tags
    }));
  }
  updateTags(updater: (current: ImmutableSet<string>) => Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    const updated = updater(tagsSetNext);
    tagsSetNext.clear();
    for (const updatedItem of updated) {
      tagsSetNext.add(updatedItem);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr,
      map: this.#map,
      tags: tagsSetNext
    }));
  }
}
export namespace DefaultCollections {
  export type Data = {
    arr: number[] | Iterable<number>;
    map: Map<string, number> | Iterable<[string, number]>;
    tags: Set<string> | Iterable<string>;
  };
  export type Value = DefaultCollections | DefaultCollections.Data;
}
