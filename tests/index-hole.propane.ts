/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/index-hole.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export class Hole extends Message<Hole.Data> {
  static TYPE_TAG = Symbol("Hole");
  static EMPTY: Hole;
  #id: number;
  #value: number;
  #name: string;
  constructor(props?: Hole.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && Hole.EMPTY) return Hole.EMPTY;
    super(Hole.TYPE_TAG, "Hole", listeners);
    this.#id = props ? props.id : 0;
    this.#value = props ? props.value : 0;
    this.#name = props ? props.name : "";
    if (!props && !listeners) Hole.EMPTY = this;
    return this.intern();
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
    return this.$update(new Hole({
      id: value,
      value: this.#value,
      name: this.#name
    }, this.$listeners));
  }
  setName(value: string): Hole {
    return this.$update(new Hole({
      id: this.#id,
      value: this.#value,
      name: value
    }, this.$listeners));
  }
  setValue(value: number): Hole {
    return this.$update(new Hole({
      id: this.#id,
      value: value,
      name: this.#name
    }, this.$listeners));
  }
}
export namespace Hole {
  export interface Data {
    id: number;
    value: number;
    name: string;
  }
  export type Value = Hole | Hole.Data;
}