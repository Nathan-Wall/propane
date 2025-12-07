/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/to-json.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, ImmutableArray, ImmutableDate, equals } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet } from "../runtime/index.js";
export class ToJson_Nested extends Message<ToJson_Nested.Data> {
  static TYPE_TAG = Symbol("ToJson_Nested");
  static readonly $typeName = "ToJson_Nested";
  static EMPTY: ToJson_Nested;
  #array: ImmutableArray<(number | undefined)>;
  #map: ImmutableMap<string, bigint>;
  #imap: ImmutableMap<string, ImmutableDate>;
  constructor(props?: ToJson_Nested.Value) {
    if (!props && ToJson_Nested.EMPTY) return ToJson_Nested.EMPTY;
    super(ToJson_Nested.TYPE_TAG, "ToJson_Nested");
    this.#array = props ? props.array === undefined || props.array === null ? new ImmutableArray() : props.array instanceof ImmutableArray ? props.array : new ImmutableArray(props.array) : new ImmutableArray();
    this.#map = props ? props.map === undefined || props.map === null ? new ImmutableMap() : props.map instanceof ImmutableMap ? props.map : new ImmutableMap(props.map) : new ImmutableMap();
    this.#imap = props ? props.imap === undefined || props.imap === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.imap).map(([k, v]) => [k, v instanceof ImmutableDate ? v : new ImmutableDate(v)])) : new ImmutableMap();
    if (!props) ToJson_Nested.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ToJson_Nested.Data>[] {
    return [{
      name: "array",
      fieldNumber: null,
      getValue: () => this.#array
    }, {
      name: "map",
      fieldNumber: null,
      getValue: () => this.#map
    }, {
      name: "imap",
      fieldNumber: null,
      getValue: () => this.#imap
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ToJson_Nested.Data {
    const props = {} as Partial<ToJson_Nested.Data>;
    const arrayValue = entries["array"];
    if (arrayValue === undefined) throw new Error("Missing required property \"array\".");
    const arrayArrayValue = arrayValue === undefined || arrayValue === null ? new ImmutableArray() : arrayValue as object instanceof ImmutableArray ? arrayValue : new ImmutableArray(arrayValue);
    if (!((arrayArrayValue instanceof ImmutableArray || Array.isArray(arrayArrayValue)) && [...(arrayArrayValue as Iterable<unknown>)].every(element => typeof element === "number" || element === undefined))) throw new Error("Invalid value for property \"array\".");
    props.array = arrayArrayValue as ImmutableArray<(number | undefined)>;
    const mapValue = entries["map"];
    if (mapValue === undefined) throw new Error("Missing required property \"map\".");
    const mapMapValue = mapValue === undefined || mapValue === null ? new ImmutableMap() : mapValue as object instanceof ImmutableMap ? mapValue : new ImmutableMap(mapValue as Iterable<[unknown, unknown]>);
    if (!((mapMapValue instanceof ImmutableMap || mapMapValue instanceof Map) && [...(mapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "bigint"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue as ImmutableMap<string, bigint>;
    const imapValue = entries["imap"];
    if (imapValue === undefined) throw new Error("Missing required property \"imap\".");
    const imapMapValue = imapValue === undefined || imapValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(imapValue as Iterable<[unknown, unknown]>).map(([k, v]) => [k, v instanceof ImmutableDate ? v : new ImmutableDate(v)]));
    if (!((imapMapValue instanceof ImmutableMap || imapMapValue instanceof Map) && [...(imapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && (mapValue instanceof Date || mapValue instanceof ImmutableDate)))) throw new Error("Invalid value for property \"imap\".");
    props.imap = imapMapValue as ImmutableMap<string, ImmutableDate>;
    return props as ToJson_Nested.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): ToJson_Nested {
    switch (key) {
      case "array":
        return new (this.constructor as typeof ToJson_Nested)({
          array: child as ImmutableArray<(number | undefined)>,
          map: this.#map,
          imap: this.#imap
        });
      case "map":
        return new (this.constructor as typeof ToJson_Nested)({
          array: this.#array,
          map: child as ImmutableMap<string, bigint>,
          imap: this.#imap
        });
      case "imap":
        return new (this.constructor as typeof ToJson_Nested)({
          array: this.#array,
          map: this.#map,
          imap: child as ImmutableMap<string, ImmutableDate>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["array", this.#array] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["map", this.#map] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["imap", this.#imap] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }));
  }
  clearMap() {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }));
  }
  copyWithinArray(target: number, start: number, end?: number) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  deleteImapEntry(key: string) {
    const imapCurrent = this.imap;
    if (!imapCurrent?.has(key)) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }));
  }
  deleteMapEntry(key: string) {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }));
  }
  fillArray(value: number | undefined, start?: number, end?: number) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.fill(value, start, end);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
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
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }));
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
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }));
  }
  mapImapEntries(mapper: (value: ImmutableDate | Date, key: string) => [string, ImmutableDate | Date]) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const imapMappedEntries = [];
    for (const [entryKey, entryValue] of imapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      imapMappedEntries.push(mappedEntry);
    }
    imapMapNext.clear();
    for (const [newKey, newValue] of imapMappedEntries) {
      imapMapNext.set(newKey, newValue);
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }));
  }
  mapMapEntries(mapper: (value: bigint, key: string) => [string, bigint]) {
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
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }));
  }
  mergeImapEntries(entries: ImmutableMap<string, ImmutableDate | Date> | ReadonlyMap<string, ImmutableDate | Date> | Iterable<[string, ImmutableDate | Date]>) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      imapMapNext.set(mergeKey, mergeValue);
    }
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }));
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
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }));
  }
  popArray() {
    if ((this.array ?? []).length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.pop();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  pushArray(...values) {
    if (values.length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray, ...values];
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  reverseArray() {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.reverse();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  setArray(value: (number | undefined)[] | Iterable<(number | undefined)>) {
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: value,
      map: this.#map,
      imap: this.#imap
    }));
  }
  setImap(value: Map<string, Date> | Iterable<[string, Date]>) {
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: this.#map,
      imap: value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [k, v instanceof ImmutableDate ? v : new ImmutableDate(v)]))
    }));
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
    imapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }));
  }
  setMap(value: Map<string, bigint> | Iterable<[string, bigint]>) {
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value),
      imap: this.#imap
    }));
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
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }));
  }
  shiftArray() {
    if ((this.array ?? []).length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.shift();
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  sortArray(compareFn?: (a: number | undefined, b: number | undefined) => number) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.sort(compareFn);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  spliceArray(start: number, deleteCount?: number, ...items) {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  unshiftArray(...values) {
    if (values.length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...values, ...arrayArray];
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }));
  }
  updateImapEntry(key: string, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const currentValue = imapMapNext.get(key);
    const updatedValue = updater(currentValue);
    imapMapNext.set(key, updatedValue);
    if (this.imap === imapMapNext as unknown || this.imap?.equals(imapMapNext)) return this;
    return this.$update(new (this.constructor as typeof ToJson_Nested)({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }));
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
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }));
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
export class ToJson extends Message<ToJson.Data> {
  static TYPE_TAG = Symbol("ToJson");
  static readonly $typeName = "ToJson";
  static EMPTY: ToJson;
  #map: ImmutableMap<string, number>;
  #imap: ImmutableMap<string, number>;
  #big: bigint;
  #date: ImmutableDate;
  #optional: string;
  #nonFinite: number;
  #nested: ToJson_Nested;
  constructor(props?: ToJson.Value) {
    if (!props && ToJson.EMPTY) return ToJson.EMPTY;
    super(ToJson.TYPE_TAG, "ToJson");
    this.#map = props ? props.map === undefined || props.map === null ? new ImmutableMap() : props.map instanceof ImmutableMap ? props.map : new ImmutableMap(props.map) : new ImmutableMap();
    this.#imap = props ? props.imap === undefined || props.imap === null ? new ImmutableMap() : props.imap instanceof ImmutableMap ? props.imap : new ImmutableMap(props.imap) : new ImmutableMap();
    this.#big = props ? props.big : 0n;
    this.#date = props ? props.date instanceof ImmutableDate ? props.date : new ImmutableDate(props.date) : new ImmutableDate(0);
    this.#optional = props ? props.optional : undefined;
    this.#nonFinite = props ? props.nonFinite : 0;
    this.#nested = props ? props.nested instanceof ToJson_Nested ? props.nested : new ToJson_Nested(props.nested) : new ToJson_Nested();
    if (!props) ToJson.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ToJson.Data>[] {
    return [{
      name: "map",
      fieldNumber: 1,
      getValue: () => this.#map
    }, {
      name: "imap",
      fieldNumber: 2,
      getValue: () => this.#imap
    }, {
      name: "big",
      fieldNumber: 3,
      getValue: () => this.#big
    }, {
      name: "date",
      fieldNumber: 4,
      getValue: () => this.#date
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
      getValue: () => this.#nested
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ToJson.Data {
    const props = {} as Partial<ToJson.Data>;
    const mapValue = entries["1"] === undefined ? entries["map"] : entries["1"];
    if (mapValue === undefined) throw new Error("Missing required property \"map\".");
    const mapMapValue = mapValue === undefined || mapValue === null ? new ImmutableMap() : mapValue as object instanceof ImmutableMap ? mapValue : new ImmutableMap(mapValue as Iterable<[unknown, unknown]>);
    if (!((mapMapValue instanceof ImmutableMap || mapMapValue instanceof Map) && [...(mapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue as ImmutableMap<string, number>;
    const imapValue = entries["2"] === undefined ? entries["imap"] : entries["2"];
    if (imapValue === undefined) throw new Error("Missing required property \"imap\".");
    const imapMapValue = imapValue === undefined || imapValue === null ? new ImmutableMap() : imapValue as object instanceof ImmutableMap ? imapValue : new ImmutableMap(imapValue as Iterable<[unknown, unknown]>);
    if (!((imapMapValue instanceof ImmutableMap || imapMapValue instanceof Map) && [...(imapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"imap\".");
    props.imap = imapMapValue as ImmutableMap<string, number>;
    const bigValue = entries["3"] === undefined ? entries["big"] : entries["3"];
    if (bigValue === undefined) throw new Error("Missing required property \"big\".");
    if (!(typeof bigValue === "bigint")) throw new Error("Invalid value for property \"big\".");
    props.big = bigValue;
    const dateValue = entries["4"] === undefined ? entries["date"] : entries["4"];
    if (dateValue === undefined) throw new Error("Missing required property \"date\".");
    if (!(dateValue instanceof Date || dateValue instanceof ImmutableDate)) throw new Error("Invalid value for property \"date\".");
    props.date = dateValue;
    const optionalValue = entries["5"] === undefined ? entries["optional"] : entries["5"];
    const optionalNormalized = optionalValue === null ? undefined : optionalValue;
    if (optionalNormalized !== undefined && !(typeof optionalNormalized === "string")) throw new Error("Invalid value for property \"optional\".");
    props.optional = optionalNormalized;
    const nonFiniteValue = entries["6"] === undefined ? entries["nonFinite"] : entries["6"];
    if (nonFiniteValue === undefined) throw new Error("Missing required property \"nonFinite\".");
    if (!(typeof nonFiniteValue === "number")) throw new Error("Invalid value for property \"nonFinite\".");
    props.nonFinite = nonFiniteValue;
    const nestedValue = entries["7"] === undefined ? entries["nested"] : entries["7"];
    if (nestedValue === undefined) throw new Error("Missing required property \"nested\".");
    const nestedMessageValue = nestedValue instanceof ToJson_Nested ? nestedValue : new ToJson_Nested(nestedValue);
    props.nested = nestedMessageValue;
    return props as ToJson.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): ToJson {
    switch (key) {
      case "map":
        return new (this.constructor as typeof ToJson)({
          map: child as ImmutableMap<string, number>,
          imap: this.#imap,
          big: this.#big,
          date: this.#date,
          optional: this.#optional,
          nonFinite: this.#nonFinite,
          nested: this.#nested
        });
      case "imap":
        return new (this.constructor as typeof ToJson)({
          map: this.#map,
          imap: child as ImmutableMap<string, number>,
          big: this.#big,
          date: this.#date,
          optional: this.#optional,
          nonFinite: this.#nonFinite,
          nested: this.#nested
        });
      case "nested":
        return new (this.constructor as typeof ToJson)({
          map: this.#map,
          imap: this.#imap,
          big: this.#big,
          date: this.#date,
          optional: this.#optional,
          nonFinite: this.#nonFinite,
          nested: child as ToJson_Nested
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["map", this.#map] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["imap", this.#imap] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["nested", this.#nested] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
  get optional(): string {
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
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  clearMap() {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  deleteImapEntry(key: string) {
    const imapCurrent = this.imap;
    if (!imapCurrent?.has(key)) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  deleteMapEntry(key: string) {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  deleteOptional() {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
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
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  mapImapEntries(mapper: (value: number, key: string) => [string, number]) {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const imapMappedEntries = [];
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
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
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
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  setBig(value: bigint) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: this.#imap,
      big: value,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  setDate(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: value,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  setImap(value: Map<string, number> | Iterable<[string, number]>) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value),
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
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
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  setMap(value: Map<string, number> | Iterable<[string, number]>) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value),
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
  }
  setNested(value: ToJson_Nested.Value) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: value instanceof ToJson_Nested ? value : new ToJson_Nested(value)
    }));
  }
  setNonFinite(value: number) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: value,
      nested: this.#nested
    }));
  }
  setOptional(value: string) {
    return this.$update(new (this.constructor as typeof ToJson)({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: value,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
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
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
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
    return this.$update(new (this.constructor as typeof ToJson)({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }));
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
