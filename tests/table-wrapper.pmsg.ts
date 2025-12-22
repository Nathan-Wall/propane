/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/table-wrapper.pmsg
import { Table } from '@propane/postgres';

/**
 * Test Table<T> wrapper for database types.
 * Table types are message types that also generate database schema.
 */
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, SKIP } from "../runtime/index.js";
export class User extends Message<User.Data> {
  static TYPE_TAG = Symbol("User");
  static readonly $typeName = "User";
  static EMPTY: User;
  #id!: bigint;
  #email!: string;
  #name!: string;
  #active!: boolean;
  #created!: ImmutableDate;
  constructor(props?: User.Value) {
    if (!props && User.EMPTY) return User.EMPTY;
    super(User.TYPE_TAG, "User");
    this.#id = props ? props.id : 0n;
    this.#email = props ? props.email : "";
    this.#name = props ? props.name : "";
    this.#active = props ? props.active : false;
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created) : new ImmutableDate(0);
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
      getValue: () => this.#created
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): User.Data {
    const props = {} as Partial<User.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "bigint")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const emailValue = entries["2"] === undefined ? entries["email"] : entries["2"];
    if (emailValue === undefined) throw new Error("Missing required property \"email\".");
    if (!(typeof emailValue === "string")) throw new Error("Invalid value for property \"email\".");
    props.email = emailValue;
    const nameValue = entries["3"] === undefined ? entries["name"] : entries["3"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const activeValue = entries["4"] === undefined ? entries["active"] : entries["4"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue;
    const createdValue = entries["5"] === undefined ? entries["created"] : entries["5"];
    if (createdValue === undefined) throw new Error("Missing required property \"created\".");
    if (!(createdValue instanceof Date || createdValue instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdValue;
    return props as User.Data;
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
    return this.$update(new (this.constructor as typeof User)(data));
  }
  setActive(value: boolean) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      email: this.#email,
      name: this.#name,
      active: value,
      created: this.#created
    }));
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      email: this.#email,
      name: this.#name,
      active: this.#active,
      created: value
    }));
  }
  setEmail(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      email: value,
      name: this.#name,
      active: this.#active,
      created: this.#created
    }));
  }
  setId(value: bigint) {
    return this.$update(new (this.constructor as typeof User)({
      id: value,
      email: this.#email,
      name: this.#name,
      active: this.#active,
      created: this.#created
    }));
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof User)({
      id: this.#id,
      email: this.#email,
      name: value,
      active: this.#active,
      created: this.#created
    }));
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
export class Post extends Message<Post.Data> {
  static TYPE_TAG = Symbol("Post");
  static readonly $typeName = "Post";
  static EMPTY: Post;
  #id!: bigint;
  #userId!: bigint;
  #title!: string;
  #content!: string;
  #published!: boolean;
  #created!: ImmutableDate;
  #updated!: ImmutableDate;
  constructor(props?: Post.Value) {
    if (!props && Post.EMPTY) return Post.EMPTY;
    super(Post.TYPE_TAG, "Post");
    this.#id = props ? props.id : 0n;
    this.#userId = props ? props.userId : 0n;
    this.#title = props ? props.title : "";
    this.#content = props ? props.content : "";
    this.#published = props ? props.published : false;
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created) : new ImmutableDate(0);
    this.#updated = props ? props.updated instanceof ImmutableDate ? props.updated : new ImmutableDate(props.updated) : new ImmutableDate(0);
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
      getValue: () => this.#created
    }, {
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Post.Data {
    const props = {} as Partial<Post.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "bigint")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const userIdValue = entries["2"] === undefined ? entries["userId"] : entries["2"];
    if (userIdValue === undefined) throw new Error("Missing required property \"userId\".");
    if (!(typeof userIdValue === "bigint")) throw new Error("Invalid value for property \"userId\".");
    props.userId = userIdValue;
    const titleValue = entries["3"] === undefined ? entries["title"] : entries["3"];
    if (titleValue === undefined) throw new Error("Missing required property \"title\".");
    if (!(typeof titleValue === "string")) throw new Error("Invalid value for property \"title\".");
    props.title = titleValue;
    const contentValue = entries["4"] === undefined ? entries["content"] : entries["4"];
    if (contentValue === undefined) throw new Error("Missing required property \"content\".");
    if (!(typeof contentValue === "string")) throw new Error("Invalid value for property \"content\".");
    props.content = contentValue;
    const publishedValue = entries["5"] === undefined ? entries["published"] : entries["5"];
    if (publishedValue === undefined) throw new Error("Missing required property \"published\".");
    if (!(typeof publishedValue === "boolean")) throw new Error("Invalid value for property \"published\".");
    props.published = publishedValue;
    const createdValue = entries["created"];
    if (createdValue === undefined) throw new Error("Missing required property \"created\".");
    if (!(createdValue instanceof Date || createdValue instanceof ImmutableDate)) throw new Error("Invalid value for property \"created\".");
    props.created = createdValue;
    const updatedValue = entries["updated"];
    if (updatedValue === undefined) throw new Error("Missing required property \"updated\".");
    if (!(updatedValue instanceof Date || updatedValue instanceof ImmutableDate)) throw new Error("Invalid value for property \"updated\".");
    props.updated = updatedValue;
    return props as Post.Data;
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
    return this.$update(new (this.constructor as typeof Post)(data));
  }
  setContent(value: string) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: value,
      published: this.#published,
      created: this.#created,
      updated: this.#updated
    }));
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: value,
      updated: this.#updated
    }));
  }
  setId(value: bigint) {
    return this.$update(new (this.constructor as typeof Post)({
      id: value,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: this.#created,
      updated: this.#updated
    }));
  }
  setPublished(value: boolean) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: value,
      created: this.#created,
      updated: this.#updated
    }));
  }
  setTitle(value: string) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: value,
      content: this.#content,
      published: this.#published,
      created: this.#created,
      updated: this.#updated
    }));
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: this.#created,
      updated: value
    }));
  }
  setUserId(value: bigint) {
    return this.$update(new (this.constructor as typeof Post)({
      id: this.#id,
      userId: value,
      title: this.#title,
      content: this.#content,
      published: this.#published,
      created: this.#created,
      updated: this.#updated
    }));
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
