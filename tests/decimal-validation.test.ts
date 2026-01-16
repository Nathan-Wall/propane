import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Decimal, Rational } from '@/common/numbers/decimal.js';

describe('Decimal parsing modes', () => {
  it('fromString is permissive', () => {
    const value = Decimal.fromString(10, 2, '  +1_000.50  ');
    assert.strictEqual(value.toString(), '1000.50');
  });

  it('fromString rejects NaN/Infinity (case-insensitive)', () => {
    assert.throws(() => Decimal.fromString(10, 2, 'NaN'), SyntaxError);
    assert.throws(() => Decimal.fromString(10, 2, 'nan'), SyntaxError);
    assert.throws(() => Decimal.fromString(10, 2, 'Infinity'), SyntaxError);
    assert.throws(() => Decimal.fromString(10, 2, '+Infinity'), SyntaxError);
    assert.throws(() => Decimal.fromString(10, 2, '-infinity'), SyntaxError);
  });

  it('fromStrictString is strict', () => {
    assert.throws(
      () => Decimal.fromStrictString(10, 2, '  +1_000.50  '),
      SyntaxError
    );
  });
});

describe('Decimal constructor validation', () => {
  it('defaults to 0 with minimum precision', () => {
    const value = new Decimal();
    assert.strictEqual(value.mantissa, 0n);
    assert.strictEqual(value.precision, 1);
    assert.strictEqual(value.scale, 0);
    assert.strictEqual(value.toString(), '0');
  });

  it('rejects invalid precision/scale', () => {
    assert.throws(
      () => new Decimal({ mantissa: 0n, precision: 0, scale: 0 }),
      RangeError
    );
    assert.throws(
      () => new Decimal({ mantissa: 0n, precision: 1, scale: 0.5 }),
      RangeError
    );
  });

  it('rejects mantissa overflow unless validation is skipped', () => {
    assert.throws(
      () => new Decimal({ mantissa: 100n, precision: 2, scale: 0 }),
      RangeError
    );
    const value = new Decimal(
      { mantissa: 100n, precision: 2, scale: 0 },
      { skipValidation: true }
    );
    assert.strictEqual(value.mantissa, 100n);
  });
});

describe('Rational parsing', () => {
  it('accepts fractional strings', () => {
    const value = Rational.fromString('3/4');
    assert.strictEqual(value.toString(), '3/4');
  });

  it('accepts exponent notation', () => {
    const value = Rational.fromString('1e3');
    assert.strictEqual(value.toString(), '1000');
  });
});
