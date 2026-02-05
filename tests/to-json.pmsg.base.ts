/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/to-json.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, isTaggedMessageData, parseCerealString, ensure, SKIP, ImmutableDate, ImmutableArray } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_ToJson_Nested = Symbol("ToJson_Nested");
export class ToJson_Nested extends Message<ToJson_Nested.Data> {
  static $typeId = "tests/to-json.pmsg#ToJson_Nested";
  static $typeHash = "sha256:8139468312d884ff21ed34be146ed93213f3049a6f766fad3ca2080b60c182a4";
  static $instanceTag = Symbol.for("propane:message:" + ToJson_Nested.$typeId);
  static readonly $typeName = "ToJson_Nested";
  static EMPTY: ToJson_Nested;
  #array!: ImmutableArray<(number | undefined)>;
  #map!: ImmutableMap<string, bigint>;
  #imap!: ImmutableMap<string, ImmutableDate>;
  constructor(props?: ToJson_Nested.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ToJson_Nested.EMPTY) return ToJson_Nested.EMPTY;
    super(TYPE_TAG_ToJson_Nested, "ToJson_Nested");
    this.#array = props ? (props.array === undefined || props.array === null ? new ImmutableArray() : ImmutableArray.isInstance(props.array) ? props.array : new ImmutableArray(props.array as Iterable<unknown>)) as ImmutableArray<(number | undefined)> : new ImmutableArray();
    this.#map = props ? (props.map === undefined || props.map === null ? new ImmutableMap() : ImmutableMap.isInstance(props.map) ? props.map : new ImmutableMap(props.map as Iterable<[unknown, unknown]>)) as ImmutableMap<string, bigint> : new ImmutableMap();
    this.#imap = props ? (props.imap === undefined || props.imap === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.imap as Iterable<[unknown, unknown]>).map(([k, v]) => [k, ImmutableDate.from(v as ImmutableDate.Value)]))) as ImmutableMap<string, ImmutableDate> : new ImmutableMap();
    if (!props) ToJson_Nested.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ToJson_Nested.Data>[] {
    return [{
      name: "array",
      fieldNumber: null,
      getValue: () => this.#array as (number | undefined)[] | Iterable<(number | undefined)>
    }, {
      name: "map",
      fieldNumber: null,
      getValue: () => this.#map as Map<string, bigint> | Iterable<[string, bigint]>
    }, {
      name: "imap",
      fieldNumber: null,
      getValue: () => this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ToJson_Nested.Data {
    const props = {} as Partial<ToJson_Nested.Data>;
    const arrayValue = entries["array"];
    if (arrayValue === undefined) throw new Error("Missing required property \"array\".");
    const arrayArrayValue = arrayValue === undefined || arrayValue === null ? new ImmutableArray() : ImmutableArray.isInstance(arrayValue) ? arrayValue : new ImmutableArray(arrayValue as Iterable<unknown>);
    if (!((ImmutableArray.isInstance(arrayArrayValue) || Array.isArray(arrayArrayValue)) && [...(arrayArrayValue as Iterable<unknown>)].every(element => typeof element === "number" || element === undefined))) throw new Error("Invalid value for property \"array\".");
    props.array = arrayArrayValue as (number | undefined)[] | Iterable<(number | undefined)>;
    const mapValue = entries["map"];
    if (mapValue === undefined) throw new Error("Missing required property \"map\".");
    const mapMapValue = mapValue === undefined || mapValue === null ? new ImmutableMap() : ImmutableMap.isInstance(mapValue) ? mapValue : new ImmutableMap(mapValue as Iterable<[unknown, unknown]>);
    if (!((ImmutableMap.isInstance(mapMapValue) || mapMapValue as object instanceof Map) && [...(mapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "bigint"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue as Map<string, bigint> | Iterable<[string, bigint]>;
    const imapValue = entries["imap"];
    if (imapValue === undefined) throw new Error("Missing required property \"imap\".");
    const imapMapValue = imapValue === undefined || imapValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(imapValue as Iterable<[unknown, unknown]>).map(([k, v]) => [k, typeof v === "string" && ImmutableDate.$compact === true ? v : ImmutableDate.from(v as ImmutableDate.Value)]));
    const imapMapValueConverted = imapMapValue === undefined || imapMapValue === null ? imapMapValue : new ImmutableMap([...(imapMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [k, typeof v === "string" && ImmutableDate.$compact === true ? ImmutableDate.fromCompact(ImmutableDate.$compactTag && v.startsWith(ImmutableDate.$compactTag) ? v.slice(ImmutableDate.$compactTag.length) : v, options) as any : v]));
    if (!((ImmutableMap.isInstance(imapMapValueConverted) || imapMapValueConverted as object instanceof Map) && [...(imapMapValueConverted as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string"))) throw new Error("Invalid value for property \"imap\".");
    props.imap = imapMapValueConverted as Map<string, Date> | Iterable<[string, Date]>;
    return props as ToJson_Nested.Data;
  }
  static from(value: ToJson_Nested.Value): ToJson_Nested {
    return ToJson_Nested.isInstance(value) ? value : new ToJson_Nested(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "array":
        return new (this.constructor as typeof ToJson_Nested)({
          array: child as (number | undefined)[] | Iterable<(number | undefined)>,
          map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
          imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
        }) as this;
      case "map":
        return new (this.constructor as typeof ToJson_Nested)({
          array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
          map: child as Map<string, bigint> | Iterable<[string, bigint]>,
          imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
        }) as this;
      case "imap":
        return new (this.constructor as typeof ToJson_Nested)({
          array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
          map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
          imap: child as Map<string, Date> | Iterable<[string, Date]>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["array", this.#array] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["map", this.#map] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["imap", this.#imap] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof ToJson_Nested>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for ToJson_Nested.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ToJson_Nested.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get array(): ImmutableArray<(number | undefined)> {
    return this.#array;
  }
  get map(): ImmutableMap<string, bigint> {
    return this.#map;
  }
  get imap(): ImmutableMap<string, ImmutableDate> {
    return this.#imap;
  }
  clearImap() {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || imapCurrent.size === 0) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.clear();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: imapMapNext as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  clearMap() {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: mapMapNext as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  copyWithinArray(target: number, start: number, end?: number) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  deleteImapEntry(key: string) {
    const imapCurrent = this.imap;
    if (!imapCurrent?.has(key)) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: imapMapNext as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  deleteMapEntry(key: string) {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: mapMapNext as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  fillArray(value: number | undefined, start?: number, end?: number) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    (arrayNext as unknown as (number | undefined)[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  filterImapEntries(predicate: (value: ImmutableDate | Date, key: string) => boolean) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [entryKey, entryValue] of imapMapNext) {
      if (!predicate(entryValue, entryKey)) imapMapNext.delete(entryKey);
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: imapMapNext as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  filterMapEntries(predicate: (value: bigint, key: string) => boolean) {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [entryKey, entryValue] of mapMapNext) {
      if (!predicate(entryValue, entryKey)) mapMapNext.delete(entryKey);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: mapMapNext as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  mapImapEntries(mapper: (value: ImmutableDate | Date, key: string) => [string, ImmutableDate | Date]) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const imapMappedEntries: [string, ImmutableDate | Date][] = [];
    for (const [entryKey, entryValue] of imapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      imapMappedEntries.push(mappedEntry);
    }
    imapMapNext.clear();
    for (const [newKey, newValue] of imapMappedEntries) {
      imapMapNext.set(newKey, ImmutableDate.from(newValue));
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: imapMapNext as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  mapMapEntries(mapper: (value: bigint, key: string) => [string, bigint]) {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const mapMappedEntries: [string, bigint][] = [];
    for (const [entryKey, entryValue] of mapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      mapMappedEntries.push(mappedEntry);
    }
    mapMapNext.clear();
    for (const [newKey, newValue] of mapMappedEntries) {
      mapMapNext.set(newKey, newValue);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: mapMapNext as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  mergeImapEntries(entries: ImmutableMap<string, ImmutableDate | Date> | ReadonlyMap<string, ImmutableDate | Date> | Iterable<[string, ImmutableDate | Date]>) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      imapMapNext.set(mergeKey, ImmutableDate.from(mergeValue));
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: imapMapNext as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  mergeMapEntries(entries: ImmutableMap<string, bigint> | ReadonlyMap<string, bigint> | Iterable<[string, bigint]>) {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      mapMapNext.set(mergeKey, mergeValue);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: mapMapNext as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  popArray() {
    if ((this.array ?? []).length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.pop();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  pushArray(...values: (number | undefined)[]) {
    if (values.length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray, ...values];
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  reverseArray() {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.reverse();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  set(updates: Partial<SetUpdates<ToJson_Nested.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ToJson_Nested)(data) as this);
  }
  setArray(value: (number | undefined)[] | Iterable<(number | undefined)>) {
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: value as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  setImap(value: Map<string, Date> | Iterable<[string, Date]>) {
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: (value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [k, ImmutableDate.from(v)]))) as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  setImapEntry(key: string, value: ImmutableDate | Date) {
    const imapCurrent = this.imap;
    if (imapCurrent?.has(key)) {
      const existing = imapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.set(key, ImmutableDate.from(value));
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: imapMapNext as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  setMap(value: Map<string, bigint> | Iterable<[string, bigint]>) {
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: (value === undefined || value === null ? new ImmutableMap() : ImmutableMap.isInstance(value) ? value : new ImmutableMap(value)) as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  setMapEntry(key: string, value: bigint) {
    const mapCurrent = this.map;
    if (mapCurrent?.has(key)) {
      const existing = mapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: mapMapNext as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  shiftArray() {
    if ((this.array ?? []).length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.shift();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  sortArray(compareFn?: (a: number | undefined, b: number | undefined) => number) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    (arrayNext as unknown as (number | undefined)[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  spliceArray(start: number, deleteCount?: number, ...items: (number | undefined)[]) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  unshiftArray(...values: (number | undefined)[]) {
    if (values.length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...values, ...arrayArray];
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  updateImapEntry(key: string, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const currentValue = imapMapNext.get(key);
    const updatedValue = updater(currentValue);
    imapMapNext.set(key, ImmutableDate.from(updatedValue));
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: this.#map as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: imapMapNext as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
  updateMapEntry(key: string, updater: (currentValue: bigint | undefined) => bigint) {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const currentValue = mapMapNext.get(key);
    const updatedValue = updater(currentValue);
    mapMapNext.set(key, updatedValue);
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array as (number | undefined)[] | Iterable<(number | undefined)>,
      map: mapMapNext as Map<string, bigint> | Iterable<[string, bigint]>,
      imap: this.#imap as Map<string, Date> | Iterable<[string, Date]>
    }) as this);
  }
}
export namespace ToJson_Nested {
  export type Data = {
    array: (number | undefined)[] | Iterable<(number | undefined)>;
    map: Map<string, bigint> | Iterable<[string, bigint]>;
    imap: Map<string, Date> | Iterable<[string, Date]>;
  };
  export type Value = ToJson_Nested | ToJson_Nested.Data;
}
const TYPE_TAG_ToJson = Symbol("ToJson");
export class ToJson extends Message<ToJson.Data> {
  static $typeId = "tests/to-json.pmsg#ToJson";
  static $typeHash = "sha256:014fe360b7bbda772dac1718796253e45b0aed47e4400e9ef7db1b34c4b4149d";
  static $instanceTag = Symbol.for("propane:message:" + ToJson.$typeId);
  static readonly $typeName = "ToJson";
  static EMPTY: ToJson;
  #map!: ImmutableMap<string, number>;
  #imap!: ImmutableMap<string, number>;
  #big!: bigint;
  #date!: ImmutableDate;
  #optional!: string | undefined;
  #nonFinite!: number;
  #nested!: ToJson_Nested;
  constructor(props?: ToJson.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ToJson.EMPTY) return ToJson.EMPTY;
    super(TYPE_TAG_ToJson, "ToJson");
    this.#map = props ? (props.map === undefined || props.map === null ? new ImmutableMap() : ImmutableMap.isInstance(props.map) ? props.map : new ImmutableMap(props.map as Iterable<[unknown, unknown]>)) as ImmutableMap<string, number> : new ImmutableMap();
    this.#imap = props ? (props.imap === undefined || props.imap === null ? new ImmutableMap() : ImmutableMap.isInstance(props.imap) ? props.imap : new ImmutableMap(props.imap as Iterable<[unknown, unknown]>)) as ImmutableMap<string, number> : new ImmutableMap();
    this.#big = (props ? props.big : 0n) as bigint;
    this.#date = props ? ImmutableDate.isInstance(props.date) ? props.date : new ImmutableDate(props.date, options) : new ImmutableDate();
    this.#optional = (props ? props.optional : undefined) as string;
    this.#nonFinite = (props ? props.nonFinite : 0) as number;
    this.#nested = props ? ToJson_Nested.isInstance(props.nested) ? props.nested : new ToJson_Nested(props.nested, options) : new ToJson_Nested();
    if (!props) ToJson.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ToJson.Data>[] {
    return [{
      name: "map",
      fieldNumber: 1,
      getValue: () => this.#map as Map<string, number> | Iterable<[string, number]>
    }, {
      name: "imap",
      fieldNumber: 2,
      getValue: () => this.#imap as Map<string, number> | Iterable<[string, number]>
    }, {
      name: "big",
      fieldNumber: 3,
      getValue: () => this.#big
    }, {
      name: "date",
      fieldNumber: 4,
      getValue: () => this.#date as ImmutableDate | Date
    }, {
      name: "optional",
      fieldNumber: 5,
      getValue: () => this.#optional
    }, {
      name: "nonFinite",
      fieldNumber: 6,
      getValue: () => this.#nonFinite
    }, {
      name: "nested",
      fieldNumber: 7,
      getValue: () => this.#nested as ToJson_Nested.Value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ToJson.Data {
    const props = {} as Partial<ToJson.Data>;
    const mapValue = entries["1"] === undefined ? entries["map"] : entries["1"];
    if (mapValue === undefined) throw new Error("Missing required property \"map\".");
    const mapMapValue = mapValue === undefined || mapValue === null ? new ImmutableMap() : ImmutableMap.isInstance(mapValue) ? mapValue : new ImmutableMap(mapValue as Iterable<[unknown, unknown]>);
    if (!((ImmutableMap.isInstance(mapMapValue) || mapMapValue as object instanceof Map) && [...(mapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue as Map<string, number> | Iterable<[string, number]>;
    const imapValue = entries["2"] === undefined ? entries["imap"] : entries["2"];
    if (imapValue === undefined) throw new Error("Missing required property \"imap\".");
    const imapMapValue = imapValue === undefined || imapValue === null ? new ImmutableMap() : ImmutableMap.isInstance(imapValue) ? imapValue : new ImmutableMap(imapValue as Iterable<[unknown, unknown]>);
    if (!((ImmutableMap.isInstance(imapMapValue) || imapMapValue as object instanceof Map) && [...(imapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"imap\".");
    props.imap = imapMapValue as Map<string, number> | Iterable<[string, number]>;
    const bigValue = entries["3"] === undefined ? entries["big"] : entries["3"];
    if (bigValue === undefined) throw new Error("Missing required property \"big\".");
    if (!(typeof bigValue === "bigint")) throw new Error("Invalid value for property \"big\".");
    props.big = bigValue as bigint;
    const dateValue = entries["4"] === undefined ? entries["date"] : entries["4"];
    if (dateValue === undefined) throw new Error("Missing required property \"date\".");
    const dateMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableDate.$compact === true) {
        result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.startsWith(ImmutableDate.$compactTag) ? value.slice(ImmutableDate.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableDate") {
            if (typeof value.$data === "string") {
              if (ImmutableDate.$compact === true) {
                result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.$data.startsWith(ImmutableDate.$compactTag) ? value.$data.slice(ImmutableDate.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableDate.");
              }
            } else {
              result = new ImmutableDate(ImmutableDate.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableDate.");
          }
        } else {
          if (ImmutableDate.isInstance(value)) {
            result = value;
          } else {
            result = new ImmutableDate(value as ImmutableDate.Value, options);
          }
        }
      }
      return result;
    })(dateValue);
    props.date = dateMessageValue as ImmutableDate | Date;
    const optionalValue = entries["5"] === undefined ? entries["optional"] : entries["5"];
    const optionalNormalized = optionalValue === null ? undefined : optionalValue;
    if (optionalNormalized !== undefined && !(typeof optionalNormalized === "string")) throw new Error("Invalid value for property \"optional\".");
    props.optional = optionalNormalized as string;
    const nonFiniteValue = entries["6"] === undefined ? entries["nonFinite"] : entries["6"];
    if (nonFiniteValue === undefined) throw new Error("Missing required property \"nonFinite\".");
    if (!(typeof nonFiniteValue === "number")) throw new Error("Invalid value for property \"nonFinite\".");
    props.nonFinite = nonFiniteValue as number;
    const nestedValue = entries["7"] === undefined ? entries["nested"] : entries["7"];
    if (nestedValue === undefined) throw new Error("Missing required property \"nested\".");
    const nestedMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ToJson_Nested.$compact === true) {
        result = ToJson_Nested.fromCompact(ToJson_Nested.$compactTag && value.startsWith(ToJson_Nested.$compactTag) ? value.slice(ToJson_Nested.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ToJson_Nested") {
            if (typeof value.$data === "string") {
              if (ToJson_Nested.$compact === true) {
                result = ToJson_Nested.fromCompact(ToJson_Nested.$compactTag && value.$data.startsWith(ToJson_Nested.$compactTag) ? value.$data.slice(ToJson_Nested.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ToJson_Nested.");
              }
            } else {
              result = new ToJson_Nested(ToJson_Nested.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ToJson_Nested.");
          }
        } else {
          if (ToJson_Nested.isInstance(value)) {
            result = value;
          } else {
            result = new ToJson_Nested(value as ToJson_Nested.Value, options);
          }
        }
      }
      return result;
    })(nestedValue);
    props.nested = nestedMessageValue;
    return props as ToJson.Data;
  }
  static from(value: ToJson.Value): ToJson {
    return ToJson.isInstance(value) ? value : new ToJson(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "map":
        return new (this.constructor as typeof ToJson)({
          map: child as Map<string, number> | Iterable<[string, number]>,
          imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
          big: this.#big,
          date: this.#date as ImmutableDate | Date,
          optional: this.#optional,
          nonFinite: this.#nonFinite,
          nested: this.#nested as ToJson_Nested.Value
        }) as this;
      case "imap":
        return new (this.constructor as typeof ToJson)({
          map: this.#map as Map<string, number> | Iterable<[string, number]>,
          imap: child as Map<string, number> | Iterable<[string, number]>,
          big: this.#big,
          date: this.#date as ImmutableDate | Date,
          optional: this.#optional,
          nonFinite: this.#nonFinite,
          nested: this.#nested as ToJson_Nested.Value
        }) as this;
      case "date":
        return new (this.constructor as typeof ToJson)({
          map: this.#map as Map<string, number> | Iterable<[string, number]>,
          imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
          big: this.#big,
          date: child as ImmutableDate | Date,
          optional: this.#optional,
          nonFinite: this.#nonFinite,
          nested: this.#nested as ToJson_Nested.Value
        }) as this;
      case "nested":
        return new (this.constructor as typeof ToJson)({
          map: this.#map as Map<string, number> | Iterable<[string, number]>,
          imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
          big: this.#big,
          date: this.#date as ImmutableDate | Date,
          optional: this.#optional,
          nonFinite: this.#nonFinite,
          nested: child as ToJson_Nested.Value
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["map", this.#map] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["imap", this.#imap] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["date", this.#date] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["nested", this.#nested] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof ToJson>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for ToJson.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ToJson.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get map(): ImmutableMap<string, number> {
    return this.#map;
  }
  get imap(): ImmutableMap<string, number> {
    return this.#imap;
  }
  get big(): bigint {
    return this.#big;
  }
  get date(): ImmutableDate {
    return this.#date;
  }
  get optional(): string | undefined {
    return this.#optional;
  }
  get nonFinite(): number {
    return this.#nonFinite;
  }
  get nested(): ToJson_Nested {
    return this.#nested;
  }
  clearImap() {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || imapCurrent.size === 0) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.clear();
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: imapMapNext as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  clearMap() {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  deleteImapEntry(key: string) {
    const imapCurrent = this.imap;
    if (!imapCurrent?.has(key)) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: imapMapNext as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  deleteMapEntry(key: string) {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  filterImapEntries(predicate: (value: number, key: string) => boolean) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [entryKey, entryValue] of imapMapNext) {
      if (!predicate(entryValue, entryKey)) imapMapNext.delete(entryKey);
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: imapMapNext as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  mapImapEntries(mapper: (value: number, key: string) => [string, number]) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const imapMappedEntries: [string, number][] = [];
    for (const [entryKey, entryValue] of imapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      imapMappedEntries.push(mappedEntry);
    }
    imapMapNext.clear();
    for (const [newKey, newValue] of imapMappedEntries) {
      imapMapNext.set(newKey, newValue);
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: imapMapNext as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  mergeImapEntries(entries: ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      imapMapNext.set(mergeKey, mergeValue);
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: imapMapNext as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  set(updates: Partial<SetUpdates<ToJson.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ToJson)(data) as this);
  }
  setBig(value: bigint) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: value,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  setDate(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  setImap(value: Map<string, number> | Iterable<[string, number]>) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: (value === undefined || value === null ? new ImmutableMap() : ImmutableMap.isInstance(value) ? value : new ImmutableMap(value)) as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  setImapEntry(key: string, value: number) {
    const imapCurrent = this.imap;
    if (imapCurrent?.has(key)) {
      const existing = imapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: imapMapNext as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  setMap(value: Map<string, number> | Iterable<[string, number]>) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: (value === undefined || value === null ? new ImmutableMap() : ImmutableMap.isInstance(value) ? value : new ImmutableMap(value)) as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  setNested(value: ToJson_Nested.Value) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: (ToJson_Nested.isInstance(value) ? value : new ToJson_Nested(value)) as ToJson_Nested.Value
    }) as this);
  }
  setNonFinite(value: number) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: value,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  setOptional(value: string | undefined) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: value,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  unsetOptional() {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
  updateImapEntry(key: string, updater: (currentValue: number | undefined) => number) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const currentValue = imapMapNext.get(key);
    const updatedValue = updater(currentValue);
    imapMapNext.set(key, updatedValue);
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map as Map<string, number> | Iterable<[string, number]>,
      imap: imapMapNext as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext as Map<string, number> | Iterable<[string, number]>,
      imap: this.#imap as Map<string, number> | Iterable<[string, number]>,
      big: this.#big,
      date: this.#date as ImmutableDate | Date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested as ToJson_Nested.Value
    }) as this);
  }
}
export namespace ToJson {
  export type Data = {
    map: Map<string, number> | Iterable<[string, number]>;
    imap: Map<string, number> | Iterable<[string, number]>;
    big: bigint;
    date: ImmutableDate | Date;
    optional?: string | undefined;
    nonFinite: number;
    nested: ToJson_Nested.Value;
  };
  export type Value = ToJson | ToJson.Data;
  export import Nested = ToJson_Nested;
}
