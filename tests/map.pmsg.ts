/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, SetUpdates } from "../runtime/index.js";
export class MapMessage_Metadata_Value extends Message<MapMessage_Metadata_Value.Data> {
  static TYPE_TAG = Symbol("MapMessage_Metadata_Value");
  static readonly $typeName = "MapMessage_Metadata_Value";
  static EMPTY: MapMessage_Metadata_Value;
  #value: string;
  constructor(props?: MapMessage_Metadata_Value.Value) {
    if (!props && MapMessage_Metadata_Value.EMPTY) return MapMessage_Metadata_Value.EMPTY;
    super(MapMessage_Metadata_Value.TYPE_TAG, "MapMessage_Metadata_Value");
    this.#value = props ? props.value : "";
    if (!props) MapMessage_Metadata_Value.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapMessage_Metadata_Value.Data>[] {
    return [{
      name: "value",
      fieldNumber: null,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapMessage_Metadata_Value.Data {
    const props = {} as Partial<MapMessage_Metadata_Value.Data>;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as MapMessage_Metadata_Value.Data;
  }
  get value(): string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<MapMessage_Metadata_Value.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapMessage_Metadata_Value)(data));
  }
  setValue(value: string) {
    return this.$update(new (this.constructor as typeof MapMessage_Metadata_Value)({
      value: value
    }));
  }
}
export namespace MapMessage_Metadata_Value {
  export type Data = {
    value: string;
  };
  export type Value = MapMessage_Metadata_Value | MapMessage_Metadata_Value.Data;
}
export class MapMessage_Extras_Value extends Message<MapMessage_Extras_Value.Data> {
  static TYPE_TAG = Symbol("MapMessage_Extras_Value");
  static readonly $typeName = "MapMessage_Extras_Value";
  static EMPTY: MapMessage_Extras_Value;
  #note: string | null;
  constructor(props?: MapMessage_Extras_Value.Value) {
    if (!props && MapMessage_Extras_Value.EMPTY) return MapMessage_Extras_Value.EMPTY;
    super(MapMessage_Extras_Value.TYPE_TAG, "MapMessage_Extras_Value");
    this.#note = props ? props.note : "";
    if (!props) MapMessage_Extras_Value.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapMessage_Extras_Value.Data>[] {
    return [{
      name: "note",
      fieldNumber: null,
      getValue: () => this.#note
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapMessage_Extras_Value.Data {
    const props = {} as Partial<MapMessage_Extras_Value.Data>;
    const noteValue = entries["note"];
    if (noteValue === undefined) throw new Error("Missing required property \"note\".");
    if (!(typeof noteValue === "string" || noteValue === null)) throw new Error("Invalid value for property \"note\".");
    props.note = noteValue;
    return props as MapMessage_Extras_Value.Data;
  }
  get note(): string | null {
    return this.#note;
  }
  set(updates: Partial<SetUpdates<MapMessage_Extras_Value.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapMessage_Extras_Value)(data));
  }
  setNote(value: string | null) {
    return this.$update(new (this.constructor as typeof MapMessage_Extras_Value)({
      note: value
    }));
  }
}
export namespace MapMessage_Extras_Value {
  export type Data = {
    note: string | null;
  };
  export type Value = MapMessage_Extras_Value | MapMessage_Extras_Value.Data;
}
export class MapMessage extends Message<MapMessage.Data> {
  static TYPE_TAG = Symbol("MapMessage");
  static readonly $typeName = "MapMessage";
  static EMPTY: MapMessage;
  #labels: ImmutableMap<string | number, number>;
  #metadata: ImmutableMap<string, MapMessage_Metadata_Value> | undefined;
  #extras: ImmutableMap<string, MapMessage_Extras_Value>;
  constructor(props?: MapMessage.Value) {
    if (!props && MapMessage.EMPTY) return MapMessage.EMPTY;
    super(MapMessage.TYPE_TAG, "MapMessage");
    this.#labels = props ? props.labels === undefined || props.labels === null ? new ImmutableMap() : props.labels instanceof ImmutableMap ? props.labels : new ImmutableMap(props.labels) : new ImmutableMap();
    this.#metadata = props ? props.metadata === undefined || props.metadata === null ? props.metadata : new ImmutableMap(Array.from(props.metadata).map(([k, v]) => [k, v instanceof MapMessage_Metadata_Value ? v : new MapMessage_Metadata_Value(v)])) : undefined;
    this.#extras = props ? props.extras === undefined || props.extras === null ? new ImmutableMap() : new ImmutableMap(Array.from(props.extras).map(([k, v]) => [k, v instanceof MapMessage_Extras_Value ? v : new MapMessage_Extras_Value(v)])) : new ImmutableMap();
    if (!props) MapMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<MapMessage.Data>[] {
    return [{
      name: "labels",
      fieldNumber: 1,
      getValue: () => this.#labels
    }, {
      name: "metadata",
      fieldNumber: 2,
      getValue: () => this.#metadata
    }, {
      name: "extras",
      fieldNumber: 3,
      getValue: () => this.#extras
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): MapMessage.Data {
    const props = {} as Partial<MapMessage.Data>;
    const labelsValue = entries["1"] === undefined ? entries["labels"] : entries["1"];
    if (labelsValue === undefined) throw new Error("Missing required property \"labels\".");
    const labelsMapValue = labelsValue === undefined || labelsValue === null ? new ImmutableMap() : labelsValue as object instanceof ImmutableMap ? labelsValue : new ImmutableMap(labelsValue as Iterable<[unknown, unknown]>);
    if (!((labelsMapValue instanceof ImmutableMap || labelsMapValue instanceof Map) && [...(labelsMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => (typeof mapKey === "string" || typeof mapKey === "number") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"labels\".");
    props.labels = labelsMapValue as ImmutableMap<string | number, number>;
    const metadataValue = entries["2"] === undefined ? entries["metadata"] : entries["2"];
    const metadataNormalized = metadataValue === null ? undefined : metadataValue;
    const metadataMapValue = metadataNormalized === undefined || metadataNormalized === null ? metadataNormalized : new ImmutableMap(Array.from(metadataNormalized as Iterable<[unknown, unknown]>).map(([k, v]) => [k, v instanceof MapMessage_Metadata_Value ? v : new MapMessage_Metadata_Value(v)]));
    if (metadataMapValue !== undefined && !((metadataMapValue instanceof ImmutableMap || metadataMapValue instanceof Map) && [...(metadataMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string"))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataMapValue as ImmutableMap<string, MapMessage_Metadata_Value>;
    const extrasValue = entries["3"] === undefined ? entries["extras"] : entries["3"];
    if (extrasValue === undefined) throw new Error("Missing required property \"extras\".");
    const extrasMapValue = extrasValue === undefined || extrasValue === null ? new ImmutableMap() : new ImmutableMap(Array.from(extrasValue as Iterable<[unknown, unknown]>).map(([k, v]) => [k, v instanceof MapMessage_Extras_Value ? v : new MapMessage_Extras_Value(v)]));
    if (!((extrasMapValue instanceof ImmutableMap || extrasMapValue instanceof Map) && [...(extrasMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string"))) throw new Error("Invalid value for property \"extras\".");
    props.extras = extrasMapValue as ImmutableMap<string, MapMessage_Extras_Value>;
    return props as MapMessage.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): MapMessage {
    switch (key) {
      case "labels":
        return new (this.constructor as typeof MapMessage)({
          labels: child as ImmutableMap<string | number, number>,
          metadata: this.#metadata,
          extras: this.#extras
        });
      case "metadata":
        return new (this.constructor as typeof MapMessage)({
          labels: this.#labels,
          metadata: child as ImmutableMap<string, MapMessage_Metadata_Value>,
          extras: this.#extras
        });
      case "extras":
        return new (this.constructor as typeof MapMessage)({
          labels: this.#labels,
          metadata: this.#metadata,
          extras: child as ImmutableMap<string, MapMessage_Extras_Value>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["labels", this.#labels] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["metadata", this.#metadata] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["extras", this.#extras] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get labels(): ImmutableMap<string | number, number> {
    return this.#labels;
  }
  get metadata(): ImmutableMap<string, MapMessage_Metadata_Value> | undefined {
    return this.#metadata;
  }
  get extras(): ImmutableMap<string, MapMessage_Extras_Value> {
    return this.#extras;
  }
  clearExtras() {
    const extrasCurrent = this.extras;
    if (extrasCurrent === undefined || extrasCurrent.size === 0) return this;
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    extrasMapNext.clear();
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    }));
  }
  clearLabels() {
    const labelsCurrent = this.labels;
    if (labelsCurrent === undefined || labelsCurrent.size === 0) return this;
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    labelsMapNext.clear();
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  clearMetadata() {
    const metadataCurrent = this.metadata;
    if (metadataCurrent === undefined || metadataCurrent.size === 0) return this;
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.clear();
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    }));
  }
  deleteExtrasEntry(key: string) {
    const extrasCurrent = this.extras;
    if (!extrasCurrent?.has(key)) return this;
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    extrasMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    }));
  }
  deleteLabelsEntry(key: string | number) {
    const labelsCurrent = this.labels;
    if (!labelsCurrent?.has(key)) return this;
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    labelsMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  deleteMetadata() {
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      extras: this.#extras
    }));
  }
  deleteMetadataEntry(key: string) {
    const metadataCurrent = this.metadata;
    if (!metadataCurrent?.has(key)) return this;
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.delete(key);
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    }));
  }
  filterExtrasEntries(predicate: (value: MapMessage_Extras_Value, key: string) => boolean) {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    for (const [entryKey, entryValue] of extrasMapNext) {
      if (!predicate(entryValue, entryKey)) extrasMapNext.delete(entryKey);
    }
    if (this.extras === extrasMapNext as unknown || this.extras?.equals(extrasMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    }));
  }
  filterLabelsEntries(predicate: (value: number, key: string | number) => boolean) {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    for (const [entryKey, entryValue] of labelsMapNext) {
      if (!predicate(entryValue, entryKey)) labelsMapNext.delete(entryKey);
    }
    if (this.labels === labelsMapNext as unknown || this.labels?.equals(labelsMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  filterMetadataEntries(predicate: (value: MapMessage_Metadata_Value, key: string) => boolean) {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    for (const [entryKey, entryValue] of metadataMapNext) {
      if (!predicate(entryValue, entryKey)) metadataMapNext.delete(entryKey);
    }
    if (this.metadata === metadataMapNext as unknown || this.metadata?.equals(metadataMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    }));
  }
  mapExtrasEntries(mapper: (value: MapMessage_Extras_Value, key: string) => [string, MapMessage_Extras_Value]) {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    const extrasMappedEntries = [];
    for (const [entryKey, entryValue] of extrasMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      extrasMappedEntries.push(mappedEntry);
    }
    extrasMapNext.clear();
    for (const [newKey, newValue] of extrasMappedEntries) {
      extrasMapNext.set(newKey, newValue);
    }
    if (this.extras === extrasMapNext as unknown || this.extras?.equals(extrasMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    }));
  }
  mapLabelsEntries(mapper: (value: number, key: string | number) => [string | number, number]) {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    const labelsMappedEntries = [];
    for (const [entryKey, entryValue] of labelsMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      labelsMappedEntries.push(mappedEntry);
    }
    labelsMapNext.clear();
    for (const [newKey, newValue] of labelsMappedEntries) {
      labelsMapNext.set(newKey, newValue);
    }
    if (this.labels === labelsMapNext as unknown || this.labels?.equals(labelsMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  mapMetadataEntries(mapper: (value: MapMessage_Metadata_Value, key: string) => [string, MapMessage_Metadata_Value]) {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    const metadataMappedEntries = [];
    for (const [entryKey, entryValue] of metadataMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      metadataMappedEntries.push(mappedEntry);
    }
    metadataMapNext.clear();
    for (const [newKey, newValue] of metadataMappedEntries) {
      metadataMapNext.set(newKey, newValue);
    }
    if (this.metadata === metadataMapNext as unknown || this.metadata?.equals(metadataMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    }));
  }
  mergeExtrasEntries(entries: ImmutableMap<string, MapMessage_Extras_Value> | ReadonlyMap<string, MapMessage_Extras_Value> | Iterable<[string, MapMessage_Extras_Value]>) {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      extrasMapNext.set(mergeKey, mergeValue);
    }
    if (this.extras === extrasMapNext as unknown || this.extras?.equals(extrasMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    }));
  }
  mergeLabelsEntries(entries: ImmutableMap<string | number, number> | ReadonlyMap<string | number, number> | Iterable<[string | number, number]>) {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      labelsMapNext.set(mergeKey, mergeValue);
    }
    if (this.labels === labelsMapNext as unknown || this.labels?.equals(labelsMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  mergeMetadataEntries(entries: ImmutableMap<string, MapMessage_Metadata_Value> | ReadonlyMap<string, MapMessage_Metadata_Value> | Iterable<[string, MapMessage_Metadata_Value]>) {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      metadataMapNext.set(mergeKey, mergeValue);
    }
    if (this.metadata === metadataMapNext as unknown || this.metadata?.equals(metadataMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    }));
  }
  set(updates: Partial<SetUpdates<MapMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof MapMessage)(data));
  }
  setExtras(value: Map<string, MapMessage_Extras_Value> | Iterable<[string, MapMessage_Extras_Value]>) {
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: value === undefined || value === null ? new ImmutableMap() : new ImmutableMap(Array.from(value).map(([k, v]) => [k, v instanceof MapMessage_Extras_Value ? v : new MapMessage_Extras_Value(v)]))
    }));
  }
  setExtrasEntry(key: string, value: MapMessage_Extras_Value) {
    const extrasCurrent = this.extras;
    if (extrasCurrent?.has(key)) {
      const existing = extrasCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    extrasMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    }));
  }
  setLabels(value: Map<string | number, number> | Iterable<[string | number, number]>) {
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: value === undefined || value === null ? new ImmutableMap() : value instanceof ImmutableMap ? value : new ImmutableMap(value),
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  setLabelsEntry(key: string | number, value: number) {
    const labelsCurrent = this.labels;
    if (labelsCurrent?.has(key)) {
      const existing = labelsCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    labelsMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  setMetadata(value: Map<string, MapMessage_Metadata_Value> | Iterable<[string, MapMessage_Metadata_Value]>) {
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k, v instanceof MapMessage_Metadata_Value ? v : new MapMessage_Metadata_Value(v)])),
      extras: this.#extras
    }));
  }
  setMetadataEntry(key: string, value: MapMessage_Metadata_Value) {
    const metadataCurrent = this.metadata;
    if (metadataCurrent?.has(key)) {
      const existing = metadataCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    }));
  }
  updateExtrasEntry(key: string, updater: (currentValue: MapMessage_Extras_Value | undefined) => MapMessage_Extras_Value) {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    const currentValue = extrasMapNext.get(key);
    const updatedValue = updater(currentValue);
    extrasMapNext.set(key, updatedValue);
    if (this.extras === extrasMapNext as unknown || this.extras?.equals(extrasMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    }));
  }
  updateLabelsEntry(key: string | number, updater: (currentValue: number | undefined) => number) {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    const currentValue = labelsMapNext.get(key);
    const updatedValue = updater(currentValue);
    labelsMapNext.set(key, updatedValue);
    if (this.labels === labelsMapNext as unknown || this.labels?.equals(labelsMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    }));
  }
  updateMetadataEntry(key: string, updater: (currentValue: MapMessage_Metadata_Value | undefined) => MapMessage_Metadata_Value) {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    const currentValue = metadataMapNext.get(key);
    const updatedValue = updater(currentValue);
    metadataMapNext.set(key, updatedValue);
    if (this.metadata === metadataMapNext as unknown || this.metadata?.equals(metadataMapNext)) return this;
    return this.$update(new (this.constructor as typeof MapMessage)({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    }));
  }
}
export namespace MapMessage {
  export type Data = {
    labels: Map<string | number, number> | Iterable<[string | number, number]>;
    metadata?: Map<string, MapMessage_Metadata_Value> | Iterable<[string, MapMessage_Metadata_Value]> | undefined;
    extras: Map<string, MapMessage_Extras_Value> | Iterable<[string, MapMessage_Extras_Value]>;
  };
  export type Value = MapMessage | MapMessage.Data;
  export import Metadata_Value = MapMessage_Metadata_Value;
  export import Extras_Value = MapMessage_Extras_Value;
}
