/**
 * Decimal and Rational numeric types with exact arithmetic and explicit rounding.
 */

import { Decimal$Base } from './decimal.pmsg.base.js';
import type { Decimal as DecimalTypes } from './decimal.pmsg.base.js';
import { Rational } from './rational.pmsg.ext.js';
import {
  ABSOLUTE_MAX_PRECISION,
  ABSOLUTE_MAX_SCALE,
  ABSOLUTE_MAX_SCALE_DIFF,
  ABSOLUTE_MIN_PRECISION,
  DecimalDivisionByZeroError,
  DecimalInexactError,
  DecimalOverflowError,
  RoundingMode,
  absBigInt,
  ensureMantissaFitsPrecision,
  ensureValidPrecisionScale,
  hashCombine,
  hashBigInt,
  parseDecimalInput,
  pow10,
  roundBigInt,
  scaleByPow10,
  toBigIntSafeInteger,
} from './decimal-shared.js';
import type { FromStringOptions } from './decimal-shared.js';

export {
  ABSOLUTE_MAX_PRECISION,
  ABSOLUTE_MAX_SCALE,
  ABSOLUTE_MAX_SCALE_DIFF,
  ABSOLUTE_MIN_PRECISION,
  DecimalDivisionByZeroError,
  DecimalInexactError,
  DecimalOverflowError,
  RoundingMode,
  ensureValidPrecisionScale,
  pow10,
  roundBigInt,
  scaleByPow10,
};
export type { FromStringOptions } from './decimal-shared.js';
export { Rational, RationalOverflowError } from './rational.pmsg.ext.js';

export namespace Decimal {
  export type Data<P extends number, S extends number> = DecimalTypes.Data<P, S>;
  export type Value<P extends number, S extends number> = DecimalTypes.Value<P, S>;
}

export interface DecimalFactoryOptions {
  defaultRounding?: RoundingMode;
}

export interface DecimalFactory<P extends number, S extends number> {
  fromString(value: string, options?: FromStringOptions): Decimal<P, S>;
  fromStrictString(value: string): Decimal<P, S>;
  fromInt(value: number | bigint): Decimal<P, S>;
  fromMantissa(mantissa: bigint): Decimal<P, S>;
  zero(): Decimal<P, S>;
  one(): Decimal<P, S>;
  unit(): Decimal<P, S>;
  readonly precision: P;
  readonly scale: S;
  readonly defaultRounding: RoundingMode | undefined;
}

export type AllocationStrategy = 'roundRobin' | 'largestRemainder';

export interface AllocateOptions {
  strategy?: AllocationStrategy;
}

export type MultiplyOptions = {
  round?: RoundingMode;
};

export type MultiplyTargetOptions<P2 extends number, S2 extends number> = {
  round?: RoundingMode;
  target: DecimalFactory<P2, S2> | { precision: P2; scale: S2 };
};

export type DivideOptions = {
  round?: RoundingMode;
};

const DECIMAL_BRAND = Symbol.for('propane.Decimal');

export class Decimal<P extends number, S extends number> extends Decimal$Base<P, S> {
  readonly [DECIMAL_BRAND] = true;
  #hash?: number;

  constructor(
    props?: DecimalTypes.Value<P, S>,
    options?: { skipValidation?: boolean }
  ) {
    let mantissa: bigint;
    let precision: number;
    let scale: number;

    if (props instanceof Decimal$Base) {
      mantissa = props.mantissa;
      precision = props.precision;
      scale = props.scale;
    } else if (props) {
      mantissa = props.mantissa;
      precision = props.precision;
      scale = props.scale;
    } else {
      mantissa = 0n;
      precision = ABSOLUTE_MIN_PRECISION;
      scale = 0;
    }

    if (!options?.skipValidation) {
      ensureValidPrecisionScale(precision, scale);
      ensureMantissaFitsPrecision(precision, scale, mantissa);
    }

    super(
      { mantissa, precision, scale },
      { skipValidation: options?.skipValidation }
    );
  }

  override toCompact(): string {
    return this.toString();
  }

  override get precision(): P {
    return super.precision as P;
  }

  override get scale(): S {
    return super.scale as S;
  }

