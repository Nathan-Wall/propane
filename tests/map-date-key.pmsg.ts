/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-date-key.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, ImmutableDate, ImmutableUrl, equals } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet } from "../runtime/index.js";
export class MapDateKey extends Message<MapDateKey.Data> {
  static TYPE_TAG = Symbol("MapDateKey");
  static readonly $typeName = "MapDateKey";
  static EMPTY: MapDateKey;
  #dateValues: ImmutableMap<ImmutableDate, number>;
  #urlValues: ImmutableMap<ImmutableUrl, string>;
  #optionalDateMap: ImmutableMap<ImmutableDate, boolean> | undefined;
  constructor(props?: MapDateKey.Value) {
    if (!props && MapDateKey.EMPTY) return MapDateKey.EMPTY;
    super(MapDateKey.TYPE_TAG, "MapDateKey");
    this.#dateValues = props ? props.dateValues === undefined || props.dateValues === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.dateValues).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v])) : new ImmutableMap();
    this.#urlValues = props ? props.urlValues === undefined || props.urlValues === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.urlValues).map(([k, v]) => [k instanceof ImmutableUrl ? k : new ImmutableUrl(k), v])) : new ImmutableMap();
    this.#optionalDateMap = props ? props.optionalDateMap === undefined || props.optionalDateMap === null ? props.optionalDateMap : new ImmutableMap(Array.from(props.optionalDateMap).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v])) : undefined;
    if (!props) MapDateKey.EMPTY = this;
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
    const dateValuesMapValue = dateValuesValue === undefined || dateValuesValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(dateValuesValue as Iterable<[unknown, unknown]>).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v]));
    if (!((dateValuesMapValue instanceof ImmutableMap || dateValuesMapValue instanceof Map) && [...(dateValuesMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey instanceof Date || mapKey instanceof ImmutableDate) && typeof mapValue === "number"))) throw new Error("Invalid value for property \"dateValues\".");
    props.dateValues = dateValuesMapValue as ImmutableMap<ImmutableDate, number>;
    const urlValuesValue = entries["urlValues"];
    if (urlValuesValue === undefined) throw new Error("Missing required property \"urlValues\".");
    const urlValuesMapValue = urlValuesValue === undefined || urlValuesValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(urlValuesValue as Iterable<[unknown, unknown]>).map(([k, v]) => [k instanceof ImmutableUrl ? k : new ImmutableUrl(k), v]));
    if (!((urlValuesMapValue instanceof ImmutableMap || urlValuesMapValue instanceof Map) && [...(urlValuesMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey instanceof URL || mapKey instanceof ImmutableUrl) && typeof mapValue === "string"))) throw new Error("Invalid value for property \"urlValues\".");
    props.urlValues = urlValuesMapValue as ImmutableMap<ImmutableUrl, string>;
    const optionalDateMapValue = entries["optionalDateMap"];
    const optionalDateMapNormalized = optionalDateMapValue === null ? undefined : optionalDateMapValue;
    const optionalDateMapMapValue = optionalDateMapNormalized === undefined || optionalDateMapNormalized === null ? optionalDateMapNormalized : new ImmutableMap(Array.from(optionalDateMapNormalized as Iterable<[unknown, unknown]>).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v]));
    if (optionalDateMapMapValue !== undefined && !((optionalDateMapMapValue instanceof ImmutableMap || optionalDateMapMapValue instanceof Map) && [...(optionalDateMapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey instanceof Date || mapKey instanceof ImmutableDate) && typeof mapValue === "boolean"))) throw new Error("Invalid value for property \"optionalDateMap\".");
    props.optionalDateMap = optionalDateMapMapValue as ImmutableMap<ImmutableDate, boolean>;
    return props as MapDateKey.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): MapDateKey {
    switch (key) {
      case "dateValues":
        return new (this.constructor as typeof MapDateKey)({
          dateValues: child as ImmutableMap<ImmutableDate, number>,
          urlValues: this.#urlValues,
          optionalDateMap: this.#optionalDateMap
        });
      case "urlValues":
        return new (this.constructor as typeof MapDateKey)({
          dateValues: this.#dateValues,
          urlValues: child as ImmutableMap<ImmutableUrl, string>,
          optionalDateMap: this.#optionalDateMap
        });
      case "optionalDateMap":
        return new (this.constructor as typeof MapDateKey)({
          dateValues: this.#dateValues,
          urlValues: this.#urlValues,
          optionalDateMap: child as ImmutableMap<ImmutableDate, boolean>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["dateValues", this.#dateValues] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["urlValues", this.#urlValues] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["optionalDateMap", this.#optionalDateMap] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get dateValues(): ImmutableMap<ImmutableDate, number> {
    return this.#dateValues;
  }
  get urlValues(): ImmutableMap<ImmutableUrl, string> {
    return this.#urlValues;
  }
  get optionalDateMap(): ImmutableMap<ImmutableDate, boolean> | undefined {
    return this.#optionalDateMap;
  }
  clearDateValues() {
    const dateValuesCurrent = this.dateValues;
    if (dateValuesCurrent === undefined || dateValuesCurrent.size === 0) return this;
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.clear();
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  clearOptionalDateMap() {
    const optionalDateMapCurrent = this.optionalDateMap;
    if (optionalDateMapCurrent === undefined || optionalDateMapCurrent.size === 0) return this;
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.clear();
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }));
  }
  clearUrlValues() {
    const urlValuesCurrent = this.urlValues;
    if (urlValuesCurrent === undefined || urlValuesCurrent.size === 0) return this;
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.clear();
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  deleteDateValuesEntry(key: ImmutableDate | Date) {
    const dateValuesCurrent = this.dateValues;
    if (!dateValuesCurrent?.has(key)) return this;
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  deleteOptionalDateMap() {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues
    }));
  }
  deleteOptionalDateMapEntry(key: ImmutableDate | Date) {
    const optionalDateMapCurrent = this.optionalDateMap;
    if (!optionalDateMapCurrent?.has(key)) return this;
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }));
  }
  deleteUrlValuesEntry(key: ImmutableUrl | URL) {
    const urlValuesCurrent = this.urlValues;
    if (!urlValuesCurrent?.has(key)) return this;
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  filterDateValuesEntries(predicate: (value: number, key: ImmutableDate | Date) => boolean) {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    for (const [entryKey, entryValue] of dateValuesMapNext) {
      if (!predicate(entryValue, entryKey)) dateValuesMapNext.delete(entryKey);
    }
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  filterOptionalDateMapEntries(predicate: (value: boolean, key: ImmutableDate | Date) => boolean) {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    for (const [entryKey, entryValue] of optionalDateMapMapNext) {
      if (!predicate(entryValue, entryKey)) optionalDateMapMapNext.delete(entryKey);
    }
    if (this.optionalDateMap === optionalDateMapMapNext as unknown || this.optionalDateMap?.equals(optionalDateMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }));
  }
  filterUrlValuesEntries(predicate: (value: string, key: ImmutableUrl | URL) => boolean) {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    for (const [entryKey, entryValue] of urlValuesMapNext) {
      if (!predicate(entryValue, entryKey)) urlValuesMapNext.delete(entryKey);
    }
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  mapDateValuesEntries(mapper: (value: number, key: ImmutableDate | Date) => [ImmutableDate | Date, number]) {
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
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  mapOptionalDateMapEntries(mapper: (value: boolean, key: ImmutableDate | Date) => [ImmutableDate | Date, boolean]) {
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
    if (this.optionalDateMap === optionalDateMapMapNext as unknown || this.optionalDateMap?.equals(optionalDateMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }));
  }
  mapUrlValuesEntries(mapper: (value: string, key: ImmutableUrl | URL) => [ImmutableUrl | URL, string]) {
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
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  mergeDateValuesEntries(entries: ImmutableMap<ImmutableDate | Date, number> | ReadonlyMap<ImmutableDate | Date, number> | Iterable<[ImmutableDate | Date, number]>) {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      dateValuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  mergeOptionalDateMapEntries(entries: ImmutableMap<ImmutableDate | Date, boolean> | ReadonlyMap<ImmutableDate | Date, boolean> | Iterable<[ImmutableDate | Date, boolean]>) {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalDateMapMapNext.set(mergeKey, mergeValue);
    }
    if (this.optionalDateMap === optionalDateMapMapNext as unknown || this.optionalDateMap?.equals(optionalDateMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }));
  }
  mergeUrlValuesEntries(entries: ImmutableMap<ImmutableUrl | URL, string> | ReadonlyMap<ImmutableUrl | URL, string> | Iterable<[ImmutableUrl | URL, string]>) {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      urlValuesMapNext.set(mergeKey, mergeValue);
    }
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  setDateValues(value: Map<Date, number> | Iterable<[Date, number]>) {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v])),
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  setDateValuesEntry(key: ImmutableDate | Date, value: number) {
    const dateValuesCurrent = this.dateValues;
    if (dateValuesCurrent?.has(key)) {
      const existing = dateValuesCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  setOptionalDateMap(value: Map<Date, boolean> | Iterable<[Date, boolean]>) {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableDate ? k : new ImmutableDate(k), v]))
    }));
  }
  setOptionalDateMapEntry(key: ImmutableDate | Date, value: boolean) {
    const optionalDateMapCurrent = this.optionalDateMap;
    if (optionalDateMapCurrent?.has(key)) {
      const existing = optionalDateMapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }));
  }
  setUrlValues(value: Map<URL, string> | Iterable<[URL, string]>) {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [k instanceof ImmutableUrl ? k : new ImmutableUrl(k), v])),
      optionalDateMap: this.#optionalDateMap
    }));
  }
  setUrlValuesEntry(key: ImmutableUrl | URL, value: string) {
    const urlValuesCurrent = this.urlValues;
    if (urlValuesCurrent?.has(key)) {
      const existing = urlValuesCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  updateDateValuesEntry(key: ImmutableDate | Date, updater: (currentValue: number | undefined) => number) {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    const currentValue = dateValuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    dateValuesMapNext.set(key, updatedValue);
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext,
      urlValues: this.#urlValues,
      optionalDateMap: this.#optionalDateMap
    }));
  }
  updateOptionalDateMapEntry(key: ImmutableDate | Date, updater: (currentValue: boolean | undefined) => boolean) {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    const currentValue = optionalDateMapMapNext.get(key);
    const updatedValue = updater(currentValue);
    optionalDateMapMapNext.set(key, updatedValue);
    if (this.optionalDateMap === optionalDateMapMapNext as unknown || this.optionalDateMap?.equals(optionalDateMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: this.#urlValues,
      optionalDateMap: optionalDateMapMapNext
    }));
  }
  updateUrlValuesEntry(key: ImmutableUrl | URL, updater: (currentValue: string | undefined) => string) {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    const currentValue = urlValuesMapNext.get(key);
    const updatedValue = updater(currentValue);
    urlValuesMapNext.set(key, updatedValue);
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues,
      urlValues: urlValuesMapNext,
      optionalDateMap: this.#optionalDateMap
    }));
  }
}
export namespace MapDateKey {
  export type Data = {
    dateValues: Map<Date, number> | Iterable<[Date, number]>;
    urlValues: Map<URL, string> | Iterable<[URL, string]>;
    optionalDateMap?: Map<Date, boolean> | Iterable<[Date, boolean]> | undefined;
  };
  export type Value = MapDateKey | MapDateKey.Data;
}
