/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/repro-empty-new.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_UnionFirstNumber = Symbol("UnionFirstNumber");
export class UnionFirstNumber extends Message<UnionFirstNumber.Data> {
  static $typeId = "tests/repro-empty-new.pmsg#UnionFirstNumber";
  static $typeHash = "sha256:2d9d159eba20e8f4c15918d455756e54f97fa391b8dea523e6b6e0cc3eb0aee7";
  static $instanceTag = Symbol.for("propane:message:" + UnionFirstNumber.$typeId);
  static readonly $typeName = "UnionFirstNumber";
  static EMPTY: UnionFirstNumber;
  #val!: number | string;
  constructor(props?: UnionFirstNumber.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UnionFirstNumber.EMPTY) return UnionFirstNumber.EMPTY;
    super(TYPE_TAG_UnionFirstNumber, "UnionFirstNumber");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#val = (props ? props.val : 0) as number | string;
    if (!props) UnionFirstNumber.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UnionFirstNumber.Data>[] {
    return [{
      name: "val",
      fieldNumber: null,
      getValue: () => this.#val as number | string,
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): UnionFirstNumber.Data {
    const props = {} as Partial<UnionFirstNumber.Data>;
    const valValue = entries["val"];
    if (valValue === undefined) throw new Error("Missing required property \"val\".");
    if (!(typeof valValue === "number" || typeof valValue === "string")) throw new Error("Invalid value for property \"val\".");
    props.val = valValue as number | string;
    return props as UnionFirstNumber.Data;
  }
  static from(value: UnionFirstNumber.Value): UnionFirstNumber {
    return UnionFirstNumber.isInstance(value) ? value : new UnionFirstNumber(value);
  }
  #validate(data: UnionFirstNumber.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: UnionFirstNumber.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof UnionFirstNumber>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for UnionFirstNumber.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected UnionFirstNumber.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof UnionFirstNumber)(data) as this);
  }
  setVal(value: number | string) {
    return this.$update(new (this.constructor as typeof UnionFirstNumber)({
      val: value as number | string
    }) as this);
  }
}
export namespace UnionFirstNumber {
  export type Data = {
    val: number | string;
  };
  export type Value = UnionFirstNumber | UnionFirstNumber.Data;
}
const TYPE_TAG_UnionFirstString = Symbol("UnionFirstString");
export class UnionFirstString extends Message<UnionFirstString.Data> {
  static $typeId = "tests/repro-empty-new.pmsg#UnionFirstString";
  static $typeHash = "sha256:e9fbb8c2aad3113963b2fa03610cb39052ea5550d76cc93b5fd575dbb58c31e5";
  static $instanceTag = Symbol.for("propane:message:" + UnionFirstString.$typeId);
  static readonly $typeName = "UnionFirstString";
  static EMPTY: UnionFirstString;
  #val!: string | number;
  constructor(props?: UnionFirstString.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UnionFirstString.EMPTY) return UnionFirstString.EMPTY;
    super(TYPE_TAG_UnionFirstString, "UnionFirstString");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#val = (props ? props.val : "") as string | number;
    if (!props) UnionFirstString.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UnionFirstString.Data>[] {
    return [{
      name: "val",
      fieldNumber: null,
      getValue: () => this.#val as string | number,
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): UnionFirstString.Data {
    const props = {} as Partial<UnionFirstString.Data>;
    const valValue = entries["val"];
    if (valValue === undefined) throw new Error("Missing required property \"val\".");
    if (!(typeof valValue === "string" || typeof valValue === "number")) throw new Error("Invalid value for property \"val\".");
    props.val = valValue as string | number;
    return props as UnionFirstString.Data;
  }
  static from(value: UnionFirstString.Value): UnionFirstString {
    return UnionFirstString.isInstance(value) ? value : new UnionFirstString(value);
  }
  #validate(data: UnionFirstString.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: UnionFirstString.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof UnionFirstString>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for UnionFirstString.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected UnionFirstString.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof UnionFirstString)(data) as this);
  }
  setVal(value: string | number) {
    return this.$update(new (this.constructor as typeof UnionFirstString)({
      val: value as string | number
    }) as this);
  }
}
export namespace UnionFirstString {
  export type Data = {
    val: string | number;
  };
  export type Value = UnionFirstString | UnionFirstString.Data;
}
const TYPE_TAG_OptionalField = Symbol("OptionalField");
export class OptionalField extends Message<OptionalField.Data> {
  static $typeId = "tests/repro-empty-new.pmsg#OptionalField";
  static $typeHash = "sha256:2774abcb774c78149f3c871fdba26b34fb89dbb8f6d31b15d512e301e4b2a10b";
  static $instanceTag = Symbol.for("propane:message:" + OptionalField.$typeId);
  static readonly $typeName = "OptionalField";
  static EMPTY: OptionalField;
  #val!: string | undefined;
  constructor(props?: OptionalField.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && OptionalField.EMPTY) return OptionalField.EMPTY;
    super(TYPE_TAG_OptionalField, "OptionalField");
    this.#val = (props ? props.val : undefined) as string;
    if (!props) OptionalField.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OptionalField.Data>[] {
    return [{
      name: "val",
      fieldNumber: null,
      getValue: () => this.#val
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): OptionalField.Data {
    const props = {} as Partial<OptionalField.Data>;
    const valValue = entries["val"];
    const valNormalized = valValue === null ? undefined : valValue;
    if (valNormalized !== undefined && !(typeof valNormalized === "string")) throw new Error("Invalid value for property \"val\".");
    props.val = valNormalized as string;
    return props as OptionalField.Data;
  }
  static from(value: OptionalField.Value): OptionalField {
    return OptionalField.isInstance(value) ? value : new OptionalField(value);
  }
  static deserialize<T extends typeof OptionalField>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for OptionalField.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected OptionalField.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get val(): string | undefined {
    return this.#val;
  }
  set(updates: Partial<SetUpdates<OptionalField.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof OptionalField)(data) as this);
  }
  setVal(value: string | undefined) {
    return this.$update(new (this.constructor as typeof OptionalField)({
      val: value
    }) as this);
  }
  unsetVal() {
    return this.$update(new (this.constructor as typeof OptionalField)({}) as this);
  }
}
export namespace OptionalField {
  export type Data = {
    val?: string | undefined;
  };
  export type Value = OptionalField | OptionalField.Data;
}
const TYPE_TAG_RequiredMessage = Symbol("RequiredMessage");
export class RequiredMessage extends Message<RequiredMessage.Data> {
  static $typeId = "tests/repro-empty-new.pmsg#RequiredMessage";
  static $typeHash = "sha256:374c4df4f53dc9efe2754a1136c83ea98e48fd87233b8471d96387e57d0fefde";
  static $instanceTag = Symbol.for("propane:message:" + RequiredMessage.$typeId);
  static readonly $typeName = "RequiredMessage";
  static EMPTY: RequiredMessage;
  #sub!: UnionFirstNumber;
  constructor(props?: RequiredMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && RequiredMessage.EMPTY) return RequiredMessage.EMPTY;
    super(TYPE_TAG_RequiredMessage, "RequiredMessage");
    this.#sub = props ? UnionFirstNumber.isInstance(props.sub) ? props.sub : new UnionFirstNumber(props.sub, options) : new UnionFirstNumber();
    if (!props) RequiredMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<RequiredMessage.Data>[] {
    return [{
      name: "sub",
      fieldNumber: null,
      getValue: () => this.#sub as UnionFirstNumber.Value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): RequiredMessage.Data {
    const props = {} as Partial<RequiredMessage.Data>;
    const subValue = entries["sub"];
    if (subValue === undefined) throw new Error("Missing required property \"sub\".");
    const subMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && UnionFirstNumber.$compact === true) {
        result = UnionFirstNumber.fromCompact(UnionFirstNumber.$compactTag && value.startsWith(UnionFirstNumber.$compactTag) ? value.slice(UnionFirstNumber.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "UnionFirstNumber") {
            if (typeof value.$data === "string") {
              if (UnionFirstNumber.$compact === true) {
                result = UnionFirstNumber.fromCompact(UnionFirstNumber.$compactTag && value.$data.startsWith(UnionFirstNumber.$compactTag) ? value.$data.slice(UnionFirstNumber.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for UnionFirstNumber.");
              }
            } else {
              result = new UnionFirstNumber(UnionFirstNumber.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected UnionFirstNumber.");
          }
        } else {
          if (UnionFirstNumber.isInstance(value)) {
            result = value;
          } else {
            result = new UnionFirstNumber(value as UnionFirstNumber.Value, options);
          }
        }
      }
      return result;
    })(subValue);
    props.sub = subMessageValue;
    return props as RequiredMessage.Data;
  }
  static from(value: RequiredMessage.Value): RequiredMessage {
    return RequiredMessage.isInstance(value) ? value : new RequiredMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "sub":
        return new (this.constructor as typeof RequiredMessage)({
          sub: child as UnionFirstNumber.Value
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["sub", this.#sub] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof RequiredMessage>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for RequiredMessage.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected RequiredMessage.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof RequiredMessage)(data) as this);
  }
  setSub(value: UnionFirstNumber.Value) {
    return this.$update(new (this.constructor as typeof RequiredMessage)({
      sub: (UnionFirstNumber.isInstance(value) ? value : new UnionFirstNumber(value)) as UnionFirstNumber.Value
    }) as this);
  }
}
export namespace RequiredMessage {
  export type Data = {
    sub: UnionFirstNumber.Value;
  };
  export type Value = RequiredMessage | RequiredMessage.Data;
}
