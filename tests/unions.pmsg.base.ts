/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/unions.pmsg
import { Email } from './email.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, ImmutableSet, equals, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError, ImmutableArray, ImmutableDate } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Unions_Metadata_Union1 = Symbol("Unions_Metadata_Union1");
export class Unions_Metadata_Union1 extends Message<Unions_Metadata_Union1.Data> {
  static $typeId = "tests/unions.pmsg#Unions_Metadata_Union1";
  static $typeHash = "sha256:20fd82383a102902b283c4e368a743436df950145022fe82bd7afddec60f710b";
  static $instanceTag = Symbol.for("propane:message:" + Unions_Metadata_Union1.$typeId);
  static readonly $typeName = "Unions_Metadata_Union1";
  static EMPTY: Unions_Metadata_Union1;
  #created!: ImmutableDate;
  constructor(props?: Unions_Metadata_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_Metadata_Union1.EMPTY) return Unions_Metadata_Union1.EMPTY;
    super(TYPE_TAG_Unions_Metadata_Union1, "Unions_Metadata_Union1");
    this.#created = props ? ImmutableDate.isInstance(props.created) ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    if (!props) Unions_Metadata_Union1.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_Metadata_Union1.Data>[] {
    return [{
      name: "created",
      fieldNumber: null,
      getValue: () => this.#created as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_Metadata_Union1.Data {
    const props = {} as Partial<Unions_Metadata_Union1.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(createdValue);
    props.created = createdMessageValue as ImmutableDate | Date;
    return props as Unions_Metadata_Union1.Data;
  }
  static from(value: Unions_Metadata_Union1.Value): Unions_Metadata_Union1 {
    return Unions_Metadata_Union1.isInstance(value) ? value : new Unions_Metadata_Union1(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "created":
        return new (this.constructor as typeof Unions_Metadata_Union1)({
          created: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_Metadata_Union1>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_Metadata_Union1.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_Metadata_Union1.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  set(updates: Partial<SetUpdates<Unions_Metadata_Union1.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_Metadata_Union1)(data) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_Metadata_Union1)({
      created: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_Metadata_Union1 {
  export type Data = {
    created: ImmutableDate | Date;
  };
  export type Value = Unions_Metadata_Union1 | Unions_Metadata_Union1.Data;
}
const TYPE_TAG_Unions_Metadata_Union2 = Symbol("Unions_Metadata_Union2");
export class Unions_Metadata_Union2 extends Message<Unions_Metadata_Union2.Data> {
  static $typeId = "tests/unions.pmsg#Unions_Metadata_Union2";
  static $typeHash = "sha256:5766ab54f69d9e889876ff9bf295f481ebf6a2ec57b452b42d11285ee791d97e";
  static $instanceTag = Symbol.for("propane:message:" + Unions_Metadata_Union2.$typeId);
  static readonly $typeName = "Unions_Metadata_Union2";
  static EMPTY: Unions_Metadata_Union2;
  #updated!: ImmutableDate;
  constructor(props?: Unions_Metadata_Union2.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_Metadata_Union2.EMPTY) return Unions_Metadata_Union2.EMPTY;
    super(TYPE_TAG_Unions_Metadata_Union2, "Unions_Metadata_Union2");
    this.#updated = props ? ImmutableDate.isInstance(props.updated) ? props.updated : new ImmutableDate(props.updated, options) : new ImmutableDate();
    if (!props) Unions_Metadata_Union2.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_Metadata_Union2.Data>[] {
    return [{
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_Metadata_Union2.Data {
    const props = {} as Partial<Unions_Metadata_Union2.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(updatedValue);
    props.updated = updatedMessageValue as ImmutableDate | Date;
    return props as Unions_Metadata_Union2.Data;
  }
  static from(value: Unions_Metadata_Union2.Value): Unions_Metadata_Union2 {
    return Unions_Metadata_Union2.isInstance(value) ? value : new Unions_Metadata_Union2(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "updated":
        return new (this.constructor as typeof Unions_Metadata_Union2)({
          updated: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["updated", this.#updated] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_Metadata_Union2>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_Metadata_Union2.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_Metadata_Union2.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get updated(): ImmutableDate {
    return this.#updated;
  }
  set(updates: Partial<SetUpdates<Unions_Metadata_Union2.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_Metadata_Union2)(data) as this);
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_Metadata_Union2)({
      updated: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_Metadata_Union2 {
  export type Data = {
    updated: ImmutableDate | Date;
  };
  export type Value = Unions_Metadata_Union2 | Unions_Metadata_Union2.Data;
}
const TYPE_TAG_Unions_Items_Item_Union1 = Symbol("Unions_Items_Item_Union1");
export class Unions_Items_Item_Union1 extends Message<Unions_Items_Item_Union1.Data> {
  static $typeId = "tests/unions.pmsg#Unions_Items_Item_Union1";
  static $typeHash = "sha256:20fd82383a102902b283c4e368a743436df950145022fe82bd7afddec60f710b";
  static $instanceTag = Symbol.for("propane:message:" + Unions_Items_Item_Union1.$typeId);
  static readonly $typeName = "Unions_Items_Item_Union1";
  static EMPTY: Unions_Items_Item_Union1;
  #created!: ImmutableDate;
  constructor(props?: Unions_Items_Item_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_Items_Item_Union1.EMPTY) return Unions_Items_Item_Union1.EMPTY;
    super(TYPE_TAG_Unions_Items_Item_Union1, "Unions_Items_Item_Union1");
    this.#created = props ? ImmutableDate.isInstance(props.created) ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    if (!props) Unions_Items_Item_Union1.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_Items_Item_Union1.Data>[] {
    return [{
      name: "created",
      fieldNumber: null,
      getValue: () => this.#created as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_Items_Item_Union1.Data {
    const props = {} as Partial<Unions_Items_Item_Union1.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(createdValue);
    props.created = createdMessageValue as ImmutableDate | Date;
    return props as Unions_Items_Item_Union1.Data;
  }
  static from(value: Unions_Items_Item_Union1.Value): Unions_Items_Item_Union1 {
    return Unions_Items_Item_Union1.isInstance(value) ? value : new Unions_Items_Item_Union1(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "created":
        return new (this.constructor as typeof Unions_Items_Item_Union1)({
          created: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_Items_Item_Union1>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_Items_Item_Union1.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_Items_Item_Union1.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  set(updates: Partial<SetUpdates<Unions_Items_Item_Union1.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_Items_Item_Union1)(data) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_Items_Item_Union1)({
      created: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_Items_Item_Union1 {
  export type Data = {
    created: ImmutableDate | Date;
  };
  export type Value = Unions_Items_Item_Union1 | Unions_Items_Item_Union1.Data;
}
const TYPE_TAG_Unions_Items_Item_Union2 = Symbol("Unions_Items_Item_Union2");
export class Unions_Items_Item_Union2 extends Message<Unions_Items_Item_Union2.Data> {
  static $typeId = "tests/unions.pmsg#Unions_Items_Item_Union2";
  static $typeHash = "sha256:5766ab54f69d9e889876ff9bf295f481ebf6a2ec57b452b42d11285ee791d97e";
  static $instanceTag = Symbol.for("propane:message:" + Unions_Items_Item_Union2.$typeId);
  static readonly $typeName = "Unions_Items_Item_Union2";
  static EMPTY: Unions_Items_Item_Union2;
  #updated!: ImmutableDate;
  constructor(props?: Unions_Items_Item_Union2.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_Items_Item_Union2.EMPTY) return Unions_Items_Item_Union2.EMPTY;
    super(TYPE_TAG_Unions_Items_Item_Union2, "Unions_Items_Item_Union2");
    this.#updated = props ? ImmutableDate.isInstance(props.updated) ? props.updated : new ImmutableDate(props.updated, options) : new ImmutableDate();
    if (!props) Unions_Items_Item_Union2.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_Items_Item_Union2.Data>[] {
    return [{
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_Items_Item_Union2.Data {
    const props = {} as Partial<Unions_Items_Item_Union2.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(updatedValue);
    props.updated = updatedMessageValue as ImmutableDate | Date;
    return props as Unions_Items_Item_Union2.Data;
  }
  static from(value: Unions_Items_Item_Union2.Value): Unions_Items_Item_Union2 {
    return Unions_Items_Item_Union2.isInstance(value) ? value : new Unions_Items_Item_Union2(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "updated":
        return new (this.constructor as typeof Unions_Items_Item_Union2)({
          updated: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["updated", this.#updated] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_Items_Item_Union2>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_Items_Item_Union2.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_Items_Item_Union2.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get updated(): ImmutableDate {
    return this.#updated;
  }
  set(updates: Partial<SetUpdates<Unions_Items_Item_Union2.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_Items_Item_Union2)(data) as this);
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_Items_Item_Union2)({
      updated: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_Items_Item_Union2 {
  export type Data = {
    updated: ImmutableDate | Date;
  };
  export type Value = Unions_Items_Item_Union2 | Unions_Items_Item_Union2.Data;
}
const TYPE_TAG_Unions_ItemSet_Item_Union1 = Symbol("Unions_ItemSet_Item_Union1");
export class Unions_ItemSet_Item_Union1 extends Message<Unions_ItemSet_Item_Union1.Data> {
  static $typeId = "tests/unions.pmsg#Unions_ItemSet_Item_Union1";
  static $typeHash = "sha256:20fd82383a102902b283c4e368a743436df950145022fe82bd7afddec60f710b";
  static $instanceTag = Symbol.for("propane:message:" + Unions_ItemSet_Item_Union1.$typeId);
  static readonly $typeName = "Unions_ItemSet_Item_Union1";
  static EMPTY: Unions_ItemSet_Item_Union1;
  #created!: ImmutableDate;
  constructor(props?: Unions_ItemSet_Item_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_ItemSet_Item_Union1.EMPTY) return Unions_ItemSet_Item_Union1.EMPTY;
    super(TYPE_TAG_Unions_ItemSet_Item_Union1, "Unions_ItemSet_Item_Union1");
    this.#created = props ? ImmutableDate.isInstance(props.created) ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    if (!props) Unions_ItemSet_Item_Union1.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_ItemSet_Item_Union1.Data>[] {
    return [{
      name: "created",
      fieldNumber: null,
      getValue: () => this.#created as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_ItemSet_Item_Union1.Data {
    const props = {} as Partial<Unions_ItemSet_Item_Union1.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(createdValue);
    props.created = createdMessageValue as ImmutableDate | Date;
    return props as Unions_ItemSet_Item_Union1.Data;
  }
  static from(value: Unions_ItemSet_Item_Union1.Value): Unions_ItemSet_Item_Union1 {
    return Unions_ItemSet_Item_Union1.isInstance(value) ? value : new Unions_ItemSet_Item_Union1(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "created":
        return new (this.constructor as typeof Unions_ItemSet_Item_Union1)({
          created: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_ItemSet_Item_Union1>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_ItemSet_Item_Union1.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_ItemSet_Item_Union1.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  set(updates: Partial<SetUpdates<Unions_ItemSet_Item_Union1.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_ItemSet_Item_Union1)(data) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_ItemSet_Item_Union1)({
      created: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_ItemSet_Item_Union1 {
  export type Data = {
    created: ImmutableDate | Date;
  };
  export type Value = Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union1.Data;
}
const TYPE_TAG_Unions_ItemSet_Item_Union2 = Symbol("Unions_ItemSet_Item_Union2");
export class Unions_ItemSet_Item_Union2 extends Message<Unions_ItemSet_Item_Union2.Data> {
  static $typeId = "tests/unions.pmsg#Unions_ItemSet_Item_Union2";
  static $typeHash = "sha256:5766ab54f69d9e889876ff9bf295f481ebf6a2ec57b452b42d11285ee791d97e";
  static $instanceTag = Symbol.for("propane:message:" + Unions_ItemSet_Item_Union2.$typeId);
  static readonly $typeName = "Unions_ItemSet_Item_Union2";
  static EMPTY: Unions_ItemSet_Item_Union2;
  #updated!: ImmutableDate;
  constructor(props?: Unions_ItemSet_Item_Union2.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_ItemSet_Item_Union2.EMPTY) return Unions_ItemSet_Item_Union2.EMPTY;
    super(TYPE_TAG_Unions_ItemSet_Item_Union2, "Unions_ItemSet_Item_Union2");
    this.#updated = props ? ImmutableDate.isInstance(props.updated) ? props.updated : new ImmutableDate(props.updated, options) : new ImmutableDate();
    if (!props) Unions_ItemSet_Item_Union2.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_ItemSet_Item_Union2.Data>[] {
    return [{
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_ItemSet_Item_Union2.Data {
    const props = {} as Partial<Unions_ItemSet_Item_Union2.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(updatedValue);
    props.updated = updatedMessageValue as ImmutableDate | Date;
    return props as Unions_ItemSet_Item_Union2.Data;
  }
  static from(value: Unions_ItemSet_Item_Union2.Value): Unions_ItemSet_Item_Union2 {
    return Unions_ItemSet_Item_Union2.isInstance(value) ? value : new Unions_ItemSet_Item_Union2(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "updated":
        return new (this.constructor as typeof Unions_ItemSet_Item_Union2)({
          updated: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["updated", this.#updated] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_ItemSet_Item_Union2>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_ItemSet_Item_Union2.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_ItemSet_Item_Union2.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get updated(): ImmutableDate {
    return this.#updated;
  }
  set(updates: Partial<SetUpdates<Unions_ItemSet_Item_Union2.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_ItemSet_Item_Union2)(data) as this);
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_ItemSet_Item_Union2)({
      updated: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_ItemSet_Item_Union2 {
  export type Data = {
    updated: ImmutableDate | Date;
  };
  export type Value = Unions_ItemSet_Item_Union2 | Unions_ItemSet_Item_Union2.Data;
}
const TYPE_TAG_Unions_ItemMap_Value_Union1 = Symbol("Unions_ItemMap_Value_Union1");
export class Unions_ItemMap_Value_Union1 extends Message<Unions_ItemMap_Value_Union1.Data> {
  static $typeId = "tests/unions.pmsg#Unions_ItemMap_Value_Union1";
  static $typeHash = "sha256:20fd82383a102902b283c4e368a743436df950145022fe82bd7afddec60f710b";
  static $instanceTag = Symbol.for("propane:message:" + Unions_ItemMap_Value_Union1.$typeId);
  static readonly $typeName = "Unions_ItemMap_Value_Union1";
  static EMPTY: Unions_ItemMap_Value_Union1;
  #created!: ImmutableDate;
  constructor(props?: Unions_ItemMap_Value_Union1.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_ItemMap_Value_Union1.EMPTY) return Unions_ItemMap_Value_Union1.EMPTY;
    super(TYPE_TAG_Unions_ItemMap_Value_Union1, "Unions_ItemMap_Value_Union1");
    this.#created = props ? ImmutableDate.isInstance(props.created) ? props.created : new ImmutableDate(props.created, options) : new ImmutableDate();
    if (!props) Unions_ItemMap_Value_Union1.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_ItemMap_Value_Union1.Data>[] {
    return [{
      name: "created",
      fieldNumber: null,
      getValue: () => this.#created as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_ItemMap_Value_Union1.Data {
    const props = {} as Partial<Unions_ItemMap_Value_Union1.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(createdValue);
    props.created = createdMessageValue as ImmutableDate | Date;
    return props as Unions_ItemMap_Value_Union1.Data;
  }
  static from(value: Unions_ItemMap_Value_Union1.Value): Unions_ItemMap_Value_Union1 {
    return Unions_ItemMap_Value_Union1.isInstance(value) ? value : new Unions_ItemMap_Value_Union1(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "created":
        return new (this.constructor as typeof Unions_ItemMap_Value_Union1)({
          created: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["created", this.#created] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_ItemMap_Value_Union1>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_ItemMap_Value_Union1.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_ItemMap_Value_Union1.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  set(updates: Partial<SetUpdates<Unions_ItemMap_Value_Union1.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_ItemMap_Value_Union1)(data) as this);
  }
  setCreated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_ItemMap_Value_Union1)({
      created: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_ItemMap_Value_Union1 {
  export type Data = {
    created: ImmutableDate | Date;
  };
  export type Value = Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union1.Data;
}
const TYPE_TAG_Unions_ItemMap_Value_Union2 = Symbol("Unions_ItemMap_Value_Union2");
export class Unions_ItemMap_Value_Union2 extends Message<Unions_ItemMap_Value_Union2.Data> {
  static $typeId = "tests/unions.pmsg#Unions_ItemMap_Value_Union2";
  static $typeHash = "sha256:5766ab54f69d9e889876ff9bf295f481ebf6a2ec57b452b42d11285ee791d97e";
  static $instanceTag = Symbol.for("propane:message:" + Unions_ItemMap_Value_Union2.$typeId);
  static readonly $typeName = "Unions_ItemMap_Value_Union2";
  static EMPTY: Unions_ItemMap_Value_Union2;
  #updated!: ImmutableDate;
  constructor(props?: Unions_ItemMap_Value_Union2.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions_ItemMap_Value_Union2.EMPTY) return Unions_ItemMap_Value_Union2.EMPTY;
    super(TYPE_TAG_Unions_ItemMap_Value_Union2, "Unions_ItemMap_Value_Union2");
    this.#updated = props ? ImmutableDate.isInstance(props.updated) ? props.updated : new ImmutableDate(props.updated, options) : new ImmutableDate();
    if (!props) Unions_ItemMap_Value_Union2.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions_ItemMap_Value_Union2.Data>[] {
    return [{
      name: "updated",
      fieldNumber: null,
      getValue: () => this.#updated as ImmutableDate | Date
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions_ItemMap_Value_Union2.Data {
    const props = {} as Partial<Unions_ItemMap_Value_Union2.Data>;
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
          result = ImmutableDate.isInstance(value) ? value : new ImmutableDate(value as ImmutableDate.Value, options);
        }
      }
      return result;
    })(updatedValue);
    props.updated = updatedMessageValue as ImmutableDate | Date;
    return props as Unions_ItemMap_Value_Union2.Data;
  }
  static from(value: Unions_ItemMap_Value_Union2.Value): Unions_ItemMap_Value_Union2 {
    return Unions_ItemMap_Value_Union2.isInstance(value) ? value : new Unions_ItemMap_Value_Union2(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "updated":
        return new (this.constructor as typeof Unions_ItemMap_Value_Union2)({
          updated: child as ImmutableDate | Date
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["updated", this.#updated] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions_ItemMap_Value_Union2>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions_ItemMap_Value_Union2.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions_ItemMap_Value_Union2.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get updated(): ImmutableDate {
    return this.#updated;
  }
  set(updates: Partial<SetUpdates<Unions_ItemMap_Value_Union2.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions_ItemMap_Value_Union2)(data) as this);
  }
  setUpdated(value: ImmutableDate | Date) {
    return this.$update(new (this.constructor as typeof Unions_ItemMap_Value_Union2)({
      updated: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date
    }) as this);
  }
}
export namespace Unions_ItemMap_Value_Union2 {
  export type Data = {
    updated: ImmutableDate | Date;
  };
  export type Value = Unions_ItemMap_Value_Union2 | Unions_ItemMap_Value_Union2.Data;
}
const TYPE_TAG_Unions = Symbol("Unions");
export class Unions extends Message<Unions.Data> {
  static $typeId = "tests/unions.pmsg#Unions";
  static $typeHash = "sha256:f0b06dba4af8e1c6a20c6ff9fb1d68b83d0a7d725efb953642162ced36620356";
  static $instanceTag = Symbol.for("propane:message:" + Unions.$typeId);
  static readonly $typeName = "Unions";
  static EMPTY: Unions;
  #username!: string | null;
  #email!: Email | null;
  #metadata!: Unions_Metadata_Union1 | Unions_Metadata_Union2;
  #items!: ImmutableArray<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)> | undefined;
  #itemSet!: ImmutableSet<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | undefined;
  #itemMap!: ImmutableMap<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | undefined;
  constructor(props?: Unions.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions.EMPTY) return Unions.EMPTY;
    super(TYPE_TAG_Unions, "Unions");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#username = (props ? props.username : "") as string | null;
    this.#email = (props ? props.email : undefined) as Email | null;
    this.#metadata = (props ? (value => {
      if (!options?.skipValidation && true && !(Unions_Metadata_Union1.isInstance(value) || Unions_Metadata_Union2.isInstance(value))) throw new Error("Invalid value for property \"metadata\".");
      return value;
    })((value => {
      const result = value as any;
      return result;
    })(props.metadata)) : new Unions_Metadata_Union1()) as Unions_Metadata_Union1 | Unions_Metadata_Union2;
    this.#items = props ? (value => {
      if (!options?.skipValidation && value !== undefined && !((value as object instanceof ImmutableArray || Array.isArray(value)) && [...(value as Iterable<unknown>)].every(element => Unions_Items_Item_Union1.isInstance(element) || Unions_Items_Item_Union2.isInstance(element)))) throw new Error("Invalid value for property \"items\".");
      return value;
    })(props.items === undefined || props.items === null ? props.items : ImmutableArray.isInstance(props.items) ? props.items : new ImmutableArray(props.items as Iterable<unknown>)) as ImmutableArray<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)> : undefined;
    this.#itemSet = props ? (value => {
      if (!options?.skipValidation && value !== undefined && !((value as object instanceof ImmutableSet || value as object instanceof Set) && [...(value as Iterable<unknown>)].every(setValue => Unions_ItemSet_Item_Union1.isInstance(setValue) || Unions_ItemSet_Item_Union2.isInstance(setValue)))) throw new Error("Invalid value for property \"itemSet\".");
      return value;
    })(props.itemSet === undefined || props.itemSet === null ? props.itemSet : ImmutableSet.isInstance(props.itemSet) ? props.itemSet : new ImmutableSet(props.itemSet as Iterable<unknown>)) as ImmutableSet<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> : undefined;
    this.#itemMap = props ? (value => {
      if (!options?.skipValidation && value !== undefined && !((value as object instanceof ImmutableMap || value as object instanceof Map) && [...(value as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && (Unions_ItemMap_Value_Union1.isInstance(mapValue) || Unions_ItemMap_Value_Union2.isInstance(mapValue))))) throw new Error("Invalid value for property \"itemMap\".");
      return value;
    })(props.itemMap === undefined || props.itemMap === null ? props.itemMap : ImmutableMap.isInstance(props.itemMap) ? props.itemMap : new ImmutableMap(props.itemMap as Iterable<[unknown, unknown]>)) as ImmutableMap<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> : undefined;
    if (!props) Unions.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions.Data>[] {
    return [{
      name: "username",
      fieldNumber: null,
      getValue: () => this.#username as string | null,
      unionHasString: true
    }, {
      name: "email",
      fieldNumber: null,
      getValue: () => this.#email as Email | null | Email | null
    }, {
      name: "metadata",
      fieldNumber: null,
      getValue: () => this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      unionMessageTypes: ["Unions_Metadata_Union1", "Unions_Metadata_Union2"]
    }, {
      name: "items",
      fieldNumber: null,
      getValue: () => this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      arrayElementUnionMessageTypes: ["Unions_Items_Item_Union1", "Unions_Items_Item_Union2"]
    }, {
      name: "itemSet",
      fieldNumber: null,
      getValue: () => this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      setElementUnionMessageTypes: ["Unions_ItemSet_Item_Union1", "Unions_ItemSet_Item_Union2"]
    }, {
      name: "itemMap",
      fieldNumber: null,
      getValue: () => this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>,
      mapValueUnionMessageTypes: ["Unions_ItemMap_Value_Union1", "Unions_ItemMap_Value_Union2"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions.Data {
    const props = {} as Partial<Unions.Data>;
    const usernameValue = entries["username"];
    if (usernameValue === undefined) throw new Error("Missing required property \"username\".");
    if (!(typeof usernameValue === "string" || usernameValue === null)) throw new Error("Invalid value for property \"username\".");
    props.username = usernameValue as string | null;
    const emailValue = entries["email"];
    if (emailValue === undefined) throw new Error("Missing required property \"email\".");
    if (!(emailValue === null)) throw new Error("Invalid value for property \"email\".");
    props.email = emailValue as Email | null;
    const metadataValue = entries["metadata"];
    if (metadataValue === undefined) throw new Error("Missing required property \"metadata\".");
    let metadataUnionValue: any = metadataValue as any;
    if (isTaggedMessageData(metadataValue)) {
      if (metadataValue.$tag === "Unions_Metadata_Union1") {
        if (typeof metadataValue.$data === "string") {
          if (Unions_Metadata_Union1.$compact === true) {
            metadataUnionValue = Unions_Metadata_Union1.fromCompact(Unions_Metadata_Union1.$compactTag && metadataValue.$data.startsWith(Unions_Metadata_Union1.$compactTag) ? metadataValue.$data.slice(Unions_Metadata_Union1.$compactTag.length) : metadataValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"metadata\" (Unions_Metadata_Union1).");
          }
        } else {
          metadataUnionValue = new Unions_Metadata_Union1(Unions_Metadata_Union1.prototype.$fromEntries(metadataValue.$data, options), options);
        }
      } else if (metadataValue.$tag === "Unions_Metadata_Union2") {
        if (typeof metadataValue.$data === "string") {
          if (Unions_Metadata_Union2.$compact === true) {
            metadataUnionValue = Unions_Metadata_Union2.fromCompact(Unions_Metadata_Union2.$compactTag && metadataValue.$data.startsWith(Unions_Metadata_Union2.$compactTag) ? metadataValue.$data.slice(Unions_Metadata_Union2.$compactTag.length) : metadataValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"metadata\" (Unions_Metadata_Union2).");
          }
        } else {
          metadataUnionValue = new Unions_Metadata_Union2(Unions_Metadata_Union2.prototype.$fromEntries(metadataValue.$data, options), options);
        }
      }
    }
    if (typeof metadataValue === "string") {
      if (Unions_Metadata_Union1.$compactTag && metadataValue.startsWith(Unions_Metadata_Union1.$compactTag)) {
        if (Unions_Metadata_Union1.$compact === true) {
          metadataUnionValue = Unions_Metadata_Union1.fromCompact(Unions_Metadata_Union1.$compactTag && metadataValue.startsWith(Unions_Metadata_Union1.$compactTag) ? metadataValue.slice(Unions_Metadata_Union1.$compactTag.length) : metadataValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"metadata\" (Unions_Metadata_Union1).");
        }
      } else if (Unions_Metadata_Union2.$compactTag && metadataValue.startsWith(Unions_Metadata_Union2.$compactTag)) {
        if (Unions_Metadata_Union2.$compact === true) {
          metadataUnionValue = Unions_Metadata_Union2.fromCompact(Unions_Metadata_Union2.$compactTag && metadataValue.startsWith(Unions_Metadata_Union2.$compactTag) ? metadataValue.slice(Unions_Metadata_Union2.$compactTag.length) : metadataValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"metadata\" (Unions_Metadata_Union2).");
        }
      }
    }
    if (!(Unions_Metadata_Union1.isInstance(metadataUnionValue) || Unions_Metadata_Union2.isInstance(metadataUnionValue))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataUnionValue;
    const itemsValue = entries["items"];
    const itemsNormalized = itemsValue === null ? undefined : itemsValue;
    const itemsArrayValue = itemsNormalized === undefined || itemsNormalized === null ? itemsNormalized : ImmutableArray.isInstance(itemsNormalized) ? itemsNormalized : new ImmutableArray(itemsNormalized as Iterable<unknown>);
    const itemsArrayValueConverted = itemsArrayValue === undefined || itemsArrayValue === null ? itemsArrayValue : (itemsArrayValue as ImmutableArray<unknown> | unknown[]).map(element => (value => {
      let unionValue: any = value as any;
      if (isTaggedMessageData(value)) {
        if (value.$tag === "Unions_Items_Item_Union1") {
          if (typeof value.$data === "string") {
            if (Unions_Items_Item_Union1.$compact === true) {
              unionValue = Unions_Items_Item_Union1.fromCompact(Unions_Items_Item_Union1.$compactTag && value.$data.startsWith(Unions_Items_Item_Union1.$compactTag) ? value.$data.slice(Unions_Items_Item_Union1.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"items element\" (Unions_Items_Item_Union1).");
            }
          } else {
            unionValue = new Unions_Items_Item_Union1(Unions_Items_Item_Union1.prototype.$fromEntries(value.$data, options), options);
          }
        } else if (value.$tag === "Unions_Items_Item_Union2") {
          if (typeof value.$data === "string") {
            if (Unions_Items_Item_Union2.$compact === true) {
              unionValue = Unions_Items_Item_Union2.fromCompact(Unions_Items_Item_Union2.$compactTag && value.$data.startsWith(Unions_Items_Item_Union2.$compactTag) ? value.$data.slice(Unions_Items_Item_Union2.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"items element\" (Unions_Items_Item_Union2).");
            }
          } else {
            unionValue = new Unions_Items_Item_Union2(Unions_Items_Item_Union2.prototype.$fromEntries(value.$data, options), options);
          }
        }
      }
      if (typeof value === "string") {
        if (Unions_Items_Item_Union1.$compactTag && value.startsWith(Unions_Items_Item_Union1.$compactTag)) {
          if (Unions_Items_Item_Union1.$compact === true) {
            unionValue = Unions_Items_Item_Union1.fromCompact(Unions_Items_Item_Union1.$compactTag && value.startsWith(Unions_Items_Item_Union1.$compactTag) ? value.slice(Unions_Items_Item_Union1.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"items element\" (Unions_Items_Item_Union1).");
          }
        } else if (Unions_Items_Item_Union2.$compactTag && value.startsWith(Unions_Items_Item_Union2.$compactTag)) {
          if (Unions_Items_Item_Union2.$compact === true) {
            unionValue = Unions_Items_Item_Union2.fromCompact(Unions_Items_Item_Union2.$compactTag && value.startsWith(Unions_Items_Item_Union2.$compactTag) ? value.slice(Unions_Items_Item_Union2.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"items element\" (Unions_Items_Item_Union2).");
          }
        }
      }
      return unionValue;
    })(element));
    if (itemsArrayValueConverted !== undefined && !((itemsArrayValueConverted as object instanceof ImmutableArray || Array.isArray(itemsArrayValueConverted)) && [...(itemsArrayValueConverted as Iterable<unknown>)].every(element => Unions_Items_Item_Union1.isInstance(element) || Unions_Items_Item_Union2.isInstance(element)))) throw new Error("Invalid value for property \"items\".");
    props.items = itemsArrayValueConverted as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>;
    const itemSetValue = entries["itemSet"];
    const itemSetNormalized = itemSetValue === null ? undefined : itemSetValue;
    const itemSetSetValue = itemSetNormalized === undefined || itemSetNormalized === null ? itemSetNormalized : ImmutableSet.isInstance(itemSetNormalized) ? itemSetNormalized : new ImmutableSet(itemSetNormalized as Iterable<unknown>);
    const itemSetSetValueConverted = itemSetSetValue === undefined || itemSetSetValue === null ? itemSetSetValue : new ImmutableSet(Array.from(itemSetSetValue as Iterable<unknown>, element => (value => {
      let unionValue: any = value as any;
      if (isTaggedMessageData(value)) {
        if (value.$tag === "Unions_ItemSet_Item_Union1") {
          if (typeof value.$data === "string") {
            if (Unions_ItemSet_Item_Union1.$compact === true) {
              unionValue = Unions_ItemSet_Item_Union1.fromCompact(Unions_ItemSet_Item_Union1.$compactTag && value.$data.startsWith(Unions_ItemSet_Item_Union1.$compactTag) ? value.$data.slice(Unions_ItemSet_Item_Union1.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"itemSet element\" (Unions_ItemSet_Item_Union1).");
            }
          } else {
            unionValue = new Unions_ItemSet_Item_Union1(Unions_ItemSet_Item_Union1.prototype.$fromEntries(value.$data, options), options);
          }
        } else if (value.$tag === "Unions_ItemSet_Item_Union2") {
          if (typeof value.$data === "string") {
            if (Unions_ItemSet_Item_Union2.$compact === true) {
              unionValue = Unions_ItemSet_Item_Union2.fromCompact(Unions_ItemSet_Item_Union2.$compactTag && value.$data.startsWith(Unions_ItemSet_Item_Union2.$compactTag) ? value.$data.slice(Unions_ItemSet_Item_Union2.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"itemSet element\" (Unions_ItemSet_Item_Union2).");
            }
          } else {
            unionValue = new Unions_ItemSet_Item_Union2(Unions_ItemSet_Item_Union2.prototype.$fromEntries(value.$data, options), options);
          }
        }
      }
      if (typeof value === "string") {
        if (Unions_ItemSet_Item_Union1.$compactTag && value.startsWith(Unions_ItemSet_Item_Union1.$compactTag)) {
          if (Unions_ItemSet_Item_Union1.$compact === true) {
            unionValue = Unions_ItemSet_Item_Union1.fromCompact(Unions_ItemSet_Item_Union1.$compactTag && value.startsWith(Unions_ItemSet_Item_Union1.$compactTag) ? value.slice(Unions_ItemSet_Item_Union1.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"itemSet element\" (Unions_ItemSet_Item_Union1).");
          }
        } else if (Unions_ItemSet_Item_Union2.$compactTag && value.startsWith(Unions_ItemSet_Item_Union2.$compactTag)) {
          if (Unions_ItemSet_Item_Union2.$compact === true) {
            unionValue = Unions_ItemSet_Item_Union2.fromCompact(Unions_ItemSet_Item_Union2.$compactTag && value.startsWith(Unions_ItemSet_Item_Union2.$compactTag) ? value.slice(Unions_ItemSet_Item_Union2.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"itemSet element\" (Unions_ItemSet_Item_Union2).");
          }
        }
      }
      return unionValue;
    })(element)));
    if (itemSetSetValueConverted !== undefined && !((itemSetSetValueConverted as object instanceof ImmutableSet || itemSetSetValueConverted as object instanceof Set) && [...(itemSetSetValueConverted as Iterable<unknown>)].every(setValue => Unions_ItemSet_Item_Union1.isInstance(setValue) || Unions_ItemSet_Item_Union2.isInstance(setValue)))) throw new Error("Invalid value for property \"itemSet\".");
    props.itemSet = itemSetSetValueConverted as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>;
    const itemMapValue = entries["itemMap"];
    const itemMapNormalized = itemMapValue === null ? undefined : itemMapValue;
    const itemMapMapValue = itemMapNormalized === undefined || itemMapNormalized === null ? itemMapNormalized : ImmutableMap.isInstance(itemMapNormalized) ? itemMapNormalized : new ImmutableMap(itemMapNormalized as Iterable<[unknown, unknown]>);
    const itemMapMapValueConverted = itemMapMapValue === undefined || itemMapMapValue === null ? itemMapMapValue : new ImmutableMap([...(itemMapMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [k, (value => {
      let unionValue: any = value as any;
      if (isTaggedMessageData(value)) {
        if (value.$tag === "Unions_ItemMap_Value_Union1") {
          if (typeof value.$data === "string") {
            if (Unions_ItemMap_Value_Union1.$compact === true) {
              unionValue = Unions_ItemMap_Value_Union1.fromCompact(Unions_ItemMap_Value_Union1.$compactTag && value.$data.startsWith(Unions_ItemMap_Value_Union1.$compactTag) ? value.$data.slice(Unions_ItemMap_Value_Union1.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"itemMap value\" (Unions_ItemMap_Value_Union1).");
            }
          } else {
            unionValue = new Unions_ItemMap_Value_Union1(Unions_ItemMap_Value_Union1.prototype.$fromEntries(value.$data, options), options);
          }
        } else if (value.$tag === "Unions_ItemMap_Value_Union2") {
          if (typeof value.$data === "string") {
            if (Unions_ItemMap_Value_Union2.$compact === true) {
              unionValue = Unions_ItemMap_Value_Union2.fromCompact(Unions_ItemMap_Value_Union2.$compactTag && value.$data.startsWith(Unions_ItemMap_Value_Union2.$compactTag) ? value.$data.slice(Unions_ItemMap_Value_Union2.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"itemMap value\" (Unions_ItemMap_Value_Union2).");
            }
          } else {
            unionValue = new Unions_ItemMap_Value_Union2(Unions_ItemMap_Value_Union2.prototype.$fromEntries(value.$data, options), options);
          }
        }
      }
      if (typeof value === "string") {
        if (Unions_ItemMap_Value_Union1.$compactTag && value.startsWith(Unions_ItemMap_Value_Union1.$compactTag)) {
          if (Unions_ItemMap_Value_Union1.$compact === true) {
            unionValue = Unions_ItemMap_Value_Union1.fromCompact(Unions_ItemMap_Value_Union1.$compactTag && value.startsWith(Unions_ItemMap_Value_Union1.$compactTag) ? value.slice(Unions_ItemMap_Value_Union1.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"itemMap value\" (Unions_ItemMap_Value_Union1).");
          }
        } else if (Unions_ItemMap_Value_Union2.$compactTag && value.startsWith(Unions_ItemMap_Value_Union2.$compactTag)) {
          if (Unions_ItemMap_Value_Union2.$compact === true) {
            unionValue = Unions_ItemMap_Value_Union2.fromCompact(Unions_ItemMap_Value_Union2.$compactTag && value.startsWith(Unions_ItemMap_Value_Union2.$compactTag) ? value.slice(Unions_ItemMap_Value_Union2.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"itemMap value\" (Unions_ItemMap_Value_Union2).");
          }
        }
      }
      return unionValue;
    })(v)]));
    if (itemMapMapValueConverted !== undefined && !((itemMapMapValueConverted as object instanceof ImmutableMap || itemMapMapValueConverted as object instanceof Map) && [...(itemMapMapValueConverted as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && (Unions_ItemMap_Value_Union1.isInstance(mapValue) || Unions_ItemMap_Value_Union2.isInstance(mapValue))))) throw new Error("Invalid value for property \"itemMap\".");
    props.itemMap = itemMapMapValueConverted as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>;
    return props as Unions.Data;
  }
  static from(value: Unions.Value): Unions {
    return Unions.isInstance(value) ? value : new Unions(value);
  }
  #validate(data: Unions.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: Unions.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try { /* noop */ } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "items":
        return new (this.constructor as typeof Unions)({
          username: this.#username as string | null,
          email: this.#email as Email | null | Email | null,
          metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
          items: child as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
          itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
          itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
        }) as this;
      case "itemSet":
        return new (this.constructor as typeof Unions)({
          username: this.#username as string | null,
          email: this.#email as Email | null | Email | null,
          metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
          items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
          itemSet: child as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
          itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
        }) as this;
      case "itemMap":
        return new (this.constructor as typeof Unions)({
          username: this.#username as string | null,
          email: this.#email as Email | null | Email | null,
          metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
          items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
          itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
          itemMap: child as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["items", this.#items] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["itemSet", this.#itemSet] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["itemMap", this.#itemMap] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Unions>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Unions.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Unions.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get username(): string | null {
    return this.#username;
  }
  get email(): Email | null {
    return this.#email;
  }
  get metadata(): Unions_Metadata_Union1 | Unions_Metadata_Union2 {
    return this.#metadata;
  }
  get items(): ImmutableArray<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)> | undefined {
    return this.#items;
  }
  get itemSet(): ImmutableSet<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | undefined {
    return this.#itemSet;
  }
  get itemMap(): ImmutableMap<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | undefined {
    return this.#itemMap;
  }
  addItemSet(value: Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    itemSetSetNext.add(value);
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  addItemSets(values: Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    for (const toAdd of values) {
      itemSetSetNext.add(toAdd);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  clearItemMap() {
    const itemMapCurrent = this.itemMap;
    if (itemMapCurrent === undefined || itemMapCurrent.size === 0) return this;
    const itemMapMapSource = this.#itemMap;
    const itemMapMapEntries = itemMapMapSource === undefined ? [] : [...itemMapMapSource.entries()];
    const itemMapMapNext = new Map(itemMapMapEntries);
    itemMapMapNext.clear();
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: itemMapMapNext as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  clearItemSet() {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    itemSetSetNext.clear();
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  copyWithinItems(target: number, start: number, end?: number) {
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray];
    itemsNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  deleteItemMapEntry(key: string) {
    const itemMapCurrent = this.itemMap;
    if (!itemMapCurrent?.has(key)) return this;
    const itemMapMapSource = this.#itemMap;
    const itemMapMapEntries = itemMapMapSource === undefined ? [] : [...itemMapMapSource.entries()];
    const itemMapMapNext = new Map(itemMapMapEntries);
    itemMapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: itemMapMapNext as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  deleteItemSet(value: Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    itemSetSetNext.delete(value);
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  deleteItemSets(values: Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    for (const del of values) {
      itemSetSetNext.delete(del);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  fillItem(value: Unions_Items_Item_Union1 | Unions_Items_Item_Union2, start?: number, end?: number) {
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray];
    (itemsNext as unknown as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  filterItemMapEntries(predicate: (value: Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2, key: string) => boolean) {
    const itemMapMapSource = this.#itemMap;
    const itemMapMapEntries = itemMapMapSource === undefined ? [] : [...itemMapMapSource.entries()];
    const itemMapMapNext = new Map(itemMapMapEntries);
    for (const [entryKey, entryValue] of itemMapMapNext) {
      if (!predicate(entryValue, entryKey)) itemMapMapNext.delete(entryKey);
    }
    if (this.itemMap === itemMapMapNext as unknown || this.itemMap?.equals(itemMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: itemMapMapNext as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  filterItemSet(predicate: (value: Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2) => boolean) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    const itemSetFiltered = [];
    for (const value of itemSetSetNext) {
      if (predicate(value)) itemSetFiltered.push(value);
    }
    itemSetSetNext.clear();
    for (const value of itemSetFiltered) {
      itemSetSetNext.add(value);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  mapItemMapEntries(mapper: (value: Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2, key: string) => [string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]) {
    const itemMapMapSource = this.#itemMap;
    const itemMapMapEntries = itemMapMapSource === undefined ? [] : [...itemMapMapSource.entries()];
    const itemMapMapNext = new Map(itemMapMapEntries);
    const itemMapMappedEntries: [string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2][] = [];
    for (const [entryKey, entryValue] of itemMapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      itemMapMappedEntries.push(mappedEntry);
    }
    itemMapMapNext.clear();
    for (const [newKey, newValue] of itemMapMappedEntries) {
      itemMapMapNext.set(newKey, newValue);
    }
    if (this.itemMap === itemMapMapNext as unknown || this.itemMap?.equals(itemMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: itemMapMapNext as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  mapItemSet(mapper: (value: Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2) => Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    const itemSetMapped = [];
    for (const value of itemSetSetNext) {
      const mappedValue = mapper(value);
      itemSetMapped.push(mappedValue);
    }
    itemSetSetNext.clear();
    for (const value of itemSetMapped) {
      itemSetSetNext.add(value);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  mergeItemMapEntries(entries: ImmutableMap<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | ReadonlyMap<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>) {
    const itemMapMapSource = this.#itemMap;
    const itemMapMapEntries = itemMapMapSource === undefined ? [] : [...itemMapMapSource.entries()];
    const itemMapMapNext = new Map(itemMapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      itemMapMapNext.set(mergeKey, mergeValue);
    }
    if (this.itemMap === itemMapMapNext as unknown || this.itemMap?.equals(itemMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: itemMapMapNext as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  popItem() {
    if ((this.items ?? []).length === 0) return this;
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray];
    itemsNext.pop();
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  pushItem(...values: (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[]) {
    if (values.length === 0) return this;
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray, ...values];
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  reverseItems() {
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray];
    itemsNext.reverse();
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  set(updates: Partial<SetUpdates<Unions.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions)(data) as this);
  }
  setEmail(value: Email | null | Email | null) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: value as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  setItemMap(value: Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]> | undefined) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: (value === undefined || value === null ? value : ImmutableMap.isInstance(value) ? value : new ImmutableMap(value)) as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  setItemMapEntry(key: string, value: Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2) {
    const itemMapCurrent = this.itemMap;
    if (itemMapCurrent?.has(key)) {
      const existing = itemMapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const itemMapMapSource = this.#itemMap;
    const itemMapMapEntries = itemMapMapSource === undefined ? [] : [...itemMapMapSource.entries()];
    const itemMapMapNext = new Map(itemMapMapEntries);
    itemMapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: itemMapMapNext as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  setItemSet(value: Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | undefined) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: (value === undefined || value === null ? value : ImmutableSet.isInstance(value) ? value : new ImmutableSet(value)) as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  setItems(value: (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)> | undefined) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: value as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  setMetadata(value: Unions_Metadata_Union1 | Unions_Metadata_Union2) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: value as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  setUsername(value: string | null) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: value as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  shiftItem() {
    if ((this.items ?? []).length === 0) return this;
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray];
    itemsNext.shift();
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  sortItems(compareFn?: (a: Unions_Items_Item_Union1 | Unions_Items_Item_Union2, b: Unions_Items_Item_Union1 | Unions_Items_Item_Union2) => number) {
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray];
    (itemsNext as unknown as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  spliceItem(start: number, deleteCount?: number, ...items: (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[]) {
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...itemsArray];
    itemsNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  unsetItemMap() {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>
    }) as this);
  }
  unsetItemSet() {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  unsetItems() {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  unshiftItem(...values: (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[]) {
    if (values.length === 0) return this;
    const itemsArray = this.#items === undefined ? [] : this.#items;
    const itemsNext = [...values, ...itemsArray];
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: itemsNext as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  updateItemMapEntry(key: string, updater: (currentValue: Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2 | undefined) => Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2) {
    const itemMapMapSource = this.#itemMap;
    const itemMapMapEntries = itemMapMapSource === undefined ? [] : [...itemMapMapSource.entries()];
    const itemMapMapNext = new Map(itemMapMapEntries);
    const currentValue = itemMapMapNext.get(key);
    const updatedValue = updater(currentValue);
    itemMapMapNext.set(key, updatedValue);
    if (this.itemMap === itemMapMapNext as unknown || this.itemMap?.equals(itemMapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: this.#itemSet as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: itemMapMapNext as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
  updateItemSet(updater: (current: Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>) => Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    const updated = updater(itemSetSetNext);
    itemSetSetNext.clear();
    for (const updatedItem of updated) {
      itemSetSetNext.add(updatedItem);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null | Email | null,
      metadata: this.#metadata as Unions_Metadata_Union1 | Unions_Metadata_Union2,
      items: this.#items as (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)>,
      itemSet: itemSetSetNext as Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2>,
      itemMap: this.#itemMap as Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]>
    }) as this);
  }
}
export namespace Unions {
  export type Data = {
    username: string | null;
    email: Email | null | Email | null;
    metadata: Unions_Metadata_Union1 | Unions_Metadata_Union2;
    items?: (Unions_Items_Item_Union1 | Unions_Items_Item_Union2)[] | Iterable<(Unions_Items_Item_Union1 | Unions_Items_Item_Union2)> | undefined;
    itemSet?: Set<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | Iterable<Unions_ItemSet_Item_Union1 | Unions_ItemSet_Item_Union2> | undefined;
    itemMap?: Map<string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2> | Iterable<[string, Unions_ItemMap_Value_Union1 | Unions_ItemMap_Value_Union2]> | undefined;
  };
  export type Value = Unions | Unions.Data;
  export import Metadata_Union1 = Unions_Metadata_Union1;
  export import Metadata_Union2 = Unions_Metadata_Union2;
  export import Items_Item_Union1 = Unions_Items_Item_Union1;
  export import Items_Item_Union2 = Unions_Items_Item_Union2;
  export import ItemSet_Item_Union1 = Unions_ItemSet_Item_Union1;
  export import ItemSet_Item_Union2 = Unions_ItemSet_Item_Union2;
  export import ItemMap_Value_Union1 = Unions_ItemMap_Value_Union1;
  export import ItemMap_Value_Union2 = Unions_ItemMap_Value_Union2;
}
