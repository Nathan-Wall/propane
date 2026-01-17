/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/table-wrapper.pmsg
import { Table } from '@propane/postgres';

/**
 * Test Table<T> wrapper for database types.
 * Table types are message types that also generate database schema.
 */
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, parseCerealString, ensure, SKIP } from "../runtime/index.js";
const TYPE_TAG_User = Symbol("User");
export class User extends Message<User.Data> {
  static $typeId = "tests/table-wrapper.pmsg#User";
  static $typeHash = "sha256:ff96e03d2e955b46229d7258f6d2a9432d51c4a4ccc93893c2a2a7df759f7128";
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
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : ImmutableDate.from(props.created) : new ImmutableDate(0);
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
    if (!(createdValue as object instanceof Date || createdValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdValue as Date;
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
      created: value as ImmutableDate | Date
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
  static $typeHash = "sha256:0957a5a39c4a32182e1be3f7200f0f2e3e966ed19d683c6d49e5422da9fe6d1a";
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
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : ImmutableDate.from(props.created) : new ImmutableDate(0);
    this.#updated = props ? props.updated instanceof ImmutableDate ? props.updated : ImmutableDate.from(props.updated) : new ImmutableDate(0);
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
    if (!(createdValue as object instanceof Date || createdValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdValue as Date;
    const updatedValue = entries["updated"];
    if (updatedValue === undefined) throw new Error("Missing required property \"updated\".");
    if (!(updatedValue as object instanceof Date || updatedValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"updated\".");
    props.updated = updatedValue as Date;
    return props as Post.Data;
  }
  static from(value: Post.Value): Post {
    return value instanceof Post ? value : new Post(value);
  }
  static deserialize<T extends typeof Post>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
      created: value as ImmutableDate | Date,
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
      updated: value as ImmutableDate | Date
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
