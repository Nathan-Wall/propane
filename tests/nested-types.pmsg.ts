/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-types.pmsg
import type { MessagePropDescriptor } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate } from "../runtime/index.js";
// @message
export class Wrapper extends Message<Wrapper.Data> {
  static TYPE_TAG = Symbol("Wrapper");
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #payload: Date | {
    d: Date;
  };
  constructor(props?: Wrapper.Value) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(Wrapper.TYPE_TAG, "Wrapper");
    this.#payload = props ? props.payload : new ImmutableDate(0);
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
    if (!(payloadValue instanceof Date || payloadValue instanceof ImmutableDate || typeof payloadValue === "object" && payloadValue !== null && payloadValue.d !== undefined && (payloadValue.d instanceof Date || payloadValue.d instanceof ImmutableDate))) throw new Error("Invalid value for property \"payload\".");
    props.payload = payloadValue;
    return props as Wrapper.Data;
  }
  get payload(): Date | {
    d: Date;
  } {
    return this.#payload;
  }
  setPayload(value: Date | {
    d: Date;
  }): Wrapper {
    return this.$update(new (this.constructor as typeof Wrapper)({
      payload: value
    }));
  }
}
export namespace Wrapper {
  export type Data = {
    payload: Date | {
      d: Date;
    };
  };
  export type Value = Wrapper | Wrapper.Data;
}
