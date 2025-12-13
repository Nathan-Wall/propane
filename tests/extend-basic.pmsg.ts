/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/extend-basic.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP } from "../runtime/index.js";

// @extend('./extend-basic.pmsg.ext.ts')
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class Person$Base extends Message<Person.Data> {
  static TYPE_TAG = Symbol("Person");
  static readonly $typeName = "Person";
  static EMPTY: Person;
  #firstName: string;
  #lastName: string;
  #age: number;
  constructor(props?: Person.Value) {
    if (!props && Person$Base.EMPTY) return Person$Base.EMPTY;
    super(Person$Base.TYPE_TAG, "Person");
    this.#firstName = props ? props.firstName : "";
    this.#lastName = props ? props.lastName : "";
    this.#age = props ? props.age : 0;
    if (!props) Person$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Person.Data>[] {
    return [{
      name: "firstName",
      fieldNumber: 1,
      getValue: () => this.#firstName
    }, {
      name: "lastName",
      fieldNumber: 2,
      getValue: () => this.#lastName
    }, {
      name: "age",
      fieldNumber: 3,
      getValue: () => this.#age
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Person.Data {
    const props = {} as Partial<Person.Data>;
    const firstNameValue = entries["1"] === undefined ? entries["firstName"] : entries["1"];
    if (firstNameValue === undefined) throw new Error("Missing required property \"firstName\".");
    if (!(typeof firstNameValue === "string")) throw new Error("Invalid value for property \"firstName\".");
    props.firstName = firstNameValue;
    const lastNameValue = entries["2"] === undefined ? entries["lastName"] : entries["2"];
    if (lastNameValue === undefined) throw new Error("Missing required property \"lastName\".");
    if (!(typeof lastNameValue === "string")) throw new Error("Invalid value for property \"lastName\".");
    props.lastName = lastNameValue;
    const ageValue = entries["3"] === undefined ? entries["age"] : entries["3"];
    if (ageValue === undefined) throw new Error("Missing required property \"age\".");
    if (!(typeof ageValue === "number")) throw new Error("Invalid value for property \"age\".");
    props.age = ageValue;
    return props as Person.Data;
  }
  get firstName(): string {
    return this.#firstName;
  }
  get lastName(): string {
    return this.#lastName;
  }
  get age(): number {
    return this.#age;
  }
  set(updates: Partial<SetUpdates<Person.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Person)(data));
  }
  setAge(value: number) {
    return this.$update(new (this.constructor as typeof Person)({
      firstName: this.#firstName,
      lastName: this.#lastName,
      age: value
    }));
  }
  setFirstName(value: string) {
    return this.$update(new (this.constructor as typeof Person)({
      firstName: value,
      lastName: this.#lastName,
      age: this.#age
    }));
  }
  setLastName(value: string) {
    return this.$update(new (this.constructor as typeof Person)({
      firstName: this.#firstName,
      lastName: value,
      age: this.#age
    }));
  }
}
export namespace Person {
  export type Data = {
    firstName: string;
    lastName: string;
    age: number;
  };
  export type Value = Person | Person.Data;
}