  static fromMantissa<P extends number, S extends number>(
    precision: P,
    scale: S,
    mantissa: bigint
  ): Decimal<P, S> {
    ensureValidPrecisionScale(precision, scale);
    ensureMantissaFitsPrecision(precision, scale, mantissa);
    return new Decimal({ mantissa, precision, scale });
  }

  static fromInt<P extends number, S extends number>(
    precision: P,
    scale: S,
    value: number | bigint
  ): Decimal<P, S> {
    const intValue = toBigIntSafeInteger(value);
    let mantissa: bigint;
    if (scale >= 0) {
      mantissa = intValue * pow10(scale);
    } else {
      const divisor = pow10(-scale);
      const remainder = intValue % divisor;
      if (remainder !== 0n) {
        throw new DecimalInexactError('fromInt', {
          message: `${intValue} is not exactly representable at scale ${scale} (not divisible by ${divisor})`,
          targetScale: scale,
        });
      }
      mantissa = intValue / divisor;
    }

    return Decimal.fromMantissa(precision, scale, mantissa);
  }

  static fromString<P extends number, S extends number>(
    precision: P,
    scale: S,
    value: string,
    options?: FromStringOptions
  ): Decimal<P, S> {
    ensureValidPrecisionScale(precision, scale);
    const allowWhitespace = options?.allowWhitespace ?? true;
    const parsed = parseDecimalInput(
      value,
      {
        allowExponent: options?.allowExponent ?? true,
        allowGrouping: options?.allowGrouping ?? true,
        allowWhitespace,
        allowPositiveSign: options?.allowPositiveSign ?? true,
        allowLeadingZeros: options?.allowLeadingZeros ?? true,
      },
      'Decimal.fromString'
    );
    let mantissa = BigInt(parsed.digits) * parsed.sign;
    const scaleDiff = parsed.scale - scale;
    if (scaleDiff > 0) {
      const divisor = pow10(scaleDiff);
      const remainder = mantissa % divisor;
      if (remainder !== 0n) {
        throw new DecimalInexactError('fromString');
      }
      mantissa = mantissa / divisor;
    } else if (scaleDiff < 0) {
      mantissa = mantissa * pow10(-scaleDiff);
    }

    return Decimal.fromMantissa(precision, scale, mantissa);
  }

  static override fromCompact<P extends number, S extends number>(
    precision?: P,
    scale?: S,
    value?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: { skipValidation?: boolean }
  ): Decimal<P, S> {
    if (precision === undefined || scale === undefined || value === undefined) {
      throw new Error('Decimal.fromCompact requires precision, scale, and value.');
    }
    return Decimal.fromStrictString(precision, scale, value);
  }

  static fromStrictString<P extends number, S extends number>(
    precision: P,
    scale: S,
    value: string
  ): Decimal<P, S> {
    return Decimal.fromString(precision, scale, value, {
      allowExponent: false,
      allowGrouping: false,
      allowWhitespace: false,
      allowPositiveSign: false,
      allowLeadingZeros: false,
    });
  }

  static zero<P extends number, S extends number>(precision: P, scale: S): Decimal<P, S> {
    return Decimal.fromMantissa(precision, scale, 0n);
  }

  static one<P extends number, S extends number>(precision: P, scale: S): Decimal<P, S> {
    if (scale < 0) {
      throw new RangeError(
        `one() is not defined for negative scale ${scale}. ` +
        `Use unit() for the smallest representable increment, or fromMantissa(1n) for mantissa=1.`
      );
    }
    return Decimal.fromMantissa(precision, scale, pow10(scale));
  }

  static factory<P extends number, S extends number>(
    precision: P,
    scale: S,
    options?: DecimalFactoryOptions
  ): DecimalFactory<P, S> {
    ensureValidPrecisionScale(precision, scale);
    const defaultRounding = options?.defaultRounding;
    return {
      precision,
      scale,
      defaultRounding,
      fromString: (v, opts) => Decimal.fromString(precision, scale, v, opts),
      fromStrictString: (v) => Decimal.fromStrictString(precision, scale, v),
      fromInt: (v) => Decimal.fromInt(precision, scale, v),
      fromMantissa: (v) => Decimal.fromMantissa(precision, scale, v),
      zero: () => Decimal.fromMantissa(precision, scale, 0n),
      one: () => {
        if (scale < 0) {
          throw new RangeError(
            `one() is not defined for negative scale ${scale}. ` +
            `Use unit() for the smallest representable increment, or fromMantissa(1n) for mantissa=1.`
          );
        }
        return Decimal.fromMantissa(precision, scale, pow10(scale));
      },
      unit: () => Decimal.fromMantissa(precision, scale, 1n),
    };
  }

