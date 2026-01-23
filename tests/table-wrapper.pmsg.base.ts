/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/table-wrapper.pmsg
import { Table } from '@propane/postgres';

/**
 * Test Table<T> wrapper for database types.
 * Table types are message types that also generate database schema.
 */
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
const TYPE_TAG_User = Symbol("User");
export class User extends Message<User.Data> {
  static $typeId = "tests/table-wrapper.pmsg#User";
  static $typeHash = "sha256:6023ade2fcdc1500dd5759e6f011e62ce50be8b855d698cdfd55e76125eb48ba";
  static $instanceTag = Symbol.for("propane:message:" + User.$typeId);
  static readonly $typeName = "User";
  static EMPTY: User;
  #id!: bigint;
  #email!: string;
  #name!: string;
  #active!: boolean;
  #created!: ImmutableDate;
  constructor(props?: User.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && User.EMPTY) return User.EMPTY;
    super(TYPE_TAG_User, "User");
    this.#id = (props ? props.id : 0n) as bigint;
    this.#email = (props ? props.email : "") as string;
    this.#name = (props ? props.name : "") as string;
    this.#active = (props ? props.active : false) as boolean;
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    if (!props) User.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<User.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "email",
      fieldNumber: 2,
      getValue: () => this.#email
    }, {
      name: "name",
      fieldNumber: 3,
      getValue: () => this.#name
    }, {
      name: "active",
      fieldNumber: 4,
      getValue: () => this.#active
    }, {
      name: "created",
      fieldNumber: 5,
      getValue: () => this.#created as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): User.Data {
    const props = {} as Partial<User.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "bigint")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as bigint;
    const emailValue = entries["2"] === undefined ? entries["email"] : entries["2"];
    if (emailValue === undefined) throw new Error("Missing required property \"email\".");
    if (!(typeof emailValue === "string")) throw new Error("Invalid value for property \"email\".");
    props.email = emailValue as string;
    const nameValue = entries["3"] === undefined ? entries["name"] : entries["3"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const activeValue = entries["4"] === undefined ? entries["active"] : entries["4"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue as boolean;
    const createdValue = entries["5"] === undefined ? entries["created"] : entries["5"];
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
    if (!(createdMessageValue as object instanceof Date || createdMessageValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdMessageValue as ImmutableDate | Date;
    return props as User.Data;
  }
  static from(value: User.Value): User {
    return value instanceof User ? value : new User(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "created":
        return new (this.constructor as typeof User)({
          id: this.#id,
          email: this.#email,
          name: this.#name,
          active: this.#active,
          created: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
  get id(): bigint {
    return this.#id;
  }
  get email(): string {
    return this.#email;
  }
  get name(): string {
    return this.#name;
  }
  get active(): boolean {
    return this.#active;
  }
  get created(): ImmutableDate {
    return this.#created;
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
      email: this.#email,
      name: this.#name,
      active: value,
      created: this.#created as ImmutableDate | Date
    }) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      email: this.#email,
      name: this.#name,
      active: this.#active,
      created: (value instanceof ImmutableDate ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
  setEmail(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      email: value,
      name: this.#name,
      active: this.#active,
      created: this.#created as ImmutableDate | Date
    }) as this);
  }
  setId(value: bigint) {
    return this.$update(new (this.constructor as typeof User)({
      id: value,
      email: this.#email,
      name: this.#name,
      active: this.#active,
      created: this.#created as ImmutableDate | Date
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      email: this.#email,
      name: value,
      active: this.#active,
      created: this.#created as ImmutableDate | Date
    }) as this);
  }
}
export namespace User {
  export type Data = {
    id: bigint;
    email: string;
    name: string;
    active: boolean;
    created: ImmutableDate | Date;
  };
  export type Value = User | User.Data;
}
const TYPE_TAG_Post = Symbol("Post");
export class Post extends Message<Post.Data> {
  static $typeId = "tests/table-wrapper.pmsg#Post";
  static $typeHash = "sha256:0ca590ea0d7a06bda1236a49a861654dd7929c2c65774066bc2994c413c8cc17";
  static $instanceTag = Symbol.for("propane:message:" + Post.$typeId);
  static readonly $typeName = "Post";
  static EMPTY: Post;
  #id!: bigint;
  #userId!: bigint;
  #title!: string;
  #content!: string;
  #published!: boolean;
  #created!: ImmutableDate;
  #updated!: ImmutableDate;
  constructor(props?: Post.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Post.EMPTY) return Post.EMPTY;
    super(TYPE_TAG_Post, "Post");
    this.#id = (props ? props.id : 0n) as bigint;
    this.#userId = (props ? props.userId : 0n) as bigint;
    this.#title = (props ? props.title : "") as string;
    this.#content = (props ? props.content : "") as string;
    this.#published = (props ? props.published : false) as boolean;
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    this.#updated = props ? props.updated instanceof ImmutableDate ? props.updated : new ImmutableDate(props.updated, options) : new ImmutableDate();
    if (!props) Post.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Post.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "userId",
      fieldNumber: 2,
      getValue: () => this.#userId
    }, {
      name: "title",
      fieldNumber: 3,
      getValue: () => this.#title
    }, {
      name: "content",
      fieldNumber: 4,
      getValue: () => this.#content
    }, {
      name: "published",
      fieldNumber: 5,
      getValue: () => this.#published
    }, {
      name: "created",
      fieldNumber: null,
      getValue: () => this.#created as ImmutableDate | Date
    }, {
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Post.Data {
    const props = {} as Partial<Post.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "bigint")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as bigint;
    const userIdValue = entries["2"] === undefined ? entries["userId"] : entries["2"];
    if (userIdValue === undefined) throw new Error("Missing required property \"userId\".");
    if (!(typeof userIdValue === "bigint")) throw new Error("Invalid value for property \"userId\".");
    props.userId = userIdValue as bigint;
    const titleValue = entries["3"] === undefined ? entries["title"] : entries["3"];
    if (titleValue === undefined) throw new Error("Missing required property \"title\".");
    if (!(typeof titleValue === "string")) throw new Error("Invalid value for property \"title\".");
    props.title = titleValue as string;
    const contentValue = entries["4"] === undefined ? entries["content"] : entries["4"];
    if (contentValue === undefined) throw new Error("Missing required property \"content\".");
    if (!(typeof contentValue === "string")) throw new Error("Invalid value for property \"content\".");
    props.content = contentValue as string;
    const publishedValue = entries["5"] === undefined ? entries["published"] : entries["5"];
    if (publishedValue === undefined) throw new Error("Missing required property \"published\".");
    if (!(typeof publishedValue === "boolean")) throw new Error("Invalid value for property \"published\".");
    props.published = publishedValue as boolean;
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
    if (!(createdMessageValue as object instanceof Date || createdMessageValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
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
    if (!(updatedMessageValue as object instanceof Date || updatedMessageValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"updated\".");
    props.updated = updatedMessageValue as ImmutableDate | Date;
    return props as Post.Data;
  }
  static from(value: Post.Value): Post {
    return value instanceof Post ? value : new Post(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "created":
        return new (this.constructor as typeof Post)({
          id: this.#id,
          userId: this.#userId,
          title: this.#title,
          content: this.#content,
          published: this.#published,
          created: child as ImmutableDate | Date,
          updated: this.#updated as ImmutableDate | Date
        }) as this;
      case "updated":
        return new (this.constructor as typeof Post)({
          id: this.#id,
          userId: this.#userId,
          title: this.#title,
          content: this.#content,
          published: this.#published,
          created: this.#created as ImmutableDate | Date,
          updated: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["updated", this.#updated] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Post>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Post.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Post.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): bigint {
    return this.#id;
  }
  get userId(): bigint {
    return this.#userId;
  }
  get title(): string {
    return this.#title;
  }
  get content(): string {
    return this.#content;
  }
  get published(): boolean {
    return this.#published;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  get updated(): ImmutableDate {
    return this.#updated;
  }
  set(updates: Partial<SetUpdates<Post.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Post)(data) as this);
  }
  setContent(value: string) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: value,
      published: this.#published,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date
    }) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: (value instanceof ImmutableDate ? value : new ImmutableDate(value)) as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date
    }) as this);
  }
  setId(value: bigint) {
    return this.$update(new (this.constructor as typeof Post)({
      id: value,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date
    }) as this);
  }
  setPublished(value: boolean) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: value,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date
    }) as this);
  }
  setTitle(value: string) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: value,
      content: this.#content,
      published: this.#published,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date
    }) as this);
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: this.#created as ImmutableDate | Date,
      updated: (value instanceof ImmutableDate ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
  setUserId(value: bigint) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: value,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: this.#created as ImmutableDate | Date,
      updated: this.#updated as ImmutableDate | Date
    }) as this);
  }
}
export namespace Post {
  export type Data = {
    id: bigint;
    userId: bigint;
    title: string;
    content: string;
    published: boolean;
    created: ImmutableDate | Date;
    updated: ImmutableDate | Date;
  };
  export type Value = Post | Post.Data;
}
