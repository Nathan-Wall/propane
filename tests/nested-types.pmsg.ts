/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class Wrapper extends Message<Wrapper.Data> {
  static TYPE_TAG = Symbol("Wrapper");
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #payload!: Date | {
    d: Date;
  };
  constructor(props?: Wrapper.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(Wrapper.TYPE_TAG, "Wrapper");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
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
  #validate(data: Wrapper.Value | undefined) {}
  static validateAll(data: Wrapper.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  get payload(): Date | {
    d: Date;
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
  setPayload(value: Date | {
    d: Date;
  }) {
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
