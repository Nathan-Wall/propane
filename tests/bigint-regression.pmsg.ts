/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/bigint-regression.pmsg
import type { MessagePropDescriptor } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
// @message
export class Wrapper extends Message<Wrapper.Data> {
  static TYPE_TAG = Symbol("Wrapper");
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #payload: bigint | {
    id: bigint;
  };
  constructor(props?: Wrapper.Value) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(Wrapper.TYPE_TAG, "Wrapper");
    this.#payload = props ? props.payload : 0n;
    if (!props) Wrapper.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper.Data>[] {
    return [{
      name: "payload",
      fieldNumber: null,
      getValue: () => this.#payload
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Wrapper.Data {
    const props = {} as Partial<Wrapper.Data>;
    const payloadValue = entries["payload"];
    if (payloadValue === undefined) throw new Error("Missing required property \"payload\".");
    if (!(typeof payloadValue === "bigint" || typeof payloadValue === "object" && payloadValue !== null && payloadValue.id !== undefined && typeof payloadValue.id === "bigint")) throw new Error("Invalid value for property \"payload\".");
    props.payload = payloadValue;
    return props as Wrapper.Data;
  }
  get payload(): bigint | {
    id: bigint;
  } {
    return this.#payload;
  }
  setPayload(value: bigint | {
    id: bigint;
  }): Wrapper {
    return this.$update(new (this.constructor as typeof Wrapper)({
      payload: value
    }));
  }
}
export namespace Wrapper {
  export type Data = {
    payload: bigint | {
      id: bigint;
    };
  };
  export type Value = Wrapper | Wrapper.Data;
}
