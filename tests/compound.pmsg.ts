/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/compound.pmsg
import { Indexed } from './indexed.pmsg.js';
import { User } from './user.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
export class Compound_Inline extends Message<Compound_Inline.Data> {
  static TYPE_TAG = Symbol("Compound_Inline");
  static readonly $typeName = "Compound_Inline";
  static EMPTY: Compound_Inline;
  #value!: string;
  constructor(props?: Compound_Inline.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Compound_Inline.EMPTY) return Compound_Inline.EMPTY;
    super(Compound_Inline.TYPE_TAG, "Compound_Inline");
    this.#value = (props ? props.value : "") as string;
    if (!props) Compound_Inline.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Compound_Inline.Data>[] {
    return [{
      name: "value",
      fieldNumber: null,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Compound_Inline.Data {
    const props = {} as Partial<Compound_Inline.Data>;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as string;
    return props as Compound_Inline.Data;
  }
  static from(value: Compound_Inline.Value): Compound_Inline {
    return value instanceof Compound_Inline ? value : new Compound_Inline(value);
  }
  static deserialize<T extends typeof Compound_Inline>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<Compound_Inline.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Compound_Inline)(data) as this);
  }
  setValue(value: string) {
    return this.$update(new (this.constructor as typeof Compound_Inline)({
      value: value
    }) as this);
  }
}
export namespace Compound_Inline {
  export type Data = {
    value: string;
  };
  export type Value = Compound_Inline | Compound_Inline.Data;
}
export class Compound extends Message<Compound.Data> {
  static TYPE_TAG = Symbol("Compound");
  static readonly $typeName = "Compound";
  static EMPTY: Compound;
  #user!: User;
  #indexed!: Indexed;
  #inline!: Compound_Inline;
  constructor(props?: Compound.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Compound.EMPTY) return Compound.EMPTY;
    super(Compound.TYPE_TAG, "Compound");
    this.#user = props ? props.user instanceof User ? props.user : new User(props.user, options) : new User();
    this.#indexed = props ? props.indexed instanceof Indexed ? props.indexed : new Indexed(props.indexed, options) : new Indexed();
    this.#inline = props ? props.inline instanceof Compound_Inline ? props.inline : new Compound_Inline(props.inline, options) : new Compound_Inline();
    if (!props) Compound.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Compound.Data>[] {
    return [{
      name: "user",
      fieldNumber: 1,
      getValue: () => this.#user as User.Value
    }, {
      name: "indexed",
      fieldNumber: 2,
      getValue: () => this.#indexed as Indexed.Value
    }, {
      name: "inline",
      fieldNumber: 3,
      getValue: () => this.#inline as Compound_Inline.Value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Compound.Data {
    const props = {} as Partial<Compound.Data>;
    const userValue = entries["1"] === undefined ? entries["user"] : entries["1"];
    if (userValue === undefined) throw new Error("Missing required property \"user\".");
    const userMessageValue = userValue instanceof User ? userValue : new User(userValue as User.Value, options);
    props.user = userMessageValue;
    const indexedValue = entries["2"] === undefined ? entries["indexed"] : entries["2"];
    if (indexedValue === undefined) throw new Error("Missing required property \"indexed\".");
    const indexedMessageValue = indexedValue instanceof Indexed ? indexedValue : new Indexed(indexedValue as Indexed.Value, options);
    props.indexed = indexedMessageValue;
    const inlineValue = entries["3"] === undefined ? entries["inline"] : entries["3"];
    if (inlineValue === undefined) throw new Error("Missing required property \"inline\".");
    const inlineMessageValue = inlineValue instanceof Compound_Inline ? inlineValue : new Compound_Inline(inlineValue as Compound_Inline.Value, options);
    props.inline = inlineMessageValue;
    return props as Compound.Data;
  }
  static from(value: Compound.Value): Compound {
    return value instanceof Compound ? value : new Compound(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "user":
        return new (this.constructor as typeof Compound)({
          user: child as User.Value,
          indexed: this.#indexed as Indexed.Value,
          inline: this.#inline as Compound_Inline.Value
        }) as this;
      case "indexed":
        return new (this.constructor as typeof Compound)({
          user: this.#user as User.Value,
          indexed: child as Indexed.Value,
          inline: this.#inline as Compound_Inline.Value
        }) as this;
      case "inline":
        return new (this.constructor as typeof Compound)({
          user: this.#user as User.Value,
          indexed: this.#indexed as Indexed.Value,
          inline: child as Compound_Inline.Value
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["user", this.#user] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["indexed", this.#indexed] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["inline", this.#inline] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Compound>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get user(): User {
    return this.#user;
  }
  get indexed(): Indexed {
    return this.#indexed;
  }
  get inline(): Compound_Inline {
    return this.#inline;
  }
  set(updates: Partial<SetUpdates<Compound.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Compound)(data) as this);
  }
  setIndexed(value: Indexed.Value) {
    return this.$update(new (this.constructor as typeof Compound)({
      user: this.#user as User.Value,
      indexed: (value instanceof Indexed ? value : new Indexed(value)) as Indexed.Value,
      inline: this.#inline as Compound_Inline.Value
    }) as this);
  }
  setInline(value: Compound_Inline.Value) {
    return this.$update(new (this.constructor as typeof Compound)({
      user: this.#user as User.Value,
      indexed: this.#indexed as Indexed.Value,
      inline: (value instanceof Compound_Inline ? value : new Compound_Inline(value)) as Compound_Inline.Value
    }) as this);
  }
  setUser(value: User.Value) {
    return this.$update(new (this.constructor as typeof Compound)({
      user: (value instanceof User ? value : new User(value)) as User.Value,
      indexed: this.#indexed as Indexed.Value,
      inline: this.#inline as Compound_Inline.Value
    }) as this);
  }
}
export namespace Compound {
  export type Data = {
    user: User.Value;
    indexed: Indexed.Value;
    inline: Compound_Inline.Value;
  };
  export type Value = Compound | Compound.Data;
  export import Inline = Compound_Inline;
}
