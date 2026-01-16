/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/union-order.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_StringFirst = Symbol("StringFirst");
export class StringFirst extends Message<StringFirst.Data> {
  static $typeId = "tests/union-order.pmsg#StringFirst";
  static $typeHash = "sha256:7647a904382dd6cdab11e007ec6dc4ab3e921b77fc3b98e92c8335277251ab1e";
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
      getValue: () => this.#value as string | number
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
    return value instanceof StringFirst ? value : new StringFirst(value);
  }
  #validate(data: StringFirst.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: StringFirst.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof StringFirst>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
  static $typeHash = "sha256:a71c3dc4010765915b525e2e79ee17fd35a9be2d54e2ad12dd653a3d3feff20d";
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
      getValue: () => this.#value as number | string
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
    return value instanceof NumberFirst ? value : new NumberFirst(value);
  }
  #validate(data: NumberFirst.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: NumberFirst.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof NumberFirst>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
