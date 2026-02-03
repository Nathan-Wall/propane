/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/validators.pmsg
/**
 * Validator Integration Tests
 *
 * Tests validation code generation for various validator types.
 */

import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError, isInt32, isInt53, isDecimalOf, Decimal, isPositive, greaterThanOrEqual, lessThanOrEqual, inRange, ImmutableArray } from "../runtime/index.js";
import type { Positive, Negative, NonNegative, NonPositive, Min, Max, Range, NonEmpty, MinLength, MaxLength, Length, int32, int53 } from '@propane/types';

// Test: Numeric sign validators
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_NumericSignValidators = Symbol("NumericSignValidators");
export class NumericSignValidators extends Message<NumericSignValidators.Data> {
  static $typeId = "tests/validators.pmsg#NumericSignValidators";
  static $typeHash = "sha256:3675be2c18b6fae26861147b6d5b5ebd27c7fad0ef19aed7e5492dd506373c27";
  static $instanceTag = Symbol.for("propane:message:" + NumericSignValidators.$typeId);
  static readonly $typeName = "NumericSignValidators";
  static EMPTY: NumericSignValidators;
  #positiveNumber!: Positive<number>;
  #negativeNumber!: Negative<number>;
  #nonNegativeNumber!: NonNegative<number>;
  #nonPositiveNumber!: NonPositive<number>;
  constructor(props?: NumericSignValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && NumericSignValidators.EMPTY) return NumericSignValidators.EMPTY;
    super(TYPE_TAG_NumericSignValidators, "NumericSignValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#positiveNumber = (props ? props.positiveNumber : undefined) as Positive<number>;
    this.#negativeNumber = (props ? props.negativeNumber : undefined) as Negative<number>;
    this.#nonNegativeNumber = (props ? props.nonNegativeNumber : undefined) as NonNegative<number>;
    this.#nonPositiveNumber = (props ? props.nonPositiveNumber : undefined) as NonPositive<number>;
    if (!props) NumericSignValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumericSignValidators.Data>[] {
    return [{
      name: "positiveNumber",
      fieldNumber: 1,
      getValue: () => this.#positiveNumber as Positive<number>
    }, {
      name: "negativeNumber",
      fieldNumber: 2,
      getValue: () => this.#negativeNumber as Negative<number>
    }, {
      name: "nonNegativeNumber",
      fieldNumber: 3,
      getValue: () => this.#nonNegativeNumber as NonNegative<number>
    }, {
      name: "nonPositiveNumber",
      fieldNumber: 4,
      getValue: () => this.#nonPositiveNumber as NonPositive<number>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): NumericSignValidators.Data {
    const props = {} as Partial<NumericSignValidators.Data>;
    const positiveNumberValue = entries["1"] === undefined ? entries["positiveNumber"] : entries["1"];
    if (positiveNumberValue === undefined) throw new Error("Missing required property \"positiveNumber\".");
    props.positiveNumber = positiveNumberValue as Positive<number>;
    const negativeNumberValue = entries["2"] === undefined ? entries["negativeNumber"] : entries["2"];
    if (negativeNumberValue === undefined) throw new Error("Missing required property \"negativeNumber\".");
    props.negativeNumber = negativeNumberValue as Negative<number>;
    const nonNegativeNumberValue = entries["3"] === undefined ? entries["nonNegativeNumber"] : entries["3"];
    if (nonNegativeNumberValue === undefined) throw new Error("Missing required property \"nonNegativeNumber\".");
    props.nonNegativeNumber = nonNegativeNumberValue as NonNegative<number>;
    const nonPositiveNumberValue = entries["4"] === undefined ? entries["nonPositiveNumber"] : entries["4"];
    if (nonPositiveNumberValue === undefined) throw new Error("Missing required property \"nonPositiveNumber\".");
    props.nonPositiveNumber = nonPositiveNumberValue as NonPositive<number>;
    return props as NumericSignValidators.Data;
  }
  static from(value: NumericSignValidators.Value): NumericSignValidators {
    return value instanceof NumericSignValidators ? value : new NumericSignValidators(value);
  }
  #validate(data: NumericSignValidators.Value | undefined) {
    if (data === undefined) return;
    if (!(data.positiveNumber > 0)) {
      throw new ValidationError("positiveNumber", "must be positive", data.positiveNumber, "POSITIVE");
    }
    if (!(data.negativeNumber < 0)) {
      throw new ValidationError("negativeNumber", "must be negative", data.negativeNumber, "NEGATIVE");
    }
    if (!(data.nonNegativeNumber >= 0)) {
      throw new ValidationError("nonNegativeNumber", "must be non-negative", data.nonNegativeNumber, "NON_NEGATIVE");
    }
    if (!(data.nonPositiveNumber <= 0)) {
      throw new ValidationError("nonPositiveNumber", "must be non-positive", data.nonPositiveNumber, "NON_POSITIVE");
    }
  }
  static validateAll(data: NumericSignValidators.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {
      if (!(data.positiveNumber > 0)) {
        throw new ValidationError("positiveNumber", "must be positive", data.positiveNumber, "POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.negativeNumber < 0)) {
        throw new ValidationError("negativeNumber", "must be negative", data.negativeNumber, "NEGATIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.nonNegativeNumber >= 0)) {
        throw new ValidationError("nonNegativeNumber", "must be non-negative", data.nonNegativeNumber, "NON_NEGATIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.nonPositiveNumber <= 0)) {
        throw new ValidationError("nonPositiveNumber", "must be non-positive", data.nonPositiveNumber, "NON_POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof NumericSignValidators>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for NumericSignValidators.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected NumericSignValidators.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get positiveNumber(): Positive<number> {
    return this.#positiveNumber;
  }
  get negativeNumber(): Negative<number> {
    return this.#negativeNumber;
  }
  get nonNegativeNumber(): NonNegative<number> {
    return this.#nonNegativeNumber;
  }
  get nonPositiveNumber(): NonPositive<number> {
    return this.#nonPositiveNumber;
  }
  set(updates: Partial<SetUpdates<NumericSignValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof NumericSignValidators)(data) as this);
  }
  setNegativeNumber(value: Negative<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: this.#positiveNumber as Positive<number>,
      negativeNumber: value as Negative<number>,
      nonNegativeNumber: this.#nonNegativeNumber as NonNegative<number>,
      nonPositiveNumber: this.#nonPositiveNumber as NonPositive<number>
    }) as this);
  }
  setNonNegativeNumber(value: NonNegative<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: this.#positiveNumber as Positive<number>,
      negativeNumber: this.#negativeNumber as Negative<number>,
      nonNegativeNumber: value as NonNegative<number>,
      nonPositiveNumber: this.#nonPositiveNumber as NonPositive<number>
    }) as this);
  }
  setNonPositiveNumber(value: NonPositive<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: this.#positiveNumber as Positive<number>,
      negativeNumber: this.#negativeNumber as Negative<number>,
      nonNegativeNumber: this.#nonNegativeNumber as NonNegative<number>,
      nonPositiveNumber: value as NonPositive<number>
    }) as this);
  }
  setPositiveNumber(value: Positive<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: value as Positive<number>,
      negativeNumber: this.#negativeNumber as Negative<number>,
      nonNegativeNumber: this.#nonNegativeNumber as NonNegative<number>,
      nonPositiveNumber: this.#nonPositiveNumber as NonPositive<number>
    }) as this);
  }
}
export namespace NumericSignValidators {
  export type Data = {
    positiveNumber: Positive<number>;
    negativeNumber: Negative<number>;
    nonNegativeNumber: NonNegative<number>;
    nonPositiveNumber: NonPositive<number>;
  };
  export type Value = NumericSignValidators | NumericSignValidators.Data;
} // Test: Numeric bound validators
const TYPE_TAG_NumericBoundValidators = Symbol("NumericBoundValidators");
export class NumericBoundValidators extends Message<NumericBoundValidators.Data> {
  static $typeId = "tests/validators.pmsg#NumericBoundValidators";
  static $typeHash = "sha256:3a16c8065527929137fd1b12ff9f0b2b4de5df772d47a699f363e97f1525095e";
  static $instanceTag = Symbol.for("propane:message:" + NumericBoundValidators.$typeId);
  static readonly $typeName = "NumericBoundValidators";
  static EMPTY: NumericBoundValidators;
  #minValue!: Min<number, 0>;
  #maxValue!: Max<number, 100>;
  #rangeValue!: Range<number, 0, 100>;
  constructor(props?: NumericBoundValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && NumericBoundValidators.EMPTY) return NumericBoundValidators.EMPTY;
    super(TYPE_TAG_NumericBoundValidators, "NumericBoundValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#minValue = (props ? props.minValue : undefined) as Min<number, 0>;
    this.#maxValue = (props ? props.maxValue : undefined) as Max<number, 100>;
    this.#rangeValue = (props ? props.rangeValue : undefined) as Range<number, 0, 100>;
    if (!props) NumericBoundValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumericBoundValidators.Data>[] {
    return [{
      name: "minValue",
      fieldNumber: 1,
      getValue: () => this.#minValue as Min<number, 0>
    }, {
      name: "maxValue",
      fieldNumber: 2,
      getValue: () => this.#maxValue as Max<number, 100>
    }, {
      name: "rangeValue",
      fieldNumber: 3,
      getValue: () => this.#rangeValue as Range<number, 0, 100>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): NumericBoundValidators.Data {
    const props = {} as Partial<NumericBoundValidators.Data>;
    const minValueValue = entries["1"] === undefined ? entries["minValue"] : entries["1"];
    if (minValueValue === undefined) throw new Error("Missing required property \"minValue\".");
    props.minValue = minValueValue as Min<number, 0>;
    const maxValueValue = entries["2"] === undefined ? entries["maxValue"] : entries["2"];
    if (maxValueValue === undefined) throw new Error("Missing required property \"maxValue\".");
    props.maxValue = maxValueValue as Max<number, 100>;
    const rangeValueValue = entries["3"] === undefined ? entries["rangeValue"] : entries["3"];
    if (rangeValueValue === undefined) throw new Error("Missing required property \"rangeValue\".");
    props.rangeValue = rangeValueValue as Range<number, 0, 100>;
    return props as NumericBoundValidators.Data;
  }
  static from(value: NumericBoundValidators.Value): NumericBoundValidators {
    return value instanceof NumericBoundValidators ? value : new NumericBoundValidators(value);
  }
  #validate(data: NumericBoundValidators.Value | undefined) {
    if (data === undefined) return;
    if (!(data.minValue >= 0)) {
      throw new ValidationError("minValue", "must be at least 0", data.minValue, "MIN");
    }
    if (!(data.maxValue <= 100)) {
      throw new ValidationError("maxValue", "must be at most 100", data.maxValue, "MAX");
    }
    if (!(data.rangeValue >= 0 && data.rangeValue <= 100)) {
      throw new ValidationError("rangeValue", "must be between 0 and 100", data.rangeValue, "RANGE");
    }
  }
  static validateAll(data: NumericBoundValidators.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {
      if (!(data.minValue >= 0)) {
        throw new ValidationError("minValue", "must be at least 0", data.minValue, "MIN");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.maxValue <= 100)) {
        throw new ValidationError("maxValue", "must be at most 100", data.maxValue, "MAX");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.rangeValue >= 0 && data.rangeValue <= 100)) {
        throw new ValidationError("rangeValue", "must be between 0 and 100", data.rangeValue, "RANGE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof NumericBoundValidators>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for NumericBoundValidators.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected NumericBoundValidators.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get minValue(): Min<number, 0> {
    return this.#minValue;
  }
  get maxValue(): Max<number, 100> {
    return this.#maxValue;
  }
  get rangeValue(): Range<number, 0, 100> {
    return this.#rangeValue;
  }
  set(updates: Partial<SetUpdates<NumericBoundValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof NumericBoundValidators)(data) as this);
  }
  setMaxValue(value: Max<number, 100>) {
    return this.$update(new (this.constructor as typeof NumericBoundValidators)({
      minValue: this.#minValue as Min<number, 0>,
      maxValue: value as Max<number, 100>,
      rangeValue: this.#rangeValue as Range<number, 0, 100>
    }) as this);
  }
  setMinValue(value: Min<number, 0>) {
    return this.$update(new (this.constructor as typeof NumericBoundValidators)({
      minValue: value as Min<number, 0>,
      maxValue: this.#maxValue as Max<number, 100>,
      rangeValue: this.#rangeValue as Range<number, 0, 100>
    }) as this);
  }
  setRangeValue(value: Range<number, 0, 100>) {
    return this.$update(new (this.constructor as typeof NumericBoundValidators)({
      minValue: this.#minValue as Min<number, 0>,
      maxValue: this.#maxValue as Max<number, 100>,
      rangeValue: value as Range<number, 0, 100>
    }) as this);
  }
}
export namespace NumericBoundValidators {
  export type Data = {
    minValue: Min<number, 0>;
    maxValue: Max<number, 100>;
    rangeValue: Range<number, 0, 100>;
  };
  export type Value = NumericBoundValidators | NumericBoundValidators.Data;
} // Test: String validators
// Note: Matches validator not yet implemented in Phase 1A
const TYPE_TAG_StringValidators = Symbol("StringValidators");
export class StringValidators extends Message<StringValidators.Data> {
  static $typeId = "tests/validators.pmsg#StringValidators";
  static $typeHash = "sha256:bf7c767b1141b90b32775818cb7975d9c1eccc137eed46736422b7b16e6fb870";
  static $instanceTag = Symbol.for("propane:message:" + StringValidators.$typeId);
  static readonly $typeName = "StringValidators";
  static EMPTY: StringValidators;
  #nonEmptyString!: NonEmpty<string>;
  #minLengthString!: MinLength<string, 3>;
  #maxLengthString!: MaxLength<string, 100>;
  #exactLengthString!: Length<string, 5, 10>;
  constructor(props?: StringValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && StringValidators.EMPTY) return StringValidators.EMPTY;
    super(TYPE_TAG_StringValidators, "StringValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#nonEmptyString = (props ? props.nonEmptyString : undefined) as NonEmpty<string>;
    this.#minLengthString = (props ? props.minLengthString : undefined) as MinLength<string, 3>;
    this.#maxLengthString = (props ? props.maxLengthString : undefined) as MaxLength<string, 100>;
    this.#exactLengthString = (props ? props.exactLengthString : undefined) as Length<string, 5, 10>;
    if (!props) StringValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<StringValidators.Data>[] {
    return [{
      name: "nonEmptyString",
      fieldNumber: 1,
      getValue: () => this.#nonEmptyString as NonEmpty<string>
    }, {
      name: "minLengthString",
      fieldNumber: 2,
      getValue: () => this.#minLengthString as MinLength<string, 3>
    }, {
      name: "maxLengthString",
      fieldNumber: 3,
      getValue: () => this.#maxLengthString as MaxLength<string, 100>
    }, {
      name: "exactLengthString",
      fieldNumber: 4,
      getValue: () => this.#exactLengthString as Length<string, 5, 10>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): StringValidators.Data {
    const props = {} as Partial<StringValidators.Data>;
    const nonEmptyStringValue = entries["1"] === undefined ? entries["nonEmptyString"] : entries["1"];
    if (nonEmptyStringValue === undefined) throw new Error("Missing required property \"nonEmptyString\".");
    props.nonEmptyString = nonEmptyStringValue as NonEmpty<string>;
    const minLengthStringValue = entries["2"] === undefined ? entries["minLengthString"] : entries["2"];
    if (minLengthStringValue === undefined) throw new Error("Missing required property \"minLengthString\".");
    props.minLengthString = minLengthStringValue as MinLength<string, 3>;
    const maxLengthStringValue = entries["3"] === undefined ? entries["maxLengthString"] : entries["3"];
    if (maxLengthStringValue === undefined) throw new Error("Missing required property \"maxLengthString\".");
    props.maxLengthString = maxLengthStringValue as MaxLength<string, 100>;
    const exactLengthStringValue = entries["4"] === undefined ? entries["exactLengthString"] : entries["4"];
    if (exactLengthStringValue === undefined) throw new Error("Missing required property \"exactLengthString\".");
    props.exactLengthString = exactLengthStringValue as Length<string, 5, 10>;
    return props as StringValidators.Data;
  }
  static from(value: StringValidators.Value): StringValidators {
    return value instanceof StringValidators ? value : new StringValidators(value);
  }
  #validate(data: StringValidators.Value | undefined) {
    if (data === undefined) return;
    if (!(data.nonEmptyString.length > 0)) {
      throw new ValidationError("nonEmptyString", "must not be empty", data.nonEmptyString, "NON_EMPTY");
    }
    if (!(data.minLengthString.length >= 3)) {
      throw new ValidationError("minLengthString", "must have at least 3 elements", data.minLengthString, "MIN_LENGTH");
    }
    if (!(data.maxLengthString.length <= 100)) {
      throw new ValidationError("maxLengthString", "must have at most 100 elements", data.maxLengthString, "MAX_LENGTH");
    }
    if (!(data.exactLengthString.length >= 5 && data.exactLengthString.length <= 10)) {
      throw new ValidationError("exactLengthString", "must have length between 5 and 10", data.exactLengthString, "LENGTH");
    }
  }
  static validateAll(data: StringValidators.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {
      if (!(data.nonEmptyString.length > 0)) {
        throw new ValidationError("nonEmptyString", "must not be empty", data.nonEmptyString, "NON_EMPTY");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.minLengthString.length >= 3)) {
        throw new ValidationError("minLengthString", "must have at least 3 elements", data.minLengthString, "MIN_LENGTH");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.maxLengthString.length <= 100)) {
        throw new ValidationError("maxLengthString", "must have at most 100 elements", data.maxLengthString, "MAX_LENGTH");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.exactLengthString.length >= 5 && data.exactLengthString.length <= 10)) {
        throw new ValidationError("exactLengthString", "must have length between 5 and 10", data.exactLengthString, "LENGTH");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof StringValidators>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for StringValidators.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected StringValidators.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get nonEmptyString(): NonEmpty<string> {
    return this.#nonEmptyString;
  }
  get minLengthString(): MinLength<string, 3> {
    return this.#minLengthString;
  }
  get maxLengthString(): MaxLength<string, 100> {
    return this.#maxLengthString;
  }
  get exactLengthString(): Length<string, 5, 10> {
    return this.#exactLengthString;
  }
  set(updates: Partial<SetUpdates<StringValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof StringValidators)(data) as this);
  }
  setExactLengthString(value: Length<string, 5, 10>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: this.#nonEmptyString as NonEmpty<string>,
      minLengthString: this.#minLengthString as MinLength<string, 3>,
      maxLengthString: this.#maxLengthString as MaxLength<string, 100>,
      exactLengthString: value as Length<string, 5, 10>
    }) as this);
  }
  setMaxLengthString(value: MaxLength<string, 100>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: this.#nonEmptyString as NonEmpty<string>,
      minLengthString: this.#minLengthString as MinLength<string, 3>,
      maxLengthString: value as MaxLength<string, 100>,
      exactLengthString: this.#exactLengthString as Length<string, 5, 10>
    }) as this);
  }
  setMinLengthString(value: MinLength<string, 3>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: this.#nonEmptyString as NonEmpty<string>,
      minLengthString: value as MinLength<string, 3>,
      maxLengthString: this.#maxLengthString as MaxLength<string, 100>,
      exactLengthString: this.#exactLengthString as Length<string, 5, 10>
    }) as this);
  }
  setNonEmptyString(value: NonEmpty<string>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: value as NonEmpty<string>,
      minLengthString: this.#minLengthString as MinLength<string, 3>,
      maxLengthString: this.#maxLengthString as MaxLength<string, 100>,
      exactLengthString: this.#exactLengthString as Length<string, 5, 10>
    }) as this);
  }
}
export namespace StringValidators {
  export type Data = {
    nonEmptyString: NonEmpty<string>;
    minLengthString: MinLength<string, 3>;
    maxLengthString: MaxLength<string, 100>;
    exactLengthString: Length<string, 5, 10>;
  };
  export type Value = StringValidators | StringValidators.Data;
} // Test: Branded type validators
const TYPE_TAG_BrandedValidators = Symbol("BrandedValidators");
export class BrandedValidators extends Message<BrandedValidators.Data> {
  static $typeId = "tests/validators.pmsg#BrandedValidators";
  static $typeHash = "sha256:6310d50bc3ecd5e3bdde152ef3e8a936704da99479b6985d1ed2836abf8927b1";
  static $instanceTag = Symbol.for("propane:message:" + BrandedValidators.$typeId);
  static readonly $typeName = "BrandedValidators";
  static EMPTY: BrandedValidators;
  #positiveInt32!: Positive<int32>;
  #positiveInt53!: Positive<int53>;
  #positiveDecimal!: Positive<Decimal<10, 2>>;
  #minDecimal!: Min<Decimal<10, 2>, "100">;
  #maxDecimal!: Max<Decimal<10, 2>, "1000">;
  #rangeDecimal!: Range<Decimal<10, 2>, "0", "999.99">;
  constructor(props?: BrandedValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && BrandedValidators.EMPTY) return BrandedValidators.EMPTY;
    super(TYPE_TAG_BrandedValidators, "BrandedValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#positiveInt32 = (props ? props.positiveInt32 : undefined) as Positive<int32>;
    this.#positiveInt53 = (props ? props.positiveInt53 : undefined) as Positive<int53>;
    this.#positiveDecimal = (props ? props.positiveDecimal : undefined) as Positive<Decimal<10, 2>>;
    this.#minDecimal = (props ? props.minDecimal : undefined) as Min<Decimal<10, 2>, "100">;
    this.#maxDecimal = (props ? props.maxDecimal : undefined) as Max<Decimal<10, 2>, "1000">;
    this.#rangeDecimal = (props ? props.rangeDecimal : undefined) as Range<Decimal<10, 2>, "0", "999.99">;
    if (!props) BrandedValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<BrandedValidators.Data>[] {
    return [{
      name: "positiveInt32",
      fieldNumber: 1,
      getValue: () => this.#positiveInt32 as Positive<int32> | Positive<int32>
    }, {
      name: "positiveInt53",
      fieldNumber: 2,
      getValue: () => this.#positiveInt53 as Positive<int53> | Positive<int53>
    }, {
      name: "positiveDecimal",
      fieldNumber: 3,
      getValue: () => this.#positiveDecimal as Positive<Decimal<10, 2>>
    }, {
      name: "minDecimal",
      fieldNumber: 4,
      getValue: () => this.#minDecimal as Min<Decimal<10, 2>, "100">
    }, {
      name: "maxDecimal",
      fieldNumber: 5,
      getValue: () => this.#maxDecimal as Max<Decimal<10, 2>, "1000">
    }, {
      name: "rangeDecimal",
      fieldNumber: 6,
      getValue: () => this.#rangeDecimal as Range<Decimal<10, 2>, "0", "999.99">
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): BrandedValidators.Data {
    const props = {} as Partial<BrandedValidators.Data>;
    const positiveInt32Value = entries["1"] === undefined ? entries["positiveInt32"] : entries["1"];
    if (positiveInt32Value === undefined) throw new Error("Missing required property \"positiveInt32\".");
    props.positiveInt32 = positiveInt32Value as Positive<int32>;
    const positiveInt53Value = entries["2"] === undefined ? entries["positiveInt53"] : entries["2"];
    if (positiveInt53Value === undefined) throw new Error("Missing required property \"positiveInt53\".");
    props.positiveInt53 = positiveInt53Value as Positive<int53>;
    const positiveDecimalValue = entries["3"] === undefined ? entries["positiveDecimal"] : entries["3"];
    if (positiveDecimalValue === undefined) throw new Error("Missing required property \"positiveDecimal\".");
    props.positiveDecimal = positiveDecimalValue as Positive<Decimal<10, 2>>;
    const minDecimalValue = entries["4"] === undefined ? entries["minDecimal"] : entries["4"];
    if (minDecimalValue === undefined) throw new Error("Missing required property \"minDecimal\".");
    props.minDecimal = minDecimalValue as Min<Decimal<10, 2>, "100">;
    const maxDecimalValue = entries["5"] === undefined ? entries["maxDecimal"] : entries["5"];
    if (maxDecimalValue === undefined) throw new Error("Missing required property \"maxDecimal\".");
    props.maxDecimal = maxDecimalValue as Max<Decimal<10, 2>, "1000">;
    const rangeDecimalValue = entries["6"] === undefined ? entries["rangeDecimal"] : entries["6"];
    if (rangeDecimalValue === undefined) throw new Error("Missing required property \"rangeDecimal\".");
    props.rangeDecimal = rangeDecimalValue as Range<Decimal<10, 2>, "0", "999.99">;
    return props as BrandedValidators.Data;
  }
  static from(value: BrandedValidators.Value): BrandedValidators {
    return value instanceof BrandedValidators ? value : new BrandedValidators(value);
  }
  #validate(data: BrandedValidators.Value | undefined) {
    if (data === undefined) return;
    if (!(isInt32(data.positiveInt32))) {
      throw new ValidationError("positiveInt32", "must be a 32-bit integer", data.positiveInt32, "INT32");
    }
    if (!(isPositive(data.positiveInt32))) {
      throw new ValidationError("positiveInt32", "must be positive", data.positiveInt32, "POSITIVE");
    }
    if (!(isInt53(data.positiveInt53))) {
      throw new ValidationError("positiveInt53", "must be a safe integer (int53)", data.positiveInt53, "INT53");
    }
    if (!(isPositive(data.positiveInt53))) {
      throw new ValidationError("positiveInt53", "must be positive", data.positiveInt53, "POSITIVE");
    }
    if (!(isDecimalOf(data.positiveDecimal, 10, 2))) {
      throw new ValidationError("positiveDecimal", "must be a valid Decimal(10,2)", data.positiveDecimal, "DECIMAL");
    }
    if (!(isPositive(data.positiveDecimal))) {
      throw new ValidationError("positiveDecimal", "must be positive", data.positiveDecimal, "POSITIVE");
    }
    if (!(isDecimalOf(data.minDecimal, 10, 2))) {
      throw new ValidationError("minDecimal", "must be a valid Decimal(10,2)", data.minDecimal, "DECIMAL");
    }
    if (!(greaterThanOrEqual(data.minDecimal, Decimal.fromStrictString(10, 2, "100.00")))) {
      throw new ValidationError("minDecimal", "must be at least 100.00", data.minDecimal, "MIN");
    }
    if (!(isDecimalOf(data.maxDecimal, 10, 2))) {
      throw new ValidationError("maxDecimal", "must be a valid Decimal(10,2)", data.maxDecimal, "DECIMAL");
    }
    if (!(lessThanOrEqual(data.maxDecimal, Decimal.fromStrictString(10, 2, "1000.00")))) {
      throw new ValidationError("maxDecimal", "must be at most 1000.00", data.maxDecimal, "MAX");
    }
    if (!(isDecimalOf(data.rangeDecimal, 10, 2))) {
      throw new ValidationError("rangeDecimal", "must be a valid Decimal(10,2)", data.rangeDecimal, "DECIMAL");
    }
    if (!(inRange(data.rangeDecimal, Decimal.fromStrictString(10, 2, "0.00"), Decimal.fromStrictString(10, 2, "999.99")))) {
      throw new ValidationError("rangeDecimal", "must be between 0.00 and 999.99", data.rangeDecimal, "RANGE");
    }
  }
  static validateAll(data: BrandedValidators.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {
      if (!(isInt32(data.positiveInt32))) {
        throw new ValidationError("positiveInt32", "must be a 32-bit integer", data.positiveInt32, "INT32");
      }
      if (!(isPositive(data.positiveInt32))) {
        throw new ValidationError("positiveInt32", "must be positive", data.positiveInt32, "POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(isInt53(data.positiveInt53))) {
        throw new ValidationError("positiveInt53", "must be a safe integer (int53)", data.positiveInt53, "INT53");
      }
      if (!(isPositive(data.positiveInt53))) {
        throw new ValidationError("positiveInt53", "must be positive", data.positiveInt53, "POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(isDecimalOf(data.positiveDecimal, 10, 2))) {
        throw new ValidationError("positiveDecimal", "must be a valid Decimal(10,2)", data.positiveDecimal, "DECIMAL");
      }
      if (!(isPositive(data.positiveDecimal))) {
        throw new ValidationError("positiveDecimal", "must be positive", data.positiveDecimal, "POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(isDecimalOf(data.minDecimal, 10, 2))) {
        throw new ValidationError("minDecimal", "must be a valid Decimal(10,2)", data.minDecimal, "DECIMAL");
      }
      if (!(greaterThanOrEqual(data.minDecimal, Decimal.fromStrictString(10, 2, "100.00")))) {
        throw new ValidationError("minDecimal", "must be at least 100.00", data.minDecimal, "MIN");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(isDecimalOf(data.maxDecimal, 10, 2))) {
        throw new ValidationError("maxDecimal", "must be a valid Decimal(10,2)", data.maxDecimal, "DECIMAL");
      }
      if (!(lessThanOrEqual(data.maxDecimal, Decimal.fromStrictString(10, 2, "1000.00")))) {
        throw new ValidationError("maxDecimal", "must be at most 1000.00", data.maxDecimal, "MAX");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(isDecimalOf(data.rangeDecimal, 10, 2))) {
        throw new ValidationError("rangeDecimal", "must be a valid Decimal(10,2)", data.rangeDecimal, "DECIMAL");
      }
      if (!(inRange(data.rangeDecimal, Decimal.fromStrictString(10, 2, "0.00"), Decimal.fromStrictString(10, 2, "999.99")))) {
        throw new ValidationError("rangeDecimal", "must be between 0.00 and 999.99", data.rangeDecimal, "RANGE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof BrandedValidators>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for BrandedValidators.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected BrandedValidators.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get positiveInt32(): Positive<int32> {
    return this.#positiveInt32;
  }
  get positiveInt53(): Positive<int53> {
    return this.#positiveInt53;
  }
  get positiveDecimal(): Positive<Decimal<10, 2>> {
    return this.#positiveDecimal;
  }
  get minDecimal(): Min<Decimal<10, 2>, "100"> {
    return this.#minDecimal;
  }
  get maxDecimal(): Max<Decimal<10, 2>, "1000"> {
    return this.#maxDecimal;
  }
  get rangeDecimal(): Range<Decimal<10, 2>, "0", "999.99"> {
    return this.#rangeDecimal;
  }
  set(updates: Partial<SetUpdates<BrandedValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof BrandedValidators)(data) as this);
  }
  setMaxDecimal(value: Max<Decimal<10, 2>, "1000">) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32 as Positive<int32> | Positive<int32>,
      positiveInt53: this.#positiveInt53 as Positive<int53> | Positive<int53>,
      positiveDecimal: this.#positiveDecimal as Positive<Decimal<10, 2>>,
      minDecimal: this.#minDecimal as Min<Decimal<10, 2>, "100">,
      maxDecimal: value as Max<Decimal<10, 2>, "1000">,
      rangeDecimal: this.#rangeDecimal as Range<Decimal<10, 2>, "0", "999.99">
    }) as this);
  }
  setMinDecimal(value: Min<Decimal<10, 2>, "100">) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32 as Positive<int32> | Positive<int32>,
      positiveInt53: this.#positiveInt53 as Positive<int53> | Positive<int53>,
      positiveDecimal: this.#positiveDecimal as Positive<Decimal<10, 2>>,
      minDecimal: value as Min<Decimal<10, 2>, "100">,
      maxDecimal: this.#maxDecimal as Max<Decimal<10, 2>, "1000">,
      rangeDecimal: this.#rangeDecimal as Range<Decimal<10, 2>, "0", "999.99">
    }) as this);
  }
  setPositiveDecimal(value: Positive<Decimal<10, 2>>) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32 as Positive<int32> | Positive<int32>,
      positiveInt53: this.#positiveInt53 as Positive<int53> | Positive<int53>,
      positiveDecimal: value as Positive<Decimal<10, 2>>,
      minDecimal: this.#minDecimal as Min<Decimal<10, 2>, "100">,
      maxDecimal: this.#maxDecimal as Max<Decimal<10, 2>, "1000">,
      rangeDecimal: this.#rangeDecimal as Range<Decimal<10, 2>, "0", "999.99">
    }) as this);
  }
  setPositiveInt32(value: Positive<int32> | Positive<int32>) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: value as Positive<int32> | Positive<int32>,
      positiveInt53: this.#positiveInt53 as Positive<int53> | Positive<int53>,
      positiveDecimal: this.#positiveDecimal as Positive<Decimal<10, 2>>,
      minDecimal: this.#minDecimal as Min<Decimal<10, 2>, "100">,
      maxDecimal: this.#maxDecimal as Max<Decimal<10, 2>, "1000">,
      rangeDecimal: this.#rangeDecimal as Range<Decimal<10, 2>, "0", "999.99">
    }) as this);
  }
  setPositiveInt53(value: Positive<int53> | Positive<int53>) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32 as Positive<int32> | Positive<int32>,
      positiveInt53: value as Positive<int53> | Positive<int53>,
      positiveDecimal: this.#positiveDecimal as Positive<Decimal<10, 2>>,
      minDecimal: this.#minDecimal as Min<Decimal<10, 2>, "100">,
      maxDecimal: this.#maxDecimal as Max<Decimal<10, 2>, "1000">,
      rangeDecimal: this.#rangeDecimal as Range<Decimal<10, 2>, "0", "999.99">
    }) as this);
  }
  setRangeDecimal(value: Range<Decimal<10, 2>, "0", "999.99">) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32 as Positive<int32> | Positive<int32>,
      positiveInt53: this.#positiveInt53 as Positive<int53> | Positive<int53>,
      positiveDecimal: this.#positiveDecimal as Positive<Decimal<10, 2>>,
      minDecimal: this.#minDecimal as Min<Decimal<10, 2>, "100">,
      maxDecimal: this.#maxDecimal as Max<Decimal<10, 2>, "1000">,
      rangeDecimal: value as Range<Decimal<10, 2>, "0", "999.99">
    }) as this);
  }
}
export namespace BrandedValidators {
  export type Data = {
    positiveInt32: Positive<int32> | Positive<int32>;
    positiveInt53: Positive<int53> | Positive<int53>;
    positiveDecimal: Positive<Decimal<10, 2>>;
    minDecimal: Min<Decimal<10, 2>, "100">;
    maxDecimal: Max<Decimal<10, 2>, "1000">;
    rangeDecimal: Range<Decimal<10, 2>, "0", "999.99">;
  };
  export type Value = BrandedValidators | BrandedValidators.Data;
} // Test: Optional validated fields
const TYPE_TAG_OptionalValidators = Symbol("OptionalValidators");
export class OptionalValidators extends Message<OptionalValidators.Data> {
  static $typeId = "tests/validators.pmsg#OptionalValidators";
  static $typeHash = "sha256:76a7787fc4e985aef504dd49cbbaedce634446db44752851afd09601f2cc0d55";
  static $instanceTag = Symbol.for("propane:message:" + OptionalValidators.$typeId);
  static readonly $typeName = "OptionalValidators";
  static EMPTY: OptionalValidators;
  #requiredPositive!: Positive<number>;
  #optionalPositive!: Positive<number> | undefined;
  #nullablePositive!: Positive<number> | null;
  #optionalNullablePositive!: Positive<number> | null | undefined;
  constructor(props?: OptionalValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && OptionalValidators.EMPTY) return OptionalValidators.EMPTY;
    super(TYPE_TAG_OptionalValidators, "OptionalValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#requiredPositive = (props ? props.requiredPositive : undefined) as Positive<number>;
    this.#optionalPositive = (props ? props.optionalPositive : undefined) as Positive<number>;
    this.#nullablePositive = (props ? props.nullablePositive : undefined) as Positive<number> | null;
    this.#optionalNullablePositive = (props ? props.optionalNullablePositive : undefined) as Positive<number> | null;
    if (!props) OptionalValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OptionalValidators.Data>[] {
    return [{
      name: "requiredPositive",
      fieldNumber: 1,
      getValue: () => this.#requiredPositive as Positive<number>
    }, {
      name: "optionalPositive",
      fieldNumber: 2,
      getValue: () => this.#optionalPositive as Positive<number>
    }, {
      name: "nullablePositive",
      fieldNumber: 3,
      getValue: () => this.#nullablePositive as Positive<number> | null
    }, {
      name: "optionalNullablePositive",
      fieldNumber: 4,
      getValue: () => this.#optionalNullablePositive as Positive<number> | null
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): OptionalValidators.Data {
    const props = {} as Partial<OptionalValidators.Data>;
    const requiredPositiveValue = entries["1"] === undefined ? entries["requiredPositive"] : entries["1"];
    if (requiredPositiveValue === undefined) throw new Error("Missing required property \"requiredPositive\".");
    props.requiredPositive = requiredPositiveValue as Positive<number>;
    const optionalPositiveValue = entries["2"] === undefined ? entries["optionalPositive"] : entries["2"];
    const optionalPositiveNormalized = optionalPositiveValue === null ? undefined : optionalPositiveValue;
    props.optionalPositive = optionalPositiveNormalized as Positive<number>;
    const nullablePositiveValue = entries["3"] === undefined ? entries["nullablePositive"] : entries["3"];
    if (nullablePositiveValue === undefined) throw new Error("Missing required property \"nullablePositive\".");
    if (!(nullablePositiveValue === null)) throw new Error("Invalid value for property \"nullablePositive\".");
    props.nullablePositive = nullablePositiveValue as Positive<number> | null;
    const optionalNullablePositiveValue = entries["4"] === undefined ? entries["optionalNullablePositive"] : entries["4"];
    if (optionalNullablePositiveValue !== undefined && !(optionalNullablePositiveValue === null)) throw new Error("Invalid value for property \"optionalNullablePositive\".");
    props.optionalNullablePositive = optionalNullablePositiveValue as Positive<number> | null;
    return props as OptionalValidators.Data;
  }
  static from(value: OptionalValidators.Value): OptionalValidators {
    return value instanceof OptionalValidators ? value : new OptionalValidators(value);
  }
  #validate(data: OptionalValidators.Value | undefined) {
    if (data === undefined) return;
    if (!(data.requiredPositive > 0)) {
      throw new ValidationError("requiredPositive", "must be positive", data.requiredPositive, "POSITIVE");
    }
    if (data.optionalPositive != null) {
      if (!(data.optionalPositive > 0)) {
        throw new ValidationError("optionalPositive", "must be positive", data.optionalPositive, "POSITIVE");
      }
    }
    if (data.nullablePositive != null) {
      if (!(data.nullablePositive > 0)) {
        throw new ValidationError("nullablePositive", "must be positive", data.nullablePositive, "POSITIVE");
      }
    }
    if (data.optionalNullablePositive != null) {
      if (!(data.optionalNullablePositive > 0)) {
        throw new ValidationError("optionalNullablePositive", "must be positive", data.optionalNullablePositive, "POSITIVE");
      }
    }
  }
  static validateAll(data: OptionalValidators.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {
      if (!(data.requiredPositive > 0)) {
        throw new ValidationError("requiredPositive", "must be positive", data.requiredPositive, "POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (data.optionalPositive != null) {
        if (!(data.optionalPositive > 0)) {
          throw new ValidationError("optionalPositive", "must be positive", data.optionalPositive, "POSITIVE");
        }
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (data.nullablePositive != null) {
        if (!(data.nullablePositive > 0)) {
          throw new ValidationError("nullablePositive", "must be positive", data.nullablePositive, "POSITIVE");
        }
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (data.optionalNullablePositive != null) {
        if (!(data.optionalNullablePositive > 0)) {
          throw new ValidationError("optionalNullablePositive", "must be positive", data.optionalNullablePositive, "POSITIVE");
        }
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof OptionalValidators>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for OptionalValidators.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected OptionalValidators.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get requiredPositive(): Positive<number> {
    return this.#requiredPositive;
  }
  get optionalPositive(): Positive<number> | undefined {
    return this.#optionalPositive;
  }
  get nullablePositive(): Positive<number> | null {
    return this.#nullablePositive;
  }
  get optionalNullablePositive(): Positive<number> | null | undefined {
    return this.#optionalNullablePositive;
  }
  set(updates: Partial<SetUpdates<OptionalValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof OptionalValidators)(data) as this);
  }
  setNullablePositive(value: Positive<number> | null) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive as Positive<number>,
      optionalPositive: this.#optionalPositive as Positive<number>,
      nullablePositive: value as Positive<number> | null,
      optionalNullablePositive: this.#optionalNullablePositive as Positive<number> | null
    }) as this);
  }
  setOptionalNullablePositive(value: Positive<number> | null | undefined) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive as Positive<number>,
      optionalPositive: this.#optionalPositive as Positive<number>,
      nullablePositive: this.#nullablePositive as Positive<number> | null,
      optionalNullablePositive: value as Positive<number> | null
    }) as this);
  }
  setOptionalPositive(value: Positive<number> | undefined) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive as Positive<number>,
      optionalPositive: value as Positive<number>,
      nullablePositive: this.#nullablePositive as Positive<number> | null,
      optionalNullablePositive: this.#optionalNullablePositive as Positive<number> | null
    }) as this);
  }
  setRequiredPositive(value: Positive<number>) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: value as Positive<number>,
      optionalPositive: this.#optionalPositive as Positive<number>,
      nullablePositive: this.#nullablePositive as Positive<number> | null,
      optionalNullablePositive: this.#optionalNullablePositive as Positive<number> | null
    }) as this);
  }
  unsetOptionalNullablePositive() {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive as Positive<number>,
      optionalPositive: this.#optionalPositive as Positive<number>,
      nullablePositive: this.#nullablePositive as Positive<number> | null
    }) as this);
  }
  unsetOptionalPositive() {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive as Positive<number>,
      nullablePositive: this.#nullablePositive as Positive<number> | null,
      optionalNullablePositive: this.#optionalNullablePositive as Positive<number> | null
    }) as this);
  }
}
export namespace OptionalValidators {
  export type Data = {
    requiredPositive: Positive<number>;
    optionalPositive?: Positive<number> | undefined;
    nullablePositive: Positive<number> | null;
    optionalNullablePositive?: Positive<number> | null | undefined;
  };
  export type Value = OptionalValidators | OptionalValidators.Data;
} // Test: Array validators
const TYPE_TAG_ArrayValidators = Symbol("ArrayValidators");
export class ArrayValidators extends Message<ArrayValidators.Data> {
  static $typeId = "tests/validators.pmsg#ArrayValidators";
  static $typeHash = "sha256:173dbbb54086d56eb389666b3c11a5b845160b8fb638e1022c9b86b26c393397";
  static $instanceTag = Symbol.for("propane:message:" + ArrayValidators.$typeId);
  static readonly $typeName = "ArrayValidators";
  static EMPTY: ArrayValidators;
  #nonEmptyArray!: NonEmpty<ImmutableArray<string>>;
  #minLengthArray!: MinLength<ImmutableArray<number>, 1>;
  #maxLengthArray!: MaxLength<ImmutableArray<number>, 10>;
  constructor(props?: ArrayValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ArrayValidators.EMPTY) return ArrayValidators.EMPTY;
    super(TYPE_TAG_ArrayValidators, "ArrayValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#nonEmptyArray = (props ? props.nonEmptyArray : undefined) as NonEmpty<ImmutableArray<string>>;
    this.#minLengthArray = (props ? props.minLengthArray : undefined) as MinLength<ImmutableArray<number>, 1>;
    this.#maxLengthArray = (props ? props.maxLengthArray : undefined) as MaxLength<ImmutableArray<number>, 10>;
    if (!props) ArrayValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayValidators.Data>[] {
    return [{
      name: "nonEmptyArray",
      fieldNumber: 1,
      getValue: () => this.#nonEmptyArray as NonEmpty<string[]> | NonEmpty<ImmutableArray<string>>
    }, {
      name: "minLengthArray",
      fieldNumber: 2,
      getValue: () => this.#minLengthArray as MinLength<number[], 1> | MinLength<ImmutableArray<number>, 1>
    }, {
      name: "maxLengthArray",
      fieldNumber: 3,
      getValue: () => this.#maxLengthArray as MaxLength<number[], 10> | MaxLength<ImmutableArray<number>, 10>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ArrayValidators.Data {
    const props = {} as Partial<ArrayValidators.Data>;
    const nonEmptyArrayValue = entries["1"] === undefined ? entries["nonEmptyArray"] : entries["1"];
    if (nonEmptyArrayValue === undefined) throw new Error("Missing required property \"nonEmptyArray\".");
    props.nonEmptyArray = nonEmptyArrayValue as NonEmpty<ImmutableArray<string>>;
    const minLengthArrayValue = entries["2"] === undefined ? entries["minLengthArray"] : entries["2"];
    if (minLengthArrayValue === undefined) throw new Error("Missing required property \"minLengthArray\".");
    props.minLengthArray = minLengthArrayValue as MinLength<ImmutableArray<number>, 1>;
    const maxLengthArrayValue = entries["3"] === undefined ? entries["maxLengthArray"] : entries["3"];
    if (maxLengthArrayValue === undefined) throw new Error("Missing required property \"maxLengthArray\".");
    props.maxLengthArray = maxLengthArrayValue as MaxLength<ImmutableArray<number>, 10>;
    return props as ArrayValidators.Data;
  }
  static from(value: ArrayValidators.Value): ArrayValidators {
    return value instanceof ArrayValidators ? value : new ArrayValidators(value);
  }
  #validate(data: ArrayValidators.Value | undefined) {
    if (data === undefined) return;
    if (!(data.nonEmptyArray.length > 0)) {
      throw new ValidationError("nonEmptyArray", "must not be empty", data.nonEmptyArray, "NON_EMPTY");
    }
    if (!(data.minLengthArray.length >= 1)) {
      throw new ValidationError("minLengthArray", "must have at least 1 element", data.minLengthArray, "MIN_LENGTH");
    }
    if (!(data.maxLengthArray.length <= 10)) {
      throw new ValidationError("maxLengthArray", "must have at most 10 elements", data.maxLengthArray, "MAX_LENGTH");
    }
  }
  static validateAll(data: ArrayValidators.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {
      if (!(data.nonEmptyArray.length > 0)) {
        throw new ValidationError("nonEmptyArray", "must not be empty", data.nonEmptyArray, "NON_EMPTY");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.minLengthArray.length >= 1)) {
        throw new ValidationError("minLengthArray", "must have at least 1 element", data.minLengthArray, "MIN_LENGTH");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.maxLengthArray.length <= 10)) {
        throw new ValidationError("maxLengthArray", "must have at most 10 elements", data.maxLengthArray, "MAX_LENGTH");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof ArrayValidators>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for ArrayValidators.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ArrayValidators.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get nonEmptyArray(): NonEmpty<ImmutableArray<string>> {
    return this.#nonEmptyArray;
  }
  get minLengthArray(): MinLength<ImmutableArray<number>, 1> {
    return this.#minLengthArray;
  }
  get maxLengthArray(): MaxLength<ImmutableArray<number>, 10> {
    return this.#maxLengthArray;
  }
  set(updates: Partial<SetUpdates<ArrayValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ArrayValidators)(data) as this);
  }
  setMaxLengthArray(value: MaxLength<number[], 10> | MaxLength<ImmutableArray<number>, 10>) {
    return this.$update(new (this.constructor as typeof ArrayValidators)({
      nonEmptyArray: this.#nonEmptyArray as NonEmpty<string[]> | NonEmpty<ImmutableArray<string>>,
      minLengthArray: this.#minLengthArray as MinLength<number[], 1> | MinLength<ImmutableArray<number>, 1>,
      maxLengthArray: value as MaxLength<number[], 10> | MaxLength<ImmutableArray<number>, 10>
    }) as this);
  }
  setMinLengthArray(value: MinLength<number[], 1> | MinLength<ImmutableArray<number>, 1>) {
    return this.$update(new (this.constructor as typeof ArrayValidators)({
      nonEmptyArray: this.#nonEmptyArray as NonEmpty<string[]> | NonEmpty<ImmutableArray<string>>,
      minLengthArray: value as MinLength<number[], 1> | MinLength<ImmutableArray<number>, 1>,
      maxLengthArray: this.#maxLengthArray as MaxLength<number[], 10> | MaxLength<ImmutableArray<number>, 10>
    }) as this);
  }
  setNonEmptyArray(value: NonEmpty<string[]> | NonEmpty<ImmutableArray<string>>) {
    return this.$update(new (this.constructor as typeof ArrayValidators)({
      nonEmptyArray: value as NonEmpty<string[]> | NonEmpty<ImmutableArray<string>>,
      minLengthArray: this.#minLengthArray as MinLength<number[], 1> | MinLength<ImmutableArray<number>, 1>,
      maxLengthArray: this.#maxLengthArray as MaxLength<number[], 10> | MaxLength<ImmutableArray<number>, 10>
    }) as this);
  }
}
export namespace ArrayValidators {
  export type Data = {
    nonEmptyArray: NonEmpty<string[]> | NonEmpty<ImmutableArray<string>>;
    minLengthArray: MinLength<number[], 1> | MinLength<ImmutableArray<number>, 1>;
    maxLengthArray: MaxLength<number[], 10> | MaxLength<ImmutableArray<number>, 10>;
  };
  export type Value = ArrayValidators | ArrayValidators.Data;
} // Test: Bigint validators
const TYPE_TAG_BigintValidators = Symbol("BigintValidators");
export class BigintValidators extends Message<BigintValidators.Data> {
  static $typeId = "tests/validators.pmsg#BigintValidators";
  static $typeHash = "sha256:b15d323179bfdef32e19112896fc3a54cf6b079e8a81fe73817135ed5504ff01";
  static $instanceTag = Symbol.for("propane:message:" + BigintValidators.$typeId);
  static readonly $typeName = "BigintValidators";
  static EMPTY: BigintValidators;
  #positiveBigint!: Positive<bigint>;
  #minBigint!: Min<bigint, 0n>;
  #maxBigint!: Max<bigint, 1000000n>;
  #rangeBigint!: Range<bigint, 0n, 100n>;
  constructor(props?: BigintValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && BigintValidators.EMPTY) return BigintValidators.EMPTY;
    super(TYPE_TAG_BigintValidators, "BigintValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#positiveBigint = (props ? props.positiveBigint : undefined) as Positive<bigint>;
    this.#minBigint = (props ? props.minBigint : undefined) as Min<bigint, 0n>;
    this.#maxBigint = (props ? props.maxBigint : undefined) as Max<bigint, 1000000n>;
    this.#rangeBigint = (props ? props.rangeBigint : undefined) as Range<bigint, 0n, 100n>;
    if (!props) BigintValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<BigintValidators.Data>[] {
    return [{
      name: "positiveBigint",
      fieldNumber: 1,
      getValue: () => this.#positiveBigint as Positive<bigint>
    }, {
      name: "minBigint",
      fieldNumber: 2,
      getValue: () => this.#minBigint as Min<bigint, 0n>
    }, {
      name: "maxBigint",
      fieldNumber: 3,
      getValue: () => this.#maxBigint as Max<bigint, 1000000n>
    }, {
      name: "rangeBigint",
      fieldNumber: 4,
      getValue: () => this.#rangeBigint as Range<bigint, 0n, 100n>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): BigintValidators.Data {
    const props = {} as Partial<BigintValidators.Data>;
    const positiveBigintValue = entries["1"] === undefined ? entries["positiveBigint"] : entries["1"];
    if (positiveBigintValue === undefined) throw new Error("Missing required property \"positiveBigint\".");
    props.positiveBigint = positiveBigintValue as Positive<bigint>;
    const minBigintValue = entries["2"] === undefined ? entries["minBigint"] : entries["2"];
    if (minBigintValue === undefined) throw new Error("Missing required property \"minBigint\".");
    props.minBigint = minBigintValue as Min<bigint, 0n>;
    const maxBigintValue = entries["3"] === undefined ? entries["maxBigint"] : entries["3"];
    if (maxBigintValue === undefined) throw new Error("Missing required property \"maxBigint\".");
    props.maxBigint = maxBigintValue as Max<bigint, 1000000n>;
    const rangeBigintValue = entries["4"] === undefined ? entries["rangeBigint"] : entries["4"];
    if (rangeBigintValue === undefined) throw new Error("Missing required property \"rangeBigint\".");
    props.rangeBigint = rangeBigintValue as Range<bigint, 0n, 100n>;
    return props as BigintValidators.Data;
  }
  static from(value: BigintValidators.Value): BigintValidators {
    return value instanceof BigintValidators ? value : new BigintValidators(value);
  }
  #validate(data: BigintValidators.Value | undefined) {
    if (data === undefined) return;
    if (!(data.positiveBigint > 0n)) {
      throw new ValidationError("positiveBigint", "must be positive", data.positiveBigint, "POSITIVE");
    }
    if (!(data.minBigint >= 0n)) {
      throw new ValidationError("minBigint", "must be at least 0", data.minBigint, "MIN");
    }
    if (!(data.maxBigint <= 1000000n)) {
      throw new ValidationError("maxBigint", "must be at most 1000000", data.maxBigint, "MAX");
    }
    if (!(data.rangeBigint >= 0n && data.rangeBigint <= 100n)) {
      throw new ValidationError("rangeBigint", "must be between 0 and 100", data.rangeBigint, "RANGE");
    }
  }
  static validateAll(data: BigintValidators.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {
      if (!(data.positiveBigint > 0n)) {
        throw new ValidationError("positiveBigint", "must be positive", data.positiveBigint, "POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.minBigint >= 0n)) {
        throw new ValidationError("minBigint", "must be at least 0", data.minBigint, "MIN");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.maxBigint <= 1000000n)) {
        throw new ValidationError("maxBigint", "must be at most 1000000", data.maxBigint, "MAX");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(data.rangeBigint >= 0n && data.rangeBigint <= 100n)) {
        throw new ValidationError("rangeBigint", "must be between 0 and 100", data.rangeBigint, "RANGE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof BigintValidators>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for BigintValidators.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected BigintValidators.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get positiveBigint(): Positive<bigint> {
    return this.#positiveBigint;
  }
  get minBigint(): Min<bigint, 0n> {
    return this.#minBigint;
  }
  get maxBigint(): Max<bigint, 1000000n> {
    return this.#maxBigint;
  }
  get rangeBigint(): Range<bigint, 0n, 100n> {
    return this.#rangeBigint;
  }
  set(updates: Partial<SetUpdates<BigintValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof BigintValidators)(data) as this);
  }
  setMaxBigint(value: Max<bigint, 1000000n>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: this.#positiveBigint as Positive<bigint>,
      minBigint: this.#minBigint as Min<bigint, 0n>,
      maxBigint: value as Max<bigint, 1000000n>,
      rangeBigint: this.#rangeBigint as Range<bigint, 0n, 100n>
    }) as this);
  }
  setMinBigint(value: Min<bigint, 0n>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: this.#positiveBigint as Positive<bigint>,
      minBigint: value as Min<bigint, 0n>,
      maxBigint: this.#maxBigint as Max<bigint, 1000000n>,
      rangeBigint: this.#rangeBigint as Range<bigint, 0n, 100n>
    }) as this);
  }
  setPositiveBigint(value: Positive<bigint>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: value as Positive<bigint>,
      minBigint: this.#minBigint as Min<bigint, 0n>,
      maxBigint: this.#maxBigint as Max<bigint, 1000000n>,
      rangeBigint: this.#rangeBigint as Range<bigint, 0n, 100n>
    }) as this);
  }
  setRangeBigint(value: Range<bigint, 0n, 100n>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: this.#positiveBigint as Positive<bigint>,
      minBigint: this.#minBigint as Min<bigint, 0n>,
      maxBigint: this.#maxBigint as Max<bigint, 1000000n>,
      rangeBigint: value as Range<bigint, 0n, 100n>
    }) as this);
  }
}
export namespace BigintValidators {
  export type Data = {
    positiveBigint: Positive<bigint>;
    minBigint: Min<bigint, 0n>;
    maxBigint: Max<bigint, 1000000n>;
    rangeBigint: Range<bigint, 0n, 100n>;
  };
  export type Value = BigintValidators | BigintValidators.Data;
}
