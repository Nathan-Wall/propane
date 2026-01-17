/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/user.pmsg
import { Distance } from './distance.pmsg.js';
import { Email } from './email.pmsg.js';
import { Hash } from './hash.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_User = Symbol("User");
export class User extends Message<User.Data> {
  static $typeId = "tests/user.pmsg#User";
  static $typeHash = "sha256:2ee83b1cdb57b43fd741da41beecf093eeb31f5f9c2d7d97327cf7a701ea99ac";
  static $instanceTag = Symbol.for("propane:message:" + User.$typeId);
  static readonly $typeName = "User";
  static EMPTY: User;
  #id!: number;
  #name!: string;
  #email!: Email;
  #passwordHash!: Hash;
  #created!: ImmutableDate;
  #updated!: ImmutableDate;
  #active!: boolean;
  #eyeColor!: 'blue' | 'green' | 'brown' | 'hazel';
  #height!: Distance;
  constructor(props?: User.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && User.EMPTY) return User.EMPTY;
    super(TYPE_TAG_User, "User");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#id = (props ? props.id : 0) as number;
    this.#name = (props ? props.name : "") as string;
    this.#email = (props ? props.email : undefined) as Email;
    this.#passwordHash = (props ? props.passwordHash : undefined) as Hash;
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : ImmutableDate.from(props.created) : new ImmutableDate(0);
    this.#updated = props ? props.updated instanceof ImmutableDate ? props.updated : ImmutableDate.from(props.updated) : new ImmutableDate(0);
    this.#active = (props ? props.active : false) as boolean;
    this.#eyeColor = (props ? props.eyeColor : "blue") as 'blue' | 'green' | 'brown' | 'hazel';
    this.#height = props ? props.height instanceof Distance ? props.height : new Distance(props.height, options) : new Distance();
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
      getValue: () => this.#created as ImmutableDate | Date
    }, {
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated as ImmutableDate | Date
    }, {
      name: "active",
      fieldNumber: null,
      getValue: () => this.#active
    }, {
      name: "eyeColor",
      fieldNumber: null,
      getValue: () => this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel'
    }, {
      name: "height",
      fieldNumber: null,
      getValue: () => this.#height as Distance.Value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): User.Data {
    const props = {} as Partial<User.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const emailValue = entries["3"] === undefined ? entries["email"] : entries["3"];
    if (emailValue === undefined) throw new Error("Missing required property \"email\".");
    props.email = emailValue as Email;
    const passwordHashValue = entries["4"] === undefined ? entries["passwordHash"] : entries["4"];
    if (passwordHashValue === undefined) throw new Error("Missing required property \"passwordHash\".");
    props.passwordHash = passwordHashValue as Hash;
    const createdValue = entries["created"];
    if (createdValue === undefined) throw new Error("Missing required property \"created\".");
    if (!(createdValue as object instanceof Date || createdValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdValue as Date;
    const updatedValue = entries["updated"];
    if (updatedValue === undefined) throw new Error("Missing required property \"updated\".");
    if (!(updatedValue as object instanceof Date || updatedValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"updated\".");
    props.updated = updatedValue as Date;
    const activeValue = entries["active"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue as boolean;
    const eyeColorValue = entries["eyeColor"];
    if (eyeColorValue === undefined) throw new Error("Missing required property \"eyeColor\".");
    if (!(eyeColorValue === "blue" || eyeColorValue === "green" || eyeColorValue === "brown" || eyeColorValue === "hazel")) throw new Error("Invalid value for property \"eyeColor\".");
    props.eyeColor = eyeColorValue as 'blue' | 'green' | 'brown' | 'hazel';
    const heightValue = entries["height"];
    if (heightValue === undefined) throw new Error("Missing required property \"height\".");
    const heightMessageValue = typeof heightValue === "string" && Distance.$compact === true ? Distance.fromCompact(heightValue, options) as any : heightValue instanceof Distance ? heightValue : new Distance(heightValue as Distance.Value, options);
    props.height = heightMessageValue;
    return props as User.Data;
  }
  static from(value: User.Value): User {
    return value instanceof User ? value : new User(value);
  }
  #validate(data: User.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: User.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "height":
        return new (this.constructor as typeof User)({
          id: this.#id,
          name: this.#name,
          email: this.#email,
          passwordHash: this.#passwordHash,
          created: this.#created as ImmutableDate | Date,
          updated: this.#updated as ImmutableDate | Date,
          active: this.#active,
          eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
          height: child as Distance.Value
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["height", this.#height] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof User>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof User)(data) as this);
  }
  setActive(value: boolean) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: value,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: value as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setEmail(value: Email) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: value,
      passwordHash: this.#passwordHash,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setEyeColor(value: 'blue' | 'green' | 'brown' | 'hazel') {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: value as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setHeight(value: Distance.Value) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: (value instanceof Distance ? value : new Distance(value)) as Distance.Value
    }) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof User)({
      id: value,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: value,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setPasswordHash(value: Hash) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: value,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email,
      passwordHash: this.#passwordHash,
      created: this.#created as ImmutableDate | Date,
      updated: value as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
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
    height: Distance.Value;
  };
  export type Value = User | User.Data;
}
