/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/brand-in-message.pmsg
/**
 * Test Brand types used as properties in Message types.
 */

import type { Brand, MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// A standalone Brand type (should transform)
declare const _UserId_brand: unique symbol;
export type UserId = Brand<number, 'userId', typeof _UserId_brand>;

// Message type with Brand property (should the nested Brand also transform?)
declare const _User_id_brand: unique symbol;
const TYPE_TAG_User = Symbol("User");
export class User extends Message<User.Data> {
  static $typeId = "tests/brand-in-message.pmsg#User";
  static $typeHash = "sha256:38d412ae081774b6f31e4bb8db9f844899d7090a6d823bdf306f8d0a820d101c";
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
      getValue: () => this.#ref
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
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
      ref: this.#ref
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id as Brand<number, 'userId', typeof _User_id_brand>,
      name: value,
      ref: this.#ref
    }) as this);
  }
  setRef(value: UserId) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id as Brand<number, 'userId', typeof _User_id_brand>,
      name: this.#name,
      ref: value
    }) as this);
  }
}
export namespace User {
  export type Data = {
    id: Brand<number, 'userId', typeof _User_id_brand>;
    name: string;
    ref: UserId;
  };
  export type Value = User | User.Data;
}
