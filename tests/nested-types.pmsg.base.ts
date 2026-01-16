/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Wrapper_Payload_Union1 = Symbol("Wrapper_Payload_Union1");
export class Wrapper_Payload_Union1 extends Message<Wrapper_Payload_Union1.Data> {
  static $typeId = "tests/nested-types.pmsg#Wrapper_Payload_Union1";
  static $typeHash = "sha256:43902a916fc2ce360052ba8ac378f7de64982efd82bdce64ac6d10fe230e4387";
  static $instanceTag = Symbol.for("propane:message:" + Wrapper_Payload_Union1.$typeId);
  static readonly $typeName = "Wrapper_Payload_Union1";
  static EMPTY: Wrapper_Payload_Union1;
  #d!: ImmutableDate;
  constructor(props?: Wrapper_Payload_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper_Payload_Union1.EMPTY) return Wrapper_Payload_Union1.EMPTY;
    super(TYPE_TAG_Wrapper_Payload_Union1, "Wrapper_Payload_Union1");
    this.#d = props ? props.d instanceof ImmutableDate ? props.d : new ImmutableDate(props.d) : new ImmutableDate(0);
    if (!props) Wrapper_Payload_Union1.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper_Payload_Union1.Data>[] {
    return [{
      name: "d",
      fieldNumber: null,
      getValue: () => this.#d as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Wrapper_Payload_Union1.Data {
    const props = {} as Partial<Wrapper_Payload_Union1.Data>;
    const dValue = entries["d"];
    if (dValue === undefined) throw new Error("Missing required property \"d\".");
    if (!(dValue as object instanceof Date || dValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"d\".");
    props.d = dValue as Date;
    return props as Wrapper_Payload_Union1.Data;
  }
  static from(value: Wrapper_Payload_Union1.Value): Wrapper_Payload_Union1 {
    return value instanceof Wrapper_Payload_Union1 ? value : new Wrapper_Payload_Union1(value);
  }
  static deserialize<T extends typeof Wrapper_Payload_Union1>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get d(): ImmutableDate {
    return this.#d;
  }
  set(updates: Partial<SetUpdates<Wrapper_Payload_Union1.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Wrapper_Payload_Union1)(data) as this);
  }
  setD(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Wrapper_Payload_Union1)({
      d: value as ImmutableDate | Date
    }) as this);
  }
}
export namespace Wrapper_Payload_Union1 {
  export type Data = {
    d: ImmutableDate | Date;
  };
  export type Value = Wrapper_Payload_Union1 | Wrapper_Payload_Union1.Data;
}
const TYPE_TAG_Wrapper = Symbol("Wrapper");
export class Wrapper extends Message<Wrapper.Data> {
  static $typeId = "tests/nested-types.pmsg#Wrapper";
  static $typeHash = "sha256:ad6a7ec09f3b6c701ef5f128d0d8a853043c4149f9d4774bfac52c7b330ca4a8";
  static $instanceTag = Symbol.for("propane:message:" + Wrapper.$typeId);
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #payload!: Date | Wrapper_Payload_Union1;
  constructor(props?: Wrapper.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(TYPE_TAG_Wrapper, "Wrapper");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#payload = (props ? props.payload : new ImmutableDate(0)) as Date | Wrapper_Payload_Union1;
    if (!props) Wrapper.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper.Data>[] {
    return [{
      name: "payload",
      fieldNumber: null,
      getValue: () => this.#payload as Date | Wrapper_Payload_Union1,
      unionMessageTypes: ["Wrapper_Payload_Union1"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Wrapper.Data {
    const props = {} as Partial<Wrapper.Data>;
    const payloadValue = entries["payload"];
    if (payloadValue === undefined) throw new Error("Missing required property \"payload\".");
    let payloadUnionValue: any = payloadValue as any;
    if (isTaggedMessageData(payloadValue)) {
      if (payloadValue.$tag === "Wrapper_Payload_Union1") {
        if (typeof payloadValue.$data === "string") {
          if (Wrapper_Payload_Union1.$compact === true) {
            payloadUnionValue = Wrapper_Payload_Union1.fromCompact(payloadValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"payload\" (Wrapper_Payload_Union1).");
          }
        } else {
          payloadUnionValue = new Wrapper_Payload_Union1(Wrapper_Payload_Union1.prototype.$fromEntries(payloadValue.$data, options), options);
        }
      }
    }
    if (!isTaggedMessageData(payloadValue) && typeof payloadValue === "object" && payloadValue !== null) {
      let payloadUnionValueMatched = false;
      if (!payloadUnionValueMatched) {
        if (payloadValue as object instanceof Wrapper_Payload_Union1) {
          payloadUnionValue = payloadValue as any;
          payloadUnionValueMatched = true;
        } else {
          try {
            payloadUnionValue = new Wrapper_Payload_Union1(Wrapper_Payload_Union1.prototype.$fromEntries(payloadValue as Record<string, unknown>, options), options);
            payloadUnionValueMatched = true;
          } catch (e) {}
        }
      }
    }
    if (!(payloadUnionValue as object instanceof Date || payloadUnionValue as object instanceof ImmutableDate || Wrapper_Payload_Union1.isInstance(payloadUnionValue))) throw new Error("Invalid value for property \"payload\".");
    props.payload = payloadUnionValue;
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
  get payload(): Date | Wrapper_Payload_Union1 {
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
  setPayload(value: Date | Wrapper_Payload_Union1) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      payload: value as Date | Wrapper_Payload_Union1
    }) as this);
  }
}
export namespace Wrapper {
  export type Data = {
    payload: Date | Wrapper_Payload_Union1;
  };
  export type Value = Wrapper | Wrapper.Data;
  export import Payload_Union1 = Wrapper_Payload_Union1;
}
