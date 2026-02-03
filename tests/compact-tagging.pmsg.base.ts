/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/compact-tagging.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";

// @compact('Z')
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_CompactTiny = Symbol("CompactTiny");
export class CompactTiny extends Message<CompactTiny.Data> {
  static $typeId = "tests/compact-tagging.pmsg#CompactTiny";
  static $typeHash = "sha256:fdbcf560e61cba5cebda1d23b6fe5b7e50250f2378229c988a252159d9cb5249";
  static $instanceTag = Symbol.for("propane:message:" + CompactTiny.$typeId);
  static override readonly $compact = true;
  static override readonly $compactTag = "Z";
  static readonly $typeName = "CompactTiny";
  static EMPTY: CompactTiny;
  #value!: string;
  constructor(props?: CompactTiny.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && CompactTiny.EMPTY) return CompactTiny.EMPTY;
    super(TYPE_TAG_CompactTiny, "CompactTiny");
    this.#value = (props ? props.value : "") as string;
    if (!props) CompactTiny.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<CompactTiny.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): CompactTiny.Data {
    const props = {} as Partial<CompactTiny.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as string;
    return props as CompactTiny.Data;
  }
  override toCompact(): string {
    return this.value;
  }
  static override fromCompact(...args: unknown[]) {
    const maybeOptions = args[args.length - 1];
    const options = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? maybeOptions as {
      skipValidation: boolean;
    } : undefined;
    const valueIndex = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? args.length - 2 : args.length - 1;
    const value = args[valueIndex];
    const resolvedValue = value === undefined && !(typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions) && args.length > 1 ? args[args.length - 2] : value;
    if (typeof resolvedValue !== "string") throw new Error("Compact message fromCompact expects a string value.");
    return new (this as any)({
      value: resolvedValue
    }, options);
  }
  static from(value: CompactTiny.Value): CompactTiny {
    return value instanceof CompactTiny ? value : new CompactTiny(value);
  }
  static deserialize<T extends typeof CompactTiny>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for CompactTiny.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected CompactTiny.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<CompactTiny.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof CompactTiny)(data) as this);
  }
  setValue(value: string) {
    return this.$update(new (this.constructor as typeof CompactTiny)({
      value: value
    }) as this);
  }
}
export namespace CompactTiny {
  export type Data = {
    value: string;
  };
  export type Value = CompactTiny | CompactTiny.Data;
} // @compact
const TYPE_TAG_CompactFull = Symbol("CompactFull");
export class CompactFull extends Message<CompactFull.Data> {
  static $typeId = "tests/compact-tagging.pmsg#CompactFull";
  static $typeHash = "sha256:2826d4cc470923a595b170c8fcddd7d0044a3e1381efd69131193ddc0e8355f8";
  static $instanceTag = Symbol.for("propane:message:" + CompactFull.$typeId);
  static override readonly $compact = true;
  static readonly $typeName = "CompactFull";
  static EMPTY: CompactFull;
  #value!: string;
  constructor(props?: CompactFull.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && CompactFull.EMPTY) return CompactFull.EMPTY;
    super(TYPE_TAG_CompactFull, "CompactFull");
    this.#value = (props ? props.value : "") as string;
    if (!props) CompactFull.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<CompactFull.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): CompactFull.Data {
    const props = {} as Partial<CompactFull.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as string;
    return props as CompactFull.Data;
  }
  override toCompact(): string {
    return this.value;
  }
  static override fromCompact(...args: unknown[]) {
    const maybeOptions = args[args.length - 1];
    const options = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? maybeOptions as {
      skipValidation: boolean;
    } : undefined;
    const valueIndex = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? args.length - 2 : args.length - 1;
    const value = args[valueIndex];
    const resolvedValue = value === undefined && !(typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions) && args.length > 1 ? args[args.length - 2] : value;
    if (typeof resolvedValue !== "string") throw new Error("Compact message fromCompact expects a string value.");
    return new (this as any)({
      value: resolvedValue
    }, options);
  }
  static from(value: CompactFull.Value): CompactFull {
    return value instanceof CompactFull ? value : new CompactFull(value);
  }
  static deserialize<T extends typeof CompactFull>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for CompactFull.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected CompactFull.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<CompactFull.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof CompactFull)(data) as this);
  }
  setValue(value: string) {
    return this.$update(new (this.constructor as typeof CompactFull)({
      value: value
    }) as this);
  }
}
export namespace CompactFull {
  export type Data = {
    value: string;
  };
  export type Value = CompactFull | CompactFull.Data;
}
const TYPE_TAG_CompactUnion = Symbol("CompactUnion");
export class CompactUnion extends Message<CompactUnion.Data> {
  static $typeId = "tests/compact-tagging.pmsg#CompactUnion";
  static $typeHash = "sha256:2de95a8438ec1ef635876f5da23c2b5c2d62c9f68180f73b6a5be9a5c1b78d78";
  static $instanceTag = Symbol.for("propane:message:" + CompactUnion.$typeId);
  static readonly $typeName = "CompactUnion";
  static EMPTY: CompactUnion;
  #value!: CompactFull | number;
  constructor(props?: CompactUnion.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && CompactUnion.EMPTY) return CompactUnion.EMPTY;
    super(TYPE_TAG_CompactUnion, "CompactUnion");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = (props ? (value => {
      let result = value as any;
      const isMessage = Message.isMessage(value);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        let matched = false;
        if (!matched) {
          if (CompactFull.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              result = new CompactFull(value as any, options);
              matched = true;
            }
          }
        }
      }
      return result;
    })(props.value) : new CompactFull()) as CompactFull | number;
    if (!props) CompactUnion.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<CompactUnion.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as CompactFull | number | CompactFull | number,
      unionMessageTypes: ["CompactFull"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): CompactUnion.Data {
    const props = {} as Partial<CompactUnion.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    let valueUnionValue: any = valueValue as any;
    if (isTaggedMessageData(valueValue)) {
      if (valueValue.$tag === "CompactFull") {
        if (typeof valueValue.$data === "string") {
          if (CompactFull.$compact === true) {
            valueUnionValue = CompactFull.fromCompact(CompactFull.$compactTag && valueValue.$data.startsWith(CompactFull.$compactTag) ? valueValue.$data.slice(CompactFull.$compactTag.length) : valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (CompactFull).");
          }
        } else {
          valueUnionValue = new CompactFull(CompactFull.prototype.$fromEntries(valueValue.$data, options), options);
        }
      }
    }
    if (typeof valueValue === "string") {
      if (CompactFull.$compactTag && valueValue.startsWith(CompactFull.$compactTag)) {
        if (CompactFull.$compact === true) {
          valueUnionValue = CompactFull.fromCompact(CompactFull.$compactTag && valueValue.startsWith(CompactFull.$compactTag) ? valueValue.slice(CompactFull.$compactTag.length) : valueValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"value\" (CompactFull).");
        }
      }
    }
    if (!isTaggedMessageData(valueValue) && typeof valueValue === "object" && valueValue !== null) {
      let valueUnionValueMatched = false;
      if (!valueUnionValueMatched) {
        if (valueValue as object instanceof CompactFull) {
          valueUnionValue = valueValue as any;
          valueUnionValueMatched = true;
        } else {
          valueUnionValue = new CompactFull(CompactFull.prototype.$fromEntries(valueValue as Record<string, unknown>, options), options);
          valueUnionValueMatched = true;
        }
      }
    }
    if (!(typeof valueUnionValue === "number" || CompactFull.isInstance(valueUnionValue))) throw new Error("Invalid value for property \"value\".");
    props.value = valueUnionValue;
    return props as CompactUnion.Data;
  }
  static from(value: CompactUnion.Value): CompactUnion {
    return value instanceof CompactUnion ? value : new CompactUnion(value);
  }
  #validate(data: CompactUnion.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: CompactUnion.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof CompactUnion>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for CompactUnion.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected CompactUnion.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): CompactFull | number {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<CompactUnion.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof CompactUnion)(data) as this);
  }
  setValue(value: CompactFull | number | CompactFull | number) {
    return this.$update(new (this.constructor as typeof CompactUnion)({
      value: value as CompactFull | number | CompactFull | number
    }) as this);
  }
}
export namespace CompactUnion {
  export type Data = {
    value: CompactFull | number | CompactFull | number;
  };
  export type Value = CompactUnion | CompactUnion.Data;
}
const TYPE_TAG_CompactUnionWithString = Symbol("CompactUnionWithString");
export class CompactUnionWithString extends Message<CompactUnionWithString.Data> {
  static $typeId = "tests/compact-tagging.pmsg#CompactUnionWithString";
  static $typeHash = "sha256:8b6224729bb43aa52898ffee5a8f897311e3d83e1b97e83091883af86ee951b8";
  static $instanceTag = Symbol.for("propane:message:" + CompactUnionWithString.$typeId);
  static readonly $typeName = "CompactUnionWithString";
  static EMPTY: CompactUnionWithString;
  #value!: CompactTiny | string;
  constructor(props?: CompactUnionWithString.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && CompactUnionWithString.EMPTY) return CompactUnionWithString.EMPTY;
    super(TYPE_TAG_CompactUnionWithString, "CompactUnionWithString");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = (props ? (value => {
      let result = value as any;
      const isMessage = Message.isMessage(value);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        let matched = false;
        if (!matched) {
          if (CompactTiny.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              result = new CompactTiny(value as any, options);
              matched = true;
            }
          }
        }
      }
      return result;
    })(props.value) : new CompactTiny()) as CompactTiny | string;
    if (!props) CompactUnionWithString.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<CompactUnionWithString.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as CompactTiny | string | CompactTiny | string,
      unionMessageTypes: ["CompactTiny"],
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): CompactUnionWithString.Data {
    const props = {} as Partial<CompactUnionWithString.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    let valueUnionValue: any = valueValue as any;
    if (isTaggedMessageData(valueValue)) {
      if (valueValue.$tag === "CompactTiny") {
        if (typeof valueValue.$data === "string") {
          if (CompactTiny.$compact === true) {
            valueUnionValue = CompactTiny.fromCompact(CompactTiny.$compactTag && valueValue.$data.startsWith(CompactTiny.$compactTag) ? valueValue.$data.slice(CompactTiny.$compactTag.length) : valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (CompactTiny).");
          }
        } else {
          valueUnionValue = new CompactTiny(CompactTiny.prototype.$fromEntries(valueValue.$data, options), options);
        }
      }
    }
    if (typeof valueValue === "string") {
      if (CompactTiny.$compactTag && valueValue.startsWith(CompactTiny.$compactTag)) {
        if (CompactTiny.$compact === true) {
          valueUnionValue = CompactTiny.fromCompact(CompactTiny.$compactTag && valueValue.startsWith(CompactTiny.$compactTag) ? valueValue.slice(CompactTiny.$compactTag.length) : valueValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"value\" (CompactTiny).");
        }
      }
    }
    if (!isTaggedMessageData(valueValue) && typeof valueValue === "object" && valueValue !== null) {
      let valueUnionValueMatched = false;
      if (!valueUnionValueMatched) {
        if (valueValue as object instanceof CompactTiny) {
          valueUnionValue = valueValue as any;
          valueUnionValueMatched = true;
        } else {
          valueUnionValue = new CompactTiny(CompactTiny.prototype.$fromEntries(valueValue as Record<string, unknown>, options), options);
          valueUnionValueMatched = true;
        }
      }
    }
    if (!(typeof valueUnionValue === "string" || CompactTiny.isInstance(valueUnionValue))) throw new Error("Invalid value for property \"value\".");
    props.value = valueUnionValue;
    return props as CompactUnionWithString.Data;
  }
  static from(value: CompactUnionWithString.Value): CompactUnionWithString {
    return value instanceof CompactUnionWithString ? value : new CompactUnionWithString(value);
  }
  #validate(data: CompactUnionWithString.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: CompactUnionWithString.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof CompactUnionWithString>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for CompactUnionWithString.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected CompactUnionWithString.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): CompactTiny | string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<CompactUnionWithString.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof CompactUnionWithString)(data) as this);
  }
  setValue(value: CompactTiny | string | CompactTiny | string) {
    return this.$update(new (this.constructor as typeof CompactUnionWithString)({
      value: value as CompactTiny | string | CompactTiny | string
    }) as this);
  }
}
export namespace CompactUnionWithString {
  export type Data = {
    value: CompactTiny | string | CompactTiny | string;
  };
  export type Value = CompactUnionWithString | CompactUnionWithString.Data;
}
