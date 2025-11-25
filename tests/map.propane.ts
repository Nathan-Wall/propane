/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map.propane
import { Message, MessagePropDescriptor, ImmutableMap, equals } from "@propanejs/runtime";
export class MapMessage_Metadata_Value extends Message<MapMessage_Metadata_Value.Data> {
  static TYPE_TAG = Symbol("MapMessage_Metadata_Value");
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
  setValue(value: string): MapMessage_Metadata_Value {
    return new MapMessage_Metadata_Value({
      value: value
    });
  }
}
export namespace MapMessage_Metadata_Value {
  export interface Data {
    value: string;
  }
  export type Value = MapMessage_Metadata_Value | MapMessage_Metadata_Value.Data;
}
export class MapMessage_Extras_Value extends Message<MapMessage_Extras_Value.Data> {
  static TYPE_TAG = Symbol("MapMessage_Extras_Value");
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
  setNote(value: string | null): MapMessage_Extras_Value {
    return new MapMessage_Extras_Value({
      note: value
    });
  }
}
export namespace MapMessage_Extras_Value {
  export interface Data {
    note: string | null;
  }
  export type Value = MapMessage_Extras_Value | MapMessage_Extras_Value.Data;
}
export class MapMessage extends Message<MapMessage.Data> {
  static TYPE_TAG = Symbol("MapMessage");
  static EMPTY: MapMessage;
  #labels: ImmutableMap<string | number, number>;
  #metadata: ImmutableMap<string, MapMessage_Metadata_Value> | undefined;
  #extras: ImmutableMap<string, MapMessage_Extras_Value>;
  constructor(props?: MapMessage.Value) {
    if (!props && MapMessage.EMPTY) return MapMessage.EMPTY;
    super(MapMessage.TYPE_TAG, "MapMessage");
    this.#labels = props ? props.labels === undefined || props.labels === null ? props.labels : props.labels instanceof ImmutableMap || Object.prototype.toString.call(props.labels) === "[object ImmutableMap]" ? props.labels : new ImmutableMap(props.labels) : new Map();
    this.#metadata = props ? props.metadata === undefined || props.metadata === null ? props.metadata : new ImmutableMap(Array.from(props.metadata).map(([k, v]) => [k, v instanceof MapMessage_Metadata_Value ? v : new MapMessage_Metadata_Value(v)])) : undefined;
    this.#extras = props ? props.extras === undefined || props.extras === null ? props.extras : new ImmutableMap(Array.from(props.extras).map(([k, v]) => [k, v instanceof MapMessage_Extras_Value ? v : new MapMessage_Extras_Value(v)])) : new Map();
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
    const labelsMapValue = labelsValue === undefined || labelsValue === null ? labelsValue : labelsValue instanceof ImmutableMap || Object.prototype.toString.call(labelsValue) === "[object ImmutableMap]" ? labelsValue : new ImmutableMap(labelsValue);
    if (!((labelsMapValue instanceof ImmutableMap || Object.prototype.toString.call(labelsMapValue) === "[object ImmutableMap]" || labelsMapValue instanceof Map || Object.prototype.toString.call(labelsMapValue) === "[object Map]") && [...labelsMapValue.entries()].every(([mapKey, mapValue]) => (typeof mapKey === "string" || typeof mapKey === "number") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"labels\".");
    props.labels = labelsMapValue;
    const metadataValue = entries["2"] === undefined ? entries["metadata"] : entries["2"];
    const metadataNormalized = metadataValue === null ? undefined : metadataValue;
    const metadataMapValue = metadataNormalized === undefined || metadataNormalized === null ? metadataNormalized : new ImmutableMap(Array.from(metadataNormalized).map(([k, v]) => [k, v instanceof MapMessage_Metadata_Value ? v : new MapMessage_Metadata_Value(v)]));
    if (metadataMapValue !== undefined && !((metadataMapValue instanceof ImmutableMap || Object.prototype.toString.call(metadataMapValue) === "[object ImmutableMap]" || metadataMapValue instanceof Map || Object.prototype.toString.call(metadataMapValue) === "[object Map]") && [...metadataMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string"))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataMapValue;
    const extrasValue = entries["3"] === undefined ? entries["extras"] : entries["3"];
    if (extrasValue === undefined) throw new Error("Missing required property \"extras\".");
    const extrasMapValue = extrasValue === undefined || extrasValue === null ? extrasValue : new ImmutableMap(Array.from(extrasValue).map(([k, v]) => [k, v instanceof MapMessage_Extras_Value ? v : new MapMessage_Extras_Value(v)]));
    if (!((extrasMapValue instanceof ImmutableMap || Object.prototype.toString.call(extrasMapValue) === "[object ImmutableMap]" || extrasMapValue instanceof Map || Object.prototype.toString.call(extrasMapValue) === "[object Map]") && [...extrasMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string"))) throw new Error("Invalid value for property \"extras\".");
    props.extras = extrasMapValue;
    return props as MapMessage.Data;
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
  clearExtras(): MapMessage {
    const extrasCurrent = this.extras;
    if (extrasCurrent === undefined || extrasCurrent.size === 0) return this;
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    extrasMapNext.clear();
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  clearLabels(): MapMessage {
    const labelsCurrent = this.labels;
    if (labelsCurrent === undefined || labelsCurrent.size === 0) return this;
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    labelsMapNext.clear();
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  clearMetadata(): MapMessage {
    const metadataCurrent = this.metadata;
    if (metadataCurrent === undefined || metadataCurrent.size === 0) return this;
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.clear();
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  deleteExtrasEntry(key: string): MapMessage {
    const extrasCurrent = this.extras;
    if (extrasCurrent === undefined || !extrasCurrent.has(key)) return this;
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    extrasMapNext.delete(key);
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  deleteLabelsEntry(key: string | number): MapMessage {
    const labelsCurrent = this.labels;
    if (labelsCurrent === undefined || !labelsCurrent.has(key)) return this;
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    labelsMapNext.delete(key);
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  deleteMetadata(): MapMessage {
    return new MapMessage({
      labels: this.#labels,
      extras: this.#extras
    });
  }
  deleteMetadataEntry(key: string): MapMessage {
    const metadataCurrent = this.metadata;
    if (metadataCurrent === undefined || !metadataCurrent.has(key)) return this;
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.delete(key);
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  filterExtrasEntries(predicate: (value: MapMessage_Extras_Value, key: string) => boolean): MapMessage {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    for (const [entryKey, entryValue] of extrasMapNext) {
      if (!predicate(entryValue, entryKey)) extrasMapNext.delete(entryKey);
    }
    if (this.extras === extrasMapNext || this.extras !== undefined && this.extras.equals(extrasMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  filterLabelsEntries(predicate: (value: number, key: string | number) => boolean): MapMessage {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    for (const [entryKey, entryValue] of labelsMapNext) {
      if (!predicate(entryValue, entryKey)) labelsMapNext.delete(entryKey);
    }
    if (this.labels === labelsMapNext || this.labels !== undefined && this.labels.equals(labelsMapNext)) return this;
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  filterMetadataEntries(predicate: (value: MapMessage_Metadata_Value, key: string) => boolean): MapMessage {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    for (const [entryKey, entryValue] of metadataMapNext) {
      if (!predicate(entryValue, entryKey)) metadataMapNext.delete(entryKey);
    }
    if (this.metadata === metadataMapNext || this.metadata !== undefined && this.metadata.equals(metadataMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  mapExtrasEntries(mapper: (value: MapMessage_Extras_Value, key: string) => [string, MapMessage_Extras_Value]): MapMessage {
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
    if (this.extras === extrasMapNext || this.extras !== undefined && this.extras.equals(extrasMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  mapLabelsEntries(mapper: (value: number, key: string | number) => [string | number, number]): MapMessage {
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
    if (this.labels === labelsMapNext || this.labels !== undefined && this.labels.equals(labelsMapNext)) return this;
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  mapMetadataEntries(mapper: (value: MapMessage_Metadata_Value, key: string) => [string, MapMessage_Metadata_Value]): MapMessage {
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
    if (this.metadata === metadataMapNext || this.metadata !== undefined && this.metadata.equals(metadataMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  mergeExtrasEntries(entries: Iterable<[string, MapMessage_Extras_Value]> | ImmutableMap<string, MapMessage_Extras_Value> | ReadonlyMap<string, MapMessage_Extras_Value> | Iterable<[string, MapMessage_Extras_Value]>): MapMessage {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      extrasMapNext.set(mergeKey, mergeValue);
    }
    if (this.extras === extrasMapNext || this.extras !== undefined && this.extras.equals(extrasMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  mergeLabelsEntries(entries: Iterable<[string | number, number]> | ImmutableMap<string | number, number> | ReadonlyMap<string | number, number> | Iterable<[string | number, number]>): MapMessage {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      labelsMapNext.set(mergeKey, mergeValue);
    }
    if (this.labels === labelsMapNext || this.labels !== undefined && this.labels.equals(labelsMapNext)) return this;
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  mergeMetadataEntries(entries: Iterable<[string, MapMessage_Metadata_Value]> | ImmutableMap<string, MapMessage_Metadata_Value> | ReadonlyMap<string, MapMessage_Metadata_Value> | Iterable<[string, MapMessage_Metadata_Value]>): MapMessage {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      metadataMapNext.set(mergeKey, mergeValue);
    }
    if (this.metadata === metadataMapNext || this.metadata !== undefined && this.metadata.equals(metadataMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  setExtras(value: Map<string, MapMessage_Extras_Value> | Iterable<[string, MapMessage_Extras_Value]>): MapMessage {
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k, v instanceof MapMessage_Extras_Value ? v : new MapMessage_Extras_Value(v)]))
    });
  }
  setExtrasEntry(key: string, value: MapMessage_Extras_Value): MapMessage {
    const extrasCurrent = this.extras;
    if (extrasCurrent && extrasCurrent.has(key)) {
      const existing = extrasCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    extrasMapNext.set(key, value);
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  setLabels(value: Map<string | number, number> | Iterable<[string | number, number]>): MapMessage {
    return new MapMessage({
      labels: value === undefined || value === null ? value : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : new ImmutableMap(value),
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  setLabelsEntry(key: string | number, value: number): MapMessage {
    const labelsCurrent = this.labels;
    if (labelsCurrent && labelsCurrent.has(key)) {
      const existing = labelsCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    labelsMapNext.set(key, value);
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  setMetadata(value: Map<string, MapMessage_Metadata_Value> | Iterable<[string, MapMessage_Metadata_Value]>): MapMessage {
    return new MapMessage({
      labels: this.#labels,
      metadata: value === undefined || value === null ? value : new ImmutableMap(Array.from(value).map(([k, v]) => [k, v instanceof MapMessage_Metadata_Value ? v : new MapMessage_Metadata_Value(v)])),
      extras: this.#extras
    });
  }
  setMetadataEntry(key: string, value: MapMessage_Metadata_Value): MapMessage {
    const metadataCurrent = this.metadata;
    if (metadataCurrent && metadataCurrent.has(key)) {
      const existing = metadataCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.set(key, value);
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  updateExtrasEntry(key: string, updater: (currentValue: MapMessage_Extras_Value | undefined) => MapMessage_Extras_Value): MapMessage {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = [...extrasMapSource.entries()];
    const extrasMapNext = new Map(extrasMapEntries);
    const currentValue = extrasMapNext.get(key);
    const updatedValue = updater(currentValue);
    extrasMapNext.set(key, updatedValue);
    if (this.extras === extrasMapNext || this.extras !== undefined && this.extras.equals(extrasMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  updateLabelsEntry(key: string | number, updater: (currentValue: number | undefined) => number): MapMessage {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = [...labelsMapSource.entries()];
    const labelsMapNext = new Map(labelsMapEntries);
    const currentValue = labelsMapNext.get(key);
    const updatedValue = updater(currentValue);
    labelsMapNext.set(key, updatedValue);
    if (this.labels === labelsMapNext || this.labels !== undefined && this.labels.equals(labelsMapNext)) return this;
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  updateMetadataEntry(key: string, updater: (currentValue: MapMessage_Metadata_Value | undefined) => MapMessage_Metadata_Value): MapMessage {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : [...metadataMapSource.entries()];
    const metadataMapNext = new Map(metadataMapEntries);
    const currentValue = metadataMapNext.get(key);
    const updatedValue = updater(currentValue);
    metadataMapNext.set(key, updatedValue);
    if (this.metadata === metadataMapNext || this.metadata !== undefined && this.metadata.equals(metadataMapNext)) return this;
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
}
export namespace MapMessage {
  export interface Data {
    labels: Map<string | number, number> | Iterable<[string | number, number]>;
    metadata?: Map<string, MapMessage_Metadata_Value> | Iterable<[string, MapMessage_Metadata_Value]> | undefined;
    extras: Map<string, MapMessage_Extras_Value> | Iterable<[string, MapMessage_Extras_Value]>;
  }
  export type Value = MapMessage | MapMessage.Data;
  export import Metadata_Value = MapMessage_Metadata_Value;
  export import Extras_Value = MapMessage_Extras_Value;
}