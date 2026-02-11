/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/url-union.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError, ImmutableUrl } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_UrlUnion_Value_Union1 = Symbol("UrlUnion_Value_Union1");
export class UrlUnion_Value_Union1 extends Message<UrlUnion_Value_Union1.Data> {
  static $typeId = "tests/url-union.pmsg#UrlUnion_Value_Union1";
  static $typeHash = "sha256:878b2e5e8d89e818667dc2418a5f05b383e5c4fb6cf7905abfeeaa9e28930fbe";
  static $instanceTag = Symbol.for("propane:message:" + UrlUnion_Value_Union1.$typeId);
  static readonly $typeName = "UrlUnion_Value_Union1";
  static EMPTY: UrlUnion_Value_Union1;
  #url!: ImmutableUrl;
  constructor(props?: UrlUnion_Value_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UrlUnion_Value_Union1.EMPTY) return UrlUnion_Value_Union1.EMPTY;
    super(TYPE_TAG_UrlUnion_Value_Union1, "UrlUnion_Value_Union1");
    this.#url = props ? ImmutableUrl.isInstance(props.url) ? props.url : new ImmutableUrl(props.url, options) : new ImmutableUrl();
    if (!props) UrlUnion_Value_Union1.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UrlUnion_Value_Union1.Data>[] {
    return [{
      name: "url",
      fieldNumber: null,
      getValue: () => this.#url as ImmutableUrl | URL
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): UrlUnion_Value_Union1.Data {
    const props = {} as Partial<UrlUnion_Value_Union1.Data>;
    const urlValue = entries["url"];
    if (urlValue === undefined) throw new Error("Missing required property \"url\".");
    const urlMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableUrl.$compact === true) {
        result = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && value.startsWith(ImmutableUrl.$compactTag) ? value.slice(ImmutableUrl.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableUrl") {
            if (typeof value.$data === "string") {
              if (ImmutableUrl.$compact === true) {
                result = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && value.$data.startsWith(ImmutableUrl.$compactTag) ? value.$data.slice(ImmutableUrl.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableUrl.");
              }
            } else {
              result = new ImmutableUrl(ImmutableUrl.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableUrl.");
          }
        } else {
          result = ImmutableUrl.isInstance(value) ? value : new ImmutableUrl(value as ImmutableUrl.Value, options);
        }
      }
      return result;
    })(urlValue);
    props.url = urlMessageValue as ImmutableUrl | URL;
    return props as UrlUnion_Value_Union1.Data;
  }
  static from(value: UrlUnion_Value_Union1.Value): UrlUnion_Value_Union1 {
    return UrlUnion_Value_Union1.isInstance(value) ? value : new UrlUnion_Value_Union1(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "url":
        return new (this.constructor as typeof UrlUnion_Value_Union1)({
          url: child as ImmutableUrl | URL
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["url", this.#url] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof UrlUnion_Value_Union1>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for UrlUnion_Value_Union1.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected UrlUnion_Value_Union1.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get url(): ImmutableUrl {
    return this.#url;
  }
  set(updates: Partial<SetUpdates<UrlUnion_Value_Union1.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof UrlUnion_Value_Union1)(data) as this);
  }
  setUrl(value: ImmutableUrl | URL) {
    return this.$update(new (this.constructor as typeof UrlUnion_Value_Union1)({
      url: (ImmutableUrl.isInstance(value) ? value : new ImmutableUrl(value)) as ImmutableUrl | URL
    }) as this);
  }
}
export namespace UrlUnion_Value_Union1 {
  export type Data = {
    url: ImmutableUrl | URL;
  };
  export type Value = UrlUnion_Value_Union1 | UrlUnion_Value_Union1.Data;
}
const TYPE_TAG_UrlUnion = Symbol("UrlUnion");
export class UrlUnion extends Message<UrlUnion.Data> {
  static $typeId = "tests/url-union.pmsg#UrlUnion";
  static $typeHash = "sha256:a70e338b063bab46f545493b53b50964b074a9fefd550d8cc833cf4d3f653fdb";
  static $instanceTag = Symbol.for("propane:message:" + UrlUnion.$typeId);
  static readonly $typeName = "UrlUnion";
  static EMPTY: UrlUnion;
  #value!: ImmutableUrl | UrlUnion_Value_Union1;
  constructor(props?: UrlUnion.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UrlUnion.EMPTY) return UrlUnion.EMPTY;
    super(TYPE_TAG_UrlUnion, "UrlUnion");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = props ? (value => {
      if (!options?.skipValidation && true && !(ImmutableUrl.isInstance(value) || UrlUnion_Value_Union1.isInstance(value))) throw new Error("Invalid value for property \"value\".");
      return value;
    })((value => {
      const result = value as any;
      return result;
    })(props.value)) : new ImmutableUrl("about:blank");
    if (!props) UrlUnion.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UrlUnion.Data>[] {
    return [{
      name: "value",
      fieldNumber: null,
      getValue: () => this.#value as ImmutableUrl | URL | UrlUnion_Value_Union1,
      unionMessageTypes: ["ImmutableUrl", "UrlUnion_Value_Union1"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): UrlUnion.Data {
    const props = {} as Partial<UrlUnion.Data>;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    let valueUnionValue: any = valueValue as any;
    if (isTaggedMessageData(valueValue)) {
      if (valueValue.$tag === "ImmutableUrl") {
        if (typeof valueValue.$data === "string") {
          if (ImmutableUrl.$compact === true) {
            valueUnionValue = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && valueValue.$data.startsWith(ImmutableUrl.$compactTag) ? valueValue.$data.slice(ImmutableUrl.$compactTag.length) : valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (ImmutableUrl).");
          }
        } else {
          valueUnionValue = new ImmutableUrl(ImmutableUrl.prototype.$fromEntries(valueValue.$data, options), options);
        }
      } else if (valueValue.$tag === "UrlUnion_Value_Union1") {
        if (typeof valueValue.$data === "string") {
          if (UrlUnion_Value_Union1.$compact === true) {
            valueUnionValue = UrlUnion_Value_Union1.fromCompact(UrlUnion_Value_Union1.$compactTag && valueValue.$data.startsWith(UrlUnion_Value_Union1.$compactTag) ? valueValue.$data.slice(UrlUnion_Value_Union1.$compactTag.length) : valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (UrlUnion_Value_Union1).");
          }
        } else {
          valueUnionValue = new UrlUnion_Value_Union1(UrlUnion_Value_Union1.prototype.$fromEntries(valueValue.$data, options), options);
        }
      }
    }
    if (typeof valueValue === "string") {
      if (ImmutableUrl.$compactTag && valueValue.startsWith(ImmutableUrl.$compactTag)) {
        if (ImmutableUrl.$compact === true) {
          valueUnionValue = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && valueValue.startsWith(ImmutableUrl.$compactTag) ? valueValue.slice(ImmutableUrl.$compactTag.length) : valueValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"value\" (ImmutableUrl).");
        }
      } else if (UrlUnion_Value_Union1.$compactTag && valueValue.startsWith(UrlUnion_Value_Union1.$compactTag)) {
        if (UrlUnion_Value_Union1.$compact === true) {
          valueUnionValue = UrlUnion_Value_Union1.fromCompact(UrlUnion_Value_Union1.$compactTag && valueValue.startsWith(UrlUnion_Value_Union1.$compactTag) ? valueValue.slice(UrlUnion_Value_Union1.$compactTag.length) : valueValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"value\" (UrlUnion_Value_Union1).");
        }
      }
    }
    if (!(ImmutableUrl.isInstance(valueUnionValue) || UrlUnion_Value_Union1.isInstance(valueUnionValue))) throw new Error("Invalid value for property \"value\".");
    props.value = valueUnionValue;
    return props as UrlUnion.Data;
  }
  static from(value: UrlUnion.Value): UrlUnion {
    return UrlUnion.isInstance(value) ? value : new UrlUnion(value);
  }
  #validate(data: UrlUnion.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: UrlUnion.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try { /* noop */ } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof UrlUnion>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for UrlUnion.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected UrlUnion.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): ImmutableUrl | UrlUnion_Value_Union1 {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<UrlUnion.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof UrlUnion)(data) as this);
  }
  setValue(value: ImmutableUrl | URL | UrlUnion_Value_Union1) {
    return this.$update(new (this.constructor as typeof UrlUnion)({
      value: value as ImmutableUrl | URL | UrlUnion_Value_Union1
    }) as this);
  }
}
export namespace UrlUnion {
  export type Data = {
    value: ImmutableUrl | URL | UrlUnion_Value_Union1;
  };
  export type Value = UrlUnion | UrlUnion.Data;
  export import Value_Union1 = UrlUnion_Value_Union1;
}
