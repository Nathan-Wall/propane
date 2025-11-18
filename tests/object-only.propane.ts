// Generated from tests/object-only.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export namespace ObjectOnly {
  export type Data = {
    id: number;
    name: string;
    age: number;
    active: boolean;
  };
  export type Value = ObjectOnly | ObjectOnly.Data;
}
export class ObjectOnly extends Message<ObjectOnly.Data> {
  static #typeTag = Symbol("ObjectOnly");
  #id: number;
  #name: string;
  #age: number;
  #active: boolean;
  constructor(props: ObjectOnly.Value) {
    super(ObjectOnly.#typeTag);
    this.#id = props.id;
    this.#name = props.name;
    this.#age = props.age;
    this.#active = props.active;
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
  setId(value: number): ObjectOnly {
    return new ObjectOnly({
      id: value,
      name: this.#name,
      age: this.#age,
      active: this.#active
    });
  }
  setName(value: string): ObjectOnly {
    return new ObjectOnly({
      id: this.#id,
      name: value,
      age: this.#age,
      active: this.#active
    });
  }
  setAge(value: number): ObjectOnly {
    return new ObjectOnly({
      id: this.#id,
      name: this.#name,
      age: value,
      active: this.#active
    });
  }
  setActive(value: boolean): ObjectOnly {
    return new ObjectOnly({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: value
    });
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
}