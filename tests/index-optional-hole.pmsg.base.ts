/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/index-optional-hole.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_OptionalHole = Symbol("OptionalHole");
export class OptionalHole extends Message<OptionalHole.Data> {
  static $typeId = "tests/index-optional-hole.pmsg#OptionalHole";
  static $typeHash = "sha256:a2ad318a598dba51813ba73dd36eb81436083147637f1a37a934afc7df06309b";
  static $instanceTag = Symbol.for("propane:message:" + OptionalHole.$typeId);
  static readonly $typeName = "OptionalHole";
  static EMPTY: OptionalHole;
  #id!: number;
  #created!: ImmutableDate;
  #note!: string | undefined;
  #name!: string;
  constructor(props?: OptionalHole.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && OptionalHole.EMPTY) return OptionalHole.EMPTY;
    super(TYPE_TAG_OptionalHole, "OptionalHole");
    this.#id = (props ? props.id : 0) as number;
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    this.#note = (props ? props.note : undefined) as string;
    this.#name = (props ? props.name : "") as string;
    if (!props) OptionalHole.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OptionalHole.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "created",
      fieldNumber: 2,
      getValue: () => this.#created as ImmutableDate | Date
    }, {
      name: "note",
      fieldNumber: 3,
      getValue: () => this.#note
    }, {
      name: "name",
      fieldNumber: 4,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): OptionalHole.Data {
    const props = {} as Partial<OptionalHole.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const createdValue = entries["2"] === undefined ? entries["created"] : entries["2"];
    if (createdValue === undefined) throw new Error("Missing required property \"created\".");
    const createdMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableDate.$compact === true) {
        result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.startsWith(ImmutableDate.$compactTag) ? value.slice(ImmutableDate.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableDate") {
            if (typeof value.$data === "string") {
              if (ImmutableDate.$compact === true) {
                result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.$data.startsWith(ImmutableDate.$compactTag) ? value.$data.slice(ImmutableDate.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableDate.");
              }
            } else {
              result = new ImmutableDate(ImmutableDate.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableDate.");
          }
        } else {
          if (value instanceof ImmutableDate) {
            result = value;
          } else {
            result = new ImmutableDate(value as ImmutableDate.Value, options);
          }
        }
      }
      return result;
    })(createdValue);
    if (!(createdMessageValue as object instanceof Date || createdMessageValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdMessageValue as ImmutableDate | Date;
    const noteValue = entries["3"] === undefined ? entries["note"] : entries["3"];
    const noteNormalized = noteValue === null ? undefined : noteValue;
    if (noteNormalized !== undefined && !(typeof noteNormalized === "string")) throw new Error("Invalid value for property \"note\".");
    props.note = noteNormalized as string;
    const nameValue = entries["4"] === undefined ? entries["name"] : entries["4"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as OptionalHole.Data;
  }
  static from(value: OptionalHole.Value): OptionalHole {
    return value instanceof OptionalHole ? value : new OptionalHole(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "created":
        return new (this.constructor as typeof OptionalHole)({
          id: this.#id,
          created: child as ImmutableDate | Date,
          note: this.#note,
          name: this.#name
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof OptionalHole>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for OptionalHole.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected OptionalHole.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): number {
    return this.#id;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  get note(): string | undefined {
    return this.#note;
  }
  get name(): string {
    return this.#name;
  }
  set(updates: Partial<SetUpdates<OptionalHole.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof OptionalHole)(data) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof OptionalHole)({
      id: this.#id,
      created: (value instanceof ImmutableDate ? value : new ImmutableDate(value)) as ImmutableDate | Date,
      note: this.#note,
      name: this.#name
    }) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof OptionalHole)({
      id: value,
      created: this.#created as ImmutableDate | Date,
      note: this.#note,
      name: this.#name
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof OptionalHole)({
      id: this.#id,
      created: this.#created as ImmutableDate | Date,
      note: this.#note,
      name: value
    }) as this);
  }
  setNote(value: string | undefined) {
    return this.$update(new (this.constructor as typeof OptionalHole)({
      id: this.#id,
      created: this.#created as ImmutableDate | Date,
      note: value,
      name: this.#name
    }) as this);
  }
  unsetNote() {
    return this.$update(new (this.constructor as typeof OptionalHole)({
      id: this.#id,
      created: this.#created as ImmutableDate | Date,
      name: this.#name
    }) as this);
  }
}
export namespace OptionalHole {
  export type Data = {
    id: number;
    created: ImmutableDate | Date;
    note?: string | undefined;
    name: string;
  };
  export type Value = OptionalHole | OptionalHole.Data;
}
