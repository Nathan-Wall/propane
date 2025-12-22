/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/validators.pmsg
/**
 * Validator Integration Tests
 *
 * Tests validation code generation for various validator types.
 */

import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP, ValidationError, isInt32, isInt53, canBeDecimal, isPositive, greaterThanOrEqual, lessThanOrEqual, inRange } from "../runtime/index.js";
import type { Positive, Negative, NonNegative, NonPositive, Min, Max, Range, NonEmpty, MinLength, MaxLength, Length, int32, int53, decimal } from '@propane/types';

// Test: Numeric sign validators
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class NumericSignValidators extends Message<NumericSignValidators.Data> {
  static TYPE_TAG = Symbol("NumericSignValidators");
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
    super(NumericSignValidators.TYPE_TAG, "NumericSignValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#positiveNumber = props ? props.positiveNumber : new Positive();
    this.#negativeNumber = props ? props.negativeNumber : new Negative();
    this.#nonNegativeNumber = props ? props.nonNegativeNumber : new NonNegative();
    this.#nonPositiveNumber = props ? props.nonPositiveNumber : new NonPositive();
    if (!props) NumericSignValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumericSignValidators.Data>[] {
    return [{
      name: "positiveNumber",
      fieldNumber: 1,
      getValue: () => this.#positiveNumber
    }, {
      name: "negativeNumber",
      fieldNumber: 2,
      getValue: () => this.#negativeNumber
    }, {
      name: "nonNegativeNumber",
      fieldNumber: 3,
      getValue: () => this.#nonNegativeNumber
    }, {
      name: "nonPositiveNumber",
      fieldNumber: 4,
      getValue: () => this.#nonPositiveNumber
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): NumericSignValidators.Data {
    const props = {} as Partial<NumericSignValidators.Data>;
    const positiveNumberValue = entries["1"] === undefined ? entries["positiveNumber"] : entries["1"];
    if (positiveNumberValue === undefined) throw new Error("Missing required property \"positiveNumber\".");
    props.positiveNumber = positiveNumberValue;
    const negativeNumberValue = entries["2"] === undefined ? entries["negativeNumber"] : entries["2"];
    if (negativeNumberValue === undefined) throw new Error("Missing required property \"negativeNumber\".");
    props.negativeNumber = negativeNumberValue;
    const nonNegativeNumberValue = entries["3"] === undefined ? entries["nonNegativeNumber"] : entries["3"];
    if (nonNegativeNumberValue === undefined) throw new Error("Missing required property \"nonNegativeNumber\".");
    props.nonNegativeNumber = nonNegativeNumberValue;
    const nonPositiveNumberValue = entries["4"] === undefined ? entries["nonPositiveNumber"] : entries["4"];
    if (nonPositiveNumberValue === undefined) throw new Error("Missing required property \"nonPositiveNumber\".");
    props.nonPositiveNumber = nonPositiveNumberValue;
    return props as NumericSignValidators.Data;
  }
  #validate(data: NumericSignValidators.Value | undefined) {
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
    return this.$update(new (this.constructor as typeof NumericSignValidators)(data));
  }
  setNegativeNumber(value: Negative<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: this.#positiveNumber,
      negativeNumber: value,
      nonNegativeNumber: this.#nonNegativeNumber,
      nonPositiveNumber: this.#nonPositiveNumber
    }));
  }
  setNonNegativeNumber(value: NonNegative<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: this.#positiveNumber,
      negativeNumber: this.#negativeNumber,
      nonNegativeNumber: value,
      nonPositiveNumber: this.#nonPositiveNumber
    }));
  }
  setNonPositiveNumber(value: NonPositive<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: this.#positiveNumber,
      negativeNumber: this.#negativeNumber,
      nonNegativeNumber: this.#nonNegativeNumber,
      nonPositiveNumber: value
    }));
  }
  setPositiveNumber(value: Positive<number>) {
    return this.$update(new (this.constructor as typeof NumericSignValidators)({
      positiveNumber: value,
      negativeNumber: this.#negativeNumber,
      nonNegativeNumber: this.#nonNegativeNumber,
      nonPositiveNumber: this.#nonPositiveNumber
    }));
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
export class NumericBoundValidators extends Message<NumericBoundValidators.Data> {
  static TYPE_TAG = Symbol("NumericBoundValidators");
  static readonly $typeName = "NumericBoundValidators";
  static EMPTY: NumericBoundValidators;
  #minValue!: Min<number, 0>;
  #maxValue!: Max<number, 100>;
  #rangeValue!: Range<number, 0, 100>;
  constructor(props?: NumericBoundValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && NumericBoundValidators.EMPTY) return NumericBoundValidators.EMPTY;
    super(NumericBoundValidators.TYPE_TAG, "NumericBoundValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#minValue = props ? props.minValue : new Min();
    this.#maxValue = props ? props.maxValue : new Max();
    this.#rangeValue = props ? props.rangeValue : new Range();
    if (!props) NumericBoundValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<NumericBoundValidators.Data>[] {
    return [{
      name: "minValue",
      fieldNumber: 1,
      getValue: () => this.#minValue
    }, {
      name: "maxValue",
      fieldNumber: 2,
      getValue: () => this.#maxValue
    }, {
      name: "rangeValue",
      fieldNumber: 3,
      getValue: () => this.#rangeValue
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): NumericBoundValidators.Data {
    const props = {} as Partial<NumericBoundValidators.Data>;
    const minValueValue = entries["1"] === undefined ? entries["minValue"] : entries["1"];
    if (minValueValue === undefined) throw new Error("Missing required property \"minValue\".");
    props.minValue = minValueValue;
    const maxValueValue = entries["2"] === undefined ? entries["maxValue"] : entries["2"];
    if (maxValueValue === undefined) throw new Error("Missing required property \"maxValue\".");
    props.maxValue = maxValueValue;
    const rangeValueValue = entries["3"] === undefined ? entries["rangeValue"] : entries["3"];
    if (rangeValueValue === undefined) throw new Error("Missing required property \"rangeValue\".");
    props.rangeValue = rangeValueValue;
    return props as NumericBoundValidators.Data;
  }
  #validate(data: NumericBoundValidators.Value | undefined) {
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
    return this.$update(new (this.constructor as typeof NumericBoundValidators)(data));
  }
  setMaxValue(value: Max<number, 100>) {
    return this.$update(new (this.constructor as typeof NumericBoundValidators)({
      minValue: this.#minValue,
      maxValue: value,
      rangeValue: this.#rangeValue
    }));
  }
  setMinValue(value: Min<number, 0>) {
    return this.$update(new (this.constructor as typeof NumericBoundValidators)({
      minValue: value,
      maxValue: this.#maxValue,
      rangeValue: this.#rangeValue
    }));
  }
  setRangeValue(value: Range<number, 0, 100>) {
    return this.$update(new (this.constructor as typeof NumericBoundValidators)({
      minValue: this.#minValue,
      maxValue: this.#maxValue,
      rangeValue: value
    }));
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
export class StringValidators extends Message<StringValidators.Data> {
  static TYPE_TAG = Symbol("StringValidators");
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
    super(StringValidators.TYPE_TAG, "StringValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#nonEmptyString = props ? props.nonEmptyString : new NonEmpty();
    this.#minLengthString = props ? props.minLengthString : new MinLength();
    this.#maxLengthString = props ? props.maxLengthString : new MaxLength();
    this.#exactLengthString = props ? props.exactLengthString : new Length();
    if (!props) StringValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<StringValidators.Data>[] {
    return [{
      name: "nonEmptyString",
      fieldNumber: 1,
      getValue: () => this.#nonEmptyString
    }, {
      name: "minLengthString",
      fieldNumber: 2,
      getValue: () => this.#minLengthString
    }, {
      name: "maxLengthString",
      fieldNumber: 3,
      getValue: () => this.#maxLengthString
    }, {
      name: "exactLengthString",
      fieldNumber: 4,
      getValue: () => this.#exactLengthString
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): StringValidators.Data {
    const props = {} as Partial<StringValidators.Data>;
    const nonEmptyStringValue = entries["1"] === undefined ? entries["nonEmptyString"] : entries["1"];
    if (nonEmptyStringValue === undefined) throw new Error("Missing required property \"nonEmptyString\".");
    props.nonEmptyString = nonEmptyStringValue;
    const minLengthStringValue = entries["2"] === undefined ? entries["minLengthString"] : entries["2"];
    if (minLengthStringValue === undefined) throw new Error("Missing required property \"minLengthString\".");
    props.minLengthString = minLengthStringValue;
    const maxLengthStringValue = entries["3"] === undefined ? entries["maxLengthString"] : entries["3"];
    if (maxLengthStringValue === undefined) throw new Error("Missing required property \"maxLengthString\".");
    props.maxLengthString = maxLengthStringValue;
    const exactLengthStringValue = entries["4"] === undefined ? entries["exactLengthString"] : entries["4"];
    if (exactLengthStringValue === undefined) throw new Error("Missing required property \"exactLengthString\".");
    props.exactLengthString = exactLengthStringValue;
    return props as StringValidators.Data;
  }
  #validate(data: StringValidators.Value | undefined) {
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
    return this.$update(new (this.constructor as typeof StringValidators)(data));
  }
  setExactLengthString(value: Length<string, 5, 10>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: this.#nonEmptyString,
      minLengthString: this.#minLengthString,
      maxLengthString: this.#maxLengthString,
      exactLengthString: value
    }));
  }
  setMaxLengthString(value: MaxLength<string, 100>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: this.#nonEmptyString,
      minLengthString: this.#minLengthString,
      maxLengthString: value,
      exactLengthString: this.#exactLengthString
    }));
  }
  setMinLengthString(value: MinLength<string, 3>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: this.#nonEmptyString,
      minLengthString: value,
      maxLengthString: this.#maxLengthString,
      exactLengthString: this.#exactLengthString
    }));
  }
  setNonEmptyString(value: NonEmpty<string>) {
    return this.$update(new (this.constructor as typeof StringValidators)({
      nonEmptyString: value,
      minLengthString: this.#minLengthString,
      maxLengthString: this.#maxLengthString,
      exactLengthString: this.#exactLengthString
    }));
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
export class BrandedValidators extends Message<BrandedValidators.Data> {
  static TYPE_TAG = Symbol("BrandedValidators");
  static readonly $typeName = "BrandedValidators";
  static EMPTY: BrandedValidators;
  #positiveInt32!: Positive<int32>;
  #positiveInt53!: Positive<int53>;
  #positiveDecimal!: Positive<decimal<10, 2>>;
  #minDecimal!: Min<decimal<10, 2>, "100">;
  #maxDecimal!: Max<decimal<10, 2>, "1000">;
  #rangeDecimal!: Range<decimal<10, 2>, "0", "999.99">;
  constructor(props?: BrandedValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && BrandedValidators.EMPTY) return BrandedValidators.EMPTY;
    super(BrandedValidators.TYPE_TAG, "BrandedValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#positiveInt32 = props ? props.positiveInt32 : new Positive();
    this.#positiveInt53 = props ? props.positiveInt53 : new Positive();
    this.#positiveDecimal = props ? props.positiveDecimal : new Positive();
    this.#minDecimal = props ? props.minDecimal : new Min();
    this.#maxDecimal = props ? props.maxDecimal : new Max();
    this.#rangeDecimal = props ? props.rangeDecimal : new Range();
    if (!props) BrandedValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<BrandedValidators.Data>[] {
    return [{
      name: "positiveInt32",
      fieldNumber: 1,
      getValue: () => this.#positiveInt32
    }, {
      name: "positiveInt53",
      fieldNumber: 2,
      getValue: () => this.#positiveInt53
    }, {
      name: "positiveDecimal",
      fieldNumber: 3,
      getValue: () => this.#positiveDecimal
    }, {
      name: "minDecimal",
      fieldNumber: 4,
      getValue: () => this.#minDecimal
    }, {
      name: "maxDecimal",
      fieldNumber: 5,
      getValue: () => this.#maxDecimal
    }, {
      name: "rangeDecimal",
      fieldNumber: 6,
      getValue: () => this.#rangeDecimal
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): BrandedValidators.Data {
    const props = {} as Partial<BrandedValidators.Data>;
    const positiveInt32Value = entries["1"] === undefined ? entries["positiveInt32"] : entries["1"];
    if (positiveInt32Value === undefined) throw new Error("Missing required property \"positiveInt32\".");
    props.positiveInt32 = positiveInt32Value;
    const positiveInt53Value = entries["2"] === undefined ? entries["positiveInt53"] : entries["2"];
    if (positiveInt53Value === undefined) throw new Error("Missing required property \"positiveInt53\".");
    props.positiveInt53 = positiveInt53Value;
    const positiveDecimalValue = entries["3"] === undefined ? entries["positiveDecimal"] : entries["3"];
    if (positiveDecimalValue === undefined) throw new Error("Missing required property \"positiveDecimal\".");
    props.positiveDecimal = positiveDecimalValue;
    const minDecimalValue = entries["4"] === undefined ? entries["minDecimal"] : entries["4"];
    if (minDecimalValue === undefined) throw new Error("Missing required property \"minDecimal\".");
    props.minDecimal = minDecimalValue;
    const maxDecimalValue = entries["5"] === undefined ? entries["maxDecimal"] : entries["5"];
    if (maxDecimalValue === undefined) throw new Error("Missing required property \"maxDecimal\".");
    props.maxDecimal = maxDecimalValue;
    const rangeDecimalValue = entries["6"] === undefined ? entries["rangeDecimal"] : entries["6"];
    if (rangeDecimalValue === undefined) throw new Error("Missing required property \"rangeDecimal\".");
    props.rangeDecimal = rangeDecimalValue;
    return props as BrandedValidators.Data;
  }
  #validate(data: BrandedValidators.Value | undefined) {
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
    if (!(canBeDecimal(data.positiveDecimal, 10, 2))) {
      throw new ValidationError("positiveDecimal", "must be a valid decimal(10,2)", data.positiveDecimal, "DECIMAL");
    }
    if (!(isPositive(data.positiveDecimal))) {
      throw new ValidationError("positiveDecimal", "must be positive", data.positiveDecimal, "POSITIVE");
    }
    if (!(canBeDecimal(data.minDecimal, 10, 2))) {
      throw new ValidationError("minDecimal", "must be a valid decimal(10,2)", data.minDecimal, "DECIMAL");
    }
    if (!(greaterThanOrEqual(data.minDecimal, "100.00"))) {
      throw new ValidationError("minDecimal", "must be at least 100.00", data.minDecimal, "MIN");
    }
    if (!(canBeDecimal(data.maxDecimal, 10, 2))) {
      throw new ValidationError("maxDecimal", "must be a valid decimal(10,2)", data.maxDecimal, "DECIMAL");
    }
    if (!(lessThanOrEqual(data.maxDecimal, "1000.00"))) {
      throw new ValidationError("maxDecimal", "must be at most 1000.00", data.maxDecimal, "MAX");
    }
    if (!(canBeDecimal(data.rangeDecimal, 10, 2))) {
      throw new ValidationError("rangeDecimal", "must be a valid decimal(10,2)", data.rangeDecimal, "DECIMAL");
    }
    if (!(inRange(data.rangeDecimal, "0.00", "999.99"))) {
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
      if (!(canBeDecimal(data.positiveDecimal, 10, 2))) {
        throw new ValidationError("positiveDecimal", "must be a valid decimal(10,2)", data.positiveDecimal, "DECIMAL");
      }
      if (!(isPositive(data.positiveDecimal))) {
        throw new ValidationError("positiveDecimal", "must be positive", data.positiveDecimal, "POSITIVE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(canBeDecimal(data.minDecimal, 10, 2))) {
        throw new ValidationError("minDecimal", "must be a valid decimal(10,2)", data.minDecimal, "DECIMAL");
      }
      if (!(greaterThanOrEqual(data.minDecimal, "100.00"))) {
        throw new ValidationError("minDecimal", "must be at least 100.00", data.minDecimal, "MIN");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(canBeDecimal(data.maxDecimal, 10, 2))) {
        throw new ValidationError("maxDecimal", "must be a valid decimal(10,2)", data.maxDecimal, "DECIMAL");
      }
      if (!(lessThanOrEqual(data.maxDecimal, "1000.00"))) {
        throw new ValidationError("maxDecimal", "must be at most 1000.00", data.maxDecimal, "MAX");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {
      if (!(canBeDecimal(data.rangeDecimal, 10, 2))) {
        throw new ValidationError("rangeDecimal", "must be a valid decimal(10,2)", data.rangeDecimal, "DECIMAL");
      }
      if (!(inRange(data.rangeDecimal, "0.00", "999.99"))) {
        throw new ValidationError("rangeDecimal", "must be between 0.00 and 999.99", data.rangeDecimal, "RANGE");
      }
    } catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  get positiveInt32(): Positive<int32> {
    return this.#positiveInt32;
  }
  get positiveInt53(): Positive<int53> {
    return this.#positiveInt53;
  }
  get positiveDecimal(): Positive<decimal<10, 2>> {
    return this.#positiveDecimal;
  }
  get minDecimal(): Min<decimal<10, 2>, "100"> {
    return this.#minDecimal;
  }
  get maxDecimal(): Max<decimal<10, 2>, "1000"> {
    return this.#maxDecimal;
  }
  get rangeDecimal(): Range<decimal<10, 2>, "0", "999.99"> {
    return this.#rangeDecimal;
  }
  set(updates: Partial<SetUpdates<BrandedValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof BrandedValidators)(data));
  }
  setMaxDecimal(value: Max<decimal<10, 2>, "1000">) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32,
      positiveInt53: this.#positiveInt53,
      positiveDecimal: this.#positiveDecimal,
      minDecimal: this.#minDecimal,
      maxDecimal: value,
      rangeDecimal: this.#rangeDecimal
    }));
  }
  setMinDecimal(value: Min<decimal<10, 2>, "100">) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32,
      positiveInt53: this.#positiveInt53,
      positiveDecimal: this.#positiveDecimal,
      minDecimal: value,
      maxDecimal: this.#maxDecimal,
      rangeDecimal: this.#rangeDecimal
    }));
  }
  setPositiveDecimal(value: Positive<decimal<10, 2>>) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32,
      positiveInt53: this.#positiveInt53,
      positiveDecimal: value,
      minDecimal: this.#minDecimal,
      maxDecimal: this.#maxDecimal,
      rangeDecimal: this.#rangeDecimal
    }));
  }
  setPositiveInt32(value: Positive<int32>) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: value,
      positiveInt53: this.#positiveInt53,
      positiveDecimal: this.#positiveDecimal,
      minDecimal: this.#minDecimal,
      maxDecimal: this.#maxDecimal,
      rangeDecimal: this.#rangeDecimal
    }));
  }
  setPositiveInt53(value: Positive<int53>) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32,
      positiveInt53: value,
      positiveDecimal: this.#positiveDecimal,
      minDecimal: this.#minDecimal,
      maxDecimal: this.#maxDecimal,
      rangeDecimal: this.#rangeDecimal
    }));
  }
  setRangeDecimal(value: Range<decimal<10, 2>, "0", "999.99">) {
    return this.$update(new (this.constructor as typeof BrandedValidators)({
      positiveInt32: this.#positiveInt32,
      positiveInt53: this.#positiveInt53,
      positiveDecimal: this.#positiveDecimal,
      minDecimal: this.#minDecimal,
      maxDecimal: this.#maxDecimal,
      rangeDecimal: value
    }));
  }
}
export namespace BrandedValidators {
  export type Data = {
    positiveInt32: Positive<int32>;
    positiveInt53: Positive<int53>;
    positiveDecimal: Positive<decimal<10, 2>>;
    minDecimal: Min<decimal<10, 2>, "100">;
    maxDecimal: Max<decimal<10, 2>, "1000">;
    rangeDecimal: Range<decimal<10, 2>, "0", "999.99">;
  };
  export type Value = BrandedValidators | BrandedValidators.Data;
} // Test: Optional validated fields
export class OptionalValidators extends Message<OptionalValidators.Data> {
  static TYPE_TAG = Symbol("OptionalValidators");
  static readonly $typeName = "OptionalValidators";
  static EMPTY: OptionalValidators;
  #requiredPositive!: Positive<number>;
  #optionalPositive!: Positive<number>;
  #nullablePositive!: Positive<number> | null;
  #optionalNullablePositive!: Positive<number> | null;
  constructor(props?: OptionalValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && OptionalValidators.EMPTY) return OptionalValidators.EMPTY;
    super(OptionalValidators.TYPE_TAG, "OptionalValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#requiredPositive = props ? props.requiredPositive : new Positive();
    this.#optionalPositive = props ? props.optionalPositive : undefined;
    this.#nullablePositive = props ? props.nullablePositive : new Positive();
    this.#optionalNullablePositive = props ? props.optionalNullablePositive : undefined;
    if (!props) OptionalValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OptionalValidators.Data>[] {
    return [{
      name: "requiredPositive",
      fieldNumber: 1,
      getValue: () => this.#requiredPositive
    }, {
      name: "optionalPositive",
      fieldNumber: 2,
      getValue: () => this.#optionalPositive
    }, {
      name: "nullablePositive",
      fieldNumber: 3,
      getValue: () => this.#nullablePositive
    }, {
      name: "optionalNullablePositive",
      fieldNumber: 4,
      getValue: () => this.#optionalNullablePositive
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): OptionalValidators.Data {
    const props = {} as Partial<OptionalValidators.Data>;
    const requiredPositiveValue = entries["1"] === undefined ? entries["requiredPositive"] : entries["1"];
    if (requiredPositiveValue === undefined) throw new Error("Missing required property \"requiredPositive\".");
    props.requiredPositive = requiredPositiveValue;
    const optionalPositiveValue = entries["2"] === undefined ? entries["optionalPositive"] : entries["2"];
    const optionalPositiveNormalized = optionalPositiveValue === null ? undefined : optionalPositiveValue;
    props.optionalPositive = optionalPositiveNormalized;
    const nullablePositiveValue = entries["3"] === undefined ? entries["nullablePositive"] : entries["3"];
    if (nullablePositiveValue === undefined) throw new Error("Missing required property \"nullablePositive\".");
    if (!(nullablePositiveValue === null)) throw new Error("Invalid value for property \"nullablePositive\".");
    props.nullablePositive = nullablePositiveValue;
    const optionalNullablePositiveValue = entries["4"] === undefined ? entries["optionalNullablePositive"] : entries["4"];
    if (optionalNullablePositiveValue !== undefined && !(optionalNullablePositiveValue === null)) throw new Error("Invalid value for property \"optionalNullablePositive\".");
    props.optionalNullablePositive = optionalNullablePositiveValue;
    return props as OptionalValidators.Data;
  }
  #validate(data: OptionalValidators.Value | undefined) {
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
  get requiredPositive(): Positive<number> {
    return this.#requiredPositive;
  }
  get optionalPositive(): Positive<number> {
    return this.#optionalPositive;
  }
  get nullablePositive(): Positive<number> | null {
    return this.#nullablePositive;
  }
  get optionalNullablePositive(): Positive<number> | null {
    return this.#optionalNullablePositive;
  }
  deleteOptionalNullablePositive() {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive,
      optionalPositive: this.#optionalPositive,
      nullablePositive: this.#nullablePositive
    }));
  }
  deleteOptionalPositive() {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive,
      nullablePositive: this.#nullablePositive,
      optionalNullablePositive: this.#optionalNullablePositive
    }));
  }
  set(updates: Partial<SetUpdates<OptionalValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof OptionalValidators)(data));
  }
  setNullablePositive(value: Positive<number> | null) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive,
      optionalPositive: this.#optionalPositive,
      nullablePositive: value,
      optionalNullablePositive: this.#optionalNullablePositive
    }));
  }
  setOptionalNullablePositive(value: Positive<number> | null) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive,
      optionalPositive: this.#optionalPositive,
      nullablePositive: this.#nullablePositive,
      optionalNullablePositive: value
    }));
  }
  setOptionalPositive(value: Positive<number>) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: this.#requiredPositive,
      optionalPositive: value,
      nullablePositive: this.#nullablePositive,
      optionalNullablePositive: this.#optionalNullablePositive
    }));
  }
  setRequiredPositive(value: Positive<number>) {
    return this.$update(new (this.constructor as typeof OptionalValidators)({
      requiredPositive: value,
      optionalPositive: this.#optionalPositive,
      nullablePositive: this.#nullablePositive,
      optionalNullablePositive: this.#optionalNullablePositive
    }));
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
export class ArrayValidators extends Message<ArrayValidators.Data> {
  static TYPE_TAG = Symbol("ArrayValidators");
  static readonly $typeName = "ArrayValidators";
  static EMPTY: ArrayValidators;
  #nonEmptyArray!: NonEmpty<string[]>;
  #minLengthArray!: MinLength<number[], 1>;
  #maxLengthArray!: MaxLength<number[], 10>;
  constructor(props?: ArrayValidators.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ArrayValidators.EMPTY) return ArrayValidators.EMPTY;
    super(ArrayValidators.TYPE_TAG, "ArrayValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#nonEmptyArray = props ? props.nonEmptyArray : new NonEmpty();
    this.#minLengthArray = props ? props.minLengthArray : new MinLength();
    this.#maxLengthArray = props ? props.maxLengthArray : new MaxLength();
    if (!props) ArrayValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayValidators.Data>[] {
    return [{
      name: "nonEmptyArray",
      fieldNumber: 1,
      getValue: () => this.#nonEmptyArray
    }, {
      name: "minLengthArray",
      fieldNumber: 2,
      getValue: () => this.#minLengthArray
    }, {
      name: "maxLengthArray",
      fieldNumber: 3,
      getValue: () => this.#maxLengthArray
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ArrayValidators.Data {
    const props = {} as Partial<ArrayValidators.Data>;
    const nonEmptyArrayValue = entries["1"] === undefined ? entries["nonEmptyArray"] : entries["1"];
    if (nonEmptyArrayValue === undefined) throw new Error("Missing required property \"nonEmptyArray\".");
    props.nonEmptyArray = nonEmptyArrayValue;
    const minLengthArrayValue = entries["2"] === undefined ? entries["minLengthArray"] : entries["2"];
    if (minLengthArrayValue === undefined) throw new Error("Missing required property \"minLengthArray\".");
    props.minLengthArray = minLengthArrayValue;
    const maxLengthArrayValue = entries["3"] === undefined ? entries["maxLengthArray"] : entries["3"];
    if (maxLengthArrayValue === undefined) throw new Error("Missing required property \"maxLengthArray\".");
    props.maxLengthArray = maxLengthArrayValue;
    return props as ArrayValidators.Data;
  }
  #validate(data: ArrayValidators.Value | undefined) {
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
  get nonEmptyArray(): NonEmpty<string[]> {
    return this.#nonEmptyArray;
  }
  get minLengthArray(): MinLength<number[], 1> {
    return this.#minLengthArray;
  }
  get maxLengthArray(): MaxLength<number[], 10> {
    return this.#maxLengthArray;
  }
  set(updates: Partial<SetUpdates<ArrayValidators.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ArrayValidators)(data));
  }
  setMaxLengthArray(value: MaxLength<number[], 10>) {
    return this.$update(new (this.constructor as typeof ArrayValidators)({
      nonEmptyArray: this.#nonEmptyArray,
      minLengthArray: this.#minLengthArray,
      maxLengthArray: value
    }));
  }
  setMinLengthArray(value: MinLength<number[], 1>) {
    return this.$update(new (this.constructor as typeof ArrayValidators)({
      nonEmptyArray: this.#nonEmptyArray,
      minLengthArray: value,
      maxLengthArray: this.#maxLengthArray
    }));
  }
  setNonEmptyArray(value: NonEmpty<string[]>) {
    return this.$update(new (this.constructor as typeof ArrayValidators)({
      nonEmptyArray: value,
      minLengthArray: this.#minLengthArray,
      maxLengthArray: this.#maxLengthArray
    }));
  }
}
export namespace ArrayValidators {
  export type Data = {
    nonEmptyArray: NonEmpty<string[]>;
    minLengthArray: MinLength<number[], 1>;
    maxLengthArray: MaxLength<number[], 10>;
  };
  export type Value = ArrayValidators | ArrayValidators.Data;
} // Test: Bigint validators
export class BigintValidators extends Message<BigintValidators.Data> {
  static TYPE_TAG = Symbol("BigintValidators");
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
    super(BigintValidators.TYPE_TAG, "BigintValidators");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#positiveBigint = props ? props.positiveBigint : new Positive();
    this.#minBigint = props ? props.minBigint : new Min();
    this.#maxBigint = props ? props.maxBigint : new Max();
    this.#rangeBigint = props ? props.rangeBigint : new Range();
    if (!props) BigintValidators.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<BigintValidators.Data>[] {
    return [{
      name: "positiveBigint",
      fieldNumber: 1,
      getValue: () => this.#positiveBigint
    }, {
      name: "minBigint",
      fieldNumber: 2,
      getValue: () => this.#minBigint
    }, {
      name: "maxBigint",
      fieldNumber: 3,
      getValue: () => this.#maxBigint
    }, {
      name: "rangeBigint",
      fieldNumber: 4,
      getValue: () => this.#rangeBigint
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): BigintValidators.Data {
    const props = {} as Partial<BigintValidators.Data>;
    const positiveBigintValue = entries["1"] === undefined ? entries["positiveBigint"] : entries["1"];
    if (positiveBigintValue === undefined) throw new Error("Missing required property \"positiveBigint\".");
    props.positiveBigint = positiveBigintValue;
    const minBigintValue = entries["2"] === undefined ? entries["minBigint"] : entries["2"];
    if (minBigintValue === undefined) throw new Error("Missing required property \"minBigint\".");
    props.minBigint = minBigintValue;
    const maxBigintValue = entries["3"] === undefined ? entries["maxBigint"] : entries["3"];
    if (maxBigintValue === undefined) throw new Error("Missing required property \"maxBigint\".");
    props.maxBigint = maxBigintValue;
    const rangeBigintValue = entries["4"] === undefined ? entries["rangeBigint"] : entries["4"];
    if (rangeBigintValue === undefined) throw new Error("Missing required property \"rangeBigint\".");
    props.rangeBigint = rangeBigintValue;
    return props as BigintValidators.Data;
  }
  #validate(data: BigintValidators.Value | undefined) {
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
    return this.$update(new (this.constructor as typeof BigintValidators)(data));
  }
  setMaxBigint(value: Max<bigint, 1000000n>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: this.#positiveBigint,
      minBigint: this.#minBigint,
      maxBigint: value,
      rangeBigint: this.#rangeBigint
    }));
  }
  setMinBigint(value: Min<bigint, 0n>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: this.#positiveBigint,
      minBigint: value,
      maxBigint: this.#maxBigint,
      rangeBigint: this.#rangeBigint
    }));
  }
  setPositiveBigint(value: Positive<bigint>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: value,
      minBigint: this.#minBigint,
      maxBigint: this.#maxBigint,
      rangeBigint: this.#rangeBigint
    }));
  }
  setRangeBigint(value: Range<bigint, 0n, 100n>) {
    return this.$update(new (this.constructor as typeof BigintValidators)({
      positiveBigint: this.#positiveBigint,
      minBigint: this.#minBigint,
      maxBigint: this.#maxBigint,
      rangeBigint: value
    }));
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
