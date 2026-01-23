/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/prop-collision.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Foo = Symbol("Foo");
export class Foo extends Message<Foo.Data> {
  static $typeId = "tests/prop-collision.pmsg#Foo";
  static $typeHash = "sha256:35ebc16317e930abf22c1da76860378fc4ad9d7b8260cc617b4cf0f112825b05";
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
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for Foo.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Foo.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
