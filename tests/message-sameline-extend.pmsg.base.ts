/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-sameline-extend.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// Test type with extend decorator
// @extend('./message-sameline-extend.pmsg.ext.ts')
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_SameLineExtend$Base = Symbol("SameLineExtend");
export class SameLineExtend$Base extends Message<SameLineExtend.Data> {
  static $typeId = "tests/message-sameline-extend.pmsg#SameLineExtend";
  static $typeHash = "sha256:340341386268b6fd2af6032fcfb2397bf64d59b223dda36fdd7d9aa63323c55d";
  static $instanceTag = Symbol.for("propane:message:" + SameLineExtend$Base.$typeId);
  static readonly $typeName = "SameLineExtend";
  static EMPTY: SameLineExtend$Base;
  #firstName!: string;
  #lastName!: string;
  constructor(props?: SameLineExtend.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && SameLineExtend$Base.EMPTY) return SameLineExtend$Base.EMPTY;
    super(TYPE_TAG_SameLineExtend$Base, "SameLineExtend");
    this.#firstName = (props ? props.firstName : "") as string;
    this.#lastName = (props ? props.lastName : "") as string;
    if (!props) SameLineExtend$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<SameLineExtend.Data>[] {
    return [{
      name: "firstName",
      fieldNumber: 1,
      getValue: () => this.#firstName
    }, {
      name: "lastName",
      fieldNumber: 2,
      getValue: () => this.#lastName
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): SameLineExtend.Data {
    const props = {} as Partial<SameLineExtend.Data>;
    const firstNameValue = entries["1"] === undefined ? entries["firstName"] : entries["1"];
    if (firstNameValue === undefined) throw new Error("Missing required property \"firstName\".");
    if (!(typeof firstNameValue === "string")) throw new Error("Invalid value for property \"firstName\".");
    props.firstName = firstNameValue as string;
    const lastNameValue = entries["2"] === undefined ? entries["lastName"] : entries["2"];
    if (lastNameValue === undefined) throw new Error("Missing required property \"lastName\".");
    if (!(typeof lastNameValue === "string")) throw new Error("Invalid value for property \"lastName\".");
    props.lastName = lastNameValue as string;
    return props as SameLineExtend.Data;
  }
  static from(value: SameLineExtend.Value): SameLineExtend$Base {
    return value instanceof SameLineExtend$Base ? value : new SameLineExtend$Base(value);
  }
  static deserialize<T extends typeof SameLineExtend$Base>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for SameLineExtend.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected SameLineExtend.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get firstName(): string {
    return this.#firstName;
  }
  get lastName(): string {
    return this.#lastName;
  }
  set(updates: Partial<SetUpdates<SameLineExtend.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof SameLineExtend$Base)(data) as this);
  }
  setFirstName(value: string) {
    return this.$update(new (this.constructor as typeof SameLineExtend$Base)({
      firstName: value,
      lastName: this.#lastName
    }) as this);
  }
  setLastName(value: string) {
    return this.$update(new (this.constructor as typeof SameLineExtend$Base)({
      firstName: this.#firstName,
      lastName: value
    }) as this);
  }
}
export namespace SameLineExtend {
  export type Data = {
    firstName: string;
    lastName: string;
  };
  export type Value = SameLineExtend$Base | SameLineExtend.Data;
}
