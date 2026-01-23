/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/primitives.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Primitives = Symbol("Primitives");
export class Primitives extends Message<Primitives.Data> {
  static $typeId = "tests/primitives.pmsg#Primitives";
  static $typeHash = "sha256:813158f36347d1993ab4a8099129136978f4d84c989d99412d3f6c11ece28f16";
  static $instanceTag = Symbol.for("propane:message:" + Primitives.$typeId);
  static readonly $typeName = "Primitives";
  static EMPTY: Primitives;
  #flag!: boolean;
  #count!: number;
  #label!: string;
  #size!: bigint;
  #empty!: null;
  #missing!: undefined;
  constructor(props?: Primitives.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Primitives.EMPTY) return Primitives.EMPTY;
    super(TYPE_TAG_Primitives, "Primitives");
    this.#flag = (props ? props.flag : false) as boolean;
    this.#count = (props ? props.count : 0) as number;
    this.#label = (props ? props.label : "") as string;
    this.#size = (props ? props.size : 0n) as bigint;
    this.#empty = (props ? props.empty : null) as null;
    this.#missing = (props ? props.missing : undefined) as undefined;
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
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Primitives.Data {
    const props = {} as Partial<Primitives.Data>;
    const flagValue = entries["flag"];
    if (flagValue === undefined) throw new Error("Missing required property \"flag\".");
    if (!(typeof flagValue === "boolean")) throw new Error("Invalid value for property \"flag\".");
    props.flag = flagValue as boolean;
    const countValue = entries["count"];
    if (countValue === undefined) throw new Error("Missing required property \"count\".");
    if (!(typeof countValue === "number")) throw new Error("Invalid value for property \"count\".");
    props.count = countValue as number;
    const labelValue = entries["label"];
    if (labelValue === undefined) throw new Error("Missing required property \"label\".");
    if (!(typeof labelValue === "string")) throw new Error("Invalid value for property \"label\".");
    props.label = labelValue as string;
    const sizeValue = entries["size"];
    if (sizeValue === undefined) throw new Error("Missing required property \"size\".");
    if (!(typeof sizeValue === "bigint")) throw new Error("Invalid value for property \"size\".");
    props.size = sizeValue as bigint;
    const emptyValue = entries["empty"];
    if (emptyValue === undefined) throw new Error("Missing required property \"empty\".");
    if (!(emptyValue === null)) throw new Error("Invalid value for property \"empty\".");
    props.empty = emptyValue as null;
    const missingValue = entries["missing"];
    if (missingValue === undefined) throw new Error("Missing required property \"missing\".");
    if (!(missingValue === undefined)) throw new Error("Invalid value for property \"missing\".");
    props.missing = missingValue as undefined;
    return props as Primitives.Data;
  }
  static from(value: Primitives.Value): Primitives {
    return value instanceof Primitives ? value : new Primitives(value);
  }
  static deserialize<T extends typeof Primitives>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Primitives.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Primitives.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof Primitives)(data) as this);
  }
  setCount(value: number) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: value,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }) as this);
  }
  setEmpty(value: null) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: value,
      missing: this.#missing
    }) as this);
  }
  setFlag(value: boolean) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: value,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }) as this);
  }
  setLabel(value: string) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: value,
      size: this.#size,
      empty: this.#empty,
      missing: this.#missing
    }) as this);
  }
  setMissing(value: undefined) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: this.#size,
      empty: this.#empty,
      missing: value
    }) as this);
  }
  setSize(value: bigint) {
    return this.$update(new (this.constructor as typeof Primitives)({
      flag: this.#flag,
      count: this.#count,
      label: this.#label,
      size: value,
      empty: this.#empty,
      missing: this.#missing
    }) as this);
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
