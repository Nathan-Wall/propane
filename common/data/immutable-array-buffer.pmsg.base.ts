/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from common/data/immutable-array-buffer.pmsg
import type { MessageWrapper, MessagePropDescriptor, DataObject, SetUpdates } from "../../runtime/index.js";

// @extend('./immutable-array-buffer.pmsg.ext.ts')
// @compact('B')
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../../runtime/index.js";
const TYPE_TAG_ImmutableArrayBuffer$Base = Symbol("ImmutableArrayBuffer");
export class ImmutableArrayBuffer$Base extends Message<ImmutableArrayBuffer.Data> {
  static $typeId = "common/data/immutable-array-buffer.pmsg#ImmutableArrayBuffer";
  static $typeHash = "sha256:62e0158b263d8d302d03d7c20cdd85a2099751f73120c8832e511717393f7edc";
  static $instanceTag = Symbol.for("propane:message:" + ImmutableArrayBuffer$Base.$typeId);
  static override readonly $compact = true;
  static override readonly $compactTag = "B";
  static readonly $typeName = "ImmutableArrayBuffer";
  static EMPTY: ImmutableArrayBuffer$Base;
  #value!: ArrayBuffer;
  constructor(props?: ImmutableArrayBuffer.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ImmutableArrayBuffer$Base.EMPTY) return ImmutableArrayBuffer$Base.EMPTY;
    super(TYPE_TAG_ImmutableArrayBuffer$Base, "ImmutableArrayBuffer");
    this.#value = (props ? (typeof props === "object" && props !== null && "value" in props ? props as ImmutableArrayBuffer.Data : {
      value: props
    }).value : undefined) as ArrayBuffer;
    if (!props) ImmutableArrayBuffer$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ImmutableArrayBuffer.Data>[] {
    return [{
      name: "value",
      fieldNumber: null,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ImmutableArrayBuffer.Data {
    const props = {} as Partial<ImmutableArrayBuffer.Data>;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    props.value = valueValue as ArrayBuffer;
    return props as ImmutableArrayBuffer.Data;
  }
  static $serialize(value: ArrayBuffer): string {
    throw new Error("ImmutableArrayBuffer.$serialize() is not implemented.");
  }
  static $deserialize(value: string): ArrayBuffer {
    throw new Error("ImmutableArrayBuffer.$deserialize() is not implemented.");
  }
  override toCompact(): string {
    const ctor = this.constructor as any;
    const serializer = ctor.$serialize;
    if (typeof serializer !== "function") throw new Error("ImmutableArrayBuffer.$serialize() is not implemented.");
    const compactValue = serializer.call(ctor, this.value);
    if (typeof compactValue !== "string") throw new Error("ImmutableArrayBuffer.$serialize() must return a string.");
    return compactValue;
  }
  static override fromCompact(...args: unknown[]) {
    const maybeOptions = args[args.length - 1];
    const options = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? maybeOptions as {
      skipValidation: boolean;
    } : undefined;
    const valueIndex = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? args.length - 2 : args.length - 1;
    const value = args[valueIndex];
    const resolvedValue = value === undefined && !(typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions) && args.length > 1 ? args[args.length - 2] : value;
    if (typeof resolvedValue !== "string") throw new Error("Compact message fromCompact expects a string value.");
    const deserializer = this.$deserialize;
    if (typeof deserializer !== "function") throw new Error("ImmutableArrayBuffer.$deserialize() is not implemented.");
    const decoded = deserializer.call(this, resolvedValue);
    return new (this as any)({
      value: decoded
    }, options);
  }
  static from(value: ImmutableArrayBuffer.Value): ImmutableArrayBuffer$Base {
    return value instanceof ImmutableArrayBuffer$Base ? value : new ImmutableArrayBuffer$Base(value);
  }
  static deserialize<T extends typeof ImmutableArrayBuffer$Base>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for ImmutableArrayBuffer.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ImmutableArrayBuffer.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  protected get value(): ArrayBuffer {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<ImmutableArrayBuffer.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ImmutableArrayBuffer$Base)(data) as this);
  }
  setValue(value: ArrayBuffer) {
    return this.$update(new (this.constructor as typeof ImmutableArrayBuffer$Base)({
      value: value
    }) as this);
  }
}
export namespace ImmutableArrayBuffer {
  export type Data = {
    value: ArrayBuffer;
  };
  export type Value = ImmutableArrayBuffer$Base | ImmutableArrayBuffer.Data | ArrayBuffer;
}
