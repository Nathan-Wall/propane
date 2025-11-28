/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/prop-collision.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export class Foo extends Message<Foo.Data> {
  static TYPE_TAG = Symbol("Foo");
  static EMPTY: Foo;
  #name: string;
  #_name: string;
  constructor(props?: Foo.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && Foo.EMPTY) return Foo.EMPTY;
    super(Foo.TYPE_TAG, "Foo", listeners);
    this.#name = props ? props.name : "";
    this.#_name = props ? props._name : "";
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) Foo.EMPTY = this;
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
  get name(): string {
    return this.#name;
  }
  get _name(): string {
    return this.#_name;
  }
  setName(value: string): Foo {
    return this.$update(new Foo({
      name: value,
      _name: this.#_name
    }, this.$listeners));
  }
  set_name(value: string): Foo {
    return this.$update(new Foo({
      name: this.#name,
      _name: value
    }, this.$listeners));
  }
}
export namespace Foo {
  export interface Data {
    name: string;
    _name: string;
  }
  export type Value = Foo | Foo.Data;
}
