/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/union-string-bool.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_UnionStringBool = Symbol("UnionStringBool");
export class UnionStringBool extends Message<UnionStringBool.Data> {
  static $typeId = "tests/union-string-bool.pmsg#UnionStringBool";
  static $typeHash = "sha256:11d23d2c721774f572a1fd342f2c69f25c38f65537cb114471d9feb88a48bc56";
  static $instanceTag = Symbol.for("propane:message:" + UnionStringBool.$typeId);
  static readonly $typeName = "UnionStringBool";
  static EMPTY: UnionStringBool;
  #value!: string | boolean;
  #optional!: string | boolean | undefined;
  constructor(props?: UnionStringBool.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UnionStringBool.EMPTY) return UnionStringBool.EMPTY;
    super(TYPE_TAG_UnionStringBool, "UnionStringBool");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = (props ? props.value : "") as string | boolean;
    this.#optional = (props ? props.optional : undefined) as string | boolean;
    if (!props) UnionStringBool.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UnionStringBool.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as string | boolean,
      unionHasString: true
    }, {
      name: "optional",
      fieldNumber: 2,
      getValue: () => this.#optional as string | boolean,
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): UnionStringBool.Data {
    const props = {} as Partial<UnionStringBool.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string" || typeof valueValue === "boolean")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as string | boolean;
    const optionalValue = entries["2"] === undefined ? entries["optional"] : entries["2"];
    const optionalNormalized = optionalValue === null ? undefined : optionalValue;
    if (optionalNormalized !== undefined && !(typeof optionalNormalized === "string" || typeof optionalNormalized === "boolean")) throw new Error("Invalid value for property \"optional\".");
    props.optional = optionalNormalized as string | boolean;
    return props as UnionStringBool.Data;
  }
  static from(value: UnionStringBool.Value): UnionStringBool {
    return value instanceof UnionStringBool ? value : new UnionStringBool(value);
  }
  #validate(data: UnionStringBool.Value | undefined) {
    if (data === undefined) return;
  }
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
  static deserialize<T extends typeof UnionStringBool>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for UnionStringBool.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected UnionStringBool.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): string | boolean {
    return this.#value;
  }
  get optional(): string | boolean | undefined {
    return this.#optional;
  }
  set(updates: Partial<SetUpdates<UnionStringBool.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof UnionStringBool)(data) as this);
  }
  setOptional(value: string | boolean | undefined) {
    return this.$update(new (this.constructor as typeof UnionStringBool)({
      value: this.#value as string | boolean,
      optional: value as string | boolean
    }) as this);
  }
  setValue(value: string | boolean) {
    return this.$update(new (this.constructor as typeof UnionStringBool)({
      value: value as string | boolean,
      optional: this.#optional as string | boolean
    }) as this);
  }
  unsetOptional() {
    return this.$update(new (this.constructor as typeof UnionStringBool)({
      value: this.#value as string | boolean
    }) as this);
  }
}
export namespace UnionStringBool {
  export type Data = {
    value: string | boolean;
    optional?: string | boolean | undefined;
  };
  export type Value = UnionStringBool | UnionStringBool.Data;
}
