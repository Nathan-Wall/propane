/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/object-only.propane
import { Message, MessagePropDescriptor, WITH_CHILD, GET_MESSAGE_CHILDREN } from "@propanejs/runtime";
export class ObjectOnly extends Message<ObjectOnly.Data> {
  static TYPE_TAG = Symbol("ObjectOnly");
  static EMPTY: ObjectOnly;
  #id: number;
  #name: string;
  #age: number;
  #active: boolean;
  constructor(props?: ObjectOnly.Value) {
    if (!props && ObjectOnly.EMPTY) return ObjectOnly.EMPTY;
    super(ObjectOnly.TYPE_TAG, "ObjectOnly");
    this.#id = props ? props.id : 0;
    this.#name = props ? props.name : "";
    this.#age = props ? props.age : 0;
    this.#active = props ? props.active : false;
    if (!props) ObjectOnly.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ObjectOnly.Data>[] {
    return [{
      name: "id",
      fieldNumber: null,
      getValue: () => this.#id
    }, {
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }, {
      name: "age",
      fieldNumber: null,
      getValue: () => this.#age
    }, {
      name: "active",
      fieldNumber: null,
      getValue: () => this.#active
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ObjectOnly.Data {
    const props = {} as Partial<ObjectOnly.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const ageValue = entries["age"];
    if (ageValue === undefined) throw new Error("Missing required property \"age\".");
    if (!(typeof ageValue === "number")) throw new Error("Invalid value for property \"age\".");
    props.age = ageValue;
    const activeValue = entries["active"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue;
    return props as ObjectOnly.Data;
  }
  get id(): number {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  get age(): number {
    return this.#age;
  }
  get active(): boolean {
    return this.#active;
  }
  setActive(value: boolean): ObjectOnly {
    return this.$update(new ObjectOnly({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: value
    }, this.$listeners));
  }
  setAge(value: number): ObjectOnly {
    return this.$update(new ObjectOnly({
      id: this.#id,
      name: this.#name,
      age: value,
      active: this.#active
    }, this.$listeners));
  }
  setId(value: number): ObjectOnly {
    return this.$update(new ObjectOnly({
      id: value,
      name: this.#name,
      age: this.#age,
      active: this.#active
    }, this.$listeners));
  }
  setName(value: string): ObjectOnly {
    return this.$update(new ObjectOnly({
      id: this.#id,
      name: value,
      age: this.#age,
      active: this.#active
    }, this.$listeners));
  }
}
export namespace ObjectOnly {
  export interface Data {
    id: number;
    name: string;
    age: number;
    active: boolean;
  }
  export type Value = ObjectOnly | ObjectOnly.Data;
}
