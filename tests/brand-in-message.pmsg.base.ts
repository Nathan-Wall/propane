/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/brand-in-message.pmsg
/**
 * Test Brand types used as properties in Message types.
 */

import type { Brand, MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// A standalone Brand type (should transform)
declare const _UserId_brand: unique symbol;
export type UserId = Brand<number, 'userId', typeof _UserId_brand>;

// Message type with Brand property (should the nested Brand also transform?)
declare const _User_id_brand: unique symbol;
const TYPE_TAG_User = Symbol("User");
export class User extends Message<User.Data> {
  static $typeId = "tests/brand-in-message.pmsg#User";
  static $typeHash = "sha256:6377c1db216d68f066c4527d6b9d52d7ca4bcfacca27cdd9dc314efb19860b69";
  static $instanceTag = Symbol.for("propane:message:" + User.$typeId);
  static readonly $typeName = "User";
  static EMPTY: User;
  #id!: Brand<number, 'userId', typeof _User_id_brand>;
  #name!: string;
  #ref!: UserId;
  constructor(props?: User.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && User.EMPTY) return User.EMPTY;
    super(TYPE_TAG_User, "User");
    this.#id = (props ? props.id : undefined) as Brand<number, 'userId', typeof _User_id_brand>;
    this.#name = (props ? props.name : "") as string;
    this.#ref = (props ? props.ref : undefined) as UserId;
    if (!props) User.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<User.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id as Brand<number, 'userId', typeof _User_id_brand>
    }, {
      name: "name",
      fieldNumber: 2,
      getValue: () => this.#name
    }, {
      name: "ref",
      fieldNumber: 3,
      getValue: () => this.#ref as UserId | UserId
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): User.Data {
    const props = {} as Partial<User.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    props.id = idValue as Brand<number, 'userId', typeof _User_id_brand>;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const refValue = entries["3"] === undefined ? entries["ref"] : entries["3"];
    if (refValue === undefined) throw new Error("Missing required property \"ref\".");
    props.ref = refValue as UserId;
    return props as User.Data;
  }
  static from(value: User.Value): User {
    return value instanceof User ? value : new User(value);
  }
  static deserialize<T extends typeof User>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for User.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected User.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): Brand<number, 'userId', typeof _User_id_brand> {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  get ref(): UserId {
    return this.#ref;
  }
  set(updates: Partial<SetUpdates<User.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof User)(data) as this);
  }
  setId(value: Brand<number, 'userId', typeof _User_id_brand>) {
    return this.$update(new (this.constructor as typeof User)({
      id: value as Brand<number, 'userId', typeof _User_id_brand>,
      name: this.#name,
      ref: this.#ref as UserId | UserId
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id as Brand<number, 'userId', typeof _User_id_brand>,
      name: value,
      ref: this.#ref as UserId | UserId
    }) as this);
  }
  setRef(value: UserId | UserId) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id as Brand<number, 'userId', typeof _User_id_brand>,
      name: this.#name,
      ref: value as UserId | UserId
    }) as this);
  }
}
export namespace User {
  export type Data = {
    id: Brand<number, 'userId', typeof _User_id_brand>;
    name: string;
    ref: UserId | UserId;
  };
  export type Value = User | User.Data;
}
