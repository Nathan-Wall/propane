/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/prop-collision.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Foo = Symbol("Foo");
export class Foo extends Message<Foo.Data> {
  static $typeId = "tests/prop-collision.pmsg#Foo";
  static $typeHash = "sha256:3bcc70cf924e1e776813689ff3a24b7292c8a590aaf538b66d63b9290d0f0aba";
  static $instanceTag = Symbol.for("propane:message:" + Foo.$typeId);
  static readonly $typeName = "Foo";
  static EMPTY: Foo;
  #name!: string;
  #_name!: string;
  constructor(props?: Foo.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Foo.EMPTY) return Foo.EMPTY;
    super(TYPE_TAG_Foo, "Foo");
    this.#name = (props ? props.name : "") as string;
    this.#_name = (props ? props._name : "") as string;
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
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Foo.Data {
    const props = {} as Partial<Foo.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const _nameValue = entries["_name"];
    if (_nameValue === undefined) throw new Error("Missing required property \"_name\".");
    if (!(typeof _nameValue === "string")) throw new Error("Invalid value for property \"_name\".");
    props._name = _nameValue as string;
    return props as Foo.Data;
  }
  static from(value: Foo.Value): Foo {
    return value instanceof Foo ? value : new Foo(value);
  }
  static deserialize<T extends typeof Foo>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof Foo)(data) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Foo)({
      name: value,
      _name: this.#_name
    }) as this);
  }
  set_name(value: string) {
    return this.$update(new (this.constructor as typeof Foo)({
      name: this.#name,
      _name: value
    }) as this);
  }
}
export namespace Foo {
  export type Data = {
    name: string;
    _name: string;
  };
  export type Value = Foo | Foo.Data;
}
