/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/repro-empty-new.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export class UnionFirstNumber extends Message<UnionFirstNumber.Data> {
  static TYPE_TAG = Symbol("UnionFirstNumber");
  static EMPTY: UnionFirstNumber;
  #val: number | string;
  constructor(props?: UnionFirstNumber.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && UnionFirstNumber.EMPTY) return UnionFirstNumber.EMPTY;
    super(UnionFirstNumber.TYPE_TAG, "UnionFirstNumber", listeners);
    this.#val = props ? props.val : 0;
    if (!props && !listeners) UnionFirstNumber.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UnionFirstNumber.Data>[] {
    return [{
      name: "val",
      fieldNumber: null,
      getValue: () => this.#val
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): UnionFirstNumber.Data {
    const props = {} as Partial<UnionFirstNumber.Data>;
    const valValue = entries["val"];
    if (valValue === undefined) throw new Error("Missing required property \"val\".");
    if (!(typeof valValue === "number" || typeof valValue === "string")) throw new Error("Invalid value for property \"val\".");
    props.val = valValue;
    return props as UnionFirstNumber.Data;
  }
  get val(): number | string {
    return this.#val;
  }
  setVal(value: number | string): UnionFirstNumber {
    return this.$update(new UnionFirstNumber({
      val: value
    }, this.$listeners));
  }
}
export namespace UnionFirstNumber {
  export interface Data {
    val: number | string;
  }
  export type Value = UnionFirstNumber | UnionFirstNumber.Data;
}
export class UnionFirstString extends Message<UnionFirstString.Data> {
  static TYPE_TAG = Symbol("UnionFirstString");
  static EMPTY: UnionFirstString;
  #val: string | number;
  constructor(props?: UnionFirstString.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && UnionFirstString.EMPTY) return UnionFirstString.EMPTY;
    super(UnionFirstString.TYPE_TAG, "UnionFirstString", listeners);
    this.#val = props ? props.val : "";
    if (!props && !listeners) UnionFirstString.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UnionFirstString.Data>[] {
    return [{
      name: "val",
      fieldNumber: null,
      getValue: () => this.#val
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): UnionFirstString.Data {
    const props = {} as Partial<UnionFirstString.Data>;
    const valValue = entries["val"];
    if (valValue === undefined) throw new Error("Missing required property \"val\".");
    if (!(typeof valValue === "string" || typeof valValue === "number")) throw new Error("Invalid value for property \"val\".");
    props.val = valValue;
    return props as UnionFirstString.Data;
  }
  get val(): string | number {
    return this.#val;
  }
  setVal(value: string | number): UnionFirstString {
    return this.$update(new UnionFirstString({
      val: value
    }, this.$listeners));
  }
}
export namespace UnionFirstString {
  export interface Data {
    val: string | number;
  }
  export type Value = UnionFirstString | UnionFirstString.Data;
}
export class OptionalField extends Message<OptionalField.Data> {
  static TYPE_TAG = Symbol("OptionalField");
  static EMPTY: OptionalField;
  #val: string;
  constructor(props?: OptionalField.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && OptionalField.EMPTY) return OptionalField.EMPTY;
    super(OptionalField.TYPE_TAG, "OptionalField", listeners);
    this.#val = props ? props.val : undefined;
    if (!props && !listeners) OptionalField.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OptionalField.Data>[] {
    return [{
      name: "val",
      fieldNumber: null,
      getValue: () => this.#val
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): OptionalField.Data {
    const props = {} as Partial<OptionalField.Data>;
    const valValue = entries["val"];
    const valNormalized = valValue === null ? undefined : valValue;
    if (valNormalized !== undefined && !(typeof valNormalized === "string")) throw new Error("Invalid value for property \"val\".");
    props.val = valNormalized;
    return props as OptionalField.Data;
  }
  get val(): string {
    return this.#val;
  }
  deleteVal(): OptionalField {
    return this.$update(new OptionalField({}, this.$listeners));
  }
  setVal(value: string): OptionalField {
    return this.$update(new OptionalField({
      val: value
    }, this.$listeners));
  }
}
export namespace OptionalField {
  export interface Data {
    val?: string | undefined;
  }
  export type Value = OptionalField | OptionalField.Data;
}
export class RequiredMessage extends Message<RequiredMessage.Data> {
  static TYPE_TAG = Symbol("RequiredMessage");
  static EMPTY: RequiredMessage;
  #sub: UnionFirstNumber;
  constructor(props?: RequiredMessage.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && RequiredMessage.EMPTY) return RequiredMessage.EMPTY;
    super(RequiredMessage.TYPE_TAG, "RequiredMessage", listeners);
    this.#sub = props ? props.sub instanceof UnionFirstNumber ? props.sub : new UnionFirstNumber(props.sub) : new UnionFirstNumber();
    if (!props && !listeners) RequiredMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<RequiredMessage.Data>[] {
    return [{
      name: "sub",
      fieldNumber: null,
      getValue: () => this.#sub
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): RequiredMessage.Data {
    const props = {} as Partial<RequiredMessage.Data>;
    const subValue = entries["sub"];
    if (subValue === undefined) throw new Error("Missing required property \"sub\".");
    const subMessageValue = subValue instanceof UnionFirstNumber ? subValue : new UnionFirstNumber(subValue);
    props.sub = subMessageValue;
    return props as RequiredMessage.Data;
  }
  get sub(): UnionFirstNumber {
    return this.#sub;
  }
  setSub(value: UnionFirstNumber.Value): RequiredMessage {
    return this.$update(new RequiredMessage({
      sub: value instanceof UnionFirstNumber ? value : new UnionFirstNumber(value)
    }, this.$listeners));
  }
}
export namespace RequiredMessage {
  export interface Data {
    sub: UnionFirstNumber.Value;
  }
  export type Value = RequiredMessage | RequiredMessage.Data;
}