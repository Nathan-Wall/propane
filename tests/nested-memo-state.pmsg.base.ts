/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-memo-state.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// Nested message types for testing memo behavior with state persistence
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_InnerMessage = Symbol("InnerMessage");
export class InnerMessage extends Message<InnerMessage.Data> {
  static $typeId = "tests/nested-memo-state.pmsg#InnerMessage";
  static $typeHash = "sha256:04ebbc6be4d0b2b7cf6a20f106eacd8b23798fe077f75dedf8ef3ec2ceb83ead";
  static $instanceTag = Symbol.for("propane:message:" + InnerMessage.$typeId);
  static readonly $typeName = "InnerMessage";
  static EMPTY: InnerMessage;
  #value!: string;
  constructor(props?: InnerMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && InnerMessage.EMPTY) return InnerMessage.EMPTY;
    super(TYPE_TAG_InnerMessage, "InnerMessage");
    this.#value = (props ? props.value : "") as string;
    if (!props) InnerMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<InnerMessage.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): InnerMessage.Data {
    const props = {} as Partial<InnerMessage.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as string;
    return props as InnerMessage.Data;
  }
  static from(value: InnerMessage.Value): InnerMessage {
    return InnerMessage.isInstance(value) ? value : new InnerMessage(value);
  }
  static deserialize<T extends typeof InnerMessage>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for InnerMessage.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected InnerMessage.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<InnerMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof InnerMessage)(data) as this);
  }
  setValue(value: string) {
    return this.$update(new (this.constructor as typeof InnerMessage)({
      value: value
    }) as this);
  }
}
export namespace InnerMessage {
  export type Data = {
    value: string;
  };
  export type Value = InnerMessage | InnerMessage.Data;
}
const TYPE_TAG_OuterMessage = Symbol("OuterMessage");
export class OuterMessage extends Message<OuterMessage.Data> {
  static $typeId = "tests/nested-memo-state.pmsg#OuterMessage";
  static $typeHash = "sha256:f57d712128ec5e9545f95c1eb376f143033391bcea90dfd4cc54237c2c3b6496";
  static $instanceTag = Symbol.for("propane:message:" + OuterMessage.$typeId);
  static readonly $typeName = "OuterMessage";
  static EMPTY: OuterMessage;
  #counter!: number;
  #inner!: InnerMessage;
  constructor(props?: OuterMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && OuterMessage.EMPTY) return OuterMessage.EMPTY;
    super(TYPE_TAG_OuterMessage, "OuterMessage");
    this.#counter = (props ? props.counter : 0) as number;
    this.#inner = props ? InnerMessage.isInstance(props.inner) ? props.inner : new InnerMessage(props.inner, options) : new InnerMessage();
    if (!props) OuterMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OuterMessage.Data>[] {
    return [{
      name: "counter",
      fieldNumber: 1,
      getValue: () => this.#counter
    }, {
      name: "inner",
      fieldNumber: 2,
      getValue: () => this.#inner as InnerMessage.Value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): OuterMessage.Data {
    const props = {} as Partial<OuterMessage.Data>;
    const counterValue = entries["1"] === undefined ? entries["counter"] : entries["1"];
    if (counterValue === undefined) throw new Error("Missing required property \"counter\".");
    if (!(typeof counterValue === "number")) throw new Error("Invalid value for property \"counter\".");
    props.counter = counterValue as number;
    const innerValue = entries["2"] === undefined ? entries["inner"] : entries["2"];
    if (innerValue === undefined) throw new Error("Missing required property \"inner\".");
    const innerMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && InnerMessage.$compact === true) {
        result = InnerMessage.fromCompact(InnerMessage.$compactTag && value.startsWith(InnerMessage.$compactTag) ? value.slice(InnerMessage.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "InnerMessage") {
            if (typeof value.$data === "string") {
              if (InnerMessage.$compact === true) {
                result = InnerMessage.fromCompact(InnerMessage.$compactTag && value.$data.startsWith(InnerMessage.$compactTag) ? value.$data.slice(InnerMessage.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for InnerMessage.");
              }
            } else {
              result = new InnerMessage(InnerMessage.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected InnerMessage.");
          }
        } else {
          result = InnerMessage.isInstance(value) ? value : new InnerMessage(value as InnerMessage.Value, options);
        }
      }
      return result;
    })(innerValue);
    props.inner = innerMessageValue;
    return props as OuterMessage.Data;
  }
  static from(value: OuterMessage.Value): OuterMessage {
    return OuterMessage.isInstance(value) ? value : new OuterMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "inner":
        return new (this.constructor as typeof OuterMessage)({
          counter: this.#counter,
          inner: child as InnerMessage.Value
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["inner", this.#inner] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof OuterMessage>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for OuterMessage.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected OuterMessage.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get counter(): number {
    return this.#counter;
  }
  get inner(): InnerMessage {
    return this.#inner;
  }
  set(updates: Partial<SetUpdates<OuterMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof OuterMessage)(data) as this);
  }
  setCounter(value: number) {
    return this.$update(new (this.constructor as typeof OuterMessage)({
      counter: value,
      inner: this.#inner as InnerMessage.Value
    }) as this);
  }
  setInner(value: InnerMessage.Value) {
    return this.$update(new (this.constructor as typeof OuterMessage)({
      counter: this.#counter,
      inner: (InnerMessage.isInstance(value) ? value : new InnerMessage(value)) as InnerMessage.Value
    }) as this);
  }
}
export namespace OuterMessage {
  export type Data = {
    counter: number;
    inner: InnerMessage.Value;
  };
  export type Value = OuterMessage | OuterMessage.Data;
}
