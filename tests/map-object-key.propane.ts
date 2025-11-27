/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-object-key.propane
import { Message, MessagePropDescriptor, ImmutableMap, ImmutableDate, equals } from "@propanejs/runtime";
export class MapObjectKey_ObjectKeys_Key extends Message<MapObjectKey_ObjectKeys_Key.Data> {
  static TYPE_TAG = Symbol("MapObjectKey_ObjectKeys_Key");
  static EMPTY: MapObjectKey_ObjectKeys_Key;
  #id: string;
  #version: number;
  constructor(props?: MapObjectKey_ObjectKeys_Key.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && MapObjectKey_ObjectKeys_Key.EMPTY) return MapObjectKey_ObjectKeys_Key.EMPTY;
    super(MapObjectKey_ObjectKeys_Key.TYPE_TAG, "MapObjectKey_ObjectKeys_Key", listeners);
    this.#id = props ? props.id : "";
    this.#version = props ? props.version : 0;
    if (!props && !listeners) MapObjectKey_ObjectKeys_Key.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapObjectKey_ObjectKeys_Key.Data>[] {
    return [{
      name: "id",
      fieldNumber: null,
      getValue: () => this.#id
    }, {
      name: "version",
      fieldNumber: null,
      getValue: () => this.#version
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapObjectKey_ObjectKeys_Key.Data {
    const props = {} as Partial<MapObjectKey_ObjectKeys_Key.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "string")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const versionValue = entries["version"];
    if (versionValue === undefined) throw new Error("Missing required property \"version\".");
    if (!(typeof versionValue === "number")) throw new Error("Invalid value for property \"version\".");
    props.version = versionValue;
    return props as MapObjectKey_ObjectKeys_Key.Data;
  }
  get id(): string {
    return this.#id;
  }
  get version(): number {
    return this.#version;
  }
  setId(value: string): MapObjectKey_ObjectKeys_Key {
    return this.$update(new MapObjectKey_ObjectKeys_Key({
      id: value,
      version: this.#version
    }, this.$listeners));
  }
  setVersion(value: number): MapObjectKey_ObjectKeys_Key {
    return this.$update(new MapObjectKey_ObjectKeys_Key({
      id: this.#id,
      version: value
    }, this.$listeners));
  }
}
export namespace MapObjectKey_ObjectKeys_Key {
  export interface Data {
    id: string;
    version: number;
  }
  export type Value = MapObjectKey_ObjectKeys_Key | MapObjectKey_ObjectKeys_Key.Data;
}
export class MapObjectKey_OptionalObjectMap_Key extends Message<MapObjectKey_OptionalObjectMap_Key.Data> {
  static TYPE_TAG = Symbol("MapObjectKey_OptionalObjectMap_Key");
  static EMPTY: MapObjectKey_OptionalObjectMap_Key;
  #name: string;
  constructor(props?: MapObjectKey_OptionalObjectMap_Key.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && MapObjectKey_OptionalObjectMap_Key.EMPTY) return MapObjectKey_OptionalObjectMap_Key.EMPTY;
    super(MapObjectKey_OptionalObjectMap_Key.TYPE_TAG, "MapObjectKey_OptionalObjectMap_Key", listeners);
    this.#name = props ? props.name : "";
    if (!props && !listeners) MapObjectKey_OptionalObjectMap_Key.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapObjectKey_OptionalObjectMap_Key.Data>[] {
    return [{
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapObjectKey_OptionalObjectMap_Key.Data {
    const props = {} as Partial<MapObjectKey_OptionalObjectMap_Key.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as MapObjectKey_OptionalObjectMap_Key.Data;
  }
  get name(): string {
    return this.#name;
  }
  setName(value: string): MapObjectKey_OptionalObjectMap_Key {
    return this.$update(new MapObjectKey_OptionalObjectMap_Key({
      name: value
    }, this.$listeners));
  }
}
export namespace MapObjectKey_OptionalObjectMap_Key {
  export interface Data {
    name: string;
  }
  export type Value = MapObjectKey_OptionalObjectMap_Key | MapObjectKey_OptionalObjectMap_Key.Data;
}
export class MapObjectKey extends Message<MapObjectKey.Data> {
  static TYPE_TAG = Symbol("MapObjectKey");
  static EMPTY: MapObjectKey;
  #objectKeys: ImmutableMap<MapObjectKey_ObjectKeys_Key, string>;
  #optionalObjectMap: ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate> | undefined;
  constructor(props?: MapObjectKey.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && MapObjectKey.EMPTY) return MapObjectKey.EMPTY;
    super(MapObjectKey.TYPE_TAG, "MapObjectKey", listeners);
    this.#objectKeys = props ? props.objectKeys === undefined || props.objectKeys === null ? props.objectKeys : new ImmutableMap(Array.from(props.objectKeys).map(([k, v]) => [k instanceof MapObjectKey_ObjectKeys_Key ? k : new MapObjectKey_ObjectKeys_Key(k), v])) : new Map();
    this.#optionalObjectMap = props ? props.optionalObjectMap === undefined || props.optionalObjectMap === null ? props.optionalObjectMap : new ImmutableMap(Array.from(props.optionalObjectMap).map(([k, v]) => [k instanceof MapObjectKey_OptionalObjectMap_Key ? k : new MapObjectKey_OptionalObjectMap_Key(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)])) : undefined;
    if (!props && !listeners) MapObjectKey.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapObjectKey.Data>[] {
    return [{
      name: "objectKeys",
      fieldNumber: null,
      getValue: () => this.#objectKeys
    }, {
      name: "optionalObjectMap",
      fieldNumber: null,
      getValue: () => this.#optionalObjectMap
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapObjectKey.Data {
    const props = {} as Partial<MapObjectKey.Data>;
    const objectKeysValue = entries["objectKeys"];
    if (objectKeysValue === undefined) throw new Error("Missing required property \"objectKeys\".");
    const objectKeysMapValue = objectKeysValue === undefined || objectKeysValue === null ? objectKeysValue : new ImmutableMap(Array.from(objectKeysValue).map(([k, v]) => [k instanceof MapObjectKey_ObjectKeys_Key ? k : new MapObjectKey_ObjectKeys_Key(k), v]));
    if (!((objectKeysMapValue instanceof ImmutableMap || Object.prototype.toString.call(objectKeysMapValue) === "[object ImmutableMap]" || objectKeysMapValue instanceof Map || Object.prototype.toString.call(objectKeysMapValue) === "[object Map]") && [...objectKeysMapValue.entries()].every(([mapKey, mapValue]) => typeof mapValue === "string"))) throw new Error("Invalid value for property \"objectKeys\".");
    props.objectKeys = objectKeysMapValue;
    const optionalObjectMapValue = entries["optionalObjectMap"];
    const optionalObjectMapNormalized = optionalObjectMapValue === null ? undefined : optionalObjectMapValue;
    const optionalObjectMapMapValue = optionalObjectMapNormalized === undefined || optionalObjectMapNormalized === null ? optionalObjectMapNormalized : new ImmutableMap(Array.from(optionalObjectMapNormalized).map(([k, v]) => [k instanceof MapObjectKey_OptionalObjectMap_Key ? k : new MapObjectKey_OptionalObjectMap_Key(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)]));
    if (optionalObjectMapMapValue !== undefined && !((optionalObjectMapMapValue instanceof ImmutableMap || Object.prototype.toString.call(optionalObjectMapMapValue) === "[object ImmutableMap]" || optionalObjectMapMapValue instanceof Map || Object.prototype.toString.call(optionalObjectMapMapValue) === "[object Map]") && [...optionalObjectMapMapValue.entries()].every(([mapKey, mapValue]) => mapValue instanceof Date || mapValue instanceof ImmutableDate || Object.prototype.toString.call(mapValue) === "[object Date]" || Object.prototype.toString.call(mapValue) === "[object ImmutableDate]"))) throw new Error("Invalid value for property \"optionalObjectMap\".");
    props.optionalObjectMap = optionalObjectMapMapValue;
    return props as MapObjectKey.Data;
  }
  get objectKeys(): ImmutableMap<MapObjectKey_ObjectKeys_Key, string> {
    return this.#objectKeys;
  }
  get optionalObjectMap(): ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate> | undefined {
    return this.#optionalObjectMap;
  }
  clearObjectKeys(): MapObjectKey {
    const objectKeysCurrent = this.objectKeys;
    if (objectKeysCurrent === undefined || objectKeysCurrent.size === 0) return this;
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.clear();
    return this.$update(new MapObjectKey({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  clearOptionalObjectMap(): MapObjectKey {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    if (optionalObjectMapCurrent === undefined || optionalObjectMapCurrent.size === 0) return this;
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.clear();
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }, this.$listeners));
  }
  deleteObjectKeysEntry(key: MapObjectKey_ObjectKeys_Key): MapObjectKey {
    const objectKeysCurrent = this.objectKeys;
    if (objectKeysCurrent === undefined || !objectKeysCurrent.has(key)) return this;
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.delete(key);
    return this.$update(new MapObjectKey({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  deleteOptionalObjectMap(): MapObjectKey {
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys
    }, this.$listeners));
  }
  deleteOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key): MapObjectKey {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    if (optionalObjectMapCurrent === undefined || !optionalObjectMapCurrent.has(key)) return this;
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.delete(key);
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }, this.$listeners));
  }
  filterObjectKeysEntries(predicate: (value: string, key: MapObjectKey_ObjectKeys_Key) => boolean): MapObjectKey {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    for (const [entryKey, entryValue] of objectKeysMapNext) {
      if (!predicate(entryValue, entryKey)) objectKeysMapNext.delete(entryKey);
    }
    if (this.objectKeys === objectKeysMapNext || this.objectKeys !== undefined && this.objectKeys.equals(objectKeysMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  filterOptionalObjectMapEntries(predicate: (value: ImmutableDate | Date, key: MapObjectKey_OptionalObjectMap_Key) => boolean): MapObjectKey {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    for (const [entryKey, entryValue] of optionalObjectMapMapNext) {
      if (!predicate(entryValue, entryKey)) optionalObjectMapMapNext.delete(entryKey);
    }
    if (this.optionalObjectMap === optionalObjectMapMapNext || this.optionalObjectMap !== undefined && this.optionalObjectMap.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }, this.$listeners));
  }
  mapObjectKeysEntries(mapper: (value: string, key: MapObjectKey_ObjectKeys_Key) => [MapObjectKey_ObjectKeys_Key, string]): MapObjectKey {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    const objectKeysMappedEntries = [];
    for (const [entryKey, entryValue] of objectKeysMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      objectKeysMappedEntries.push(mappedEntry);
    }
    objectKeysMapNext.clear();
    for (const [newKey, newValue] of objectKeysMappedEntries) {
      objectKeysMapNext.set(newKey, newValue);
    }
    if (this.objectKeys === objectKeysMapNext || this.objectKeys !== undefined && this.objectKeys.equals(objectKeysMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  mapOptionalObjectMapEntries(mapper: (value: ImmutableDate | Date, key: MapObjectKey_OptionalObjectMap_Key) => [MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date]): MapObjectKey {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    const optionalObjectMapMappedEntries = [];
    for (const [entryKey, entryValue] of optionalObjectMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalObjectMapMappedEntries.push(mappedEntry);
    }
    optionalObjectMapMapNext.clear();
    for (const [newKey, newValue] of optionalObjectMapMappedEntries) {
      optionalObjectMapMapNext.set(newKey, newValue);
    }
    if (this.optionalObjectMap === optionalObjectMapMapNext || this.optionalObjectMap !== undefined && this.optionalObjectMap.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }, this.$listeners));
  }
  mergeObjectKeysEntries(entries: Iterable<[MapObjectKey_ObjectKeys_Key, string]> | ImmutableMap<MapObjectKey_ObjectKeys_Key, string> | ReadonlyMap<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>): MapObjectKey {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      objectKeysMapNext.set(mergeKey, mergeValue);
    }
    if (this.objectKeys === objectKeysMapNext || this.objectKeys !== undefined && this.objectKeys.equals(objectKeysMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  mergeOptionalObjectMapEntries(entries: Iterable<[MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date]> | ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date> | ReadonlyMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date]>): MapObjectKey {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalObjectMapMapNext.set(mergeKey, mergeValue);
    }
    if (this.optionalObjectMap === optionalObjectMapMapNext || this.optionalObjectMap !== undefined && this.optionalObjectMap.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }, this.$listeners));
  }
  setObjectKeys(value: Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>): MapObjectKey {
    return this.$update(new MapObjectKey({
      objectKeys: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof MapObjectKey_ObjectKeys_Key ? k : new MapObjectKey_ObjectKeys_Key(k), v])),
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  setObjectKeysEntry(key: MapObjectKey_ObjectKeys_Key, value: string): MapObjectKey {
    const objectKeysCurrent = this.objectKeys;
    if (objectKeysCurrent && objectKeysCurrent.has(key)) {
      const existing = objectKeysCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.set(key, value);
    return this.$update(new MapObjectKey({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  setOptionalObjectMap(value: Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>): MapObjectKey {
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof MapObjectKey_OptionalObjectMap_Key ? k : new MapObjectKey_OptionalObjectMap_Key(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)]))
    }, this.$listeners));
  }
  setOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key, value: ImmutableDate | Date): MapObjectKey {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    if (optionalObjectMapCurrent && optionalObjectMapCurrent.has(key)) {
      const existing = optionalObjectMapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.set(key, value);
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }, this.$listeners));
  }
  updateObjectKeysEntry(key: MapObjectKey_ObjectKeys_Key, updater: (currentValue: string | undefined) => string): MapObjectKey {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    const currentValue = objectKeysMapNext.get(key);
    const updatedValue = updater(currentValue);
    objectKeysMapNext.set(key, updatedValue);
    if (this.objectKeys === objectKeysMapNext || this.objectKeys !== undefined && this.objectKeys.equals(objectKeysMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }, this.$listeners));
  }
  updateOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date): MapObjectKey {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    const currentValue = optionalObjectMapMapNext.get(key);
    const updatedValue = updater(currentValue);
    optionalObjectMapMapNext.set(key, updatedValue);
    if (this.optionalObjectMap === optionalObjectMapMapNext || this.optionalObjectMap !== undefined && this.optionalObjectMap.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new MapObjectKey({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }, this.$listeners));
  }
}
export namespace MapObjectKey {
  export interface Data {
    objectKeys: Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>;
    optionalObjectMap?: Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]> | undefined;
  }
  export type Value = MapObjectKey | MapObjectKey.Data;
  export import ObjectKeys_Key = MapObjectKey_ObjectKeys_Key;
  export import OptionalObjectMap_Key = MapObjectKey_OptionalObjectMap_Key;
}