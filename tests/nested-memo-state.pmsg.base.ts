/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/nested-memo-state.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// Nested message types for testing memo behavior with state persistence
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_InnerMessage = Symbol("InnerMessage");
export class InnerMessage extends Message<InnerMessage.Data> {
  static $typeId = "tests/nested-memo-state.pmsg#InnerMessage";
  static $typeHash = "sha256:3d6ef0aaadbac2252d4b88fe0dd6c2c0059895ab6b02e9e90058f0eebdbef1e9";
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
    return value instanceof InnerMessage ? value : new InnerMessage(value);
  }
  static deserialize<T extends typeof InnerMessage>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
  static $typeHash = "sha256:36f7592dd1661e323806ada5f952f615d814fa2dac009768dabd2bc19f6b9c2c";
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
    this.#inner = props ? props.inner instanceof InnerMessage ? props.inner : new InnerMessage(props.inner, options) : new InnerMessage();
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
    const innerMessageValue = typeof innerValue === "string" && InnerMessage.$compact === true ? InnerMessage.fromCompact(innerValue, options) as any : innerValue instanceof InnerMessage ? innerValue : new InnerMessage(innerValue as InnerMessage.Value, options);
    props.inner = innerMessageValue;
    return props as OuterMessage.Data;
  }
  static from(value: OuterMessage.Value): OuterMessage {
    return value instanceof OuterMessage ? value : new OuterMessage(value);
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
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
      inner: (value instanceof InnerMessage ? value : new InnerMessage(value)) as InnerMessage.Value
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