  override $fromEntries(
    entries: Record<string, unknown>,
    options?: { skipValidation: boolean }
  ): { mantissa: bigint; precision: P; scale: S } {
    const props = super.$fromEntries(entries, options) as {
      mantissa: bigint;
      precision: P;
      scale: S;
    };
    if (!options?.skipValidation) {
      ensureValidPrecisionScale(props.precision, props.scale);
      ensureMantissaFitsPrecision(props.precision, props.scale, props.mantissa);
    }
    return props;
  }

  add(other: Decimal<P, S>): Decimal<P, S> {
    if (this.scale !== other.scale || this.precision !== other.precision) {
      throw new TypeError('add: Decimal precision/scale mismatch');
    }
    const resultMantissa = this.mantissa + other.mantissa;
    ensureMantissaFitsPrecision(this.precision, this.scale, resultMantissa);
    return Decimal.fromMantissa(this.precision, this.scale, resultMantissa);
  }

  subtract(other: Decimal<P, S>): Decimal<P, S> {
    return this.add(other.negate());
  }

  multiply(
    other: Decimal<any, any> | Rational | number | bigint,
    options?: MultiplyOptions
  ): Decimal<P, S>;
  multiply<P2 extends number, S2 extends number>(
    other: Decimal<any, any> | Rational | number | bigint,
    options: MultiplyTargetOptions<P2, S2>
  ): Decimal<P2, S2>;
  multiply(
    other: Decimal<any, any> | Rational | number | bigint,
    options?: MultiplyOptions | MultiplyTargetOptions<any, any>
  ): Decimal<any, any> {
    let targetPrecision: number = this.precision;
    let targetScale: number = this.scale;
    const round = options?.round;
    const target = options && 'target' in options ? options.target : undefined;
    if (target) {
      targetPrecision = target.precision;
      targetScale = target.scale;
      ensureValidPrecisionScale(targetPrecision, targetScale);
    }

    let resultMantissa: bigint;

    if (typeof other === 'number' || typeof other === 'bigint') {
      const otherInt = toBigIntSafeInteger(other, { context: 'multiply' });
      resultMantissa = this.mantissa * otherInt;
    } else if (Rational.isInstance(other)) {
      const numerator = this.mantissa * other.numerator;
      const denominator = other.denominator;
      const remainder = numerator % denominator;
      if (remainder !== 0n) {
        if (round === undefined) {
          throw new DecimalInexactError('multiply');
        }
        resultMantissa = roundBigInt(numerator, denominator, round);
      } else {
        resultMantissa = numerator / denominator;
      }
    } else {
      const product = this.mantissa * other.mantissa;
      if (other.scale > 0) {
        const denominator = pow10(other.scale);
        const remainder = product % denominator;
        if (remainder !== 0n) {
          if (round === undefined) {
            throw new DecimalInexactError('multiply');
          }
          resultMantissa = roundBigInt(product, denominator, round);
        } else {
          resultMantissa = product / denominator;
        }
      } else if (other.scale < 0) {
        resultMantissa = product * pow10(-other.scale);
      } else {
        resultMantissa = product;
      }
    }

    if (targetScale !== this.scale) {
      const scaleDiff = targetScale - this.scale;
      if (scaleDiff > 0) {
        resultMantissa = resultMantissa * pow10(scaleDiff);
      } else {
        const divisor = pow10(-scaleDiff);
        const remainder = resultMantissa % divisor;
        if (remainder !== 0n) {
          if (round === undefined) {
            throw new DecimalInexactError('multiply');
          }
          resultMantissa = roundBigInt(resultMantissa, divisor, round);
        } else {
          resultMantissa = resultMantissa / divisor;
        }
      }
    }

    ensureMantissaFitsPrecision(targetPrecision, targetScale, resultMantissa);

    return Decimal.fromMantissa(targetPrecision, targetScale, resultMantissa);
  }

