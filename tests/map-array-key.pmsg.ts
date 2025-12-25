/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map-array-key.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, ImmutableArray, ImmutableDate, equals, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, SetUpdates } from "../runtime/index.js";
export class MapArrayKey extends Message<MapArrayKey.Data> {
  static TYPE_TAG = Symbol("MapArrayKey");
  static readonly $typeName = "MapArrayKey";
  static EMPTY: MapArrayKey;
  #arrayValues!: ImmutableMap<ImmutableArray<string>, number>;
  #numberArrayMap!: ImmutableMap<ImmutableArray<number>, string>;
  #optionalArrayMap!: ImmutableMap<ImmutableArray<boolean>, ImmutableDate> | undefined;
  constructor(props?: MapArrayKey.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && MapArrayKey.EMPTY) return MapArrayKey.EMPTY;
    super(MapArrayKey.TYPE_TAG, "MapArrayKey");
    this.#arrayValues = props ? (props.arrayValues === undefined || props.arrayValues === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.arrayValues as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableArray.from(k as Iterable<unknown>), v]))) as ImmutableMap<ImmutableArray<string>, number> : new ImmutableMap();
    this.#numberArrayMap = props ? (props.numberArrayMap === undefined || props.numberArrayMap === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.numberArrayMap as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableArray.from(k as Iterable<unknown>), v]))) as ImmutableMap<ImmutableArray<number>, string> : new ImmutableMap();
    this.#optionalArrayMap = props ? (props.optionalArrayMap === undefined || props.optionalArrayMap === null ? props.optionalArrayMap : new ImmutableMap(Array.from(props.optionalArrayMap as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableArray.from(k as Iterable<unknown>), ImmutableDate.from(v as Date)]))) as ImmutableMap<ImmutableArray<boolean>, ImmutableDate> : undefined;
    if (!props) MapArrayKey.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapArrayKey.Data>[] {
    return [{
      name: "arrayValues",
      fieldNumber: null,
      getValue: () => this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>
    }, {
      name: "numberArrayMap",
      fieldNumber: null,
      getValue: () => this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>
    }, {
      name: "optionalArrayMap",
      fieldNumber: null,
      getValue: () => this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): MapArrayKey.Data {
    const props = {} as Partial<MapArrayKey.Data>;
    const arrayValuesValue = entries["arrayValues"];
    if (arrayValuesValue === undefined) throw new Error("Missing required property \"arrayValues\".");
    const arrayValuesMapValue = arrayValuesValue === undefined || arrayValuesValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(arrayValuesValue as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableArray.from(k as Iterable<unknown>), v]));
    if (!((arrayValuesMapValue as object instanceof ImmutableMap || arrayValuesMapValue as object instanceof Map) && [...(arrayValuesMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey as object instanceof ImmutableArray || Array.isArray(mapKey)) && [...(mapKey as Iterable<unknown>)].every(element => typeof element === "string") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"arrayValues\".");
    props.arrayValues = arrayValuesMapValue as Map<string[], number> | Iterable<[string[], number]>;
    const numberArrayMapValue = entries["numberArrayMap"];
    if (numberArrayMapValue === undefined) throw new Error("Missing required property \"numberArrayMap\".");
    const numberArrayMapMapValue = numberArrayMapValue === undefined || numberArrayMapValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(numberArrayMapValue as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableArray.from(k as Iterable<unknown>), v]));
    if (!((numberArrayMapMapValue as object instanceof ImmutableMap || numberArrayMapMapValue as object instanceof Map) && [...(numberArrayMapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey as object instanceof ImmutableArray || Array.isArray(mapKey)) && [...(mapKey as Iterable<unknown>)].every(element => typeof element === "number") && typeof mapValue === "string"))) throw new Error("Invalid value for property \"numberArrayMap\".");
    props.numberArrayMap = numberArrayMapMapValue as Map<number[], string> | Iterable<[number[], string]>;
    const optionalArrayMapValue = entries["optionalArrayMap"];
    const optionalArrayMapNormalized = optionalArrayMapValue === null ? undefined : optionalArrayMapValue;
    const optionalArrayMapMapValue = optionalArrayMapNormalized === undefined || optionalArrayMapNormalized === null ? optionalArrayMapNormalized : new ImmutableMap(Array.from(optionalArrayMapNormalized as Iterable<[unknown, unknown]>).map(([k, v]) => [ImmutableArray.from(k as Iterable<unknown>), ImmutableDate.from(v as Date)]));
    if (optionalArrayMapMapValue !== undefined && !((optionalArrayMapMapValue as object instanceof ImmutableMap || optionalArrayMapMapValue as object instanceof Map) && [...(optionalArrayMapMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (mapKey as object instanceof ImmutableArray || Array.isArray(mapKey)) && [...(mapKey as Iterable<unknown>)].every(element => typeof element === "boolean") && (mapValue as object instanceof Date || mapValue as object instanceof ImmutableDate)))) throw new Error("Invalid value for property \"optionalArrayMap\".");
    props.optionalArrayMap = optionalArrayMapMapValue as Map<boolean[], Date> | Iterable<[boolean[], Date]>;
    return props as MapArrayKey.Data;
  }
  static from(value: MapArrayKey.Value): MapArrayKey {
    return value instanceof MapArrayKey ? value : new MapArrayKey(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "arrayValues":
        return new (this.constructor as typeof MapArrayKey)({
          arrayValues: child as ImmutableMap<ImmutableArray<string>, number>,
          numberArrayMap: this.#numberArrayMap,
          optionalArrayMap: this.#optionalArrayMap
        } as unknown as MapArrayKey.Value) as this;
      case "numberArrayMap":
        return new (this.constructor as typeof MapArrayKey)({
          arrayValues: this.#arrayValues,
          numberArrayMap: child as ImmutableMap<ImmutableArray<number>, string>,
          optionalArrayMap: this.#optionalArrayMap
        } as unknown as MapArrayKey.Value) as this;
      case "optionalArrayMap":
        return new (this.constructor as typeof MapArrayKey)({
          arrayValues: this.#arrayValues,
          numberArrayMap: this.#numberArrayMap,
          optionalArrayMap: child as ImmutableMap<ImmutableArray<boolean>, ImmutableDate>
        } as unknown as MapArrayKey.Value) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["arrayValues", this.#arrayValues] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["numberArrayMap", this.#numberArrayMap] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["optionalArrayMap", this.#optionalArrayMap] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof MapArrayKey>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get arrayValues(): ImmutableMap<ImmutableArray<string>, number> {
    return this.#arrayValues;
  }
  get numberArrayMap(): ImmutableMap<ImmutableArray<number>, string> {
    return this.#numberArrayMap;
  }
  get optionalArrayMap(): ImmutableMap<ImmutableArray<boolean>, ImmutableDate> | undefined {
    return this.#optionalArrayMap;
  }
  clearArrayValues() {
    const arrayValuesCurrent = this.arrayValues;
    if (arrayValuesCurrent === undefined || arrayValuesCurrent.size === 0) return this;
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    arrayValuesMapNext.clear();
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: arrayValuesMapNext as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  clearNumberArrayMap() {
    const numberArrayMapCurrent = this.numberArrayMap;
    if (numberArrayMapCurrent === undefined || numberArrayMapCurrent.size === 0) return this;
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    numberArrayMapMapNext.clear();
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: numberArrayMapMapNext as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  clearOptionalArrayMap() {
    const optionalArrayMapCurrent = this.optionalArrayMap;
    if (optionalArrayMapCurrent === undefined || optionalArrayMapCurrent.size === 0) return this;
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    optionalArrayMapMapNext.clear();
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: optionalArrayMapMapNext as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  deleteArrayValue(key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>) {
    const arrayValuesCurrent = this.arrayValues;
    const k = ImmutableArray.from(key);
    if (!arrayValuesCurrent?.has(k)) return this;
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    arrayValuesMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: arrayValuesMapNext as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  deleteNumberArrayMapEntry(key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>) {
    const numberArrayMapCurrent = this.numberArrayMap;
    const k = ImmutableArray.from(key);
    if (!numberArrayMapCurrent?.has(k)) return this;
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    numberArrayMapMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: numberArrayMapMapNext as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  deleteOptionalArrayMapEntry(key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>) {
    const optionalArrayMapCurrent = this.optionalArrayMap;
    const k = ImmutableArray.from(key);
    if (!optionalArrayMapCurrent?.has(k)) return this;
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    optionalArrayMapMapNext.delete(k);
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: optionalArrayMapMapNext as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  filterArrayValues(predicate: (value: number, key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>) => boolean) {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    for (const [entryKey, entryValue] of arrayValuesMapNext) {
      if (!predicate(entryValue, entryKey)) arrayValuesMapNext.delete(entryKey);
    }
    if (this.arrayValues === arrayValuesMapNext as unknown || this.arrayValues?.equals(arrayValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: arrayValuesMapNext as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  filterNumberArrayMapEntries(predicate: (value: string, key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>) => boolean) {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    for (const [entryKey, entryValue] of numberArrayMapMapNext) {
      if (!predicate(entryValue, entryKey)) numberArrayMapMapNext.delete(entryKey);
    }
    if (this.numberArrayMap === numberArrayMapMapNext as unknown || this.numberArrayMap?.equals(numberArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: numberArrayMapMapNext as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  filterOptionalArrayMapEntries(predicate: (value: ImmutableDate | Date, key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>) => boolean) {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    for (const [entryKey, entryValue] of optionalArrayMapMapNext) {
      if (!predicate(entryValue, entryKey)) optionalArrayMapMapNext.delete(entryKey);
    }
    if (this.optionalArrayMap === optionalArrayMapMapNext as unknown || this.optionalArrayMap?.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: optionalArrayMapMapNext as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  mapArrayValues(mapper: (value: number, key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>) => [ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number]) {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    const arrayValuesMappedEntries: [ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number][] = [];
    for (const [entryKey, entryValue] of arrayValuesMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      arrayValuesMappedEntries.push(mappedEntry);
    }
    arrayValuesMapNext.clear();
    for (const [newKey, newValue] of arrayValuesMappedEntries) {
      arrayValuesMapNext.set(ImmutableArray.from(newKey), newValue);
    }
    if (this.arrayValues === arrayValuesMapNext as unknown || this.arrayValues?.equals(arrayValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: arrayValuesMapNext as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  mapNumberArrayMapEntries(mapper: (value: string, key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>) => [ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string]) {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    const numberArrayMapMappedEntries: [ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string][] = [];
    for (const [entryKey, entryValue] of numberArrayMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      numberArrayMapMappedEntries.push(mappedEntry);
    }
    numberArrayMapMapNext.clear();
    for (const [newKey, newValue] of numberArrayMapMappedEntries) {
      numberArrayMapMapNext.set(ImmutableArray.from(newKey), newValue);
    }
    if (this.numberArrayMap === numberArrayMapMapNext as unknown || this.numberArrayMap?.equals(numberArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: numberArrayMapMapNext as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  mapOptionalArrayMapEntries(mapper: (value: ImmutableDate | Date, key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>) => [ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date]) {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    const optionalArrayMapMappedEntries: [ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date][] = [];
    for (const [entryKey, entryValue] of optionalArrayMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      optionalArrayMapMappedEntries.push(mappedEntry);
    }
    optionalArrayMapMapNext.clear();
    for (const [newKey, newValue] of optionalArrayMapMappedEntries) {
      optionalArrayMapMapNext.set(ImmutableArray.from(newKey), ImmutableDate.from(newValue));
    }
    if (this.optionalArrayMap === optionalArrayMapMapNext as unknown || this.optionalArrayMap?.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: optionalArrayMapMapNext as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  mergeArrayValues(entries: ImmutableMap<ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number> | ReadonlyMap<ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number> | Iterable<[ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, number]>) {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      arrayValuesMapNext.set(ImmutableArray.from(mergeKey), mergeValue);
    }
    if (this.arrayValues === arrayValuesMapNext as unknown || this.arrayValues?.equals(arrayValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: arrayValuesMapNext as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  mergeNumberArrayMapEntries(entries: ImmutableMap<ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string> | ReadonlyMap<ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string> | Iterable<[ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, string]>) {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      numberArrayMapMapNext.set(ImmutableArray.from(mergeKey), mergeValue);
    }
    if (this.numberArrayMap === numberArrayMapMapNext as unknown || this.numberArrayMap?.equals(numberArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: numberArrayMapMapNext as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  mergeOptionalArrayMapEntries(entries: ImmutableMap<ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date> | ReadonlyMap<ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date> | Iterable<[ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, ImmutableDate | Date]>) {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      optionalArrayMapMapNext.set(ImmutableArray.from(mergeKey), ImmutableDate.from(mergeValue));
    }
    if (this.optionalArrayMap === optionalArrayMapMapNext as unknown || this.optionalArrayMap?.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: optionalArrayMapMapNext as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  set(updates: Partial<SetUpdates<MapArrayKey.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapArrayKey)(data) as this);
  }
  setArrayValue(key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, value: number) {
    const arrayValuesCurrent = this.arrayValues;
    const k = ImmutableArray.from(key);
    if (arrayValuesCurrent?.has(k)) {
      const existing = arrayValuesCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    arrayValuesMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: arrayValuesMapNext as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  setArrayValues(value: Map<string[], number> | Iterable<[string[], number]>) {
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: (value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [ImmutableArray.from(k), v]))) as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    }) as this);
  }
  setNumberArrayMap(value: Map<number[], string> | Iterable<[number[], string]>) {
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: (value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [ImmutableArray.from(k), v]))) as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    }) as this);
  }
  setNumberArrayMapEntry(key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, value: string) {
    const numberArrayMapCurrent = this.numberArrayMap;
    const k = ImmutableArray.from(key);
    if (numberArrayMapCurrent?.has(k)) {
      const existing = numberArrayMapCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    numberArrayMapMapNext.set(k, value);
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: numberArrayMapMapNext as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  setOptionalArrayMap(value: Map<boolean[], Date> | Iterable<[boolean[], Date]> | undefined) {
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: (value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [ImmutableArray.from(k), ImmutableDate.from(v)]))) as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    }) as this);
  }
  setOptionalArrayMapEntry(key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, value: ImmutableDate | Date) {
    const optionalArrayMapCurrent = this.optionalArrayMap;
    const k = ImmutableArray.from(key);
    if (optionalArrayMapCurrent?.has(k)) {
      const existing = optionalArrayMapCurrent.get(k);
      if (equals(existing, value)) return this;
    }
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    optionalArrayMapMapNext.set(k, ImmutableDate.from(value));
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: optionalArrayMapMapNext as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  unsetOptionalArrayMap() {
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>
    }) as this);
  }
  updateArrayValue(key: ImmutableArray<string> | ReadonlyArray<string> | Iterable<string>, updater: (currentValue: number | undefined) => number) {
    const arrayValuesMapSource = this.#arrayValues;
    const arrayValuesMapEntries = [...arrayValuesMapSource.entries()];
    const arrayValuesMapNext = new Map(arrayValuesMapEntries);
    const k = ImmutableArray.from(key);
    const currentValue = arrayValuesMapNext.get(k);
    const updatedValue = updater(currentValue);
    arrayValuesMapNext.set(k, updatedValue);
    if (this.arrayValues === arrayValuesMapNext as unknown || this.arrayValues?.equals(arrayValuesMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: arrayValuesMapNext as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  updateNumberArrayMapEntry(key: ImmutableArray<number> | ReadonlyArray<number> | Iterable<number>, updater: (currentValue: string | undefined) => string) {
    const numberArrayMapMapSource = this.#numberArrayMap;
    const numberArrayMapMapEntries = [...numberArrayMapMapSource.entries()];
    const numberArrayMapMapNext = new Map(numberArrayMapMapEntries);
    const k = ImmutableArray.from(key);
    const currentValue = numberArrayMapMapNext.get(k);
    const updatedValue = updater(currentValue);
    numberArrayMapMapNext.set(k, updatedValue);
    if (this.numberArrayMap === numberArrayMapMapNext as unknown || this.numberArrayMap?.equals(numberArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: numberArrayMapMapNext as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: this.#optionalArrayMap as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
  updateOptionalArrayMapEntry(key: ImmutableArray<boolean> | ReadonlyArray<boolean> | Iterable<boolean>, updater: (currentValue: ImmutableDate | Date | undefined) => ImmutableDate | Date) {
    const optionalArrayMapMapSource = this.#optionalArrayMap;
    const optionalArrayMapMapEntries = optionalArrayMapMapSource === undefined ? [] : [...optionalArrayMapMapSource.entries()];
    const optionalArrayMapMapNext = new Map(optionalArrayMapMapEntries);
    const k = ImmutableArray.from(key);
    const currentValue = optionalArrayMapMapNext.get(k);
    const updatedValue = updater(currentValue);
    optionalArrayMapMapNext.set(k, ImmutableDate.from(updatedValue));
    if (this.optionalArrayMap === optionalArrayMapMapNext as unknown || this.optionalArrayMap?.equals(optionalArrayMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapArrayKey)({
      arrayValues: this.#arrayValues as Map<string[], number> | Iterable<[string[], number]>,
      numberArrayMap: this.#numberArrayMap as Map<number[], string> | Iterable<[number[], string]>,
      optionalArrayMap: optionalArrayMapMapNext as Map<boolean[], Date> | Iterable<[boolean[], Date]>
    } as unknown as MapArrayKey.Value) as this);
  }
}
export namespace MapArrayKey {
  export type Data = {
    arrayValues: Map<string[], number> | Iterable<[string[], number]>;
    numberArrayMap: Map<number[], string> | Iterable<[number[], string]>;
    optionalArrayMap?: Map<boolean[], Date> | Iterable<[boolean[], Date]> | undefined;
  };
  export type Value = MapArrayKey | MapArrayKey.Data;
}
