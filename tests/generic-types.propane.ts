/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/generic-types.propane
import type { MessageConstructor } from "@propanejs/runtime";
import { Message, MessagePropDescriptor, WITH_CHILD, GET_MESSAGE_CHILDREN } from "@propanejs/runtime";
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
  export interface Data {
    id: number;
    name: string;
  }
  export type Value = Item | Item.Data;
} // Simple generic container with single type parameter
export class Container<T extends Message<any>> extends Message<Container.Data<T>> {
  static TYPE_TAG = Symbol("Container");
  #inner: T;
  #tClass: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Container.Value) {
    super(Container.TYPE_TAG, `Container<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#inner = props ? props.inner : new this.#tClass();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Container.Data>[] {
    return [{
      name: "inner",
      fieldNumber: 1,
      getValue: () => this.#inner
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Container.Data {
    const props = {} as Partial<Container.Data>;
    const innerValue = entries["1"] === undefined ? entries["inner"] : entries["1"];
    if (innerValue === undefined) throw new Error("Missing required property \"inner\".");
    props.inner = innerValue;
    return props as Container.Data;
  }
  static bind<T extends Message<any>>(tClass: MessageConstructor<T>): MessageConstructor<Container<T>> {
    const boundCtor = function (props: Container.Data<T>) {
      return new Container(tClass, props);
    } as unknown as MessageConstructor<Container<T>>;
    boundCtor.deserialize = (data: string) => Container.deserialize(tClass, data);
    boundCtor.$typeName = `Container<${tClass.$typeName}>`;
    return boundCtor;
  }
  get inner(): T {
    return this.#inner;
  }
  setInner(value: T): Container {
    return this.$update(new Container(this.#tClass, {
      inner: value
    }));
  }
}
export namespace Container {
  export interface Data<T extends Message> {
    inner: T;
  }
  export type Value = Container | Container.Data;
} // Generic with optional field
export class Optional<T extends Message<any>> extends Message<Optional.Data<T>> {
  static TYPE_TAG = Symbol("Optional");
  #value: T;
  #tClass: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Optional.Value) {
    super(Optional.TYPE_TAG, `Optional<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#value = props ? props.value : new this.#tClass();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Optional.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Optional.Data {
    const props = {} as Partial<Optional.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    const valueNormalized = valueValue === null ? undefined : valueValue;
    props.value = valueNormalized;
    return props as Optional.Data;
  }
  static bind<T extends Message<any>>(tClass: MessageConstructor<T>): MessageConstructor<Optional<T>> {
    const boundCtor = function (props: Optional.Data<T>) {
      return new Optional(tClass, props);
    } as unknown as MessageConstructor<Optional<T>>;
    boundCtor.deserialize = (data: string) => Optional.deserialize(tClass, data);
    boundCtor.$typeName = `Optional<${tClass.$typeName}>`;
    return boundCtor;
  }
  get value(): T {
    return this.#value;
  }
  deleteValue(): Optional {
    return this.$update(new Optional(this.#tClass, {}));
  }
  setValue(value: T): Optional {
    return this.$update(new Optional(this.#tClass, {
      value: value
    }));
  }
}
export namespace Optional {
  export interface Data<T extends Message> {
    value?: T | undefined;
  }
  export type Value = Optional | Optional.Data;
} // Multiple type parameters
export class Pair<T extends Message<any>, U extends Message<any>> extends Message<Pair.Data<T, U>> {
  static TYPE_TAG = Symbol("Pair");
  #first: T;
  #second: U;
  #tClass: MessageConstructor<T>;
  #uClass: MessageConstructor<U>;
  constructor(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>, props?: Pair.Value) {
    super(Pair.TYPE_TAG, `Pair<${tClass.$typeName},${uClass.$typeName}>`);
    this.#tClass = tClass;
    this.#uClass = uClass;
    this.#first = props ? props.first : new this.#tClass();
    this.#second = props ? props.second : new this.#uClass();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Pair.Data>[] {
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
  protected $fromEntries(entries: Record<string, unknown>): Pair.Data {
    const props = {} as Partial<Pair.Data>;
    const firstValue = entries["1"] === undefined ? entries["first"] : entries["1"];
    if (firstValue === undefined) throw new Error("Missing required property \"first\".");
    props.first = firstValue;
    const secondValue = entries["2"] === undefined ? entries["second"] : entries["2"];
    if (secondValue === undefined) throw new Error("Missing required property \"second\".");
    props.second = secondValue;
    return props as Pair.Data;
  }
  static bind<T extends Message<any>, U extends Message<any>>(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>): MessageConstructor<Pair<T, U>> {
    const boundCtor = function (props: Pair.Data<T, U>) {
      return new Pair(tClass, uClass, props);
    } as unknown as MessageConstructor<Pair<T, U>>;
    boundCtor.deserialize = (data: string) => Pair.deserialize(tClass, uClass, data);
    boundCtor.$typeName = `Pair<${tClass.$typeName},${uClass.$typeName}>`;
    return boundCtor;
  }
  get first(): T {
    return this.#first;
  }
  get second(): U {
    return this.#second;
  }
  setFirst(value: T): Pair {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: value,
      second: this.#second
    }));
  }
  setSecond(value: U): Pair {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: this.#first,
      second: value
    }));
  }
}
export namespace Pair {
  export interface Data<T extends Message, U extends Message> {
    first: T;
    second: U;
  }
  export type Value = Pair | Pair.Data;
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
  export interface Data {
    name: string;
  }
  export type Value = Parent | Parent.Data;
}
