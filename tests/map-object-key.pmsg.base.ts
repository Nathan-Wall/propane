/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-object-key.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, isTaggedMessageData, parseCerealString, ensure, SKIP, ImmutableDate } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_MapObjectKey_ObjectKeys_Key = Symbol("MapObjectKey_ObjectKeys_Key");
export class MapObjectKey_ObjectKeys_Key extends Message<MapObjectKey_ObjectKeys_Key.Data> {
  static $typeId = "tests/map-object-key.pmsg#MapObjectKey_ObjectKeys_Key";
  static $typeHash = "sha256:5918071e1eb69b3ceff16d5eeb09d10edb30ef34f5817244527521fcca044036";
  static $instanceTag = Symbol.for("propane:message:" + MapObjectKey_ObjectKeys_Key.$typeId);
  static readonly $typeName = "MapObjectKey_ObjectKeys_Key";
  static EMPTY: MapObjectKey_ObjectKeys_Key;
  #id!: string;
  #version!: number;
  constructor(props?: MapObjectKey_ObjectKeys_Key.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && MapObjectKey_ObjectKeys_Key.EMPTY) return MapObjectKey_ObjectKeys_Key.EMPTY;
    super(TYPE_TAG_MapObjectKey_ObjectKeys_Key, "MapObjectKey_ObjectKeys_Key");
    this.#id = (props ? props.id : "") as string;
    this.#version = (props ? props.version : 0) as number;
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
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): MapObjectKey_ObjectKeys_Key.Data {
    const props = {} as Partial<MapObjectKey_ObjectKeys_Key.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "string")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as string;
    const versionValue = entries["version"];
    if (versionValue === undefined) throw new Error("Missing required property \"version\".");
    if (!(typeof versionValue === "number")) throw new Error("Invalid value for property \"version\".");
    props.version = versionValue as number;
    return props as MapObjectKey_ObjectKeys_Key.Data;
  }
  static from(value: MapObjectKey_ObjectKeys_Key.Value): MapObjectKey_ObjectKeys_Key {
    return MapObjectKey_ObjectKeys_Key.isInstance(value) ? value : new MapObjectKey_ObjectKeys_Key(value);
  }
  static deserialize<T extends typeof MapObjectKey_ObjectKeys_Key>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for MapObjectKey_ObjectKeys_Key.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected MapObjectKey_ObjectKeys_Key.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): string {
    return this.#id;
  }
  get version(): number {
    return this.#version;
  }
  set(updates: Partial<SetUpdates<MapObjectKey_ObjectKeys_Key.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapObjectKey_ObjectKeys_Key)(data) as this);
  }
  setId(value: string) {
    return this.$update(new (this.constructor as typeof MapObjectKey_ObjectKeys_Key)({
      id: value,
      version: this.#version
    }) as this);
  }
  setVersion(value: number) {
    return this.$update(new (this.constructor as typeof MapObjectKey_ObjectKeys_Key)({
      id: this.#id,
      version: value
    }) as this);
  }
}
export namespace MapObjectKey_ObjectKeys_Key {
  export type Data = {
    id: string;
    version: number;
  };
  export type Value = MapObjectKey_ObjectKeys_Key | MapObjectKey_ObjectKeys_Key.Data;
}
const TYPE_TAG_MapObjectKey_OptionalObjectMap_Key = Symbol("MapObjectKey_OptionalObjectMap_Key");
export class MapObjectKey_OptionalObjectMap_Key extends Message<MapObjectKey_OptionalObjectMap_Key.Data> {
  static $typeId = "tests/map-object-key.pmsg#MapObjectKey_OptionalObjectMap_Key";
  static $typeHash = "sha256:4abd212c96c686960d2b04021f66a0f41858333dd386ebda1a4ece0f44c947c6";
  static $instanceTag = Symbol.for("propane:message:" + MapObjectKey_OptionalObjectMap_Key.$typeId);
  static readonly $typeName = "MapObjectKey_OptionalObjectMap_Key";
  static EMPTY: MapObjectKey_OptionalObjectMap_Key;
  #name!: string;
  constructor(props?: MapObjectKey_OptionalObjectMap_Key.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && MapObjectKey_OptionalObjectMap_Key.EMPTY) return MapObjectKey_OptionalObjectMap_Key.EMPTY;
    super(TYPE_TAG_MapObjectKey_OptionalObjectMap_Key, "MapObjectKey_OptionalObjectMap_Key");
    this.#name = (props ? props.name : "") as string;
    if (!props) MapObjectKey_OptionalObjectMap_Key.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapObjectKey_OptionalObjectMap_Key.Data>[] {
    return [{
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): MapObjectKey_OptionalObjectMap_Key.Data {
    const props = {} as Partial<MapObjectKey_OptionalObjectMap_Key.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as MapObjectKey_OptionalObjectMap_Key.Data;
  }
  static from(value: MapObjectKey_OptionalObjectMap_Key.Value): MapObjectKey_OptionalObjectMap_Key {
    return MapObjectKey_OptionalObjectMap_Key.isInstance(value) ? value : new MapObjectKey_OptionalObjectMap_Key(value);
  }
  static deserialize<T extends typeof MapObjectKey_OptionalObjectMap_Key>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for MapObjectKey_OptionalObjectMap_Key.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected MapObjectKey_OptionalObjectMap_Key.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get name(): string {
    return this.#name;
  }
  set(updates: Partial<SetUpdates<MapObjectKey_OptionalObjectMap_Key.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapObjectKey_OptionalObjectMap_Key)(data) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof MapObjectKey_OptionalObjectMap_Key)({
      name: value
    }) as this);
  }
}
export namespace MapObjectKey_OptionalObjectMap_Key {
  export type Data = {
    name: string;
  };
  export type Value = MapObjectKey_OptionalObjectMap_Key | MapObjectKey_OptionalObjectMap_Key.Data;
}
const TYPE_TAG_MapObjectKey = Symbol("MapObjectKey");
export class MapObjectKey extends Message<MapObjectKey.Data> {
  static $typeId = "tests/map-object-key.pmsg#MapObjectKey";
  static $typeHash = "sha256:c63378735de690033f38b50aaa1ccb9d3faf3563a1441520c53dbc1d018e9610";
  static $instanceTag = Symbol.for("propane:message:" + MapObjectKey.$typeId);
  static readonly $typeName = "MapObjectKey";
  static EMPTY: MapObjectKey;
  #objectKeys!: ImmutableMap<MapObjectKey_ObjectKeys_Key, string>;
  #optionalObjectMap!: ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate> | undefined;
  constructor(props?: MapObjectKey.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && MapObjectKey.EMPTY) return MapObjectKey.EMPTY;
    super(TYPE_TAG_MapObjectKey, "MapObjectKey");
    this.#objectKeys = props ? (props.objectKeys === undefined || props.objectKeys === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.objectKeys as Iterable<[unknown, unknown]>).map(([k, v]) => [MapObjectKey_ObjectKeys_Key.from(k as MapObjectKey_ObjectKeys_Key.Value), v]))) as ImmutableMap<MapObjectKey_ObjectKeys_Key, string> : new ImmutableMap();
    this.#optionalObjectMap = props ? (props.optionalObjectMap === undefined || props.optionalObjectMap === null ? props.optionalObjectMap : new ImmutableMap(Array.from(props.optionalObjectMap as Iterable<[unknown, unknown]>).map(([k, v]) => [MapObjectKey_OptionalObjectMap_Key.from(k as MapObjectKey_OptionalObjectMap_Key.Value), ImmutableDate.from(v as ImmutableDate.Value)]))) as ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate> : undefined;
    if (!props) MapObjectKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapObjectKey.Data>[] {
    return [{
      name: "objectKeys",
      fieldNumber: null,
      getValue: () => this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>
    }, {
      name: "optionalObjectMap",
      fieldNumber: null,
      getValue: () => this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): MapObjectKey.Data {
    const props = {} as Partial<MapObjectKey.Data>;
    const objectKeysValue = entries["objectKeys"];
    if (objectKeysValue === undefined) throw new Error("Missing required property \"objectKeys\".");
    const objectKeysMapValue = objectKeysValue === undefined || objectKeysValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(objectKeysValue as Iterable<[unknown, unknown]>).map(([k, v]) => [typeof k === "string" && MapObjectKey_ObjectKeys_Key.$compact === true ? k : MapObjectKey_ObjectKeys_Key.from(k as MapObjectKey_ObjectKeys_Key.Value), v]));
    const objectKeysMapValueConverted = objectKeysMapValue === undefined || objectKeysMapValue === null ? objectKeysMapValue : new ImmutableMap([...(objectKeysMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [typeof k === "string" && MapObjectKey_ObjectKeys_Key.$compact === true ? MapObjectKey_ObjectKeys_Key.fromCompact(MapObjectKey_ObjectKeys_Key.$compactTag && k.startsWith(MapObjectKey_ObjectKeys_Key.$compactTag) ? k.slice(MapObjectKey_ObjectKeys_Key.$compactTag.length) : k, options) as any : k, v]));
    if (!((objectKeysMapValueConverted as object instanceof ImmutableMap || objectKeysMapValueConverted as object instanceof Map) && [...(objectKeysMapValueConverted as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapValue === "string"))) throw new Error("Invalid value for property \"objectKeys\".");
    props.objectKeys = objectKeysMapValueConverted as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>;
    const optionalObjectMapValue = entries["optionalObjectMap"];
    const optionalObjectMapNormalized = optionalObjectMapValue === null ? undefined : optionalObjectMapValue;
    const optionalObjectMapMapValue = optionalObjectMapNormalized === undefined || optionalObjectMapNormalized === null ? optionalObjectMapNormalized : new ImmutableMap(Array.from(optionalObjectMapNormalized as Iterable<[unknown, unknown]>).map(([k, v]) => [typeof k === "string" && MapObjectKey_OptionalObjectMap_Key.$compact === true ? k : MapObjectKey_OptionalObjectMap_Key.from(k as MapObjectKey_OptionalObjectMap_Key.Value), typeof v === "string" && ImmutableDate.$compact === true ? v : ImmutableDate.from(v as ImmutableDate.Value)]));
    const optionalObjectMapMapValueConverted = optionalObjectMapMapValue === undefined || optionalObjectMapMapValue === null ? optionalObjectMapMapValue : new ImmutableMap([...(optionalObjectMapMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [typeof k === "string" && MapObjectKey_OptionalObjectMap_Key.$compact === true ? MapObjectKey_OptionalObjectMap_Key.fromCompact(MapObjectKey_OptionalObjectMap_Key.$compactTag && k.startsWith(MapObjectKey_OptionalObjectMap_Key.$compactTag) ? k.slice(MapObjectKey_OptionalObjectMap_Key.$compactTag.length) : k, options) as any : k, typeof v === "string" && ImmutableDate.$compact === true ? ImmutableDate.fromCompact(ImmutableDate.$compactTag && v.startsWith(ImmutableDate.$compactTag) ? v.slice(ImmutableDate.$compactTag.length) : v, options) as any : v]));
    if (optionalObjectMapMapValueConverted !== undefined && !(optionalObjectMapMapValueConverted as object instanceof ImmutableMap || optionalObjectMapMapValueConverted as object instanceof Map)) throw new Error("Invalid value for property \"optionalObjectMap\".");
    props.optionalObjectMap = optionalObjectMapMapValueConverted as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>;
    return props as MapObjectKey.Data;
  }
  static from(value: MapObjectKey.Value): MapObjectKey {
    return MapObjectKey.isInstance(value) ? value : new MapObjectKey(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "objectKeys":
        return new (this.constructor as typeof MapObjectKey)({
          objectKeys: child as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
          optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
        }) as this;
      case "optionalObjectMap":
        return new (this.constructor as typeof MapObjectKey)({
          objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
          optionalObjectMap: child as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["objectKeys", this.#objectKeys] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["optionalObjectMap", this.#optionalObjectMap] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof MapObjectKey>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for MapObjectKey.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected MapObjectKey.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
      objectKeys: objectKeysMapNext as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  clearOptionalObjectMap() {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    if (optionalObjectMapCurrent === undefined || optionalObjectMapCurrent.size === 0) return this;
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.clear();
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: optionalObjectMapMapNext as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  deleteObjectKey(key: MapObjectKey_ObjectKeys_Key) {
    const objectKeysCurrent = this.objectKeys;
    const k = MapObjectKey_ObjectKeys_Key.from(key);
    if (!objectKeysCurrent?.has(k)) return this;
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  deleteOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key) {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    const k = MapObjectKey_OptionalObjectMap_Key.from(key);
    if (!optionalObjectMapCurrent?.has(k)) return this;
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: optionalObjectMapMapNext as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  filterObjectKeys(predicate: (value: string, key: MapObjectKey_ObjectKeys_Key) => boolean) {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    for (const [entryKey, entryValue] of objectKeysMapNext) {
      if (!predicate(entryValue, entryKey)) objectKeysMapNext.delete(entryKey);
    }
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
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
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: optionalObjectMapMapNext as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  mapObjectKeys(mapper: (value: string, key: MapObjectKey_ObjectKeys_Key) => [MapObjectKey_ObjectKeys_Key, string]) {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    const objectKeysMappedEntries: [MapObjectKey_ObjectKeys_Key, string][] = [];
    for (const [entryKey, entryValue] of objectKeysMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      objectKeysMappedEntries.push(mappedEntry);
    }
    objectKeysMapNext.clear();
    for (const [newKey, newValue] of objectKeysMappedEntries) {
      objectKeysMapNext.set(MapObjectKey_ObjectKeys_Key.from(newKey), newValue);
    }
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  mapOptionalObjectMapEntries(mapper: (value: ImmutableDate | Date, key: MapObjectKey_OptionalObjectMap_Key) => [MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date]) {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    const optionalObjectMapMappedEntries: [MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date][] = [];
    for (const [entryKey, entryValue] of optionalObjectMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalObjectMapMappedEntries.push(mappedEntry);
    }
    optionalObjectMapMapNext.clear();
    for (const [newKey, newValue] of optionalObjectMapMappedEntries) {
      optionalObjectMapMapNext.set(MapObjectKey_OptionalObjectMap_Key.from(newKey), ImmutableDate.from(newValue));
    }
    if (this.optionalObjectMap === optionalObjectMapMapNext as unknown || this.optionalObjectMap?.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: optionalObjectMapMapNext as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  mergeObjectKeys(entries: ImmutableMap<MapObjectKey_ObjectKeys_Key, string> | ReadonlyMap<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>) {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      objectKeysMapNext.set(MapObjectKey_ObjectKeys_Key.from(mergeKey), mergeValue);
    }
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  mergeOptionalObjectMapEntries(entries: ImmutableMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date> | ReadonlyMap<MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, ImmutableDate | Date]>) {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalObjectMapMapNext.set(MapObjectKey_OptionalObjectMap_Key.from(mergeKey), ImmutableDate.from(mergeValue));
    }
    if (this.optionalObjectMap === optionalObjectMapMapNext as unknown || this.optionalObjectMap?.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: optionalObjectMapMapNext as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  set(updates: Partial<SetUpdates<MapObjectKey.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapObjectKey)(data) as this);
  }
  setObjectKey(key: MapObjectKey_ObjectKeys_Key, value: string) {
    const objectKeysCurrent = this.objectKeys;
    const k = MapObjectKey_ObjectKeys_Key.from(key);
    if (objectKeysCurrent?.has(k)) {
      const existing = objectKeysCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    objectKeysMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  setObjectKeys(value: Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>) {
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: (value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [MapObjectKey_ObjectKeys_Key.from(k), v]))) as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  setOptionalObjectMap(value: Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]> | undefined) {
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: (value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [MapObjectKey_OptionalObjectMap_Key.from(k), ImmutableDate.from(v)]))) as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  setOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key, value: ImmutableDate | Date) {
    const optionalObjectMapCurrent = this.optionalObjectMap;
    const k = MapObjectKey_OptionalObjectMap_Key.from(key);
    if (optionalObjectMapCurrent?.has(k)) {
      const existing = optionalObjectMapCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    optionalObjectMapMapNext.set(k, ImmutableDate.from(value));
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: optionalObjectMapMapNext as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  unsetOptionalObjectMap() {
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>
    }) as this);
  }
  updateObjectKey(key: MapObjectKey_ObjectKeys_Key, updater: (currentValue: string | undefined) => string) {
    const objectKeysMapSource = this.#objectKeys;
    const objectKeysMapEntries = [...objectKeysMapSource.entries()];
    const objectKeysMapNext = new Map(objectKeysMapEntries);
    const k = MapObjectKey_ObjectKeys_Key.from(key);
    const currentValue = objectKeysMapNext.get(k);
    const updatedValue = updater(currentValue);
    objectKeysMapNext.set(k, updatedValue);
    if (this.objectKeys === objectKeysMapNext as unknown || this.objectKeys?.equals(objectKeysMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: objectKeysMapNext as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: this.#optionalObjectMap as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
  }
  updateOptionalObjectMapEntry(key: MapObjectKey_OptionalObjectMap_Key, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date) {
    const optionalObjectMapMapSource = this.#optionalObjectMap;
    const optionalObjectMapMapEntries = optionalObjectMapMapSource === undefined ? [] : [...optionalObjectMapMapSource.entries()];
    const optionalObjectMapMapNext = new Map(optionalObjectMapMapEntries);
    const k = MapObjectKey_OptionalObjectMap_Key.from(key);
    const currentValue = optionalObjectMapMapNext.get(k);
    const updatedValue = updater(currentValue);
    optionalObjectMapMapNext.set(k, ImmutableDate.from(updatedValue));
    if (this.optionalObjectMap === optionalObjectMapMapNext as unknown || this.optionalObjectMap?.equals(optionalObjectMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapObjectKey)({
      objectKeys: this.#objectKeys as Map<MapObjectKey_ObjectKeys_Key, string> | Iterable<[MapObjectKey_ObjectKeys_Key, string]>,
      optionalObjectMap: optionalObjectMapMapNext as Map<MapObjectKey_OptionalObjectMap_Key, Date> | Iterable<[MapObjectKey_OptionalObjectMap_Key, Date]>
    }) as this);
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
