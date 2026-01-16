import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  Decimal,
  Rational,
  RoundingMode,
  DecimalInexactError,
} from '@/common/numbers/decimal.js';

describe('Decimal.fromStrictString', () => {
  it('parses canonical decimal strings', () => {
    const value = Decimal.fromStrictString(10, 2, '123.45');
    assert.strictEqual(value.toString(), '123.45');
  });

  it('rejects whitespace, grouping, exponent notation, plus sign, and leading zeros', () => {
    assert.throws(
      () => Decimal.fromStrictString(10, 2, ' 123.45 '),
      SyntaxError
    );
    assert.throws(
      () => Decimal.fromStrictString(10, 2, '1_000.00'),
      SyntaxError
    );
    assert.throws(
      () => Decimal.fromStrictString(10, 2, '1.23e2'),
      SyntaxError
    );
    assert.throws(
      () => Decimal.fromStrictString(10, 2, '+123.45'),
      SyntaxError
    );
    assert.throws(
      () => Decimal.fromStrictString(10, 2, '001.23'),
      SyntaxError
    );
    assert.throws(
      () => Decimal.fromStrictString(10, 2, '00.5'),
      SyntaxError
    );
    assert.throws(
      () => Decimal.fromStrictString(10, 2, '007'),
      SyntaxError
    );
  });
});

describe('Decimal.fromString', () => {
  it('accepts grouping and exponent notation', () => {
    const grouped = Decimal.fromString(10, 2, '1_000.00');
    assert.strictEqual(grouped.toString(), '1000.00');

    const exponent = Decimal.fromString(10, 2, '1.23e2');
    assert.strictEqual(exponent.toString(), '123.00');
  });

  it('normalizes leading zeros in the integer part', () => {
    const normalized = Decimal.fromString(10, 2, '00123.45');
    assert.strictEqual(normalized.toString(), '123.45');

    const normalizedInt = Decimal.fromString(10, 2, '007');
    assert.strictEqual(normalizedInt.toString(), '7.00');

    const normalizedZero = Decimal.fromString(10, 2, '00.5');
    assert.strictEqual(normalizedZero.toString(), '0.50');
  });
});

describe('Decimal.fromInt', () => {
  it('accepts integer inputs', () => {
    const value = Decimal.fromInt(10, 2, 5);
    assert.strictEqual(value.toString(), '5.00');
  });

  it('rejects non-integer inputs', () => {
    assert.throws(() => Decimal.fromInt(10, 2, 1.5), TypeError);
  });
});

describe('Decimal.one', () => {
  it('throws for negative scale', () => {
    assert.throws(() => Decimal.one(10, -2), RangeError);
  });
});

describe('Decimal arithmetic', () => {
  it('requires rounding for inexact multiply', () => {
    const amount = Decimal.fromStrictString(10, 2, '2.00');
    const rate = Rational.fromInts(1, 3);
    assert.throws(() => amount.multiply(rate), DecimalInexactError);

    const rounded = amount.multiply(rate, { round: RoundingMode.HALF_EXPAND });
    assert.strictEqual(rounded.toString(), '0.67');
  });

  it('divide by Decimal returns exact Rational', () => {
    const total = Decimal.fromStrictString(10, 2, '100.00');
    const part = Decimal.fromStrictString(10, 2, '25.00');
    const ratio = total.divide(part);
    assert.strictEqual(ratio.toString(), '4');
  });

  it('divide by Rational requires rounding when inexact', () => {
    const value = Decimal.fromStrictString(10, 2, '1.00');
    const divisor = Rational.fromInts(3, 2);
    assert.throws(() => value.divide(divisor), DecimalInexactError);

    const rounded = value.divide(divisor, { round: RoundingMode.HALF_EXPAND });
    assert.strictEqual(rounded.toString(), '0.67');
  });
});

describe('Decimal rescale', () => {
  it('throws on inexact rescale without rounding', () => {
    const value = Decimal.fromStrictString(10, 4, '1.2345');
    assert.throws(() => value.rescale(2), DecimalInexactError);
  });

  it('rounds when requested', () => {
    const value = Decimal.fromStrictString(10, 4, '1.2345');
    const rounded = value.rescale(2, RoundingMode.HALF_EXPAND);
    assert.strictEqual(rounded.toString(), '1.23');
  });

  it('scales up exactly', () => {
    const value = Decimal.fromStrictString(10, 4, '1.2345');
    const scaled = value.rescale(6);
    assert.strictEqual(scaled.toString(), '1.234500');
  });
});
