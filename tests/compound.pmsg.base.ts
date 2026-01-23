/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/compound.pmsg
import { Indexed } from './indexed.pmsg.js';
import { User } from './user.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Compound_Inline = Symbol("Compound_Inline");
export class Compound_Inline extends Message<Compound_Inline.Data> {
  static $typeId = "tests/compound.pmsg#Compound_Inline";
  static $typeHash = "sha256:b77d08b0c47ab3af08091073f5948427a451236c7dbfd711cb0ea7970b4243cb";
  static $instanceTag = Symbol.for("propane:message:" + Compound_Inline.$typeId);
  static readonly $typeName = "Compound_Inline";
  static EMPTY: Compound_Inline;
  #value!: string;
  constructor(props?: Compound_Inline.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Compound_Inline.EMPTY) return Compound_Inline.EMPTY;
    super(TYPE_TAG_Compound_Inline, "Compound_Inline");
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
            throw new Error("Invalid compact tagged value for Compound_Inline.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Compound_Inline.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
const TYPE_TAG_Compound = Symbol("Compound");
export class Compound extends Message<Compound.Data> {
  static $typeId = "tests/compound.pmsg#Compound";
  static $typeHash = "sha256:660d73d70a860c0d4b53f269267bb10cfb48def9fca4b53f54bf49e0c5113d9e";
  static $instanceTag = Symbol.for("propane:message:" + Compound.$typeId);
  static readonly $typeName = "Compound";
  static EMPTY: Compound;
  #user!: User;
  #indexed!: Indexed;
  #inline!: Compound_Inline;
  constructor(props?: Compound.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Compound.EMPTY) return Compound.EMPTY;
    super(TYPE_TAG_Compound, "Compound");
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
    const userMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && User.$compact === true) {
        result = User.fromCompact(User.$compactTag && value.startsWith(User.$compactTag) ? value.slice(User.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "User") {
            if (typeof value.$data === "string") {
              if (User.$compact === true) {
                result = User.fromCompact(User.$compactTag && value.$data.startsWith(User.$compactTag) ? value.$data.slice(User.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for User.");
              }
            } else {
              result = new User(User.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected User.");
          }
        } else {
          if (value instanceof User) {
            result = value;
          } else {
            result = new User(value as User.Value, options);
          }
        }
      }
      return result;
    })(userValue);
    props.user = userMessageValue;
    const indexedValue = entries["2"] === undefined ? entries["indexed"] : entries["2"];
    if (indexedValue === undefined) throw new Error("Missing required property \"indexed\".");
    const indexedMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && Indexed.$compact === true) {
        result = Indexed.fromCompact(Indexed.$compactTag && value.startsWith(Indexed.$compactTag) ? value.slice(Indexed.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "Indexed") {
            if (typeof value.$data === "string") {
              if (Indexed.$compact === true) {
                result = Indexed.fromCompact(Indexed.$compactTag && value.$data.startsWith(Indexed.$compactTag) ? value.$data.slice(Indexed.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for Indexed.");
              }
            } else {
              result = new Indexed(Indexed.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected Indexed.");
          }
        } else {
          if (value instanceof Indexed) {
            result = value;
          } else {
            result = new Indexed(value as Indexed.Value, options);
          }
        }
      }
      return result;
    })(indexedValue);
    props.indexed = indexedMessageValue;
    const inlineValue = entries["3"] === undefined ? entries["inline"] : entries["3"];
    if (inlineValue === undefined) throw new Error("Missing required property \"inline\".");
    const inlineMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && Compound_Inline.$compact === true) {
        result = Compound_Inline.fromCompact(Compound_Inline.$compactTag && value.startsWith(Compound_Inline.$compactTag) ? value.slice(Compound_Inline.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "Compound_Inline") {
            if (typeof value.$data === "string") {
              if (Compound_Inline.$compact === true) {
                result = Compound_Inline.fromCompact(Compound_Inline.$compactTag && value.$data.startsWith(Compound_Inline.$compactTag) ? value.$data.slice(Compound_Inline.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for Compound_Inline.");
              }
            } else {
              result = new Compound_Inline(Compound_Inline.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected Compound_Inline.");
          }
        } else {
          if (value instanceof Compound_Inline) {
            result = value;
          } else {
            result = new Compound_Inline(value as Compound_Inline.Value, options);
          }
        }
      }
      return result;
    })(inlineValue);
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
            throw new Error("Invalid compact tagged value for Compound.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Compound.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
