/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/to-json.propane
import { Message, MessagePropDescriptor, ImmutableMap, equals } from "@propanejs/runtime";
export namespace ToJson {
  export interface Data {
    map: ReadonlyMap<string, number>;
    imap: ReadonlyMap<string, number>;
    big: bigint;
    date: Date;
    optional?: string;
    nonFinite: number;
    nested: {
      array: (number | undefined)[];
      map: Map<string, bigint>;
      imap: Map<string, Date>;
    };
  }
  export type Value = ToJson | ToJson.Data;
}
export class ToJson extends Message<ToJson.Data> {
  static TYPE_TAG = Symbol("ToJson");
  static EMPTY: ToJson;
  #map: ReadonlyMap<string, number>;
  #imap: ReadonlyMap<string, number>;
  #big: bigint;
  #date: Date;
  #optional: string;
  #nonFinite: number;
  #nested: {
    array: (number | undefined)[];
    map: Map<string, bigint>;
    imap: Map<string, Date>;
  };
  constructor(props?: ToJson.Value) {
    if (!props) {
      if (ToJson.EMPTY) return ToJson.EMPTY;
    }
    super(ToJson.TYPE_TAG);
    this.#map = props ? Array.isArray(props.map) ? new ImmutableMap(props.map) : props.map instanceof ImmutableMap || Object.prototype.toString.call(props.map) === "[object ImmutableMap]" ? props.map : props.map instanceof Map || Object.prototype.toString.call(props.map) === "[object Map]" ? new ImmutableMap(props.map) : props.map : new Map();
    this.#imap = props ? Array.isArray(props.imap) ? new ImmutableMap(props.imap) : props.imap instanceof ImmutableMap || Object.prototype.toString.call(props.imap) === "[object ImmutableMap]" ? props.imap : props.imap instanceof Map || Object.prototype.toString.call(props.imap) === "[object Map]" ? new ImmutableMap(props.imap) : props.imap : new Map();
    this.#big = props ? props.big : BigInt(0);
    this.#date = props ? props.date : new Date(0);
    this.#optional = props ? props.optional : undefined;
    this.#nonFinite = props ? props.nonFinite : 0;
    this.#nested = props ? props.nested : undefined;
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
    const mapMapValue = Array.isArray(mapValue) ? new ImmutableMap(mapValue) : mapValue instanceof ImmutableMap || Object.prototype.toString.call(mapValue) === "[object ImmutableMap]" ? mapValue : mapValue instanceof Map || Object.prototype.toString.call(mapValue) === "[object Map]" ? new ImmutableMap(mapValue) : mapValue;
    if (!((mapMapValue instanceof ImmutableMap || Object.prototype.toString.call(mapMapValue) === "[object ImmutableMap]" || mapMapValue instanceof Map || Object.prototype.toString.call(mapMapValue) === "[object Map]") && [...mapMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValue;
    const imapValue = entries["2"] === undefined ? entries["imap"] : entries["2"];
    if (imapValue === undefined) throw new Error("Missing required property \"imap\".");
    const imapMapValue = Array.isArray(imapValue) ? new ImmutableMap(imapValue) : imapValue instanceof ImmutableMap || Object.prototype.toString.call(imapValue) === "[object ImmutableMap]" ? imapValue : imapValue instanceof Map || Object.prototype.toString.call(imapValue) === "[object Map]" ? new ImmutableMap(imapValue) : imapValue;
    if (!((imapMapValue instanceof ImmutableMap || Object.prototype.toString.call(imapMapValue) === "[object ImmutableMap]" || imapMapValue instanceof Map || Object.prototype.toString.call(imapMapValue) === "[object Map]") && [...imapMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "number"))) throw new Error("Invalid value for property \"imap\".");
    props.imap = imapMapValue;
    const bigValue = entries["3"] === undefined ? entries["big"] : entries["3"];
    if (bigValue === undefined) throw new Error("Missing required property \"big\".");
    if (!(typeof bigValue === "bigint")) throw new Error("Invalid value for property \"big\".");
    props.big = bigValue;
    const dateValue = entries["4"] === undefined ? entries["date"] : entries["4"];
    if (dateValue === undefined) throw new Error("Missing required property \"date\".");
    if (!(dateValue instanceof Date || Object.prototype.toString.call(dateValue) === "[object Date]")) throw new Error("Invalid value for property \"date\".");
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
    if (!(typeof nestedValue === "object" && nestedValue !== null && nestedValue.array !== undefined && (nestedValue.array instanceof ImmutableArray || Object.prototype.toString.call(nestedValue.array) === "[object ImmutableArray]" || Array.isArray(nestedValue.array)) && Array.from(nestedValue.array).every(element => typeof element === "number" || element === undefined) && nestedValue.map !== undefined && (nestedValue.map instanceof ImmutableMap || Object.prototype.toString.call(nestedValue.map) === "[object ImmutableMap]" || nestedValue.map instanceof Map || Object.prototype.toString.call(nestedValue.map) === "[object Map]") && [...nestedValue.map.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "bigint") && nestedValue.imap !== undefined && (nestedValue.imap instanceof ImmutableMap || Object.prototype.toString.call(nestedValue.imap) === "[object ImmutableMap]" || nestedValue.imap instanceof Map || Object.prototype.toString.call(nestedValue.imap) === "[object Map]") && [...nestedValue.imap.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && (mapValue instanceof Date || Object.prototype.toString.call(mapValue) === "[object Date]")))) throw new Error("Invalid value for property \"nested\".");
    props.nested = nestedValue;
    return props as ToJson.Data;
  }
  get map(): ReadonlyMap<string, number> {
    return this.#map;
  }
  get imap(): ReadonlyMap<string, number> {
    return this.#imap;
  }
  get big(): bigint {
    return this.#big;
  }
  get date(): Date {
    return this.#date;
  }
  get optional(): string {
    return this.#optional;
  }
  get nonFinite(): number {
    return this.#nonFinite;
  }
  get nested(): {
    array: (number | undefined)[];
    map: Map<string, bigint>;
    imap: Map<string, Date>;
  } {
    return this.#nested;
  }
  clearImap(): ToJson {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || imapCurrent.size === 0) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = Array.from(imapMapSource.entries());
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.clear();
    return new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  clearMap(): ToJson {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = Array.from(mapMapSource.entries());
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  deleteImapEntry(key: string): ToJson {
    const imapCurrent = this.imap;
    if (imapCurrent === undefined || !imapCurrent.has(key)) return this;
    const imapMapSource = this.#imap;
    const imapMapEntries = Array.from(imapMapSource.entries());
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.delete(key);
    return new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  deleteMapEntry(key: string): ToJson {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || !mapCurrent.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = Array.from(mapMapSource.entries());
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  deleteOptional(): ToJson {
    return new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  filterImapEntries(predicate: (value: number, key: string) => boolean): ToJson {
    const imapMapSource = this.#imap;
    const imapMapEntries = Array.from(imapMapSource.entries());
    const imapMapNext = new Map(imapMapEntries);
    for (const [entryKey, entryValue] of imapMapNext) {
      if (!predicate(entryValue, entryKey)) imapMapNext.delete(entryKey);
    }
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  filterMapEntries(predicate: (value: number, key: string) => boolean): ToJson {
    const mapMapSource = this.#map;
    const mapMapEntries = Array.from(mapMapSource.entries());
    const mapMapNext = new Map(mapMapEntries);
    for (const [entryKey, entryValue] of mapMapNext) {
      if (!predicate(entryValue, entryKey)) mapMapNext.delete(entryKey);
    }
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  mapImapEntries(mapper: (value: number, key: string) => [string, number]): ToJson {
    const imapMapSource = this.#imap;
    const imapMapEntries = Array.from(imapMapSource.entries());
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
    return new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  mapMapEntries(mapper: (value: number, key: string) => [string, number]): ToJson {
    const mapMapSource = this.#map;
    const mapMapEntries = Array.from(mapMapSource.entries());
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
    return new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  mergeImapEntries(entries: Iterable<[string, number]> | Map<string, number> | ReadonlyMap<string, number>): ToJson {
    const imapMapSource = this.#imap;
    const imapMapEntries = Array.from(imapMapSource.entries());
    const imapMapNext = new Map(imapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      imapMapNext.set(mergeKey, mergeValue);
    }
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  mergeMapEntries(entries: Iterable<[string, number]> | Map<string, number> | ReadonlyMap<string, number>): ToJson {
    const mapMapSource = this.#map;
    const mapMapEntries = Array.from(mapMapSource.entries());
    const mapMapNext = new Map(mapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      mapMapNext.set(mergeKey, mergeValue);
    }
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  setBig(value: bigint): ToJson {
    return new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: value,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  setDate(value: Date): ToJson {
    return new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: value,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  setImap(value: ReadonlyMap<string, number>): ToJson {
    return new ToJson({
      map: this.#map,
      imap: Array.isArray(value) ? new ImmutableMap(value) : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : value instanceof Map || Object.prototype.toString.call(value) === "[object Map]" ? new ImmutableMap(value) : value,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  setImapEntry(key: string, value: number): ToJson {
    const imapCurrent = this.imap;
    if (imapCurrent && imapCurrent.has(key)) {
      const existing = imapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const imapMapSource = this.#imap;
    const imapMapEntries = Array.from(imapMapSource.entries());
    const imapMapNext = new Map(imapMapEntries);
    imapMapNext.set(key, value);
    return new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  setMap(value: ReadonlyMap<string, number>): ToJson {
    return new ToJson({
      map: Array.isArray(value) ? new ImmutableMap(value) : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : value instanceof Map || Object.prototype.toString.call(value) === "[object Map]" ? new ImmutableMap(value) : value,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  setMapEntry(key: string, value: number): ToJson {
    const mapCurrent = this.map;
    if (mapCurrent && mapCurrent.has(key)) {
      const existing = mapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const mapMapSource = this.#map;
    const mapMapEntries = Array.from(mapMapSource.entries());
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.set(key, value);
    return new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  setNested(value: {
    array: (number | undefined)[];
    map: Map<string, bigint>;
    imap: Map<string, Date>;
  }): ToJson {
    return new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: value
    });
  }
  setNonFinite(value: number): ToJson {
    return new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: value,
      nested: this.#nested
    });
  }
  setOptional(value: string): ToJson {
    return new ToJson({
      map: this.#map,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: value,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  updateImapEntry(key: string, updater: (currentValue: number | undefined) => number): ToJson {
    const imapMapSource = this.#imap;
    const imapMapEntries = Array.from(imapMapSource.entries());
    const imapMapNext = new Map(imapMapEntries);
    const currentValue = imapMapNext.get(key);
    const updatedValue = updater(currentValue);
    imapMapNext.set(key, updatedValue);
    if (this.imap === imapMapNext || this.imap !== undefined && this.imap.equals(imapMapNext)) return this;
    return new ToJson({
      map: this.#map,
      imap: imapMapNext,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
  updateMapEntry(key: string, updater: (currentValue: number | undefined) => number): ToJson {
    const mapMapSource = this.#map;
    const mapMapEntries = Array.from(mapMapSource.entries());
    const mapMapNext = new Map(mapMapEntries);
    const currentValue = mapMapNext.get(key);
    const updatedValue = updater(currentValue);
    mapMapNext.set(key, updatedValue);
    if (this.map === mapMapNext || this.map !== undefined && this.map.equals(mapMapNext)) return this;
    return new ToJson({
      map: mapMapNext,
      imap: this.#imap,
      big: this.#big,
      date: this.#date,
      optional: this.#optional,
      nonFinite: this.#nonFinite,
      nested: this.#nested
    });
  }
}