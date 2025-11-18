// Generated from tests/prop-collision.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export namespace Foo {
  export type Data = {
    name: string;
    _name: string;
  };
  export type Value = Foo | Foo.Data;
}
export class Foo extends Message<Foo.Data> {
  static #typeTag = Symbol("Foo");
  #name: string;
  #_name: string;
  constructor(props: Foo.Value) {
    super(Foo.#typeTag);
    this.#name = props.name;
    this.#_name = props._name;
  }
  get name(): string {
    return this.#name;
  }
  get _name(): string {
    return this.#_name;
  }
  setName(value: string): Foo {
    return new Foo({
      name: value,
      _name: this.#_name
    });
  }
  set_name(value: string): Foo {
    return new Foo({
      name: this.#name,
      _name: value
    });
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Foo.Data>[] {
    return [{
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }, {
      name: "_name",
      fieldNumber: null,
      getValue: () => this.#_name
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Foo.Data {
    const props = {} as Partial<Foo.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const _nameValue = entries["_name"];
    if (_nameValue === undefined) throw new Error("Missing required property \"_name\".");
    if (!(typeof _nameValue === "string")) throw new Error("Invalid value for property \"_name\".");
    props._name = _nameValue;
    return props as Foo.Data;
  }
}