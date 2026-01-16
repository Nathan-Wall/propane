/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/index-hole.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Hole = Symbol("Hole");
export class Hole extends Message<Hole.Data> {
  static $typeId = "tests/index-hole.pmsg#Hole";
  static $typeHash = "sha256:549cb653fd68a6072274dc1c8cfbe1866e75e192df463e65900b92583847bda9";
  static $instanceTag = Symbol.for("propane:message:" + Hole.$typeId);
  static readonly $typeName = "Hole";
  static EMPTY: Hole;
  #id!: number;
  #value!: number;
  #name!: string;
  constructor(props?: Hole.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Hole.EMPTY) return Hole.EMPTY;
    super(TYPE_TAG_Hole, "Hole");
    this.#id = (props ? props.id : 0) as number;
    this.#value = (props ? props.value : 0) as number;
    this.#name = (props ? props.name : "") as string;
    if (!props) Hole.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Hole.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "value",
      fieldNumber: 3,
      getValue: () => this.#value
    }, {
      name: "name",
      fieldNumber: 4,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Hole.Data {
    const props = {} as Partial<Hole.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const valueValue = entries["3"] === undefined ? entries["value"] : entries["3"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "number")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as number;
    const nameValue = entries["4"] === undefined ? entries["name"] : entries["4"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as Hole.Data;
  }
  static from(value: Hole.Value): Hole {
    return value instanceof Hole ? value : new Hole(value);
  }
  static deserialize<T extends typeof Hole>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): number {
    return this.#id;
  }
  get value(): number {
    return this.#value;
  }
  get name(): string {
    return this.#name;
  }
  set(updates: Partial<SetUpdates<Hole.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Hole)(data) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof Hole)({
      id: value,
      value: this.#value,
      name: this.#name
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Hole)({
      id: this.#id,
      value: this.#value,
      name: value
    }) as this);
  }
  setValue(value: number) {
    return this.$update(new (this.constructor as typeof Hole)({
      id: this.#id,
      value: value,
      name: this.#name
    }) as this);
  }
}
export namespace Hole {
  export type Data = {
    id: number;
    value: number;
    name: string;
  };
  export type Value = Hole | Hole.Data;
}
