/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-explicit-any*/
// Generated from tests/generic-types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, parseCerealString, ensure, SKIP } from "../runtime/index.js";

/**
 * Test file for generic message types.
 */

// Basic item type for testing
import type { MessagePropDescriptor, MessageConstructor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Item = Symbol("Item");
export class Item extends Message<Item.Data> {
  static $typeId = "tests/generic-types.pmsg#Item";
  static $typeHash = "sha256:31dd5c614a9f645e29b72cb60fea0551de8d58d05c28f49551fa6d87ffe6f2a2";
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
    return value instanceof Item ? value : new Item(value);
  }
  static deserialize<T extends typeof Item>(this: T, data: string, options?: {
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
  static $typeHash = "sha256:d55eb13e738efa051308ecb07097b81d356a4f465b5cb32e1260f75dd70872d7";
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
      getValue: () => this.#inner
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
      const inner = props.inner instanceof tClass ? props.inner : new tClass(props.inner as any);
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
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
  setInner(value: T) {
    return this.$update(new Container(this.#tClass, {
      inner: value
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
    inner: T;
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
  static $typeHash = "sha256:2e014837a5c3c19745dd57144a35589658f9fc29d7b4e99a1fc5c819b3256d38";
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
      getValue: () => this.#value
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
      const value = props.value === undefined ? undefined : props.value instanceof tClass ? props.value : new tClass(props.value as any);
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
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
  setValue(value: T | undefined) {
    return this.$update(new Optional(this.#tClass, {
      value: value
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
    value?: T | undefined;
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
  static $typeHash = "sha256:18907f158369cbd52913fc2c081ec9cb3b3669bf3ff20fe93594df2cc3f9ba54";
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
      getValue: () => this.#first
    }, {
      name: "second",
      fieldNumber: 2,
      getValue: () => this.#second
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
      const first = props.first instanceof tClass ? props.first : new tClass(props.first as any);
      const second = props.second instanceof uClass ? props.second : new uClass(props.second as any);
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
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
  setFirst(value: T) {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: value,
      second: this.#second
    }) as this as this);
  }
  setSecond(value: U) {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: this.#first,
      second: value
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
    first: T;
    second: U;
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
  static $typeHash = "sha256:8e4f5777d106ce5486748735bd3e81185b11249be9ee5ab004be2d1b7e5469f1";
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
    return value instanceof Parent ? value : new Parent(value);
  }
  static deserialize<T extends typeof Parent>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
  static $typeHash = "sha256:f76ef5efe2c55cc59ff4d4ed332d3870099d7f81ac3c1d7de6ecf117a99e92f4";
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
    this.#timestamp = props ? props.timestamp instanceof ImmutableDate ? props.timestamp : new ImmutableDate(props.timestamp) : new ImmutableDate(0);
    this.#label = (props ? props.label : "") as string;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Timestamped.Data<T>>[] {
    return [{
      name: "inner",
      fieldNumber: 1,
      getValue: () => this.#inner
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
    if (!(timestampValue as object instanceof Date || timestampValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"timestamp\".");
    props.timestamp = timestampValue as Date;
    const labelValue = entries["3"] === undefined ? entries["label"] : entries["3"];
    if (labelValue === undefined) throw new Error("Missing required property \"label\".");
    if (!(typeof labelValue === "string")) throw new Error("Invalid value for property \"label\".");
    props.label = labelValue as string;
    return props as Timestamped.Data<T>;
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
      const inner = props.inner instanceof tClass ? props.inner : new tClass(props.inner as any);
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
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const timestampValue = payload["2"] === undefined ? payload["timestamp"] : payload["2"];
    if (timestampValue === undefined) throw new Error("Missing required property \"timestamp\".");
    if (!(timestampValue as object instanceof Date || timestampValue as object instanceof ImmutableDate)) throw new Error("Invalid value for property \"timestamp\".");
    const timestamp = timestampValue as Date;
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
  setInner(value: T) {
    return this.$update(new Timestamped(this.#tClass, {
      inner: value,
      timestamp: this.#timestamp as ImmutableDate | Date,
      label: this.#label
    }) as this as this);
  }
  setLabel(value: string) {
    return this.$update(new Timestamped(this.#tClass, {
      inner: this.#inner,
      timestamp: this.#timestamp as ImmutableDate | Date,
      label: value
    }) as this as this);
  }
  setTimestamp(value: ImmutableDate | Date) {
    return this.$update(new Timestamped(this.#tClass, {
      inner: this.#inner,
      timestamp: value as ImmutableDate | Date,
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
    inner: T;
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
  static $typeHash = "sha256:d2e3ff201ae097d64aff33ec9007c8f122ea5e5fe00a9aa90d048904591cda6e";
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
      getValue: () => this.#size
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
  static deserialize<T extends typeof Sized>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
  setSize(value: P) {
    return this.$update(new (this.constructor as typeof Sized)({
      size: value
    }) as this);
  }
}
export namespace Sized {
  export type Data<P extends number> = {
    size: P;
  };
  export type Value<P extends number> = Sized<P> | Sized.Data<P>;
}
