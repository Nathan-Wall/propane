/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/set.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableSet, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_SetMessage = Symbol("SetMessage");
export class SetMessage extends Message<SetMessage.Data> {
  static $typeId = "tests/set.pmsg#SetMessage";
  static $typeHash = "sha256:4e004b488d94512d6b97e6b86490a4c510bc31f07d3c3010698587ddd33777dc";
  static $instanceTag = Symbol.for("propane:message:" + SetMessage.$typeId);
  static readonly $typeName = "SetMessage";
  static EMPTY: SetMessage;
  #tags!: ImmutableSet<string>;
  #ids!: ImmutableSet<number> | undefined;
  constructor(props?: SetMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && SetMessage.EMPTY) return SetMessage.EMPTY;
    super(TYPE_TAG_SetMessage, "SetMessage");
    this.#tags = props ? (props.tags === undefined || props.tags === null ? new ImmutableSet() : ImmutableSet.isInstance(props.tags) ? props.tags : new ImmutableSet(props.tags as Iterable<unknown>)) as ImmutableSet<string> : new ImmutableSet();
    this.#ids = props ? (props.ids === undefined || props.ids === null ? props.ids : ImmutableSet.isInstance(props.ids) ? props.ids : new ImmutableSet(props.ids as Iterable<unknown>)) as ImmutableSet<number> : undefined;
    if (!props) SetMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<SetMessage.Data>[] {
    return [{
      name: "tags",
      fieldNumber: 1,
      getValue: () => this.#tags as Set<string> | Iterable<string>
    }, {
      name: "ids",
      fieldNumber: 2,
      getValue: () => this.#ids as Set<number> | Iterable<number>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): SetMessage.Data {
    const props = {} as Partial<SetMessage.Data>;
    const tagsValue = entries["1"] === undefined ? entries["tags"] : entries["1"];
    if (tagsValue === undefined) throw new Error("Missing required property \"tags\".");
    const tagsSetValue = tagsValue === undefined || tagsValue === null ? new ImmutableSet() : ImmutableSet.isInstance(tagsValue) ? tagsValue : new ImmutableSet(tagsValue as Iterable<unknown>);
    if (!((ImmutableSet.isInstance(tagsSetValue) || tagsSetValue as object instanceof Set) && [...(tagsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"tags\".");
    props.tags = tagsSetValue as Set<string> | Iterable<string>;
    const idsValue = entries["2"] === undefined ? entries["ids"] : entries["2"];
    const idsNormalized = idsValue === null ? undefined : idsValue;
    const idsSetValue = idsNormalized === undefined || idsNormalized === null ? idsNormalized : ImmutableSet.isInstance(idsNormalized) ? idsNormalized : new ImmutableSet(idsNormalized as Iterable<unknown>);
    if (idsSetValue !== undefined && !((ImmutableSet.isInstance(idsSetValue) || idsSetValue as object instanceof Set) && [...(idsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "number"))) throw new Error("Invalid value for property \"ids\".");
    props.ids = idsSetValue as Set<number> | Iterable<number>;
    return props as SetMessage.Data;
  }
  static from(value: SetMessage.Value): SetMessage {
    return SetMessage.isInstance(value) ? value : new SetMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "tags":
        return new (this.constructor as typeof SetMessage)({
          tags: child as Set<string> | Iterable<string>,
          ids: this.#ids as Set<number> | Iterable<number>
        }) as this;
      case "ids":
        return new (this.constructor as typeof SetMessage)({
          tags: this.#tags as Set<string> | Iterable<string>,
          ids: child as Set<number> | Iterable<number>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["tags", this.#tags] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["ids", this.#ids] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof SetMessage>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for SetMessage.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected SetMessage.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get tags(): ImmutableSet<string> {
    return this.#tags;
  }
  get ids(): ImmutableSet<number> | undefined {
    return this.#ids;
  }
  addId(value: number) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.add(value);
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  addIds(values: Iterable<number>) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    for (const toAdd of values) {
      idsSetNext.add(toAdd);
    }
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  addTag(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.add(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  addTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const toAdd of values) {
      tagsSetNext.add(toAdd);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  clearIds() {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.clear();
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  clearTags() {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.clear();
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  deleteId(value: number) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    idsSetNext.delete(value);
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  deleteIds(values: Iterable<number>) {
    const idsSetSource = this.ids ?? [];
    const idsSetEntries = [...idsSetSource];
    const idsSetNext = new Set(idsSetEntries);
    for (const del of values) {
      idsSetNext.delete(del);
    }
    if (this.ids === idsSetNext as unknown || this.ids?.equals(idsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  deleteTag(value: string) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    tagsSetNext.delete(value);
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  deleteTags(values: Iterable<string>) {
    const tagsSetSource = this.tags ?? [];
    const tagsSetEntries = [...tagsSetSource];
    const tagsSetNext = new Set(tagsSetEntries);
    for (const del of values) {
      tagsSetNext.delete(del);
    }
    if (this.tags === tagsSetNext as unknown || this.tags?.equals(tagsSetNext)) return this;
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  filterIds(predicate: (value: number) => boolean) {
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
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  filterTags(predicate: (value: string) => boolean) {
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
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  mapIds(mapper: (value: number) => number) {
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
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  mapTags(mapper: (value: string) => string) {
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
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  set(updates: Partial<SetUpdates<SetMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof SetMessage)(data) as this);
  }
  setIds(value: Set<number> | Iterable<number> | undefined) {
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: (value === undefined || value === null ? value : ImmutableSet.isInstance(value) ? value : new ImmutableSet(value)) as Set<number> | Iterable<number>
    }) as this);
  }
  setTags(value: Set<string> | Iterable<string>) {
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: (value === undefined || value === null ? new ImmutableSet() : ImmutableSet.isInstance(value) ? value : new ImmutableSet(value)) as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
  unsetIds() {
    return this.$update(new (this.constructor as typeof SetMessage)({
      tags: this.#tags as Set<string> | Iterable<string>
    }) as this);
  }
  updateIds(updater: (current: Set<number>) => Iterable<number>) {
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
      tags: this.#tags as Set<string> | Iterable<string>,
      ids: idsSetNext as Set<number> | Iterable<number>
    }) as this);
  }
  updateTags(updater: (current: Set<string>) => Iterable<string>) {
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
      tags: tagsSetNext as Set<string> | Iterable<string>,
      ids: this.#ids as Set<number> | Iterable<number>
    }) as this);
  }
}
export namespace SetMessage {
  export type Data = {
    tags: Set<string> | Iterable<string>;
    ids?: Set<number> | Iterable<number> | undefined;
  };
  export type Value = SetMessage | SetMessage.Data;
}
