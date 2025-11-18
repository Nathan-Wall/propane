// Generated from tests/union-string-bool.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export namespace UnionStringBool {
  export type Data = {
    value: string | boolean;
    optional?: string | boolean;
  };
  export type Value = UnionStringBool | UnionStringBool.Data;
}
export class UnionStringBool extends Message<UnionStringBool.Data> {
  static #typeTag = Symbol("UnionStringBool");
  #value: string | boolean;
  #optional: string | boolean;
  constructor(props: UnionStringBool.Value) {
    super(UnionStringBool.#typeTag);
    this.#value = props.value;
    this.#optional = props.optional;
  }
  get value(): string | boolean {
    return this.#value;
  }
  get optional(): string | boolean {
    return this.#optional;
  }
  setValue(value: string | boolean): UnionStringBool {
    return new UnionStringBool({
      value: value,
      optional: this.#optional
    });
  }
  setOptional(value: string | boolean): UnionStringBool {
    return new UnionStringBool({
      value: this.#value,
      optional: value
    });
  }
  deleteOptional(): UnionStringBool {
    return new UnionStringBool({
      value: this.#value
    });
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
}