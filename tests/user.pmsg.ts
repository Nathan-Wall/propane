/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/user.pmsg
import { Distance } from './distance.pmsg.js';
import { Email } from './email.pmsg.js';
import { Hash } from './hash.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class User extends Message<User.Data> {
  static TYPE_TAG = Symbol("User");
  static readonly $typeName = "User";
  static EMPTY: User;
  #id: number;
  #name: string;
  #email: Email;
  #passwordHash: Hash;
  #created: ImmutableDate;
  #updated: ImmutableDate;
  #active: boolean;
  #eyeColor: 'blue' | 'green' | 'brown' | 'hazel';
  #height: Distance;
  constructor(props?: User.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && User.EMPTY) return User.EMPTY;
    super(User.TYPE_TAG, "User");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#id = props ? props.id : 0;
    this.#name = props ? props.name : "";
    this.#email = props ? props.email : new Email();
    this.#passwordHash = props ? props.passwordHash : new Hash();
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created) : new ImmutableDate(0);
    this.#updated = props ? props.updated instanceof ImmutableDate ? props.updated : new ImmutableDate(props.updated) : new ImmutableDate(0);
    this.#active = props ? props.active : false;
    this.#eyeColor = props ? props.eyeColor : undefined;
    this.#height = props ? props.height : new Distance();
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
      name: "email",
      fieldNumber: 3,
      getValue: () => this.#email
    }, {
      name: "passwordHash",
      fieldNumber: 4,
      getValue: () => this.#passwordHash
    }, {
      name: "created",
      fieldNumber: null,
      getValue: () => this.#created
    }, {
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated
    }, {
      name: "active",
      fieldNumber: null,
      getValue: () => this.#active
    }, {
      name: "eyeColor",
      fieldNumber: null,
      getValue: () => this.#eyeColor
    }, {
      name: "height",
      fieldNumber: null,
      getValue: () => this.#height
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): User.Data {
    const props = {} as Partial<User.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const emailValue = entries["3"] === undefined ? entries["email"] : entries["3"];
    if (emailValue === undefined) throw new Error("Missing required property \"email\".");
    props.email = emailValue;
    const passwordHashValue = entries["4"] === undefined ? entries["passwordHash"] : entries["4"];
    if (passwordHashValue === undefined) throw new Error("Missing required property \"passwordHash\".");
    props.passwordHash = passwordHashValue;
    const createdValue = entries["created"];
    if (createdValue === undefined) throw new Error("Missing required property \"created\".");
    if (!(createdValue instanceof Date || createdValue instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdValue;
    const updatedValue = entries["updated"];
    if (updatedValue === undefined) throw new Error("Missing required property \"updated\".");
    if (!(updatedValue instanceof Date || updatedValue instanceof ImmutableDate)) throw new Error("Invalid value for property \"updated\".");
    props.updated = updatedValue;
    const activeValue = entries["active"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue;
    const eyeColorValue = entries["eyeColor"];
    if (eyeColorValue === undefined) throw new Error("Missing required property \"eyeColor\".");
    if (!(eyeColorValue === "blue" || eyeColorValue === "green" || eyeColorValue === "brown" || eyeColorValue === "hazel")) throw new Error("Invalid value for property \"eyeColor\".");
    props.eyeColor = eyeColorValue;
    const heightValue = entries["height"];
    if (heightValue === undefined) throw new Error("Missing required property \"height\".");
    props.height = heightValue;
    return props as User.Data;
  }
  #validate(data) {}
  static validateAll(data: User.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  get id(): number {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  get email(): Email {
    return this.#email;
  }
  get passwordHash(): Hash {
    return this.#passwordHash;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  get updated(): ImmutableDate {
    return this.#updated;
  }
  get active(): boolean {
    return this.#active;
  }
  get eyeColor(): 'blue' | 'green' | 'brown' | 'hazel' {
    return this.#eyeColor;
  }
  get height(): Distance {
    return this.#height;
  }
  set(updates: Partial<SetUpdates<User.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof User)(data));
  }
  setActive(value: boolean) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created,
      updated: this.#updated,
      active: value,
      eyeColor: this.#eyeColor,
      height: this.#height
    }));
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: value,
      updated: this.#updated,
      active: this.#active,
      eyeColor: this.#eyeColor,
      height: this.#height
    }));
  }
  setEmail(value: Email) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: value,
      passwordHash: this.#passwordHash,
      created: this.#created,
      updated: this.#updated,
      active: this.#active,
      eyeColor: this.#eyeColor,
      height: this.#height
    }));
  }
  setEyeColor(value: 'blue' | 'green' | 'brown' | 'hazel') {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created,
      updated: this.#updated,
      active: this.#active,
      eyeColor: value,
      height: this.#height
    }));
  }
  setHeight(value: Distance) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created,
      updated: this.#updated,
      active: this.#active,
      eyeColor: this.#eyeColor,
      height: value
    }));
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof User)({
      id: value,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created,
      updated: this.#updated,
      active: this.#active,
      eyeColor: this.#eyeColor,
      height: this.#height
    }));
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: value,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created,
      updated: this.#updated,
      active: this.#active,
      eyeColor: this.#eyeColor,
      height: this.#height
    }));
  }
  setPasswordHash(value: Hash) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: value,
      created: this.#created,
      updated: this.#updated,
      active: this.#active,
      eyeColor: this.#eyeColor,
      height: this.#height
    }));
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created,
      updated: value,
      active: this.#active,
      eyeColor: this.#eyeColor,
      height: this.#height
    }));
  }
}
export namespace User {
  export type Data = {
    id: number;
    name: string;
    email: Email;
    passwordHash: Hash;
    created: ImmutableDate | Date;
    updated: ImmutableDate | Date;
    active: boolean;
    eyeColor: 'blue' | 'green' | 'brown' | 'hazel';
    height: Distance;
  };
  export type Value = User | User.Data;
}
