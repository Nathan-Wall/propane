/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/decimal-rational-serialization.pmsg
import { Message, Decimal, Rational, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableArray, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_NumericPair = Symbol("NumericPair");
export class NumericPair extends Message<NumericPair.Data> {
  static $typeId = "tests/decimal-rational-serialization.pmsg#NumericPair";
  static $typeHash = "sha256:ceb3b781258879bfaf04cfebf468c32bbef0810a49592876528d26c62e83e867";
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
    const amountMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && Decimal.$compact === true) {
        result = Decimal.fromCompact(10, 2, Decimal.$compactTag && value.startsWith(Decimal.$compactTag) ? value.slice(Decimal.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "Decimal") {
            if (typeof value.$data === "string") {
              if (Decimal.$compact === true) {
                result = Decimal.fromCompact(10, 2, Decimal.$compactTag && value.$data.startsWith(Decimal.$compactTag) ? value.$data.slice(Decimal.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for Decimal.");
              }
            } else {
              result = new Decimal(Decimal.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected Decimal.");
          }
        } else {
          if (value instanceof Decimal) {
            result = value;
          } else {
            result = new Decimal(value as Decimal.Value<10, 2>, options);
          }
        }
      }
      return result;
    })(amountValue);
    if (!(Decimal.isInstance(amountMessageValue) && amountMessageValue.precision === 10 && amountMessageValue.scale === 2)) throw new Error("Invalid value for property \"amount\".");
    props.amount = amountMessageValue;
    const ratioValue = entries["2"] === undefined ? entries["ratio"] : entries["2"];
    if (ratioValue === undefined) throw new Error("Missing required property \"ratio\".");
    const ratioMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && Rational.$compact === true) {
        result = Rational.fromCompact(Rational.$compactTag && value.startsWith(Rational.$compactTag) ? value.slice(Rational.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "Rational") {
            if (typeof value.$data === "string") {
              if (Rational.$compact === true) {
                result = Rational.fromCompact(Rational.$compactTag && value.$data.startsWith(Rational.$compactTag) ? value.$data.slice(Rational.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for Rational.");
              }
            } else {
              result = new Rational(Rational.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected Rational.");
          }
        } else {
          if (value instanceof Rational) {
            result = value;
          } else {
            result = new Rational(value as Rational.Value, options);
          }
        }
      }
      return result;
    })(ratioValue);
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
            throw new Error("Invalid compact tagged value for NumericPair.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected NumericPair.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
  static $typeHash = "sha256:2340fe64b280bec9578fc724950f6628ab8f526195f998f7098f1e7f223ef62c";
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
    this.#value = (props ? (value => {
      if (!options?.skipValidation && true && !(Decimal.isInstance(value) || Rational.isInstance(value))) throw new Error("Invalid value for property \"value\".");
      return value;
    })((value => {
      let result = value as any;
      return result;
    })(props.value)) : undefined) as Decimal<10, 2> | Rational;
    if (!props) NumericUnion.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumericUnion.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value as Decimal<10, 2> | Rational | Decimal<10, 2> | Rational,
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
            valueUnionValue = Decimal.fromCompact(10, 2, Decimal.$compactTag && valueValue.$data.startsWith(Decimal.$compactTag) ? valueValue.$data.slice(Decimal.$compactTag.length) : valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (Decimal).");
          }
        } else {
          valueUnionValue = new Decimal(Decimal.prototype.$fromEntries(valueValue.$data, options), options);
        }
      } else if (valueValue.$tag === "Rational") {
        if (typeof valueValue.$data === "string") {
          if (Rational.$compact === true) {
            valueUnionValue = Rational.fromCompact(Rational.$compactTag && valueValue.$data.startsWith(Rational.$compactTag) ? valueValue.$data.slice(Rational.$compactTag.length) : valueValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"value\" (Rational).");
          }
        } else {
          valueUnionValue = new Rational(Rational.prototype.$fromEntries(valueValue.$data, options), options);
        }
      }
    }
    if (typeof valueValue === "string") {
      if (Decimal.$compactTag && valueValue.startsWith(Decimal.$compactTag)) {
        if (Decimal.$compact === true) {
          valueUnionValue = Decimal.fromCompact(10, 2, Decimal.$compactTag && valueValue.startsWith(Decimal.$compactTag) ? valueValue.slice(Decimal.$compactTag.length) : valueValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"value\" (Decimal).");
        }
      } else if (Rational.$compactTag && valueValue.startsWith(Rational.$compactTag)) {
        if (Rational.$compact === true) {
          valueUnionValue = Rational.fromCompact(Rational.$compactTag && valueValue.startsWith(Rational.$compactTag) ? valueValue.slice(Rational.$compactTag.length) : valueValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"value\" (Rational).");
        }
      }
    }
    if (!(Decimal.isInstance(valueUnionValue) || Rational.isInstance(valueUnionValue))) throw new Error("Invalid value for property \"value\".");
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
            throw new Error("Invalid compact tagged value for NumericUnion.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected NumericUnion.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
  setValue(value: Decimal<10, 2> | Rational | Decimal<10, 2> | Rational) {
    return this.$update(new (this.constructor as typeof NumericUnion)({
      value: value as Decimal<10, 2> | Rational | Decimal<10, 2> | Rational
    }) as this);
  }
}
export namespace NumericUnion {
  export type Data = {
    value: Decimal<10, 2> | Rational | Decimal<10, 2> | Rational;
  };
  export type Value = NumericUnion | NumericUnion.Data;
}
