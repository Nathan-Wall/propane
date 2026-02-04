/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/single-message-union.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError, ImmutableDate, ImmutableUrl } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_SingleMessageUnion = Symbol("SingleMessageUnion");
export class SingleMessageUnion extends Message<SingleMessageUnion.Data> {
  static $typeId = "tests/single-message-union.pmsg#SingleMessageUnion";
  static $typeHash = "sha256:f8eba0dedc6e9762f7f9be6eb154a67bccd35b5a1c0a5785d5022beb622804bc";
  static $instanceTag = Symbol.for("propane:message:" + SingleMessageUnion.$typeId);
  static readonly $typeName = "SingleMessageUnion";
  static EMPTY: SingleMessageUnion;
  #dateOrString!: ImmutableDate | string;
  #urlOrNumber!: ImmutableUrl | number;
  constructor(props?: SingleMessageUnion.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && SingleMessageUnion.EMPTY) return SingleMessageUnion.EMPTY;
    super(TYPE_TAG_SingleMessageUnion, "SingleMessageUnion");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#dateOrString = props ? (value => {
      let result = value as any;
      const isMessage = Message.isMessage(value);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        let matched = false;
        if (!matched) {
          if (ImmutableDate.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              result = new ImmutableDate(value as any, options);
              matched = true;
            }
          }
        }
      }
      return result;
    })(props.dateOrString) : new ImmutableDate(0);
    this.#urlOrNumber = props ? (value => {
      let result = value as any;
      const isMessage = Message.isMessage(value);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        let matched = false;
        if (!matched) {
          if (ImmutableUrl.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              result = new ImmutableUrl(value as any, options);
              matched = true;
            }
          }
        }
      }
      return result;
    })(props.urlOrNumber) : new ImmutableUrl("about:blank");
    if (!props) SingleMessageUnion.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<SingleMessageUnion.Data>[] {
    return [{
      name: "dateOrString",
      fieldNumber: null,
      getValue: () => this.#dateOrString as ImmutableDate | Date | string,
      unionMessageTypes: ["ImmutableDate"],
      unionHasString: true
    }, {
      name: "urlOrNumber",
      fieldNumber: null,
      getValue: () => this.#urlOrNumber as ImmutableUrl | URL | number,
      unionMessageTypes: ["ImmutableUrl"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): SingleMessageUnion.Data {
    const props = {} as Partial<SingleMessageUnion.Data>;
    const dateOrStringValue = entries["dateOrString"];
    if (dateOrStringValue === undefined) throw new Error("Missing required property \"dateOrString\".");
    let dateOrStringUnionValue: any = dateOrStringValue as any;
    if (isTaggedMessageData(dateOrStringValue)) {
      if (dateOrStringValue.$tag === "ImmutableDate") {
        if (typeof dateOrStringValue.$data === "string") {
          if (ImmutableDate.$compact === true) {
            dateOrStringUnionValue = ImmutableDate.fromCompact(ImmutableDate.$compactTag && dateOrStringValue.$data.startsWith(ImmutableDate.$compactTag) ? dateOrStringValue.$data.slice(ImmutableDate.$compactTag.length) : dateOrStringValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"dateOrString\" (ImmutableDate).");
          }
        } else {
          dateOrStringUnionValue = new ImmutableDate(ImmutableDate.prototype.$fromEntries(dateOrStringValue.$data, options), options);
        }
      }
    }
    if (typeof dateOrStringValue === "string") {
      if (ImmutableDate.$compactTag && dateOrStringValue.startsWith(ImmutableDate.$compactTag)) {
        if (ImmutableDate.$compact === true) {
          dateOrStringUnionValue = ImmutableDate.fromCompact(ImmutableDate.$compactTag && dateOrStringValue.startsWith(ImmutableDate.$compactTag) ? dateOrStringValue.slice(ImmutableDate.$compactTag.length) : dateOrStringValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"dateOrString\" (ImmutableDate).");
        }
      }
    }
    if (!isTaggedMessageData(dateOrStringValue) && typeof dateOrStringValue === "object" && dateOrStringValue !== null) {
      let dateOrStringUnionValueMatched = false;
      if (!dateOrStringUnionValueMatched) {
        if (ImmutableDate.isInstance(dateOrStringValue)) {
          dateOrStringUnionValue = dateOrStringValue as any;
          dateOrStringUnionValueMatched = true;
        } else {
          dateOrStringUnionValue = new ImmutableDate(ImmutableDate.prototype.$fromEntries(dateOrStringValue as Record<string, unknown>, options), options);
          dateOrStringUnionValueMatched = true;
        }
      }
    }
    if (!(typeof dateOrStringUnionValue === "string" || ImmutableDate.isInstance(dateOrStringUnionValue))) throw new Error("Invalid value for property \"dateOrString\".");
    props.dateOrString = dateOrStringUnionValue;
    const urlOrNumberValue = entries["urlOrNumber"];
    if (urlOrNumberValue === undefined) throw new Error("Missing required property \"urlOrNumber\".");
    let urlOrNumberUnionValue: any = urlOrNumberValue as any;
    if (isTaggedMessageData(urlOrNumberValue)) {
      if (urlOrNumberValue.$tag === "ImmutableUrl") {
        if (typeof urlOrNumberValue.$data === "string") {
          if (ImmutableUrl.$compact === true) {
            urlOrNumberUnionValue = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && urlOrNumberValue.$data.startsWith(ImmutableUrl.$compactTag) ? urlOrNumberValue.$data.slice(ImmutableUrl.$compactTag.length) : urlOrNumberValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"urlOrNumber\" (ImmutableUrl).");
          }
        } else {
          urlOrNumberUnionValue = new ImmutableUrl(ImmutableUrl.prototype.$fromEntries(urlOrNumberValue.$data, options), options);
        }
      }
    }
    if (typeof urlOrNumberValue === "string") {
      if (ImmutableUrl.$compactTag && urlOrNumberValue.startsWith(ImmutableUrl.$compactTag)) {
        if (ImmutableUrl.$compact === true) {
          urlOrNumberUnionValue = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && urlOrNumberValue.startsWith(ImmutableUrl.$compactTag) ? urlOrNumberValue.slice(ImmutableUrl.$compactTag.length) : urlOrNumberValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"urlOrNumber\" (ImmutableUrl).");
        }
      }
    }
    if (!isTaggedMessageData(urlOrNumberValue) && typeof urlOrNumberValue === "object" && urlOrNumberValue !== null) {
      let urlOrNumberUnionValueMatched = false;
      if (!urlOrNumberUnionValueMatched) {
        if (ImmutableUrl.isInstance(urlOrNumberValue)) {
          urlOrNumberUnionValue = urlOrNumberValue as any;
          urlOrNumberUnionValueMatched = true;
        } else {
          urlOrNumberUnionValue = new ImmutableUrl(ImmutableUrl.prototype.$fromEntries(urlOrNumberValue as Record<string, unknown>, options), options);
          urlOrNumberUnionValueMatched = true;
        }
      }
    }
    if (!(typeof urlOrNumberUnionValue === "number" || ImmutableUrl.isInstance(urlOrNumberUnionValue))) throw new Error("Invalid value for property \"urlOrNumber\".");
    props.urlOrNumber = urlOrNumberUnionValue;
    return props as SingleMessageUnion.Data;
  }
  static from(value: SingleMessageUnion.Value): SingleMessageUnion {
    return SingleMessageUnion.isInstance(value) ? value : new SingleMessageUnion(value);
  }
  #validate(data: SingleMessageUnion.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: SingleMessageUnion.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof SingleMessageUnion>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for SingleMessageUnion.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected SingleMessageUnion.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get dateOrString(): ImmutableDate | string {
    return this.#dateOrString;
  }
  get urlOrNumber(): ImmutableUrl | number {
    return this.#urlOrNumber;
  }
  set(updates: Partial<SetUpdates<SingleMessageUnion.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof SingleMessageUnion)(data) as this);
  }
  setDateOrString(value: ImmutableDate | Date | string) {
    return this.$update(new (this.constructor as typeof SingleMessageUnion)({
      dateOrString: value as ImmutableDate | Date | string,
      urlOrNumber: this.#urlOrNumber as ImmutableUrl | URL | number
    }) as this);
  }
  setUrlOrNumber(value: ImmutableUrl | URL | number) {
    return this.$update(new (this.constructor as typeof SingleMessageUnion)({
      dateOrString: this.#dateOrString as ImmutableDate | Date | string,
      urlOrNumber: value as ImmutableUrl | URL | number
    }) as this);
  }
}
export namespace SingleMessageUnion {
  export type Data = {
    dateOrString: ImmutableDate | Date | string;
    urlOrNumber: ImmutableUrl | URL | number;
  };
  export type Value = SingleMessageUnion | SingleMessageUnion.Data;
}
