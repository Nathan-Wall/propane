/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/primitives.propane
import { Message, MessagePropDescriptor, WITH_CHILD, GET_MESSAGE_CHILDREN } from "@propanejs/runtime";
export class Primitives extends Message<Primitives.Data> {
  static TYPE_TAG = Symbol("Primitives");
  static EMPTY: Primitives;
  #flag: boolean;
  #count: number;
  #label: string;
  #size: bigint;
  #empty: null;
  #missing: undefined;
  constructor(props?: Primitives.Value) {
    if (!props && Primitives.EMPTY) return Primitives.EMPTY;
    super(Primitives.TYPE_TAG, "Primitives");
    this.#flag = props ? props.flag : false;
    this.#count = props ? props.count : 0;
    this.#label = props ? props.label : "";
    this.#size = props ? props.size : 0n;
    this.#empty = props ? props.empty : null;
    this.#missing = props ? props.missing : undefined;
    if (!props) Primitives.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Primitives.Data>[] {
    return [{
      name: "flag",
      fieldNumber: null,
      getValue: () => this.#flag
    }, {
      name: "count",
      fieldNumber: null,
      getValue: () => this.#count
    }, {
      name: "label",
      fieldNumber: null,
      getValue: () => this.#label
    }, {
      name: "size",
      fieldNumber: null,
      getValue: () => this.#size
    }, {
      name: "empty",
      fieldNumber: null,
      getValue: () => this.#empty
    }, {
      name: "missing",
      fieldNumber: null,
      getValue: () => this.#missing
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Primitives.Data {
    const props = {} as Partial<Primitives.Data>;
    const flagValue = entries["flag"];
    if (flagValue === undefined) throw new Error("Missing required property \"flag\".");
    if (!(typeof flagValue === "boolean")) throw new Error("Invalid value for property \"flag\".");
    props.flag = flagValue;
    const countValue = entries["count"];
    if (countValue === undefined) throw new Error("Missing required property \"count\".");
    if (!(typeof countValue === "number")) throw new Error("Invalid value for property \"count\".");
    props.count = countValue;
    const labelValue = entries["label"];
    if (labelValue === undefined) throw new Error("Missing required property \"label\".");
    if (!(typeof labelValue === "string")) throw new Error("Invalid value for property \"label\".");
    props.label = labelValue;
    const sizeValue = entries["size"];
    if (sizeValue === undefined) throw new Error("Missing required property \"size\".");
    if (!(typeof sizeValue === "bigint")) throw new Error("Invalid value for property \"size\".");
    props.size = sizeValue;
    const emptyValue = entries["empty"];
    if (emptyValue === undefined) throw new Error("Missing required property \"empty\".");
    if (!(emptyValue === null)) throw new Error("Invalid value for property \"empty\".");
    props.empty = emptyValue;
    const missingValue = entries["missing"];
    if (missingValue === undefined) throw new Error("Missing required property \"missing\".");
    if (!(missingValue === undefined)) throw new Error("Invalid value for property \"missing\".");
    props.missing = missingValue;
    return props as Primitives.Data;
  }
  get flag(): boolean {
    return this.#flag;
  }
  get count(): number {
    return this.#count;
  }
  get label(): string {
    return this.#label;
  }
  get size(): bigint {
    return this.#size;
  }
  get empty(): null {
    return this.#empty;
  }
  get missing(): undefined {
    return this.#missing;
  }
  setCount(value: number): Primitives {
    return this.$update(new Primitives({
      flag: this.#flag,
      count: value,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }, this.$listeners));
  }
  setEmpty(value: null): Primitives {
    return this.$update(new Primitives({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: value,
      missing: this.#missing
    }, this.$listeners));
  }
  setFlag(value: boolean): Primitives {
    return this.$update(new Primitives({
      flag: value,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }, this.$listeners));
  }
  setLabel(value: string): Primitives {
    return this.$update(new Primitives({
      flag: this.#flag,
      count: this.#count,
      label: value,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }, this.$listeners));
  }
  setMissing(value: undefined): Primitives {
    return this.$update(new Primitives({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: value
    }, this.$listeners));
  }
  setSize(value: bigint): Primitives {
    return this.$update(new Primitives({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: value,
      empty: this.#empty,
      missing: this.#missing
    }, this.$listeners));
  }
}
export namespace Primitives {
  export interface Data {
    flag: boolean;
    count: number;
    label: string;
    size: bigint;
    empty: null;
    missing: undefined;
  }
  export type Value = Primitives | Primitives.Data;
}
