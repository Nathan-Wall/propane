/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/bigint-regression.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class Wrapper extends Message<Wrapper.Data> {
  static TYPE_TAG = Symbol("Wrapper");
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #payload: bigint | {
    id: bigint;
  };
  constructor(props?: Wrapper.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(Wrapper.TYPE_TAG, "Wrapper");
    this.#payload = props ? props.payload : 0n;
    if (!options?.skipValidation) {
      this.#validate();
    }
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
  #validate() {}
  static validateAll(data: Wrapper.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  get payload(): bigint | {
    id: bigint;
  } {
    return this.#payload;
  }
  set(updates: Partial<SetUpdates<Wrapper.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Wrapper)(data));
  }
  setPayload(value: bigint | {
    id: bigint;
  }) {
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
