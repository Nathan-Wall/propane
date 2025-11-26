import { assert } from './assert.ts';
import { computeExpectedHashCode } from './hash-helpers.ts';
import { ImmutableDate } from '../runtime/common/time/date.ts';

export default function runImmutableDateTests() {
  const iso = '2020-01-02T03:04:05.000Z';
  const imm = new ImmutableDate(iso);

  // toString / toJSON
  assert(imm.toString() === iso, 'ImmutableDate should stringify to ISO.');
  assert(JSON.stringify({ d: imm }) === `{"d":"${iso}"}`, 'JSON.stringify should use ISO string.');

  // equality against Date, string, and ImmutableDate
  assert(imm.equals(new Date(iso)), 'Should equal native Date with same time.');
  assert(imm.equals(iso), 'Should equal same ISO string.');
  assert(imm.equals(new ImmutableDate(iso)), 'Should equal another ImmutableDate with same time.');
  assert(!imm.equals('2021-01-01T00:00:00.000Z'), 'Should not equal different instant.');

  // hashCode stable with ISO content
  const expectedHash = computeExpectedHashCode(iso);
  assert(imm.hashCode() === expectedHash, 'hashCode should hash ISO string.');
  assert(imm.hashCode() === imm.hashCode(), 'hashCode should memoize.');

  // immutability of toDate clone
  const d = imm.toDate();
  d.setUTCFullYear(1999);
  assert(imm.toString() === iso, 'Mutating derived Date should not affect ImmutableDate.');

  // value semantics
  assert(imm.getTime() === new Date(iso).getTime(), 'getTime should match underlying epoch.');
}
