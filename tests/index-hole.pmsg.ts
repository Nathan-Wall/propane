/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/index-hole.pmsg
import type { MessagePropDescriptor } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
// @message
export class Hole extends Message<Hole.Data> {
  static TYPE_TAG = Symbol("Hole");
  static readonly $typeName = "Hole";
  static EMPTY: Hole;
  #id: number;
  #value: number;
  #name: string;
  constructor(props?: Hole.Value) {
    if (!props && Hole.EMPTY) return Hole.EMPTY;
    super(Hole.TYPE_TAG, "Hole");
    this.#id = props ? props.id : 0;
    this.#value = props ? props.value : 0;
    this.#name = props ? props.name : "";
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
  protected $fromEntries(entries: Record<string, unknown>): Hole.Data {
    const props = {} as Partial<Hole.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const valueValue = entries["3"] === undefined ? entries["value"] : entries["3"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "number")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    const nameValue = entries["4"] === undefined ? entries["name"] : entries["4"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as Hole.Data;
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
  setId(value: number): Hole {
    return this.$update(new (this.constructor as typeof Hole)({
      id: value,
      value: this.#value,
      name: this.#name
    }));
  }
  setName(value: string): Hole {
    return this.$update(new (this.constructor as typeof Hole)({
      id: this.#id,
      value: this.#value,
      name: value
    }));
  }
  setValue(value: number): Hole {
    return this.$update(new (this.constructor as typeof Hole)({
      id: this.#id,
      value: value,
      name: this.#name
    }));
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
