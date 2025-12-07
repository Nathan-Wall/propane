/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/brand-in-message.pmsg
/**
 * Test Brand types used as properties in @message types.
 */

import type { Brand, MessagePropDescriptor, Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
import { Message } from "../runtime/index.js";

// A standalone Brand type (should transform)
declare const _UserId_brand: unique symbol;
export type UserId = Brand<number, 'userId', typeof _UserId_brand>;

// Message type with Brand property (should the nested Brand also transform?)
declare const _User_id_brand: unique symbol;
export class User extends Message<User.Data> {
  static TYPE_TAG = Symbol("User");
  static readonly $typeName = "User";
  static EMPTY: User;
  #id: Brand<number, 'userId', typeof _User_id_brand>;
  #name: string;
  #ref: UserId;
  constructor(props?: User.Value) {
    if (!props && User.EMPTY) return User.EMPTY;
    super(User.TYPE_TAG, "User");
    this.#id = props ? props.id : new Brand();
    this.#name = props ? props.name : "";
    this.#ref = props ? props.ref : new UserId();
    if (!props) User.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<User.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
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
  protected $fromEntries(entries: Record<string, unknown>): User.Data {
    const props = {} as Partial<User.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    props.id = idValue;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const refValue = entries["3"] === undefined ? entries["ref"] : entries["3"];
    if (refValue === undefined) throw new Error("Missing required property \"ref\".");
    props.ref = refValue;
    return props as User.Data;
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
  setId(value: Brand<number, 'userId', typeof _User_id_brand>) {
    return this.$update(new (this.constructor as typeof User)({
      id: value,
      name: this.#name,
      ref: this.#ref
    }));
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: value,
      ref: this.#ref
    }));
  }
  setRef(value: UserId) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      ref: value
    }));
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
