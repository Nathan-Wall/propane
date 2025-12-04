/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/union-order.pmsg
import type { MessagePropDescriptor } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
// @message
export class StringFirst extends Message<StringFirst.Data> {
  static TYPE_TAG = Symbol("StringFirst");
  static readonly $typeName = "StringFirst";
  static EMPTY: StringFirst;
  #value: string | number;
  constructor(props?: StringFirst.Value) {
    if (!props && StringFirst.EMPTY) return StringFirst.EMPTY;
    super(StringFirst.TYPE_TAG, "StringFirst");
    this.#value = props ? props.value : "";
    if (!props) StringFirst.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<StringFirst.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): StringFirst.Data {
    const props = {} as Partial<StringFirst.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string" || typeof valueValue === "number")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as StringFirst.Data;
  }
  get value(): string | number {
    return this.#value;
  }
  setValue(value: string | number): StringFirst {
    return this.$update(new (this.constructor as typeof StringFirst)({
      value: value
    }));
  }
}
export namespace StringFirst {
  export type Data = {
    value: string | number;
  };
  export type Value = StringFirst | StringFirst.Data;
} // @message
export class NumberFirst extends Message<NumberFirst.Data> {
  static TYPE_TAG = Symbol("NumberFirst");
  static readonly $typeName = "NumberFirst";
  static EMPTY: NumberFirst;
  #value: number | string;
  constructor(props?: NumberFirst.Value) {
    if (!props && NumberFirst.EMPTY) return NumberFirst.EMPTY;
    super(NumberFirst.TYPE_TAG, "NumberFirst");
    this.#value = props ? props.value : 0;
    if (!props) NumberFirst.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumberFirst.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): NumberFirst.Data {
    const props = {} as Partial<NumberFirst.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "number" || typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as NumberFirst.Data;
  }
  get value(): number | string {
    return this.#value;
  }
  setValue(value: number | string): NumberFirst {
    return this.$update(new (this.constructor as typeof NumberFirst)({
      value: value
    }));
  }
}
export namespace NumberFirst {
  export type Data = {
    value: number | string;
  };
  export type Value = NumberFirst | NumberFirst.Data;
}
