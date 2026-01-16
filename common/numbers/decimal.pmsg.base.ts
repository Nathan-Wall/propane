/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-explicit-any*/
// Generated from common/numbers/decimal.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../../runtime/index.js";

// @extend('./decimal.pmsg.ext.ts')
// @compact
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../../runtime/index.js";
const TYPE_TAG_Decimal$Base = Symbol("Decimal");
export class Decimal$Base<P extends number, S extends number> extends Message<Decimal.Data<P, S>> {
  static $typeId = "common/numbers/decimal.pmsg#Decimal";
  static $typeHash = "sha256:88a230776bf213b538e723b79e9523e0586de99e33b74bc35ba3ebeb78b2eddd";
  static $instanceTag = Symbol.for("propane:message:" + Decimal$Base.$typeId);
  static override readonly $compact = true;
  static readonly $typeName = "Decimal";
  static EMPTY: Decimal$Base<any, any>;
  #mantissa!: bigint;
  #precision!: number;
  #scale!: number;
  constructor(props?: Decimal.Value<P, S>, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Decimal$Base.EMPTY) return Decimal$Base.EMPTY;
    super(TYPE_TAG_Decimal$Base, "Decimal");
    this.#mantissa = (props ? props.mantissa : 0n) as bigint;
    this.#precision = (props ? props.precision : 0) as number;
    this.#scale = (props ? props.scale : 0) as number;
    if (!props) Decimal$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Decimal.Data<P, S>>[] {
    return [{
      name: "mantissa",
      fieldNumber: 1,
      getValue: () => this.#mantissa
    }, {
      name: "precision",
      fieldNumber: 2,
      getValue: () => this.#precision
    }, {
      name: "scale",
      fieldNumber: 3,
      getValue: () => this.#scale
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Decimal.Data<P, S> {
    const props = {} as Partial<Decimal.Data<P, S>>;
    const mantissaValue = entries["1"] === undefined ? entries["mantissa"] : entries["1"];
    if (mantissaValue === undefined) throw new Error("Missing required property \"mantissa\".");
    if (!(typeof mantissaValue === "bigint")) throw new Error("Invalid value for property \"mantissa\".");
    props.mantissa = mantissaValue as bigint;
    const precisionValue = entries["2"] === undefined ? entries["precision"] : entries["2"];
    if (precisionValue === undefined) throw new Error("Missing required property \"precision\".");
    if (!(typeof precisionValue === "number")) throw new Error("Invalid value for property \"precision\".");
    props.precision = precisionValue as number;
    const scaleValue = entries["3"] === undefined ? entries["scale"] : entries["3"];
    if (scaleValue === undefined) throw new Error("Missing required property \"scale\".");
    if (!(typeof scaleValue === "number")) throw new Error("Invalid value for property \"scale\".");
    props.scale = scaleValue as number;
    return props as Decimal.Data<P, S>;
  }
  static deserialize<T extends typeof Decimal$Base>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get mantissa(): bigint {
    return this.#mantissa;
  }
  get precision(): number {
    return this.#precision;
  }
  get scale(): number {
    return this.#scale;
  }
  set(updates: Partial<SetUpdates<Decimal.Data<P, S>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Decimal$Base)(data) as this);
  }
  setMantissa(value: bigint) {
    return this.$update(new (this.constructor as typeof Decimal$Base)({
      mantissa: value,
      precision: this.#precision,
      scale: this.#scale
    }) as this);
  }
  setPrecision(value: number) {
    return this.$update(new (this.constructor as typeof Decimal$Base)({
      mantissa: this.#mantissa,
      precision: value,
      scale: this.#scale
    }) as this);
  }
  setScale(value: number) {
    return this.$update(new (this.constructor as typeof Decimal$Base)({
      mantissa: this.#mantissa,
      precision: this.#precision,
      scale: value
    }) as this);
  }
}
export namespace Decimal {
  export type Data<P extends number, S extends number> = {
    mantissa: bigint;
    precision: number;
    scale: number;
  };
  export type Value<P extends number, S extends number> = Decimal$Base<P, S> | Decimal.Data<P, S>;
}
