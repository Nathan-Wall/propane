/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-date-key.propane
import { Message, MessagePropDescriptor, ImmutableMap, ImmutableDate, ImmutableUrl, equals } from "@propanejs/runtime";
export class MapDateKey extends Message<MapDateKey.Data> {
  static TYPE_TAG = Symbol("MapDateKey");
  static EMPTY: MapDateKey;
  #dateValues: ImmutableMap<ImmutableDate, number>;
  #urlValues: ImmutableMap<ImmutableUrl, string>;
  #optionalDateMap: ImmutableMap<ImmutableDate, boolean> | undefined;
  constructor(props?: MapDateKey.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && MapDateKey.EMPTY) return MapDateKey.EMPTY;
    super(MapDateKey.TYPE_TAG, "MapDateKey", listeners);
    this.#dateValues = props ? props.dateValues === undefined || props.dateValues === null ? props.dateValues : new ImmutableMap(Array.from(props.dateValues).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v])) : new Map();
    this.#urlValues = props ? props.urlValues === undefined || props.urlValues === null ? props.urlValues : new ImmutableMap(Array.from(props.urlValues).map(([k, v]) => [k instanceof ImmutableUrl ? k : new ImmutableUrl(k), v])) : new Map();
    this.#optionalDateMap = props ? props.optionalDateMap === undefined || props.optionalDateMap === null ? props.optionalDateMap : new ImmutableMap(Array.from(props.optionalDateMap).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v])) : undefined;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) MapDateKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapDateKey.Data>[] {
    return [{
      name: "dateValues",
      fieldNumber: null,
      getValue: () => this.#dateValues
    }, {
      name: "urlValues",
      fieldNumber: null,
      getValue: () => this.#urlValues
    }, {
      name: "optionalDateMap",
      fieldNumber: null,
      getValue: () => this.#optionalDateMap
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapDateKey.Data {
    const props = {} as Partial<MapDateKey.Data>;
    const dateValuesValue = entries["dateValues"];
    if (dateValuesValue === undefined) throw new Error("Missing required property \"dateValues\".");
    const dateValuesMapValue = dateValuesValue === undefined || dateValuesValue === null ? dateValuesValue : new ImmutableMap(Array.from(dateValuesValue).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v]));
    if (!((dateValuesMapValue instanceof ImmutableMap || Object.prototype.toString.call(dateValuesMapValue) === "[object ImmutableMap]" || dateValuesMapValue instanceof Map || Object.prototype.toString.call(dateValuesMapValue) === "[object Map]") && [...dateValuesMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof Date || mapKey instanceof ImmutableDate || Object.prototype.toString.call(mapKey) === "[object Date]" || Object.prototype.toString.call(mapKey) === "[object ImmutableDate]") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"dateValues\".");
    props.dateValues = dateValuesMapValue;
    const urlValuesValue = entries["urlValues"];
    if (urlValuesValue === undefined) throw new Error("Missing required property \"urlValues\".");
    const urlValuesMapValue = urlValuesValue === undefined || urlValuesValue === null ? urlValuesValue : new ImmutableMap(Array.from(urlValuesValue).map(([k, v]) => [k instanceof ImmutableUrl ? k : new ImmutableUrl(k), v]));
    if (!((urlValuesMapValue instanceof ImmutableMap || Object.prototype.toString.call(urlValuesMapValue) === "[object ImmutableMap]" || urlValuesMapValue instanceof Map || Object.prototype.toString.call(urlValuesMapValue) === "[object Map]") && [...urlValuesMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof URL || mapKey instanceof ImmutableUrl || Object.prototype.toString.call(mapKey) === "[object URL]" || Object.prototype.toString.call(mapKey) === "[object ImmutableUrl]") && typeof mapValue === "string"))) throw new Error("Invalid value for property \"urlValues\".");
    props.urlValues = urlValuesMapValue;
    const optionalDateMapValue = entries["optionalDateMap"];
    const optionalDateMapNormalized = optionalDateMapValue === null ? undefined : optionalDateMapValue;
    const optionalDateMapMapValue = optionalDateMapNormalized === undefined || optionalDateMapNormalized === null ? optionalDateMapNormalized : new ImmutableMap(Array.from(optionalDateMapNormalized).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v]));
    if (optionalDateMapMapValue !== undefined && !((optionalDateMapMapValue instanceof ImmutableMap || Object.prototype.toString.call(optionalDateMapMapValue) === "[object ImmutableMap]" || optionalDateMapMapValue instanceof Map || Object.prototype.toString.call(optionalDateMapMapValue) === "[object Map]") && [...optionalDateMapMapValue.entries()].every(([mapKey, mapValue]) => (mapKey instanceof Date || mapKey instanceof ImmutableDate || Object.prototype.toString.call(mapKey) === "[object Date]" || Object.prototype.toString.call(mapKey) === "[object ImmutableDate]") && typeof mapValue === "boolean"))) throw new Error("Invalid value for property \"optionalDateMap\".");
    props.optionalDateMap = optionalDateMapMapValue;
    return props as MapDateKey.Data;
  }
  protected $enableChildListeners(): void {}
  get dateValues(): ImmutableMap<ImmutableDate, number> {
    return this.#dateValues;
  }
  get urlValues(): ImmutableMap<ImmutableUrl, string> {
    return this.#urlValues;
  }
  get optionalDateMap(): ImmutableMap<ImmutableDate, boolean> | undefined {
    return this.#optionalDateMap;
  }
  clearDateValues(): MapDateKey {
    const dateValuesCurrent = this.dateValues;
    if (dateValuesCurrent === undefined || dateValuesCurrent.size === 0) return this;
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.clear();
    return this.$update(new MapDateKey({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  clearOptionalDateMap(): MapDateKey {
    const optionalDateMapCurrent = this.optionalDateMap;
    if (optionalDateMapCurrent === undefined || optionalDateMapCurrent.size === 0) return this;
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.clear();
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }, this.$listeners));
  }
  clearUrlValues(): MapDateKey {
    const urlValuesCurrent = this.urlValues;
    if (urlValuesCurrent === undefined || urlValuesCurrent.size === 0) return this;
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.clear();
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  deleteDateValuesEntry(key: ImmutableDate | Date): MapDateKey {
    const dateValuesCurrent = this.dateValues;
    if (dateValuesCurrent === undefined || !dateValuesCurrent.has(key)) return this;
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.delete(key);
    return this.$update(new MapDateKey({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  deleteOptionalDateMap(): MapDateKey {
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues
    }, this.$listeners));
  }
  deleteOptionalDateMapEntry(key: ImmutableDate | Date): MapDateKey {
    const optionalDateMapCurrent = this.optionalDateMap;
    if (optionalDateMapCurrent === undefined || !optionalDateMapCurrent.has(key)) return this;
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.delete(key);
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }, this.$listeners));
  }
  deleteUrlValuesEntry(key: ImmutableUrl | URL): MapDateKey {
    const urlValuesCurrent = this.urlValues;
    if (urlValuesCurrent === undefined || !urlValuesCurrent.has(key)) return this;
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.delete(key);
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  filterDateValuesEntries(predicate: (value: number, key: ImmutableDate | Date) => boolean): MapDateKey {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    for (const [entryKey, entryValue] of dateValuesMapNext) {
      if (!predicate(entryValue, entryKey)) dateValuesMapNext.delete(entryKey);
    }
    if (this.dateValues === dateValuesMapNext || this.dateValues !== undefined && this.dateValues.equals(dateValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  filterOptionalDateMapEntries(predicate: (value: boolean, key: ImmutableDate | Date) => boolean): MapDateKey {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    for (const [entryKey, entryValue] of optionalDateMapMapNext) {
      if (!predicate(entryValue, entryKey)) optionalDateMapMapNext.delete(entryKey);
    }
    if (this.optionalDateMap === optionalDateMapMapNext || this.optionalDateMap !== undefined && this.optionalDateMap.equals(optionalDateMapMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }, this.$listeners));
  }
  filterUrlValuesEntries(predicate: (value: string, key: ImmutableUrl | URL) => boolean): MapDateKey {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    for (const [entryKey, entryValue] of urlValuesMapNext) {
      if (!predicate(entryValue, entryKey)) urlValuesMapNext.delete(entryKey);
    }
    if (this.urlValues === urlValuesMapNext || this.urlValues !== undefined && this.urlValues.equals(urlValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  mapDateValuesEntries(mapper: (value: number, key: ImmutableDate | Date) => [ImmutableDate | Date, number]): MapDateKey {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    const dateValuesMappedEntries = [];
    for (const [entryKey, entryValue] of dateValuesMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      dateValuesMappedEntries.push(mappedEntry);
    }
    dateValuesMapNext.clear();
    for (const [newKey, newValue] of dateValuesMappedEntries) {
      dateValuesMapNext.set(newKey, newValue);
    }
    if (this.dateValues === dateValuesMapNext || this.dateValues !== undefined && this.dateValues.equals(dateValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  mapOptionalDateMapEntries(mapper: (value: boolean, key: ImmutableDate | Date) => [ImmutableDate | Date, boolean]): MapDateKey {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    const optionalDateMapMappedEntries = [];
    for (const [entryKey, entryValue] of optionalDateMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalDateMapMappedEntries.push(mappedEntry);
    }
    optionalDateMapMapNext.clear();
    for (const [newKey, newValue] of optionalDateMapMappedEntries) {
      optionalDateMapMapNext.set(newKey, newValue);
    }
    if (this.optionalDateMap === optionalDateMapMapNext || this.optionalDateMap !== undefined && this.optionalDateMap.equals(optionalDateMapMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }, this.$listeners));
  }
  mapUrlValuesEntries(mapper: (value: string, key: ImmutableUrl | URL) => [ImmutableUrl | URL, string]): MapDateKey {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    const urlValuesMappedEntries = [];
    for (const [entryKey, entryValue] of urlValuesMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      urlValuesMappedEntries.push(mappedEntry);
    }
    urlValuesMapNext.clear();
    for (const [newKey, newValue] of urlValuesMappedEntries) {
      urlValuesMapNext.set(newKey, newValue);
    }
    if (this.urlValues === urlValuesMapNext || this.urlValues !== undefined && this.urlValues.equals(urlValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  mergeDateValuesEntries(entries: Iterable<[ImmutableDate | Date, number]> | ImmutableMap<ImmutableDate | Date, number> | ReadonlyMap<ImmutableDate | Date, number> | Iterable<[ImmutableDate | Date, number]>): MapDateKey {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      dateValuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.dateValues === dateValuesMapNext || this.dateValues !== undefined && this.dateValues.equals(dateValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  mergeOptionalDateMapEntries(entries: Iterable<[ImmutableDate | Date, boolean]> | ImmutableMap<ImmutableDate | Date, boolean> | ReadonlyMap<ImmutableDate | Date, boolean> | Iterable<[ImmutableDate | Date, boolean]>): MapDateKey {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalDateMapMapNext.set(mergeKey, mergeValue);
    }
    if (this.optionalDateMap === optionalDateMapMapNext || this.optionalDateMap !== undefined && this.optionalDateMap.equals(optionalDateMapMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }, this.$listeners));
  }
  mergeUrlValuesEntries(entries: Iterable<[ImmutableUrl | URL, string]> | ImmutableMap<ImmutableUrl | URL, string> | ReadonlyMap<ImmutableUrl | URL, string> | Iterable<[ImmutableUrl | URL, string]>): MapDateKey {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      urlValuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.urlValues === urlValuesMapNext || this.urlValues !== undefined && this.urlValues.equals(urlValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  setDateValues(value: Map<Date, number> | Iterable<[Date, number]>): MapDateKey {
    return this.$update(new MapDateKey({
      dateValues: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v])),
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  setDateValuesEntry(key: ImmutableDate | Date, value: number): MapDateKey {
    const dateValuesCurrent = this.dateValues;
    if (dateValuesCurrent && dateValuesCurrent.has(key)) {
      const existing = dateValuesCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.set(key, value);
    return this.$update(new MapDateKey({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  setOptionalDateMap(value: Map<Date, boolean> | Iterable<[Date, boolean]>): MapDateKey {
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v]))
    }, this.$listeners));
  }
  setOptionalDateMapEntry(key: ImmutableDate | Date, value: boolean): MapDateKey {
    const optionalDateMapCurrent = this.optionalDateMap;
    if (optionalDateMapCurrent && optionalDateMapCurrent.has(key)) {
      const existing = optionalDateMapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.set(key, value);
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }, this.$listeners));
  }
  setUrlValues(value: Map<URL, string> | Iterable<[URL, string]>): MapDateKey {
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableUrl ? k : new ImmutableUrl(k), v])),
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  setUrlValuesEntry(key: ImmutableUrl | URL, value: string): MapDateKey {
    const urlValuesCurrent = this.urlValues;
    if (urlValuesCurrent && urlValuesCurrent.has(key)) {
      const existing = urlValuesCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.set(key, value);
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  updateDateValuesEntry(key: ImmutableDate | Date, updater: (currentValue: number | undefined) => number): MapDateKey {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    const currentValue = dateValuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    dateValuesMapNext.set(key, updatedValue);
    if (this.dateValues === dateValuesMapNext || this.dateValues !== undefined && this.dateValues.equals(dateValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
  updateOptionalDateMapEntry(key: ImmutableDate | Date, updater: (currentValue: boolean | undefined) => boolean): MapDateKey {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    const currentValue = optionalDateMapMapNext.get(key);
    const updatedValue = updater(currentValue);
    optionalDateMapMapNext.set(key, updatedValue);
    if (this.optionalDateMap === optionalDateMapMapNext || this.optionalDateMap !== undefined && this.optionalDateMap.equals(optionalDateMapMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }, this.$listeners));
  }
  updateUrlValuesEntry(key: ImmutableUrl | URL, updater: (currentValue: string | undefined) => string): MapDateKey {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    const currentValue = urlValuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    urlValuesMapNext.set(key, updatedValue);
    if (this.urlValues === urlValuesMapNext || this.urlValues !== undefined && this.urlValues.equals(urlValuesMapNext)) return this;
    return this.$update(new MapDateKey({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }, this.$listeners));
  }
}
export namespace MapDateKey {
  export interface Data {
    dateValues: Map<Date, number> | Iterable<[Date, number]>;
    urlValues: Map<URL, string> | Iterable<[URL, string]>;
    optionalDateMap?: Map<Date, boolean> | Iterable<[Date, boolean]> | undefined;
  }
  export type Value = MapDateKey | MapDateKey.Data;
}