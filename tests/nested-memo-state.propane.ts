/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-memo-state.propane
import { Message, MessagePropDescriptor, WITH_CHILD, GET_MESSAGE_CHILDREN } from "@propanejs/runtime";
// Nested message types for testing memo behavior with state persistence
export class InnerMessage extends Message<InnerMessage.Data> {
  static TYPE_TAG = Symbol("InnerMessage");
  static readonly $typeName = "InnerMessage";
  static EMPTY: InnerMessage;
  #value: string;
  constructor(props?: InnerMessage.Value) {
    if (!props && InnerMessage.EMPTY) return InnerMessage.EMPTY;
    super(InnerMessage.TYPE_TAG, "InnerMessage");
    this.#value = props ? props.value : "";
    if (!props) InnerMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<InnerMessage.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): InnerMessage.Data {
    const props = {} as Partial<InnerMessage.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as InnerMessage.Data;
  }
  get value(): string {
    return this.#value;
  }
  setValue(value: string): InnerMessage {
    return this.$update(new InnerMessage({
      value: value
    }));
  }
}
export namespace InnerMessage {
  export interface Data {
    value: string;
  }
  export type Value = InnerMessage | InnerMessage.Data;
}
export class OuterMessage extends Message<OuterMessage.Data> {
  static TYPE_TAG = Symbol("OuterMessage");
  static readonly $typeName = "OuterMessage";
  static EMPTY: OuterMessage;
  #counter: number;
  #inner: InnerMessage;
  constructor(props?: OuterMessage.Value) {
    if (!props && OuterMessage.EMPTY) return OuterMessage.EMPTY;
    super(OuterMessage.TYPE_TAG, "OuterMessage");
    this.#counter = props ? props.counter : 0;
    this.#inner = props ? props.inner instanceof InnerMessage ? props.inner : new InnerMessage(props.inner) : new InnerMessage();
    if (!props) OuterMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OuterMessage.Data>[] {
    return [{
      name: "counter",
      fieldNumber: 1,
      getValue: () => this.#counter
    }, {
      name: "inner",
      fieldNumber: 2,
      getValue: () => this.#inner
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): OuterMessage.Data {
    const props = {} as Partial<OuterMessage.Data>;
    const counterValue = entries["1"] === undefined ? entries["counter"] : entries["1"];
    if (counterValue === undefined) throw new Error("Missing required property \"counter\".");
    if (!(typeof counterValue === "number")) throw new Error("Invalid value for property \"counter\".");
    props.counter = counterValue;
    const innerValue = entries["2"] === undefined ? entries["inner"] : entries["2"];
    if (innerValue === undefined) throw new Error("Missing required property \"inner\".");
    const innerMessageValue = innerValue instanceof InnerMessage ? innerValue : new InnerMessage(innerValue);
    props.inner = innerMessageValue;
    return props as OuterMessage.Data;
  }
  [WITH_CHILD](key: string | number, child: unknown): OuterMessage {
    switch (key) {
      case "inner":
        return new OuterMessage({
          counter: this.#counter,
          inner: child
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  *[GET_MESSAGE_CHILDREN]() {
    yield ["inner", this.#inner];
  }
  get counter(): number {
    return this.#counter;
  }
  get inner(): InnerMessage {
    return this.#inner;
  }
  setCounter(value: number): OuterMessage {
    return this.$update(new OuterMessage({
      counter: value,
      inner: this.#inner
    }));
  }
  setInner(value: InnerMessage.Value): OuterMessage {
    return this.$update(new OuterMessage({
      counter: this.#counter,
      inner: value instanceof InnerMessage ? value : new InnerMessage(value)
    }));
  }
}
export namespace OuterMessage {
  export interface Data {
    counter: number;
    inner: InnerMessage.Value;
  }
  export type Value = OuterMessage | OuterMessage.Data;
}
