/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/primitives.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class Primitives extends Message<Primitives.Data> {
  static TYPE_TAG = Symbol("Primitives");
  static readonly $typeName = "Primitives";
  static EMPTY: Primitives;
  #flag!: boolean;
  #count!: number;
  #label!: string;
  #size!: bigint;
  #empty!: null;
  #missing!: undefined;
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
  set(updates: Partial<SetUpdates<Primitives.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Primitives)(data));
  }
  setCount(value: number) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: value,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }));
  }
  setEmpty(value: null) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: value,
      missing: this.#missing
    }));
  }
  setFlag(value: boolean) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: value,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }));
  }
  setLabel(value: string) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: value,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }));
  }
  setMissing(value: undefined) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: value
    }));
  }
  setSize(value: bigint) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: value,
      empty: this.#empty,
      missing: this.#missing
    }));
  }
}
export namespace Primitives {
  export type Data = {
    flag: boolean;
    count: number;
    label: string;
    size: bigint;
    empty: null;
    missing: undefined;
  };
  export type Value = Primitives | Primitives.Data;
}
