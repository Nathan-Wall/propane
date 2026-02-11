import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  Decimal,
  DecimalDivisionByZeroError,
  Rational,
} from '@/common/numbers/decimal.js';

class ForeignRational {
  static readonly $typeId = Rational.$typeId;
  static readonly $typeHash = Rational.$typeHash;
  readonly [Symbol.for('propane:message')] = true;
  readonly [Symbol.for(`propane:message:${Rational.$typeId}`)] = true;

  readonly numerator: bigint;
  readonly denominator: bigint;
  #serialized: string;
  #hash: number;
  #equalsResult: boolean;

  constructor(value: Rational, equalsResult = false) {
    this.numerator = value.numerator;
    this.denominator = value.denominator;
    this.#serialized = value.serialize();
    this.#hash = value.hashCode();
    this.#equalsResult = equalsResult;
  }

  serialize() {
    return this.#serialized;
  }

  hashCode() {
    return this.#hash;
  }

  equals() {
    return this.#equalsResult;
  }
}

function toForeignRational(
  value: Rational,
  equalsResult = false
): Rational {
  return new ForeignRational(value, equalsResult) as unknown as Rational;
}

class ForeignDecimal {
  static readonly $typeId = Decimal.$typeId;
  static readonly $typeHash = Decimal.$typeHash;
  readonly [Symbol.for('propane:message')] = true;
  readonly [Symbol.for(`propane:message:${Decimal.$typeId}`)] = true;
  #rational: Rational;

  constructor(rational: Rational) {
    this.#rational = rational;
  }

  toRational() {
    return toForeignRational(this.#rational);
  }
}

function toForeignDecimal(
  rational: Rational
): Decimal<number, number> {
  return new ForeignDecimal(rational) as unknown as Decimal<number, number>;
}

describe('Rational construction', () => {
  it('normalizes sign and reduces fractions', () => {
    const reduced = new Rational({ numerator: 2n, denominator: 4n });
    assert.strictEqual(reduced.toString(), '1/2');

    const negativeDenominator = new Rational({
      numerator: 2n,
      denominator: -4n,
    });
    assert.strictEqual(negativeDenominator.toString(), '-1/2');

    const doubleNegative = new Rational({ numerator: -2n, denominator: -4n });
    assert.strictEqual(doubleNegative.toString(), '1/2');
  });

  it('defaults to zero with denominator 1', () => {
    const value = new Rational();
    assert.strictEqual(value.numerator, 0n);
    assert.strictEqual(value.denominator, 1n);
    assert.strictEqual(value.toString(), '0');
  });

  it('rejects zero denominators', () => {
    assert.throws(
      () => new Rational({ numerator: 1n, denominator: 0n }),
      DecimalDivisionByZeroError
    );
    assert.throws(
      () => new Rational({ numerator: 0n, denominator: 0n }),
      DecimalDivisionByZeroError
    );
  });

  it('rejects invalid updates and tagged deserialization', () => {
    const value = Rational.fromInts(1, 2);
    assert.throws(() => value.setDenominator(0n), DecimalDivisionByZeroError);
    assert.throws(
      () => Rational.deserialize(':$Rational{0n,0n}'),
      DecimalDivisionByZeroError
    );
  });
});

describe('Rational value equality and canonical outputs', () => {
  it('reduces for equality, hashing, and serialization', () => {
    const oneSixth = Rational.fromInts(1, 6);
    const unreduced = oneSixth.add(oneSixth);
    assert.strictEqual(unreduced.numerator, 1n);
    assert.strictEqual(unreduced.denominator, 3n);

    const reduced = Rational.fromInts(1, 3);

    assert.strictEqual(unreduced.equals(reduced), true);
    assert.strictEqual(unreduced.toString(), '1/3');
    assert.strictEqual(unreduced.toCompact(), '1/3');
    assert.strictEqual(unreduced.toJSON(), '1/3');
    assert.strictEqual(unreduced.serialize(), ':Q1/3');
    assert.strictEqual(unreduced.serialize({ includeTag: true }), ':Q1/3');
    assert.strictEqual(unreduced.hashCode(), reduced.hashCode());
  });

  it('supports cross-copy equality without private field access errors', () => {
    const half = Rational.fromInts(1, 2);
    const foreign = toForeignRational(half);

    assert.doesNotThrow(() => half.equals(foreign));
    assert.strictEqual(half.equals(foreign), true);
  });

  it('supports cross-copy arithmetic without private field access errors', () => {
    const half = Rational.fromInts(1, 2);
    const third = toForeignRational(Rational.fromInts(1, 3));

    assert.doesNotThrow(() => half.add(third));
    assert.strictEqual(half.add(third).toString(), '5/6');
    assert.strictEqual(half.subtract(third).toString(), '1/6');
    assert.strictEqual(half.multiply(third).toString(), '1/6');
    assert.strictEqual(half.divide(third).toString(), '3/2');
  });

  it('supports cross-copy Decimal operands without private field access errors', () => {
    const half = Rational.fromInts(1, 2);
    const thirdAsDecimal = toForeignDecimal(Rational.fromInts(1, 3));

    assert.doesNotThrow(() => half.add(thirdAsDecimal));
    assert.strictEqual(half.add(thirdAsDecimal).toString(), '5/6');
    assert.strictEqual(half.subtract(thirdAsDecimal).toString(), '1/6');
    assert.strictEqual(half.multiply(thirdAsDecimal).toString(), '1/6');
    assert.strictEqual(half.divide(thirdAsDecimal).toString(), '3/2');
  });

  it('supports cross-copy comparisons and relation helpers', () => {
    const half = Rational.fromInts(1, 2);
    const twoThirds = toForeignRational(Rational.fromInts(2, 3));
    const alsoHalf = toForeignRational(Rational.fromInts(1, 2));

    assert.doesNotThrow(() => half.compare(twoThirds));
    assert.strictEqual(half.compare(twoThirds), -1);
    assert.strictEqual(half.compare(alsoHalf), 0);
    assert.strictEqual(half.valueEquals(alsoHalf), true);
    assert.strictEqual(half.lessThan(twoThirds), true);
    assert.strictEqual(half.greaterThan(twoThirds), false);
    assert.strictEqual(half.lessThanOrEqual(alsoHalf), true);
    assert.strictEqual(half.greaterThanOrEqual(alsoHalf), true);
  });

  it('preserves divide-by-zero behavior for cross-copy operands', () => {
    const half = Rational.fromInts(1, 2);
    const zero = toForeignRational(Rational.zero());

    assert.throws(() => half.divide(zero), DecimalDivisionByZeroError);
  });
});
