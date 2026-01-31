/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/user.pmsg
import { Distance } from './distance.pmsg.js';
import { Email } from './email.pmsg.js';
import { Hash } from './hash.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_User = Symbol("User");
export class User extends Message<User.Data> {
  static $typeId = "tests/user.pmsg#User";
  static $typeHash = "sha256:943e8277dce255d01d16cd77717e14102159c3f64a93bad0ce4f248eaf0e9190";
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
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    this.#updated = props ? props.updated instanceof ImmutableDate ? props.updated : new ImmutableDate(props.updated, options) : new ImmutableDate();
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
      getValue: () => this.#email as Email | Email
    }, {
      name: "passwordHash",
      fieldNumber: 4,
      getValue: () => this.#passwordHash as Hash | Hash
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
      getValue: () => this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      unionHasString: true
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
    const createdMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableDate.$compact === true) {
        result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.startsWith(ImmutableDate.$compactTag) ? value.slice(ImmutableDate.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableDate") {
            if (typeof value.$data === "string") {
              if (ImmutableDate.$compact === true) {
                result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.$data.startsWith(ImmutableDate.$compactTag) ? value.$data.slice(ImmutableDate.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableDate.");
              }
            } else {
              result = new ImmutableDate(ImmutableDate.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableDate.");
          }
        } else {
          if (value instanceof ImmutableDate) {
            result = value;
          } else {
            result = new ImmutableDate(value as ImmutableDate.Value, options);
          }
        }
      }
      return result;
    })(createdValue);
    props.created = createdMessageValue as ImmutableDate | Date;
    const updatedValue = entries["updated"];
    if (updatedValue === undefined) throw new Error("Missing required property \"updated\".");
    const updatedMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableDate.$compact === true) {
        result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.startsWith(ImmutableDate.$compactTag) ? value.slice(ImmutableDate.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableDate") {
            if (typeof value.$data === "string") {
              if (ImmutableDate.$compact === true) {
                result = ImmutableDate.fromCompact(ImmutableDate.$compactTag && value.$data.startsWith(ImmutableDate.$compactTag) ? value.$data.slice(ImmutableDate.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableDate.");
              }
            } else {
              result = new ImmutableDate(ImmutableDate.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableDate.");
          }
        } else {
          if (value instanceof ImmutableDate) {
            result = value;
          } else {
            result = new ImmutableDate(value as ImmutableDate.Value, options);
          }
        }
      }
      return result;
    })(updatedValue);
    props.updated = updatedMessageValue as ImmutableDate | Date;
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
    const heightMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && Distance.$compact === true) {
        result = Distance.fromCompact(Distance.$compactTag && value.startsWith(Distance.$compactTag) ? value.slice(Distance.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "Distance") {
            if (typeof value.$data === "string") {
              if (Distance.$compact === true) {
                result = Distance.fromCompact(Distance.$compactTag && value.$data.startsWith(Distance.$compactTag) ? value.$data.slice(Distance.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for Distance.");
              }
            } else {
              result = new Distance(Distance.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected Distance.");
          }
        } else {
          if (value instanceof Distance) {
            result = value;
          } else {
            result = new Distance(value as Distance.Value, options);
          }
        }
      }
      return result;
    })(heightValue);
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
      case "created":
        return new (this.constructor as typeof User)({
          id: this.#id,
          name: this.#name,
          email: this.#email as Email | Email,
          passwordHash: this.#passwordHash as Hash | Hash,
          created: child as ImmutableDate | Date,
          updated: this.#updated as ImmutableDate | Date,
          active: this.#active,
          eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
          height: this.#height as Distance.Value
        }) as this;
      case "updated":
        return new (this.constructor as typeof User)({
          id: this.#id,
          name: this.#name,
          email: this.#email as Email | Email,
          passwordHash: this.#passwordHash as Hash | Hash,
          created: this.#created as ImmutableDate | Date,
          updated: child as ImmutableDate | Date,
          active: this.#active,
          eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
          height: this.#height as Distance.Value
        }) as this;
      case "height":
        return new (this.constructor as typeof User)({
          id: this.#id,
          name: this.#name,
          email: this.#email as Email | Email,
          passwordHash: this.#passwordHash as Hash | Hash,
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
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["updated", this.#updated] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["height", this.#height] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
      email: this.#email as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
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
      email: this.#email as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
      created: (value instanceof ImmutableDate ? value : new ImmutableDate(value)) as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setEmail(value: Email | Email) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: value as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
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
      email: this.#email as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
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
      email: this.#email as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
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
      email: this.#email as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
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
      email: this.#email as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date,
      active: this.#active,
      eyeColor: this.#eyeColor as 'blue' | 'green' | 'brown' | 'hazel',
      height: this.#height as Distance.Value
    }) as this);
  }
  setPasswordHash(value: Hash | Hash) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      name: this.#name,
      email: this.#email as Email | Email,
      passwordHash: value as Hash | Hash,
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
      email: this.#email as Email | Email,
      passwordHash: this.#passwordHash as Hash | Hash,
      created: this.#created as ImmutableDate | Date,
      updated: (value instanceof ImmutableDate ? value : new ImmutableDate(value)) as ImmutableDate | Date,
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
    email: Email | Email;
    passwordHash: Hash | Hash;
    created: ImmutableDate | Date;
    updated: ImmutableDate | Date;
    active: boolean;
    eyeColor: 'blue' | 'green' | 'brown' | 'hazel';
    height: Distance.Value;
  };
  export type Value = User | User.Data;
}
