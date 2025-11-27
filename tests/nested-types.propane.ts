/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-types.propane
import { Message, MessagePropDescriptor, ImmutableDate } from "@propanejs/runtime";
export class Wrapper extends Message<Wrapper.Data> {
  static TYPE_TAG = Symbol("Wrapper");
  static EMPTY: Wrapper;
  #payload: Date | {
    d: Date;
  };
  constructor(props?: Wrapper.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(Wrapper.TYPE_TAG, "Wrapper", listeners);
    this.#payload = props ? props.payload : new ImmutableDate(0);
    if (!props && !listeners) Wrapper.EMPTY = this;
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
    if (!(payloadValue instanceof Date || payloadValue instanceof ImmutableDate || Object.prototype.toString.call(payloadValue) === "[object Date]" || Object.prototype.toString.call(payloadValue) === "[object ImmutableDate]" || typeof payloadValue === "object" && payloadValue !== null && payloadValue.d !== undefined && (payloadValue.d instanceof Date || payloadValue.d instanceof ImmutableDate || Object.prototype.toString.call(payloadValue.d) === "[object Date]" || Object.prototype.toString.call(payloadValue.d) === "[object ImmutableDate]"))) throw new Error("Invalid value for property \"payload\".");
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
    return this.$update(new Wrapper({
      payload: value
    }, this.$listeners));
  }
}
export namespace Wrapper {
  export interface Data {
    payload: Date | {
      d: Date;
    };
  }
  export type Value = Wrapper | Wrapper.Data;
}