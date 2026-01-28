import { assert } from './assert.js';
import { computeExpectedHashCode } from './hash-helpers.js';
import { ImmutableArrayBuffer } from '@propane/runtime';
import { test } from 'node:test';

export default function runImmutableArrayBufferTests() {
  const bytes = [1, 2, 3, 4];
  const imm = new ImmutableArrayBuffer(bytes);

  // Immutability: mutating clones doesn't affect source
  const clone = imm.toUint8Array();
  clone[0] = 9;
  assert(new Uint8Array(imm.toArrayBuffer())[0] === 1, 'Cloned views should not mutate source buffer.');

  // Equality to ArrayBuffer and another immutable wrapper
  const buf = new Uint8Array(bytes).buffer;
  assert(imm.equals(buf), 'ImmutableArrayBuffer should equal equivalent ArrayBuffer.');
  assert(imm.equals(new ImmutableArrayBuffer(buf)), 'ImmutableArrayBuffer should equal same contents.');
  assert(!imm.equals(new ImmutableArrayBuffer([1, 2, 3, 5])), 'Different contents should not be equal.');

  // hashCode stability (hashes base64 string)
  const expectedHash = computeExpectedHashCode(imm.toString());
  assert(imm.hashCode() === expectedHash, 'hashCode should match hashed base64 representation.');

  // JSON normalization
  const json = JSON.stringify({ data: imm });
  assert(json === `{"data":"${imm.toString()}"}`, 'toJSON should emit base64 string with prefix.');
}

test('runImmutableArrayBufferTests', () => {
  runImmutableArrayBufferTests();
});
