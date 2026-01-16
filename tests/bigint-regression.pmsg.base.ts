/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/bigint-regression.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Wrapper_Payload_Union1 = Symbol("Wrapper_Payload_Union1");
export class Wrapper_Payload_Union1 extends Message<Wrapper_Payload_Union1.Data> {
  static $typeId = "tests/bigint-regression.pmsg#Wrapper_Payload_Union1";
  static $typeHash = "sha256:d77490284cd33b0703a62b050c0835af4423d457903e70d04da8bbab2370b335";
  static $instanceTag = Symbol.for("propane:message:" + Wrapper_Payload_Union1.$typeId);
  static readonly $typeName = "Wrapper_Payload_Union1";
  static EMPTY: Wrapper_Payload_Union1;
  #id!: bigint;
  constructor(props?: Wrapper_Payload_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper_Payload_Union1.EMPTY) return Wrapper_Payload_Union1.EMPTY;
    super(TYPE_TAG_Wrapper_Payload_Union1, "Wrapper_Payload_Union1");
    this.#id = (props ? props.id : 0n) as bigint;
    if (!props) Wrapper_Payload_Union1.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper_Payload_Union1.Data>[] {
    return [{
      name: "id",
      fieldNumber: null,
      getValue: () => this.#id
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Wrapper_Payload_Union1.Data {
    const props = {} as Partial<Wrapper_Payload_Union1.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "bigint")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as bigint;
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
  get id(): bigint {
    return this.#id;
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
  setId(value: bigint) {
    return this.$update(new (this.constructor as typeof Wrapper_Payload_Union1)({
      id: value
    }) as this);
  }
}
export namespace Wrapper_Payload_Union1 {
  export type Data = {
    id: bigint;
  };
  export type Value = Wrapper_Payload_Union1 | Wrapper_Payload_Union1.Data;
}
const TYPE_TAG_Wrapper = Symbol("Wrapper");
export class Wrapper extends Message<Wrapper.Data> {
  static $typeId = "tests/bigint-regression.pmsg#Wrapper";
  static $typeHash = "sha256:0a89227d9a2a51d9826f15fc6509270cdb93366790999ee19dd3dd381f08b3f1";
  static $instanceTag = Symbol.for("propane:message:" + Wrapper.$typeId);
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #payload!: bigint | Wrapper_Payload_Union1;
  constructor(props?: Wrapper.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(TYPE_TAG_Wrapper, "Wrapper");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#payload = (props ? props.payload : 0n) as bigint | Wrapper_Payload_Union1;
    if (!props) Wrapper.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper.Data>[] {
    return [{
      name: "payload",
      fieldNumber: null,
      getValue: () => this.#payload as bigint | Wrapper_Payload_Union1,
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
    if (!(typeof payloadUnionValue === "bigint" || Wrapper_Payload_Union1.isInstance(payloadUnionValue))) throw new Error("Invalid value for property \"payload\".");
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
  get payload(): bigint | Wrapper_Payload_Union1 {
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
  setPayload(value: bigint | Wrapper_Payload_Union1) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      payload: value as bigint | Wrapper_Payload_Union1
    }) as this);
  }
}
export namespace Wrapper {
  export type Data = {
    payload: bigint | Wrapper_Payload_Union1;
  };
  export type Value = Wrapper | Wrapper.Data;
  export import Payload_Union1 = Wrapper_Payload_Union1;
}
