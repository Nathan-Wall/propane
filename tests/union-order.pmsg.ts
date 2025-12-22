/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/union-order.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class StringFirst extends Message<StringFirst.Data> {
  static TYPE_TAG = Symbol("StringFirst");
  static readonly $typeName = "StringFirst";
  static EMPTY: StringFirst;
  #value!: string | number;
  constructor(props?: StringFirst.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && StringFirst.EMPTY) return StringFirst.EMPTY;
    super(StringFirst.TYPE_TAG, "StringFirst");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = props ? props.value : "";
    if (!props) StringFirst.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<StringFirst.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): StringFirst.Data {
    const props = {} as Partial<StringFirst.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string" || typeof valueValue === "number")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as StringFirst.Data;
  }
  #validate(data: StringFirst.Value | undefined) {}
  static validateAll(data: StringFirst.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
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
    return this.$update(new (this.constructor as typeof StringFirst)(data));
  }
  setValue(value: string | number) {
    return this.$update(new (this.constructor as typeof StringFirst)({
      value: value
    }));
  }
}
export namespace StringFirst {
  export type Data = {
    value: string | number;
  };
  export type Value = StringFirst | StringFirst.Data;
}
export class NumberFirst extends Message<NumberFirst.Data> {
  static TYPE_TAG = Symbol("NumberFirst");
  static readonly $typeName = "NumberFirst";
  static EMPTY: NumberFirst;
  #value!: number | string;
  constructor(props?: NumberFirst.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && NumberFirst.EMPTY) return NumberFirst.EMPTY;
    super(NumberFirst.TYPE_TAG, "NumberFirst");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = props ? props.value : 0;
    if (!props) NumberFirst.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumberFirst.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): NumberFirst.Data {
    const props = {} as Partial<NumberFirst.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "number" || typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as NumberFirst.Data;
  }
  #validate(data: NumberFirst.Value | undefined) {}
  static validateAll(data: NumberFirst.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
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
    return this.$update(new (this.constructor as typeof NumberFirst)(data));
  }
  setValue(value: number | string) {
    return this.$update(new (this.constructor as typeof NumberFirst)({
      value: value
    }));
  }
}
export namespace NumberFirst {
  export type Data = {
    value: number | string;
  };
  export type Value = NumberFirst | NumberFirst.Data;
}
