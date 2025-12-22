/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-decorator.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP } from "../runtime/index.js";

// Tests that Message<T> wrapper controls which types get transformed
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class TransformedMessage extends Message<TransformedMessage.Data> {
  static TYPE_TAG = Symbol("TransformedMessage");
  static readonly $typeName = "TransformedMessage";
  static EMPTY: TransformedMessage;
  #id!: number;
  #name!: string;
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
  set(updates: Partial<SetUpdates<TransformedMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof TransformedMessage)(data));
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof TransformedMessage)({
      id: value,
      name: this.#name
    }));
  }
  setName(value: string) {
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
} // No wrapper - should NOT be transpiled, remains a type alias
export type RegularType = 'active' | 'inactive' | 'pending';

// No wrapper - should NOT be transpiled
export type RegularAlias = number;
