/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-decorator.pmsg
import type { MessagePropDescriptor } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
// Tests that @message decorator controls which types get transformed
// @message
export class TransformedMessage extends Message<TransformedMessage.Data> {
  static TYPE_TAG = Symbol("TransformedMessage");
  static readonly $typeName = "TransformedMessage";
  static EMPTY: TransformedMessage;
  #id: number;
  #name: string;
  constructor(props?: TransformedMessage.Value) {
    if (!props && TransformedMessage.EMPTY) return TransformedMessage.EMPTY;
    super(TransformedMessage.TYPE_TAG, "TransformedMessage");
    this.#id = props ? props.id : 0;
    this.#name = props ? props.name : "";
    if (!props) TransformedMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<TransformedMessage.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "name",
      fieldNumber: 2,
      getValue: () => this.#name
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): TransformedMessage.Data {
    const props = {} as Partial<TransformedMessage.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as TransformedMessage.Data;
  }
  get id(): number {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  setId(value: number): TransformedMessage {
    return this.$update(new (this.constructor as typeof TransformedMessage)({
      id: value,
      name: this.#name
    }));
  }
  setName(value: string): TransformedMessage {
    return this.$update(new (this.constructor as typeof TransformedMessage)({
      id: this.#id,
      name: value
    }));
  }
}
export namespace TransformedMessage {
  export type Data = {
    id: number;
    name: string;
  };
  export type Value = TransformedMessage | TransformedMessage.Data;
} // No decorator - should NOT be transpiled, remains a type alias
export type RegularType = 'active' | 'inactive' | 'pending';

// No decorator - should NOT be transpiled
export type RegularAlias = number;

// No decorator - object type without @message stays as-is
export class RegularObject extends Message<RegularObject.Data> {
  static TYPE_TAG = Symbol("RegularObject");
  static readonly $typeName = "RegularObject";
  static EMPTY: RegularObject;
  #id: number;
  #name: string;
  constructor(props?: RegularObject.Value) {
    if (!props && RegularObject.EMPTY) return RegularObject.EMPTY;
    super(RegularObject.TYPE_TAG, "RegularObject");
    this.#id = props ? props.id : 0;
    this.#name = props ? props.name : "";
    if (!props) RegularObject.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<RegularObject.Data>[] {
    return [{
      name: "id",
      fieldNumber: null,
      getValue: () => this.#id
    }, {
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): RegularObject.Data {
    const props = {} as Partial<RegularObject.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as RegularObject.Data;
  }
  get id(): number {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  setId(value: number): RegularObject {
    return this.$update(new (this.constructor as typeof RegularObject)({
      id: value,
      name: this.#name
    }));
  }
  setName(value: string): RegularObject {
    return this.$update(new (this.constructor as typeof RegularObject)({
      id: this.#id,
      name: value
    }));
  }
}
export namespace RegularObject {
  export type Data = {
    id: number;
    name: string;
  };
  export type Value = RegularObject | RegularObject.Data;
}
