/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/repro-empty-new.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
export class UnionFirstNumber extends Message<UnionFirstNumber.Data> {
  static TYPE_TAG = Symbol("UnionFirstNumber");
  static readonly $typeName = "UnionFirstNumber";
  static EMPTY: UnionFirstNumber;
  #val!: number | string;
  constructor(props?: UnionFirstNumber.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UnionFirstNumber.EMPTY) return UnionFirstNumber.EMPTY;
    super(UnionFirstNumber.TYPE_TAG, "UnionFirstNumber");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#val = props ? props.val : 0;
    if (!props) UnionFirstNumber.EMPTY = this;
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
  #validate(data: UnionFirstNumber.Value | undefined) {}
  static validateAll(data: UnionFirstNumber.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  get val(): number | string {
    return this.#val;
  }
  set(updates: Partial<SetUpdates<UnionFirstNumber.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof UnionFirstNumber)(data));
  }
  setVal(value: number | string) {
    return this.$update(new (this.constructor as typeof UnionFirstNumber)({
      val: value
    }));
  }
}
export namespace UnionFirstNumber {
  export type Data = {
    val: number | string;
  };
  export type Value = UnionFirstNumber | UnionFirstNumber.Data;
}
export class UnionFirstString extends Message<UnionFirstString.Data> {
  static TYPE_TAG = Symbol("UnionFirstString");
  static readonly $typeName = "UnionFirstString";
  static EMPTY: UnionFirstString;
  #val!: string | number;
  constructor(props?: UnionFirstString.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UnionFirstString.EMPTY) return UnionFirstString.EMPTY;
    super(UnionFirstString.TYPE_TAG, "UnionFirstString");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#val = props ? props.val : "";
    if (!props) UnionFirstString.EMPTY = this;
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
  #validate(data: UnionFirstString.Value | undefined) {}
  static validateAll(data: UnionFirstString.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  get val(): string | number {
    return this.#val;
  }
  set(updates: Partial<SetUpdates<UnionFirstString.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof UnionFirstString)(data));
  }
  setVal(value: string | number) {
    return this.$update(new (this.constructor as typeof UnionFirstString)({
      val: value
    }));
  }
}
export namespace UnionFirstString {
  export type Data = {
    val: string | number;
  };
  export type Value = UnionFirstString | UnionFirstString.Data;
}
export class OptionalField extends Message<OptionalField.Data> {
  static TYPE_TAG = Symbol("OptionalField");
  static readonly $typeName = "OptionalField";
  static EMPTY: OptionalField;
  #val!: string;
  constructor(props?: OptionalField.Value) {
    if (!props && OptionalField.EMPTY) return OptionalField.EMPTY;
    super(OptionalField.TYPE_TAG, "OptionalField");
    this.#val = props ? props.val : undefined;
    if (!props) OptionalField.EMPTY = this;
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
  deleteVal() {
    return this.$update(new (this.constructor as typeof OptionalField)({}));
  }
  set(updates: Partial<SetUpdates<OptionalField.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof OptionalField)(data));
  }
  setVal(value: string) {
    return this.$update(new (this.constructor as typeof OptionalField)({
      val: value
    }));
  }
}
export namespace OptionalField {
  export type Data = {
    val?: string | undefined;
  };
  export type Value = OptionalField | OptionalField.Data;
}
export class RequiredMessage extends Message<RequiredMessage.Data> {
  static TYPE_TAG = Symbol("RequiredMessage");
  static readonly $typeName = "RequiredMessage";
  static EMPTY: RequiredMessage;
  #sub!: UnionFirstNumber;
  constructor(props?: RequiredMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && RequiredMessage.EMPTY) return RequiredMessage.EMPTY;
    super(RequiredMessage.TYPE_TAG, "RequiredMessage");
    this.#sub = props ? props.sub instanceof UnionFirstNumber ? props.sub : new UnionFirstNumber(props.sub, options) : new UnionFirstNumber();
    if (!props) RequiredMessage.EMPTY = this;
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
  override [WITH_CHILD](key: string | number, child: unknown): RequiredMessage {
    switch (key) {
      case "sub":
        return new (this.constructor as typeof RequiredMessage)({
          sub: child as UnionFirstNumber
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["sub", this.#sub] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get sub(): UnionFirstNumber {
    return this.#sub;
  }
  set(updates: Partial<SetUpdates<RequiredMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof RequiredMessage)(data));
  }
  setSub(value: UnionFirstNumber.Value) {
    return this.$update(new (this.constructor as typeof RequiredMessage)({
      sub: value instanceof UnionFirstNumber ? value : new UnionFirstNumber(value)
    }));
  }
}
export namespace RequiredMessage {
  export type Data = {
    sub: UnionFirstNumber.Value;
  };
  export type Value = RequiredMessage | RequiredMessage.Data;
}
