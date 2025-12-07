/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-object-key.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, ImmutableDate, equals } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet } from "../runtime/index.js";
export class MapObjectKey_ObjectKeys_Key extends Message<MapObjectKey_ObjectKeys_Key.Data> {
  static TYPE_TAG = Symbol("MapObjectKey_ObjectKeys_Key");
  static readonly $typeName = "MapObjectKey_ObjectKeys_Key";
  static EMPTY: MapObjectKey_ObjectKeys_Key;
  #id: string;
  #version: number;
  constructor(props?: MapObjectKey_ObjectKeys_Key.Value) {
    if (!props && MapObjectKey_ObjectKeys_Key.EMPTY) return MapObjectKey_ObjectKeys_Key.EMPTY;
    super(MapObjectKey_ObjectKeys_Key.TYPE_TAG, "MapObjectKey_ObjectKeys_Key");
    this.#id = props ? props.id : "";
    this.#version = props ? props.version : 0;
    if (!props) MapObjectKey_ObjectKeys_Key.EMPTY = this;
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
  setId(value: string) {
    return this.$update(new (this.constructor as typeof MapObjectKey_ObjectKeys_Key)({
      id: value,
      version: this.#version
    }));
  }
  setVersion(value: number) {
    return this.$update(new (this.constructor as typeof MapObjectKey_ObjectKeys_Key)({
      id: this.#id,
      version: value
    }));
  }
}
export namespace MapObjectKey_ObjectKeys_Key {
  export type Data = {
    id: string;
    version: number;
  };
  export type Value = MapObjectKey_ObjectKeys_Key | MapObjectKey_ObjectKeys_Key.Data;
}
export class MapObjectKey_OptionalObjectMap_Key extends Message<MapObjectKey_OptionalObjectMap_Key.Data> {
  static TYPE_TAG = Symbol("MapObjectKey_OptionalObjectMap_Key");
  static readonly $typeName = "MapObjectKey_OptionalObjectMap_Key";
  static EMPTY: MapObjectKey_OptionalObjectMap_Key;
  #name: string;
  constructor(props?: MapObjectKey_OptionalObjectMap_Key.Value) {
    if (!props && MapObjectKey_OptionalObjectMap_Key.EMPTY) return MapObjectKey_OptionalObjectMap_Key.EMPTY;
    super(MapObjectKey_OptionalObjectMap_Key.TYPE_TAG, "MapObjectKey_OptionalObjectMap_Key");
    this.#name = props ? props.name : "";
    if (!props) MapObjectKey_OptionalObjectMap_Key.EMPTY = this;
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
  setName(value: string) {
    return this.$update(new (this.constructor as typeof MapObjectKey_OptionalObjectMap_Key)({
      name: value
    }));
  }
}
export namespace MapObjectKey_OptionalObjectMap_Key {
  export type Data = {
    name: string;
  };
  export type Value = MapObjectKey_OptionalObjectMap_Key | MapObjectKey_OptionalObjectMap_Key.Data;
}
export class MapObjectKey extends Message<MapObjectKey.Data> {
  static TYPE_TAG = Symbol("MapObjectKey");
  static readonly $typeName = "MapObjectKey";
  static EMPTY: MapObjectKey;
  #objectKeys: ImmutableMap<MapObjectKey_ObjectKeys_Key, string>;
  #optionalObjectMap: ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate> | undefined;
  constructor(props?: MapObjectKey.Value) {
    if (!props && MapObjectKey.EMPTY) return MapObjectKey.EMPTY;
    super(MapObjectKey.TYPE_TAG, "MapObjectKey");
    this.#objectKeys = props ? props.objectKeys === undefined || props.objectKeys === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.objectKeys).map(([k, v]) => [k instanceof MapObjectKey_ObjectKeys_Key ? k : new MapObjectKey_ObjectKeys_Key(k), v])) : new ImmutableMap();
    this.#optionalObjectMap = props ? props.optionalObjectMap === undefined || props.optionalObjectMap === null ? props.optionalObjectMap : new ImmutableMap(Array.from(props.optionalObjectMap).map(([k, v]) => [k instanceof MapObjectKey_OptionalObjectMap_Key ? k : new MapObjectKey_OptionalObjectMap_Key(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)])) : undefined;
    if (!props) MapObjectKey.EMPTY = this;
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
    const objectKeysMapValue = objectKeysValue === undefined || objectKeysValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(objectKeysValue as Iterable<[unknown, unknown]>).map(([k, v]) => [k instanceof MapObjectKey_ObjectKeys_Key ? k : new MapObjectKey_ObjectKeys_Key(k), v]));
    if (!((objectKeysMapValue instanceof ImmutableMap || objectKeysMapValue instanceof Map) && [...(objectKeysMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapValue === "string"))) throw new Error("Invalid value for property \"objectKeys\".");
    props.objectKeys = objectKeysMapValue as ImmutableMap<MapObjectKey_ObjectKeys_Key, string>;
    const optionalObjectMapValue = entries["optionalObjectMap"];
    const optionalObjectMapNormalized = optionalObjectMapValue === null ? undefined : optionalObjectMapValue;
    const optionalObjectMapMapValue = optionalObjectMapNormalized === undefined || optionalObjectMapNormalized === null ? optionalObjectMapNormalized : new ImmutableMap(Array.from(optionalObjectMapNormalized as Iterable<[unknown, unknown]>).map(([k, v]) => [k instanceof MapObjectKey_OptionalObjectMap_Key ? k : new MapObjectKey_OptionalObjectMap_Key(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)]));
    if (optionalObjectMapMapValue !== undefined && !((optionalObjectMapMapValue instanceof ImmutableMap || optionalObjectMapMapValue instanceof Map) && [...(optionalObjectMapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => mapValue instanceof Date || mapValue instanceof ImmutableDate))) throw new Error("Invalid value for property \"optionalObjectMap\".");
    props.optionalObjectMap = optionalObjectMapMapValue as ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate>;
    return props as MapObjectKey.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): MapObjectKey {
    switch (key) {
      case "objectKeys":
        return new (this.constructor as typeof MapObjectKey)({
          objectKeys: child as ImmutableMap<MapObjectKey_ObjectKeys_Key, string>,
          optionalObjectMap: this.#optionalObjectMap
        });
      case "optionalObjectMap":
        return new (this.constructor as typeof MapObjectKey)({
          objectKeys: this.#objectKeys,
          optionalObjectMap: child as ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["objectKeys", this.#objectKeys] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["optionalObjectMap", this.#optionalObjectMap] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get objectKeys(): ImmutableMap<MapObjectKey_ObjectKeys_Key, string> {
    return this.#objectKeys;
  }
  get optionalObjectMap(): ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate> | undefined {
    return this.#optionalObjectMap;
  }
  clearObjectKeys() {
    const objectKeysCurrent = this.objectKeys;
    if (objectKeysCurrent === undefined || objectKeysCurrent.size === 0) return this;
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.clear();
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  clearOptionalObjectMap() {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    if (optionalObjectMapCurrent === undefined || optionalObjectMapCurrent.size === 0) return this;
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.clear();
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }));
  }
  deleteObjectKeysEntry(key: MapObjectKey_ObjectKeys_Key) {
    const objectKeysCurrent = this.objectKeys;
    if (!objectKeysCurrent?.has(key)) return this;
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  deleteOptionalObjectMap() {
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys
    }));
  }
  deleteOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key) {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    if (!optionalObjectMapCurrent?.has(key)) return this;
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }));
  }
  filterObjectKeysEntries(predicate: (value: string, key: MapObjectKey_ObjectKeys_Key) => boolean) {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    for (const [entryKey, entryValue] of objectKeysMapNext) {
      if (!predicate(entryValue, entryKey)) objectKeysMapNext.delete(entryKey);
    }
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  filterOptionalObjectMapEntries(predicate: (value: ImmutableDate | Date, key: MapObjectKey_OptionalObjectMap_Key) => boolean) {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    for (const [entryKey, entryValue] of optionalObjectMapMapNext) {
      if (!predicate(entryValue, entryKey)) optionalObjectMapMapNext.delete(entryKey);
    }
    if (this.optionalObjectMap === optionalObjectMapMapNext as unknown || this.optionalObjectMap?.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }));
  }
  mapObjectKeysEntries(mapper: (value: string, key: MapObjectKey_ObjectKeys_Key) => [MapObjectKey_ObjectKeys_Key, string]) {
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
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  mapOptionalObjectMapEntries(mapper: (value: ImmutableDate | Date, key: MapObjectKey_OptionalObjectMap_Key) => [MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date]) {
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
    if (this.optionalObjectMap === optionalObjectMapMapNext as unknown || this.optionalObjectMap?.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }));
  }
  mergeObjectKeysEntries(entries: ImmutableMap<MapObjectKey_ObjectKeys_Key, string> | ReadonlyMap<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>) {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      objectKeysMapNext.set(mergeKey, mergeValue);
    }
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  mergeOptionalObjectMapEntries(entries: ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date> | ReadonlyMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date]>) {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalObjectMapMapNext.set(mergeKey, mergeValue);
    }
    if (this.optionalObjectMap === optionalObjectMapMapNext as unknown || this.optionalObjectMap?.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }));
  }
  setObjectKeys(value: Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>) {
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof MapObjectKey_ObjectKeys_Key ? k : new MapObjectKey_ObjectKeys_Key(k), v])),
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  setObjectKeysEntry(key: MapObjectKey_ObjectKeys_Key, value: string) {
    const objectKeysCurrent = this.objectKeys;
    if (objectKeysCurrent?.has(key)) {
      const existing = objectKeysCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  setOptionalObjectMap(value: Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>) {
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof MapObjectKey_OptionalObjectMap_Key ? k : new MapObjectKey_OptionalObjectMap_Key(k), v instanceof ImmutableDate ? v : new ImmutableDate(v)]))
    }));
  }
  setOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key, value: ImmutableDate | Date) {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    if (optionalObjectMapCurrent?.has(key)) {
      const existing = optionalObjectMapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }));
  }
  updateObjectKeysEntry(key: MapObjectKey_ObjectKeys_Key, updater: (currentValue: string | undefined) => string) {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    const currentValue = objectKeysMapNext.get(key);
    const updatedValue = updater(currentValue);
    objectKeysMapNext.set(key, updatedValue);
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext,
      optionalObjectMap: this.#optionalObjectMap
    }));
  }
  updateOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date) {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    const currentValue = optionalObjectMapMapNext.get(key);
    const updatedValue = updater(currentValue);
    optionalObjectMapMapNext.set(key, updatedValue);
    if (this.optionalObjectMap === optionalObjectMapMapNext as unknown || this.optionalObjectMap?.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys,
      optionalObjectMap: optionalObjectMapMapNext
    }));
  }
}
export namespace MapObjectKey {
  export type Data = {
    objectKeys: Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>;
    optionalObjectMap?: Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]> | undefined;
  };
  export type Value = MapObjectKey | MapObjectKey.Data;
  export import ObjectKeys_Key = MapObjectKey_ObjectKeys_Key;
  export import OptionalObjectMap_Key = MapObjectKey_OptionalObjectMap_Key;
}
