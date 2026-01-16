/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from common/numbers/rational.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../../runtime/index.js";

// @extend('./rational.pmsg.ext.ts')
// @compact
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../../runtime/index.js";
const TYPE_TAG_Rational$Base = Symbol("Rational");
export class Rational$Base extends Message<Rational.Data> {
  static $typeId = "common/numbers/rational.pmsg#Rational";
  static $typeHash = "sha256:466efdd2144550a1e7073f5cd068dd392913ac969a66ff4b7ace5a43c627cbbd";
  static $instanceTag = Symbol.for("propane:message:" + Rational$Base.$typeId);
  static override readonly $compact = true;
  static readonly $typeName = "Rational";
  static EMPTY: Rational$Base;
  #numerator!: bigint;
  #denominator!: bigint;
  constructor(props?: Rational.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Rational$Base.EMPTY) return Rational$Base.EMPTY;
    super(TYPE_TAG_Rational$Base, "Rational");
    this.#numerator = (props ? props.numerator : 0n) as bigint;
    this.#denominator = (props ? props.denominator : 0n) as bigint;
    if (!props) Rational$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Rational.Data>[] {
    return [{
      name: "numerator",
      fieldNumber: 1,
      getValue: () => this.#numerator
    }, {
      name: "denominator",
      fieldNumber: 2,
      getValue: () => this.#denominator
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Rational.Data {
    const props = {} as Partial<Rational.Data>;
    const numeratorValue = entries["1"] === undefined ? entries["numerator"] : entries["1"];
    if (numeratorValue === undefined) throw new Error("Missing required property \"numerator\".");
    if (!(typeof numeratorValue === "bigint")) throw new Error("Invalid value for property \"numerator\".");
    props.numerator = numeratorValue as bigint;
    const denominatorValue = entries["2"] === undefined ? entries["denominator"] : entries["2"];
    if (denominatorValue === undefined) throw new Error("Missing required property \"denominator\".");
    if (!(typeof denominatorValue === "bigint")) throw new Error("Invalid value for property \"denominator\".");
    props.denominator = denominatorValue as bigint;
    return props as Rational.Data;
  }
  static from(value: Rational.Value): Rational$Base {
    return value instanceof Rational$Base ? value : new Rational$Base(value);
  }
  static deserialize<T extends typeof Rational$Base>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get numerator(): bigint {
    return this.#numerator;
  }
  get denominator(): bigint {
    return this.#denominator;
  }
  set(updates: Partial<SetUpdates<Rational.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Rational$Base)(data) as this);
  }
  setDenominator(value: bigint) {
    return this.$update(new (this.constructor as typeof Rational$Base)({
      numerator: this.#numerator,
      denominator: value
    }) as this);
  }
  setNumerator(value: bigint) {
    return this.$update(new (this.constructor as typeof Rational$Base)({
      numerator: value,
      denominator: this.#denominator
    }) as this);
  }
}
export namespace Rational {
  export type Data = {
    numerator: bigint;
    denominator: bigint;
  };
  export type Value = Rational$Base | Rational.Data;
}
