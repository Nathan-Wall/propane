/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-explicit-any*/
// Generated from tests/generic-types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, SKIP } from "../runtime/index.js";

/**
 * Test file for generic message types.
 */

// Basic item type for testing
import type { MessagePropDescriptor, MessageConstructor, DataObject, SetUpdates } from "../runtime/index.js";
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
  set(updates: Partial<SetUpdates<Item.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Item)(data));
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof Item)({
      id: value,
      name: this.#name
    }));
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Item)({
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
      const inner = props.inner instanceof tClass ? props.inner : new tClass(props.inner as any);
      return new Container(tClass, {
        ...props,
        inner
      });
    };
    boundCtor.deserialize = (data: string) => {
      const payload = parseCerealString(data);
      return boundCtor(payload as Container.Data<T>);
    };
    boundCtor.$typeName = `Container<${tClass.$typeName}>`;
    return boundCtor;
  }
  static override deserialize<T extends Message<any>>(tClass: MessageConstructor<T>, data: string): Container<T> {
    const payload = parseCerealString(data);
    const inner = new tClass(payload["1"] ?? payload["inner"]);
    return new Container(tClass, {
      ...(payload as Container.Data<T>),
      inner
    });
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
    return this.$update(new Container(this.#tClass, data) as this);
  }
  setInner(value: T) {
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
      const value = props.value === undefined ? undefined : props.value instanceof tClass ? props.value : new tClass(props.value as any);
      return new Optional(tClass, {
        ...props,
        value
      });
    };
    boundCtor.deserialize = (data: string) => {
      const payload = parseCerealString(data);
      return boundCtor(payload as Optional.Data<T>);
    };
    boundCtor.$typeName = `Optional<${tClass.$typeName}>`;
    return boundCtor;
  }
  static override deserialize<T extends Message<any>>(tClass: MessageConstructor<T>, data: string): Optional<T> {
    const payload = parseCerealString(data);
    const valueRaw = payload["1"] ?? payload["value"];
    const value = valueRaw !== undefined ? new tClass(valueRaw) : undefined;
    return new Optional(tClass, {
      ...(payload as Optional.Data<T>),
      value
    });
  }
  get value(): T {
    return this.#value;
  }
  deleteValue() {
    return this.$update(new Optional(this.#tClass, {}) as this);
  }
  set(updates: Partial<SetUpdates<Optional.Data<T>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new Optional(this.#tClass, data) as this);
  }
  setValue(value: T) {
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
      const first = props.first instanceof tClass ? props.first : new tClass(props.first as any);
      const second = props.second instanceof uClass ? props.second : new uClass(props.second as any);
      return new Pair(tClass, uClass, {
        ...props,
        first,
        second
      });
    };
    boundCtor.deserialize = (data: string) => {
      const payload = parseCerealString(data);
      return boundCtor(payload as Pair.Data<T, U>);
    };
    boundCtor.$typeName = `Pair<${tClass.$typeName},${uClass.$typeName}>`;
    return boundCtor;
  }
  static override deserialize<T extends Message<any>, U extends Message<any>>(tClass: MessageConstructor<T>, uClass: MessageConstructor<U>, data: string): Pair<T, U> {
    const payload = parseCerealString(data);
    const first = new tClass(payload["1"] ?? payload["first"]);
    const second = new uClass(payload["2"] ?? payload["second"]);
    return new Pair(tClass, uClass, {
      ...(payload as Pair.Data<T, U>),
      first,
      second
    });
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
    return this.$update(new Pair(this.#tClass, this.#uClass, data) as this);
  }
  setFirst(value: T) {
    return this.$update(new Pair(this.#tClass, this.#uClass, {
      first: value,
      second: this.#second
    }) as this);
  }
  setSecond(value: U) {
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
  set(updates: Partial<SetUpdates<Parent.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Parent)(data));
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Parent)({
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
