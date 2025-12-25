/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/object-only.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
export class ObjectOnly extends Message<ObjectOnly.Data> {
  static TYPE_TAG = Symbol("ObjectOnly");
  static readonly $typeName = "ObjectOnly";
  static EMPTY: ObjectOnly;
  #id!: number;
  #name!: string;
  #age!: number;
  #active!: boolean;
  constructor(props?: ObjectOnly.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ObjectOnly.EMPTY) return ObjectOnly.EMPTY;
    super(ObjectOnly.TYPE_TAG, "ObjectOnly");
    this.#id = (props ? props.id : 0) as number;
    this.#name = (props ? props.name : "") as string;
    this.#age = (props ? props.age : 0) as number;
    this.#active = (props ? props.active : false) as boolean;
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
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ObjectOnly.Data {
    const props = {} as Partial<ObjectOnly.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const ageValue = entries["age"];
    if (ageValue === undefined) throw new Error("Missing required property \"age\".");
    if (!(typeof ageValue === "number")) throw new Error("Invalid value for property \"age\".");
    props.age = ageValue as number;
    const activeValue = entries["active"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue as boolean;
    return props as ObjectOnly.Data;
  }
  static from(value: ObjectOnly.Value): ObjectOnly {
    return value instanceof ObjectOnly ? value : new ObjectOnly(value);
  }
  static deserialize<T extends typeof ObjectOnly>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
  set(updates: Partial<SetUpdates<ObjectOnly.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ObjectOnly)(data) as this);
  }
  setActive(value: boolean) {
    return this.$update(new (this.constructor as typeof ObjectOnly)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: value
    }) as this);
  }
  setAge(value: number) {
    return this.$update(new (this.constructor as typeof ObjectOnly)({
      id: this.#id,
      name: this.#name,
      age: value,
      active: this.#active
    }) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof ObjectOnly)({
      id: value,
      name: this.#name,
      age: this.#age,
      active: this.#active
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof ObjectOnly)({
      id: this.#id,
      name: value,
      age: this.#age,
      active: this.#active
    }) as this);
  }
}
export namespace ObjectOnly {
  export type Data = {
    id: number;
    name: string;
    age: number;
    active: boolean;
  };
  export type Value = ObjectOnly | ObjectOnly.Data;
}
