/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/compound.pmsg
import { Indexed } from './indexed.pmsg';
import { User } from './user.pmsg';

// @message
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
export class Compound_Inline extends Message<Compound_Inline.Data> {
  static TYPE_TAG = Symbol("Compound_Inline");
  static readonly $typeName = "Compound_Inline";
  static EMPTY: Compound_Inline;
  #value: string;
  constructor(props?: Compound_Inline.Value) {
    if (!props && Compound_Inline.EMPTY) return Compound_Inline.EMPTY;
    super(Compound_Inline.TYPE_TAG, "Compound_Inline");
    this.#value = props ? props.value : "";
    if (!props) Compound_Inline.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Compound_Inline.Data>[] {
    return [{
      name: "value",
      fieldNumber: null,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Compound_Inline.Data {
    const props = {} as Partial<Compound_Inline.Data>;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as Compound_Inline.Data;
  }
  get value(): string {
    return this.#value;
  }
  setValue(value: string): Compound_Inline {
    return this.$update(new (this.constructor as typeof Compound_Inline)({
      value: value
    }));
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
  #user: User;
  #indexed: Indexed;
  #inline: Compound_Inline;
  constructor(props?: Compound.Value) {
    if (!props && Compound.EMPTY) return Compound.EMPTY;
    super(Compound.TYPE_TAG, "Compound");
    this.#user = props ? props.user instanceof User ? props.user : new User(props.user) : new User();
    this.#indexed = props ? props.indexed instanceof Indexed ? props.indexed : new Indexed(props.indexed) : new Indexed();
    this.#inline = props ? props.inline instanceof Compound_Inline ? props.inline : new Compound_Inline(props.inline) : new Compound_Inline();
    if (!props) Compound.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Compound.Data>[] {
    return [{
      name: "user",
      fieldNumber: 1,
      getValue: () => this.#user
    }, {
      name: "indexed",
      fieldNumber: 2,
      getValue: () => this.#indexed
    }, {
      name: "inline",
      fieldNumber: 3,
      getValue: () => this.#inline
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Compound.Data {
    const props = {} as Partial<Compound.Data>;
    const userValue = entries["1"] === undefined ? entries["user"] : entries["1"];
    if (userValue === undefined) throw new Error("Missing required property \"user\".");
    const userMessageValue = userValue instanceof User ? userValue : new User(userValue);
    props.user = userMessageValue;
    const indexedValue = entries["2"] === undefined ? entries["indexed"] : entries["2"];
    if (indexedValue === undefined) throw new Error("Missing required property \"indexed\".");
    const indexedMessageValue = indexedValue instanceof Indexed ? indexedValue : new Indexed(indexedValue);
    props.indexed = indexedMessageValue;
    const inlineValue = entries["3"] === undefined ? entries["inline"] : entries["3"];
    if (inlineValue === undefined) throw new Error("Missing required property \"inline\".");
    const inlineMessageValue = inlineValue instanceof Compound_Inline ? inlineValue : new Compound_Inline(inlineValue);
    props.inline = inlineMessageValue;
    return props as Compound.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): Compound {
    switch (key) {
      case "user":
        return new (this.constructor as typeof Compound)({
          user: child as User,
          indexed: this.#indexed,
          inline: this.#inline
        });
      case "indexed":
        return new (this.constructor as typeof Compound)({
          user: this.#user,
          indexed: child as Indexed,
          inline: this.#inline
        });
      case "inline":
        return new (this.constructor as typeof Compound)({
          user: this.#user,
          indexed: this.#indexed,
          inline: child as Compound_Inline
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["user", this.#user] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["indexed", this.#indexed] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["inline", this.#inline] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
  setIndexed(value: Indexed.Value): Compound {
    return this.$update(new (this.constructor as typeof Compound)({
      user: this.#user,
      indexed: value instanceof Indexed ? value : new Indexed(value),
      inline: this.#inline
    }));
  }
  setInline(value: Compound_Inline.Value): Compound {
    return this.$update(new (this.constructor as typeof Compound)({
      user: this.#user,
      indexed: this.#indexed,
      inline: value instanceof Compound_Inline ? value : new Compound_Inline(value)
    }));
  }
  setUser(value: User.Value): Compound {
    return this.$update(new (this.constructor as typeof Compound)({
      user: value instanceof User ? value : new User(value),
      indexed: this.#indexed,
      inline: this.#inline
    }));
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
