/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/set.propane
import { Message, MessagePropDescriptor, ImmutableSet } from "@propanejs/runtime";
export class SetMessage extends Message<SetMessage.Data> {
  static TYPE_TAG = Symbol("SetMessage");
  static EMPTY: SetMessage;
  #tags: ImmutableSet<string>;
  #ids: ImmutableSet<number> | undefined;
  constructor(props?: SetMessage.Value) {
    if (!props && SetMessage.EMPTY) return SetMessage.EMPTY;
    super(SetMessage.TYPE_TAG, "SetMessage");
    this.#tags = props ? props.tags === undefined || props.tags === null ? props.tags : props.tags instanceof ImmutableSet || Object.prototype.toString.call(props.tags) === "[object ImmutableSet]" ? props.tags : new ImmutableSet(props.tags) : new Set();
    this.#ids = props ? props.ids === undefined || props.ids === null ? props.ids : props.ids instanceof ImmutableSet || Object.prototype.toString.call(props.ids) === "[object ImmutableSet]" ? props.ids : new ImmutableSet(props.ids) : undefined;
    if (!props) SetMessage.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<SetMessage.Data>[] {
    return [{
      name: "tags",
      fieldNumber: 1,
      getValue: () => this.#tags
    }, {
      name: "ids",
      fieldNumber: 2,
      getValue: () => this.#ids
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): SetMessage.Data {
    const props = {} as Partial<SetMessage.Data>;
    const tagsValue = entries["1"] === undefined ? entries["tags"] : entries["1"];
    if (tagsValue === undefined) throw new Error("Missing required property \"tags\".");
    const tagsSetValue = tagsValue === undefined || tagsValue === null ? tagsValue : tagsValue instanceof ImmutableSet || Object.prototype.toString.call(tagsValue) === "[object ImmutableSet]" ? tagsValue : new ImmutableSet(tagsValue);
    if (!((tagsSetValue instanceof ImmutableSet || Object.prototype.toString.call(tagsSetValue) === "[object ImmutableSet]" || tagsSetValue instanceof Set || Object.prototype.toString.call(tagsSetValue) === "[object Set]") && [...tagsSetValue].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"tags\".");
    props.tags = tagsSetValue;
    const idsValue = entries["2"] === undefined ? entries["ids"] : entries["2"];
    const idsNormalized = idsValue === null ? undefined : idsValue;
    const idsSetValue = idsNormalized === undefined || idsNormalized === null ? idsNormalized : idsNormalized instanceof ImmutableSet || Object.prototype.toString.call(idsNormalized) === "[object ImmutableSet]" ? idsNormalized : new ImmutableSet(idsNormalized);
    if (idsSetValue !== undefined && !((idsSetValue instanceof ImmutableSet || Object.prototype.toString.call(idsSetValue) === "[object ImmutableSet]" || idsSetValue instanceof Set || Object.prototype.toString.call(idsSetValue) === "[object Set]") && [...idsSetValue].every(setValue => typeof setValue === "number"))) throw new Error("Invalid value for property \"ids\".");
    props.ids = idsSetValue;
    return props as SetMessage.Data;
  }
  get tags(): ImmutableSet<string> {
    return this.#tags;
  }
  get ids(): ImmutableSet<number> | undefined {
    return this.#ids;
  }
  addAllIds(values: Iterable<number>): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    for (const toAdd of values) {
      idsSetNext.add(toAdd);
    }
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  addAllTags(values: Iterable<string>): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const toAdd of values) {
      tagsSetNext.add(toAdd);
    }
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
  addIds(value: number): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.add(value);
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  addTags(value: string): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.add(value);
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
  clearIds(): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.clear();
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  clearTags(): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.clear();
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
  deleteAllIds(values: Iterable<number>): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    for (const del of values) {
      idsSetNext.delete(del);
    }
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  deleteAllTags(values: Iterable<string>): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const del of values) {
      tagsSetNext.delete(del);
    }
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
  deleteIds(): SetMessage {
    return new SetMessage({
      tags: this.#tags
    });
  }
  deleteIds(value: number): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.delete(value);
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  deleteTags(value: string): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.delete(value);
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
  filterIds(predicate: (value) => boolean): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    const idsFiltered = [];
    for (const value of idsSetNext) {
      if (predicate(value)) idsFiltered.push(value);
    }
    idsSetNext.clear();
    for (const value of idsFiltered) {
      idsSetNext.add(value);
    }
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  filterTags(predicate: (value) => boolean): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    const tagsFiltered = [];
    for (const value of tagsSetNext) {
      if (predicate(value)) tagsFiltered.push(value);
    }
    tagsSetNext.clear();
    for (const value of tagsFiltered) {
      tagsSetNext.add(value);
    }
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
  mapIds(mapper: (value) => number): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    const idsMapped = [];
    for (const value of idsSetNext) {
      const mappedValue = mapper(value);
      idsMapped.push(mappedValue);
    }
    idsSetNext.clear();
    for (const value of idsMapped) {
      idsSetNext.add(value);
    }
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  mapTags(mapper: (value) => string): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    const tagsMapped = [];
    for (const value of tagsSetNext) {
      const mappedValue = mapper(value);
      tagsMapped.push(mappedValue);
    }
    tagsSetNext.clear();
    for (const value of tagsMapped) {
      tagsSetNext.add(value);
    }
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
  setIds(value: Set<number> | Iterable<number>): SetMessage {
    return new SetMessage({
      tags: this.#tags,
      ids: value === undefined || value === null ? value : value instanceof ImmutableSet || Object.prototype.toString.call(value) === "[object ImmutableSet]" ? value : new ImmutableSet(value)
    });
  }
  setTags(value: Set<string> | Iterable<string>): SetMessage {
    return new SetMessage({
      tags: value === undefined || value === null ? value : value instanceof ImmutableSet || Object.prototype.toString.call(value) === "[object ImmutableSet]" ? value : new ImmutableSet(value),
      ids: this.#ids
    });
  }
  updateIds(updater: (current: ImmutableSet<number>) => Iterable<number>): SetMessage {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    const updated = updater(idsSetNext);
    idsSetNext.clear();
    for (const updatedItem of updated) {
      idsSetNext.add(updatedItem);
    }
    if (this.ids === idsSetNext || this.ids !== undefined && this.ids.equals(idsSetNext)) return this;
    return new SetMessage({
      tags: this.#tags,
      ids: idsSetNext
    });
  }
  updateTags(updater: (current: ImmutableSet<string>) => Iterable<string>): SetMessage {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    const updated = updater(tagsSetNext);
    tagsSetNext.clear();
    for (const updatedItem of updated) {
      tagsSetNext.add(updatedItem);
    }
    if (this.tags === tagsSetNext || this.tags !== undefined && this.tags.equals(tagsSetNext)) return this;
    return new SetMessage({
      tags: tagsSetNext,
      ids: this.#ids
    });
  }
}
export namespace SetMessage {
  export interface Data {
    tags: Set<string> | Iterable<string>;
    ids?: Set<number> | Iterable<number> | undefined;
  }
  export type Value = SetMessage | SetMessage.Data;
}