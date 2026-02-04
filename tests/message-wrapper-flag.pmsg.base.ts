/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-wrapper-flag.pmsg
import { MessageWrapper, Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// @extend('./message-wrapper-flag.pmsg.ext.ts')
// @compact('W')
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Flag$Base = Symbol("Flag");
export class Flag$Base extends Message<Flag.Data> {
  static $typeId = "tests/message-wrapper-flag.pmsg#Flag";
  static $typeHash = "sha256:cce716a1ca5dd10937d4c7baa93cd4ef25f354b1ebcf732dca14d3acebb13efc";
  static $instanceTag = Symbol.for("propane:message:" + Flag$Base.$typeId);
  static override readonly $compact = true;
  static override readonly $compactTag = "W";
  static readonly $typeName = "Flag";
  static EMPTY: Flag$Base;
  #value!: boolean;
  constructor(props?: Flag.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Flag$Base.EMPTY) return Flag$Base.EMPTY;
    super(TYPE_TAG_Flag$Base, "Flag");
    this.#value = (props ? (typeof props === "object" && props !== null && "value" in props ? props as Flag.Data : {
      value: props
    }).value : undefined) as boolean;
    if (!props) Flag$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Flag.Data>[] {
    return [{
      name: "value",
      fieldNumber: null,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Flag.Data {
    const props = {} as Partial<Flag.Data>;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "boolean")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as boolean;
    return props as Flag.Data;
  }
  static $serialize(value: boolean): string {
    throw new Error("Flag.$serialize() is not implemented.");
  }
  static $deserialize(value: string): boolean {
    throw new Error("Flag.$deserialize() is not implemented.");
  }
  override toCompact(): string {
    const ctor = this.constructor as any;
    const serializer = ctor.$serialize;
    if (typeof serializer !== "function") throw new Error("Flag.$serialize() is not implemented.");
    const compactValue = serializer.call(ctor, this.value);
    if (typeof compactValue !== "string") throw new Error("Flag.$serialize() must return a string.");
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
    if (typeof deserializer !== "function") throw new Error("Flag.$deserialize() is not implemented.");
    const decoded = deserializer.call(this, resolvedValue);
    return new (this as any)({
      value: decoded
    }, options);
  }
  static from(value: Flag.Value): Flag$Base {
    return Flag$Base.isInstance(value) ? value : new Flag$Base(value);
  }
  static deserialize<T extends typeof Flag$Base>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Flag.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Flag.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  protected get value(): boolean {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<Flag.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Flag$Base)(data) as this);
  }
  setValue(value: boolean) {
    return this.$update(new (this.constructor as typeof Flag$Base)({
      value: value
    }) as this);
  }
}
export namespace Flag {
  export type Data = {
    value: boolean;
  };
  export type Value = Flag$Base | Flag.Data | boolean;
}
