import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  DecimalDivisionByZeroError,
  Rational,
} from '@/common/numbers/decimal.js';

describe('Rational construction', () => {
  it('normalizes sign and reduces fractions', () => {
    const reduced = new Rational({ numerator: 2n, denominator: 4n });
    assert.strictEqual(reduced.toString(), '1/2');

    const negativeDenominator = new Rational({ numerator: 2n, denominator: -4n });
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
});
