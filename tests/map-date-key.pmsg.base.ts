/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-date-key.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, ImmutableDate, ImmutableUrl, equals, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_MapDateKey = Symbol("MapDateKey");
export class MapDateKey extends Message<MapDateKey.Data> {
  static $typeId = "tests/map-date-key.pmsg#MapDateKey";
  static $typeHash = "sha256:f0221e783b9ac139bf205b7f76e3ba32581bd6f8d14d483cead0b9b8e0c534e2";
  static $instanceTag = Symbol.for("propane:message:" + MapDateKey.$typeId);
  static readonly $typeName = "MapDateKey";
  static EMPTY: MapDateKey;
  #dateValues!: ImmutableMap<ImmutableDate, number>;
  #urlValues!: ImmutableMap<ImmutableUrl, string>;
  #optionalDateMap!: ImmutableMap<ImmutableDate, boolean> | undefined;
  constructor(props?: MapDateKey.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && MapDateKey.EMPTY) return MapDateKey.EMPTY;
    super(TYPE_TAG_MapDateKey, "MapDateKey");
    this.#dateValues = props ? (props.dateValues === undefined || props.dateValues === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.dateValues as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableDate.from(k as ImmutableDate.Value), v]))) as ImmutableMap<ImmutableDate, number> : new ImmutableMap();
    this.#urlValues = props ? (props.urlValues === undefined || props.urlValues === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.urlValues as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableUrl.from(k as ImmutableUrl.Value), v]))) as ImmutableMap<ImmutableUrl, string> : new ImmutableMap();
    this.#optionalDateMap = props ? (props.optionalDateMap === undefined || props.optionalDateMap === null ? props.optionalDateMap : new ImmutableMap(Array.from(props.optionalDateMap as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableDate.from(k as ImmutableDate.Value), v]))) as ImmutableMap<ImmutableDate, boolean> : undefined;
    if (!props) MapDateKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapDateKey.Data>[] {
    return [{
      name: "dateValues",
      fieldNumber: null,
      getValue: () => this.#dateValues as Map<Date, number> | Iterable<[Date, number]>
    }, {
      name: "urlValues",
      fieldNumber: null,
      getValue: () => this.#urlValues as Map<URL, string> | Iterable<[URL, string]>
    }, {
      name: "optionalDateMap",
      fieldNumber: null,
      getValue: () => this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): MapDateKey.Data {
    const props = {} as Partial<MapDateKey.Data>;
    const dateValuesValue = entries["dateValues"];
    if (dateValuesValue === undefined) throw new Error("Missing required property \"dateValues\".");
    const dateValuesMapValue = dateValuesValue === undefined || dateValuesValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(dateValuesValue as Iterable<[unknown, unknown]>).map(([k, v]) => [typeof k === "string" && ImmutableDate.$compact === true ? k : ImmutableDate.from(k as ImmutableDate.Value), v]));
    const dateValuesMapValueConverted = dateValuesMapValue === undefined || dateValuesMapValue === null ? dateValuesMapValue : new ImmutableMap([...(dateValuesMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [typeof k === "string" && ImmutableDate.$compact === true ? ImmutableDate.fromCompact(ImmutableDate.$compactTag && k.startsWith(ImmutableDate.$compactTag) ? k.slice(ImmutableDate.$compactTag.length) : k, options) as any : k, v]));
    if (!((dateValuesMapValueConverted as object instanceof ImmutableMap || dateValuesMapValueConverted as object instanceof Map) && [...(dateValuesMapValueConverted as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapValue === "number"))) throw new Error("Invalid value for property \"dateValues\".");
    props.dateValues = dateValuesMapValueConverted as Map<Date, number> | Iterable<[Date, number]>;
    const urlValuesValue = entries["urlValues"];
    if (urlValuesValue === undefined) throw new Error("Missing required property \"urlValues\".");
    const urlValuesMapValue = urlValuesValue === undefined || urlValuesValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(urlValuesValue as Iterable<[unknown, unknown]>).map(([k, v]) => [typeof k === "string" && ImmutableUrl.$compact === true ? k : ImmutableUrl.from(k as ImmutableUrl.Value), v]));
    const urlValuesMapValueConverted = urlValuesMapValue === undefined || urlValuesMapValue === null ? urlValuesMapValue : new ImmutableMap([...(urlValuesMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [typeof k === "string" && ImmutableUrl.$compact === true ? ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && k.startsWith(ImmutableUrl.$compactTag) ? k.slice(ImmutableUrl.$compactTag.length) : k, options) as any : k, v]));
    if (!((urlValuesMapValueConverted as object instanceof ImmutableMap || urlValuesMapValueConverted as object instanceof Map) && [...(urlValuesMapValueConverted as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapValue === "string"))) throw new Error("Invalid value for property \"urlValues\".");
    props.urlValues = urlValuesMapValueConverted as Map<URL, string> | Iterable<[URL, string]>;
    const optionalDateMapValue = entries["optionalDateMap"];
    const optionalDateMapNormalized = optionalDateMapValue === null ? undefined : optionalDateMapValue;
    const optionalDateMapMapValue = optionalDateMapNormalized === undefined || optionalDateMapNormalized === null ? optionalDateMapNormalized : new ImmutableMap(Array.from(optionalDateMapNormalized as Iterable<[unknown, unknown]>).map(([k, v]) => [typeof k === "string" && ImmutableDate.$compact === true ? k : ImmutableDate.from(k as ImmutableDate.Value), v]));
    const optionalDateMapMapValueConverted = optionalDateMapMapValue === undefined || optionalDateMapMapValue === null ? optionalDateMapMapValue : new ImmutableMap([...(optionalDateMapMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [typeof k === "string" && ImmutableDate.$compact === true ? ImmutableDate.fromCompact(ImmutableDate.$compactTag && k.startsWith(ImmutableDate.$compactTag) ? k.slice(ImmutableDate.$compactTag.length) : k, options) as any : k, v]));
    if (optionalDateMapMapValueConverted !== undefined && !((optionalDateMapMapValueConverted as object instanceof ImmutableMap || optionalDateMapMapValueConverted as object instanceof Map) && [...(optionalDateMapMapValueConverted as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapValue === "boolean"))) throw new Error("Invalid value for property \"optionalDateMap\".");
    props.optionalDateMap = optionalDateMapMapValueConverted as Map<Date, boolean> | Iterable<[Date, boolean]>;
    return props as MapDateKey.Data;
  }
  static from(value: MapDateKey.Value): MapDateKey {
    return value instanceof MapDateKey ? value : new MapDateKey(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "dateValues":
        return new (this.constructor as typeof MapDateKey)({
          dateValues: child as Map<Date, number> | Iterable<[Date, number]>,
          urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
          optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
        }) as this;
      case "urlValues":
        return new (this.constructor as typeof MapDateKey)({
          dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
          urlValues: child as Map<URL, string> | Iterable<[URL, string]>,
          optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
        }) as this;
      case "optionalDateMap":
        return new (this.constructor as typeof MapDateKey)({
          dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
          urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
          optionalDateMap: child as Map<Date, boolean> | Iterable<[Date, boolean]>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["dateValues", this.#dateValues] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["urlValues", this.#urlValues] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["optionalDateMap", this.#optionalDateMap] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof MapDateKey>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for MapDateKey.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected MapDateKey.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
      dateValues: dateValuesMapNext as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  clearOptionalDateMap() {
    const optionalDateMapCurrent = this.optionalDateMap;
    if (optionalDateMapCurrent === undefined || optionalDateMapCurrent.size === 0) return this;
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.clear();
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: optionalDateMapMapNext as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  clearUrlValues() {
    const urlValuesCurrent = this.urlValues;
    if (urlValuesCurrent === undefined || urlValuesCurrent.size === 0) return this;
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.clear();
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: urlValuesMapNext as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  deleteDateValue(key: ImmutableDate | Date) {
    const dateValuesCurrent = this.dateValues;
    const k = ImmutableDate.from(key);
    if (!dateValuesCurrent?.has(k)) return this;
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  deleteOptionalDateMapEntry(key: ImmutableDate | Date) {
    const optionalDateMapCurrent = this.optionalDateMap;
    const k = ImmutableDate.from(key);
    if (!optionalDateMapCurrent?.has(k)) return this;
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: optionalDateMapMapNext as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  deleteUrlValue(key: ImmutableUrl | URL) {
    const urlValuesCurrent = this.urlValues;
    const k = ImmutableUrl.from(key);
    if (!urlValuesCurrent?.has(k)) return this;
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: urlValuesMapNext as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  filterDateValues(predicate: (value: number, key: ImmutableDate | Date) => boolean) {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    for (const [entryKey, entryValue] of dateValuesMapNext) {
      if (!predicate(entryValue, entryKey)) dateValuesMapNext.delete(entryKey);
    }
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
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
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: optionalDateMapMapNext as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  filterUrlValues(predicate: (value: string, key: ImmutableUrl | URL) => boolean) {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    for (const [entryKey, entryValue] of urlValuesMapNext) {
      if (!predicate(entryValue, entryKey)) urlValuesMapNext.delete(entryKey);
    }
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: urlValuesMapNext as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  mapDateValues(mapper: (value: number, key: ImmutableDate | Date) => [ImmutableDate | Date, number]) {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    const dateValuesMappedEntries: [ImmutableDate | Date, number][] = [];
    for (const [entryKey, entryValue] of dateValuesMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      dateValuesMappedEntries.push(mappedEntry);
    }
    dateValuesMapNext.clear();
    for (const [newKey, newValue] of dateValuesMappedEntries) {
      dateValuesMapNext.set(ImmutableDate.from(newKey), newValue);
    }
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  mapOptionalDateMapEntries(mapper: (value: boolean, key: ImmutableDate | Date) => [ImmutableDate | Date, boolean]) {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    const optionalDateMapMappedEntries: [ImmutableDate | Date, boolean][] = [];
    for (const [entryKey, entryValue] of optionalDateMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalDateMapMappedEntries.push(mappedEntry);
    }
    optionalDateMapMapNext.clear();
    for (const [newKey, newValue] of optionalDateMapMappedEntries) {
      optionalDateMapMapNext.set(ImmutableDate.from(newKey), newValue);
    }
    if (this.optionalDateMap === optionalDateMapMapNext as unknown || this.optionalDateMap?.equals(optionalDateMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: optionalDateMapMapNext as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  mapUrlValues(mapper: (value: string, key: ImmutableUrl | URL) => [ImmutableUrl | URL, string]) {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    const urlValuesMappedEntries: [ImmutableUrl | URL, string][] = [];
    for (const [entryKey, entryValue] of urlValuesMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      urlValuesMappedEntries.push(mappedEntry);
    }
    urlValuesMapNext.clear();
    for (const [newKey, newValue] of urlValuesMappedEntries) {
      urlValuesMapNext.set(ImmutableUrl.from(newKey), newValue);
    }
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: urlValuesMapNext as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  mergeDateValues(entries: ImmutableMap<ImmutableDate | Date, number> | ReadonlyMap<ImmutableDate | Date, number> | Iterable<[ImmutableDate | Date, number]>) {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      dateValuesMapNext.set(ImmutableDate.from(mergeKey), mergeValue);
    }
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  mergeOptionalDateMapEntries(entries: ImmutableMap<ImmutableDate | Date, boolean> | ReadonlyMap<ImmutableDate | Date, boolean> | Iterable<[ImmutableDate | Date, boolean]>) {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalDateMapMapNext.set(ImmutableDate.from(mergeKey), mergeValue);
    }
    if (this.optionalDateMap === optionalDateMapMapNext as unknown || this.optionalDateMap?.equals(optionalDateMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: optionalDateMapMapNext as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  mergeUrlValues(entries: ImmutableMap<ImmutableUrl | URL, string> | ReadonlyMap<ImmutableUrl | URL, string> | Iterable<[ImmutableUrl | URL, string]>) {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      urlValuesMapNext.set(ImmutableUrl.from(mergeKey), mergeValue);
    }
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: urlValuesMapNext as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  set(updates: Partial<SetUpdates<MapDateKey.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapDateKey)(data) as this);
  }
  setDateValue(key: ImmutableDate | Date, value: number) {
    const dateValuesCurrent = this.dateValues;
    const k = ImmutableDate.from(key);
    if (dateValuesCurrent?.has(k)) {
      const existing = dateValuesCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    dateValuesMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  setDateValues(value: Map<Date, number> | Iterable<[Date, number]>) {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: (value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [ImmutableDate.from(k), v]))) as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  setOptionalDateMap(value: Map<Date, boolean> | Iterable<[Date, boolean]> | undefined) {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: (value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [ImmutableDate.from(k), v]))) as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  setOptionalDateMapEntry(key: ImmutableDate | Date, value: boolean) {
    const optionalDateMapCurrent = this.optionalDateMap;
    const k = ImmutableDate.from(key);
    if (optionalDateMapCurrent?.has(k)) {
      const existing = optionalDateMapCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    optionalDateMapMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: optionalDateMapMapNext as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  setUrlValue(key: ImmutableUrl | URL, value: string) {
    const urlValuesCurrent = this.urlValues;
    const k = ImmutableUrl.from(key);
    if (urlValuesCurrent?.has(k)) {
      const existing = urlValuesCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    urlValuesMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: urlValuesMapNext as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  setUrlValues(value: Map<URL, string> | Iterable<[URL, string]>) {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: (value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [ImmutableUrl.from(k), v]))) as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  unsetOptionalDateMap() {
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>
    }) as this);
  }
  updateDateValue(key: ImmutableDate | Date, updater: (currentValue: number | undefined) => number) {
    const dateValuesMapSource = this.#dateValues;
    const dateValuesMapEntries = [...dateValuesMapSource.entries()];
    const dateValuesMapNext = new Map(dateValuesMapEntries);
    const k = ImmutableDate.from(key);
    const currentValue = dateValuesMapNext.get(k);
    const updatedValue = updater(currentValue);
    dateValuesMapNext.set(k, updatedValue);
    if (this.dateValues === dateValuesMapNext as unknown || this.dateValues?.equals(dateValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: dateValuesMapNext as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  updateOptionalDateMapEntry(key: ImmutableDate | Date, updater: (currentValue: boolean | undefined) => boolean) {
    const optionalDateMapMapSource = this.#optionalDateMap;
    const optionalDateMapMapEntries = optionalDateMapMapSource === undefined ? [] : [...optionalDateMapMapSource.entries()];
    const optionalDateMapMapNext = new Map(optionalDateMapMapEntries);
    const k = ImmutableDate.from(key);
    const currentValue = optionalDateMapMapNext.get(k);
    const updatedValue = updater(currentValue);
    optionalDateMapMapNext.set(k, updatedValue);
    if (this.optionalDateMap === optionalDateMapMapNext as unknown || this.optionalDateMap?.equals(optionalDateMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: this.#urlValues as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: optionalDateMapMapNext as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
  }
  updateUrlValue(key: ImmutableUrl | URL, updater: (currentValue: string | undefined) => string) {
    const urlValuesMapSource = this.#urlValues;
    const urlValuesMapEntries = [...urlValuesMapSource.entries()];
    const urlValuesMapNext = new Map(urlValuesMapEntries);
    const k = ImmutableUrl.from(key);
    const currentValue = urlValuesMapNext.get(k);
    const updatedValue = updater(currentValue);
    urlValuesMapNext.set(k, updatedValue);
    if (this.urlValues === urlValuesMapNext as unknown || this.urlValues?.equals(urlValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapDateKey)({
      dateValues: this.#dateValues as Map<Date, number> | Iterable<[Date, number]>,
      urlValues: urlValuesMapNext as Map<URL, string> | Iterable<[URL, string]>,
      optionalDateMap: this.#optionalDateMap as Map<Date, boolean> | Iterable<[Date, boolean]>
    }) as this);
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
