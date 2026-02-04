/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/bigint-regression.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Wrapper_Payload_Union1 = Symbol("Wrapper_Payload_Union1");
export class Wrapper_Payload_Union1 extends Message<Wrapper_Payload_Union1.Data> {
  static $typeId = "tests/bigint-regression.pmsg#Wrapper_Payload_Union1";
  static $typeHash = "sha256:3eb8f5e7ce52caf562afc86bc6701b457bf3e7082c1835f494cbf38c4f2fb2c2";
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
    return Wrapper_Payload_Union1.isInstance(value) ? value : new Wrapper_Payload_Union1(value);
  }
  static deserialize<T extends typeof Wrapper_Payload_Union1>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for Wrapper_Payload_Union1.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Wrapper_Payload_Union1.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
  static $typeHash = "sha256:e70dd6302cfd8a756208960030d2bb6e53f46a3fae34a8887e737cff5a360ad8";
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
    this.#payload = (props ? (value => {
      let result = value as any;
      const isMessage = Message.isMessage(value);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        let matched = false;
        if (!matched) {
          if (Wrapper_Payload_Union1.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              result = new Wrapper_Payload_Union1(value as any, options);
              matched = true;
            }
          }
        }
      }
      return result;
    })(props.payload) : 0n) as bigint | Wrapper_Payload_Union1;
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
            payloadUnionValue = Wrapper_Payload_Union1.fromCompact(Wrapper_Payload_Union1.$compactTag && payloadValue.$data.startsWith(Wrapper_Payload_Union1.$compactTag) ? payloadValue.$data.slice(Wrapper_Payload_Union1.$compactTag.length) : payloadValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"payload\" (Wrapper_Payload_Union1).");
          }
        } else {
          payloadUnionValue = new Wrapper_Payload_Union1(Wrapper_Payload_Union1.prototype.$fromEntries(payloadValue.$data, options), options);
        }
      }
    }
    if (typeof payloadValue === "string") {
      if (Wrapper_Payload_Union1.$compactTag && payloadValue.startsWith(Wrapper_Payload_Union1.$compactTag)) {
        if (Wrapper_Payload_Union1.$compact === true) {
          payloadUnionValue = Wrapper_Payload_Union1.fromCompact(Wrapper_Payload_Union1.$compactTag && payloadValue.startsWith(Wrapper_Payload_Union1.$compactTag) ? payloadValue.slice(Wrapper_Payload_Union1.$compactTag.length) : payloadValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"payload\" (Wrapper_Payload_Union1).");
        }
      }
    }
    if (!isTaggedMessageData(payloadValue) && typeof payloadValue === "object" && payloadValue !== null) {
      let payloadUnionValueMatched = false;
      if (!payloadUnionValueMatched) {
        if (Wrapper_Payload_Union1.isInstance(payloadValue)) {
          payloadUnionValue = payloadValue as any;
          payloadUnionValueMatched = true;
        } else {
          payloadUnionValue = new Wrapper_Payload_Union1(Wrapper_Payload_Union1.prototype.$fromEntries(payloadValue as Record<string, unknown>, options), options);
          payloadUnionValueMatched = true;
        }
      }
    }
    if (!(typeof payloadUnionValue === "bigint" || Wrapper_Payload_Union1.isInstance(payloadUnionValue))) throw new Error("Invalid value for property \"payload\".");
    props.payload = payloadUnionValue;
    return props as Wrapper.Data;
  }
  static from(value: Wrapper.Value): Wrapper {
    return Wrapper.isInstance(value) ? value : new Wrapper(value);
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
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for Wrapper.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Wrapper.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
