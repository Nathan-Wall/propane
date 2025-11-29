/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/to-json.propane
import { Message, MessagePropDescriptor, ImmutableMap, ImmutableArray, ImmutableDate, equals, ADD_UPDATE_LISTENER } from "@propanejs/runtime";
export class ToJson_Nested extends Message<ToJson_Nested.Data> {
  static TYPE_TAG = Symbol("ToJson_Nested");
  static EMPTY: ToJson_Nested;
  #array: ImmutableArray<(number | undefined)>;
  #map: ImmutableMap<string, bigint>;
  #imap: ImmutableMap<string, ImmutableDate>;
  constructor(props?: ToJson_Nested.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && ToJson_Nested.EMPTY) return ToJson_Nested.EMPTY;
    super(ToJson_Nested.TYPE_TAG, "ToJson_Nested", listeners);
    this.#array = props ? props.array === undefined || props.array === null ? props.array : props.array instanceof ImmutableArray ? props.array : new ImmutableArray(props.array) : new ImmutableArray();
    this.#map = props ? props.map === undefined || props.map === null ? props.map : props.map instanceof ImmutableMap || Object.prototype.toString.call(props.map) === "[object ImmutableMap]" ? props.map : new ImmutableMap(props.map) : new ImmutableMap();
    this.#imap = props ? props.imap === undefined || props.imap === null ? props.imap : new ImmutableMap(Array.from(props.imap).map(([k, v]) => [k, v instanceof ImmutableDate ? v : new ImmutableDate(v)])) : new ImmutableMap();
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) ToJson_Nested.EMPTY = this;
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
    const arrayArrayValue = arrayValue === undefined || arrayValue === null ? arrayValue : arrayValue instanceof ImmutableArray ? arrayValue : new ImmutableArray(arrayValue);
    if (!((arrayArrayValue instanceof ImmutableArray || Object.prototype.toString.call(arrayArrayValue) === "[object ImmutableArray]" || Array.isArray(arrayArrayValue)) && [...arrayArrayValue].every(element => typeof element === "number" || element === undefined))) throw new Error("Invalid value for property \"array\".");
    props.array = arrayArrayValue;
    const mapValue = entries["map"];
    if (mapValue === undefined) throw new Error("Missing required property \"map\".");
    const mapMapValue = mapValue === undefined || mapValue === null ? mapValue : mapValue instanceof ImmutableMap || Object.prototype.toString.call(mapValue) === "[object ImmutableMap]" ? mapValue : new ImmutableMap(mapValue);
    if (!((mapMapValue instanceof ImmutableMap || Object.prototype.toString.call(mapMapValue) === "[object ImmutableMap]" || mapMapValue instanceof Map || Object.prototype.toString.call(mapMapValue) === "[object Map]") && [...mapMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "bigint"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue;
    const imapValue = entries["imap"];
    if (imapValue === undefined) throw new Error("Missing required property \"imap\".");
    const imapMapValue = imapValue === undefined || imapValue === null ? imapValue : new ImmutableMap(Array.from(imapValue).map(([k, v]) => [k, v instanceof ImmutableDate ? v : new ImmutableDate(v)]));
    if (!((imapMapValue instanceof ImmutableMap || Object.prototype.toString.call(imapMapValue) === "[object ImmutableMap]" || imapMapValue instanceof Map || Object.prototype.toString.call(imapMapValue) === "[object Map]") && [...imapMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && (mapValue instanceof Date || mapValue instanceof ImmutableDate || Object.prototype.toString.call(mapValue) === "[object Date]" || Object.prototype.toString.call(mapValue) === "[object ImmutableDate]")))) throw new Error("Invalid value for property \"imap\".");
    props.imap = imapMapValue;
    return props as ToJson_Nested.Data;
  }
  protected $enableChildListeners(): void {
    this.#array = this.#array[ADD_UPDATE_LISTENER](newValue => {
      this.setArray(newValue);
    });
    this.#map = this.#map[ADD_UPDATE_LISTENER](newValue => {
      this.setMap(newValue);
    });
    this.#imap = this.#imap[ADD_UPDATE_LISTENER](newValue => {
      this.setImap(newValue);
    });
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
  clearImap(): ToJson_Nested {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || imapCurrent.size === 0) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.clear();
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }, this.$listeners));
  }
  clearMap(): ToJson_Nested {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }, this.$listeners));
  }
  copyWithinArray(target: number, start: number, end?: number): ToJson_Nested {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.copyWithin(target, start, end);
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  deleteImapEntry(key: string): ToJson_Nested {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || !imapCurrent.has(key)) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.delete(key);
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }, this.$listeners));
  }
  deleteMapEntry(key: string): ToJson_Nested {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || !mapCurrent.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }, this.$listeners));
  }
  fillArray(value: number | undefined, start?: number, end?: number): ToJson_Nested {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.fill(value, start, end);
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  filterImapEntries(predicate: (value: ImmutableDate | Date, key: string) => boolean): ToJson_Nested {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [entryKey, entryValue] of imapMapNext) {
      if (!predicate(entryValue, entryKey)) imapMapNext.delete(entryKey);
    }
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }, this.$listeners));
  }
  filterMapEntries(predicate: (value: bigint, key: string) => boolean): ToJson_Nested {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [entryKey, entryValue] of mapMapNext) {
      if (!predicate(entryValue, entryKey)) mapMapNext.delete(entryKey);
    }
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }, this.$listeners));
  }
  mapImapEntries(mapper: (value: ImmutableDate | Date, key: string) => [string, ImmutableDate | Date]): ToJson_Nested {
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
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }, this.$listeners));
  }
  mapMapEntries(mapper: (value: bigint, key: string) => [string, bigint]): ToJson_Nested {
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
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }, this.$listeners));
  }
  mergeImapEntries(entries: Iterable<[string, ImmutableDate | Date]> | ImmutableMap<string, ImmutableDate | Date> | ReadonlyMap<string, ImmutableDate | Date> | Iterable<[string, ImmutableDate | Date]>): ToJson_Nested {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      imapMapNext.set(mergeKey, mergeValue);
    }
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }, this.$listeners));
  }
  mergeMapEntries(entries: Iterable<[string, bigint]> | ImmutableMap<string, bigint> | ReadonlyMap<string, bigint> | Iterable<[string, bigint]>): ToJson_Nested {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      mapMapNext.set(mergeKey, mergeValue);
    }
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }, this.$listeners));
  }
  popArray(): ToJson_Nested {
    if ((this.array ?? []).length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.pop();
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  pushArray(...values): ToJson_Nested {
    if (values.length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray, ...values];
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  reverseArray(): ToJson_Nested {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.reverse();
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  setArray(value: (number | undefined)[] | Iterable<(number | undefined)>): ToJson_Nested {
    return this.$update(new ToJson_Nested({
      array: value,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  setImap(value: Map<string, Date> | Iterable<[string, Date]>): ToJson_Nested {
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k, v instanceof ImmutableDate ? v : new ImmutableDate(v)]))
    }, this.$listeners));
  }
  setImapEntry(key: string, value: ImmutableDate | Date): ToJson_Nested {
    const imapCurrent = this.imap;
    if (imapCurrent && imapCurrent.has(key)) {
      const existing = imapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.set(key, value);
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }, this.$listeners));
  }
  setMap(value: Map<string, bigint> | Iterable<[string, bigint]>): ToJson_Nested {
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: value === undefined || value === null ? value : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : new ImmutableMap(value),
      imap: this.#imap
    }, this.$listeners));
  }
  setMapEntry(key: string, value: bigint): ToJson_Nested {
    const mapCurrent = this.map;
    if (mapCurrent && mapCurrent.has(key)) {
      const existing = mapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.set(key, value);
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }, this.$listeners));
  }
  shiftArray(): ToJson_Nested {
    if ((this.array ?? []).length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.shift();
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  sortArray(compareFn?: (a: number | undefined, b: number | undefined) => number): ToJson_Nested {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.sort(compareFn);
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  spliceArray(start: number, deleteCount?: number, ...items): ToJson_Nested {
    const arrayArray = this.#array;
    const arrayNext = [...arrayArray];
    arrayNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  unshiftArray(...values): ToJson_Nested {
    if (values.length === 0) return this;
    const arrayArray = this.#array;
    const arrayNext = [...values, ...arrayArray];
    return this.$update(new ToJson_Nested({
      array: arrayNext,
      map: this.#map,
      imap: this.#imap
    }, this.$listeners));
  }
  updateImapEntry(key: string, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date): ToJson_Nested {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const currentValue = imapMapNext.get(key);
    const updatedValue = updater(currentValue);
    imapMapNext.set(key, updatedValue);
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: this.#map,
      imap: imapMapNext
    }, this.$listeners));
  }
  updateMapEntry(key: string, updater: (currentValue: bigint | undefined) => bigint): ToJson_Nested {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const currentValue = mapMapNext.get(key);
    const updatedValue = updater(currentValue);
    mapMapNext.set(key, updatedValue);
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson_Nested({
      array: this.#array,
      map: mapMapNext,
      imap: this.#imap
    }, this.$listeners));
  }
}
export namespace ToJson_Nested {
  export interface Data {
    array: (number | undefined)[] | Iterable<(number | undefined)>;
    map: Map<string, bigint> | Iterable<[string, bigint]>;
    imap: Map<string, Date> | Iterable<[string, Date]>;
  }
  export type Value = ToJson_Nested | ToJson_Nested.Data;
}
export class ToJson extends Message<ToJson.Data> {
  static TYPE_TAG = Symbol("ToJson");
  static EMPTY: ToJson;
  #map: ImmutableMap<string, number>;
  #imap: ImmutableMap<string, number>;
  #big: bigint;
  #date: ImmutableDate;
  #optional: string;
  #nonFinite: number;
  #nested: ToJson_Nested;
  constructor(props?: ToJson.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && ToJson.EMPTY) return ToJson.EMPTY;
    super(ToJson.TYPE_TAG, "ToJson", listeners);
    this.#map = props ? props.map === undefined || props.map === null ? props.map : props.map instanceof ImmutableMap || Object.prototype.toString.call(props.map) === "[object ImmutableMap]" ? props.map : new ImmutableMap(props.map) : new ImmutableMap();
    this.#imap = props ? props.imap === undefined || props.imap === null ? props.imap : props.imap instanceof ImmutableMap || Object.prototype.toString.call(props.imap) === "[object ImmutableMap]" ? props.imap : new ImmutableMap(props.imap) : new ImmutableMap();
    this.#big = props ? props.big : 0n;
    this.#date = props ? props.date instanceof ImmutableDate ? props.date : new ImmutableDate(props.date) : new ImmutableDate(0);
    this.#optional = props ? props.optional : undefined;
    this.#nonFinite = props ? props.nonFinite : 0;
    this.#nested = props ? props.nested instanceof ToJson_Nested ? props.nested : new ToJson_Nested(props.nested) : new ToJson_Nested();
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) ToJson.EMPTY = this;
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
    const mapMapValue = mapValue === undefined || mapValue === null ? mapValue : mapValue instanceof ImmutableMap || Object.prototype.toString.call(mapValue) === "[object ImmutableMap]" ? mapValue : new ImmutableMap(mapValue);
    if (!((mapMapValue instanceof ImmutableMap || Object.prototype.toString.call(mapMapValue) === "[object ImmutableMap]" || mapMapValue instanceof Map || Object.prototype.toString.call(mapMapValue) === "[object Map]") && [...mapMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue;
    const imapValue = entries["2"] === undefined ? entries["imap"] : entries["2"];
    if (imapValue === undefined) throw new Error("Missing required property \"imap\".");
    const imapMapValue = imapValue === undefined || imapValue === null ? imapValue : imapValue instanceof ImmutableMap || Object.prototype.toString.call(imapValue) === "[object ImmutableMap]" ? imapValue : new ImmutableMap(imapValue);
    if (!((imapMapValue instanceof ImmutableMap || Object.prototype.toString.call(imapMapValue) === "[object ImmutableMap]" || imapMapValue instanceof Map || Object.prototype.toString.call(imapMapValue) === "[object Map]") && [...imapMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"imap\".");
    props.imap = imapMapValue;
    const bigValue = entries["3"] === undefined ? entries["big"] : entries["3"];
    if (bigValue === undefined) throw new Error("Missing required property \"big\".");
    if (!(typeof bigValue === "bigint")) throw new Error("Invalid value for property \"big\".");
    props.big = bigValue;
    const dateValue = entries["4"] === undefined ? entries["date"] : entries["4"];
    if (dateValue === undefined) throw new Error("Missing required property \"date\".");
    if (!(dateValue instanceof Date || dateValue instanceof ImmutableDate || Object.prototype.toString.call(dateValue) === "[object Date]" || Object.prototype.toString.call(dateValue) === "[object ImmutableDate]")) throw new Error("Invalid value for property \"date\".");
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
  protected $enableChildListeners(): void {
    this.#map = this.#map[ADD_UPDATE_LISTENER](newValue => {
      this.setMap(newValue);
    });
    this.#imap = this.#imap[ADD_UPDATE_LISTENER](newValue => {
      this.setImap(newValue);
    });
    this.#nested = this.#nested[ADD_UPDATE_LISTENER](newValue => {
      this.setNested(newValue);
    });
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
  clearImap(): ToJson {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || imapCurrent.size === 0) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.clear();
    return this.$update(new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  clearMap(): ToJson {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  deleteImapEntry(key: string): ToJson {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || !imapCurrent.has(key)) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.delete(key);
    return this.$update(new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  deleteMapEntry(key: string): ToJson {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || !mapCurrent.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  deleteOptional(): ToJson {
    return this.$update(new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  filterImapEntries(predicate: (value: number, key: string) => boolean): ToJson {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [entryKey, entryValue] of imapMapNext) {
      if (!predicate(entryValue, entryKey)) imapMapNext.delete(entryKey);
    }
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  filterMapEntries(predicate: (value: number, key: string) => boolean): ToJson {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [entryKey, entryValue] of mapMapNext) {
      if (!predicate(entryValue, entryKey)) mapMapNext.delete(entryKey);
    }
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  mapImapEntries(mapper: (value: number, key: string) => [string, number]): ToJson {
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
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  mapMapEntries(mapper: (value: number, key: string) => [string, number]): ToJson {
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
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  mergeImapEntries(entries: Iterable<[string, number]> | ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>): ToJson {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      imapMapNext.set(mergeKey, mergeValue);
    }
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  mergeMapEntries(entries: Iterable<[string, number]> | ImmutableMap<string, number> | ReadonlyMap<string, number> | Iterable<[string, number]>): ToJson {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      mapMapNext.set(mergeKey, mergeValue);
    }
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  setBig(value: bigint): ToJson {
    return this.$update(new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: value,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  setDate(value: ImmutableDate | Date): ToJson {
    return this.$update(new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: value,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  setImap(value: Map<string, number> | Iterable<[string, number]>): ToJson {
    return this.$update(new ToJson({
      map: this.#map,
      imap: value === undefined || value === null ? value : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : new ImmutableMap(value),
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  setImapEntry(key: string, value: number): ToJson {
    const imapCurrent = this.imap;
    if (imapCurrent && imapCurrent.has(key)) {
      const existing = imapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.set(key, value);
    return this.$update(new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  setMap(value: Map<string, number> | Iterable<[string, number]>): ToJson {
    return this.$update(new ToJson({
      map: value === undefined || value === null ? value : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : new ImmutableMap(value),
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  setMapEntry(key: string, value: number): ToJson {
    const mapCurrent = this.map;
    if (mapCurrent && mapCurrent.has(key)) {
      const existing = mapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.set(key, value);
    return this.$update(new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  setNested(value: ToJson_Nested.Value): ToJson {
    return this.$update(new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: value instanceof ToJson_Nested ? value : new ToJson_Nested(value)
    }, this.$listeners));
  }
  setNonFinite(value: number): ToJson {
    return this.$update(new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: value,
      nested: this.#nested
    }, this.$listeners));
  }
  setOptional(value: string): ToJson {
    return this.$update(new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: value,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  updateImapEntry(key: string, updater: (currentValue: number | undefined) => number): ToJson {
    const imapMapSource = this.#imap;
    const imapMapEntries = [...imapMapSource.entries()];
    const imapMapNext = new Map(imapMapEntries);
    const currentValue = imapMapNext.get(key);
    const updatedValue = updater(currentValue);
    imapMapNext.set(key, updatedValue);
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return this.$update(new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
  updateMapEntry(key: string, updater: (currentValue: number | undefined) => number): ToJson {
    const mapMapSource = this.#map;
    const mapMapEntries = [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const currentValue = mapMapNext.get(key);
    const updatedValue = updater(currentValue);
    mapMapNext.set(key, updatedValue);
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return this.$update(new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    }, this.$listeners));
  }
}
export namespace ToJson {
  export interface Data {
    map: Map<string, number> | Iterable<[string, number]>;
    imap: Map<string, number> | Iterable<[string, number]>;
    big: bigint;
    date: ImmutableDate | Date;
    optional?: string | undefined;
    nonFinite: number;
    nested: ToJson_Nested.Value;
  }
  export type Value = ToJson | ToJson.Data;
  export import Nested = ToJson_Nested;
}
