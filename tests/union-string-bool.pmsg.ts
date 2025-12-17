/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/union-string-bool.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class UnionStringBool extends Message<UnionStringBool.Data> {
  static TYPE_TAG = Symbol("UnionStringBool");
  static readonly $typeName = "UnionStringBool";
  static EMPTY: UnionStringBool;
  #value: string | boolean;
  #optional: string | boolean;
  constructor(props?: UnionStringBool.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UnionStringBool.EMPTY) return UnionStringBool.EMPTY;
    super(UnionStringBool.TYPE_TAG, "UnionStringBool");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = props ? props.value : "";
    this.#optional = props ? props.optional : undefined;
    if (!props) UnionStringBool.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UnionStringBool.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }, {
      name: "optional",
      fieldNumber: 2,
      getValue: () => this.#optional
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): UnionStringBool.Data {
    const props = {} as Partial<UnionStringBool.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string" || typeof valueValue === "boolean")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    const optionalValue = entries["2"] === undefined ? entries["optional"] : entries["2"];
    const optionalNormalized = optionalValue === null ? undefined : optionalValue;
    if (optionalNormalized !== undefined && !(typeof optionalNormalized === "string" || typeof optionalNormalized === "boolean")) throw new Error("Invalid value for property \"optional\".");
    props.optional = optionalNormalized;
    return props as UnionStringBool.Data;
  }
  #validate(data) {}
  static validateAll(data: UnionStringBool.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  get value(): string | boolean {
    return this.#value;
  }
  get optional(): string | boolean {
    return this.#optional;
  }
  deleteOptional() {
    return this.$update(new (this.constructor as typeof UnionStringBool)({
      value: this.#value
    }));
  }
  set(updates: Partial<SetUpdates<UnionStringBool.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof UnionStringBool)(data));
  }
  setOptional(value: string | boolean) {
    return this.$update(new (this.constructor as typeof UnionStringBool)({
      value: this.#value,
      optional: value
    }));
  }
  setValue(value: string | boolean) {
    return this.$update(new (this.constructor as typeof UnionStringBool)({
      value: value,
      optional: this.#optional
    }));
  }
}
export namespace UnionStringBool {
  export type Data = {
    value: string | boolean;
    optional?: string | boolean | undefined;
  };
  export type Value = UnionStringBool | UnionStringBool.Data;
}
