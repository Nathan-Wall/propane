/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Wrapper_Payload_Union1 = Symbol("Wrapper_Payload_Union1");
export class Wrapper_Payload_Union1 extends Message<Wrapper_Payload_Union1.Data> {
  static $typeId = "tests/nested-types.pmsg#Wrapper_Payload_Union1";
  static $typeHash = "sha256:e76bc8c8d904f5ed113467dc8f17f7af003e36cb07ae5345e7c21cb520eac98b";
  static $instanceTag = Symbol.for("propane:message:" + Wrapper_Payload_Union1.$typeId);
  static readonly $typeName = "Wrapper_Payload_Union1";
  static EMPTY: Wrapper_Payload_Union1;
  #d!: ImmutableDate;
  constructor(props?: Wrapper_Payload_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper_Payload_Union1.EMPTY) return Wrapper_Payload_Union1.EMPTY;
    super(TYPE_TAG_Wrapper_Payload_Union1, "Wrapper_Payload_Union1");
    this.#d = props ? props.d instanceof ImmutableDate ? props.d : new ImmutableDate(props.d, options) : new ImmutableDate();
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
    const dMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableDate.$compact === true) {
        result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.startsWith(ImmutableDate.$compactTag) ? value.slice(ImmutableDate.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableDate") {
            if (typeof value.$data === "string") {
              if (ImmutableDate.$compact === true) {
                result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.$data.startsWith(ImmutableDate.$compactTag) ? value.$data.slice(ImmutableDate.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableDate.");
              }
            } else {
              result = new ImmutableDate(ImmutableDate.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableDate.");
          }
        } else {
          if (value instanceof ImmutableDate) {
            result = value;
          } else {
            result = new ImmutableDate(value as ImmutableDate.Value, options);
          }
        }
      }
      return result;
    })(dValue);
    props.d = dMessageValue as ImmutableDate | Date;
    return props as Wrapper_Payload_Union1.Data;
  }
  static from(value: Wrapper_Payload_Union1.Value): Wrapper_Payload_Union1 {
    return value instanceof Wrapper_Payload_Union1 ? value : new Wrapper_Payload_Union1(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "d":
        return new (this.constructor as typeof Wrapper_Payload_Union1)({
          d: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["d", this.#d] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
      d: (value instanceof ImmutableDate ? value : new ImmutableDate(value)) as ImmutableDate | Date
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
  static $typeHash = "sha256:35c22cbf1e1eb40d9e1fe3594c2052e7886e32cc1d4c38a3af24d34cac0d3435";
  static $instanceTag = Symbol.for("propane:message:" + Wrapper.$typeId);
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #payload!: ImmutableDate | Wrapper_Payload_Union1;
  constructor(props?: Wrapper.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(TYPE_TAG_Wrapper, "Wrapper");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#payload = props ? (value => {
      if (!options?.skipValidation && true && !(ImmutableDate.isInstance(value) || Wrapper_Payload_Union1.isInstance(value))) throw new Error("Invalid value for property \"payload\".");
      return value;
    })((value => {
      let result = value as any;
      return result;
    })(props.payload)) : new ImmutableDate(0);
    if (!props) Wrapper.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper.Data>[] {
    return [{
      name: "payload",
      fieldNumber: null,
      getValue: () => this.#payload as Date | ImmutableDate | Wrapper_Payload_Union1,
      unionMessageTypes: ["ImmutableDate", "Wrapper_Payload_Union1"]
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
      if (payloadValue.$tag === "ImmutableDate") {
        if (typeof payloadValue.$data === "string") {
          if (ImmutableDate.$compact === true) {
            payloadUnionValue = ImmutableDate.fromCompact(ImmutableDate.$compactTag && payloadValue.$data.startsWith(ImmutableDate.$compactTag) ? payloadValue.$data.slice(ImmutableDate.$compactTag.length) : payloadValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"payload\" (ImmutableDate).");
          }
        } else {
          payloadUnionValue = new ImmutableDate(ImmutableDate.prototype.$fromEntries(payloadValue.$data, options), options);
        }
      } else if (payloadValue.$tag === "Wrapper_Payload_Union1") {
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
      if (ImmutableDate.$compactTag && payloadValue.startsWith(ImmutableDate.$compactTag)) {
        if (ImmutableDate.$compact === true) {
          payloadUnionValue = ImmutableDate.fromCompact(ImmutableDate.$compactTag && payloadValue.startsWith(ImmutableDate.$compactTag) ? payloadValue.slice(ImmutableDate.$compactTag.length) : payloadValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"payload\" (ImmutableDate).");
        }
      } else if (Wrapper_Payload_Union1.$compactTag && payloadValue.startsWith(Wrapper_Payload_Union1.$compactTag)) {
        if (Wrapper_Payload_Union1.$compact === true) {
          payloadUnionValue = Wrapper_Payload_Union1.fromCompact(Wrapper_Payload_Union1.$compactTag && payloadValue.startsWith(Wrapper_Payload_Union1.$compactTag) ? payloadValue.slice(Wrapper_Payload_Union1.$compactTag.length) : payloadValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"payload\" (Wrapper_Payload_Union1).");
        }
      }
    }
    if (!(ImmutableDate.isInstance(payloadUnionValue) || Wrapper_Payload_Union1.isInstance(payloadUnionValue))) throw new Error("Invalid value for property \"payload\".");
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
  get payload(): ImmutableDate | Wrapper_Payload_Union1 {
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
  setPayload(value: Date | ImmutableDate | Wrapper_Payload_Union1) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      payload: value as Date | ImmutableDate | Wrapper_Payload_Union1
    }) as this);
  }
}
export namespace Wrapper {
  export type Data = {
    payload: Date | ImmutableDate | Wrapper_Payload_Union1;
  };
  export type Value = Wrapper | Wrapper.Data;
  export import Payload_Union1 = Wrapper_Payload_Union1;
}
