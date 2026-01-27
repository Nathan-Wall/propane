/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-wrapper-union.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import { Flag } from './message-wrapper-flag.pmsg.js';
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_WrapperUnion = Symbol("WrapperUnion");
export class WrapperUnion extends Message<WrapperUnion.Data> {
  static $typeId = "tests/message-wrapper-union.pmsg#WrapperUnion";
  static $typeHash = "sha256:9c8429dc1970f90b4b5ae202ac9381d5f019bc026bc6e4739e1662d347373226";
  static $instanceTag = Symbol.for("propane:message:" + WrapperUnion.$typeId);
  static readonly $typeName = "WrapperUnion";
  static EMPTY: WrapperUnion;
  #value!: Flag | string;
  constructor(props?: WrapperUnion.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && WrapperUnion.EMPTY) return WrapperUnion.EMPTY;
    super(TYPE_TAG_WrapperUnion, "WrapperUnion");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = (props ? (value => {
      let result = value as any;
      const isMessage = Message.isMessage(value);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        let matched = false;
        if (!matched) {
          if (Flag.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              result = new Flag(value as any, options);
              matched = true;
            }
          }
        }
      }
      return result;
    })(props.value) : undefined) as Flag | string;
    if (!props) WrapperUnion.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<WrapperUnion.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as Flag | string,
      unionMessageTypes: ["Flag"],
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): WrapperUnion.Data {
    const props = {} as Partial<WrapperUnion.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    let valueUnionValue: any = valueValue as any;
    if (isTaggedMessageData(valueValue)) {
      if (valueValue.$tag === "Flag") {
        if (typeof valueValue.$data === "string") {
          if (Flag.$compact === true) {
            valueUnionValue = Flag.fromCompact(Flag.$compactTag && valueValue.$data.startsWith(Flag.$compactTag) ? valueValue.$data.slice(Flag.$compactTag.length) : valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (Flag).");
          }
        } else {
          valueUnionValue = new Flag(Flag.prototype.$fromEntries(valueValue.$data, options), options);
        }
      }
    }
    if (typeof valueValue === "string") {
      if (Flag.$compactTag && valueValue.startsWith(Flag.$compactTag)) {
        if (Flag.$compact === true) {
          valueUnionValue = Flag.fromCompact(Flag.$compactTag && valueValue.startsWith(Flag.$compactTag) ? valueValue.slice(Flag.$compactTag.length) : valueValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"value\" (Flag).");
        }
      }
    }
    if (!isTaggedMessageData(valueValue) && typeof valueValue === "object" && valueValue !== null) {
      let valueUnionValueMatched = false;
      if (!valueUnionValueMatched) {
        if (valueValue as object instanceof Flag) {
          valueUnionValue = valueValue as any;
          valueUnionValueMatched = true;
        } else {
          valueUnionValue = new Flag(Flag.prototype.$fromEntries(valueValue as Record<string, unknown>, options), options);
          valueUnionValueMatched = true;
        }
      }
    }
    if (!(typeof valueUnionValue === "string" || Flag.isInstance(valueUnionValue))) throw new Error("Invalid value for property \"value\".");
    props.value = valueUnionValue;
    return props as WrapperUnion.Data;
  }
  static from(value: WrapperUnion.Value): WrapperUnion {
    return value instanceof WrapperUnion ? value : new WrapperUnion(value);
  }
  #validate(data: WrapperUnion.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: WrapperUnion.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof WrapperUnion>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for WrapperUnion.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected WrapperUnion.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): Flag | string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<WrapperUnion.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof WrapperUnion)(data) as this);
  }
  setValue(value: Flag | string) {
    return this.$update(new (this.constructor as typeof WrapperUnion)({
      value: value as Flag | string
    }) as this);
  }
}
export namespace WrapperUnion {
  export type Data = {
    value: Flag | string;
  };
  export type Value = WrapperUnion | WrapperUnion.Data;
}
