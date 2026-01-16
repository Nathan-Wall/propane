import { test } from 'node:test';
import { assert } from './assert.js';
import { Decimal, Rational } from '@/common/numbers/decimal.js';
import { NumericPair, NumericUnion } from './decimal-rational-serialization.pmsg.js';

export default function runDecimalRationalSerializationTests() {
  const decimal = Decimal.fromStrictString(10, 2, '123.45');
  const rational = Rational.fromInts(1, 3);

  // Top-level Decimal: compact form (implicit field numbers)
  const decimalSerialized = decimal.serialize();
  assert(
    decimalSerialized === ':{12345n,10,2}',
    `Decimal compact serialization mismatch: ${decimalSerialized}`
  );
  const decimalRoundTrip = Decimal.deserialize(decimalSerialized);
  assert(
    decimalRoundTrip.toString() === '123.45',
    'Decimal compact deserialize should preserve value.'
  );

  // Top-level Decimal: expanded forms (explicit keys)
  const decimalExpandedNumeric = ':{1:12345n,2:10,3:2}';
  const decimalExpandedNamed = ':{mantissa:12345n,precision:10,scale:2}';
  assert(
    Decimal.deserialize(decimalExpandedNumeric).toString() === '123.45',
    'Decimal numeric-key deserialize should preserve value.'
  );
  assert(
    Decimal.deserialize(decimalExpandedNamed).toString() === '123.45',
    'Decimal named-key deserialize should preserve value.'
  );

  // Top-level Rational: compact string form
  const rationalSerialized = rational.serialize();
  assert(
    rationalSerialized === ':"1/3"',
    `Rational compact serialization mismatch: ${rationalSerialized}`
  );
  const rationalRoundTrip = Rational.deserialize(rationalSerialized);
  assert(
    rationalRoundTrip.toString() === '1/3',
    'Rational compact deserialize should preserve value.'
  );

  // Top-level Rational: expanded forms
  const rationalExpandedNumeric = ':{1:1n,2:3n}';
  const rationalExpandedTagged = ':$Rational{1n,3n}';
  assert(
    Rational.deserialize(rationalExpandedNumeric).toString() === '1/3',
    'Rational numeric-key deserialize should preserve value.'
  );
  assert(
    Rational.deserialize(rationalExpandedTagged).toString() === '1/3',
    'Rational tagged deserialize should preserve value.'
  );

  // Decimal/Rational as fields in a Message (compact)
  const pair = new NumericPair({ amount: decimal, ratio: rational });
  const pairSerialized = pair.serialize();
  assert(
    pairSerialized === ':{"123.45","1/3"}',
    `NumericPair compact serialization mismatch: ${pairSerialized}`
  );
  const pairRoundTrip = NumericPair.deserialize(pairSerialized);
  assert(
    Decimal.isInstance(pairRoundTrip.amount),
    'NumericPair.amount should deserialize to Decimal.'
  );
  assert(
    Rational.isInstance(pairRoundTrip.ratio),
    'NumericPair.ratio should deserialize to Rational.'
  );
  assert(
    pairRoundTrip.amount.toString() === '123.45',
    'NumericPair.amount should preserve value.'
  );
  assert(
    pairRoundTrip.ratio.toString() === '1/3',
    'NumericPair.ratio should preserve value.'
  );

  // Decimal/Rational as fields in a Message (expanded)
  const pairExpandedNumeric = ':{1:"123.45",2:"1/3"}';
  const pairExpandedNamed = ':{amount:"123.45",ratio:"1/3"}';
  const pairExpandedA = NumericPair.deserialize(pairExpandedNumeric);
  const pairExpandedB = NumericPair.deserialize(pairExpandedNamed);
  assert(
    Decimal.isInstance(pairExpandedA.amount) && Rational.isInstance(pairExpandedA.ratio),
    'NumericPair numeric-key deserialize should coerce Decimal/Rational.'
  );
  assert(
    Decimal.isInstance(pairExpandedB.amount) && Rational.isInstance(pairExpandedB.ratio),
    'NumericPair named-key deserialize should coerce Decimal/Rational.'
  );

  // Decimal/Rational in union fields (tagged)
  const unionDecimal = new NumericUnion({ value: decimal });
  const unionDecimalSerialized = unionDecimal.serialize();
  assert(
    unionDecimalSerialized === ':{$Decimal"123.45"}',
    `NumericUnion Decimal serialization mismatch: ${unionDecimalSerialized}`
  );
  const unionDecimalRoundTrip = NumericUnion.deserialize(unionDecimalSerialized);
  assert(
    Decimal.isInstance(unionDecimalRoundTrip.value),
    'NumericUnion Decimal should deserialize as Decimal.'
  );

  const unionRational = new NumericUnion({ value: rational });
  const unionRationalSerialized = unionRational.serialize();
  assert(
    unionRationalSerialized === ':{$Rational"1/3"}',
    `NumericUnion Rational serialization mismatch: ${unionRationalSerialized}`
  );
  const unionRationalRoundTrip = NumericUnion.deserialize(unionRationalSerialized);
  assert(
    Rational.isInstance(unionRationalRoundTrip.value),
    'NumericUnion Rational should deserialize as Rational.'
  );
}

test('runDecimalRationalSerializationTests', () => {
  runDecimalRationalSerializationTests();
});
