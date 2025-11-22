/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/map.propane
import { Message, MessagePropDescriptor, ImmutableMap, equals } from "@propanejs/runtime";
export namespace MapMessage {
  export interface Data {
    labels: ReadonlyMap<string | number, number>;
    metadata?: ReadonlyMap<string, {
      value: string;
    }>;
    extras: ReadonlyMap<string, {
      note: string | null;
    }>;
  }
  export type Value = MapMessage | MapMessage.Data;
}
export class MapMessage extends Message<MapMessage.Data> {
  static TYPE_TAG = Symbol("MapMessage");
  static EMPTY: MapMessage;
  #labels: ReadonlyMap<string | number, number>;
  #metadata: ReadonlyMap<string, {
    value: string;
  }> | undefined;
  #extras: ReadonlyMap<string, {
    note: string | null;
  }>;
  constructor(props?: MapMessage.Value) {
    if (!props) {
      if (MapMessage.EMPTY) return MapMessage.EMPTY;
    }
    super(MapMessage.TYPE_TAG);
    this.#labels = props ? Array.isArray(props.labels) ? new ImmutableMap(props.labels) : props.labels instanceof ImmutableMap || Object.prototype.toString.call(props.labels) === "[object ImmutableMap]" ? props.labels : props.labels instanceof Map || Object.prototype.toString.call(props.labels) === "[object Map]" ? new ImmutableMap(props.labels) : props.labels : new Map();
    this.#metadata = props ? Array.isArray(props.metadata) ? new ImmutableMap(props.metadata) : props.metadata instanceof ImmutableMap || Object.prototype.toString.call(props.metadata) === "[object ImmutableMap]" ? props.metadata : props.metadata instanceof Map || Object.prototype.toString.call(props.metadata) === "[object Map]" ? new ImmutableMap(props.metadata) : props.metadata : undefined;
    this.#extras = props ? Array.isArray(props.extras) ? new ImmutableMap(props.extras) : props.extras instanceof ImmutableMap || Object.prototype.toString.call(props.extras) === "[object ImmutableMap]" ? props.extras : props.extras instanceof Map || Object.prototype.toString.call(props.extras) === "[object Map]" ? new ImmutableMap(props.extras) : props.extras : new Map();
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
    const labelsMapValue = Array.isArray(labelsValue) ? new ImmutableMap(labelsValue) : labelsValue instanceof ImmutableMap || Object.prototype.toString.call(labelsValue) === "[object ImmutableMap]" ? labelsValue : labelsValue instanceof Map || Object.prototype.toString.call(labelsValue) === "[object Map]" ? new ImmutableMap(labelsValue) : labelsValue;
    if (!((labelsMapValue instanceof ImmutableMap || Object.prototype.toString.call(labelsMapValue) === "[object ImmutableMap]" || labelsMapValue instanceof Map || Object.prototype.toString.call(labelsMapValue) === "[object Map]") && [...labelsMapValue.entries()].every(([mapKey, mapValue]) => (typeof mapKey === "string" || typeof mapKey === "number") && typeof mapValue === "number"))) throw new Error("Invalid value for property \"labels\".");
    props.labels = labelsMapValue;
    const metadataValue = entries["2"] === undefined ? entries["metadata"] : entries["2"];
    const metadataNormalized = metadataValue === null ? undefined : metadataValue;
    const metadataMapValue = Array.isArray(metadataNormalized) ? new ImmutableMap(metadataNormalized) : metadataNormalized instanceof ImmutableMap || Object.prototype.toString.call(metadataNormalized) === "[object ImmutableMap]" ? metadataNormalized : metadataNormalized instanceof Map || Object.prototype.toString.call(metadataNormalized) === "[object Map]" ? new ImmutableMap(metadataNormalized) : metadataNormalized;
    if (metadataMapValue !== undefined && !((metadataMapValue instanceof ImmutableMap || Object.prototype.toString.call(metadataMapValue) === "[object ImmutableMap]" || metadataMapValue instanceof Map || Object.prototype.toString.call(metadataMapValue) === "[object Map]") && [...metadataMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "object" && mapValue !== null && mapValue.value !== undefined && typeof mapValue.value === "string"))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataMapValue;
    const extrasValue = entries["3"] === undefined ? entries["extras"] : entries["3"];
    if (extrasValue === undefined) throw new Error("Missing required property \"extras\".");
    const extrasMapValue = Array.isArray(extrasValue) ? new ImmutableMap(extrasValue) : extrasValue instanceof ImmutableMap || Object.prototype.toString.call(extrasValue) === "[object ImmutableMap]" ? extrasValue : extrasValue instanceof Map || Object.prototype.toString.call(extrasValue) === "[object Map]" ? new ImmutableMap(extrasValue) : extrasValue;
    if (!((extrasMapValue instanceof ImmutableMap || Object.prototype.toString.call(extrasMapValue) === "[object ImmutableMap]" || extrasMapValue instanceof Map || Object.prototype.toString.call(extrasMapValue) === "[object Map]") && [...extrasMapValue.entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "object" && mapValue !== null && mapValue.note !== undefined && (typeof mapValue.note === "string" || mapValue.note === null)))) throw new Error("Invalid value for property \"extras\".");
    props.extras = extrasMapValue;
    return props as MapMessage.Data;
  }
  get labels(): ReadonlyMap<string | number, number> {
    return this.#labels;
  }
  get metadata(): ReadonlyMap<string, {
    value: string;
  }> | undefined {
    return this.#metadata;
  }
  get extras(): ReadonlyMap<string, {
    note: string | null;
  }> {
    return this.#extras;
  }
  clearExtras(): MapMessage {
    const extrasCurrent = this.extras;
    if (extrasCurrent === undefined || extrasCurrent.size === 0) return this;
    const extrasMapSource = this.#extras;
    const extrasMapEntries = Array.from(extrasMapSource.entries());
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
    const labelsMapEntries = Array.from(labelsMapSource.entries());
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
    const metadataMapEntries = metadataMapSource === undefined ? [] : Array.from(metadataMapSource.entries());
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
    const extrasMapEntries = Array.from(extrasMapSource.entries());
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
    const labelsMapEntries = Array.from(labelsMapSource.entries());
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
    const metadataMapEntries = metadataMapSource === undefined ? [] : Array.from(metadataMapSource.entries());
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.delete(key);
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  filterExtrasEntries(predicate: (value: {
    note: string | null;
  }, key: string) => boolean): MapMessage {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = Array.from(extrasMapSource.entries());
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
    const labelsMapEntries = Array.from(labelsMapSource.entries());
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
  filterMetadataEntries(predicate: (value: {
    value: string;
  }, key: string) => boolean): MapMessage {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : Array.from(metadataMapSource.entries());
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
  mapExtrasEntries(mapper: (value: {
    note: string | null;
  }, key: string) => [string, {
    note: string | null;
  }]): MapMessage {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = Array.from(extrasMapSource.entries());
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
    const labelsMapEntries = Array.from(labelsMapSource.entries());
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
  mapMetadataEntries(mapper: (value: {
    value: string;
  }, key: string) => [string, {
    value: string;
  }]): MapMessage {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : Array.from(metadataMapSource.entries());
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
  mergeExtrasEntries(entries: Iterable<[string, {
    note: string | null;
  }]> | Map<string, {
    note: string | null;
  }> | ReadonlyMap<string, {
    note: string | null;
  }>): MapMessage {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = Array.from(extrasMapSource.entries());
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
  mergeLabelsEntries(entries: Iterable<[string | number, number]> | Map<string | number, number> | ReadonlyMap<string | number, number>): MapMessage {
    const labelsMapSource = this.#labels;
    const labelsMapEntries = Array.from(labelsMapSource.entries());
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
  mergeMetadataEntries(entries: Iterable<[string, {
    value: string;
  }]> | Map<string, {
    value: string;
  }> | ReadonlyMap<string, {
    value: string;
  }>): MapMessage {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : Array.from(metadataMapSource.entries());
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
  setExtras(value: ReadonlyMap<string, {
    note: string | null;
  }>): MapMessage {
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: Array.isArray(value) ? new ImmutableMap(value) : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : value instanceof Map || Object.prototype.toString.call(value) === "[object Map]" ? new ImmutableMap(value) : value
    });
  }
  setExtrasEntry(key: string, value: {
    note: string | null;
  }): MapMessage {
    const extrasCurrent = this.extras;
    if (extrasCurrent && extrasCurrent.has(key)) {
      const existing = extrasCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const extrasMapSource = this.#extras;
    const extrasMapEntries = Array.from(extrasMapSource.entries());
    const extrasMapNext = new Map(extrasMapEntries);
    extrasMapNext.set(key, value);
    return new MapMessage({
      labels: this.#labels,
      metadata: this.#metadata,
      extras: extrasMapNext
    });
  }
  setLabels(value: ReadonlyMap<string | number, number>): MapMessage {
    return new MapMessage({
      labels: Array.isArray(value) ? new ImmutableMap(value) : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : value instanceof Map || Object.prototype.toString.call(value) === "[object Map]" ? new ImmutableMap(value) : value,
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
    const labelsMapEntries = Array.from(labelsMapSource.entries());
    const labelsMapNext = new Map(labelsMapEntries);
    labelsMapNext.set(key, value);
    return new MapMessage({
      labels: labelsMapNext,
      metadata: this.#metadata,
      extras: this.#extras
    });
  }
  setMetadata(value: ReadonlyMap<string, {
    value: string;
  }>): MapMessage {
    return new MapMessage({
      labels: this.#labels,
      metadata: Array.isArray(value) ? new ImmutableMap(value) : value instanceof ImmutableMap || Object.prototype.toString.call(value) === "[object ImmutableMap]" ? value : value instanceof Map || Object.prototype.toString.call(value) === "[object Map]" ? new ImmutableMap(value) : value,
      extras: this.#extras
    });
  }
  setMetadataEntry(key: string, value: {
    value: string;
  }): MapMessage {
    const metadataCurrent = this.metadata;
    if (metadataCurrent && metadataCurrent.has(key)) {
      const existing = metadataCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : Array.from(metadataMapSource.entries());
    const metadataMapNext = new Map(metadataMapEntries);
    metadataMapNext.set(key, value);
    return new MapMessage({
      labels: this.#labels,
      metadata: metadataMapNext,
      extras: this.#extras
    });
  }
  updateExtrasEntry(key: string, updater: (currentValue: {
    note: string | null;
  } | undefined) => {
    note: string | null;
  }): MapMessage {
    const extrasMapSource = this.#extras;
    const extrasMapEntries = Array.from(extrasMapSource.entries());
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
    const labelsMapEntries = Array.from(labelsMapSource.entries());
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
  updateMetadataEntry(key: string, updater: (currentValue: {
    value: string;
  } | undefined) => {
    value: string;
  }): MapMessage {
    const metadataMapSource = this.#metadata;
    const metadataMapEntries = metadataMapSource === undefined ? [] : Array.from(metadataMapSource.entries());
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