  divide(other: Decimal<any, any>): Rational;
  divide(other: number | bigint, options?: DivideOptions): Decimal<P, S>;
  divide(other: Rational, options?: DivideOptions): Decimal<P, S>;
  divide(
    other: Decimal<any, any> | Rational | number | bigint,
    options?: DivideOptions | RoundingMode
  ): Rational | Decimal<P, S> {
    const round = typeof options === 'object' ? options?.round : options;
    if (typeof other === 'number') {
      if (!Number.isSafeInteger(other)) {
        throw new TypeError(
          Number.isInteger(other)
            ? `divide() requires safe integers, got ${other}. Use bigint for large values.`
            : `divide() only accepts integers, got ${other}. ` +
              `Use Rational.fromInts() for fractions, e.g., Rational.fromInts(5, 2) for 2.5`
        );
      }
      other = Rational.fromInt(other);
    } else if (typeof other === 'bigint') {
      other = Rational.fromInt(other);
    }

    if (Rational.isInstance(other)) {
      if (other.numerator === 0n) {
        throw new DecimalDivisionByZeroError();
      }
      return this.multiply(other.reciprocal(), { round });
    }

    if (other.mantissa === 0n) {
      throw new DecimalDivisionByZeroError();
    }

    const scaleDiff = other.scale - this.scale;
    let numerator: bigint;
    let denominator: bigint;

    if (scaleDiff > 0) {
      numerator = this.mantissa * pow10(scaleDiff);
      denominator = other.mantissa;
    } else if (scaleDiff < 0) {
      numerator = this.mantissa;
      denominator = other.mantissa * pow10(-scaleDiff);
    } else {
      numerator = this.mantissa;
      denominator = other.mantissa;
    }

    return Rational.fromInts(numerator, denominator);
  }

  negate(): Decimal<P, S> {
    return Decimal.fromMantissa(this.precision, this.scale, -this.mantissa);
  }

  abs(): Decimal<P, S> {
    return this.mantissa < 0n
      ? Decimal.fromMantissa(this.precision, this.scale, -this.mantissa)
      : this;
  }

  rescale<NewS extends number>(newScale: NewS, round?: RoundingMode): Decimal<P, NewS> {
    const scaleDiff = newScale - this.scale;

    if (scaleDiff === 0) {
      return Decimal.fromMantissa(this.precision, newScale, this.mantissa);
    }

    if (scaleDiff > 0) {
      const factor = pow10(scaleDiff);
      const newMantissa = this.mantissa * factor;
      ensureMantissaFitsPrecision(this.precision, newScale, newMantissa);
      return Decimal.fromMantissa(this.precision, newScale, newMantissa);
    }

    const factor = pow10(-scaleDiff);
    const remainder = this.mantissa % factor;
    if (remainder !== 0n && round === undefined) {
      throw new DecimalInexactError('rescale');
    }

    const newMantissa = round !== undefined
      ? roundBigInt(this.mantissa, factor, round)
      : this.mantissa / factor;

    return Decimal.fromMantissa(this.precision, newScale, newMantissa);
  }

  toPrecision<NewP extends number>(newPrecision: NewP): Decimal<NewP, S> {
    ensureMantissaFitsPrecision(newPrecision, this.scale, this.mantissa);
    return Decimal.fromMantissa(newPrecision, this.scale, this.mantissa);
  }

  toRational(): Rational {
    if (this.scale >= 0) {
      return Rational.fromInts(this.mantissa, pow10(this.scale));
    }
    return Rational.fromInts(this.mantissa * pow10(-this.scale), 1n);
  }

  compare(other: Decimal<any, any> | Rational): -1 | 0 | 1 {
    if (Decimal.isInstance(other)) {
      if (this.scale === other.scale) {
        return this.mantissa < other.mantissa ? -1
          : this.mantissa > other.mantissa ? 1 : 0;
      }
      const scaleDiff = other.scale - this.scale;
      let left: bigint;
      let right: bigint;
      if (scaleDiff > 0) {
        left = this.mantissa * pow10(scaleDiff);
        right = other.mantissa;
      } else {
        left = this.mantissa;
        right = other.mantissa * pow10(-scaleDiff);
      }
      return left < right ? -1 : left > right ? 1 : 0;
    }

    if (this.scale >= 0) {
      const left = this.mantissa * other.denominator;
      const right = other.numerator * pow10(this.scale);
      return left < right ? -1 : left > right ? 1 : 0;
    }
    const left = this.mantissa * pow10(-this.scale) * other.denominator;
    const right = other.numerator;
    return left < right ? -1 : left > right ? 1 : 0;
  }

