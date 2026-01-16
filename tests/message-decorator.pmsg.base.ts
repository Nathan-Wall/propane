/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-decorator.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// Tests that Message<T> wrapper controls which types get transformed
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_TransformedMessage = Symbol("TransformedMessage");
export class TransformedMessage extends Message<TransformedMessage.Data> {
  static $typeId = "tests/message-decorator.pmsg#TransformedMessage";
  static $typeHash = "sha256:31dd5c614a9f645e29b72cb60fea0551de8d58d05c28f49551fa6d87ffe6f2a2";
  static $instanceTag = Symbol.for("propane:message:" + TransformedMessage.$typeId);
  static readonly $typeName = "TransformedMessage";
  static EMPTY: TransformedMessage;
  #id!: number;
  #name!: string;
  constructor(props?: TransformedMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && TransformedMessage.EMPTY) return TransformedMessage.EMPTY;
    super(TYPE_TAG_TransformedMessage, "TransformedMessage");
    this.#id = (props ? props.id : 0) as number;
    this.#name = (props ? props.name : "") as string;
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
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): TransformedMessage.Data {
    const props = {} as Partial<TransformedMessage.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as TransformedMessage.Data;
  }
  static from(value: TransformedMessage.Value): TransformedMessage {
    return value instanceof TransformedMessage ? value : new TransformedMessage(value);
  }
  static deserialize<T extends typeof TransformedMessage>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof TransformedMessage)(data) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof TransformedMessage)({
      id: value,
      name: this.#name
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof TransformedMessage)({
      id: this.#id,
      name: value
    }) as this);
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
