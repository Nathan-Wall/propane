/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/union-order.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_StringFirst = Symbol("StringFirst");
export class StringFirst extends Message<StringFirst.Data> {
  static $typeId = "tests/union-order.pmsg#StringFirst";
  static $typeHash = "sha256:60cd830704671f72a9af219796b22b3b875430314a0754174afa4c288299e042";
  static $instanceTag = Symbol.for("propane:message:" + StringFirst.$typeId);
  static readonly $typeName = "StringFirst";
  static EMPTY: StringFirst;
  #value!: string | number;
  constructor(props?: StringFirst.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && StringFirst.EMPTY) return StringFirst.EMPTY;
    super(TYPE_TAG_StringFirst, "StringFirst");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = (props ? props.value : "") as string | number;
    if (!props) StringFirst.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<StringFirst.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as string | number,
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): StringFirst.Data {
    const props = {} as Partial<StringFirst.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string" || typeof valueValue === "number")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as string | number;
    return props as StringFirst.Data;
  }
  static from(value: StringFirst.Value): StringFirst {
    return StringFirst.isInstance(value) ? value : new StringFirst(value);
  }
  #validate(data: StringFirst.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: StringFirst.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try { /* noop */ } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof StringFirst>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for StringFirst.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected StringFirst.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): string | number {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<StringFirst.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof StringFirst)(data) as this);
  }
  setValue(value: string | number) {
    return this.$update(new (this.constructor as typeof StringFirst)({
      value: value as string | number
    }) as this);
  }
}
export namespace StringFirst {
  export type Data = {
    value: string | number;
  };
  export type Value = StringFirst | StringFirst.Data;
}
const TYPE_TAG_NumberFirst = Symbol("NumberFirst");
export class NumberFirst extends Message<NumberFirst.Data> {
  static $typeId = "tests/union-order.pmsg#NumberFirst";
  static $typeHash = "sha256:0e89f502606dcf27728445ed3b72a57fc04b9770e98824b7d9ce60cd5218b266";
  static $instanceTag = Symbol.for("propane:message:" + NumberFirst.$typeId);
  static readonly $typeName = "NumberFirst";
  static EMPTY: NumberFirst;
  #value!: number | string;
  constructor(props?: NumberFirst.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && NumberFirst.EMPTY) return NumberFirst.EMPTY;
    super(TYPE_TAG_NumberFirst, "NumberFirst");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = (props ? props.value : 0) as number | string;
    if (!props) NumberFirst.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumberFirst.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as number | string,
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): NumberFirst.Data {
    const props = {} as Partial<NumberFirst.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "number" || typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as number | string;
    return props as NumberFirst.Data;
  }
  static from(value: NumberFirst.Value): NumberFirst {
    return NumberFirst.isInstance(value) ? value : new NumberFirst(value);
  }
  #validate(data: NumberFirst.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: NumberFirst.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try { /* noop */ } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof NumberFirst>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for NumberFirst.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected NumberFirst.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): number | string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<NumberFirst.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof NumberFirst)(data) as this);
  }
  setValue(value: number | string) {
    return this.$update(new (this.constructor as typeof NumberFirst)({
      value: value as number | string
    }) as this);
  }
}
export namespace NumberFirst {
  export type Data = {
    value: number | string;
  };
  export type Value = NumberFirst | NumberFirst.Data;
}