  lessThan(other: Decimal<any, any> | Rational): boolean {
    return this.compare(other) < 0;
  }

  greaterThan(other: Decimal<any, any> | Rational): boolean {
    return this.compare(other) > 0;
  }

  lessThanOrEqual(other: Decimal<any, any> | Rational): boolean {
    return this.compare(other) <= 0;
  }

  greaterThanOrEqual(other: Decimal<any, any> | Rational): boolean {
    return this.compare(other) >= 0;
  }

  valueEquals(other: Decimal<any, any> | Rational): boolean {
    return this.compare(other) === 0;
  }

  override equals(other: unknown): boolean {
    return Decimal.isInstance(other)
      && this.precision === other.precision
      && this.scale === other.scale
      && this.mantissa === other.mantissa;
  }

  allocate(weights: number[], options?: AllocateOptions): Decimal<P, S>[] {
    const strategy = options?.strategy ?? 'roundRobin';

    if (weights.length === 0) {
      throw new RangeError('Cannot allocate to zero recipients');
    }
    if (weights.some((w) => w < 0 || !Number.isSafeInteger(w))) {
      throw new RangeError('Weights must be non-negative safe integers');
    }

    const totalWeight = weights.reduce((acc, w) => acc + BigInt(w), 0n);
    if (totalWeight === 0n) {
      throw new RangeError('Total weight must be positive');
    }

    const isNegative = this.mantissa < 0n;
    const absMantissa = isNegative ? -this.mantissa : this.mantissa;

    const results: bigint[] = [];
    const remainders: bigint[] = [];
    let allocated = 0n;

    for (const weight of weights) {
      const weightBig = BigInt(weight);
      const share = (absMantissa * weightBig) / totalWeight;
      const remainder = (absMantissa * weightBig) % totalWeight;
      results.push(share);
      remainders.push(remainder);
      allocated += share;
    }

    let unitsToDistribute = absMantissa - allocated;

    if (strategy === 'largestRemainder') {
      const indices = weights
        .map((_, i) => i)
        .filter((i) => (weights[i] ?? 0) > 0)
        .sort((a, b) => {
          const diff = (remainders[b] ?? 0n) - (remainders[a] ?? 0n);
          if (diff !== 0n) return diff > 0n ? 1 : -1;
          return a - b;
        });

      let idx = 0;
      while (unitsToDistribute > 0n && idx < indices.length) {
        const index = indices[idx];
        if (index === undefined) break;
        results[index] = (results[index] ?? 0n) + 1n;
        unitsToDistribute -= 1n;
        idx += 1;
      }
    } else {
      let i = 0;
      while (unitsToDistribute > 0n) {
        const weight = weights[i];
        if (weight !== undefined && weight > 0) {
          results[i] = (results[i] ?? 0n) + 1n;
          unitsToDistribute -= 1n;
        }
        i = (i + 1) % results.length;
      }
    }

    const finalResults = isNegative ? results.map((m) => -m) : results;
    return finalResults.map((m) => Decimal.fromMantissa(this.precision, this.scale, m));
  }

  override toString(): string {
    if (this.scale <= 0) {
      return (this.mantissa * pow10(-this.scale)).toString();
    }
    const sign = this.mantissa < 0n ? '-' : '';
    const abs = this.mantissa < 0n ? -this.mantissa : this.mantissa;
    const str = abs.toString().padStart(this.scale + 1, '0');
    const intPart = str.slice(0, -this.scale) || '0';
    const fracPart = str.slice(-this.scale);
    return `${sign}${intPart}.${fracPart}`;
  }

  override toJSON(): string {
    return this.toString();
  }

  override hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    const mantissaHash = hashBigInt(this.mantissa);
    this.#hash = hashCombine(
      hashCombine(mantissaHash, this.precision),
      this.scale
    );
    return this.#hash;
  }
}

export function isDecimalOf(
  value: unknown,
  precision: number,
  scale: number
): value is Decimal<any, any> {
  return Decimal.isInstance(value)
    && value.precision === precision
    && value.scale === scale;
}

export function isRational(value: unknown): value is Rational {
  return Rational.isInstance(value);
}
