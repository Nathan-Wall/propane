/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/prop-collision.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class Foo extends Message<Foo.Data> {
  static TYPE_TAG = Symbol("Foo");
  static readonly $typeName = "Foo";
  static EMPTY: Foo;
  #name: string;
  #_name: string;
  constructor(props?: Foo.Value) {
    if (!props && Foo.EMPTY) return Foo.EMPTY;
    super(Foo.TYPE_TAG, "Foo");
    this.#name = props ? props.name : "";
    this.#_name = props ? props._name : "";
    if (!props) Foo.EMPTY = this;
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
  set(updates: Partial<SetUpdates<Foo.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Foo)(data));
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Foo)({
      name: value,
      _name: this.#_name
    }));
  }
  set_name(value: string) {
    return this.$update(new (this.constructor as typeof Foo)({
      name: this.#name,
      _name: value
    }));
  }
}
export namespace Foo {
  export type Data = {
    name: string;
    _name: string;
  };
  export type Value = Foo | Foo.Data;
}
