/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/set.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableSet, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableMap, SetUpdates } from "../runtime/index.js";
export class SetMessage extends Message<SetMessage.Data> {
  static TYPE_TAG = Symbol("SetMessage");
  static readonly $typeName = "SetMessage";
  static EMPTY: SetMessage;
  #tags: ImmutableSet<string>;
  #ids: ImmutableSet<number> | undefined;
  constructor(props?: SetMessage.Value) {
    if (!props && SetMessage.EMPTY) return SetMessage.EMPTY;
    super(SetMessage.TYPE_TAG, "SetMessage");
    this.#tags = props ? props.tags === undefined || props.tags === null ? new ImmutableSet() : props.tags instanceof ImmutableSet ? props.tags : new ImmutableSet(props.tags) : new ImmutableSet();
    this.#ids = props ? props.ids === undefined || props.ids === null ? props.ids : props.ids instanceof ImmutableSet ? props.ids : new ImmutableSet(props.ids) : undefined;
    if (!props) SetMessage.EMPTY = this;
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
    const tagsSetValue = tagsValue === undefined || tagsValue === null ? new ImmutableSet() : tagsValue as object instanceof ImmutableSet ? tagsValue : new ImmutableSet(tagsValue);
    if (!((tagsSetValue instanceof ImmutableSet || tagsSetValue instanceof Set) && [...(tagsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"tags\".");
    props.tags = tagsSetValue as ImmutableSet<string>;
    const idsValue = entries["2"] === undefined ? entries["ids"] : entries["2"];
    const idsNormalized = idsValue === null ? undefined : idsValue;
    const idsSetValue = idsNormalized === undefined || idsNormalized === null ? idsNormalized : idsNormalized as object instanceof ImmutableSet ? idsNormalized : new ImmutableSet(idsNormalized);
    if (idsSetValue !== undefined && !((idsSetValue instanceof ImmutableSet || idsSetValue instanceof Set) && [...(idsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "number"))) throw new Error("Invalid value for property \"ids\".");
    props.ids = idsSetValue as ImmutableSet<number>;
    return props as SetMessage.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): SetMessage {
    switch (key) {
      case "tags":
        return new (this.constructor as typeof SetMessage)({
          tags: child as ImmutableSet<string>,
          ids: this.#ids
        });
      case "ids":
        return new (this.constructor as typeof SetMessage)({
          tags: this.#tags,
          ids: child as ImmutableSet<number>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["tags", this.#tags] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["ids", this.#ids] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get tags(): ImmutableSet<string> {
    return this.#tags;
  }
  get ids(): ImmutableSet<number> | undefined {
    return this.#ids;
  }
  addAllIds(values: Iterable<number>) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    for (const toAdd of values) {
      idsSetNext.add(toAdd);
    }
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  addAllTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const toAdd of values) {
      tagsSetNext.add(toAdd);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
  addIds(value: number) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.add(value);
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  addTags(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.add(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
  clearIds() {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.clear();
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  clearTags() {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.clear();
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
  deleteAllIds(values: Iterable<number>) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    for (const del of values) {
      idsSetNext.delete(del);
    }
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  deleteAllTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const del of values) {
      tagsSetNext.delete(del);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
  deleteIds() {
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags
    }));
  }
  deleteIds(value: number) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.delete(value);
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  deleteTags(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.delete(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
  filterIds(predicate: (value) => boolean) {
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
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  filterTags(predicate: (value) => boolean) {
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
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
  mapIds(mapper: (value) => number) {
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
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  mapTags(mapper: (value) => string) {
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
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
  set(updates: Partial<SetUpdates<SetMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof SetMessage)(data));
  }
  setIds(value: Set<number> | Iterable<number>) {
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: value === undefined || value === null ? value : value instanceof ImmutableSet ? value : new ImmutableSet(value)
    }));
  }
  setTags(value: Set<string> | Iterable<string>) {
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: value === undefined || value === null ? new ImmutableSet() : value instanceof ImmutableSet ? value : new ImmutableSet(value),
      ids: this.#ids
    }));
  }
  updateIds(updater: (current: ImmutableSet<number>) => Iterable<number>) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    const updated = updater(idsSetNext);
    idsSetNext.clear();
    for (const updatedItem of updated) {
      idsSetNext.add(updatedItem);
    }
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags,
      ids: idsSetNext
    }));
  }
  updateTags(updater: (current: ImmutableSet<string>) => Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    const updated = updater(tagsSetNext);
    tagsSetNext.clear();
    for (const updatedItem of updated) {
      tagsSetNext.add(updatedItem);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext,
      ids: this.#ids
    }));
  }
}
export namespace SetMessage {
  export type Data = {
    tags: Set<string> | Iterable<string>;
    ids?: Set<number> | Iterable<number> | undefined;
  };
  export type Value = SetMessage | SetMessage.Data;
}
