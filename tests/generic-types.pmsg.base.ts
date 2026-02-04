/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-explicit-any*/
// Generated from tests/generic-types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ImmutableDate } from "../runtime/index.js";

/**
 * Test file for generic message types.
 */

// Basic item type for testing
import type { MessagePropDescriptor, MessageConstructor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Item = Symbol("Item");
export class Item extends Message<Item.Data> {
  static $typeId = "tests/generic-types.pmsg#Item";
  static $typeHash = "sha256:6d609cc9f87ef00493f1438e7b911e67d72038015b432841bee7ed8132ead8b2";
  static $instanceTag = Symbol.for("propane:message:" + Item.$typeId);
  static readonly $typeName = "Item";
  static EMPTY: Item;
  #id!: number;
  #name!: string;
  constructor(props?: Item.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Item.EMPTY) return Item.EMPTY;
    super(TYPE_TAG_Item, "Item");
    this.#id = (props ? props.id : 0) as number;
    this.#name = (props ? props.name : "") as string;
    if (!props) Item.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Item.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "name",
      fieldNumber: 2,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Item.Data {
    const props = {} as Partial<Item.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as Item.Data;
  }
  static from(value: Item.Value): Item {
    return Item.isInstance(value) ? value : new Item(value);
  }
  static deserialize<T extends typeof Item>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Item.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Item.");
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
  set(updates: Partial<SetUpdates<Item.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Item)(data) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof Item)({
      id: value,
      name: this.#name
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Item)({
      id: this.#id,
      name: value
    }) as this);
  }
}
export namespace Item {
  export type Data = {
    id: number;
    name: string;
  };
  export type Value = Item | Item.Data;
} // Simple generic container with single type parameter
const TYPE_TAG_Container = Symbol("Container");
export class Container<T extends {
  $typeName: string;
  serialize(): string;
  hashCode(): number;
  equals(other: unknown): boolean;
}> extends Message<Container.Data<T>> {
  static $typeId = "tests/generic-types.pmsg#Container";
  static $typeHash = "sha256:2b9c9763b8bc6ab3b6c630839e4add04a9369683e891afcbb0eec7780475afb9";
  static $instanceTag = Symbol.for("propane:message:" + Container.$typeId);
  #inner!: T;
  #tClass!: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Container.Value<T>, options?: {
    skipValidation?: boolean;
  }) {
    super(TYPE_TAG_Container, `Container<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#inner = (props ? props.inner : new this.#tClass(undefined)) as T;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Container.Data<T>>[] {
    return [{
      name: "inner",
      fieldNumber: 1,
      getValue: () => this.#inner as T | T
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Container.Data<T> {
    const props = {} as Partial<Container.Data<T>>;
    const innerValue = entries["1"] === undefined ? entries["inner"] : entries["1"];
    if (innerValue === undefined) throw new Error("Missing required property \"inner\".");
    props.inner = innerValue as T;
    return props as Container.Data<T>;
  }
  static override bind<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>): {
    (props: Container.Value<T>): Container<T>;
    new (props: Container.Value<T>): Container<T>;
    deserialize: (data: string, options?: {
      skipValidation: boolean;
    }) => Container<T>;
    $typeName: string;
    $typeId?: string;
    $typeHash?: string;
    isInstance: (value: unknown) => value is Container<T>;
  } {
    const boundCtor = function (props: Container.Value<T>) {
      const inner = tClass.isInstance(props.inner) ? props.inner : new tClass(props.inner as any);
      return new Container(tClass, {
        ...props,
        inner
      } as Container.Value<T>);
    };
    boundCtor.deserialize = (data: string, options?: {
      skipValidation: boolean;
    }) => {
      return Container.deserialize(tClass, data, options);
    };
    boundCtor.$typeName = `Container<${tClass.$typeName}>`;
    boundCtor.$typeId = Container.$typeId;
    boundCtor.$typeHash = Container.$typeHash;
    boundCtor.$compact = Container.$compact;
    boundCtor.$compactTag = Container.$compactTag;
    boundCtor.isInstance = (value: unknown) => Container.isInstance(value);
    return boundCtor as unknown as {
      (props: Container.Value<T>): Container<T>;
      new (props: Container.Value<T>): Container<T>;
      deserialize: (data: string, options?: {
        skipValidation: boolean;
      }) => Container<T>;
      $typeName: string;
      $typeId?: string;
      $typeHash?: string;
      isInstance: (value: unknown) => value is Container<T>;
    };
  }
  static deserialize<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>, data: string, options?: {
    skipValidation: boolean;
  }): Container<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (Container.$compact === true) {
        return Container.fromCompact(Container.$compactTag && parsed.startsWith(Container.$compactTag) ? parsed.slice(Container.$compactTag.length) : parsed, options) as any;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === "Container") {
        if (typeof parsed.$data === "string") {
          if (Container.$compact === true) {
            return Container.fromCompact(Container.$compactTag && parsed.$data.startsWith(Container.$compactTag) ? parsed.$data.slice(Container.$compactTag.length) : parsed.$data, options) as any;
          } else {
            throw new Error("Invalid compact tagged value for Container.");
          }
        } else {
          return new Container(tClass, Container.prototype.$fromEntries(parsed.$data, options), options);
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Container.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const inner = new tClass((payload["1"] ?? payload["inner"]) as any, options);
    return new Container(tClass, {
      inner
    }, options);
  }
  get inner(): T {
    return this.#inner;
  }
  set(updates: Partial<SetUpdates<Container.Data<T>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new Container(this.#tClass, data) as this as this);
  }
  setInner(value: T | T) {
    return this.$update(new Container(this.#tClass, {
      inner: value as T | T
    }) as this as this);
  }
}
export namespace Container {
  export type Data<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = {
    inner: T | T;
  };
  export type Value<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = Container<T> | Container.Data<T>;
} // Generic with optional field
const TYPE_TAG_Optional = Symbol("Optional");
export class Optional<T extends {
  $typeName: string;
  serialize(): string;
  hashCode(): number;
  equals(other: unknown): boolean;
}> extends Message<Optional.Data<T>> {
  static $typeId = "tests/generic-types.pmsg#Optional";
  static $typeHash = "sha256:073d113cc49e44e6741df889768b43ba872bbdc2de33ed4fd5ba7c171fcfe6ea";
  static $instanceTag = Symbol.for("propane:message:" + Optional.$typeId);
  #value!: T | undefined;
  #tClass!: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Optional.Value<T>, options?: {
    skipValidation?: boolean;
  }) {
    super(TYPE_TAG_Optional, `Optional<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#value = (props ? props.value : new this.#tClass(undefined)) as T;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Optional.Data<T>>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as T | T
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Optional.Data<T> {
    const props = {} as Partial<Optional.Data<T>>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    const valueNormalized = valueValue === null ? undefined : valueValue;
    props.value = valueNormalized as T;
    return props as Optional.Data<T>;
  }
  static override bind<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>): {
    (props: Optional.Value<T>): Optional<T>;
    new (props: Optional.Value<T>): Optional<T>;
    deserialize: (data: string, options?: {
      skipValidation: boolean;
    }) => Optional<T>;
    $typeName: string;
    $typeId?: string;
    $typeHash?: string;
    isInstance: (value: unknown) => value is Optional<T>;
  } {
    const boundCtor = function (props: Optional.Value<T>) {
      const value = props.value === undefined ? undefined : tClass.isInstance(props.value) ? props.value : new tClass(props.value as any);
      return new Optional(tClass, {
        ...props,
        value
      } as Optional.Value<T>);
    };
    boundCtor.deserialize = (data: string, options?: {
      skipValidation: boolean;
    }) => {
      return Optional.deserialize(tClass, data, options);
    };
    boundCtor.$typeName = `Optional<${tClass.$typeName}>`;
    boundCtor.$typeId = Optional.$typeId;
    boundCtor.$typeHash = Optional.$typeHash;
    boundCtor.$compact = Optional.$compact;
    boundCtor.$compactTag = Optional.$compactTag;
    boundCtor.isInstance = (value: unknown) => Optional.isInstance(value);
    return boundCtor as unknown as {
      (props: Optional.Value<T>): Optional<T>;
      new (props: Optional.Value<T>): Optional<T>;
      deserialize: (data: string, options?: {
        skipValidation: boolean;
      }) => Optional<T>;
      $typeName: string;
      $typeId?: string;
      $typeHash?: string;
      isInstance: (value: unknown) => value is Optional<T>;
    };
  }
  static deserialize<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>, data: string, options?: {
    skipValidation: boolean;
  }): Optional<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (Optional.$compact === true) {
        return Optional.fromCompact(Optional.$compactTag && parsed.startsWith(Optional.$compactTag) ? parsed.slice(Optional.$compactTag.length) : parsed, options) as any;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === "Optional") {
        if (typeof parsed.$data === "string") {
          if (Optional.$compact === true) {
            return Optional.fromCompact(Optional.$compactTag && parsed.$data.startsWith(Optional.$compactTag) ? parsed.$data.slice(Optional.$compactTag.length) : parsed.$data, options) as any;
          } else {
            throw new Error("Invalid compact tagged value for Optional.");
          }
        } else {
          return new Optional(tClass, Optional.prototype.$fromEntries(parsed.$data, options), options);
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Optional.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const valueRaw = payload["1"] ?? payload["value"];
    const value = valueRaw !== undefined ? new tClass(valueRaw as any, options) : undefined;
    return new Optional(tClass, {
      value
    }, options);
  }
  get value(): T | undefined {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<Optional.Data<T>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new Optional(this.#tClass, data) as this as this);
  }
  setValue(value: T | T | undefined) {
    return this.$update(new Optional(this.#tClass, {
      value: value as T | T
    }) as this as this);
  }
  unsetValue() {
    return this.$update(new Optional(this.#tClass, {}) as this as this);
  }
}
export namespace Optional {
  export type Data<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = {
    value?: T | T | undefined;
  };
  export type Value<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = Optional<T> | Optional.Data<T>;
} // Multiple type parameters
const TYPE_TAG_Pair = Symbol("Pair");
export class Pair<T extends {
  $typeName: string;
  serialize(): string;
  hashCode(): number;
  equals(other: unknown): boolean;
}, U extends {
  $typeName: string;
  serialize(): string;
  hashCode(): number;
  equals(other: unknown): boolean;
}> extends Message<Pair.Data<T, U>> {
  static $typeId = "tests/generic-types.pmsg#Pair";
  static $typeHash = "sha256:03e37bdb30b8ccf3dcfeb01c3735e7312e09f40845fbb10c811e184553fb4daa";
  static $instanceTag = Symbol.for("propane:message:" + Pair.$typeId);
  #first!: T;
  #second!: U;
  #tClass!: MessageConstructor<T>;
  #uClass!: MessageConstructor<U>;
  constructor(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>, props?: Pair.Value<T, U>, options?: {
    skipValidation?: boolean;
  }) {
    super(TYPE_TAG_Pair, `Pair<${tClass.$typeName},${uClass.$typeName}>`);
    this.#tClass = tClass;
    this.#uClass = uClass;
    this.#first = (props ? props.first : new this.#tClass(undefined)) as T;
    this.#second = (props ? props.second : new this.#uClass(undefined)) as U;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Pair.Data<T, U>>[] {
    return [{
      name: "first",
      fieldNumber: 1,
      getValue: () => this.#first as T | T
    }, {
      name: "second",
      fieldNumber: 2,
      getValue: () => this.#second as U | U
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Pair.Data<T, U> {
    const props = {} as Partial<Pair.Data<T, U>>;
    const firstValue = entries["1"] === undefined ? entries["first"] : entries["1"];
    if (firstValue === undefined) throw new Error("Missing required property \"first\".");
    props.first = firstValue as T;
    const secondValue = entries["2"] === undefined ? entries["second"] : entries["2"];
    if (secondValue === undefined) throw new Error("Missing required property \"second\".");
    props.second = secondValue as U;
    return props as Pair.Data<T, U>;
  }
  static override bind<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }, U extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>): {
    (props: Pair.Value<T, U>): Pair<T, U>;
    new (props: Pair.Value<T, U>): Pair<T, U>;
    deserialize: (data: string, options?: {
      skipValidation: boolean;
    }) => Pair<T, U>;
    $typeName: string;
    $typeId?: string;
    $typeHash?: string;
    isInstance: (value: unknown) => value is Pair<T, U>;
  } {
    const boundCtor = function (props: Pair.Value<T, U>) {
      const first = tClass.isInstance(props.first) ? props.first : new tClass(props.first as any);
      const second = uClass.isInstance(props.second) ? props.second : new uClass(props.second as any);
      return new Pair(tClass, uClass, {
        ...props,
        first,
        second
      } as Pair.Value<T, U>);
    };
    boundCtor.deserialize = (data: string, options?: {
      skipValidation: boolean;
    }) => {
      return Pair.deserialize(tClass, uClass, data, options);
    };
    boundCtor.$typeName = `Pair<${tClass.$typeName},${uClass.$typeName}>`;
    boundCtor.$typeId = Pair.$typeId;
    boundCtor.$typeHash = Pair.$typeHash;
    boundCtor.$compact = Pair.$compact;
    boundCtor.$compactTag = Pair.$compactTag;
    boundCtor.isInstance = (value: unknown) => Pair.isInstance(value);
    return boundCtor as unknown as {
      (props: Pair.Value<T, U>): Pair<T, U>;
      new (props: Pair.Value<T, U>): Pair<T, U>;
      deserialize: (data: string, options?: {
        skipValidation: boolean;
      }) => Pair<T, U>;
      $typeName: string;
      $typeId?: string;
      $typeHash?: string;
      isInstance: (value: unknown) => value is Pair<T, U>;
    };
  }
  static deserialize<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }, U extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>, data: string, options?: {
    skipValidation: boolean;
  }): Pair<T, U> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (Pair.$compact === true) {
        return Pair.fromCompact(Pair.$compactTag && parsed.startsWith(Pair.$compactTag) ? parsed.slice(Pair.$compactTag.length) : parsed, options) as any;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === "Pair") {
        if (typeof parsed.$data === "string") {
          if (Pair.$compact === true) {
            return Pair.fromCompact(Pair.$compactTag && parsed.$data.startsWith(Pair.$compactTag) ? parsed.$data.slice(Pair.$compactTag.length) : parsed.$data, options) as any;
          } else {
            throw new Error("Invalid compact tagged value for Pair.");
          }
        } else {
          return new Pair(tClass, uClass, Pair.prototype.$fromEntries(parsed.$data, options), options);
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Pair.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const first = new tClass((payload["1"] ?? payload["first"]) as any, options);
    const second = new uClass((payload["2"] ?? payload["second"]) as any, options);
    return new Pair(tClass, uClass, {
      first,
      second
    }, options);
  }
  get first(): T {
    return this.#first;
  }
  get second(): U {
    return this.#second;
  }
  set(updates: Partial<SetUpdates<Pair.Data<T, U>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new Pair(this.#tClass, this.#uClass, data) as this as this);
  }
  setFirst(value: T | T) {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: value as T | T,
      second: this.#second as U | U
    }) as this as this);
  }
  setSecond(value: U | U) {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: this.#first as T | T,
      second: value as U | U
    }) as this as this);
  }
}
export namespace Pair {
  export type Data<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }, U extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = {
    first: T | T;
    second: U | U;
  };
  export type Value<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }, U extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = Pair<T, U> | Pair.Data<T, U>;
} // Non-generic type that can contain generic instances
const TYPE_TAG_Parent = Symbol("Parent");
export class Parent extends Message<Parent.Data> {
  static $typeId = "tests/generic-types.pmsg#Parent";
  static $typeHash = "sha256:fbadf683d6b7d4b4a8ca1ea499825be12793ae5c0dab2286f9c45c8e52435de7";
  static $instanceTag = Symbol.for("propane:message:" + Parent.$typeId);
  static readonly $typeName = "Parent";
  static EMPTY: Parent;
  #name!: string;
  constructor(props?: Parent.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Parent.EMPTY) return Parent.EMPTY;
    super(TYPE_TAG_Parent, "Parent");
    this.#name = (props ? props.name : "") as string;
    if (!props) Parent.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Parent.Data>[] {
    return [{
      name: "name",
      fieldNumber: 1,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Parent.Data {
    const props = {} as Partial<Parent.Data>;
    const nameValue = entries["1"] === undefined ? entries["name"] : entries["1"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as Parent.Data;
  }
  static from(value: Parent.Value): Parent {
    return Parent.isInstance(value) ? value : new Parent(value);
  }
  static deserialize<T extends typeof Parent>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Parent.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Parent.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get name(): string {
    return this.#name;
  }
  set(updates: Partial<SetUpdates<Parent.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Parent)(data) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Parent)({
      name: value
    }) as this);
  }
}
export namespace Parent {
  export type Data = {
    name: string;
  };
  export type Value = Parent | Parent.Data;
} // Generic with both generic and non-generic fields - tests full validation in deserialize
const TYPE_TAG_Timestamped = Symbol("Timestamped");
export class Timestamped<T extends {
  $typeName: string;
  serialize(): string;
  hashCode(): number;
  equals(other: unknown): boolean;
}> extends Message<Timestamped.Data<T>> {
  static $typeId = "tests/generic-types.pmsg#Timestamped";
  static $typeHash = "sha256:80e90fd2d6cd64329403fb2da22f9c9a36c2d10f7826e8afcb80fb8f6edc943d";
  static $instanceTag = Symbol.for("propane:message:" + Timestamped.$typeId);
  #inner!: T;
  #timestamp!: ImmutableDate;
  #label!: string;
  #tClass!: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Timestamped.Value<T>, options?: {
    skipValidation?: boolean;
  }) {
    super(TYPE_TAG_Timestamped, `Timestamped<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#inner = (props ? props.inner : new this.#tClass(undefined)) as T;
    this.#timestamp = props ? ImmutableDate.isInstance(props.timestamp) ? props.timestamp : new ImmutableDate(props.timestamp, options) : new ImmutableDate();
    this.#label = (props ? props.label : "") as string;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Timestamped.Data<T>>[] {
    return [{
      name: "inner",
      fieldNumber: 1,
      getValue: () => this.#inner as T | T
    }, {
      name: "timestamp",
      fieldNumber: 2,
      getValue: () => this.#timestamp as ImmutableDate | Date
    }, {
      name: "label",
      fieldNumber: 3,
      getValue: () => this.#label
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Timestamped.Data<T> {
    const props = {} as Partial<Timestamped.Data<T>>;
    const innerValue = entries["1"] === undefined ? entries["inner"] : entries["1"];
    if (innerValue === undefined) throw new Error("Missing required property \"inner\".");
    props.inner = innerValue as T;
    const timestampValue = entries["2"] === undefined ? entries["timestamp"] : entries["2"];
    if (timestampValue === undefined) throw new Error("Missing required property \"timestamp\".");
    const timestampMessageValue = (value => {
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
          if (ImmutableDate.isInstance(value)) {
            result = value;
          } else {
            result = new ImmutableDate(value as ImmutableDate.Value, options);
          }
        }
      }
      return result;
    })(timestampValue);
    props.timestamp = timestampMessageValue as ImmutableDate | Date;
    const labelValue = entries["3"] === undefined ? entries["label"] : entries["3"];
    if (labelValue === undefined) throw new Error("Missing required property \"label\".");
    if (!(typeof labelValue === "string")) throw new Error("Invalid value for property \"label\".");
    props.label = labelValue as string;
    return props as Timestamped.Data<T>;
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "timestamp":
        return new Timestamped(this.#tClass, {
          inner: this.#inner as T | T,
          timestamp: child as ImmutableDate | Date,
          label: this.#label
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["timestamp", this.#timestamp] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static override bind<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>): {
    (props: Timestamped.Value<T>): Timestamped<T>;
    new (props: Timestamped.Value<T>): Timestamped<T>;
    deserialize: (data: string, options?: {
      skipValidation: boolean;
    }) => Timestamped<T>;
    $typeName: string;
    $typeId?: string;
    $typeHash?: string;
    isInstance: (value: unknown) => value is Timestamped<T>;
  } {
    const boundCtor = function (props: Timestamped.Value<T>) {
      const inner = tClass.isInstance(props.inner) ? props.inner : new tClass(props.inner as any);
      return new Timestamped(tClass, {
        ...props,
        inner
      } as Timestamped.Value<T>);
    };
    boundCtor.deserialize = (data: string, options?: {
      skipValidation: boolean;
    }) => {
      return Timestamped.deserialize(tClass, data, options);
    };
    boundCtor.$typeName = `Timestamped<${tClass.$typeName}>`;
    boundCtor.$typeId = Timestamped.$typeId;
    boundCtor.$typeHash = Timestamped.$typeHash;
    boundCtor.$compact = Timestamped.$compact;
    boundCtor.$compactTag = Timestamped.$compactTag;
    boundCtor.isInstance = (value: unknown) => Timestamped.isInstance(value);
    return boundCtor as unknown as {
      (props: Timestamped.Value<T>): Timestamped<T>;
      new (props: Timestamped.Value<T>): Timestamped<T>;
      deserialize: (data: string, options?: {
        skipValidation: boolean;
      }) => Timestamped<T>;
      $typeName: string;
      $typeId?: string;
      $typeHash?: string;
      isInstance: (value: unknown) => value is Timestamped<T>;
    };
  }
  static deserialize<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }>(tClass: MessageConstructor<T>, data: string, options?: {
    skipValidation: boolean;
  }): Timestamped<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (Timestamped.$compact === true) {
        return Timestamped.fromCompact(Timestamped.$compactTag && parsed.startsWith(Timestamped.$compactTag) ? parsed.slice(Timestamped.$compactTag.length) : parsed, options) as any;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === "Timestamped") {
        if (typeof parsed.$data === "string") {
          if (Timestamped.$compact === true) {
            return Timestamped.fromCompact(Timestamped.$compactTag && parsed.$data.startsWith(Timestamped.$compactTag) ? parsed.$data.slice(Timestamped.$compactTag.length) : parsed.$data, options) as any;
          } else {
            throw new Error("Invalid compact tagged value for Timestamped.");
          }
        } else {
          return new Timestamped(tClass, Timestamped.prototype.$fromEntries(parsed.$data, options), options);
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Timestamped.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const timestampValue = payload["2"] === undefined ? payload["timestamp"] : payload["2"];
    if (timestampValue === undefined) throw new Error("Missing required property \"timestamp\".");
    const timestampMessageValue = (value => {
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
          if (ImmutableDate.isInstance(value)) {
            result = value;
          } else {
            result = new ImmutableDate(value as ImmutableDate.Value, options);
          }
        }
      }
      return result;
    })(timestampValue);
    const timestamp = timestampMessageValue as ImmutableDate | Date;
    const labelValue = payload["3"] === undefined ? payload["label"] : payload["3"];
    if (labelValue === undefined) throw new Error("Missing required property \"label\".");
    if (!(typeof labelValue === "string")) throw new Error("Invalid value for property \"label\".");
    const label = labelValue as string;
    const inner = new tClass((payload["1"] ?? payload["inner"]) as any, options);
    return new Timestamped(tClass, {
      timestamp,
      label,
      inner
    }, options);
  }
  get inner(): T {
    return this.#inner;
  }
  get timestamp(): ImmutableDate {
    return this.#timestamp;
  }
  get label(): string {
    return this.#label;
  }
  set(updates: Partial<SetUpdates<Timestamped.Data<T>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new Timestamped(this.#tClass, data) as this as this);
  }
  setInner(value: T | T) {
    return this.$update(new Timestamped(this.#tClass, {
      inner: value as T | T,
      timestamp: this.#timestamp as ImmutableDate | Date,
      label: this.#label
    }) as this as this);
  }
  setLabel(value: string) {
    return this.$update(new Timestamped(this.#tClass, {
      inner: this.#inner as T | T,
      timestamp: this.#timestamp as ImmutableDate | Date,
      label: value
    }) as this as this);
  }
  setTimestamp(value: ImmutableDate | Date) {
    return this.$update(new Timestamped(this.#tClass, {
      inner: this.#inner as T | T,
      timestamp: (ImmutableDate.isInstance(value) ? value : new ImmutableDate(value)) as ImmutableDate | Date,
      label: this.#label
    }) as this as this);
  }
}
export namespace Timestamped {
  export type Data<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = {
    inner: T | T;
    timestamp: ImmutableDate | Date;
    label: string;
  };
  export type Value<T extends {
    $typeName: string;
    serialize(): string;
    hashCode(): number;
    equals(other: unknown): boolean;
  }> = Timestamped<T> | Timestamped.Data<T>;
} // Generic with non-message constraint
const TYPE_TAG_Sized = Symbol("Sized");
export class Sized<P extends number> extends Message<Sized.Data<P>> {
  static $typeId = "tests/generic-types.pmsg#Sized";
  static $typeHash = "sha256:ee8369a33fc3787dceca06c8a0deaa1e4f5581d0dac82d1dd6d4eaf1884349eb";
  static $instanceTag = Symbol.for("propane:message:" + Sized.$typeId);
  static readonly $typeName = "Sized";
  static EMPTY: Sized<any>;
  #size!: P;
  constructor(props?: Sized.Value<P>, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Sized.EMPTY) return Sized.EMPTY;
    super(TYPE_TAG_Sized, "Sized");
    this.#size = (props ? props.size : undefined) as P;
    if (!props) Sized.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Sized.Data<P>>[] {
    return [{
      name: "size",
      fieldNumber: 1,
      getValue: () => this.#size as P | P
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Sized.Data<P> {
    const props = {} as Partial<Sized.Data<P>>;
    const sizeValue = entries["1"] === undefined ? entries["size"] : entries["1"];
    if (sizeValue === undefined) throw new Error("Missing required property \"size\".");
    props.size = sizeValue as P;
    return props as Sized.Data<P>;
  }
  static deserialize<T extends typeof Sized>(this: T, P: number, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(P, this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(P, this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for Sized.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Sized.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get size(): P {
    return this.#size;
  }
  set(updates: Partial<SetUpdates<Sized.Data<P>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Sized)(data) as this);
  }
  setSize(value: P | P) {
    return this.$update(new (this.constructor as typeof Sized)({
      size: value as P | P
    }) as this);
  }
}
export namespace Sized {
  export type Data<P extends number> = {
    size: P | P;
  };
  export type Value<P extends number> = Sized<P> | Sized.Data<P>;
}
