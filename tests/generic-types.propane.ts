/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-explicit-any*/
// Generated from tests/generic-types.propane
import type { MessagePropDescriptor, MessageConstructor, DataObject } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString } from "../runtime/index.js";
/**
 * Test file for generic message types.
 */
// Basic item type for testing
export class Item extends Message<Item.Data> {
  static TYPE_TAG = Symbol("Item");
  static readonly $typeName = "Item";
  static EMPTY: Item;
  #id: number;
  #name: string;
  constructor(props?: Item.Value) {
    if (!props && Item.EMPTY) return Item.EMPTY;
    super(Item.TYPE_TAG, "Item");
    this.#id = props ? props.id : 0;
    this.#name = props ? props.name : "";
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
  protected $fromEntries(entries: Record<string, unknown>): Item.Data {
    const props = {} as Partial<Item.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as Item.Data;
  }
  get id(): number {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  setId(value: number): Item {
    return this.$update(new Item({
      id: value,
      name: this.#name
    }));
  }
  setName(value: string): Item {
    return this.$update(new Item({
      id: this.#id,
      name: value
    }));
  }
}
export namespace Item {
  export type Data = {
    id: number;
    name: string;
  };
  export type Value = Item | Item.Data;
} // Simple generic container with single type parameter
export class Container<T extends Message<any>> extends Message<Container.Data<T>> {
  static TYPE_TAG = Symbol("Container");
  #inner: T;
  #tClass: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Container.Value<T>) {
    super(Container.TYPE_TAG, `Container<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#inner = props ? props.inner : new this.#tClass(undefined);
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Container.Data<T>>[] {
    return [{
      name: "inner",
      fieldNumber: 1,
      getValue: () => this.#inner
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Container.Data<T> {
    const props = {} as Partial<Container.Data<T>>;
    const innerValue = entries["1"] === undefined ? entries["inner"] : entries["1"];
    if (innerValue === undefined) throw new Error("Missing required property \"inner\".");
    props.inner = innerValue as T;
    return props as Container.Data<T>;
  }
  static override bind<T extends Message<any>>(tClass: MessageConstructor<T>): MessageConstructor<Container<T>> {
    const boundCtor = function (props: Container.Data<T>) {
      return new Container(tClass, props);
    } as unknown as MessageConstructor<Container<T>>;
    boundCtor.deserialize = (data: string) => {
      const payload = parseCerealString(data);
      const proto = Container.prototype;
      const props = proto.$fromEntries(payload as Record<string, unknown>);
      return new Container(tClass, props as Container.Data<T>);
    };
    (boundCtor as {
      $typeName: string;
    }).$typeName = `Container<${tClass.$typeName}>`;
    return boundCtor;
  }
  get inner(): T {
    return this.#inner;
  }
  setInner(value: T): Container<T> {
    return this.$update(new Container(this.#tClass, {
      inner: value
    }) as this);
  }
}
export namespace Container {
  export type Data<T extends Message<any>> = {
    inner: T;
  };
  export type Value<T extends Message<any>> = Container<T> | Container.Data<T>;
} // Generic with optional field
export class Optional<T extends Message<any>> extends Message<Optional.Data<T>> {
  static TYPE_TAG = Symbol("Optional");
  #value: T;
  #tClass: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Optional.Value<T>) {
    super(Optional.TYPE_TAG, `Optional<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#value = props ? props.value : new this.#tClass(undefined);
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Optional.Data<T>>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Optional.Data<T> {
    const props = {} as Partial<Optional.Data<T>>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    const valueNormalized = valueValue === null ? undefined : valueValue;
    props.value = valueNormalized as T;
    return props as Optional.Data<T>;
  }
  static override bind<T extends Message<any>>(tClass: MessageConstructor<T>): MessageConstructor<Optional<T>> {
    const boundCtor = function (props: Optional.Data<T>) {
      return new Optional(tClass, props);
    } as unknown as MessageConstructor<Optional<T>>;
    boundCtor.deserialize = (data: string) => {
      const payload = parseCerealString(data);
      const proto = Optional.prototype;
      const props = proto.$fromEntries(payload as Record<string, unknown>);
      return new Optional(tClass, props as Optional.Data<T>);
    };
    (boundCtor as {
      $typeName: string;
    }).$typeName = `Optional<${tClass.$typeName}>`;
    return boundCtor;
  }
  get value(): T {
    return this.#value;
  }
  deleteValue(): Optional<T> {
    return this.$update(new Optional(this.#tClass, {}) as this);
  }
  setValue(value: T): Optional<T> {
    return this.$update(new Optional(this.#tClass, {
      value: value
    }) as this);
  }
}
export namespace Optional {
  export type Data<T extends Message<any>> = {
    value?: T | undefined;
  };
  export type Value<T extends Message<any>> = Optional<T> | Optional.Data<T>;
} // Multiple type parameters
export class Pair<T extends Message<any>, U extends Message<any>> extends Message<Pair.Data<T, U>> {
  static TYPE_TAG = Symbol("Pair");
  #first: T;
  #second: U;
  #tClass: MessageConstructor<T>;
  #uClass: MessageConstructor<U>;
  constructor(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>, props?: Pair.Value<T, U>) {
    super(Pair.TYPE_TAG, `Pair<${tClass.$typeName},${uClass.$typeName}>`);
    this.#tClass = tClass;
    this.#uClass = uClass;
    this.#first = props ? props.first : new this.#tClass(undefined);
    this.#second = props ? props.second : new this.#uClass(undefined);
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
  protected $fromEntries(entries: Record<string, unknown>): Pair.Data<T, U> {
    const props = {} as Partial<Pair.Data<T, U>>;
    const firstValue = entries["1"] === undefined ? entries["first"] : entries["1"];
    if (firstValue === undefined) throw new Error("Missing required property \"first\".");
    props.first = firstValue as T;
    const secondValue = entries["2"] === undefined ? entries["second"] : entries["2"];
    if (secondValue === undefined) throw new Error("Missing required property \"second\".");
    props.second = secondValue as U;
    return props as Pair.Data<T, U>;
  }
  static override bind<T extends Message<any>, U extends Message<any>>(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>): MessageConstructor<Pair<T, U>> {
    const boundCtor = function (props: Pair.Data<T, U>) {
      return new Pair(tClass, uClass, props);
    } as unknown as MessageConstructor<Pair<T, U>>;
    boundCtor.deserialize = (data: string) => {
      const payload = parseCerealString(data);
      const proto = Pair.prototype;
      const props = proto.$fromEntries(payload as Record<string, unknown>);
      return new Pair(tClass, uClass, props as Pair.Data<T, U>);
    };
    (boundCtor as {
      $typeName: string;
    }).$typeName = `Pair<${tClass.$typeName},${uClass.$typeName}>`;
    return boundCtor;
  }
  get first(): T {
    return this.#first;
  }
  get second(): U {
    return this.#second;
  }
  setFirst(value: T): Pair<T, U> {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: value,
      second: this.#second
    }) as this);
  }
  setSecond(value: U): Pair<T, U> {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: this.#first,
      second: value
    }) as this);
  }
}
export namespace Pair {
  export type Data<T extends Message<any>, U extends Message<any>> = {
    first: T;
    second: U;
  };
  export type Value<T extends Message<any>, U extends Message<any>> = Pair<T, U> | Pair.Data<T, U>;
} // Non-generic type that can contain generic instances
export class Parent extends Message<Parent.Data> {
  static TYPE_TAG = Symbol("Parent");
  static readonly $typeName = "Parent";
  static EMPTY: Parent;
  #name: string;
  constructor(props?: Parent.Value) {
    if (!props && Parent.EMPTY) return Parent.EMPTY;
    super(Parent.TYPE_TAG, "Parent");
    this.#name = props ? props.name : "";
    if (!props) Parent.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Parent.Data>[] {
    return [{
      name: "name",
      fieldNumber: 1,
      getValue: () => this.#name
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Parent.Data {
    const props = {} as Partial<Parent.Data>;
    const nameValue = entries["1"] === undefined ? entries["name"] : entries["1"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as Parent.Data;
  }
  get name(): string {
    return this.#name;
  }
  setName(value: string): Parent {
    return this.$update(new Parent({
      name: value
    }));
  }
}
export namespace Parent {
  export type Data = {
    name: string;
  };
  export type Value = Parent | Parent.Data;
}
