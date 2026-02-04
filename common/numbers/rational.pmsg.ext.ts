/**
 * Rational numeric type with exact arithmetic and explicit rounding.
 */

import { Rational$Base } from './rational.pmsg.base.js';
import type { Rational as RationalTypes } from './rational.pmsg.base.js';
import { Decimal } from './decimal.pmsg.ext.js';
import { memoize } from '../functions/memoize.js';
import {
  DecimalDivisionByZeroError,
  DecimalInexactError,
  HARD_CAP_BITS,
  MAX_BITS,
  MAX_RATIONAL_DIGITS,
  REDUCE_INTERVAL,
  RationalOverflowError,
  RoundingMode,
  bitLength,
  ensureValidPrecisionScale,
  gcdBigInt,
  hashCombine,
  hashBigInt,
  parseDecimalInput,
  pow10,
  roundBigInt,
  toBigIntSafeInteger,
  validateDigitLength,
} from './decimal-shared.js';

export { RationalOverflowError };

export namespace Rational {
  export type Data = RationalTypes.Data;
  export type Value = RationalTypes.Value;
}

type RationalConstructorOptions = {
  skipValidation?: boolean;
  opCount?: number;
};

function normalizeRational(
  numerator: bigint,
  denominator: bigint,
  ops: number
): { numerator: bigint; denominator: bigint; ops: number } {
  let n = numerator;
  let d = denominator;

  if (d === 0n) {
    throw new DecimalDivisionByZeroError();
  }

  if (d < 0n) {
    n = -n;
    d = -d;
  }

  if (n === 0n) {
    d = 1n;
    ops = 0;
  } else if (n % d === 0n) {
    n = n / d;
    d = 1n;
    ops = 0;
  }

  const nBits = bitLength(n);
  const dBits = bitLength(d);
  const isLarge = nBits > MAX_BITS || dBits > MAX_BITS;
  const isPeriodic = ops >= REDUCE_INTERVAL;
  const shouldReduce = ops === 0 || isLarge || isPeriodic;

  if (shouldReduce) {
    const g = gcdBigInt(n, d);
    n = n / g;
    d = d / g;
    ops = 0;

    const finalNBits = bitLength(n);
    const finalDBits = bitLength(d);
    if (finalNBits > HARD_CAP_BITS || finalDBits > HARD_CAP_BITS) {
      throw new RationalOverflowError(finalNBits, finalDBits);
    }
  }

  return { numerator: n, denominator: d, ops };
}

