/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
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
    this.#payload = (props ? props.payload : new ImmutableDate(0)) as Date | {
      d: Date;
    };
    if (!props) Wrapper.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper.Data>[] {
    return [{
      name: "payload",
      fieldNumber: null,
      getValue: () => this.#payload as Date | {
        d: Date;
      }
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Wrapper.Data {
    const props = {} as Partial<Wrapper.Data>;
    const payloadValue = entries["payload"];
    if (payloadValue === undefined) throw new Error("Missing required property \"payload\".");
    if (!(payloadValue as object instanceof Date || payloadValue as object instanceof ImmutableDate || typeof payloadValue === "object" && payloadValue !== null && (payloadValue as Record<string, unknown>)["d"] !== undefined && ((payloadValue as Record<string, unknown>)["d"] as object instanceof Date || (payloadValue as Record<string, unknown>)["d"] as object instanceof ImmutableDate))) throw new Error("Invalid value for property \"payload\".");
    props.payload = payloadValue as Date | {
      d: Date;
    };
    return props as Wrapper.Data;
  }
  static from(value: Wrapper.Value): Wrapper {
    return value instanceof Wrapper ? value : new Wrapper(value);
  }
  #validate(data: Wrapper.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: Wrapper.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof Wrapper>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof Wrapper)(data) as this);
  }
  setPayload(value: Date | {
    d: Date;
  }) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      payload: value as Date | {
        d: Date;
      }
    }) as this);
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
