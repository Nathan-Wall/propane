/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/default-collections.pmsg
import { ImmutableArray } from '../runtime/common/array/immutable';
import { ImmutableMap } from '../runtime/common/map/immutable';
import { ImmutableSet } from '../runtime/common/set/immutable';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, equals, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// Test message with non-optional collection fields to verify defaults
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_DefaultCollections = Symbol("DefaultCollections");
export class DefaultCollections extends Message<DefaultCollections.Data> {
  static $typeId = "tests/default-collections.pmsg#DefaultCollections";
  static $typeHash = "sha256:8f0af43f4209e65b1ff01901266932a0ca7bbd2f969f9a78cb2a8829733d65e7";
  static $instanceTag = Symbol.for("propane:message:" + DefaultCollections.$typeId);
  static readonly $typeName = "DefaultCollections";
  static EMPTY: DefaultCollections;
  #arr!: ImmutableArray<number>;
  #map!: ImmutableMap<string, number>;
  #tags!: ImmutableSet<string>;
  constructor(props?: DefaultCollections.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && DefaultCollections.EMPTY) return DefaultCollections.EMPTY;
    super(TYPE_TAG_DefaultCollections, "DefaultCollections");
    this.#arr = props ? (props.arr === undefined || props.arr === null ? new ImmutableArray() : props.arr as object instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr as Iterable<unknown>)) as ImmutableArray<number> : new ImmutableArray();
    this.#map = props ? (props.map === undefined || props.map === null ? new ImmutableMap() : props.map as object instanceof ImmutableMap ? props.map : new ImmutableMap(props.map as Iterable<[unknown, unknown]>)) as ImmutableMap<string, number> : new ImmutableMap();
    this.#tags = props ? (props.tags === undefined || props.tags === null ? new ImmutableSet() : props.tags as object instanceof ImmutableSet ? props.tags : new ImmutableSet(props.tags as Iterable<unknown>)) as ImmutableSet<string> : new ImmutableSet();
    if (!props) DefaultCollections.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<DefaultCollections.Data>[] {
    return [{
      name: "arr",
      fieldNumber: null,
      getValue: () => this.#arr as number[] | Iterable<number>
    }, {
      name: "map",
      fieldNumber: null,
      getValue: () => this.#map as Map<string, number> | Iterable<[string, number]>
    }, {
      name: "tags",
      fieldNumber: null,
      getValue: () => this.#tags as Set<string> | Iterable<string>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): DefaultCollections.Data {
    const props = {} as Partial<DefaultCollections.Data>;
    const arrValue = entries["arr"];
    if (arrValue === undefined) throw new Error("Missing required property \"arr\".");
    const arrArrayValue = arrValue === undefined || arrValue === null ? new ImmutableArray() : arrValue as object instanceof ImmutableArray ? arrValue : new ImmutableArray(arrValue as Iterable<unknown>);
    if (!((arrArrayValue as object instanceof ImmutableArray || Array.isArray(arrArrayValue)) && [...(arrArrayValue as Iterable<unknown>)].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"arr\".");
    props.arr = arrArrayValue as number[] | Iterable<number>;
    const mapValue = entries["map"];
    if (mapValue === undefined) throw new Error("Missing required property \"map\".");
    const mapMapValue = mapValue === undefined || mapValue === null ? new ImmutableMap() : mapValue as object instanceof ImmutableMap ? mapValue : new ImmutableMap(mapValue as Iterable<[unknown, unknown]>);
    if (!((mapMapValue as object instanceof ImmutableMap || mapMapValue as object instanceof Map) && [...(mapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue as Map<string, number> | Iterable<[string, number]>;
    const tagsValue = entries["tags"];
    if (tagsValue === undefined) throw new Error("Missing required property \"tags\".");
    const tagsSetValue = tagsValue === undefined || tagsValue === null ? new ImmutableSet() : tagsValue as object instanceof ImmutableSet ? tagsValue : new ImmutableSet(tagsValue as Iterable<unknown>);
    if (!((tagsSetValue as object instanceof ImmutableSet || tagsSetValue as object instanceof Set) && [...(tagsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"tags\".");
    props.tags = tagsSetValue as Set<string> | Iterable<string>;
    return props as DefaultCollections.Data;
  }
  static from(value: DefaultCollections.Value): DefaultCollections {
    return DefaultCollections.isInstance(value) ? value : new DefaultCollections(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "arr":
        return new (this.constructor as typeof DefaultCollections)({
          arr: child as number[] | Iterable<number>,
          map: this.#map as Map<string, number> | Iterable<[string, number]>,
          tags: this.#tags as Set<string> | Iterable<string>
        }) as this;
      case "map":
        return new (this.constructor as typeof DefaultCollections)({
          arr: this.#arr as number[] | Iterable<number>,
          map: child as Map<string, number> | Iterable<[string, number]>,
          tags: this.#tags as Set<string> | Iterable<string>
        }) as this;
      case "tags":
        return new (this.constructor as typeof DefaultCollections)({
          arr: this.#arr as number[] | Iterable<number>,
          map: this.#map as Map<string, number> | Iterable<[string, number]>,
          tags: child as Set<string> | Iterable<string>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["arr", this.#arr] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["map", this.#map] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["tags", this.#tags] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof DefaultCollections>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for DefaultCollections.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected DefaultCollections.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
  addTag(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.add(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
  }
  addTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const toAdd of values) {
      tagsSetNext.add(toAdd);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
  }
  clearMap() {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  clearTags() {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.clear();
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
  }
  copyWithinArr(target: number, start: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  deleteMapEntry(key: string) {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  deleteTag(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.delete(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
  }
  deleteTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const del of values) {
      tagsSetNext.delete(del);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
  }
  fillArr(value: number, start?: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    (arrNext as unknown as number[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
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
      arr: this.#arr as number[] | Iterable<number>,
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  filterTags(predicate: (value: string) => boolean) {
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
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
  }
  mapMapEntries(mapper: (value: number, key: string) => [string, number]) {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const mapMappedEntries: [string, number][] = [];
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
      arr: this.#arr as number[] | Iterable<number>,
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  mapTags(mapper: (value: string) => string) {
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
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
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
      arr: this.#arr as number[] | Iterable<number>,
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  popArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  pushArr(...values: number[]) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  reverseArr() {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  set(updates: Partial<SetUpdates<DefaultCollections.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof DefaultCollections)(data) as this);
  }
  setArr(value: number[] | Iterable<number>) {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: value as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  setMap(value: Map<string, number> | Iterable<[string, number]>) {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: (value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value)) as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
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
      arr: this.#arr as number[] | Iterable<number>,
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  setTags(value: Set<string> | Iterable<string>) {
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: (value === undefined || value === null ? new ImmutableSet() : value instanceof ImmutableSet ? value : new ImmutableSet(value)) as Set<string> | Iterable<string>
    }) as this);
  }
  shiftArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  sortArr(compareFn?: (a: number, b: number) => number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    (arrNext as unknown as number[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  spliceArr(start: number, deleteCount?: number, ...items: number[]) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  unshiftArr(...values: number[]) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return this.$update(new (this.constructor as typeof DefaultCollections)({
      arr: arrNext as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
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
      arr: this.#arr as number[] | Iterable<number>,
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  updateTags(updater: (current: Set<string>) => Iterable<string>) {
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
      arr: this.#arr as number[] | Iterable<number>,
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      tags: tagsSetNext as Set<string> | Iterable<string>
    }) as this);
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