export class Rational extends Rational$Base {
  #opCount = 0;
  #hash?: number;
  #reduce = memoize(function (this: Rational): Rational {
    if (this.#opCount === 0) {
      return this;
    }
    const numerator = this.#n;
    const denominator = this.#d;
    const normalized = normalizeRational(numerator, denominator, 0);
    if (
      normalized.numerator === numerator
      && normalized.denominator === denominator
    ) {
      return this;
    }
    return new Rational(
      { numerator: normalized.numerator, denominator: normalized.denominator },
      { opCount: normalized.ops }
    );
  }, { cacheSize: 1 });

  // Internal fast accessors; avoid `this.numerator` / `this.denominator` to
  // prevent triggering reduction in hot paths.
  get #n() {
    return super.numerator;
  }
  get #d() {
    return super.denominator;
  }

  override get numerator() {
    return this.#reduce().#n;
  }
  override get denominator() {
    return this.#reduce().#d;
  }

  private static toRationalValue(other: Rational | Decimal<any, any>): Rational {
    return Decimal.isInstance(other) ? other.toRational() : other;
  }

  private static withOps(numerator: bigint, denominator: bigint, ops: number): Rational {
    return new Rational({ numerator, denominator }, { opCount: ops });
  }

  constructor(
    props?: RationalTypes.Value,
    options?: RationalConstructorOptions
  ) {
    const opCount = options?.opCount ?? 0;

    let numerator: bigint;
    let denominator: bigint;

    if (Rational$Base.isInstance(props)) {
      numerator = props.numerator;
      denominator = props.denominator;
    } else if (props) {
      numerator = (props as RationalTypes.Data).numerator;
      denominator = (props as RationalTypes.Data).denominator;
    } else {
      numerator = 0n;
      denominator = 1n;
    }

    const normalized = normalizeRational(numerator, denominator, opCount);

    super(
      { numerator: normalized.numerator, denominator: normalized.denominator },
      { skipValidation: options?.skipValidation }
    );

    this.#opCount = normalized.ops;
  }

  override toCompact(): string {
    return this.#reduce().#toString();
  }

  static fromInt(value: number | bigint): Rational {
    const intValue = toBigIntSafeInteger(value);
    return new Rational({ numerator: intValue, denominator: 1n });
  }

  static fromInts(numerator: number | bigint, denominator: number | bigint): Rational {
    const n = toBigIntSafeInteger(numerator, { label: 'Numerator' });
    const d = toBigIntSafeInteger(denominator, { label: 'Denominator' });
    return new Rational({ numerator: n, denominator: d });
  }

  override $fromEntries(
    entries: Record<string, unknown>,
    options?: { skipValidation: boolean }
  ): { numerator: bigint; denominator: bigint } {
    const props = super.$fromEntries(entries, options) as {
      numerator: bigint;
      denominator: bigint;
    };
    if (options?.skipValidation) {
      return props;
    }
    const normalized = normalizeRational(props.numerator, props.denominator, 0);
    return {
      numerator: normalized.numerator,
      denominator: normalized.denominator,
    };
  }

  static fromString(value: string): Rational {
    const input = value.trim();
    if (input.length === 0) {
      throw new SyntaxError('Invalid rational format: empty string');
    }

    validateDigitLength(input, MAX_RATIONAL_DIGITS, 'Rational.fromString');

    const slashIndex = input.indexOf('/');
    if (slashIndex !== -1) {
      const left = input.slice(0, slashIndex).trim();
      const right = input.slice(slashIndex + 1).trim();
      if (!/^[+-]?\d+$/.test(left) || !/^[+-]?\d+$/.test(right)) {
        throw new SyntaxError('Invalid fraction format');
      }
      const n = BigInt(left);
      const d = BigInt(right);
      if (d === 0n) {
        throw new RangeError('Denominator cannot be zero');
      }
      return new Rational({ numerator: n, denominator: d });
    }

    const parsed = parseDecimalInput(
      input,
      {
        allowExponent: true,
        allowGrouping: true,
        allowWhitespace: true,
        allowPositiveSign: true,
        allowLeadingZeros: true,
      },
      'Rational.fromString'
    );

    const digits = BigInt(parsed.digits) * parsed.sign;
    if (parsed.scale >= 0) {
      return new Rational({ numerator: digits, denominator: pow10(parsed.scale) });
    }
    return new Rational({ numerator: digits * pow10(-parsed.scale), denominator: 1n });
  }

  static override fromCompact(
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: { skipValidation?: boolean }
  ): Rational {
    return Rational.fromString(value);
  }

  static zero(): Rational {
    return new Rational({ numerator: 0n, denominator: 1n });
  }

  static one(): Rational {
    return new Rational({ numerator: 1n, denominator: 1n });
  }


  add(other: Rational | Decimal<any, any>): Rational {
    const rhs = Rational.toRationalValue(other);
    const n = this.#n * rhs.#d
      + rhs.#n * this.#d;
    const d = this.#d * rhs.#d;
    return Rational.withOps(
      n,
      d,
      Math.max(this.#opCount, rhs.#opCount) + 1
    );
  }

  subtract(other: Rational | Decimal<any, any>): Rational {
    const rhs = Rational.toRationalValue(other);
    const n = this.#n * rhs.#d
      - rhs.#n * this.#d;
    const d = this.#d * rhs.#d;
    return Rational.withOps(
      n,
      d,
      Math.max(this.#opCount, rhs.#opCount) + 1
    );
  }

  multiply(other: Rational | Decimal<any, any>): Rational {
    const rhs = Rational.toRationalValue(other);
    const n = this.#n * rhs.#n;
    const d = this.#d * rhs.#d;
    return Rational.withOps(
      n,
      d,
      Math.max(this.#opCount, rhs.#opCount) + 1
    );
  }

  divide(other: Rational | Decimal<any, any>): Rational {
    const rhs = Rational.toRationalValue(other);
    if (rhs.#n === 0n) {
      throw new DecimalDivisionByZeroError();
    }
    const n = this.#n * rhs.#d;
    const d = this.#d * rhs.#n;
    return Rational.withOps(
      n,
      d,
      Math.max(this.#opCount, rhs.#opCount) + 1
    );
  }

  reciprocal(): Rational {
    if (this.#n === 0n) {
      throw new DecimalDivisionByZeroError();
    }
    return Rational.withOps(
      this.#d,
      this.#n,
      this.#opCount + 1
    );
  }

  negate(): Rational {
    return Rational.withOps(
      -this.#n,
      this.#d,
      this.#opCount + 1
    );
  }

  abs(): Rational {
    return this.#n < 0n
      ? Rational.withOps(
        -this.#n,
        this.#d,
        this.#opCount + 1
      )
      : this;
  }

  compare(other: Rational | Decimal<any, any>): -1 | 0 | 1 {
    const rhs = Rational.toRationalValue(other);
    const left = this.#n * rhs.#d;
    const right = rhs.#n * this.#d;
    return left < right ? -1 : left > right ? 1 : 0;
  }

  valueEquals(other: Rational | Decimal<any, any>): boolean {
    return this.compare(other) === 0;
  }

  lessThan(other: Rational | Decimal<any, any>): boolean {
    return this.compare(other) < 0;
  }

  greaterThan(other: Rational | Decimal<any, any>): boolean {
    return this.compare(other) > 0;
  }

  lessThanOrEqual(other: Rational | Decimal<any, any>): boolean {
    return this.compare(other) <= 0;
  }

  greaterThanOrEqual(other: Rational | Decimal<any, any>): boolean {
    return this.compare(other) >= 0;
  }

  toDecimal<P extends number, S extends number>(
    precision: P,
    scale: S,
    mode?: RoundingMode
  ): Decimal<P, S> {
    ensureValidPrecisionScale(precision, scale);

    let numerator = this.#n;
    let denominator = this.#d;

    if (scale >= 0) {
      numerator = numerator * pow10(scale);
    } else {
      denominator = denominator * pow10(-scale);
    }

    const remainder = numerator % denominator;
    let mantissa: bigint;
    if (remainder !== 0n) {
      if (mode === undefined) {
        throw new DecimalInexactError('toDecimal');
      }
      mantissa = roundBigInt(numerator, denominator, mode);
    } else {
      mantissa = numerator / denominator;
    }

    return Decimal.fromMantissa(precision, scale, mantissa);
  }

  override equals(other: unknown): boolean {
    return this.#reduce().#equals(other);
  }

  override toString() {
    return this.#reduce().#toString();
  }
  #toString(): string {
    if (this.#d === 1n) {
      return this.#n.toString();
    }
    return `${this.#n.toString()}/${this.#d.toString()}`;
  }

  override toJSON(): string {
    return this.#reduce().#toString();
  }

  override serialize(options?: { includeTag?: boolean }): string {
    return this.#reduce().#serializeSuper(options);
  }

  #serializeSuper(options?: { includeTag?: boolean }): string {
    return super.serialize(options);
  }

  #equals(other: unknown): boolean {
    if (!Rational.isInstance(other)) {
      return false;
    }
    const rhs = other.#reduce();
    return this.#n === rhs.#n
      && this.#d === rhs.#d;
  }

  override hashCode(): number {
    return this.#reduce().#hashCode();
  }

  #hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    this.#hash = hashCombine(
      hashBigInt(this.#n),
      hashBigInt(this.#d)
    );
    return this.#hash;
  }
}
