/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/decimal-rational-serialization.pmsg
import { Message, Decimal, Rational, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_NumericPair = Symbol("NumericPair");
export class NumericPair extends Message<NumericPair.Data> {
  static $typeId = "tests/decimal-rational-serialization.pmsg#NumericPair";
  static $typeHash = "sha256:62a9d6dbc90976724256e01d9e449c9aaf16a5625cbc2a1152846f3c7234824f";
  static $instanceTag = Symbol.for("propane:message:" + NumericPair.$typeId);
  static readonly $typeName = "NumericPair";
  static EMPTY: NumericPair;
  #amount!: Decimal<10, 2>;
  #ratio!: Rational;
  constructor(props?: NumericPair.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && NumericPair.EMPTY) return NumericPair.EMPTY;
    super(TYPE_TAG_NumericPair, "NumericPair");
    this.#amount = props ? props.amount instanceof Decimal ? props.amount : new Decimal(props.amount, options) : new Decimal();
    this.#ratio = props ? props.ratio instanceof Rational ? props.ratio : new Rational(props.ratio, options) : new Rational();
    if (!props) NumericPair.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumericPair.Data>[] {
    return [{
      name: "amount",
      fieldNumber: 1,
      getValue: () => this.#amount as Decimal.Value<10, 2>
    }, {
      name: "ratio",
      fieldNumber: 2,
      getValue: () => this.#ratio as Rational.Value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): NumericPair.Data {
    const props = {} as Partial<NumericPair.Data>;
    const amountValue = entries["1"] === undefined ? entries["amount"] : entries["1"];
    if (amountValue === undefined) throw new Error("Missing required property \"amount\".");
    const amountMessageValue = typeof amountValue === "string" && Decimal.$compact === true ? Decimal.fromCompact(10, 2, amountValue, options) as any : amountValue instanceof Decimal ? amountValue : new Decimal(amountValue as Decimal.Value<10, 2>, options);
    if (!(Decimal.isInstance(amountMessageValue) && amountMessageValue.precision === 10 && amountMessageValue.scale === 2)) throw new Error("Invalid value for property \"amount\".");
    props.amount = amountMessageValue;
    const ratioValue = entries["2"] === undefined ? entries["ratio"] : entries["2"];
    if (ratioValue === undefined) throw new Error("Missing required property \"ratio\".");
    const ratioMessageValue = typeof ratioValue === "string" && Rational.$compact === true ? Rational.fromCompact(ratioValue, options) as any : ratioValue instanceof Rational ? ratioValue : new Rational(ratioValue as Rational.Value, options);
    if (!Rational.isInstance(ratioMessageValue)) throw new Error("Invalid value for property \"ratio\".");
    props.ratio = ratioMessageValue;
    return props as NumericPair.Data;
  }
  static from(value: NumericPair.Value): NumericPair {
    return value instanceof NumericPair ? value : new NumericPair(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "amount":
        return new (this.constructor as typeof NumericPair)({
          amount: child as Decimal.Value<10, 2>,
          ratio: this.#ratio as Rational.Value
        }) as this;
      case "ratio":
        return new (this.constructor as typeof NumericPair)({
          amount: this.#amount as Decimal.Value<10, 2>,
          ratio: child as Rational.Value
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["amount", this.#amount] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["ratio", this.#ratio] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof NumericPair>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get amount(): Decimal<10, 2> {
    return this.#amount;
  }
  get ratio(): Rational {
    return this.#ratio;
  }
  set(updates: Partial<SetUpdates<NumericPair.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof NumericPair)(data) as this);
  }
  setAmount(value: Decimal.Value<10, 2>) {
    return this.$update(new (this.constructor as typeof NumericPair)({
      amount: (value instanceof Decimal ? value : new Decimal(value)) as Decimal.Value<10, 2>,
      ratio: this.#ratio as Rational.Value
    }) as this);
  }
  setRatio(value: Rational.Value) {
    return this.$update(new (this.constructor as typeof NumericPair)({
      amount: this.#amount as Decimal.Value<10, 2>,
      ratio: (value instanceof Rational ? value : new Rational(value)) as Rational.Value
    }) as this);
  }
}
export namespace NumericPair {
  export type Data = {
    amount: Decimal.Value<10, 2>;
    ratio: Rational.Value;
  };
  export type Value = NumericPair | NumericPair.Data;
}
const TYPE_TAG_NumericUnion = Symbol("NumericUnion");
export class NumericUnion extends Message<NumericUnion.Data> {
  static $typeId = "tests/decimal-rational-serialization.pmsg#NumericUnion";
  static $typeHash = "sha256:c039c495ecd3d8cc06208a167099f500d4f2e8773ff2727cc41337c94f4d1082";
  static $instanceTag = Symbol.for("propane:message:" + NumericUnion.$typeId);
  static readonly $typeName = "NumericUnion";
  static EMPTY: NumericUnion;
  #value!: Decimal<10, 2> | Rational;
  constructor(props?: NumericUnion.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && NumericUnion.EMPTY) return NumericUnion.EMPTY;
    super(TYPE_TAG_NumericUnion, "NumericUnion");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#value = (props ? props.value : undefined) as Decimal<10, 2> | Rational;
    if (!props) NumericUnion.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumericUnion.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as Decimal<10, 2> | Rational,
      unionMessageTypes: ["Decimal", "Rational"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): NumericUnion.Data {
    const props = {} as Partial<NumericUnion.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    let valueUnionValue: any = valueValue as any;
    if (isTaggedMessageData(valueValue)) {
      if (valueValue.$tag === "Decimal") {
        if (typeof valueValue.$data === "string") {
          if (Decimal.$compact === true) {
            valueUnionValue = Decimal.fromCompact(10, 2, valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (Decimal).");
          }
        } else {
          valueUnionValue = new Decimal(Decimal.prototype.$fromEntries(valueValue.$data, options), options);
        }
      } else if (valueValue.$tag === "Rational") {
        if (typeof valueValue.$data === "string") {
          if (Rational.$compact === true) {
            valueUnionValue = Rational.fromCompact(valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (Rational).");
          }
        } else {
          valueUnionValue = new Rational(Rational.prototype.$fromEntries(valueValue.$data, options), options);
        }
      }
    }
    if (!isTaggedMessageData(valueValue) && typeof valueValue === "object" && valueValue !== null) {
      let valueUnionValueMatched = false;
      if (!valueUnionValueMatched) {
        if (valueValue as object instanceof Decimal) {
          valueUnionValue = valueValue as any;
          valueUnionValueMatched = true;
        } else {
          try {
            valueUnionValue = new Decimal(Decimal.prototype.$fromEntries(valueValue as Record<string, unknown>, options), options);
            valueUnionValueMatched = true;
          } catch (e) {}
        }
      }
      if (!valueUnionValueMatched) {
        if (valueValue as object instanceof Rational) {
          valueUnionValue = valueValue as any;
          valueUnionValueMatched = true;
        } else {
          try {
            valueUnionValue = new Rational(Rational.prototype.$fromEntries(valueValue as Record<string, unknown>, options), options);
            valueUnionValueMatched = true;
          } catch (e) {}
        }
      }
    }
    if (!(Decimal.isInstance(valueUnionValue) && valueUnionValue.precision === 10 && valueUnionValue.scale === 2 || Rational.isInstance(valueUnionValue) || Decimal.isInstance(valueUnionValue) || Rational.isInstance(valueUnionValue))) throw new Error("Invalid value for property \"value\".");
    props.value = valueUnionValue;
    return props as NumericUnion.Data;
  }
  static from(value: NumericUnion.Value): NumericUnion {
    return value instanceof NumericUnion ? value : new NumericUnion(value);
  }
  #validate(data: NumericUnion.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: NumericUnion.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof NumericUnion>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get value(): Decimal<10, 2> | Rational {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<NumericUnion.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof NumericUnion)(data) as this);
  }
  setValue(value: Decimal<10, 2> | Rational) {
    return this.$update(new (this.constructor as typeof NumericUnion)({
      value: value as Decimal<10, 2> | Rational
    }) as this);
  }
}
export namespace NumericUnion {
  export type Data = {
    value: Decimal<10, 2> | Rational;
  };
  export type Value = NumericUnion | NumericUnion.Data;
}
